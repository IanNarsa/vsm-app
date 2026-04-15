import fs from 'fs';
import { resolve } from 'path';

/**
 * Simple Sitemap Generator for FlowLean
 * Run this script to update public/sitemap.xml
 */

const baseUrl = 'https://flow-lean.com';
const lastMod = new Date().toISOString().split('T')[0];

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

const outputPath = resolve('public', 'sitemap.xml');

try {
  fs.writeFileSync(outputPath, sitemapContent);
  console.log(`✅ Sitemap successfully generated at: ${outputPath}`);
} catch (error) {
  console.error('❌ Failed to generate sitemap:', error);
  process.exit(1);
}
