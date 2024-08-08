import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  username: string;
}

export interface CustomRequest extends Request {
  user?: UserPayload;
}

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  private readonly logger = new Logger(JwtMiddleware.name);
  use(req: CustomRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    console.log('authHeader Present', authHeader);

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.decode(token) as {
          sub: string;
          [key: string]: any;
        };
        if (decoded && decoded.sub) {
          req.user = { id: decoded.sub, username: decoded.username };
        }
      } catch (error) {
        this.logger.log('error in decoding token', error);
      }
    }

    next();
  }
}
