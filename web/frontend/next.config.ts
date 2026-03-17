const API_URL = process.env.NEXT_PUBLIC_API_URL;

const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: API_URL ? `${API_URL}/:path*` : 'http://localhost:9000/:path*',
            },
            {
                source: '/uploads/:path*',
                destination: API_URL
                    ? `${API_URL}/uploads/:path*`
                    : 'http://localhost:9000/uploads/:path*',
            },
        ];
    },
};

export default nextConfig;
