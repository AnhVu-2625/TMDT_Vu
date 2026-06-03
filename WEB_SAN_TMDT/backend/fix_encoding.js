const sql = require('mssql');
const config = {
  server: 'localhost', user: 'sa', password: '12345',
  database: 'ThuongMaiDienTu', port: 1433,
  options: { encrypt: false, trustServerCertificate: true },
  connectionTimeout: 10000
};

// Fix mapping: garbled -> correct Vietnamese
const fixes = {
  'NguoiDung': {
    nameCol: 'HoTen',
    fixes: {
      "LÃª Thá»‹ Fashion": "Lê Thị Fashion",
      "Pháº¡m VÄƒn Home": "Phạm Văn Home"
    }
  },
  'CuaHang': {
    nameCol: 'TenCuaHang',
    fixes: {
      "Lá»§ng": "Lủng"
    }
  }
};

async function fixEncoding() {
  const pool = await sql.connect(config);
  
  for (const [table, info] of Object.entries(fixes)) {
    for (const [bad, good] of Object.entries(info.fixes)) {
      const r = await pool.request()
        .input('bad', sql.NVarChar, bad)
        .input('good', sql.NVarChar, good)
        .query(`UPDATE ${table} SET ${info.nameCol} = @good WHERE ${info.nameCol} = @bad`);
      console.log(`  ${table}: "${bad}" -> "${good}" (${r.rowsAffected[0]} rows)`);
    }
  }

  // Verify
  console.log('\n=== VERIFICATION ===');
  const users = await pool.request().query('SELECT MaNguoiDung, HoTen, Email FROM NguoiDung');
  users.recordset.forEach(u => console.log(`  ${u.MaNguoiDung}: ${u.HoTen} <${u.Email}>`));
  
  const shops = await pool.request().query('SELECT MaCuaHang, TenCuaHang FROM CuaHang');
  shops.recordset.forEach(s => console.log(`  ${s.MaCuaHang}: ${s.TenCuaHang}`));

  await pool.close();
}

fixEncoding().catch(e => console.error('ERR:', e.message));
