import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mainRouter from './routes/index.js';
import prisma from './config/prisma.config.js'; // Import prisma client

dotenv.config(); // Load environment variables dari .env

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Enable CORS untuk semua origin o
app.use(express.json()); // Untuk parsing application/json
app.use(express.urlencoded({ extended: true })); // Untuk parsing application/x-www-form-urlencoded

// Routes
app.use('/', mainRouter); // Gunakan main router yang sudah mengimpor semua route lain

// Global Error Handler (Contoh sederhana)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something broke!', error: err.message });
});

// Test Database Connection and Start Server
const startServer = async () => {
  try {
    // Coba lakukan query sederhana untuk tes koneksi
    await prisma.$connect();
    console.log('Successfully connected to the database.');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1); // Keluar jika tidak bisa konek DB
  } finally {
    // Pastikan koneksi ditutup saat aplikasi berhenti (opsional, tergantung kebutuhan)
    // await prisma.$disconnect();
  }
};

startServer();