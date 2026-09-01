import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  const PgSession = connectPgSimple(session);

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

   app.use(
    session({
      store: new PgSession({
        pool,
        createTableIfMissing: true,
      }),

      secret: process.env.SESSION_SECRET!,

      resave: false,
      saveUninitialized: false,

      rolling: true,

      cookie: {
        maxAge: 1000 * 60 * 30,
        httpOnly: true,
      },
    }),
  );

  const MAX_SESSION_TIME = 1000 * 60 * 60 * 8;

  app.use((req, res, next) => {
      //validamos sesion autenticada
      if (!req.session.userId || !req.session.loginAt ){
        return next();
      }
      
      const sessionAge = Date.now() - req.session.loginAt;

      //limit 8 horas
      if (sessionAge > MAX_SESSION_TIME) {
        req.session.destroy((error) => {
          
          if (error) {
            return next(error);
          }

      return res.status(401).json({
        message: "la sesion ha expirado",
      });
    });

    return;

    }
    
    next();
  }
);
    

    


  app.enableCors({
    origin:  process.env.FRONTEND_URL,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
