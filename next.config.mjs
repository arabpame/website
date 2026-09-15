/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      // The report form posts its photographs through a Server Action. Vercel
      // caps a function's request body at 4.5 MB, so the browser compresses
      // every photograph before sending and the form keeps the total under this.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
