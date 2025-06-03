import prisma from '../config/prisma.config.js';

export const updateUserProfile = async (req, res) => {
  const { id } = req.user; // ID pengguna dari token JWT (middleware protect)
  const { nama, linkLinkedIn } = req.body;
  const foto_profile_url = req.body.foto_profile_url; // URL dari GCS (middleware upload)

  try {
    const updateData = {};
    if (nama) updateData.nama = nama;
    if (linkLinkedIn) updateData.linkLinkedIn = linkLinkedIn;
    if (foto_profile_url) updateData.foto_profile = foto_profile_url;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No data provided for update." });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { // Pilih field yang ingin dikembalikan, jangan kembalikan password
        id: true,
        nama: true,
        email: true,
        foto_profile: true,
        role: true,
        linkLinkedIn: true,
      }
    });
    res.status(200).json({ message: 'Profil berhasil diperbarui', data: updatedUser });
  } catch (error) {
    console.error("Update Profile error:", error);
    res.status(500).json({ message: 'Gagal memperbarui profil', error: error.message });
  }
};