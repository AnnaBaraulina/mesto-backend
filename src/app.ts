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

app.post('/signup', createUser);
app.post('/signin', login);

app.use(authMiddleware);

app.use('/users', userRoutes);

app.use('/cards', cardRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use((req, res) => {
  console.log(`404 Error: ${req.method} ${req.originalUrl}`);
  res.status(404).send('404 Not Found: The requested resource was not found on this server.');
});

app.use((err: any, req: CustomRequest, res: express.Response, next: express.NextFunction) => {
  errorLogger.error(`Error: ${err.message}`);

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
  } else if (err.code === 11000) {
    res.status(HTTP_STATUS_CONFLICT).send({ message: 'Пользователь с таким email уже существует.' });
  } else if (err.name === 'UnauthorizedError') { // Пример проверки ошибки авторизации
    res.status(HTTP_STATUS_UNAUTHORIZED).send({ message: 'Некорректный токен.' });
  } else {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла неизвестная ошибка' });
  }
});


app.listen(port, () => {
  console.info(`Server is running on http://localhost:${port}`);
});


