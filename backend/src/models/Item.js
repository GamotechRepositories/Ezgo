import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: function () {
        return this.name;
      },
    },
    category: {
      type: String,
      default: 'DJ & Sound Systems',
    },
    specs: {
      type: String,
      default: '',
    },
    dailyRate: {
      type: Number,
      default: 2000,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Maintenance Required'],
      default: 'Excellent',
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model('Item', itemSchema);
export default Item;
