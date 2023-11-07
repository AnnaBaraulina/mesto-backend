import { Request } from 'express';

export interface CustomRequest extends Request {
  user?: {
    _id: any;
  };
}

export type Error = {
  statusCode: number;
  message: string;
};
