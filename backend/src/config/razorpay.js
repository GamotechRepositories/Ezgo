import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

export const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.warn('⚠️ Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not set in environment variables');
  }

  return new Razorpay({
    key_id: key_id || '',
    key_secret: key_secret || '',
  });
};

const razorpayInstance = getRazorpayInstance();
export default razorpayInstance;
