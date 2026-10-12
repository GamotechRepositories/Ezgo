import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

// Configure multer with memory storage (max 10MB per file)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPG, PNG, WEBP) and PDF documents are allowed!'), false);
    }
  },
});

// Helper function to upload buffer to Cloudinary
const uploadBufferToCloudinary = (buffer, folder = 'ezzygo/general') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// @route   POST /api/upload
// @desc    Upload single image from device to Cloudinary
// @access  Public
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please select an image file to upload');
    }

    const folder = req.query.folder || req.body.folder || 'ezzygo/uploads';
    const result = await uploadBufferToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: 'Image successfully uploaded to Cloudinary',
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images from device to Cloudinary
// @access  Public
router.post('/multiple', upload.array('images', 8), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('Please select at least one image file');
    }

    const folder = req.query.folder || req.body.folder || 'ezzygo/gallery';
    const uploadPromises = req.files.map((file) =>
      uploadBufferToCloudinary(file.buffer, folder)
    );

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      count: results.length,
      urls: results.map((r) => r.secure_url),
      data: results.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
        format: r.format,
        width: r.width,
        height: r.height,
      })),
    });
  } catch (error) {
    next(error);
  }
});


import User from '../models/User.js';
import { logAudit } from '../services/auditService.js';

// @route   GET /api/upload/kyc/:providerId/:documentType
// @desc    Secure KYC document access (Admin or Owner only)
// @access  Private (Admin or Vendor owner)
router.get('/kyc/:providerId/:documentType', requireAuth, async (req, res, next) => {
  try {
    const { providerId, documentType } = req.params;
    const userId = req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isOwner = userId === providerId;

    if (!isAdmin && !isOwner) {
      res.status(403);
      throw new Error('Access denied. KYC documents are restricted to administrators and the verified account owner.');
    }

    const provider = await User.findById(providerId);
    if (!provider) {
      res.status(404);
      throw new Error('Provider not found');
    }

    const allowedTypes = ['aadhaarFront', 'aadhaarBack', 'panCard', 'gstDoc'];
    if (!allowedTypes.includes(documentType)) {
      res.status(400);
      throw new Error(`Invalid document type. Allowed: ${allowedTypes.join(', ')}`);
    }

    const docUrl = provider.kycDocuments?.[documentType];
    if (!docUrl) {
      res.status(404);
      throw new Error(`Document "${documentType}" has not been uploaded for this provider.`);
    }

    if (isAdmin) {
      await logAudit({
        req,
        action: 'KYC_DOCUMENT_VIEWED',
        targetType: 'User',
        targetId: provider._id,
        details: `Administrator "${req.user.name || 'Admin'}" viewed ${documentType} copy for vendor "${provider.businessName || provider.name}"`,
        metadata: { documentType },
        status: 'INFO',
      });
    }

    res.json({
      success: true,
      documentType,
      url: docUrl,
      providerName: provider.businessName || provider.name,
      isVerified: provider.isVerified,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
