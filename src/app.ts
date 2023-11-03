import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/user';
import cardRoutes from './routes/card';
import { CustomRequest } from 'types/types';


const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/mestodb')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB', error);
  });


app.use(express.json());

app.use((req: CustomRequest, res, next) => {
  req.user = {
    _id: '6543a3c3925e1bedf985ba9d'
  };

  next();
});

app.use(userRoutes);
app.use(cardRoutes);




app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});







