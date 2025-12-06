/**
 * Notes Application Entry Point
 *
 * This application demonstrates WebMCP integration with Svelte 5 runes.
 *
 * @see https://docs.mcp-b.ai/frameworks/svelte
 */

import '@mcp-b/global';
import App from './App.svelte';
import { mount } from 'svelte';

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
