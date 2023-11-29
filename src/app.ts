import express, { NextFunction} from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import winston from 'winston';
import type { CustomRequest } from './types/types';
import userRoutes from './routes/user';
import cardRoutes from './routes/card';
import { createUser, login } from './controllers/user';
import authMiddleware from './middlewares/auth';
import { constants } from 'http2';
import { NotFoundError } from './errors/errors';
import { ValidationError, AuthenticationError, ForbiddenError } from './errors/errors';
import { createUserValidation, loginValidation } from './routes/user';
const {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_UNAUTHORIZED
} = constants;

const app = express();
const port = 3000;

const requestLogger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'request.log', level: 'info' }),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

const errorLogger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

app.use(morgan('combined', {
  stream: {
    write: message => requestLogger.info(message.trim()),
  },
}));

mongoose.connect('mongodb://localhost:27017/mestodb')
  .then(() => {
    console.info('Connected to MongoDB');
  })
  .catch((error) => {
    console.info('Error connecting to MongoDB', error);
  });

app.use(express.json());

app.post('/signup', createUserValidation, createUser);
app.post('/signin', loginValidation, login);

app.use(authMiddleware);

app.use('/users', userRoutes);

app.use('/cards', cardRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use((req, res, next) => {
  console.log(`404 Error: ${req.method} ${req.originalUrl}`);
  next(new NotFoundError('Ресурс не найден'));
});

app.use((err: any, req: CustomRequest, res: express.Response, next: express.NextFunction) => {
  errorLogger.error(`Error: ${err.message}`);

  if (err instanceof NotFoundError) {
    res.status(err.status).send({ message: err.message });
  } else if (err instanceof AuthenticationError) {
    res.status(err.status).send({ message: err.message });
  } else if (err instanceof ForbiddenError) {
    res.status(err.status).send({ message: err.message });
  } else if (err instanceof ValidationError) {
    res.status(err.status).send({ errors: err.errors });
  } else if (err.code === 11000) {
    res.status(HTTP_STATUS_CONFLICT).send({ message: 'Пользователь с таким email уже существует.' });
  } else if (err.name === 'UnauthorizedError') {
    res.status(HTTP_STATUS_UNAUTHORIZED).send({ message: 'Некорректный токен.' });
  } else {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла неизвестная ошибка' });
  }
});


app.listen(port, () => {
  console.info(`Server is running on http://localhost:${port}`);
});


