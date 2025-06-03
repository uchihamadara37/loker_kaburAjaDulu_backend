import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { processSingleUpload, uploadSingle } from '../middlewares/upload.middleware.js';
// Contoh jika ada upload foto profil saat registrasi (jarang, biasanya setelah login)
// import { uploadSingle, processSingleUpload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/register',
    uploadSingle('foto_profile'), // Middleware multer untuk handle upload 'foto_profile' dari form-data
    processSingleUpload('foto_profile_url'), // Middleware untuk upload ke GCS & simpan URL ke req.body.foto_profile_url
    register
);
// Jika ada upload foto saat registrasi:
// router.post('/register', uploadSingle('foto_profile'), processSingleUpload('foto_profile_url'), register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;