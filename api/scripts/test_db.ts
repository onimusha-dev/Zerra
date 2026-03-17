const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres.bmohaybutxemenauajxu:qODpA42POzB3Gpcr@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
        },
    },
});

async function main() {
    try {
        const users = await prisma.user.findMany({ take: 1 });
        console.log('Successfully connected and queried users:', users);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
