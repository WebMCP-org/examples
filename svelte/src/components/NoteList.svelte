<script lang="ts">
/**
 * Note List Component
 *
 * Displays all notes in a grid layout
 */

import type { Note } from '../types';

interface Props {
  notes: Note[];
}

let { notes }: Props = $props();

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
</script>

<div class="note-list">
  {#if notes.length === 0}
    <div class="empty-state">
      <p>No notes yet</p>
      <p class="hint">Ask AI to create some notes for you!</p>
    </div>
  {:else}
    <div class="notes-grid">
      {#each notes as note (note.id)}
        <div class="note-card {note.color}" class:pinned={note.pinned}>
          {#if note.pinned}
            <span class="pin-badge">Pinned</span>
          {/if}
          <h3 class="note-title">{note.title}</h3>
          <p class="note-content">{note.content || '(no content)'}</p>
          <div class="note-meta">
            <span class="note-id">ID: {note.id.slice(0, 8)}...</span>
            <span class="note-date">{formatDate(note.updatedAt)}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .note-list {
    width: 100%;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #666;
  }

  .empty-state p {
    margin: 0.5rem 0;
  }

  .hint {
    font-size: 0.875rem;
    color: #999;
  }

  .notes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .note-card {
    padding: 1rem;
    border-radius: 8px;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .note-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .note-card.pinned {
    border: 2px solid #333;
  }

  .note-card.yellow {
    background: #fff9c4;
  }
  .note-card.blue {
    background: #bbdefb;
  }
  .note-card.green {
    background: #c8e6c9;
  }
  .note-card.pink {
    background: #f8bbd0;
  }
  .note-card.purple {
    background: #e1bee7;
  }

  .pin-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: #333;
    color: white;
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 600;
  }

  .note-title {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }

  .note-content {
    margin: 0 0 1rem;
    font-size: 0.875rem;
    color: #555;
    line-height: 1.4;
    word-wrap: break-word;
  }

  .note-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #777;
  }

  .note-id {
    font-family: monospace;
  }
</style>
