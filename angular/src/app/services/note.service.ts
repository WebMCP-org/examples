/**
 * Note Management Service
 *
 * Manages note state using Angular signals for reactive updates.
 * This service is consumed by WebMCPService to expose tools to AI agents.
 */

import { Injectable, signal, computed } from '@angular/core';
import type { Note, CreateNoteParams, NoteColor, NoteStats } from '../types';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly notesSignal = signal<Note[]>([]);

  /** Readonly access to all notes */
  readonly notes = this.notesSignal.asReadonly();

  /** Notes sorted by pinned status, then by most recently updated */
  readonly sortedNotes = computed(() => {
    return [...this.notesSignal()].sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  });

  /** Computed statistics about notes */
  readonly stats = computed<NoteStats>(() => {
    const notes = this.notesSignal();
    const byColor = { yellow: 0, green: 0, blue: 0, pink: 0, purple: 0 };
    notes.forEach((note) => byColor[note.color]++);

    return {
      total: notes.length,
      pinned: notes.filter((n) => n.pinned).length,
      byColor,
    };
  });

  /** Create a new note and add it to the collection */
  addNote(params: CreateNoteParams): Note {
    const note: Note = {
      id: crypto.randomUUID(),
      title: params.title,
      content: params.content,
      color: params.color ?? 'yellow',
      pinned: params.pinned ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.notesSignal.update((notes) => [...notes, note]);
    return note;
  }

  /** Update an existing note by ID */
  updateNote(
    id: string,
    updates: Partial<Pick<Note, 'title' | 'content' | 'color' | 'pinned'>>
  ): Note | null {
    let updatedNote: Note | null = null;

    this.notesSignal.update((notes) =>
      notes.map((note) => {
        if (note.id === id) {
          updatedNote = { ...note, ...updates, updatedAt: new Date() };
          return updatedNote;
        }
        return note;
      })
    );

    return updatedNote;
  }

  /** Delete a note by ID, returns the deleted note or null */
  deleteNote(id: string): Note | null {
    const note = this.notesSignal().find((n) => n.id === id);
    if (!note) return null;

    this.notesSignal.update((notes) => notes.filter((n) => n.id !== id));
    return note;
  }

  /** Toggle the pinned status of a note */
  togglePin(id: string): Note | null {
    const note = this.notesSignal().find((n) => n.id === id);
    if (!note) return null;

    return this.updateNote(id, { pinned: !note.pinned });
  }

  /** Search notes by title or content (case-insensitive) */
  searchNotes(query: string): Note[] {
    const lowerQuery = query.toLowerCase();
    return this.notesSignal().filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
    );
  }

  /** Filter notes by color */
  filterByColor(color: NoteColor): Note[] {
    return this.notesSignal().filter((note) => note.color === color);
  }

  /** Get all notes as an array */
  getAllNotes(): Note[] {
    return this.notesSignal();
  }

  /** Clear all notes, returns the count of deleted notes */
  clearAllNotes(): number {
    const count = this.notesSignal().length;
    this.notesSignal.set([]);
    return count;
  }
}
