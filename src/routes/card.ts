import express from 'express';
import { body } from 'express-validator';
import { param } from 'express-validator';
import {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} from '../controllers/card';

const createCardValidation = [
  body('name').isLength({ min: 2, max: 30 }).withMessage('Имя должно быть от 2 до 30 символов'),
  body('link').isURL().withMessage('Ссылка некорректна'),
];

const cardIdValidation = [
  param('cardId').isMongoId().withMessage('Некорректный ID карточки'),
];

const router = express.Router();

router.get('/', getCards);
router.post('/', createCardValidation, createCard);
router.delete('/:cardId', cardIdValidation, deleteCard);
router.put('/:cardId/likes', cardIdValidation, likeCard);
router.delete('/:cardId/likes', cardIdValidation, dislikeCard);

export default router;
