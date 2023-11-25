import mongoose from 'mongoose';
import type { CustomRequest } from 'types/types';
import { Request, Response, NextFunction } from 'express';
import { constants } from 'http2';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DEFAULT_KEY } from '../config';


const {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_CONFLICT
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

      const notFoundError = new Error('Пользователь по указанному _id не найден.');
      (notFoundError as any).status = HTTP_STATUS_NOT_FOUND;
      return next(notFoundError);
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
        return res.status(401).send({ message: 'Неправильные почта или пароль' });
      }

      bcrypt.compare(password, user.password)
        .then(matched => {
          if (!matched) {
            return res.status(401).send({ message: 'Неправильные почта или пароль' });
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
    if (!req.user || !req.user._id) {
      return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Не удалось идентифицировать пользователя.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь не найден.' });
    }

    const { name, email, about, avatar, _id } = user;
    res.send({ _id, name, email, about, avatar });
  } catch (error) {
    next(error);
  }
};


const updateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true, runValidators: true });
    if (!user) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
    }
    res.send(user);
  } catch (error) {
    next(error);
  }
};
const updateAvatar = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(userId, { avatar: req.body.avatar }, { new: true, runValidators: true });
    if (!user) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь не найден' });
    }
    res.send(user);
  } catch (error) {
    next(error);
  }
};

export {
  getUsers, getUserById, createUser, updateUser, updateAvatar, getCurrentUser,
};
