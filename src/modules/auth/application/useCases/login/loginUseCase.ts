import { UserRepository } from '../../../repositories/userRepository';
import { LoginRequestDto } from './loginRequestDto';
import { LoginResponseDto } from './loginResponseDto';

export class LoginUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(dto: LoginRequestDto): Promise<LoginResponseDto> {
    // Validate input
    if (!dto.email || !dto.password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const passwordValid = await user.comparePassword(dto.password);
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    // Return user data in response DTO
    return {
      id: user.getId(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      fullName: user.getFullName(),
      email: user.getEmail(),
      role: user.getRole(),
      teamId: user.getTeamId(),
    };
  }
}
