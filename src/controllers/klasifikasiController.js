'use strict';

const { Klasifikasi } = require(__dirname + '/../../models');

module.exports = {
  // Get all Klasifikasi
  getAllKlasifikasi: async (req, res) => {
    try {
      const klasifikasi = await Klasifikasi.findAll({
        order: [['nama', 'ASC']],
      });

      return res.status(200).json({
        error: false,
        message: 'Success',
        data: klasifikasi,
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

  // Get Klasifikasi by ID
  getKlasifikasiById: async (req, res) => {
    const { id } = req.params;
    try {
      const klasifikasi = await Klasifikasi.findByPk(id);

      if (!klasifikasi) {
        return res.status(404).json({
          error: true,
          message: 'Klasifikasi not found',
          data: null,
        });
      }

      return res.status(200).json({
        error: false,
        message: 'Success',
        data: klasifikasi,
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

  // Create Klasifikasi
  createKlasifikasi: async (req, res) => {
    try {
      const { nama } = req.body;
      const klasifikasi = await Klasifikasi.create({ nama });

      return res.status(201).json({
        error: false,
        message: 'Klasifikasi created successfully',
        data: klasifikasi,
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

  // Update Klasifikasi
  updateKlasifikasi: async (req, res) => {
    try {
      const { id } = req.params;
      const { nama } = req.body;

      const klasifikasi = await Klasifikasi.findByPk(id);
      if (!klasifikasi) {
        return res.status(404).json({
          error: true,
          message: 'Klasifikasi not found',
          data: null,
        });
      }

      await klasifikasi.update({ nama });

      return res.status(200).json({
        error: false,
        message: 'Klasifikasi updated successfully',
        data: klasifikasi,
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

  // Delete Klasifikasi
  deleteKlasifikasi: async (req, res) => {
    try {
      const { id } = req.params;

      const klasifikasi = await Klasifikasi.findByPk(id);
      if (!klasifikasi) {
        return res.status(404).json({
          error: true,
          message: 'Klasifikasi not found',
          data: null,
        });
      }

      await klasifikasi.destroy();

      return res.status(200).json({
        error: false,
        message: 'Klasifikasi deleted successfully',
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
