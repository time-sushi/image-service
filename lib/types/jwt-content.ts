import { JwtPayload } from 'jsonwebtoken';

export interface JwtContent extends JwtPayload {
  accountId: string;
  userId: string;
  permissions: string[];
}
