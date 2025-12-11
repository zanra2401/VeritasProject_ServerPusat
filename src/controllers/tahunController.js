'use strict';

const { Tahun } = require(__dirname + '/../../models');

module.exports = {
  // Get all Tahun
  getAllTahun: async (req, res) => {
    try {
      const tahun = await Tahun.findAll({
        order: [['tahun', 'DESC']],
      });

      return res.status(200).json({
        error: false,
        message: 'Success',
        data: tahun,
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

  // Get Tahun by ID
  getTahunById: async (req, res) => {
    const { id } = req.params;
    try {
      const tahun = await Tahun.findByPk(id);

      if (!tahun) {
        return res.status(404).json({
          error: true,
          message: 'Tahun not found',
          data: null,
        });
      }

      return res.status(200).json({
        error: false,
        message: 'Success',
        data: tahun,
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

  // Create Tahun
  createTahun: async (req, res) => {
    try {
      const { tahun } = req.body;
      const tahunRecord = await Tahun.create({ tahun });

      return res.status(201).json({
        error: false,
        message: 'Tahun created successfully',
        data: tahunRecord,
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

  // Update Tahun
  updateTahun: async (req, res) => {
    try {
      const { id } = req.params;
      const { tahun } = req.body;

      const tahunRecord = await Tahun.findByPk(id);
      if (!tahunRecord) {
        return res.status(404).json({
          error: true,
          message: 'Tahun not found',
          data: null,
        });
      }

      await tahunRecord.update({ tahun });

      return res.status(200).json({
        error: false,
        message: 'Tahun updated successfully',
        data: tahunRecord,
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

  // Delete Tahun
  deleteTahun: async (req, res) => {
    try {
      const { id } = req.params;

      const tahunRecord = await Tahun.findByPk(id);
      if (!tahunRecord) {
        return res.status(404).json({
          error: true,
          message: 'Tahun not found',
          data: null,
        });
      }

      await tahunRecord.destroy();

      return res.status(200).json({
        error: false,
        message: 'Tahun deleted successfully',
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
