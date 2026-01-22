import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3001",
        "10.255.255.254:3001",
        "frontendnew-iota.vercel.app",  // Add your vercel deployment URL
        "frontend-7ee5ntc8y-abdul-qadir-khans-projects.vercel.app"  // Add your vercel deployment URL
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'api.todoapp.com',
      },
      {
        protocol: 'https',
        hostname: 'frontendnew-iota.vercel.app',  // Add your vercel URL for images
      },
      {
        protocol: 'https',
        hostname: 'frontend-7ee5ntc8y-abdul-qadir-khans-projects.vercel.app',  // Add your vercel URL for images
      }
    ],
  },
  // Enable trailing slash to avoid potential routing issues
  trailingSlash: false,
};

export default nextConfig;
