'use strict';

const { LembagaPeradilan, Daerah } = require(__dirname + '/../../models');

module.exports = {
  // Get all LembagaPeradilan
  getAllLembaga: async (req, res) => {
    try {
      const lembaga = await LembagaPeradilan.findAll({
        include: [
          {
            model: Daerah,
            as: 'daerah',
            attributes: ['id', 'nama_daerah', 'provinsi'],
          },
        ],
        order: [['nama_lembaga', 'ASC']],
      });

      return res.status(200).json({
        error: false,
        message: 'Success',
        data: lembaga,
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

  // Get LembagaPeradilan by ID
  getLembagaById: async (req, res) => {
    const { id } = req.params;
    try {
      const lembaga = await LembagaPeradilan.findByPk(id, {
        include: [
          {
            model: Daerah,
            as: 'daerah',
            attributes: ['id', 'nama_daerah', 'provinsi'],
          },
        ],
      });

      if (!lembaga) {
        return res.status(404).json({
          error: true,
          message: 'Lembaga not found',
          data: null,
        });
      }

      return res.status(200).json({
        error: false,
        message: 'Success',
        data: lembaga,
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

  // Create LembagaPeradilan
  createLembaga: async (req, res) => {
    try {
      const payload = req.body;
      const lembaga = await LembagaPeradilan.create(payload);

      return res.status(201).json({
        error: false,
        message: 'Lembaga created successfully',
        data: lembaga,
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

  // Update LembagaPeradilan
  updateLembaga: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;

      const lembaga = await LembagaPeradilan.findByPk(id);
      if (!lembaga) {
        return res.status(404).json({
          error: true,
          message: 'Lembaga not found',
          data: null,
        });
      }

      await lembaga.update(payload);

      return res.status(200).json({
        error: false,
        message: 'Lembaga updated successfully',
        data: lembaga,
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

  // Delete LembagaPeradilan
  deleteLembaga: async (req, res) => {
    try {
      const { id } = req.params;

      const lembaga = await LembagaPeradilan.findByPk(id);
      if (!lembaga) {
        return res.status(404).json({
          error: true,
          message: 'Lembaga not found',
          data: null,
        });
      }

      await lembaga.destroy();

      return res.status(200).json({
        error: false,
        message: 'Lembaga deleted successfully',
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

  // Get all lembaga with their API keys (for admin only)
  getAllLembagaWithKeys: async (req, res) => {
    try {
      const lembaga = await LembagaPeradilan.findAll({
        include: [
          {
            model: Daerah,
            as: 'daerah',
            attributes: ['id', 'nama_daerah', 'provinsi'],
          },
        ],
        attributes: ['id', 'nama_lembaga', 'jenis_lembaga', 'tingkatan', 'api_key', 'url_api', 'created_at'],
        order: [['nama_lembaga', 'ASC']],
      });

      return res.status(200).json({
        error: false,
        message: 'Success',
        data: lembaga,
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

  // Regenerate API key for a lembaga
  regenerateApiKey: async (req, res) => {
    try {
      const { id } = req.params;
      const { v4: uuidv4 } = require('uuid');

      const lembaga = await LembagaPeradilan.findByPk(id);
      if (!lembaga) {
        return res.status(404).json({
          error: true,
          message: 'Lembaga not found',
          data: null,
        });
      }

      const newApiKey = uuidv4();
      await lembaga.update({ api_key: newApiKey });

      return res.status(200).json({
        error: false,
        message: 'API Key regenerated successfully',
        data: {
          id: lembaga.id,
          nama_lembaga: lembaga.nama_lembaga,
          api_key: newApiKey,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: true,
        message: 'Server Error',
        data: null,
      });
    }
  },};