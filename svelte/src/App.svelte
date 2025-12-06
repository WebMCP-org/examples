<script lang="ts">
/**
 * Notes Application with WebMCP Integration
 *
 * This application demonstrates Svelte 5 runes with WebMCP tools.
 * AI agents can create, update, delete, and search notes.
 *
 * @see https://docs.mcp-b.ai/packages/global
 */

import type { Note, Notification } from './types';
import { sortNotes, calculateNoteStats } from './lib/notes';
import WebMCPTools from './components/WebMCPTools.svelte';
import NoteList from './components/NoteList.svelte';
import NoteStats from './components/NoteStats.svelte';
import './app.css';

// State
let notes = $state<Note[]>([]);
let notification = $state<Notification | null>(null);

// Derived values
const sortedNotes = $derived(sortNotes(notes));
const stats = $derived(calculateNoteStats(notes));

function showNotification(message: string, type: Notification['type'] = 'success') {
  notification = { message, type };
  setTimeout(() => {
    notification = null;
  }, 3000);
}

$effect(() => {
  console.log('WebMCP Svelte runes example loaded!');
  console.log('Available tools: add_note, update_note, delete_note, list_notes, toggle_pin, search_notes, get_stats');
});
</script>

<WebMCPTools bind:notes {showNotification} />

{#if notification}
  <div class="notification {notification.type}">{notification.message}</div>
{/if}

<div class="app">
  <div class="container">
    <header class="header">
      <h1>Svelte Notes</h1>
      <p class="subtitle">AI-powered notes with Svelte 5 Runes + WebMCP</p>
    </header>

    <div class="content">
      <section class="info-section">
        <div class="info-card">
          <h2>How This Works</h2>
          <p>
            This Svelte 5 app uses <strong>$state</strong> and <strong>$derived</strong> runes
            with WebMCP's <code>navigator.modelContext.registerTool()</code>:
          </p>
          <ul>
            <li>Install the MCP-B browser extension</li>
            <li>Open the extension to see 7 available tools</li>
            <li>Ask AI to manage your notes</li>
            <li>Watch Svelte runes update in real-time!</li>
          </ul>
        </div>

        <div class="tools-card">
          <h2>Available Tools</h2>
          <ul>
            <li><code>add_note</code> - Create new notes</li>
            <li><code>update_note</code> - Edit note content</li>
            <li><code>delete_note</code> - Remove notes</li>
            <li><code>list_notes</code> - View all notes</li>
            <li><code>toggle_pin</code> - Pin/unpin notes</li>
            <li><code>search_notes</code> - Find notes</li>
            <li><code>get_stats</code> - Get statistics</li>
          </ul>
        </div>
      </section>

      <NoteStats {stats} />

      <section class="notes-section">
        <NoteList notes={sortedNotes} />
      </section>
    </div>

    <footer class="footer">
      <p>
        Built with <a href="https://docs.mcp-b.ai" target="_blank" rel="noopener noreferrer">WebMCP</a>
        &bull; Svelte 5 Runes &bull; TypeScript
      </p>
    </footer>
  </div>
</div>
