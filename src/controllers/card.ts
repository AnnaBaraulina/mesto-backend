import { CustomRequest } from '../types/types';
import Card from '../models/card';
import { Request, Response } from 'express';

/*export const createCard = (req: CustomRequest, res: Response) => {
  console.log(req.user?._id);
};*/

const getCards = async (req: Request, res: Response) => {
  try {
    const cards = await Card.find({});
    res.send(cards);
  } catch (error) {
    res.status(500).send({ message: 'Произошла ошибка при получении карточек' });
  }
};

const createCard = async (req: CustomRequest, res: Response) => {
  try {
    const card = new Card({
      ...req.body,
      owner: req.user?._id
    });
    await card.save();
    res.status(201).send(card);
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).send({ message: 'Произошла ошибка при создании карточки' });
  }
};

const deleteCard = async (req: Request, res: Response) => {
  try {
    const card = await Card.findByIdAndRemove(req.params.cardId);
    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
    }
    res.send({ message: 'Карточка удалена' });
  } catch (error) {
    res.status(500).send({ message: 'Произошла ошибка при удалении карточки' });
  }
};

const likeCard = async (req: CustomRequest, res: Response) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user?._id } },
      { new: true }
    );
    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
    }
    res.send(card);
  } catch (error) {
    res.status(500).send({ message: 'Произошла ошибка при установке лайка' });
  }
};

const dislikeCard = async (req: CustomRequest, res: Response) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user?._id } },
      { new: true }
    );
    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
    }
    res.send(card);
  } catch (error) {
    res.status(500).send({ message: 'Произошла ошибка при снятии лайка' });
  }
};



export { getCards, createCard, deleteCard, likeCard, dislikeCard };
