/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'covers.openlibrary.org',
      'books.google.com',
      'via.placeholder.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
