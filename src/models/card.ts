import mongoose from 'mongoose';

interface Card {
  name: string;
  link: string;
  owner: mongoose.Schema.Types.ObjectId;
  likes: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
}

const cardSchema = new mongoose.Schema<Card>({
  name: {
    type: String, required: true, minlength: 2, maxlength: 30,
  },
  link: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  likes: { type: [mongoose.Schema.Types.ObjectId], default: [], ref: 'user' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<Card>('card', cardSchema);
