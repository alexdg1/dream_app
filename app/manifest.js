export default function manifest() {
  return {
    name: 'Dream Support',
    short_name: 'Dream Support',
    description: 'Private-first dream support with structured capture, re-entry, patterns, and weekly review.',
    start_url: '/',
    display: 'standalone',
    background_color: '#d7cebf',
    theme_color: '#2d6b60',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
