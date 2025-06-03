import multer from 'multer';
import { uploadFileToGCS, uploadMultipleFilesToGCS } from '../utils/gcs.util.js';

const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage });

export const uploadSingle = (fieldName) => multerUpload.single(fieldName);
export const uploadMultiple = (fieldName, maxCount = 5) => multerUpload.array(fieldName, maxCount); // default max 5 files

// Middleware untuk memproses upload ke GCS setelah multer
export const processSingleUpload = (fieldNameInBody) => async (req, res, next) => {
  if (!req.file) {
    return next(); // Lanjut jika tidak ada file
  }
  try {
    const publicUrl = await uploadFileToGCS(req.file);
    req.body[fieldNameInBody] = publicUrl; // Menyimpan URL di body untuk controller
    next();
  } catch (error) {
    console.error("Error uploading single file to GCS:", error);
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
};

export const processMultipleUploads = (fieldNameInBody) => async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(); // Lanjut jika tidak ada file
  }
  try {
    const publicUrls = await uploadMultipleFilesToGCS(req.files);
    req.body[fieldNameInBody] = publicUrls; // Menyimpan array URLs di body
    next();
  } catch (error) {
    console.error("Error uploading multiple files to GCS:", error);
    res.status(500).json({ message: "Multiple file upload failed", error: error.message });
  }
};