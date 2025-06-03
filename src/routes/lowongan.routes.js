import express from 'express';
import {
  createLowongan, getAllLowongan, getLowonganById,
  updateLowongan, deleteLowongan
} from '../controllers/lowongan.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// HRD bisa post, update, delete. Semua user bisa get.
router.post('/', protect, authorize('HRD'), createLowongan);
router.get('/', getAllLowongan); // Tidak perlu protect jika semua boleh lihat
router.get('/:id', getLowonganById); // Tidak perlu protect jika semua boleh lihat

// Untuk update dan delete, pastikan user adalah HRD yang memposting atau admin (jika ada admin role)
router.put('/:id', protect, authorize('HRD'), updateLowongan);
router.delete('/:id', protect, authorize('HRD'), deleteLowongan);

export default router;