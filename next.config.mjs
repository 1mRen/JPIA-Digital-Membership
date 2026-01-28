/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@napi-rs/canvas"],
    outputFileTracingIncludes: {
      "/admin/dashboard": [
        "./image_template/*.png",
        "./node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff2",
        "./node_modules/@fontsource/roboto/files/roboto-latin-700-normal.woff2",
      ],
    },
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
