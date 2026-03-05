import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const DATABASE_URL = 'postgresql://postgres:zerra1234@localhost:5432/zerra';
console.log(process.env['DATABASE_URL']);
export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: process.env['DATABASE_URL'],
    },
});
