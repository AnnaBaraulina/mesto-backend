import mongoose from 'mongoose';
import { emailRegExp, urlRegExp, defaultUser } from '../config';

interface User {
  name: string;
  about: string;
  avatar: string;
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema<User>({
  name: {
    type: String, default: defaultUser.name, minlength: 2, maxlength: 30,
  },
  about: {
    type: String, default: defaultUser.about, minlength: 2, maxlength: 200,
  },
  avatar: { type: String, default: defaultUser.avatar, validate: {
    validator: (v: any) => urlRegExp.test(v),
    message: 'Ссылка некорректна'
  } },
  email: {
    type: String,
    required: true,
    validate: {
      validator: (v: any) => emailRegExp.test(v),
      message: 'Почта некорректна',
    },
    unique: true,

  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

export default mongoose.model<User>('user', userSchema);
