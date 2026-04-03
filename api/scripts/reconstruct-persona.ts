import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import FormData from 'form-data';
import 'dotenv/config';

/**
 * RECONSTRUCT PERSONA SCRIPT
 *
 * Pipeline:
 * 1. Scrape Reddit User (Public JSON API)
 * 2. Analyze Persona (Gemini 1.5 Flash)
 * 3. Transform & Rewrite Content
 * 4. Seed Target API (/auth, /posts, /articles)
 */

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:9000';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn(
        '\x1b[33m%s\x1b[0m',
        'Warning: GEMINI_API_KEY missing. Persona analysis will be generic.',
    );
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
});

interface ScrapedUser {
    username: string;
    displayName: string;
    bio: string;
    avatar: string;
    posts: Array<{
        content: string;
        timestamp: number;
        score: number;
    }>;
}

interface Persona {
    tone: string;
    topics: string[];
    style: string;
    bioStyle: string;
}

/**
 * STEP 1: SCRAPE USER DATA
 * Uses Reddit's public .json endpoints for high reliability and structured data.
 */
async function scrapeUser(redditUsername: string): Promise<ScrapedUser> {
    console.log(`\x1b[36m[SCRAPE]\x1b[0m Accessing Reddit profile: ${redditUsername}...`);

    try {
        // Fetch User 'About' data
        const aboutRes = await axios.get(
            `https://www.reddit.com/user/${redditUsername}/about.json`,
            {
                headers: { 'User-Agent': 'PersonaReconstructor/1.0 (Senior Engineer Task)' },
            },
        );
        const aboutData = aboutRes.data.data;

        // Fetch User 'Submitted' posts
        const postsRes = await axios.get(
            `https://www.reddit.com/user/${redditUsername}/submitted.json?limit=25`,
            {
                headers: { 'User-Agent': 'PersonaReconstructor/1.0' },
            },
        );
        const postsData = postsRes.data.data.children;

        const posts = postsData
            .map((p: any) => ({
                content: (p.data.selftext || p.data.title).trim(),
                timestamp: p.data.created_utc * 1000,
                score: p.data.score,
            }))
            .filter((p: any) => p.content.length > 10);

        return {
            username: aboutData.name,
            displayName: aboutData.subreddit?.title || aboutData.name,
            bio: aboutData.subreddit?.public_description || '',
            avatar: aboutData.icon_img?.split('?')[0] || '',
            posts,
        };
    } catch (error: any) {
        throw new Error(`Failed to scrape Reddit: ${error.message}`);
    }
}

/**
 * STEP 3: PERSONA ANALYSIS
 * Leverages LLM to infer personality traits and writing style.
 */
async function analyzePersona(user: ScrapedUser): Promise<Persona> {
    console.log('\x1b[36m[ANALYZE]\x1b[0m Synthesizing persona profile...');

    if (!GEMINI_API_KEY) {
        return {
            tone: 'casual and tech-oriented',
            topics: ['technology', 'software development', 'internet culture'],
            style: 'modern internet vernacular, uses lowercase often',
            bioStyle: 'direct and hobby-focused',
        };
    }

    const postTexts = user.posts
        .slice(0, 12)
        .map((p) => p.content)
        .join('\n---\n');
    const prompt = `
    Analyze this user's persona based on their Reddit activity.
    
    BIO: ${user.bio}
    SAMPLE POSTS:
    ${postTexts}
    
    Return a JSON object:
    {
      "tone": "string describing their emotional energy (e.g., cynical but helpful, high-energy technical)",
      "topics": ["list", "of", "inferred", "interests"],
      "style": "string describing sentence structure and vocabulary preferences",
      "bioStyle": "string describing how they present their identity"
    }`;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (e) {
        console.error('Gemini analysis failed, using fallback persona.');
        return { tone: 'casual', topics: ['tech'], style: 'concise', bioStyle: 'minimalist' };
    }
}

/**
 * STEP 5: POST TRANSFORMATION
 * Rewrites content to maintain persona while avoiding exact duplicates.
 */
async function transformPosts(scrapedPosts: any[], persona: Persona) {
    console.log(`\x1b[36m[TRANSFORM]\x1b[0m Rewriting ${scrapedPosts.length} posts...`);
    const transformed = [];

    // To be efficient, we transform in chunks or use a single prompt for multiple if needed.
    // Here we do it one by one for maximum fidelity to the persona.
    for (const post of scrapedPosts.slice(0, 15)) {
        if (!GEMINI_API_KEY) {
            transformed.push({ ...post, content: post.content });
            continue;
        }

        const prompt = `
        Rewrite this post content to fit the persona: ${JSON.stringify(persona)}.
        Keep the factual meaning but shift the phrasing. Ensure it is between 10 and 500 characters.
        
        ORIGINAL: "${post.content}"
        
        Return JSON format: {"rewrittenContent": "..."}`;

        try {
            const result = await model.generateContent(prompt);
            const data = JSON.parse(result.response.text());
            transformed.push({
                ...post,
                content: data.rewrittenContent,
            });
        } catch (e) {
            transformed.push(post);
        }
    }
    return transformed;
}

/**
 * STEP 6: ARTICLE GENERATION
 * Consolidates themes into longer form articles.
 */
async function generateArticles(posts: any[], persona: Persona) {
    console.log('\x1b[36m[GENERATE]\x1b[0m Authoring articles from themes...');
    if (!GEMINI_API_KEY) return [];

    const prompt = `
    Based on the following themes:
    ${posts.map((p) => p.content.slice(0, 100)).join('\n')}
    
    Write 2 long-form articles (min 300 words each) in the persona of: ${JSON.stringify(persona)}.
    Articles should have a Title and structured body.
    
    Return JSON array: [{"title": "...", "body": "..."}]`;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (e) {
        return [];
    }
}

/**
 * STEP 8: SEEDING (API INTEGRATION)
 */
async function seedDatabase(
    user: ScrapedUser,
    persona: Persona,
    transformedPosts: any[],
    articles: any[],
) {
    console.log('\x1b[32m[SEED]\x1b[0m Initiating API seeding pipeline...');

    // 1. Prepare User Payload
    // Format: 5-16 chars, lowercase, letters/numbers/_
    const safeUsername = user.username
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .slice(0, 16)
        .padEnd(5, '0');

    const email = `${safeUsername}@cloned.zerra.io`;
    const password = 'Password@123'; // Strong enough for most validators

    try {
        console.log(`  > Registering user: ${safeUsername}`);
        await axios.post(`${API_URL}/auth/register`, {
            name: user.displayName.slice(0, 50),
            email,
            password,
            confirmPassword: password,
            username: safeUsername,
            bio: (user.bio || `Persona: ${persona.tone}`).slice(0, 150),
            avatar: user.avatar || undefined,
            timezone: 'UTC',
        });
    } catch (e: any) {
        if (e.response?.status === 409 || e.response?.data?.message?.includes('exists')) {
            console.log(`  ! User ${safeUsername} already exists, proceeding to login.`);
        } else {
            console.error('  X Registration failed:', e.response?.data || e.message);
        }
    }

    // 2. Login & Authenticate
    console.log('  > Authenticating...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
        username: safeUsername,
        password,
    });

    const token = loginRes.data.data.accessToken;
    const authHeader = { Authorization: `Bearer ${token}` };

    // 3. Create Posts with Chronological Preservation
    const sortedPosts = [...transformedPosts].sort((a, b) => a.timestamp - b.timestamp);
    console.log(`  > Inserting ${sortedPosts.length} posts...`);

    for (const post of sortedPosts) {
        const form = new FormData();
        form.append('content', post.content.slice(0, 500));
        form.append('published', 'true');

        try {
            await axios.post(`${API_URL}/posts`, form, {
                headers: { ...authHeader, ...form.getHeaders() },
            });
            process.stdout.write('.');
            // Simulate realistic delay
            await new Promise((r) => setTimeout(r, 200));
        } catch (e) {
            process.stdout.write('x');
        }
    }
    console.log('\n  > Posts complete.');

    // 4. Create Articles
    console.log(`  > Publishing ${articles.length} articles...`);
    for (const article of articles) {
        const form = new FormData();
        form.append('title', article.title.slice(0, 100));
        form.append('body', article.body);
        form.append('published', 'true');
        form.append('enableComments', 'true');

        try {
            await axios.post(`${API_URL}/articles`, form, {
                headers: { ...authHeader, ...form.getHeaders() },
            });
            console.log(`    - Published: ${article.title}`);
        } catch (e: any) {
            console.error(`    x Failed article: ${article.title}`, e.response?.data || e.message);
        }
    }

    console.log('\x1b[32m[SUCCESS]\x1b[0m Persona reconstructed successfully in the system.');
    console.log(`\x1b[35m[INFO]\x1b[0m Credentials: ${safeUsername} / ${password}`);
}

async function main() {
    const targetUser = process.argv[2];
    if (!targetUser) {
        console.log('\x1b[31mError:\x1b[0m No username provided.');
        console.log('Usage: tsx scripts/reconstruct-persona.ts <reddit_username>');
        process.exit(1);
    }

    console.log('\x1b[35m==========================================');
    console.log('   ZERRA PERSONA RECONSTRUCTION SYSTEM    ');
    console.log('==========================================\x1b[0m');

    try {
        const scraped = await scrapeUser(targetUser);
        const persona = await analyzePersona(scraped);
        const posts = await transformPosts(scraped.posts, persona);
        const articles = await generateArticles(posts, persona);

        await seedDatabase(scraped, persona, posts, articles);
    } catch (error: any) {
        console.error('\n\x1b[31m[CRITICAL ERROR]\x1b[0m', error.message);
        process.exit(1);
    }
}

main();
