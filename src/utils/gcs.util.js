import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const bucketName = process.env.GCS_BUCKET_NAME; // Nama bucket GCS Anda, definisikan di .env
const projectId = process.env.GCP_PROJECT_ID;
const clientEmail = process.env.GCP_CLIENT_EMAIL;
const privateKey = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Pastikan GOOGLE_APPLICATION_CREDENTIALS di-set di environment server
// atau berikan path ke keyFile jika menjalankan lokal dan belum di-set
const storage = new Storage({
  projectId: projectId,
    credentials: {
        client_email: clientEmail,
        private_key: privateKey,
    },
});

const bucket = storage.bucket(bucketName);

export const uploadFileToGCS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('No file uploaded.');
      return;
    }
    if (!bucketName) {
      reject('Google Cloud Storage bucket name not configured.');
      return;
    }

    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const uniqueFileName = `${uuidv4()}${extension}`;
    const blob = bucket.file(uniqueFileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      gzip: true,
    });

    blobStream.on('error', (err) => {
      console.error("GCS Upload Error:", err);
      reject(`Unable to upload file: ${err.message}`);
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

export const uploadMultipleFilesToGCS = async (files) => {
    if (!files || files.length === 0) {
        return [];
    }
    const uploadPromises = files.map(file => uploadFileToGCS(file));
    return Promise.all(uploadPromises);
};

export const deleteFileFromGCS = async (publicUrl) => {
  if (!publicUrl) {
    console.warn('No public URL provided for deletion.');
    return Promise.resolve(); // Atau reject, tergantung preferensi error handling
  }

  if (!bucketName) {
    console.error('Google Cloud Storage bucket name not configured.');
    return Promise.reject('GCS bucket name not configured.');
  }

  try {
    const url = new URL(publicUrl);
    const bucketNameFromUrl = url.hostname === 'storage.googleapis.com' ? url.pathname.split('/')[1] : null;
    
    // Ekstrak nama file dari path URL
    // Pathname akan terlihat seperti "/BUCKET_NAME/object/path/file.jpg"
    // Kita perlu mengambil semua setelah "/BUCKET_NAME/"
    let fileName = '';
    if (url.hostname === 'storage.googleapis.com' && url.pathname.startsWith(`/${bucketName}/`)) {
        fileName = url.pathname.substring(`/${bucketName}/`.length);
    } else {
        // Jika format URL berbeda atau bucket name tidak cocok, coba parsing cara lain atau log error
        // Ini adalah fallback sederhana jika nama file adalah bagian terakhir dari path
        const pathParts = url.pathname.split('/');
        fileName = pathParts[pathParts.length - 1];
        console.warn(`Could not reliably determine filename from URL structure for GCS deletion. Using: ${fileName}. Ensure this is correct.`);
        // Jika bucket name dari URL tidak sama dengan yang dikonfigurasi, bisa jadi masalah.
        if (bucketNameFromUrl && bucketNameFromUrl !== bucketName) {
            console.error(`Mismatch bucket name: URL indicates '${bucketNameFromUrl}', configured is '${bucketName}'. Deletion aborted for safety.`);
            return Promise.reject('Bucket name mismatch.');
        }
    }


    if (!fileName) {
      console.error('Could not extract file name from public URL:', publicUrl);
      return Promise.reject('Invalid GCS public URL format for deletion.');
    }

    console.log(`Attempting to delete GCS file: ${fileName} from bucket ${bucketName}`);
    await bucket.file(fileName).delete();
    console.log(`Successfully deleted ${fileName} from GCS bucket ${bucketName}.`);
  } catch (error) {
    // Kode '404' berarti file tidak ditemukan, yang bisa dianggap "berhasil" dalam konteks delete
    // karena file yang ingin dihapus memang sudah tidak ada.
    if (error.code === 404) {
      console.warn(`File not found in GCS (assumed already deleted): ${publicUrl}`, error.message);
      return Promise.resolve(); // File tidak ada, anggap operasi delete berhasil
    }
    console.error('Error deleting file from GCS:', error);
    // Lemparkan kembali error agar pemanggil tahu ada masalah
    return Promise.reject(`Failed to delete file from GCS: ${error.message}`);
  }
};