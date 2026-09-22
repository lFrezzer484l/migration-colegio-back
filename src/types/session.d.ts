import { User } from '../user/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};