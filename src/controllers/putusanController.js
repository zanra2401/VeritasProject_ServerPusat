'use strict';

const { PutusanPusat, Klasifikasi, Tahun, LembagaPeradilan, Daerah } = require(__dirname + '/../../models');
const { Op } = require('sequelize');
const axios = require('axios');

module.exports = {
  // Get all PutusanPusat with filtering, searching, and pagination
  getAllPutusan: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        id_lembaga = '',
        id_tahun = '',
        id_klasifikasi = '',
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Search by kata_kunci or nomor_putusan
      if (search) {
        where[Op.or] = [
          { kata_kunci: { [Op.iLike]: `%${search}%` } },
          { nomor_putusan: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Filter by lembaga
      if (id_lembaga) {
        where.id_lembaga = id_lembaga;
      }

      // Filter by tahun
      if (id_tahun) {
        where.id_tahun = id_tahun;
      }

      // Filter by klasifikasi
      if (id_klasifikasi) {
        where.id_klasifikasi = id_klasifikasi;
      }

      const { count, rows } = await PutusanPusat.findAndCountAll({
        where,
        include: [
          {
            model: Klasifikasi,
            as: 'klasifikasi',
            attributes: ['id', 'nama', 'total_putusan'],
          },
          {
            model: Tahun,
            as: 'tahun',
            attributes: ['id', 'tahun', 'total_putusan'],
          },
          {
            model: LembagaPeradilan,
            as: 'lembaga',
            attributes: ['id', 'nama_lembaga', 'jenis_lembaga', 'tingkatan', 'url_api', 'api_key'],
            include: [
              {
                model: Daerah,
                as: 'daerah',
                attributes: ['id', 'nama_daerah', 'provinsi'],
              },
            ],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
      });

      return res.status(200).json({
        error: false,
        message: 'Success',
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: true,
        message: 'Server Error',
        data: [],
      });
    }
  },

  // Get PutusanPusat by ID dengan proxy ke ServerDaerah
  getPutusanById: async (req, res) => {
    const { id } = req.params;
    try {
      // STEP 1: Fetch metadata dari database ServerPusat
      const putusan = await PutusanPusat.findByPk(id, {
        include: [
          {
            model: Klasifikasi,
            as: 'klasifikasi',
            attributes: ['id', 'nama', 'total_putusan'],
          },
          {
            model: Tahun,
            as: 'tahun',
            attributes: ['id', 'tahun', 'total_putusan'],
          },
          {
            model: LembagaPeradilan,
            as: 'lembaga',
            attributes: ['id', 'nama_lembaga', 'jenis_lembaga', 'tingkatan', 'url_api', 'api_key'],
            include: [
              {
                model: Daerah,
                as: 'daerah',
                attributes: ['id', 'nama_daerah', 'provinsi'],
              },
            ],
          },
        ],
      });

      if (!putusan) {
        return res.status(404).json({
          error: true,
          message: 'Putusan not found',
          data: null,
        });
      }
      
      // STEP 2: Proxy request ke ServerDaerah untuk detail lengkap
      let daerahData = null;
      let daerahError = null;

      try {
        const lembaga = putusan.lembaga;
        console.log(lembaga.id_putusan_daerah);
        if (lembaga && lembaga.url_api && putusan.id_putusan_daerah) {
          console.log(`[PROXY] Fetching detail from ${lembaga.nama_lembaga} - ${lembaga.url_api}`);
          console.log(lembaga.api_key)
          const daerahResponse = await axios({
            method: 'GET',
            url: `${lembaga.url_api}/putusan/${putusan.id_putusan_daerah}`,
            headers: {
              'x-api-key': lembaga.api_key,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          });

          daerahData = daerahResponse.data?.data || daerahResponse.data;
          console.log(`[PROXY] Success - Got detail from ServerDaerah`);
        }
      } catch (err) {
        console.log(err);
        console.warn(`[PROXY] Failed to fetch from ServerDaerah:`, err.message);
        daerahError = err.message;
        // Continue with Pusat data only (graceful fallback)
      }

      console.log(`daerahData:`, daerahData);
      // STEP 3: Merge data dari Pusat dan Daerah
      const mergedData = {
        ...putusan.toJSON(),
        ...(daerahData && {
          amar_putusan: daerahData.amar_putusan,
          hakim_ketua: daerahData.hakim_ketua,
          hakim_anggota: daerahData.hakim_anggota,
          penuntut_umum: daerahData.penuntut_umum,
          panitera: daerahData.panitera,
          terdakwa: daerahData.terdakwa,
          kata_kunci_detail: daerahData.kata_kunci,
          url_dokumen: daerahData.url_dokumen,
          jenis_putusan: daerahData.jenis_putusan || putusan.jenis_putusan,
        }),
      };



      return res.status(200).json({
        error: false,
        message: 'Success',
        data: mergedData,
        ...(daerahError && { 
          warning: `Detail dari ServerDaerah tidak tersedia, menampilkan data dari ServerPusat saja` 
        }),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: true,
        message: 'Server Error',
        data: null,
      });
    }
  },

  // Create PutusanPusat
  createPutusan: async (req, res) => {
    try {
      const payload = req.body;
      const putusan = await PutusanPusat.create(payload);

      // Update counters
      if (payload.id_klasifikasi) {
        await Klasifikasi.increment('total_putusan', {
          where: { id: payload.id_klasifikasi },
        });
      }

      if (payload.id_tahun) {
        await Tahun.increment('total_putusan', {
          where: { id: payload.id_tahun },
        });
      }

      return res.status(201).json({
        error: false,
        message: 'Putusan created successfully',
        data: putusan,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: true,
        message: 'Server Error',
        data: null,
      });
    }
  },

  // Update PutusanPusat
  updatePutusan: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;

      const putusan = await PutusanPusat.findByPk(id);
      if (!putusan) {
        return res.status(404).json({
          error: true,
          message: 'Putusan not found',
          data: null,
        });
      }

      // Track old values for counter updates
      const oldKlasifikasiId = putusan.id_klasifikasi;
      const oldTahunId = putusan.id_tahun;

      await putusan.update(payload);

      // Update counters if klasifikasi changed
      if (payload.id_klasifikasi && oldKlasifikasiId !== payload.id_klasifikasi) {
        if (oldKlasifikasiId) {
          await Klasifikasi.decrement('total_putusan', {
            where: { id: oldKlasifikasiId },
          });
        }
        await Klasifikasi.increment('total_putusan', {
          where: { id: payload.id_klasifikasi },
        });
      }

      // Update counters if tahun changed
      if (payload.id_tahun && oldTahunId !== payload.id_tahun) {
        if (oldTahunId) {
          await Tahun.decrement('total_putusan', {
            where: { id: oldTahunId },
          });
        }
        await Tahun.increment('total_putusan', {
          where: { id: payload.id_tahun },
        });
      }

      return res.status(200).json({
        error: false,
        message: 'Putusan updated successfully',
        data: putusan,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: true,
        message: 'Server Error',
        data: null,
      });
    }
  },

  // Delete PutusanPusat
  deletePutusan: async (req, res) => {
    try {
      const { id } = req.params;

      const putusan = await PutusanPusat.findByPk(id);
      if (!putusan) {
        return res.status(404).json({
          error: true,
          message: 'Putusan not found',
          data: null,
        });
      }

      // Decrement counters before deletion
      if (putusan.id_klasifikasi) {
        await Klasifikasi.decrement('total_putusan', {
          where: { id: putusan.id_klasifikasi },
        });
      }

      if (putusan.id_tahun) {
        await Tahun.decrement('total_putusan', {
          where: { id: putusan.id_tahun },
        });
      }

      await putusan.destroy();

      return res.status(200).json({
        error: false,
        message: 'Putusan deleted successfully',
        data: null,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: true,
        message: 'Server Error',
        data: null,
      });
    }
  },
};
