
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Allow data URIs
    domains: ['localhost'], // Required for local development if serving images. Not strictly for data URIs.
    // For data URIs, next/image handles them directly if correctly formatted.
    // However, sometimes explicit config helps, though it's usually for remote patterns.
    // The main thing is that the data URI is correctly passed to `src`.
    // Let's add a generic pattern for data to be safe, although usually not needed.
    // This part of config is more for remote images. For data: URIs, it should just work.
    // Keeping remotePatterns as is. No explicit data URI config needed in remotePatterns.
  },
};

export default nextConfig;
