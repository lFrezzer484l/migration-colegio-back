import 'express-session';

declare module 'express-session' {
    interface SessionData {
        userId: string;
        loginAt: number;
    }
}