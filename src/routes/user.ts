import express from 'express';
import { body } from 'express-validator';
import {
  getUsers, getUserById, getCurrentUser, updateAvatar, updateUser,
} from '../controllers/user';

export const createUserValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage('Имя должно быть от 2 до 30 символов'),
  body('about')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Описание должно быть от 2 до 200 символов'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Ссылка некорректна'),
  body('email')
    .isEmail()
    .withMessage('Некорректный формат почты')
    .notEmpty()
    .withMessage('Email обязателен'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен быть не менее 6 символов')
    .notEmpty()
    .withMessage('Пароль обязателен'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Некорректный формат почты'),
  body('password')
    .exists()
    .withMessage('Пароль обязателен для ввода'),
];

const updateUserValidation = [
  body('name').optional().isLength({ min: 2, max: 30 }).withMessage('Имя должно быть от 2 до 30 символов'),
  body('about').optional().isLength({ min: 2, max: 200 }).withMessage('Описание должно быть от 2 до 200 символов'),
];

const updateAvatarValidation = [
  body('avatar').optional().isURL().withMessage('Ссылка на аватар некорректна'),
];

const router = express.Router();

router.get('/me', getCurrentUser);
router.get('/:userId',
  body('userId')
    .matches(/^[0-9a-fA-F]{24}$/, 'i')
    .withMessage('Неверный формат идентификатора'),
  getUserById
);
router.patch('/me', updateUserValidation, updateUser);
router.patch('/me/avatar', updateAvatarValidation, updateAvatar);
router.get('/', getUsers);

export default router;
