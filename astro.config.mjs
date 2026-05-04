import { defineConfig } from 'astro/config';
import svelte from "@astrojs/svelte";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  devToolbar: {
    enabled: false,
  },
  output: 'server',
  adapter: node({ mode: 'standalone' })
});