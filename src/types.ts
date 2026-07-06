/**
 * Grace Bible TS Type Definitions
 */

export type Testament = "OT" | "NT";

export interface BibleBook {
  id: number; // 1 to 66
  nameEn: string;
  nameMy: string;
  abbrevEn: string;
  abbrevMy: string;
  testament: Testament;
  totalChapters: number;
}

export interface BibleVerse {
  bookId: number;
  chapter: number;
  verse: number;
  textEn: string;
  textMy: string;
}

export interface Bookmark {
  id: string; // e.g., "book-chapter-verse"
  bookId: number;
  chapter: number;
  verse: number;
  timestamp: number;
}

export interface VerseHighlight {
  id: string; // e.g., "book-chapter-verse"
  bookId: number;
  chapter: number;
  verse: number;
  color: string; // Tailwind color name or hex (e.g. 'bg-yellow-200/60')
  timestamp: number;
}

export interface VerseNote {
  id: string; // e.g., "book-chapter-verse"
  bookId: number;
  chapter: number;
  verse: number;
  text: string;
  timestamp: number;
}

export interface ReadingHistory {
  bookId: number;
  chapter: number;
  timestamp: number;
}

export interface PassageReference {
  bookId: number;
  chapter: number;
  verses?: string; // e.g., "1-10"
}

export interface PlanDayReading {
  day: number;
  passages: PassageReference[];
}

export interface ReadingPlan {
  id: string;
  nameEn: string;
  nameMy: string;
  durationDays: number;
  descriptionEn: string;
  descriptionMy: string;
  readings: PlanDayReading[];
}

export interface ReadingPlanProgress {
  planId: string;
  completedDays: number[]; // Array of day numbers completed (e.g., [1, 2, 3])
  startDate: number;
}

export interface DictionaryEntry {
  wordEn: string;
  wordMy: string;
  definitionEn: string;
  definitionMy: string;
  references: string[]; // List of reference strings, e.g. ["Genesis 1:1", "John 1:1"]
}

export interface QuizQuestion {
  id: number;
  questionEn: string;
  questionMy: string;
  optionsEn: string[];
  optionsMy: string[];
  answerIndex: number;
  citation: string;
}

export interface BibleSettings {
  primaryLanguage: "en" | "my" | "bilingual"; // English, Myanmar, Side-by-side
  uiLanguage: "en" | "my";
  fontSize: number; // in pixels (e.g., 16, 18, 20, 24)
  theme: "light" | "dark" | "sepia";
  dailyNotification: boolean;
}
