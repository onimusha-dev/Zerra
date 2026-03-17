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
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000',
    'https://images.unsplash.com/photo-1481481600673-c6eb0d110185?q=80&w=1000',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000',
    'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=1000',
    'https://images.unsplash.com/photo-1470222009995-1f9f257d0794?q=80&w=1000',
];

function getRandomImage() {
    return sampleImages[Math.floor(Math.random() * sampleImages.length)];
}

const postContents = [
    "Just discovered a new trick in CSS Grid. It's amazing how much you can do without absolute positioning.",
    'Is anyone else obsessed with keyboard shortcuts? I barely touch my mouse anymore. ⌨️',
    'Writing documentation is like leaving a love letter to your future self.',
    'Serverless cold starts used to be a nightmare, but things are getting so much better.',
    "Remember when we used jQuery for everything? Good times, but I don't miss the spaghetti code.",
    'WebSockets make real-time features so easy to build. Chat apps are fun again!',
    'Why does naming variables take up 50% of development time?',
    'Just read an amazing article on system architecture. Scaling is truly an art.',
    'Rust is calling my name... might have to spend this weekend learning it.',
    "Animations shouldn't be an afterthought. They guide the user experience.",
    "Anyone going to the tech conference next month? Let's meet up!",
    'I still check MDN docs for Array methods. No shame.',
    'Who else loves the feeling of a completely green test suite? ✅',
    'Open source is the backbone of modern software. Huge respect to all contributors.',
    'Refactoring day: deleted 500 lines of code and the app still works. Best feeling ever.',
    'CSS variables have changed the way I write styles completely.',
    'GraphQL or REST? I think both have their place depending on the project.',
    "Security shouldn't be locked behind a paywall. Always use HTTPS.",
    "Docker has saved me from 'it works on my machine' so many times.",
    'Remember to stretch and look away from the screen! Your eyes will thank you.',
    'Why write a 10-line loop when you can use reduce() and make it unreadable? 😅',
    'Building an API from scratch is so satisfying until you have to implement OAuth2.',
    'Vim users: how do you exit? Asking for a friend.',
    'Just found out about the Web Audio API. Time to build a synth in the browser!',
    "You don't need a heavy state management library for everything. Sometimes context is enough.",
];

const articleTopics = [
    {
        title: 'The Rise of Edge Computing',
        body: 'Deploying code closer to your users minimizes latency and improves performance drastically. In this piece, we explore how edge networks are fundamentally changing application deployment and why you should care.',
    },
    {
        title: 'Demystifying WebGL',
        body: "3D graphics in the browser have never been more accessible. With libraries like Three.js, building interactive 3D experiences is easier than ever. Let's break down the basics of rendering pipelines and shaders.",
    },
    {
        title: 'Functional Programming in TypeScript',
        body: 'While TypeScript is an OOP language at its core, it has excellent support for functional paradigms. Discover how utilizing pure functions, immutability, and higher-order functions can make your codebase cleaner and less prone to bugs.',
    },
    {
        title: 'The Economics of Open Source',
        body: 'Open source software powers the digital world, but sustainability remains a critical issue for maintainers. Monetization models, corporate sponsorships, and the true cost of free software are examined.',
    },
    {
        title: 'Building Offline-First Web Apps',
        body: 'Service workers and IndexedDB give us the power to build robust applications that work without a network connection. Here is a step-by-step guide to implementing effective caching strategies.',
    },
    {
        title: 'A Deep Dive into Node.js Event Loop',
        body: "Understanding the event loop is crucial for writing performant asynchronous JavaScript. We'll trace the execution lifecycle, microtasks, macrotasks, and how to avoid blocking the main thread.",
    },
    {
        title: 'Next-Gen CSS: Container Queries',
        body: "Media queries were revolutionizing, but container queries are taking responsive design to the next level. Now, components can respond to their parent's width instead of the viewport.",
    },
    {
        title: 'GraphQL Patterns and Anti-Patterns',
        body: 'GraphQL solves many REST issues but introduces new ones like the N+1 problem. Explore advanced techniques like DataLoader, schema stitching, and query complexity analysis.',
    },
    {
        title: 'Monorepos vs Polyrepos',
        body: 'Managing multiple services and packages can get complicated. We compare the benefits of consolidating your codebase with tools like Nx or Turborepo against keeping repositories separate.',
    },
    {
        title: 'The Art of Writing Good Test Cases',
        body: "Tests are only as good as what they assert. Learn the difference between unit, integration, and end-to-end tests, and how to adopt a pragmatic testing strategy that doesn't slow down development.",
    },
    {
        title: 'WebAssembly: Future or Hype?',
        body: "With languages like Rust and C++ compiling to WASM, native speeds in the browser are a reality. Let's look at real-world benchmarks and use-cases where WASM truly outshines JavaScript.",
    },
    {
        title: 'Building Custom React Hooks',
        body: "Extracting logic into custom hooks is a superpower for React developers. We'll build hooks for debouncing input, tracking intersection observers, and managing complex focus states.",
    },
];

async function main() {
    const password = await argon2.hash('password123');

    // Create a demo user
    const user = await prisma.user.upsert({
        where: { email: 'demo@zerra.com' },
        update: {},
        create: {
            email: 'demo@zerra.com',
            username: 'demouser',
            name: 'Demo User',
            password: password,
            bio: 'Just another inhabitant of Zerra.',
            isVerified: true,
            timezone: 'UTC',
        },
    });

    console.log(`User created/found: ${user.username}`);

    // Create 70 demo posts
    for (let i = 0; i < 70; i++) {
        const hasMedia = Math.random() > 0.6; // 40% chance to have media
        const randomContent = postContents[Math.floor(Math.random() * postContents.length)];

        await prisma.post.create({
            data: {
                content: `${randomContent} (Post Batch 2 - #${i + 1})`,
                published: true,
                media: hasMedia ? getRandomImage() : null,
                authorId: user.id,
            },
        });
    }

    console.log('70 Demo posts created.');

    // Create 45 demo articles
    for (let i = 0; i < 45; i++) {
        const hasBanner = Math.random() > 0.5; // 50% chance to have a banner
        const randomArticle = articleTopics[Math.floor(Math.random() * articleTopics.length)];

        // Add some variation to the content
        const uniqueBody = `${randomArticle.body}\n\nHere is a continuation of the article content intended to test long-form reading optimizations. Deep diving into ${randomArticle.title.toLowerCase()} provides profound insights into exactly how web platforms operate in 2026. This is expansion paragraph #${i + 1}.`;

        await prisma.article.create({
            data: {
                title: `${randomArticle.title} - Batch 2 pt.${i + 1}`,
                body: uniqueBody,
                published: true,
                enableComments: true,
                banner: hasBanner ? getRandomImage() : null,
                userId: user.id,
            },
        });
    }

    console.log('45 Demo articles created.');
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
