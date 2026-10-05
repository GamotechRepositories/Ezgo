import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'q82emsxz',
  api_key: process.env.CLOUDINARY_API_KEY || '429134343155384',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ChEUR9377SKCNWuEAQtSBUqYZr4',
  secure: true,
});

export default cloudinary;
