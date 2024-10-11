/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['iconscout.com'],
    },
    experimental: {
      missingSuspenseWithCSRBailout: false,
    },
  };
  
export default nextConfig;
