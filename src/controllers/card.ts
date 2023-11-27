import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { constants } from 'http2';
import type { CustomRequest } from '../types/types';
import Card from '../models/card';
import { validationResult } from 'express-validator';
import { ValidationError } from '../errors/errors';

const {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_FORBIDDEN,
} = constants;

const getCards = async (req: Request, res: Response) => {
  /* eslint consistent-return: "off" */
  try {
    const cards = await Card.find({});
    res.send(cards);
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
  }
};

const createCard = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError(errors.array()));
  }

  const { name, link } = req.body;
  const owner = req.user?._id;

  if (!owner) {
    return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Ошибка авторизации: отсутствует идентификатор пользователя.' });
  }

  try {
    const card = await Card.create({ name, link, owner });
    res.status(HTTP_STATUS_CREATED).send({ data: card });
  } catch (err) {
    console.log('Ошибка при создании карточки:', err);
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Некорректные данные при создании карточки' });
    } else {
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Ошибка на сервере' });
    }
  }
};

const deleteCard = async (req: CustomRequest, res: Response) => {
  console.log('Delete Card Request:', req.params);
  try {
    const card = await Card.findById(req.params.cardId).orFail(() => new Error('Карточка с указанным _id не найдена'));


    if (card.owner.toString() !== req.user?._id.toString()) {
      return res.status(HTTP_STATUS_FORBIDDEN).send({ message: 'У вас нет прав для удаления этой карточки' });
    }

    await card.deleteOne();
    res.send({ message: 'Карточка удалена' });
  } catch (error) {
    console.log('Error in deleteCard:', error);
    if (error instanceof mongoose.Error.CastError) {
      return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Некорректный ID карточки.' });
    }
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка при удалении карточки' });
  }
};
const likeCard = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError(errors.array()));
  }
  /* eslint consistent-return: "off" */
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user?._id } },
      { new: true },
    );
    if (!card) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки.' });
    }
    res.send(card);
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка.' });
    } else {
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
    }
  }
};

const dislikeCard = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError(errors.array()));
  }
  /* eslint consistent-return: "off" */
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user?._id } },
      { new: true },
    );
    if (!card) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки.' });
    }
    res.send(card);
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные для снятия лайка.' });
    } else {
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
    }
  }
};

export {
  getCards, deleteCard, likeCard, dislikeCard, createCard,
};
