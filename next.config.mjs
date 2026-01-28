/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com; frame-src 'self' https://www.google.com;`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
