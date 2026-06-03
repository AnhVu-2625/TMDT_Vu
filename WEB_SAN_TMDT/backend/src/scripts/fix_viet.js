require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { getPool, sql, closePool } = require('../config/database');

const shopDescs = {
    5:  'Th\u1EDDi trang nam n\u1EEF cao c\u1EA5p - H\u00E0ng ch\u00EDnh h\u00E3ng, xu h\u01B0\u1EDBng m\u1EDBi nh\u1EA5t',
    6:  'N\u1ED9i th\u1EA5t v\u00E0 \u0111\u1ED3 d\u00F9ng gia \u0111\u00ECnh - \u0110\u1EB9p, b\u1EC1n, gi\u00E1 t\u1ED1t',
    7:  'Nh\u00E0 s\u00E1ch online - S\u00E1ch hay m\u1ED7i ng\u00E0y, tri th\u1EE9c b\u1EA5t t\u1EADn',
    8:  'M\u1EF9 ph\u1EA9m ch\u00EDnh h\u00E3ng H\u00E0n Qu\u1ED1c - Ch\u0103m s\u00F3c da to\u00E0n di\u1EC7n',
    9:  'Gaming gear v\u00E0 ph\u1EE5 ki\u1EC7n c\u00F4ng ngh\u1EC7 - D\u00E0nh cho game th\u1EE7',
    10: 'Th\u1EF1c ph\u1EA9m s\u1EA1ch - Organic - \u0110\u1EB7c s\u1EA3n v\u00F9ng mi\u1EC1n',
    11: 'D\u1EE5ng c\u1EE5 th\u1EC3 thao ch\u00EDnh h\u00E3ng - Nike, Adidas, Puma',
    12: 'M\u00E1y - Gia d\u1EE5ng ch\u00EDnh h\u00E3ng - T\u1EE7 l\u1EA1nh, m\u00E1y gi\u1EB7t, TV',
    13: 'Ph\u1EE5 ki\u1EC7n th\u00FA c\u01B0ng - Th\u1EE9c \u0103n, \u0111\u1ED3 ch\u01A1i cho ch\u00F3 m\u00E8o',
};

async function fix() {
    const pool = await getPool();
    
    for (const [id, desc] of Object.entries(shopDescs)) {
        await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('desc', sql.NVarChar, desc)
            .query('UPDATE CuaHang SET MoTa = @desc WHERE MaCuaHang = @id');
        console.log('Fixed shop ' + id);
    }
    
    await closePool();
    console.log('All done!');
}

fix().catch(console.error);