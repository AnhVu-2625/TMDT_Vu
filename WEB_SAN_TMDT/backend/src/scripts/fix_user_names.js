require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { getPool, sql } = require('../config/database');

const fixes = [
  { ma: 7, ten: 'L\u00EA V\u0103n An' },
  { ma: 8, ten: 'Ph\u1EA1m Th\u1ECB B\u00ECnh' },
  { ma: 9, ten: 'Ho\u00E0ng Minh C\u01B0\u1EDDng' },
  { ma: 10, ten: 'Tr\u1EA7n V\u0103n D\u0169ng' },
  { ma: 11, ten: 'Nguy\u1EC5n Th\u1ECB Em' },
  { ma: 12, ten: 'V\u00F5 V\u0103n Ph\u00FAc' },
  { ma: 13, ten: '\u0110\u1EB7ng Th\u1ECB Giang' },
  { ma: 14, ten: 'B\u00F9i V\u0103n H\u1EA3i' },
  { ma: 15, ten: 'L\u00FD Th\u1ECB H\u1ED3ng'  },
  { ma: 16, ten: 'Nguy\u1EC5n V\u0103n Kh\u00E1nh' },
  { ma: 17, ten: 'Tr\u1EA7n Th\u1ECB Lan' },
  { ma: 18, ten: 'Ph\u1EA1m V\u0103n Minh' },
  { ma: 19, ten: 'L\u00EA Th\u1ECB Nga' },
  { ma: 20, ten: 'Ho\u00E0ng V\u0103n Ph\u01B0\u1EDBc' },
  { ma: 21, ten: '\u0110\u1EB7ng Th\u1ECB Quy\u00EAn' },
  { ma: 22, ten: 'V\u00F5 V\u0103n Sang' },
  { ma: 23, ten: 'B\u00F9i Th\u1ECB Tuy\u1EBFt' },
  { ma: 24, ten: 'L\u00FD V\u0103n \u0110\u1EE9c' },
  { ma: 25, ten: 'Ng\u00F4 Th\u1ECB Vy' },
];

async function main() {
  const pool = await getPool();
  for (const f of fixes) {
    await pool.request()
      .input('ten', sql.NVarChar, f.ten)
      .input('ma', sql.Int, f.ma)
      .query('UPDATE NguoiDung SET HoTen = @ten WHERE MaNguoiDung = @ma');
    console.log('Fixed user', f.ma, '->', f.ten);
  }
  console.log('Done');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
