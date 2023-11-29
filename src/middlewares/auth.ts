import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, verify } from 'jsonwebtoken';
import { DEFAULT_KEY } from '../config';

class UnauthorizedError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 401;
  }
}

export interface IUserPayload extends JwtPayload {
  _id: string;
}

interface IAuthReq extends Request {
  user?: IUserPayload;
}

export default (req: IAuthReq, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  console.log('Authorization header:', authorization);

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходимо авторизоваться'));
  }

  const token = authorization?.replace('Bearer ', '');
  let payload;

  try {
    if (token) {
      payload = verify(token, DEFAULT_KEY) as IUserPayload;
      req.user = payload;
      }
  } catch (err) {
    next(new UnauthorizedError('Некорректный токен'));
    return;
  }

  next();
};