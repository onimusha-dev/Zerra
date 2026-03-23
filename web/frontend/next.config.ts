const isDev = process.env.NODE_ENV === 'development';

// Pick API URL automatically
const API_URL = isDev
    ? 'http://localhost:9000' // your local backend port
    : process.env.NEXT_PUBLIC_API_URL || 'https://zerra-backend-378c.onrender.com';

const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${API_URL}/:path*`,
            },
            {
                source: '/uploads/:path*',
                destination: `${API_URL}/uploads/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
