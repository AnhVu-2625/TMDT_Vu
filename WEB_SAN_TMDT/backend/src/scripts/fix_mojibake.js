require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { getPool } = require('../config/database');

async function fix() {
  const pool = await getPool();
  const fixes = [
    {
      ma: 27, ten: 'Apple AirPods Max',
      moTa: 'Tai nghe ch\u1EE5p \u0111\u1EA7u Apple AirPods Max, chip H1, ch\u1ED1ng \u1ED3n ch\u1EE7 \u0111\u1ED9ng, \u00E2m thanh kh\u00F4ng gian Spatial Audio, khung th\u00E9p kh\u00F4ng g\u1EC9, pin 20 gi\u1EDD'
    },
    {
      ma: 26, ten: 'SSD Samsung 870 EVO 2TB',
      moTa: 'SSD Samsung 870 EVO 2.5 inch SATA III, \u0111\u1ECDc 560MB/s, ghi 530MB/s, b\u1EA3o h\u00E0nh 5 n\u0103m, dung l\u01B0\u1EE3ng 2TB l\u01B0u tr\u1EEF'
    },
    {
      ma: 25, ten: 'Apple Mac Mini M4',
      moTa: 'Mac Mini chip Apple M4, CPU 10-core GPU 10-core, RAM 16GB, SSD 256GB, hai c\u1ED5ng Thunderbolt 4, HDMI, Ethernet'
    }
  ];
  for (const f of fixes) {
    const r = await pool.request()
      .input('ten', f.ten)
      .input('moTa', f.moTa)
      .input('ma', f.ma)
      .query('UPDATE SanPham SET TenSanPham = @ten, MoTa = @moTa WHERE MaSanPham = @ma');
    console.log(`Fixed product ${f.ma}: ${r.rowsAffected[0]} row(s)`);
  }
  console.log('Done');
  process.exit(0);
}

fix().catch(err => { console.error(err); process.exit(1); });
