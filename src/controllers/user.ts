import User from '../models/user';
import { Error } from 'mongoose';
import { CustomRequest } from 'types/types';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send({ message: error.message });
    } else {

      res.status(500).send({ message: 'Произошла неизвестная ошибка' });
    }
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send({ message: 'Пользователь не найден' });
    }
    const { name, about, avatar, _id } = user;
    res.send({ name, about, avatar, _id });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).send({ message: 'Некорректный ID пользователя.' });
    } else if (error instanceof Error) {
      res.status(500).send({ message: error.message });
    } else {
      res.status(500).send({ message: 'Произошла неизвестная ошибка' });
    }
  }
};

const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send({ message: 'Переданы некорректные данные.' });
    } else if (error instanceof Error) {
      res.status(500).send({ message: error.message });
    } else {
      res.status(500).send({ message: 'Произошла неизвестная ошибка' });
    }
  }
};


const updateUser = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
    if (!user) {
      return res.status(404).send({ message: 'Пользователь не найден' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: 'Произошла ошибка при обновлении профиля' });
  }
};

const updateAvatar = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(userId, { avatar: req.body.avatar }, { new: true });
    if (!user) {
      return res.status(404).send({ message: 'Пользователь не найден' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: 'Произошла ошибка при обновлении аватара' });
  }
};



export { getUsers, getUserById, createUser,  updateUser, updateAvatar };