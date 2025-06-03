import prisma from '../config/prisma.config.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // Untuk ID jika tidak pakai default prisma

export const register = async (req, res) => {
  const { nama, email, password, linkLinkedIn, role, } = req.body; // foto_profile akan dihandle terpisah jika ada saat registrasi

  if (!nama || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password diperlukan' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        // id: uuidv4(), // Tidak perlu jika @default(uuid()) di skema
        nama,
        email,
        password: hashedPassword,
        linkLinkedIn,
        role: role === 'HRD' ? 'HRD' : 'USER_BIASA', // Pastikan role valid
        foto_profile: req.body.foto_profile_url // Jika foto diupload saat registrasi
      },
    });

    // Hapus password dari output
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'User berhasil terdaftar', data: userWithoutPassword });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: 'Gagal mendaftarkan user', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password diperlukan' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email tidak ditemukan' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d', // Token berlaku 1 hari
    });

    // Hapus password dari output
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: 'Login berhasil',
      token,
      data: userWithoutPassword,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Gagal login', error: error.message });
  }
};

export const getMe = async (req, res) => {
  // req.user didapat dari middleware protect
  if (!req.user) {
      return res.status(404).json({ message: "User not found" });
  }
  try {
      const userDetails = await prisma.user.findUnique({
          where: { id: req.user.id },
          // Exclude password
          select: {
              id: true,
              nama: true,
              email: true,
              foto_profile: true,
              role: true,
              linkLinkedIn: true,
              createdAt: true,
              updatedAt: true
          }
      });
      if (!userDetails) {
          return res.status(404).json({ message: "User details not found" });
      }
      res.status(200).json(userDetails);
  } catch (error) {
      console.error("GetMe error:", error);
      res.status(500).json({ message: "Failed to fetch user details", error: error.message });
  }
};