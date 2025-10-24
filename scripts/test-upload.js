// scripts/test-upload.js
import cloudinary from '../utils/cloudinaryConfig.js';
import path from 'path';

async function test() {
  try {
    const localPath = path.join(process.cwd(), 'scripts', 'images', 'toyota-corolla-2022', 'main.png');
    console.log('Uploading:', localPath);
    const res = await cloudinary.uploader.upload(localPath, {
      folder: 'car_showcase/test', // puts files in this Cloudinary folder
      use_filename: true,
      unique_filename: false,
      overwrite: true
    });
    console.log('Upload result (secure_url):', res.secure_url);
  } catch (err) {
    console.error('Upload error:', err);
  }
}

test();
