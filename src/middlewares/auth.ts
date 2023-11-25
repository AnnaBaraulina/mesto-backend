import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { DEFAULT_KEY } from '../config';

class UnauthorizedError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 401;
  }
}

interface IAuthReq extends Request {
  user?: string | JwtPayload;
}

export default (req: IAuthReq, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  console.log('Authorization header:', authorization);

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('Необходимо авторизоваться'));
  }

  const token = authorization?.replace('Bearer ', '');
  let payload;

  try {
    if (token) {
      payload = jwt.verify(token, DEFAULT_KEY);
    }
  } catch (err) {
    next(new UnauthorizedError('Некорректный токен'));
    return;
  }

  req.user = payload as { _id: JwtPayload };

  next();
};