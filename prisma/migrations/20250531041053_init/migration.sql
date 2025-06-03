-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `foto_profile` VARCHAR(191) NULL,
    `role` ENUM('HRD', 'USER_BIASA') NOT NULL DEFAULT 'USER_BIASA',
    `linkLinkedIn` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lowongan` (
    `id` VARCHAR(191) NOT NULL,
    `hrd_yang_post_id` VARCHAR(191) NOT NULL,
    `nama_perusahaan` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `deskripsi_lowongan` TEXT NOT NULL,
    `rentang_gaji` VARCHAR(191) NOT NULL,
    `jenisPenempatan` ENUM('WFA', 'WFH', 'WFO', 'HYBRID') NOT NULL,
    `jumlah_jam_kerja` VARCHAR(191) NOT NULL,
    `waktu_posting` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `contact_email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kos` (
    `id` VARCHAR(191) NOT NULL,
    `pemilik_id` VARCHAR(191) NOT NULL,
    `nama_kos` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `harga_perbulan` DOUBLE NOT NULL,
    `harga_dp` DOUBLE NULL,
    `mata_uang_yang_dipakai` VARCHAR(191) NOT NULL,
    `fasilitas` VARCHAR(191) NOT NULL,
    `foto_kos` VARCHAR(191) NOT NULL,
    `kontak` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `deskripsi` TEXT NOT NULL,
    `jumlah_kamar_tersedia` INTEGER NOT NULL,
    `waktu_post` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Lowongan` ADD CONSTRAINT `Lowongan_hrd_yang_post_id_fkey` FOREIGN KEY (`hrd_yang_post_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kos` ADD CONSTRAINT `Kos_pemilik_id_fkey` FOREIGN KEY (`pemilik_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
