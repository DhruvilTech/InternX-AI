import { v2 as cloudinary } from 'cloudinary';

const configureCloudinary = () => {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('Cloudinary SDK configured successfully.');
  } else {
    console.log('Cloudinary env credentials not found, running in mock/local fallback mode.');
  }
};

export { cloudinary, configureCloudinary };
