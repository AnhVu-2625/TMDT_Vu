require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { getPool } = require('../config/database');

async function main() {
  const p = await getPool();
  
  // SanPham columns
  const r1 = await p.request().query("SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SanPham'");
  console.log('SanPham columns:');
  r1.recordset.forEach(c => console.log(' ', c.COLUMN_NAME, c.DATA_TYPE, c.IS_NULLABLE, 'default:', c.COLUMN_DEFAULT));
  
  // DanhSachYeuThich FK
  const r2 = await p.request().query(`
    SELECT OBJECT_NAME(fk.parent_object_id) as TableName, 
           COL_NAME(fkc.parent_object_id, fkc.parent_column_id) as ColumnName,
           OBJECT_NAME(fk.referenced_object_id) as RefTable,
           COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) as RefColumn
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    WHERE OBJECT_NAME(fk.parent_object_id) = 'DanhSachYeuThich'
  `);
  console.log('\nDanhSachYeuThich FK:');
  r2.recordset.forEach(c => console.log(' ', c.ColumnName, '->', c.RefTable + '.' + c.RefColumn));

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
