import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: path.resolve(process.cwd(), '.pgdata'),
    port: 5433,
    user: 'postgres',
    password: 'password',
  });

  const client = await pg.getPgClient();

  // Check sales channels
  const scRes = await client.query("SELECT id FROM sales_channel LIMIT 1");
  const salesChannelId = scRes.rows[0]?.id;
  console.log("Sales Channel ID:", salesChannelId);

  // Check existing keys
  const existingKey = await client.query("SELECT * FROM api_key WHERE type = 'publishable'");
  if (existingKey.rows.length > 0) {
    console.log("Existing publishable key:", existingKey.rows[0].token);
    await client.end();
    return;
  }

  const keyId = `pk_${Date.now()}`;
  const token = `pk_giftstudio_test_key_12345`;
  const now = new Date();

  await client.query(
    `INSERT INTO api_key (id, token, salt, title, type, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [keyId, token, 'testsalt', 'Gift Studio Web Storefront', 'publishable', now, now]
  );

  if (salesChannelId) {
    await client.query(
      `INSERT INTO publishable_api_key_sales_channel (id, api_key_id, sales_channel_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
      [`pk_sc_${Date.now()}`, keyId, salesChannelId, now, now]
    );
  }

  console.log("Created publishable key:", token);
  await client.end();
}

main().catch(console.error);
