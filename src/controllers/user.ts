import mongoose from 'mongoose';
import type { CustomRequest } from 'types/types';
import { Request, Response, NextFunction } from 'express';
import { constants } from 'http2';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DEFAULT_KEY } from '../config';
import { NotFoundError, AuthenticationError } from '../errors/errors';
import { IUserPayload } from '../middlewares/auth';
import { validationResult } from 'express-validator';
import { ValidationError } from '../errors/errors';


const {
  HTTP_STATUS_CREATED
} = constants;

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(new NotFoundError('Пользователь по указанному _id не найден.'));
    }
    const { name, about, avatar, _id } = user;
    res.send({ name, about, avatar, _id });
  } catch (error) {
    next(error);
  }
};


const createUser = (req: Request, res: Response, next: NextFunction) => {
  const { password, email, name, about, avatar } = req.body;

  bcrypt.hash(password, 10)
    .then(hashedPassword => {
      return User.create({
        email,
        password: hashedPassword,
        name,
        about,
        avatar
      });
    })
    .then(user => {
      res.status(HTTP_STATUS_CREATED).send({
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      });
    })
    .catch(err => {

      next(err);
    });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then(user => {
      if (!user) {
        throw new AuthenticationError('Неправильные почта или пароль');
      }

      bcrypt.compare(password, user.password)
        .then(matched => {
          if (!matched) {
            throw new AuthenticationError('Неправильные почта или пароль');
          }

          const token = jwt.sign({ _id: user._id }, DEFAULT_KEY, { expiresIn: '7d' });
          res.send({ token, name: user.name, email: user.email });
        })
        .catch(next);
    })
    .catch(next);
};

const getCurrentUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
   const userPayload = req.user as IUserPayload;

    const user = await User.findById(userPayload._id);
    if (!user) {
      return next(new NotFoundError('Пользователь не найден.'));
    }

    const { name, email, about, avatar, _id } = user;
    res.send({ _id, name, email, about, avatar });
  } catch (error) {
    next(error);
  }
};


const updateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError(errors.array()));
  }
  try {
    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true, runValidators: true });
    if (!user) {
      return next(new NotFoundError('Пользователь с указанным _id не найден.'));
    }
    res.send(user);
  } catch (error) {
    next(error);
  }
};
const updateAvatar = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError(errors.array()));
  }
  try {
    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(userId, { avatar: req.body.avatar }, { new: true, runValidators: true });
    if (!user) {
      return next(new NotFoundError('Пользователь с указанным _id не найден.'));
    }
    res.send(user);
  } catch (error) {
    next(error);
  }
};

export {
  getUsers, getUserById, createUser, updateUser, updateAvatar, getCurrentUser,
};
