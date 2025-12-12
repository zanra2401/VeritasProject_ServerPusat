const { SinkronisasiLog, LembagaPeradilan, PutusanPusat, sequelize } = require('../../models');
const axios = require('axios');

module.exports = {
  // Get sync history dengan filter
  getSyncHistory: async (req, res) => {
    try {
      const { 
        lembaga_id, 
        status, 
        tipe_operasi,
        page = 1, 
        limit = 20 
      } = req.query;

      console.log('[SYNC HISTORY] Query params:', { lembaga_id, status, tipe_operasi, page, limit });

      const where = {};
      if (lembaga_id) where.id_lembaga = lembaga_id;
      if (status) where.status = status;
      if (tipe_operasi) where.tipe_operasi = tipe_operasi.toUpperCase(); // Pastikan uppercase

      console.log('[SYNC HISTORY] Where clause:', where);

      const offset = (page - 1) * limit;

      // Check if table exists first
      const tableCheck = await sequelize.query(
        "SELECT to_regclass('public.\"SinkronisasiLog\"') as table_exists",
        { type: sequelize.QueryTypes.SELECT }
      );

      console.log('[SYNC HISTORY] Table check:', tableCheck);

      const { count, rows } = await SinkronisasiLog.findAndCountAll({
        where,
        include: [
          {
            model: LembagaPeradilan,
            as: 'lembaga',
            attributes: ['id', 'nama_lembaga', 'jenis_lembaga'],
            required: false, // LEFT JOIN instead of INNER JOIN
          },
          {
            model: PutusanPusat,
            as: 'putusan',
            attributes: ['id', 'nomor_putusan'],
            required: false, // LEFT JOIN
          },
        ],
        order: [['waktu_sync', 'DESC']],
        limit: parseInt(limit),
        offset,
      });

      console.log('[SYNC HISTORY] Found:', count, 'records');

      return res.status(200).json({
        error: false,
        message: 'Success',
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (err) {
      console.error('[SYNC HISTORY ERROR]', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      if (err.parent) {
        console.error('SQL Error:', err.parent.message);
        console.error('SQL Query:', err.parent.sql);
      }
      console.error('Stack:', err.stack);
      return res.status(500).json({
        error: true,
        message: 'Server Error',
        details: err.message, // Include error details for debugging
        sql: err.parent?.message || null,
        data: null,
      });
    }
  },

  // Get failed syncs untuk resync
  getFailedSyncs: async (req, res) => {
    try {
      const { lembaga_id } = req.query;

      const where = { status: 'ERROR' };
      if (lembaga_id) where.id_lembaga = lembaga_id;

      const failedSyncs = await SinkronisasiLog.findAll({
        where,
        include: [
          {
            model: LembagaPeradilan,
            as: 'lembaga',
            attributes: ['id', 'nama_lembaga', 'url_api', 'api_key'],
          },
        ],
        order: [['waktu_sync', 'DESC']],
      });

      return res.status(200).json({
        error: false,
        message: 'Success',
        data: failedSyncs,
        total: failedSyncs.length,
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

  // Resync putusan yang gagal
  resyncPutusan: async (req, res) => {
    const { id_putusan_daerah, id_lembaga } = req.body;

    try {
      // Fetch lembaga info
      const lembaga = await LembagaPeradilan.findByPk(id_lembaga);
      if (!lembaga) {
        return res.status(404).json({
          error: true,
          message: 'Lembaga not found',
          data: null,
        });
      }

      if (!lembaga.url_api || !lembaga.api_key) {
        return res.status(400).json({
          error: true,
          message: 'Lembaga belum memiliki konfigurasi API',
          data: null,
        });
      }

      console.log(`[RESYNC] Fetching putusan ${id_putusan_daerah} from ${lembaga.nama_lembaga}`);

      // Fetch putusan dari ServerDaerah
      const daerahResponse = await axios({
        method: 'GET',
        url: `${lembaga.url_api}/putusan/${id_putusan_daerah}`,
        headers: {
          'x-api-key': lembaga.api_key,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const putusanData = daerahResponse.data?.data || daerahResponse.data;

      // Check if already exists in Pusat
      let putusan = await PutusanPusat.findOne({
        where: { id_putusan_daerah },
      });

      let operasi;
      if (putusan) {
        // UPDATE
        await putusan.update({
          nomor_putusan: putusanData.nomor,
          tanggal_putusan: putusanData.tanggal_putusan,
          tanggal_upload: putusanData.tanggal_upload || new Date(),
          id_lembaga: lembaga.id,
          jenis_putusan: putusanData.jenis_putusan || putusanData.amar_lainya,
        });
        operasi = 'UPDATE';
        console.log(`[RESYNC] Updated putusan ${id_putusan_daerah}`);
      } else {
        // CREATE
        putusan = await PutusanPusat.create({
          id_putusan_daerah,
          nomor_putusan: putusanData.nomor,
          tanggal_putusan: putusanData.tanggal_putusan,
          tanggal_upload: putusanData.tanggal_upload || new Date(),
          id_lembaga: lembaga.id,
          jenis_putusan: putusanData.jenis_putusan || putusanData.amar_lainya,
        });
        operasi = 'CREATE';
        console.log(`[RESYNC] Created putusan ${id_putusan_daerah}`);
      }

      // Log successful resync
      await SinkronisasiLog.create({
        id_lembaga: lembaga.id,
        id_putusan_daerah,
        id_putusan_pusat: putusan.id,
        tipe_operasi: operasi,
        waktu_sync: new Date(),
        status: 'SUCCESS',
        jumlah_data: 1,
        pesan_error: null,
      });

      return res.status(200).json({
        error: false,
        message: 'Resync successful',
        data: {
          id_putusan_pusat: putusan.id,
          id_putusan_daerah,
          operasi,
        },
      });
    } catch (err) {
      console.error('[RESYNC ERROR]', err);

      // Log failed resync
      try {
        await SinkronisasiLog.create({
          id_lembaga,
          id_putusan_daerah,
          id_putusan_pusat: null,
          tipe_operasi: 'RESYNC',
          waktu_sync: new Date(),
          status: 'ERROR',
          jumlah_data: 0,
          pesan_error: err.message,
        });
      } catch (logErr) {
        console.error('[LOG ERROR]', logErr);
      }

      return res.status(500).json({
        error: true,
        message: 'Resync failed: ' + err.message,
        data: null,
      });
    }
  },

  // Bulk resync untuk multiple putusan
  bulkResync: async (req, res) => {
    const { syncs } = req.body; // Array of { id_putusan_daerah, id_lembaga }

    if (!Array.isArray(syncs) || syncs.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'syncs array is required',
        data: null,
      });
    }

    const results = {
      success: [],
      failed: [],
    };

    for (const sync of syncs) {
      try {
        const lembaga = await LembagaPeradilan.findByPk(sync.id_lembaga);
        if (!lembaga) {
          results.failed.push({
            id_putusan_daerah: sync.id_putusan_daerah,
            error: 'Lembaga not found',
          });
          continue;
        }

        const daerahResponse = await axios({
          method: 'GET',
          url: `${lembaga.url_api}/putusan/${sync.id_putusan_daerah}`,
          headers: {
            'x-api-key': lembaga.api_key,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });

        const putusanData = daerahResponse.data?.data || daerahResponse.data;

        let putusan = await PutusanPusat.findOne({
          where: { id_putusan_daerah: sync.id_putusan_daerah },
        });

        let operasi;
        if (putusan) {
          await putusan.update({
            nomor_putusan: putusanData.nomor,
            tanggal_putusan: putusanData.tanggal_putusan,
            tanggal_upload: putusanData.tanggal_upload || new Date(),
            id_lembaga: lembaga.id,
            jenis_putusan: putusanData.jenis_putusan || putusanData.amar_lainya,
          });
          operasi = 'UPDATE';
        } else {
          putusan = await PutusanPusat.create({
            id_putusan_daerah: sync.id_putusan_daerah,
            nomor_putusan: putusanData.nomor,
            tanggal_putusan: putusanData.tanggal_putusan,
            tanggal_upload: putusanData.tanggal_upload || new Date(),
            id_lembaga: lembaga.id,
            jenis_putusan: putusanData.jenis_putusan || putusanData.amar_lainya,
          });
          operasi = 'CREATE';
        }

        await SinkronisasiLog.create({
          id_lembaga: lembaga.id,
          id_putusan_daerah: sync.id_putusan_daerah,
          id_putusan_pusat: putusan.id,
          tipe_operasi: operasi,
          waktu_sync: new Date(),
          status: 'SUCCESS',
          jumlah_data: 1,
          pesan_error: null,
        });

        results.success.push({
          id_putusan_daerah: sync.id_putusan_daerah,
          id_putusan_pusat: putusan.id,
          operasi,
        });
      } catch (err) {
        console.error(`[BULK RESYNC ERROR] ${sync.id_putusan_daerah}:`, err.message);

        await SinkronisasiLog.create({
          id_lembaga: sync.id_lembaga,
          id_putusan_daerah: sync.id_putusan_daerah,
          id_putusan_pusat: null,
          tipe_operasi: 'RESYNC',
          waktu_sync: new Date(),
          status: 'ERROR',
          jumlah_data: 0,
          pesan_error: err.message,
        });

        results.failed.push({
          id_putusan_daerah: sync.id_putusan_daerah,
          error: err.message,
        });
      }
    }

    return res.status(200).json({
      error: false,
      message: 'Bulk resync completed',
      data: {
        total: syncs.length,
        success: results.success.length,
        failed: results.failed.length,
        results,
      },
    });
  },
};
