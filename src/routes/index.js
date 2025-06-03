import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import lowonganRoutes from './lowongan.routes.js';
import kosRoutes from './kos.routes.js';

const router = express.Router();

router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/lowongan', lowonganRoutes);
router.use('/api/kos', kosRoutes);
router.use('/', (req, res) => {
  res.json({ message: 'Selamat datang di Root Info Lowongan Programmer Luar Negeri!' });
})

// Default route
router.get('/api', (req, res) => {
  res.json({ message: 'Selamat datang di API Info Lowongan Programmer Luar Negeri!' });
});


export default router;