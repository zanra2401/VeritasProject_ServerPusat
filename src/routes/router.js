'use strict';

const express = require('express');
const router = express.Router();
const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

const putusanController = require('../controllers/putusanController');
const klasifikasiController = require('../controllers/klasifikasiController');
const tahunController = require('../controllers/tahunController');
const lembagaController = require('../controllers/lembagaController');

// Apply API key middleware to all routes
router.use(apiKeyMiddleware);

// Putusan routes
router.get('/putusan', putusanController.getAllPutusan);
router.get('/putusan/:id', putusanController.getPutusanById);
router.post('/putusan', putusanController.createPutusan);
router.put('/putusan/:id', putusanController.updatePutusan);
router.delete('/putusan/:id', putusanController.deletePutusan);

// Klasifikasi routes (for filter options)
router.get('/klasifikasi', klasifikasiController.getAllKlasifikasi);
router.get('/klasifikasi/:id', klasifikasiController.getKlasifikasiById);
router.post('/klasifikasi', klasifikasiController.createKlasifikasi);
router.put('/klasifikasi/:id', klasifikasiController.updateKlasifikasi);
router.delete('/klasifikasi/:id', klasifikasiController.deleteKlasifikasi);

// Tahun routes (for filter options)
router.get('/tahun', tahunController.getAllTahun);
router.get('/tahun/:id', tahunController.getTahunById);
router.post('/tahun', tahunController.createTahun);
router.put('/tahun/:id', tahunController.updateTahun);
router.delete('/tahun/:id', tahunController.deleteTahun);

// Lembaga routes (for filter options)
router.get('/lembaga', lembagaController.getAllLembaga);
router.get('/lembaga/:id', lembagaController.getLembagaById);
router.post('/lembaga', lembagaController.createLembaga);
router.put('/lembaga/:id', lembagaController.updateLembaga);
router.delete('/lembaga/:id', lembagaController.deleteLembaga);

// Admin routes for API key management
router.get('/lembaga-keys', lembagaController.getAllLembagaWithKeys);
router.post('/lembaga/:id/regenerate-key', lembagaController.regenerateApiKey);

module.exports = router;
