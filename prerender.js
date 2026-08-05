import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const toAbsolute = (p) => path.resolve(__dirname, p)

async function prerender() {
  let template = fs.readFileSync(toAbsolute('dist/index.html'), 'utf-8')

  const assetsDir = toAbsolute('dist/assets')
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir)

    const cssFile = files.find(f => f.endsWith('.css'))
    if (cssFile) {
      const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8')
      const linkRegex = new RegExp(`<link[^>]*href="[^"]*${cssFile}"[^>]*>`)
      template = template.replace(linkRegex, `<style>${cssContent}</style>`)
    }

    const fontFiles = files.filter(f => f.endsWith('.woff2'))
    let preloads = ''
    for (const font of fontFiles) {
      preloads += `    <link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin="anonymous">\n`
    }
    if (preloads) {
      template = template.replace('</head>', `${preloads}  </head>`)
    }
  }

  const { render, prefetch } = await import('./dist-server/entry-server.js')

  const routesToPrerender = [
    '/',
    '/guide',
    '/changelog',
    '/directory',
    '/charts',
    '/trend',
    '/chart',
    '/404'
  ]

  for (const url of routesToPrerender) {
    let dehydratedState = null;
    if (url === '/') {
      dehydratedState = await prefetch(url);
    } else if (url === '/directory') {
      dehydratedState = await prefetch(url);
    }
    
    const { html, helmet } = await render(url, dehydratedState)

    let appHtml = template.replace(`<!--app-html-->`, html)
    if (dehydratedState) {
       appHtml = appHtml.replace(`<!--app-state-->`, `<script>window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydratedState).replace(/</g, '\\u003c')};</script>`);
    } else {
       appHtml = appHtml.replace(`<!--app-state-->`, '');
    }
    
    if (helmet) {
      const helmetContent = `
        ${helmet.title ? helmet.title.toString() : ''}
        ${helmet.meta ? helmet.meta.toString() : ''}
        ${helmet.link ? helmet.link.toString() : ''}
        ${helmet.script ? helmet.script.toString() : ''}
      `;
      appHtml = appHtml.replace('<!--helmet-->', helmetContent);
    }
    
    
    const filePath = url === '/404' ? 'dist/404.html' : `dist${url === '/' ? '/index.html' : `${url}/index.html`}`
    const absoluteFilePath = toAbsolute(filePath)

    fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true })
    fs.writeFileSync(absoluteFilePath, appHtml)
    
    console.log('Pre-rendered:', filePath)
  }

  // Generate static sitemap.xml
  try {
    const today = new Date().toISOString().split('T')[0];
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://smogonstats.eu.cc/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://smogonstats.eu.cc/directory</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://smogonstats.eu.cc/guide</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://smogonstats.eu.cc/changelog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://smogonstats.eu.cc/charts</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://smogonstats.eu.cc/trend</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://smogonstats.eu.cc/chart</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    
    fs.writeFileSync(toAbsolute('dist/sitemap.xml'), sitemapXml);
    console.log('Pre-rendered: dist/sitemap.xml');
  } catch (err) {
    console.error('Failed to generate sitemap:', err);
    if (fs.existsSync(toAbsolute('public/sitemap.xml'))) {
      fs.copyFileSync(toAbsolute('public/sitemap.xml'), toAbsolute('dist/sitemap.xml'));
      console.log('Copied fallback sitemap.xml');
    }
  }
}

prerender().catch(err => {
  console.error(err)
  process.exit(1)
})
