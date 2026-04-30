import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin to serve static files and HTML directories from public/
function staticHtmlDirectories() {
  return {
    name: 'static-html-directories',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = req.url.split('?')[0] // strip query params

        // Skip React routes — let React Router handle them instead of serving static HTML
        const reactRoutes = ['/addfooditem', '/addfooditem/', '/AddFoodItem', '/AddFoodItem/']
        if (reactRoutes.includes(urlPath)) {
          return next()
        }

        // 1) Serve any static file that exists in public/ (JS, CSS, images, etc.)
        const staticPath = path.join(process.cwd(), 'public', urlPath)
        if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
          // Determine content type from extension
          const ext = path.extname(staticPath).toLowerCase()
          const contentTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.xml': 'text/xml',
            '.txt': 'text/plain',
          }
          res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream')
          fs.createReadStream(staticPath).pipe(res)
          return
        }

        // 2) Check if this path maps to a directory with index.html in public/
        const candidates = [
          urlPath,
          urlPath + (urlPath.endsWith('/') ? '' : '/'),
        ]
        for (const candidate of candidates) {
          const filePath = path.join(process.cwd(), 'public', candidate, 'index.html')
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html')
            fs.createReadStream(filePath).pipe(res)
            return
          }
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), staticHtmlDirectories()],
  build: {
    outDir: 'build',
  },
  cacheDir: 'node_modules/.vite2',
  server: {
    port: 3001,
    strictPort: true,
  },
})
