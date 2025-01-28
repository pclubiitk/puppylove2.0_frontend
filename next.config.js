/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    SERVER_IP: process.env.SERVER_IP,
    CAPTCHA_KEY: process.env.CAPTCHA_KEY,
    CLIENT_ID: process.env.CLIENT_ID,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
};

module.exports = nextConfig;
