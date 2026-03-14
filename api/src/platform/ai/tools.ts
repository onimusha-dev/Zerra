import { tool, ToolRuntime } from 'langchain';
import * as z from 'zod';

export const getWeather = tool((input: { city: string }) => `It's always rainy in ${input.city}!`, {
    name: 'get_weather',
    description: 'Get the weather for a given city',
    schema: z.object({
        city: z.string().describe('The city to get the weather for'),
    }),
});

type AgentRuntime = ToolRuntime<unknown, { user_id: string }>;

export const getUserLocation = tool(
    (_, config: AgentRuntime) => {
        const { user_id } = config.context;
        return user_id === '1' ? 'Florida' : 'SF';
    },
    {
        name: 'get_user_location',
        description: 'Retrieve user information based on user ID',
    },
);

export const getGoogleSearch = tool(
    async (input: { query: string }) => {
        const response = await fetch(
            `https://serpapi.com/search?engine=google&q=${input.query}&api_key=${process.env.SERPAPI_KEY}`,
        );
        const data = await response.json();
        return data;
    },
    {
        name: 'get_google_search',
        description: 'Get the google search results for a given query',
        schema: z.object({
            query: z.string().describe('The query to search for'),
        }),
    },
);

export const getLatestNews = tool(
    async (input: { query: string }) => {
        const response = await fetch(
            `https://serpapi.com/search?engine=google&q=${input.query}&api_key=${process.env.SERPAPI_KEY}`,
        );
        const data = await response.json();
        return data;
    },
    {
        name: 'get_latest_news',
        description: 'Get the latest news for a given query',
        schema: z.object({
            query: z.string().describe('The query to search for'),
        }),
    },
);

export const getCurrentDateAndTime = tool(
    () => {
        const date = new Date();
        return date.toISOString();
    },
    {
        name: 'get_current_date_and_time',
        description: 'Get the current date and time',
    },
);

export const executeCommand = tool(
    async (input: { command: string }) => {
        const response = await fetch(`http://localhost:3000/execute-command`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.API_KEY}`,
            },
            body: JSON.stringify(input),
        });
        const data = await response.json();
        return data;
    },
    {
        name: 'execute_command',
        description: 'Execute a command',
        schema: z.object({
            command: z.string().describe('The command to execute'),
        }),
    },
);
