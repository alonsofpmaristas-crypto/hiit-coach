import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Define DATABASE_URL en .env.test o en el entorno para ejecutar tests de integración.');
}

let database;
try {
  database = new URL(databaseUrl);
} catch {
  throw new Error('DATABASE_URL no es una URL válida para los tests de integración.');
}

const databaseName = database.pathname.slice(1);
if (!['postgres:', 'postgresql:'].includes(database.protocol)) {
  throw new Error('DATABASE_URL debe ser una URL de PostgreSQL.');
}
if (!/(?:^|[_-])test(?:$|[_-])/i.test(databaseName)) {
  throw new Error('Por seguridad, los tests de integración solo pueden usar una base de datos cuyo nombre incluya "test".');
}
if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(database.hostname)) {
  throw new Error('Por seguridad, conecta los tests de integración únicamente a Postgres local.');
}
if (!process.env.JWT_SECRET) {
  throw new Error('Define JWT_SECRET en .env.test o en el entorno para ejecutar tests de integración.');
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(process.execPath, ['node_modules/prisma/build/index.js', 'generate']);
run(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate']);
run(process.execPath, ['prisma/seed.js']);

const testFiles = readdirSync('test/integration')
  .filter((file) => file.endsWith('.test.js'))
  .map((file) => path.join('test/integration', file));
if (testFiles.length === 0) throw new Error('No hay tests de integración en test/integration/.');

run(process.execPath, ['--test', ...testFiles]);
