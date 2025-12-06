<script lang="ts">
/**
 * Note Statistics Component
 *
 * Displays statistics about notes
 */

import type { NoteStats } from '../types';

interface Props {
  stats: NoteStats;
}

let { stats }: Props = $props();
</script>

<section class="stats-section">
  <div class="stat">
    <span class="stat-value">{stats.total}</span>
    <span class="stat-label">Total</span>
  </div>
  <div class="stat">
    <span class="stat-value">{stats.pinned}</span>
    <span class="stat-label">Pinned</span>
  </div>
  <div class="stat colors">
    <div class="color-dots">
      {#if stats.byColor.yellow > 0}
        <span class="color-dot yellow" title="Yellow: {stats.byColor.yellow}"></span>
      {/if}
      {#if stats.byColor.blue > 0}
        <span class="color-dot blue" title="Blue: {stats.byColor.blue}"></span>
      {/if}
      {#if stats.byColor.green > 0}
        <span class="color-dot green" title="Green: {stats.byColor.green}"></span>
      {/if}
      {#if stats.byColor.pink > 0}
        <span class="color-dot pink" title="Pink: {stats.byColor.pink}"></span>
      {/if}
      {#if stats.byColor.purple > 0}
        <span class="color-dot purple" title="Purple: {stats.byColor.purple}"></span>
      {/if}
    </div>
    <span class="stat-label">Colors</span>
  </div>
</section>

<style>
  .stats-section {
    display: flex;
    gap: 2rem;
    justify-content: center;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .colors {
    min-width: 80px;
  }

  .color-dots {
    display: flex;
    gap: 0.25rem;
    height: 1.5rem;
    align-items: center;
    justify-content: center;
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    cursor: help;
  }

  .color-dot.yellow {
    background: #fdd835;
  }
  .color-dot.blue {
    background: #42a5f5;
  }
  .color-dot.green {
    background: #66bb6a;
  }
  .color-dot.pink {
    background: #ec407a;
  }
  .color-dot.purple {
    background: #ab47bc;
  }
</style>
