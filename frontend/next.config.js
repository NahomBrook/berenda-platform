// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep this if you want to ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Update the images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
    ],
  },
  // Remove the 'eslint' block entirely
};

module.exports = nextConfig;