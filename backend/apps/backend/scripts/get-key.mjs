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
  const res = await client.query("SELECT id, token, title, type FROM api_key");
  console.log("API_KEYS:", JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(console.error);
