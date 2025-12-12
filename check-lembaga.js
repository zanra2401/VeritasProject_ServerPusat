// Test script to check lembaga and create if not exists
const { LembagaPeradilan, Daerah } = require('./models');

async function checkAndCreateLembaga() {
  try {
    console.log('🔍 Checking for lembaga PNBJN...');
    
    const lembaga = await LembagaPeradilan.findOne({
      where: { kode_lembaga: 'PNBJN' }
    });

    if (lembaga) {
      console.log('✅ Lembaga PNBJN found:');
      console.log(JSON.stringify(lembaga.toJSON(), null, 2));
    } else {
      console.log('❌ Lembaga PNBJN NOT found');
      console.log('Creating lembaga PNBJN...');

      // Check if Bojonegoro daerah exists
      let daerah = await Daerah.findOne({
        where: { nama_daerah: 'Bojonegoro' }
      });

      if (!daerah) {
        console.log('Creating Bojonegoro daerah first...');
        daerah = await Daerah.create({
          nama_daerah: 'Bojonegoro',
          provinsi: 'Jawa Timur',
          wilayah_hukum: 'Bojonegoro dan sekitarnya'
        });
        console.log('✅ Daerah created:', daerah.id);
      }

      // Create lembaga
      const newLembaga = await LembagaPeradilan.create({
        kode_lembaga: 'PNBJN',
        nama_lembaga: 'Pengadilan Negeri Bojonegoro',
        jenis_lembaga: 'Pengadilan Negeri',
        tingkatan: 'Tingkat Pertama',
        id_daerah: daerah.id,
        url_api: 'http://localhost:8989',
        api_key: '96b1553a32a01b7bdb1d7618c06117c2fc2e46bd9ff59e996cf0e666b3e2823d'
      });

      console.log('✅ Lembaga PNBJN created:');
      console.log(JSON.stringify(newLembaga.toJSON(), null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAndCreateLembaga();
