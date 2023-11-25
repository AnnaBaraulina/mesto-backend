import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import winston from 'winston';
import type { CustomRequest } from './types/types';
import userRoutes from './routes/user';
import cardRoutes from './routes/card';
import { createUser, login } from './controllers/user';
import authMiddleware from './middlewares/auth';


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

app.use((err: Error, req: CustomRequest, res: express.Response, next: express.NextFunction) => {
  errorLogger.error(`Error: ${err.message}`);
  res.status(500).send('Internal Server Error');
});


app.listen(port, () => {
  console.info(`Server is running on http://localhost:${port}`);
});


