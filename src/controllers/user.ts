import mongoose from 'mongoose';
import type { CustomRequest } from 'types/types';
import { Request, Response } from 'express';
import { constants } from 'http2';
import User from '../models/user';

const {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} = constants;

const getUsers = async (req: Request, res: Response) => {
  /* eslint consistent-return: "off" */
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
    return null;
  }
};

const getUserById = async (req: Request, res: Response) => {
  /* eslint consistent-return: "off" */
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({
        message: 'Пользователь по указанному _id не найден.',
      });
    }
    const {
      name, about, avatar, _id,
    } = user;
    res.send({
      name, about, avatar, _id,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Некорректный ID пользователя.' });
    }
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла неизвестная ошибка' });
  }
};

const createUser = async (req: Request, res: Response) => {
  /* eslint consistent-return: "off" */
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(HTTP_STATUS_CREATED).send(newUser);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
    }
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла неизвестная ошибка' });
  }
};

const updateUser = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true, runValidators: true });
    if (!user) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
    }
    res.send(user);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
    }
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
  }
};

const updateAvatar = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(userId, { avatar: req.body.avatar }, {
      new: true, runValidators: true,
    });
    if (!user) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь не найден' });
    }
    res.send(user);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
    }
  }
};

export {
  getUsers, getUserById, createUser, updateUser, updateAvatar,
};
