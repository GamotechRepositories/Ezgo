import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'marketplace_config',
    },
    platformFeePercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 50,
    },
    minBiddingDiscountPercent: {
      type: Number,
      default: 15,
      min: 0,
      max: 90,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedByName: {
      type: String,
      default: 'System Default',
    },
  },
  { timestamps: true }
);

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
export default SystemSetting;

