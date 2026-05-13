/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // In dev, bypass Next image optimizer to avoid crashing the page
    // when remote image hosts are temporarily unreachable.
    unoptimized: isDev,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
