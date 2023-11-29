import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { constants } from 'http2';
import type { CustomRequest } from '../types/types';
import Card from '../models/card';
import { validationResult } from 'express-validator';
import { ValidationError } from '../errors/errors';
import { AuthenticationError, NotFoundError, ForbiddenError } from '../errors/errors';

const {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_FORBIDDEN,
} = constants;

const getCards = async (req: Request, res: Response, next: NextFunction) => {
  /* eslint consistent-return: "off" */
  try {
    const cards = await Card.find({});
    res.send(cards);
  } catch (error) {
    next(error);
  }
};

const createCard = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { name, link } = req.body;
  const owner = req.user?._id;

  try {
    const card = await Card.create({ name, link, owner });
    res.status(HTTP_STATUS_CREATED).send({ data: card });
  } catch (err) {
    console.log('Ошибка при создании карточки:', err);
    if (err instanceof mongoose.Error.ValidationError) {
      next(new ValidationError([err]));
    } else {
      next(err)
    }
  }
};

const deleteCard = async (req: CustomRequest, res: Response, next: NextFunction) => {
  console.log('Delete Card Request:', req.params);
  try {
    const card = await Card.findById(req.params.cardId).orFail(() => new NotFoundError('Карточка с указанным _id не найдена'));


    if (card.owner.toString() !== req.user?._id.toString()) {
      return next(new ForbiddenError('У вас нет прав для удаления этой карточки'));
    }

    await card.deleteOne();
    res.send({ message: 'Карточка удалена' });
  } catch (error) {
    console.log('Error in deleteCard:', error);
    if (error instanceof mongoose.Error.CastError) {
      next(new ValidationError([{ message: 'Некорректный ID карточки.' }]));
    } else {
      next(error)
    }

  }
};
const likeCard = async (req: CustomRequest, res: Response, next: NextFunction) => {
  /* eslint consistent-return: "off" */
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user?._id } },
      { new: true },
    );
    if (!card) {
      return next(new NotFoundError('Передан несуществующий _id карточки.'));
    }
    res.send(card);
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(new ValidationError([{ message: 'Переданы некорректные данные для постановки лайка.' }]));
    } else {
      next(error);
    }
  }
};

const dislikeCard = async (req: CustomRequest, res: Response, next: NextFunction) => {
  /* eslint consistent-return: "off" */
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user?._id } },
      { new: true },
    );
    if (!card) {
      return next(new NotFoundError('Передан несуществующий _id карточки.'));
    }
    res.send(card);
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(new ValidationError([{ message: 'Переданы некорректные данные для снятия лайка.' }]));
    } else {
      next(error)
    }
  }
};

export {
  getCards, deleteCard, likeCard, dislikeCard, createCard,
};
