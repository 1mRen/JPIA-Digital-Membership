/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@napi-rs/canvas"],
  },
  outputFileTracingIncludes: {
    "/admin/dashboard/**": ["./public/image_template/*"],
    "/**": ["./public/image_template/*"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("@napi-rs/canvas");
    }
    return config;
  },
};

export default nextConfig;
