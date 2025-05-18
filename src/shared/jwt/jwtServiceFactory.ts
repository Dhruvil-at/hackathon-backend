import { JwtService } from './jwtService';

export class JwtServiceFactory {
  private static instance: JwtService;

  static create(): JwtService {
    if (!this.instance) {
      this.instance = new JwtService();
    }
    return this.instance;
  }
}
