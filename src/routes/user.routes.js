import express from 'express';
import { updateUserProfile } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadSingle, processSingleUpload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Endpoint untuk update profil user, termasuk foto_profile
router.put(
  '/profile',
  protect, // User harus login
  uploadSingle('foto_profile'), // Middleware multer untuk handle upload 'foto_profile'
  processSingleUpload('foto_profile_url'), // Middleware untuk upload ke GCS dan simpan URL ke req.body.foto_profile_url
  updateUserProfile
);

export default router;