import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin to serve static HTML directories from public/ (e.g. /merchant/, /AddFoodItem/)
function staticHtmlDirectories() {
  return {
    name: 'static-html-directories',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = req.url.split('?')[0] // strip query params
        // Check if this path maps to a directory with index.html in public/
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
  server: {
    port: 3001,
    strictPort: true,
  },
})
