export interface SignupResponseDto {
  email: string;
  password: string;
  userExists?: boolean;
}
