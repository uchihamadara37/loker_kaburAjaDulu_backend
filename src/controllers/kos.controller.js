import prisma from '../config/prisma.config.js';
import { deleteFileFromGCS } from '../utils/gcs.util.js';

// HRD: Create Kos
export const createKos = async (req, res) => {
  console.log("Data kos yang dipost", req.body)
  const {
    nama_kos, latitude, longitude, alamat, harga_perbulan, harga_dp,
    mata_uang_yang_dipakai, fasilitas, kontak, email, deskripsi, jumlah_kamar_tersedia, foto_kos_url
  } = req.body;
  const pemilik_id = req.user.id; // HRD yang post
  // const foto_kos_url = req.body.foto_kos_url; // Array of URLs dari GCS (middleware upload)

  // Basic validation
  const requiredFields = { nama_kos, latitude, longitude, alamat, harga_perbulan, mata_uang_yang_dipakai, deskripsi, jumlah_kamar_tersedia};
  for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === '') {
          return res.status(400).json({ message: `Field '${field}' wajib diisi.` });
      }
  }

  try {
    // Fasilitas bisa jadi string dipisahkan koma dari form, atau sudah array
    // let fasilitasArray = fasilitas;
    // if (typeof fasilitas === 'string') {
    //     fasilitasArray = fasilitas.split(',').map(item => item.trim()).filter(item => item);
    // } else if (!Array.isArray(fasilitas)) {
    //     fasilitasArray = [];
    // }


    const newKos = await prisma.kos.create({
      data: {
        pemilik_id,
        nama_kos,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        alamat,
        harga_perbulan: parseFloat(harga_perbulan),
        harga_dp: harga_dp ? parseFloat(harga_dp) : null,
        mata_uang_yang_dipakai,
        fasilitas,
        foto_kos: foto_kos_url, // Sudah array of URLs
        kontak,
        email,
        deskripsi,
        jumlah_kamar_tersedia: parseInt(jumlah_kamar_tersedia),
      },
      include: {
        pemilik: { select: { id: true, nama: true, email: true, foto_profile: true, role: true, linkLinkedIn: true } }
      }
    });
    res.status(201).json({ message: "Info Kos berhasil ditambahkan", data: newKos });
  } catch (error) {
    console.error("Create Kos error:", error);
    res.status(500).json({ message: "Gagal menambahkan info Kos", error: error.message });
  }
};

// ALL USERS: Get All Kos
export const getAllKos = async (req, res) => {
  try {
    const kosList = await prisma.kos.findMany({
      orderBy: { waktu_post: 'desc' },
      include: {
        pemilik: { select: { id: true, nama: true, email: true, foto_profile: true, role: true, linkLinkedIn: true } }
      }
    });
    res.status(200).json(kosList);
  } catch (error) {
    console.error("Get All Kos error:", error);
    res.status(500).json({ message: "Gagal mengambil data Kos", error: error.message });
  }
};

// ALL USERS: Get Kos by ID
export const getKosById = async (req, res) => {
  const { id } = req.params;
  try {
    const kos = await prisma.kos.findUnique({
      where: { id },
      include: {
        pemilik: { select: { id: true, nama: true, email: true, foto_profile: true, role: true, linkLinkedIn: true } }
      }
    });
    if (!kos) {
      return res.status(404).json({ message: "Info Kos tidak ditemukan" });
    }
    res.status(200).json(kos);
  } catch (error) {
    console.error("Get Kos By ID error:", error);
    res.status(500).json({ message: "Gagal mengambil detail Kos", error: error.message });
  }
};

// HRD (yang posting) / ADMIN: Update Kos
export const updateKos = async (req, res) => {
  const { id } = req.params; // ID Kos
  const userId = req.user.id; // ID User (HRD) dari token
  const foto_kos_url = req.body.foto_kos_url; // Bisa jadi array baru atau undefined

  try {
    const kos = await prisma.kos.findUnique({ where: { id } });
    if (!kos) {
      return res.status(404).json({ message: "Info Kos tidak ditemukan" });
    }
    if (kos.pemilik_id !== userId) { // Hanya pemilik yang bisa update
      return res.status(403).json({ message: "Anda tidak berhak mengubah info Kos ini" });
    }

    const {
        nama_kos, latitude, longitude, alamat, harga_perbulan, harga_dp,
        mata_uang_yang_dipakai, fasilitas, kontak, email, deskripsi, jumlah_kamar_tersedia
    } = req.body;

    const dataToUpdate = {};
    // Isi dataToUpdate dengan field yang ada di req.body
    if (nama_kos !== undefined) dataToUpdate.nama_kos = nama_kos;
    if (latitude !== undefined) dataToUpdate.latitude = parseFloat(latitude);
    if (longitude !== undefined) dataToUpdate.longitude = parseFloat(longitude);
    if (alamat !== undefined) dataToUpdate.alamat = alamat;
    if (harga_perbulan !== undefined) dataToUpdate.harga_perbulan = parseFloat(harga_perbulan);
    if (harga_dp !== undefined) dataToUpdate.harga_dp = harga_dp ? parseFloat(harga_dp) : null;
    if (mata_uang_yang_dipakai !== undefined) dataToUpdate.mata_uang_yang_dipakai = mata_uang_yang_dipakai;
    if (kontak !== undefined) dataToUpdate.kontak = kontak;
    if (email !== undefined) dataToUpdate.email = email;
    if (deskripsi !== undefined) dataToUpdate.deskripsi = deskripsi;
    if (jumlah_kamar_tersedia !== undefined) dataToUpdate.jumlah_kamar_tersedia = parseInt(jumlah_kamar_tersedia);
    
    if (fasilitas !== undefined) {
        // let fasilitasArray = fasilitas;
        // if (typeof fasilitas === 'string') {
        //     fasilitasArray = fasilitas.split(',').map(item => item.trim()).filter(item => item);
        // } else if (!Array.isArray(fasilitas)) {
        //     fasilitasArray = []; // Atau biarkan nilai lama jika tidak valid
        // }
        dataToUpdate.fasilitas = fasilitas;
    }
    if (foto_kos_url !== undefined) { // Jika ada foto baru diupload
        dataToUpdate.foto_kos = foto_kos_url;
    }


    const updatedKos = await prisma.kos.update({
      where: { id },
      data: dataToUpdate,
      include: {
        pemilik: { select: { id: true, nama: true, email: true, foto_profile: true, role: true, linkLinkedIn: true } }
      }
    });
    res.status(200).json({ message: "Info Kos berhasil diperbarui", data: updatedKos });
  } catch (error) {
    console.error("Update Kos error:", error);
    res.status(500).json({ message: "Gagal memperbarui info Kos", error: error.message });
  }
};

// HRD (yang posting) / ADMIN: Delete Kos
export const deleteKos = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const kos = await prisma.kos.findUnique({ where: { id } });
    if (!kos) {
      return res.status(404).json({ message: "Info Kos tidak ditemukan" });
    }
    if (kos.pemilik_id !== userId) {
      return res.status(403).json({ message: "Anda tidak berhak menghapus info Kos ini" });
    }
    if (kos.foto_kos) {
      try {
        await deleteFileFromGCS(kos.foto_kos);
        console.log(`Successfully deleted GCS file: ${kos.foto_kos} associated with Kos ID: ${id}`);
      } catch (gcsError) {
        // Log error GCS tapi lanjutkan proses penghapusan data dari DB
        // Atau, Anda bisa memilih untuk menghentikan proses jika penghapusan GCS gagal.
        console.error(`Failed to delete GCS file ${kos.foto_kos} for Kos ID: ${id}. Error: ${gcsError.message}. Proceeding with DB deletion.`);
      } // Anda perlu membuat fungsi ini di gcs.util.js
    }


    await prisma.kos.delete({ where: { id } });
    res.status(200).json({ message: "Info Kos berhasil dihapus" });
  } catch (error) {
    console.error("Delete Kos error:", error);
    res.status(500).json({ message: "Gagal menghapus info Kos", error: error.message });
  }
};