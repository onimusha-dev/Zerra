import { PrismaClient } from '../src/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as argon2 from 'argon2';
import 'dotenv/config';

const { Pool } = pg;
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const sampleImages = [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000',
    'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=1000',
    'https://images.unsplash.com/photo-1470222009995-1f9f257d0794?q=80&w=1000',
];

function getRandomImage() {
    return sampleImages[Math.floor(Math.random() * sampleImages.length)];
}

const postContents = [
    'Spent 3 hours debugging just to realize I was mutating shared state. Pain.',
    'I swear naming variables is harder than writing the logic.',
    'Refactored a service today and nothing broke. Suspicious.',
    "Sometimes I feel like I'm just moving data from one place to another and calling it engineering.",
    'Switched from REST to GraphQL and now I miss REST. Happens every time.',
    "You don't really understand async until something breaks in production.",
    'Reading old code I wrote 6 months ago... who let me do this?',
    'Tried Go today. Feels weirdly strict but also... peaceful?',
    'I think I enjoy debugging more than writing new features.',
    'Why do side projects feel more exciting than real work?',
    'Every system looks simple until you add users.',
    'Added logging. Suddenly everything makes sense.',
    'There should be a rule: if it needs 3 comments, rewrite it.',
    'I keep coming back to the same conclusion: simplicity wins.',
    'Today’s bug was just a missing await. I need sleep.',
    'I like backend because UI makes me feel dumb.',
    'Optimized a query and saved 200ms. Felt like a hero for 5 minutes.',
    'Docker fixed my problem and created two new ones.',
    "I don't trust code that works on first run.",
    'Feature done. Now comes the real work: edge cases.',
    "I should write more tests. I won't. But I should.",
    'Scaling scares me more than building.',
    'Sometimes I think I just enjoy solving problems, not coding itself.',
    'Production logs are more honest than any developer.',
    'Clean code is just code you understand today.',
];

const articleTopics = [
    {
        title: 'Why I Moved From Node.js to Go (And What I Miss)',
        body: `I didn’t switch because Node.js is bad. I switched because I hit a ceiling in how I think about concurrency.

Go forced me to slow down and actually understand what my code is doing.

But I still miss the ecosystem, the flexibility, and honestly — the chaos.

This is not a comparison. It’s a reflection.`,
    },
    {
        title: 'The First Time Production Broke Me',
        body: `There’s a moment every developer remembers — when something breaks in production and you have no idea why.

Mine involved a race condition, missing logs, and 2 hours of panic.

That day changed how I write code more than any tutorial ever did.`,
    },
    {
        title: 'You Don’t Need Microservices Yet',
        body: `I used to think microservices = senior engineering.

Now I think microservices = distributed confusion if done too early.

Most problems can be solved with a well-structured monolith.

Scaling code is easier than scaling complexity.`,
    },
    {
        title: 'Why Debugging Is The Real Skill',
        body: `Anyone can write code.

But sitting with a broken system, tracing logs, forming hypotheses — that’s the real craft.

Debugging teaches patience in a way nothing else does.`,
    },
];

async function main() {
    const password = await argon2.hash('password123');

    const user = await prisma.user.upsert({
        where: { email: 'aarav.kulkarni@zerra.dev' },
        update: {},
        create: {
            email: 'aarav.kulkarni@zerra.dev',
            username: 'aaravk_dev',
            name: 'Aarav Kulkarni',
            password: password,
            bio: 'Backend dev | Node.js → Go | Obsessed with clean systems & debugging weird production issues | trial & error is the only real teacher',
            isVerified: true,
            timezone: 'Asia/Kolkata',
        },
    });

    console.log(`User created/found: ${user.username}`);

    for (let i = 0; i < 70; i++) {
        const hasMedia = Math.random() > 0.6;
        const randomContent = postContents[Math.floor(Math.random() * postContents.length)];

        await prisma.post.create({
            data: {
                content: `${randomContent} (#${i + 1})`,
                published: true,
                media: hasMedia ? getRandomImage() : null,
                authorId: user.id,
            },
        });
    }

    console.log('70 posts created.');

    for (let i = 0; i < 45; i++) {
        const hasBanner = Math.random() > 0.5;
        const randomArticle = articleTopics[Math.floor(Math.random() * articleTopics.length)];

        const uniqueBody = `${randomArticle.body}

Extra note ${i + 1}: still figuring things out, still learning the hard way.`;

        await prisma.article.create({
            data: {
                title: `${randomArticle.title} pt.${i + 1}`,
                body: uniqueBody,
                published: true,
                enableComments: true,
                banner: hasBanner ? getRandomImage() : null,
                userId: user.id,
            },
        });
    }

    console.log('45 articles created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
