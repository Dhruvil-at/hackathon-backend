import { UserRole } from '../interfaces/userRoles';

export interface UserProps {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  teamId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class User {
  private props: UserProps;

  private constructor() {}

  static create(props: UserProps): User {
    // Domain validation
    if (!props.email || !/\S+@\S+\.\S+/.test(props.email)) {
      throw new Error('Invalid email format');
    }

    if (!props.firstName || props.firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters');
    }

    const user = new User();
    user.props = props;
    return user;
  }

  // Getters
  getId(): number {
    return this.props.id;
  }

  getFirstName(): string {
    return this.props.firstName;
  }

  getLastName(): string {
    return this.props.lastName;
  }

  getEmail(): string {
    return this.props.email;
  }

  getPassword(): string {
    return this.props.password;
  }

  getRole(): UserRole {
    return this.props.role;
  }

  getTeamId(): number | null {
    return this.props.teamId;
  }

  getCreatedAt(): Date | undefined {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  getDeletedAt(): Date | null | undefined {
    return this.props.deletedAt;
  }

  getFullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  // Domain behavior
  async comparePassword(plainPassword: string): Promise<boolean> {
    return plainPassword == this.props.password;
  }
}
