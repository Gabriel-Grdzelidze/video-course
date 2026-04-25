/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "course-dem.s3.eu-north-1.amazonaws.com",
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        dns: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;