import { defineConfig } from 'tsup'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const USE_CLIENT = '"use client";\n'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  onSuccess: async () => {
    const targets = ['dist/index.js', 'dist/index.cjs']
    for (const file of targets) {
      if (!existsSync(file)) continue
      const content = readFileSync(file, 'utf-8')
      if (content.startsWith('"use client"')) continue
      writeFileSync(file, USE_CLIENT + content)
    }
  },
})
