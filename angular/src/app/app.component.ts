/**
 * Note Manager Application with WebMCP Integration
 *
 * This application demonstrates the WebMCP API using Angular services.
 * Tools are registered via WebMCPService and can be called by AI agents.
 *
 * @see https://docs.mcp-b.ai/frameworks/angular
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteService } from './services/note.service';
import { WebMCPService } from './services/webmcp.service';
import type { Note, NoteColor } from './types';

/**
 * Main application component
 *
 * Displays notes and provides UI for the note manager with AI integration
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app">
      <div class="container">
        <header class="header">
          <h1>Note Manager</h1>
          <p class="subtitle">AI-powered notes with Angular + WebMCP</p>
        </header>

        <div class="content">
          <section class="info-section">
            <div class="info-card">
              <h2>How This Works</h2>
              <p>This Angular app registers WebMCP tools via a service:</p>
              <ul>
                <li>Install the MCP-B browser extension</li>
                <li>Open the extension to see 6 available tools</li>
                <li>Ask AI to manage your notes</li>
                <li>Watch Angular state update in real-time!</li>
              </ul>
            </div>

            <div class="tools-card">
              <h2>Available Tools</h2>
              <ul>
                <li><code>add_note</code> - Create new notes</li>
                <li><code>delete_note</code> - Remove notes</li>
                <li><code>list_notes</code> - View all notes</li>
                <li><code>search_notes</code> - Find notes</li>
                <li><code>toggle_pin</code> - Pin/unpin notes</li>
                <li><code>get_note_stats</code> - Get statistics</li>
              </ul>
            </div>
          </section>

          <section class="stats-section">
            <div class="stat-card">
              <span class="stat-value">{{ noteService.stats().total }}</span>
              <span class="stat-label">Total Notes</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ noteService.stats().pinned }}</span>
              <span class="stat-label">Pinned</span>
            </div>
          </section>

          <section class="notes-section">
            <h2>Your Notes</h2>
            @if (noteService.sortedNotes().length === 0) {
              <div class="empty-state">
                <p>No notes yet. Ask AI to create some!</p>
                <p class="hint">Try: "Create a note about Angular WebMCP integration"</p>
              </div>
            } @else {
              <div class="notes-grid">
                @for (note of noteService.sortedNotes(); track note.id) {
                  <div class="note-card" [class]="'note-' + note.color">
                    @if (note.pinned) {
                      <span class="pin-badge">Pinned</span>
                    }
                    <h3>{{ note.title }}</h3>
                    <p class="note-content">{{ note.content }}</p>
                    <div class="note-meta">
                      <span class="note-id">ID: {{ note.id.substring(0, 8) }}...</span>
                      <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </section>
        </div>

        <footer class="footer">
          <p>
            Built with
            <a href="https://docs.mcp-b.ai" target="_blank" rel="noopener noreferrer">WebMCP</a>
            and Angular Signals
          </p>
        </footer>
      </div>
    </div>
  `,
  styles: `
    .app {
      min-height: 100vh;
      padding: 2rem;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }

    .header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      opacity: 0.9;
      font-size: 1rem;
    }

    .content {
      padding: 2rem;
    }

    .info-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .info-card,
    .tools-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
    }

    .info-card h2,
    .tools-card h2 {
      font-size: 1.1rem;
      margin-bottom: 1rem;
      color: #333;
    }

    .info-card ul,
    .tools-card ul {
      list-style: none;
      padding: 0;
    }

    .info-card li,
    .tools-card li {
      padding: 0.5rem 0;
      color: #666;
    }

    .tools-card code {
      background: #e9ecef;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9rem;
    }

    .stats-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      flex: 1;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: bold;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .notes-section h2 {
      margin-bottom: 1rem;
      color: #333;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      background: #f8f9fa;
      border-radius: 12px;
      color: #666;
    }

    .hint {
      font-size: 0.9rem;
      color: #888;
      margin-top: 0.5rem;
    }

    .notes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .note-card {
      padding: 1.5rem;
      border-radius: 12px;
      position: relative;
    }

    .note-yellow { background: #fff9c4; }
    .note-green { background: #c8e6c9; }
    .note-blue { background: #bbdefb; }
    .note-pink { background: #f8bbd9; }
    .note-purple { background: #e1bee7; }

    .pin-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: #333;
      color: white;
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }

    .note-card h3 {
      font-size: 1rem;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .note-content {
      font-size: 0.9rem;
      color: #555;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .note-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #888;
    }

    .footer {
      text-align: center;
      padding: 1.5rem;
      background: #f8f9fa;
      color: #666;
    }

    .footer a {
      color: #667eea;
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }
  `,
})
export class AppComponent implements OnInit {
  readonly noteService = inject(NoteService);
  private readonly webmcpService = inject(WebMCPService);

  ngOnInit(): void {
    this.webmcpService.initialize();
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
