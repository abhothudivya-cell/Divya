import React, { useState, useMemo } from 'react';
import { Note } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  FileText, 
  Sparkles,
  Calendar
} from 'lucide-react';

interface NotesViewProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'lastUpdated'>) => void;
  onEditNote: (updatedNote: Note) => void;
  onDeleteNote: (id: string) => void;
}

const NOTE_COLORS = [
  { name: 'Warm Amber', class: 'bg-amber-50/90 dark:bg-amber-950/20 border-amber-100 dark:border-amber-950' },
  { name: 'Soft Sky', class: 'bg-sky-50/90 dark:bg-sky-950/20 border-sky-100 dark:border-sky-950' },
  { name: 'Blush Pink', class: 'bg-pink-50/90 dark:bg-pink-950/20 border-pink-100 dark:border-pink-950' },
  { name: 'Mint Green', class: 'bg-emerald-50/90 dark:bg-emerald-955/15 border-emerald-100 dark:border-emerald-950' },
  { name: 'Royal Purple', class: 'bg-indigo-50/90 dark:bg-indigo-955/15 border-indigo-100 dark:border-indigo-950' },
];

export default function NotesView({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
}: NotesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0].class);

  // Handle addition or saving of existing notes
  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    if (editingNoteId) {
      onEditNote({
        id: editingNoteId,
        title: noteTitle.trim() || 'Untitled Note',
        content: noteContent.trim(),
        lastUpdated: new Date().toISOString(),
        color: selectedColor,
      });
      setEditingNoteId(null);
    } else {
      onAddNote({
        title: noteTitle.trim() || 'Untitled Note',
        content: noteContent.trim(),
        color: selectedColor,
      });
    }

    // Reset draft
    setNoteTitle('');
    setNoteContent('');
    setShowAddPanel(false);
  };

  // Start edit action
  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setSelectedColor(note.color);
    setShowAddPanel(true);

    const draftSection = document.getElementById('note-composer');
    if (draftSection) {
      draftSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Cancel form
  const handleCancel = () => {
    setNoteTitle('');
    setNoteContent('');
    setSelectedColor(NOTE_COLORS[0].class);
    setEditingNoteId(null);
    setShowAddPanel(false);
  };

  // Filter notes based on quicksearch criteria match
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Study Scratchpad & Sticky Notes
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pin formulas, vocabulary arrays, or general quick logs so you never lose high value memos.
          </p>
        </div>

        {!showAddPanel && (
          <button
            onClick={() => { setShowAddPanel(true); setEditingNoteId(null); }}
            id="btn-trigger-add-note"
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md transition-all self-start cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Write Log Note
          </button>
        )}
      </div>

      {/* Note Composer Panel */}
      {showAddPanel && (
        <div 
          id="note-composer"
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 md:p-6 rounded-2xl shadow-md animate-fadeIn"
        >
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50 dark:border-slate-850">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
              {editingNoteId ? 'Edit Draft Note' : 'Compose Scratchpad Note'}
            </h3>
            <button
              onClick={handleCancel}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitNote} className="space-y-4">
            <div>
              <input
                required
                type="text"
                placeholder="Note Title (e.g. History Exam Formulas)"
                value={noteTitle}
                id="note-title-input"
                onChange={e => setNoteTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-550 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold"
              />
            </div>

            <div>
              <textarea
                required
                rows={4}
                placeholder="Jot down notes, exam schedules, formula equations..."
                value={noteContent}
                id="note-content-input"
                onChange={e => setNoteContent(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
              />
            </div>

            {/* Sticky Color coding selection */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Choose Sticky Theme
              </label>
              <div className="flex flex-wrap gap-2">
                {NOTE_COLORS.map(color => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.class)}
                    id={`color-picker-${color.name.toLowerCase().replace(' ', '-')}`}
                    className={`h-7 px-3 text-xs font-semibold rounded-lg border flex items-center justify-between transition-all cursor-pointer ${color.class} ${
                      selectedColor === color.class
                        ? 'ring-2 ring-indigo-505 dark:ring-indigo-400 scale-102 border-indigo-300'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-805 text-slate-500 font-semibold rounded-xl text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-save-note"
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {editingNoteId ? 'Save Changes' : 'Pin Note'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lookup Notes bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-450" />
        <input
          type="text"
          placeholder="Lookup text in sticky notes..."
          value={searchQuery}
          id="search-notes-query"
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
        />
      </div>

      {/* Grid displays */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4">
          <FileText className="w-11 h-11 text-slate-250 dark:text-slate-705 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-705 dark:text-slate-350">No scratchpad stickies found</h3>
          <p className="text-xs text-slate-400 mt-1"> Jots, memos, and logs represent a clean way to store quick thoughts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map(note => {
            const displayDate = new Date(note.lastUpdated).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={note.id}
                id={`note-card-${note.id}`}
                className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[175px] shadow-sm hover:translate-y-[-2px] transition-all duration-300 ${note.color}`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-slate-805 dark:text-slate-100 font-bold text-sm tracking-tight lines-clamp-1 leading-tight">
                      {note.title}
                    </h3>

                    {/* Controller notes */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(note)}
                        id={`edit-note-btn-${note.id}`}
                        name={`edit-n-${note.id}`}
                        aria-label={`Edit note ${note.title}`}
                        className="p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-900 text-slate-500 hover:text-indigo-650 transition-all cursor-pointer"
                        title="Edit sticky content"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        id={`delete-note-btn-${note.id}`}
                        name={`delete-n-${note.id}`}
                        aria-label={`Delete note ${note.title}`}
                        className="p-1 rounded hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all cursor-pointer"
                        title="Discard sticky completely"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap lines-clamp-4">
                    {note.content}
                  </p>
                </div>

                {/* Subfooter showing time */}
                <span className="text-[10px] text-slate-400 font-semibold block pt-3 border-t border-slate-100/55 dark:border-slate-800/40 mt-4 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {displayDate}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
