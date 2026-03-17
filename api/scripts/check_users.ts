import { PrismaClient } from '../src/generated/prisma';
import { configDotenv } from 'dotenv';
configDotenv();

const prisma = new PrismaClient();
async function main() {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, isVerified: true },
        });
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
