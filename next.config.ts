import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // hydrate do Stencil é app Node com DOM simulado: não bundlar
  serverExternalPackages: ["@plataforma-xvia/ds-core"],
  // site estático: a Vercel recebe a pasta out/ pronta e não precisa do registry do GitLab MS
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
