// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import carRoutes from './routes/cars.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*' // in prod set to your frontend domain
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/cars', carRoutes);

app.get('/', (req, res) => res.send('Car Showcase API'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
});


// Important: In production, set CORS_ORIGIN to your frontend domain and do not use *.