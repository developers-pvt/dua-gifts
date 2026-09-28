import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: path.resolve(process.cwd(), '.pgdata'),
    port: 5433,
    user: 'postgres',
    password: 'password',
    persistent: true,
  });

  console.log('Starting embedded postgres on port 5433...');
  await pg.start();
  console.log('Postgres is ready at postgres://postgres:password@localhost:5433/medusa_db');
}

main().catch(console.error);
