const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgres://postgres:password@localhost:5433/medusa_db',
  });
  await client.connect();
  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'publishable_api_key_sales_channel'");
  console.log("Columns:", res.rows.map(x => x.column_name));
  await client.end();
}

main().catch(console.error);
