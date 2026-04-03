import axios from 'axios';
import FormData from 'form-data';
import 'dotenv/config';
import fs from 'fs';

/**
 * PRODUCTION BULK SEEDER - DIVERSIFIED FEED MODE (V4)
 * Populates Render with Anime, Coding, and Image content.
 * Guarantees user diversity (max 15 posts per author).
 */

const API_URL = 'https://zerra-backend-378c.onrender.com';
const FRONTEND_URL = 'https://zerra-nine.vercel.app';
const LOG_FILE = '/home/musha/Coding/TYPESCRIPT/Zerra/api/production_migration.log';

function logProgress(msg: string) {
    const timestamp = new Date().toLocaleTimeString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
    console.log(`[${timestamp}] ${msg}`);
}

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getStealthHeaders = (extra: Record<string, string> = {}) => ({
    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    Accept: 'application/json',
    ...extra,
});

async function downloadImage(url: string): Promise<Buffer | null> {
    try {
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: getStealthHeaders(),
        });
        return Buffer.from(res.data, 'binary');
    } catch (e) {
        return null;
    }
}

async function scrapeSubreddit(subreddit: string, limit = 100) {
    logProgress(`[REDDIT] Scrapping /r/${subreddit}...`);
    try {
        const res = await axios.get(
            `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
            { headers: getStealthHeaders() },
        );
        return res.data.data.children.map((child: any) => {
            const data = child.data;
            const mediaUrl =
                data.url_overridden_by_dest &&
                data.url_overridden_by_dest.match(/\.(jpg|jpeg|png|gif)$/)
                    ? data.url_overridden_by_dest
                    : null;
            return {
                author: data.author,
                title: data.title,
                content: (data.selftext || data.title).trim(),
                isArticle: (data.selftext?.length || 0) > 800,
                mediaUrl,
                timestamp: data.created_utc * 1000,
            };
        });
    } catch (e: any) {
        logProgress(`[ERROR] Subreddit /r/${subreddit} failed: ${e.message}`);
        return [];
    }
}

const TOKEN_CACHE = new Map<string, string>();
const USER_POST_COUNT = new Map<string, number>();

async function getAuthToken(username: string) {
    if (TOKEN_CACHE.has(username)) return TOKEN_CACHE.get(username);

    const sanitized = username
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .slice(0, 16)
        .padEnd(5, '0');
    const headers = {
        'User-Agent': USER_AGENTS[0],
        Origin: FRONTEND_URL,
        Referer: FRONTEND_URL + '/',
    };
    const password = 'Password@123';

    try {
        await axios
            .post(
                `${API_URL}/auth/register`,
                {
                    name: username,
                    username: sanitized,
                    email: `${sanitized}@cloned.zerra`,
                    password,
                    confirmPassword: password,
                    bio: `Passionate contributor from /r/reddit community.`,
                    timezone: 'UTC',
                },
                { headers },
            )
            .catch(() => {});

        const loginRes = await axios.post(
            `${API_URL}/auth/login`,
            { username: sanitized, password },
            { headers },
        );
        const token = loginRes.data.data.accessToken;
        TOKEN_CACHE.set(username, token);
        return token;
    } catch (e: any) {
        return null;
    }
}

async function pushPost(token: string, item: any) {
    const count = USER_POST_COUNT.get(item.author) || 0;
    if (count >= 15) return; // Diversity Guard

    const headers = {
        Authorization: `Bearer ${token}`,
        'User-Agent': USER_AGENTS[0],
        Origin: FRONTEND_URL,
        Referer: FRONTEND_URL + '/',
    };

    const form = new FormData();
    const endpoint = item.isArticle ? '/articles' : '/posts';

    if (item.isArticle) {
        form.append('title', item.title.slice(0, 100));
        form.append('body', item.content);
    } else {
        form.append('content', item.content.slice(0, 500));
    }
    form.append('published', 'true');

    if (item.mediaUrl) {
        const buffer = await downloadImage(item.mediaUrl);
        if (buffer) {
            form.append(item.isArticle ? 'banner' : 'media', buffer, {
                filename: `media_${Date.now()}.jpg`,
            });
        }
    }

    try {
        await axios.post(`${API_URL}${endpoint}`, form, {
            headers: { ...headers, ...form.getHeaders() },
        });
        USER_POST_COUNT.set(item.author, count + 1);
        process.stdout.write(item.isArticle ? 'A' : 'P');
    } catch (e: any) {
        process.stdout.write('x');
    }
}

async function main() {
    const subreddits = [
        'anime',
        'coding',
        'webdev',
        'art',
        'wallpaper',
        'javascript',
        'reactjs',
        'vuejs',
        'rust',
    ];

    logProgress(`\n🔥 PRODUCTION DIVERSIFIED SEEDING: ${API_URL}`);

    for (const sub of subreddits) {
        logProgress(`[PROCESS] Processing /r/${sub}...`);
        const posts = await scrapeSubreddit(sub, 50);

        for (const item of posts) {
            const token = await getAuthToken(item.author);
            if (token) {
                await pushPost(token, item);
                await delay(3000); // Higher delay (3s) to avoid 502/Gateway issues on Render
            }
        }
        console.log('');
        await delay(10000); // 10s cooldown between subreddits
    }
    logProgress('\n--- DIVERSIFIED SEEDING COMPLETE ---');
}

main();
