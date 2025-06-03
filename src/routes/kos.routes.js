import express from 'express';
import {
  createKos, getAllKos, getKosById, updateKos, deleteKos
} from '../controllers/kos.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { uploadMultiple, processMultipleUploads, uploadSingle, processSingleUpload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// HRD bisa post, update, delete. Semua user bisa get.
router.post(
  '/',
  protect,
  authorize('HRD'),
  uploadSingle('foto_kos'), 
  processSingleUpload('foto_kos_url'), 
  createKos
);

router.get('/', getAllKos);
router.get('/:id', getKosById);

router.put(
  '/:id',
  protect,
  authorize('HRD'),
  uploadSingle('foto_kos'), 
  processSingleUpload('foto_kos_url'),
  updateKos
);
router.delete('/:id', protect, authorize('HRD'), deleteKos);

export default router;