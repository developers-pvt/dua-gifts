const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgres://postgres:password@localhost:5433/medusa_db',
  });
  await client.connect();

  const keyId = 'apk_giftstudio_web_key';
  const scRes = await client.query('SELECT id FROM sales_channel LIMIT 1');
  const scId = scRes.rows[0].id;
  const now = new Date();

  await client.query(`
    INSERT INTO publishable_api_key_sales_channel (id, publishable_key_id, sales_channel_id, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5)
  `, [`pk_sc_${Date.now()}`, keyId, scId, now, now]);

  console.log("Successfully linked publishable key to sales channel!");
  await client.end();
}

main().catch(console.error);
