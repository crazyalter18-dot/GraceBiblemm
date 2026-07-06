import React, { useState } from "react";
import { Bookmark, MessageSquare, Trash2, ArrowRight, Heart, Highlighter } from "lucide-react";
import { bibleService } from "../services/bibleService";
import { Bookmark as BookmarkType, VerseHighlight, VerseNote } from "../types";

interface BookmarksSectionProps {
  onNavigate: (tab: string, bookId?: number, chapter?: number) => void;
  uiLang: "en" | "my";
  bookmarks: BookmarkType[];
  onRemoveBookmark: (id: string) => void;
  highlights: VerseHighlight[];
  onRemoveHighlight: (id: string) => void;
  notes: VerseNote[];
  onRemoveNote: (id: string) => void;
}

export default function BookmarksSection({
  onNavigate,
  uiLang,
  bookmarks,
  onRemoveBookmark,
  highlights,
  onRemoveHighlight,
  notes,
  onRemoveNote
}: BookmarksSectionProps) {
  const [activeTab, setActiveTab] = useState<"bookmarks" | "highlights" | "notes">("bookmarks");

  // Helper to fetch details
  const getPassageMeta = (bookId: number, chapter: number, verseNum: number) => {
    const book = bibleService.getBook(bookId);
    // Fetch verse
    const chapterVerses = bibleService.getVerses(bookId, chapter);
    const verse = chapterVerses.find((v) => v.verse === verseNum);
    return { book, verse };
  };

  const t = {
    en: {
      title: "My Study Binder",
      desc: "Manage your saved scripture passages, colored highlights, and personal study journals.",
      tabBookmarks: "Bookmarks",
      tabHighlights: "Highlights",
      tabNotes: "Personal Notes",
      emptyBookmarks: "No bookmarked verses found yet. Tap on verses in the reader to bookmark them.",
      emptyHighlights: "No highlighted verses found yet. Style passages in the reader with different colors.",
      emptyNotes: "No personal study notes found yet. Record your spiritual insights on any verse in the reader.",
      delete: "Delete",
      navReader: "Open Passage",
      writtenOn: "Created on:"
    },
    my: {
      title: "ကျမ်းစာလေ့လာရေးမှတ်တမ်း",
      desc: "သိမ်းဆည်းထားသော ကျမ်းချက်များ၊ ရောင်စုံမှတ်သားချက်များနှင့် ကိုယ်ပိုင်သင်ခန်းစာမှတ်စုများကို စနစ်တကျကြည့်ရှုစီမံပါ။",
      tabBookmarks: "စာအုပ်ညှပ်များ",
      tabHighlights: "မှတ်သားချက်များ",
      tabNotes: "ကိုယ်ပိုင်မှတ်စုများ",
      emptyBookmarks: "စာအုပ်ညှပ်ထားသော ကျမ်းချက်များ မရှိသေးပါ။ ကျမ်းဖတ်ခန်း၌ ကျမ်းချက်များကိုနှိပ်၍ စာအုပ်ညှပ်နိုင်ပါသည်။",
      emptyHighlights: "ရောင်စုံမှတ်သားထားသော ကျမ်းချက်များ မရှိသေးပါ။ ကျမ်းဖတ်ခန်း၌ ကျမ်းချက်များကိုနှိပ်၍ အရောင်များ ခြယ်သနိုင်ပါသည်။",
      emptyNotes: "ကိုယ်ပိုင်မှတ်စုများ မရှိသေးပါ။ ကျမ်းဖတ်ခန်း၌ ကျမ်းချက်များကိုနှိပ်၍ သင့်ဝိညာဉ်ရေးရာ သွန်သင်ချက်များကို ရေးသားနိုင်ပါသည်။",
      delete: "ပယ်ဖျက်ရန်",
      navReader: "ကျမ်းဖတ်ခန်းသို့",
      writtenOn: "ရေးသားသည့်နေ့-"
    }
  }[uiLang];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      <div className="text-center space-y-2 max-w-xl mx-auto py-4">
        <h1 className="font-serif text-3xl font-bold text-slate-950 dark:text-gold-200">
          {t.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
          {t.desc}
        </p>
      </div>

      {/* Binder Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all ${
            activeTab === "bookmarks"
              ? "border-gold-500 text-gold-600 dark:text-gold-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Bookmark className="h-4 w-4" />
            {t.tabBookmarks} ({bookmarks.length})
          </div>
        </button>

        <button
          onClick={() => setActiveTab("highlights")}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all ${
            activeTab === "highlights"
              ? "border-gold-500 text-gold-600 dark:text-gold-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Highlighter className="h-4 w-4" />
            {t.tabHighlights} ({highlights.length})
          </div>
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all ${
            activeTab === "notes"
              ? "border-gold-500 text-gold-600 dark:text-gold-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            {t.tabNotes} ({notes.length})
          </div>
        </button>
      </div>

      {/* Binder Workspace */}
      <div className="space-y-4">
        
        {/* Bookmarks view */}
        {activeTab === "bookmarks" && (
          bookmarks.length > 0 ? (
            <div className="space-y-4">
              {bookmarks.map((b) => {
                const { book, verse } = getPassageMeta(b.bookId, b.chapter, b.verse);
                if (!book || !verse) return null;

                return (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <span className="text-xs font-bold text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-gold-950/20 px-2.5 py-1 rounded-lg inline-block">
                        {uiLang === "en" ? book.nameEn : book.nameMy} {b.chapter}:{b.verse}
                      </span>
                      <p className="text-sm text-slate-800 dark:text-slate-200 myanmar-font leading-relaxed">
                        {verse.textMy}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic font-serif leading-relaxed">
                        "{verse.textEn}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => onNavigate("bible", b.bookId, b.chapter)}
                        className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-gold-50 text-slate-700 dark:text-slate-300 hover:text-gold-600 transition-all inline-flex items-center gap-1"
                      >
                        {t.navReader} <ArrowRight className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onRemoveBookmark(b.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                        title={t.delete}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 text-xs font-light max-w-sm mx-auto leading-relaxed">
                {t.emptyBookmarks}
              </p>
            </div>
          )
        )}

        {/* Highlights view */}
        {activeTab === "highlights" && (
          highlights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highlights.map((h) => {
                const { book, verse } = getPassageMeta(h.bookId, h.chapter, h.verse);
                if (!book || !verse) return null;

                return (
                  <div
                    key={h.id}
                    className="rounded-2xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-gold-950/20 px-2 py-0.5 rounded-md">
                          {uiLang === "en" ? book.nameEn : book.nameMy} {h.chapter}:{h.verse}
                        </span>
                        
                        {/* Highlight color preview */}
                        <span className={`w-3 h-3 rounded-full ${h.color.split(" ")[0]} border border-slate-200/50`} />
                      </div>

                      <p className={`text-xs md:text-sm myanmar-font leading-relaxed p-2 rounded-xl ${h.color}`}>
                        {verse.textMy}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => onNavigate("bible", h.bookId, h.chapter)}
                        className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-gold-50 text-slate-600 dark:text-slate-300 hover:text-gold-600 transition-all"
                      >
                        {t.navReader}
                      </button>
                      <button
                        onClick={() => onRemoveHighlight(h.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                        title={t.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 text-xs font-light max-w-sm mx-auto leading-relaxed">
                {t.emptyHighlights}
              </p>
            </div>
          )
        )}

        {/* Notes view */}
        {activeTab === "notes" && (
          notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((n) => {
                const { book, verse } = getPassageMeta(n.bookId, n.chapter, n.verse);
                if (!book || !verse) return null;

                return (
                  <div
                    key={n.id}
                    className="rounded-2xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-gold-950/20 px-2.5 py-1 rounded-lg inline-block">
                          {uiLang === "en" ? book.nameEn : book.nameMy} {n.chapter}:{n.verse}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {t.writtenOn} {new Date(n.timestamp).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onNavigate("bible", n.bookId, n.chapter)}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-gold-500 transition-all"
                        >
                          {t.navReader}
                        </button>
                        <button
                          onClick={() => onRemoveNote(n.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                          title={t.delete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Note Body Quote & Verse Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-50 dark:border-slate-850">
                      <div className="md:col-span-2 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/10 border-l-4 border-blue-400 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-blue-500">Journal Note</span>
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          "{n.text}"
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1 text-slate-500 dark:text-slate-400">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Verse context</span>
                        <p className="truncate font-serif italic">"{verse.textEn}"</p>
                        <p className="truncate myanmar-font">"{verse.textMy}"</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 text-xs font-light max-w-sm mx-auto leading-relaxed">
                {t.emptyNotes}
              </p>
            </div>
          )
        )}

      </div>

    </div>
  );
}
