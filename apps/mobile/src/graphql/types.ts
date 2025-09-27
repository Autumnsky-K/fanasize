export interface User {
  id: string;
  email: string | null;
  createdAt: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: User;
}