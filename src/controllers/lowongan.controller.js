import prisma from '../config/prisma.config.js';

// HRD: Create Lowongan
export const createLowongan = async (req, res) => {
  const {
    nama_perusahaan, latitude, longitude, alamat, deskripsi_lowongan,
    rentang_gaji, jenisPenempatan, jumlah_jam_kerja, contact_email
  } = req.body;
  const hrd_yang_post_id = req.user.id; // Dari token JWT

  if (!nama_perusahaan || !latitude || !longitude || !alamat || !deskripsi_lowongan || !rentang_gaji || !jenisPenempatan || !jumlah_jam_kerja || !contact_email) {
    return res.status(400).json({ message: "Semua field wajib diisi." });
  }

  // Validasi JenisPenempatan (opsional, bisa juga dihandle dengan enum di Prisma)
  const validJenisPenempatan = ["WFA", "WFH", "WFO", "HYBRID"];
  if (!validJenisPenempatan.includes(jenisPenempatan)) {
      return res.status(400).json({ message: `Jenis Penempatan tidak valid. Gunakan salah satu dari: ${validJenisPenempatan.join(", ")}` });
  }

  try {
    const newLowongan = await prisma.lowongan.create({
      data: {
        hrd_yang_post_id,
        nama_perusahaan,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        alamat,
        deskripsi_lowongan,
        rentang_gaji,
        jenisPenempatan, // Prisma akan validasi enum
        jumlah_jam_kerja,
        contact_email,
      },
      include: { // Sertakan data HRD yang memposting
        hrd: {
          select: { id: true, nama: true, email: true, foto_profile: true, role: true, linkLinkedIn: true }
        }
      }
    });
    res.status(201).json({ message: "Lowongan berhasil dibuat", data: newLowongan });
  } catch (error) {
    console.error("Create Lowongan error:", error);
    if (error.code === 'P2003') { // Foreign key constraint failed
        return res.status(400).json({ message: "HRD ID tidak valid." });
    }
    res.status(500).json({ message: "Gagal membuat lowongan", error: error.message });
  }
};

// ALL USERS: Get All Lowongan
export const getAllLowongan = async (req, res) => {
  try {
    const lowongan = await prisma.lowongan.findMany({
      orderBy: { waktu_posting: 'desc' },
      include: {
        hrd: { select: { id: true, nama: true, email: true, foto_profile: true, role: true, linkLinkedIn: true } }
      }
    });
    res.status(200).json(lowongan);
  } catch (error) {
    console.error("Get All Lowongan error:", error);
    res.status(500).json({ message: "Gagal mengambil data lowongan", error: error.message });
  }
};

// ALL USERS: Get Lowongan by ID
export const getLowonganById = async (req, res) => {
  const { id } = req.params;
  try {
    const lowongan = await prisma.lowongan.findUnique({
      where: { id },
      include: {
        hrd: { select: { id: true, nama: true, email: true, foto_profile: true, role: true, linkLinkedIn: true } }
      }
    });
    if (!lowongan) {
      return res.status(404).json({ message: "Lowongan tidak ditemukan" });
    }
    res.status(200).json(lowongan);
  } catch (error) {
    console.error("Get Lowongan By ID error:", error);
    res.status(500).json({ message: "Gagal mengambil detail lowongan", error: error.message });
  }
};

// HRD (yang posting) / ADMIN: Update Lowongan
export const updateLowongan = async (req, res) => {
  const { id } = req.params;
  const hrdId = req.user.id;
  const userRole = req.user.role;

  try {
    const lowongan = await prisma.lowongan.findUnique({ where: { id } });
    if (!lowongan) {
      return res.status(404).json({ message: "Lowongan tidak ditemukan" });
    }

    // Hanya HRD yang posting atau ADMIN yang bisa update
    if (lowongan.hrd_yang_post_id !== hrdId && userRole !== 'ADMIN') { // Asumsi ada role ADMIN
      return res.status(403).json({ message: "Anda tidak berhak mengubah lowongan ini" });
    }
    // Untuk tugas ini, kita anggap hanya HRD yang posting
    if (lowongan.hrd_yang_post_id !== hrdId ) {
      return res.status(403).json({ message: "Anda tidak berhak mengubah lowongan ini" });
    }


    // Ambil field yang boleh diupdate dari body
    const { nama_perusahaan, latitude, longitude, alamat, deskripsi_lowongan, rentang_gaji, jenisPenempatan, jumlah_jam_kerja, contact_email } = req.body;
    const dataToUpdate = {};
    if (nama_perusahaan) dataToUpdate.nama_perusahaan = nama_perusahaan;
    if (latitude) dataToUpdate.latitude = parseFloat(latitude);
    if (longitude) dataToUpdate.longitude = parseFloat(longitude);
    if (alamat) dataToUpdate.alamat = alamat;
    if (deskripsi_lowongan) dataToUpdate.deskripsi_lowongan = deskripsi_lowongan;
    if (rentang_gaji) dataToUpdate.rentang_gaji = rentang_gaji;
    if (jenisPenempatan) dataToUpdate.jenisPenempatan = jenisPenempatan;
    if (jumlah_jam_kerja) dataToUpdate.jumlah_jam_kerja = jumlah_jam_kerja;
    if (contact_email) dataToUpdate.contact_email = contact_email;


    const updatedLowongan = await prisma.lowongan.update({
      where: { id },
      data: dataToUpdate,
      include: {
        hrd: { select: { id: true, nama: true, email: true, foto_profile: true, role: true, linkLinkedIn: true } }
      }
    });
    res.status(200).json({ message: "Lowongan berhasil diperbarui", data: updatedLowongan });
  } catch (error) {
    console.error("Update Lowongan error:", error);
    res.status(500).json({ message: "Gagal memperbarui lowongan", error: error.message });
  }
};

// HRD (yang posting) / ADMIN: Delete Lowongan
export const deleteLowongan = async (req, res) => {
  const { id } = req.params;
  const hrdId = req.user.id;
  const userRole = req.user.role;

  try {
    const lowongan = await prisma.lowongan.findUnique({ where: { id } });
    if (!lowongan) {
      return res.status(404).json({ message: "Lowongan tidak ditemukan" });
    }

    if (lowongan.hrd_yang_post_id !== hrdId && userRole !== 'ADMIN') {
         return res.status(403).json({ message: "Anda tidak berhak menghapus lowongan ini" });
    }
     if (lowongan.hrd_yang_post_id !== hrdId ) {
      return res.status(403).json({ message: "Anda tidak berhak menghapus lowongan ini" });
    }

    await prisma.lowongan.delete({ where: { id } });
    res.status(200).json({ message: "Lowongan berhasil dihapus" });
  } catch (error) {
    console.error("Delete Lowongan error:", error);
    res.status(500).json({ message: "Gagal menghapus lowongan", error: error.message });
  }
};