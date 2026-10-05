import mongoose from 'mongoose';

const occasionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    iconType: {
      type: String,
      enum: ['rings', 'lotus', 'corporate', 'party', 'birthday', 'sparkles', 'music', 'camera', 'food'],
      default: 'sparkles',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Occasion = mongoose.model('Occasion', occasionSchema);
export default Occasion;
