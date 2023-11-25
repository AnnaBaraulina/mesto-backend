import express from 'express';
import {
  getUsers, getUserById, getCurrentUser, updateAvatar, updateUser,
} from '../controllers/user';

const router = express.Router();

router.get('/me', getCurrentUser);
router.get('/:userId', getUserById);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateAvatar);
router.get('/', getUsers);

export default router;
