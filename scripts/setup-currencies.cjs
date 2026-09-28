const { Client } = require('../backend/apps/backend/node_modules/pg');

async function main() {
  const client = new Client({
    connectionString: 'postgres://postgres:password@localhost:5433/medusa_db'
  });
  await client.connect();

  const toInsert = [
    { code: 'pkr', symbol: 'Rs.', symbol_native: 'Rs.', name: 'Pakistani Rupee', decimal_digits: 0 },
    { code: 'usd', symbol: '$', symbol_native: '$', name: 'US Dollar', decimal_digits: 2 },
    { code: 'eur', symbol: 'EUR', symbol_native: 'EUR', name: 'Euro', decimal_digits: 2 },
    { code: 'gbp', symbol: 'GBP', symbol_native: 'GBP', name: 'British Pound', decimal_digits: 2 },
    { code: 'aed', symbol: 'AED', symbol_native: 'AED', name: 'UAE Dirham', decimal_digits: 2 },
    { code: 'sar', symbol: 'SAR', symbol_native: 'SAR', name: 'Saudi Riyal', decimal_digits: 2 }
  ];

  for (const c of toInsert) {
    try {
      await client.query(`
        INSERT INTO currency (code, symbol, symbol_native, name, decimal_digits, rounding, raw_rounding, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, 0, '{"value":"0","precision":20}', NOW(), NOW())
        ON CONFLICT (code) DO UPDATE SET symbol = $2, symbol_native = $3, name = $4;
      `, [c.code, c.symbol, c.symbol_native, c.name, c.decimal_digits]);
      console.log(`Configured currency: ${c.code}`);
    } catch (e) {
      console.error(`Error with ${c.code}:`, e.message);
    }
  }

  // Also check regions
  const regions = await client.query("SELECT id, name, currency_code FROM region;");
  console.log('Current regions:', regions.rows);

  // If there's a region, let's create a Pakistan region or update Europe
  const pkRegion = await client.query("SELECT id FROM region WHERE currency_code = 'pkr';");
  if (pkRegion.rows.length === 0) {
    const regId = 'reg_pakistan_' + Date.now();
    await client.query(`
      INSERT INTO region (id, name, currency_code, created_at, updated_at)
      VALUES ($1, 'Pakistan (PKR)', 'pkr', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `, [regId]);
    console.log('Created Pakistan region:', regId);
  }

  await client.end();
}

main().catch(console.error);
