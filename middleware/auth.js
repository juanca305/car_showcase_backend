// middleware/auth.js
import dotenv from 'dotenv';
dotenv.config();

export default function adminAuth(req, res, next) {
  const adminKey = process.env.ADMIN_API_KEY;
  const provided = req.headers['x-api-key'] || req.query.api_key;
  if (!adminKey || provided !== adminKey) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

// Why: simple protection for create/update/delete endpoints. Later replace with proper auth (JWT + hashed passwords).