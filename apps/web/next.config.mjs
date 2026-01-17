/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@repo/sim-core', '@repo/sim-render', '@repo/ai-mock'],
};

export default nextConfig;
