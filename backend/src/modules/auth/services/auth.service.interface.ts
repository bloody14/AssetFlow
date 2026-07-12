import { TokenPair } from '../../../types/auth';

export interface LoginDTO {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface IAuthService {
  login(dto: LoginDTO): Promise<TokenPair>;
  refreshToken(refreshToken: string, ipAddress: string): Promise<TokenPair>;
  logout(sessionId: string, reason?: string): Promise<void>;
  logoutAll(userId: string, reason?: string): Promise<void>;
}
