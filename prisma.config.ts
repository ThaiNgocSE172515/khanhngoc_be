import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import envInstance from './src/shared/env.config.js';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: envInstance.DIRECT_URL,
  },
});
