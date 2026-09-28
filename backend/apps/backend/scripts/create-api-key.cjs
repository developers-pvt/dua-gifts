const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgres://postgres:password@localhost:5433/medusa_db',
  });

  await client.connect();

  const userRes = await client.query('SELECT id, email FROM "user" LIMIT 1');
  const userId = userRes.rows[0]?.id || 'usr_admin_1';
  console.log("Admin User ID:", userId);

  const scRes = await client.query('SELECT id, name FROM sales_channel LIMIT 1');
  const salesChannelId = scRes.rows[0]?.id;
  console.log("Sales Channel ID:", salesChannelId);

  const keyToken = 'pk_giftstudio_web_99182';
  const keyId = 'apk_giftstudio_web_key';
  const now = new Date();

  await client.query(`
    INSERT INTO api_key (id, token, salt, redacted, title, type, created_by, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE SET token = EXCLUDED.token
  `, [keyId, keyToken, 'testsalt', 'pk_gift...9182', 'Gift Studio Web Storefront Key', 'publishable', userId, now, now]);
  console.log("Inserted publishable key:", keyToken);

  if (salesChannelId) {
    await client.query(`
      INSERT INTO publishable_api_key_sales_channel (id, api_key_id, sales_channel_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
    `, ['pk_sc_1', keyId, salesChannelId, now, now]);
    console.log("Linked to sales channel:", salesChannelId);
  }

  await client.end();
}

main().catch(err => {
  console.error("ERROR:", err);
  process.exit(1);
});
