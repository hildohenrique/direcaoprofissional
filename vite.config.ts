import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'node:url';

/* Em desenvolvimento, o mentor Norte roda dentro do próprio Vite em /api/norte,
   usando o mesmo código da função da Netlify. Só responde se houver ANTHROPIC_API_KEY. */
function norteLocal(env: Record<string, string>): Plugin {
  return {
    name: 'norte-local',
    configureServer(server) {
      server.middlewares.use('/api/norte', async (req, res) => {
        Object.assign(process.env, env);
        const { responderNorte } = await server.ssrLoadModule('/servidor/norte.ts');
        const partes: Buffer[] = [];
        for await (const p of req) partes.push(p as Buffer);
        const pedido = new Request('http://local/api/norte', {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: req.method === 'POST' ? Buffer.concat(partes) : undefined,
        });
        const resposta: Response = await responderNorte(pedido);
        res.statusCode = resposta.status;
        resposta.headers.forEach((v, k) => res.setHeader(k, v));
        if (!resposta.body) return res.end();
        const leitor = resposta.body.getReader();
        for (;;) {
          const { done, value } = await leitor.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const unico = mode === 'unico';
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: unico ? './' : '/',
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    plugins: [
      react(),
      norteLocal(env),
      ...(unico
        ? [viteSingleFile()]
        : [
            VitePWA({
              registerType: 'autoUpdate',
              includeAssets: ['icone.svg', 'icone-180.png'],
              manifest: {
                name: 'Direção Profissional',
                short_name: 'Direção',
                description: 'Um GPS para quem quer ganhar o próprio dinheiro começando do zero.',
                lang: 'pt-BR',
                start_url: '/',
                display: 'standalone',
                orientation: 'portrait',
                background_color: '#f6efe1',
                theme_color: '#f6efe1',
                icons: [
                  { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
                  { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
                  { src: 'icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
              },
              workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'], navigateFallbackDenylist: [/^\/api\//] },
            }),
          ]),
    ],
    build: { outDir: unico ? 'dist-unico' : 'dist', target: 'es2020' },
    test: { environment: 'node', include: ['testes/**/*.test.ts'] },
  };
});
