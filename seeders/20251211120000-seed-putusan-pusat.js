'use strict';

const csvReader = require("csv-reader");
const fs = require("fs");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");

// Namespace untuk UUID v5 agar konsisten antara ServerPusat & ServerDaerah
const PUTUSAN_NAMESPACE = "6f42f5f2-7d4c-4a9c-b3d0-91f4b3c2e9aa";

const uuidFromNomor = (nomor) => uuidv5((nomor || "").trim().toLowerCase(), PUTUSAN_NAMESPACE);

const inputStreamPath = __dirname + "/metaPidanaUmum.csv";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dataDaerah = new Map();
    const dataLembaga = new Map();
    const dataKlasifikasi = new Map();
    const dataTahun = new Map();
    const dataPutusanPusat = [];

    await new Promise((resolve, reject) => {
      const inputStream = fs.createReadStream(inputStreamPath, "utf-8");

      inputStream
        .pipe(
          new csvReader({
            parseNumbers: true,
            parseBooleans: true,
            trim: true,
            skipLines: 1,
          })
        )
        .on("data", (item) => {
          try {
            const lembagaName = item[8]?.trim() || "PENGADILAN NEGERI";
            const jenisLembaga = item[9]?.trim() || "PN";
            const klasifikasiName = item[4]?.trim().toLowerCase() || "umum";
            const tahun = parseInt(item[6]) || 2025;
            const kataKunci = item[5]?.trim() || "";
            const nomorPutusan = item[2]?.trim() || "";

            // Daerah - default untuk seeder ini
            const daerahName = "Bojonegoro";
            let daerahId = dataDaerah.get(daerahName)?.id;
            if (!daerahId) {
              daerahId = uuidv4();
              dataDaerah.set(daerahName, {
                id: daerahId,
                nama_daerah: daerahName,
                provinsi: "Jawa Timur",
                wilayah_hukum: "Bojonegoro",
                url_server: "http://localhost:3001",
                created_at: new Date(),
                updated_at: new Date(),
              });
            }

            // Lembaga
            let lembagaId = dataLembaga.get(lembagaName)?.id;
            if (!lembagaId) {
              lembagaId = uuidv4();
              dataLembaga.set(lembagaName, {
                id: lembagaId,
                nama_lembaga: lembagaName,
                jenis_lembaga: jenisLembaga,
                tingkatan: "Pertama",
                id_daerah: daerahId,
                url_api: `http://localhost:3001/api/v1/${jenisLembaga}`,
                api_key: uuidv4(), // Generate unique API key for each lembaga
                created_at: new Date(),
                updated_at: new Date(),
              });
            }

            // Klasifikasi
            let klasifikasiId = dataKlasifikasi.get(klasifikasiName)?.id;
            if (!klasifikasiId) {
              klasifikasiId = uuidv4();
              dataKlasifikasi.set(klasifikasiName, {
                id: klasifikasiId,
                nama: klasifikasiName,
                total_putusan: 0,
                created_at: new Date(),
                updated_at: new Date(),
              });
            }

            // Tahun
            let tahunId = dataTahun.get(tahun)?.id;
            if (!tahunId) {
              tahunId = uuidv4();
              dataTahun.set(tahun, {
                id: tahunId,
                tahun: tahun,
                total_putusan: 0,
                created_at: new Date(),
                updated_at: new Date(),
              });
            }

            // PutusanPusat
            // Gunakan UUID deterministik berbasis nomor putusan supaya id pusat = id daerah
            const putusanId = uuidFromNomor(nomorPutusan);
            dataPutusanPusat.push({
              id: putusanId,
              id_putusan_daerah: putusanId, // sama dengan id (reference ke ServerDaerah)
              id_lembaga: lembagaId,
              nomor_putusan: nomorPutusan,
              id_tahun: tahunId,
              jenis_putusan: item[3]?.trim() || "Pertama",
              kata_kunci: kataKunci,
              id_klasifikasi: klasifikasiId,
              url_detail: item[20]?.trim() || null,
              status_sinkronisasi: "synced",
              tanggal_upload: new Date(),
              created_at: new Date(),
              updated_at: new Date(),
            });
          } catch (err) {
            console.error("Error parsing row:", err);
          }
        })
        .on("end", async () => {
          try {
            console.log("CSV dibaca, mulai insert data...");

            const dataDaerahArr = Array.from(dataDaerah.values());
            const dataLembagaArr = Array.from(dataLembaga.values());
            const dataKlasifikasiArr = Array.from(dataKlasifikasi.values());
            const dataTahunArr = Array.from(dataTahun.values());

            // Count total putusan per klasifikasi
            dataKlasifikasiArr.forEach(klasifikasi => {
              klasifikasi.total_putusan = dataPutusanPusat.filter(
                p => p.id_klasifikasi === klasifikasi.id
              ).length;
            });

            // Count total putusan per tahun
            dataTahunArr.forEach(tahun => {
              tahun.total_putusan = dataPutusanPusat.filter(
                p => p.id_tahun === tahun.id
              ).length;
            });

            await queryInterface.bulkInsert("Daerah", dataDaerahArr);
            console.log("✅ Daerah inserted");

            await queryInterface.bulkInsert("LembagaPeradilan", dataLembagaArr);
            console.log("✅ LembagaPeradilan inserted");

            await queryInterface.bulkInsert("Klasifikasi", dataKlasifikasiArr);
            console.log("✅ Klasifikasi inserted");

            await queryInterface.bulkInsert("Tahun", dataTahunArr);
            console.log("✅ Tahun inserted");

            await queryInterface.bulkInsert("PutusanPusat", dataPutusanPusat);
            console.log("✅ PutusanPusat inserted");

            console.log("🎉 Semua data berhasil diinsert!");
            resolve();
          } catch (err) {
            console.error("❌ Error saat insert ke database:", err);
            reject(err);
          }
        })
        .on("error", (err) => {
          console.error("❌ Error saat membaca CSV:", err);
          reject(err);
        });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("PutusanPusat", null, {});
    await queryInterface.bulkDelete("Tahun", null, {});
    await queryInterface.bulkDelete("Klasifikasi", null, {});
    await queryInterface.bulkDelete("LembagaPeradilan", null, {});
    await queryInterface.bulkDelete("Daerah", null, {});
  },
};
