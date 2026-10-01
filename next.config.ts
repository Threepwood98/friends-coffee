import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects() {
    return [
      {
        source: "/",
        destination: "/menu",
        permanent: true,
      },
      {
        source: "/carta/:path*",
        destination: "/menu/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
