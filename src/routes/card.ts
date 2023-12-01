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

const router = express.Router();

router.get('/', getCards);
router.post('/', createCardValidation, createCard);
router.delete('/cards/:cardId',
  body('cardId')
    .matches(/^[0-9a-fA-F]{24}$/, 'i')
    .withMessage('Неверный формат идентификатора карточки'),
  deleteCard
);
router.put('/:cardId/likes',
  param('cardId').matches(/^[0-9a-fA-F]{24}$/, 'i').withMessage('Неверный формат идентификатора карточки'),
  likeCard
);
router.delete('/:cardId/likes',
  param('cardId').matches(/^[0-9a-fA-F]{24}$/, 'i').withMessage('Неверный формат идентификатора карточки'),
  dislikeCard
);

export default router;
