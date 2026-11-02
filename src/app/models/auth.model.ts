export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  username?: string;
  [key: string]: any;
}

export interface LogoutResponse {
  message?: string;
  [key: string]: any;
}
