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
    '/charts',
    '/trend',
    '/chart'
  ]

  for (const url of routesToPrerender) {
    let dehydratedState = null;
    if (url === '/') {
      dehydratedState = await prefetch();
    }
    
    const { html } = await render(url, dehydratedState)

    let appHtml = template.replace(`<!--app-html-->`, html)
    if (dehydratedState) {
       appHtml = appHtml.replace(`<!--app-state-->`, `<script>window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydratedState).replace(/</g, '\\u003c')};</script>`);
    } else {
       appHtml = appHtml.replace(`<!--app-state-->`, '');
    }
    
    const filePath = `dist${url === '/' ? '/index.html' : `${url}/index.html`}`
    const absoluteFilePath = toAbsolute(filePath)

    fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true })
    fs.writeFileSync(absoluteFilePath, appHtml)
    
    console.log('Pre-rendered:', filePath)
  }
}

prerender().catch(err => {
  console.error(err)
  process.exit(1)
})
