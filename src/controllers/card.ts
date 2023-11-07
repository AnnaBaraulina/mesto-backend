import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { constants } from 'http2';
import type { CustomRequest } from '../types/types';
import Card from '../models/card';

const {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
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

const createCard = async (req: CustomRequest, res: Response) => {
  /* eslint consistent-return: "off" */
  try {
    const card = new Card({
      ...req.body,
      owner: req.user?._id,
    });
    await card.save();
    res.status(HTTP_STATUS_CREATED).send(card);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки.' });
    } else {
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
    }
  }
};

const deleteCard = async (req: Request, res: Response) => {
  /* eslint consistent-return: "off" */
  try {
    const card = await Card.findByIdAndRemove(req.params.cardId);
    if (!card) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
    }
    res.send({ message: 'Карточка удалена' });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Некорректный ID карточки.' });
    }
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка при удалении карточки' });
  }
};

const likeCard = async (req: CustomRequest, res: Response) => {
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

const dislikeCard = async (req: CustomRequest, res: Response) => {
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
  getCards, createCard, deleteCard, likeCard, dislikeCard,
};
