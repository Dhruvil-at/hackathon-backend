import { User, UserProps } from '../../../domain/entities/user';
import { UserRepository } from '../../../repositories/userRepository';
import { SignupRequestDto } from './signupRequestDto';
import { SignupResponseDto } from './signupResponseDto';
import { UserRole } from '../../../domain/interfaces/userRoles';

export class SignupUseCaseImpl {
  constructor(private userRepository: UserRepository) {}

  async execute(request: SignupRequestDto): Promise<SignupResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      // User already exists, return success with userExists flag
      return {
        email: request.email,
        password: request.password,
        userExists: true,
      };
    }

    // Create new user
    try {
      const userProps: UserProps = {
        id: 0, // This will be set by the database (auto-increment)
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        password: request.password, // In a real app, you'd hash the password here
        role: UserRole.TEAM_MEMBER, // As per requirement, signup is only for team members
        teamId: request.teamId,
      };

      // Create user entity
      const user = User.create(userProps);

      // Save user to database
      await this.userRepository.save(user);

      // Return successful response
      return {
        email: request.email,
        password: request.password,
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }
}
