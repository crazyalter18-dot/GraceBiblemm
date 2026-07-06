import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client (Lazy initialization to prevent startup crashes if key is missing)
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI spiritual helper features will operate in offline mock mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// AI endpoint for spiritual counseling, verse explanations, and sermon help
app.post("/api/gemini/ask", async (req, res) => {
  try {
    const { message, context, mode, history } = req.body;
    
    // Check if key is available
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        text: `Grace AI is currently offline (GEMINI_API_KEY not configured in Secrets). Here is a offline response:
\n\n"${message}" is a great topic! In the Bible, God encourages us to seek Him with all our heart. Let's study ${context?.book || 'Scripture'} together. Feel free to explore the reading plans or bookmark key verses!`,
        suggestedVerses: ["John 3:16", "Romans 8:28", "Psalm 23:1"]
      });
    }

    const ai = getAiClient();
    let prompt = "";
    
    if (mode === "explain") {
      prompt = `You are "Grace", an encouraging and wise Christian theologian and Bible study assistant.
The user wants you to explain the following verse(s) in simple terms:
${context?.verseText || ""} (from ${context?.book} ${context?.chapter}:${context?.verses || ""})

Note: The Myanmar Bible scripture text is from the classic and beloved Judson Translation (ဆရာကြီး ယုဒသံ ဘာသာပြန်). Please respect and align with this translation when explaining in Myanmar.

Provide:
1. Context & Meaning (What does this teach us?)
2. Life Application (How do we live this out today?)
3. Parallel Verses / Cross-references (1-2 related scripture references)

Keep the tone gentle, encouraging, and clear. Answer in ${context?.language === "my" ? "Myanmar (with clean Unicode)" : "English"}.`;
    } else if (mode === "devotional") {
      prompt = `You are "Grace", an encouraging Christian devotional writer.
Generate a beautiful, daily devotional study based on the following Bible verse:
${context?.verseText} (from ${context?.book} ${context?.chapter}:${context?.verses || ""})

Note: The Myanmar Bible scripture text is from the classic and beloved Judson Translation (ဆရာကြီး ယုဒသံ ဘာသာပြန်). Please respect and align with this translation when generating the study in Myanmar.

Please structure it nicely:
1. Daily Devotional Title
2. Morning Meditation & reflection
3. A beautiful short Prayer to pray today.

Answer in ${context?.language === "my" ? "Myanmar (with clean Unicode)" : "English"}.`;
    } else {
      // General spiritual/study counseling with message history
      prompt = `You are "Grace", an encouraging, compassionate Christian Bible teacher and companion.
Help the user with their Bible-related questions, life challenges, sermon outline preparation, or theological study.

Note: The Myanmar Bible translation used in this app is the classic and beloved Judson Translation (ဆရာကြီး ယုဒသံ ဘာသာပြန်). Keep this translation context in mind for any theological or scripture queries.

Current conversation history:
${history ? history.map((h: any) => `${h.sender === "user" ? "User" : "Grace"}: ${h.text}`).join("\n") : ""}
User asks: ${message}

Provide a thoughtful, scripturally sound response. Keep paragraphs readable and supportive. Frame it with elegant typography formatting (markdown). Focus strictly on encouraging, biblically-rooted guidance.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.75,
      },
    });

    const replyText = response.text || "Grace could not generate a response. Please try again.";
    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with Grace AI." });
  }
});

// Endpoint to search scriptures comprehensively across the entire Bible using Gemini semantic/text search
app.get("/api/bible/search", async (req, res) => {
  try {
    const query = (req.query.query as string || "").trim();
    if (!query || query.length < 2) {
      return res.json({ results: [] });
    }

    console.log(`Searching Bible via Gemini for: "${query}"...`);

    if (!process.env.GEMINI_API_KEY) {
      // If no API key, return empty to fallback to client offline search gracefully
      return res.json({ results: [] });
    }

    const ai = getAiClient();
    const prompt = `You are a precise, scholarly Bible search engine.
The user is searching for: "${query}"
Find the top 10 to 15 most relevant scripture verses from the Holy Bible matching this word, phrase, topic, or reference.
For each matching verse, you MUST return:
1. bookId: The exact book index (1 for Genesis, 2 for Exodus, ..., 66 for Revelation)
2. chapter: The chapter number
3. verse: The verse number
4. textEn: The precise text in the King James Version (KJV)
5. textMy: The precise text in the classic Judson Burmese Translation (ဆရာကြီး ယုဒသံ ဘာသာပြန်)

Respond strictly in a valid JSON array format. Do not write any markdown code blocks, explanatory text, or preamble outside the JSON array itself. Do not wrap the JSON in \`\`\`json.

Each item in the array must look exactly like this:
{
  "bookId": 1,
  "chapter": 1,
  "verse": 1,
  "textEn": "In the beginning God created the heaven and the earth.",
  "textMy": "အစဦး၌ ဘုရားသခင်သည် ကောင်းကင်နှင့် မြေကြီးကို ဖန်ဆင်းတော်မူ၏။"
}

Ensure the verses are genuine, correct, and correctly matched between English (KJV) and Myanmar (Judson).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.1,
      },
    });

    const text = response.text || "[]";
    let results = [];
    try {
      const jsonStr = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
      results = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("Failed to parse Gemini Bible search response:", text, parseErr);
    }

    if (Array.isArray(results)) {
      const validResults = results.map((item: any) => {
        const bookId = parseInt(item.bookId) || 1;
        const chapter = parseInt(item.chapter) || 1;
        const verse = parseInt(item.verse) || 1;
        return {
          verse: {
            bookId,
            chapter,
            verse,
            textEn: (item.textEn || "").trim(),
            textMy: (item.textMy || "").trim()
          }
        };
      }).filter(item => item.verse.textEn || item.verse.textMy);

      return res.json({ results: validResults });
    }

    return res.json({ results: [] });
  } catch (error: any) {
    console.error("Bible Search Endpoint Error:", error);
    res.status(500).json({ error: error.message || "Failed to search scriptures." });
  }
});

// Cache map to store retrieved chapters and avoid redundant API calls
const chapterCache = new Map<string, any[]>();

const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

// Endpoint to fetch real scriptures of a specific chapter
app.get("/api/bible/chapter", async (req, res) => {
  try {
    const bookId = parseInt(req.query.bookId as string);
    const chapter = parseInt(req.query.chapter as string);

    if (isNaN(bookId) || isNaN(chapter) || bookId < 1 || bookId > 66) {
      return res.status(400).json({ error: "Invalid bookId or chapter parameter." });
    }

    const cacheKey = `${bookId}-${chapter}`;
    if (chapterCache.has(cacheKey)) {
      return res.json({ verses: chapterCache.get(cacheKey) });
    }

    const bookName = BIBLE_BOOKS[bookId - 1];
    if (!bookName) {
      return res.status(404).json({ error: "Book name not found." });
    }

    console.log(`Fetching scriptures for ${bookName} Chapter ${chapter} via getBible API...`);
    try {
      const myUrl = `https://api.getbible.net/v2/judson/${bookId}/${chapter}.json`;
      const enUrl = `https://api.getbible.net/v2/kjv/${bookId}/${chapter}.json`;

      const [myRes, enRes] = await Promise.all([
        fetch(myUrl).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(enUrl).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      if (myRes && enRes && Array.isArray(myRes.verses) && Array.isArray(enRes.verses)) {
        const myVerses = myRes.verses;
        const enVerses = enRes.verses;
        
        // Collect all unique, valid integer verse numbers from both translations to prevent duplication/gaps
        const verseNumbersSet = new Set<number>();
        myVerses.forEach((v: any) => {
          const num = parseInt(v.verse);
          if (!isNaN(num)) verseNumbersSet.add(num);
        });
        enVerses.forEach((v: any) => {
          const num = parseInt(v.verse);
          if (!isNaN(num)) verseNumbersSet.add(num);
        });

        const sortedVerseNumbers = Array.from(verseNumbersSet).sort((a, b) => a - b);
        const merged: any[] = [];

        for (const vNum of sortedVerseNumbers) {
          const myV = myVerses.find((v: any) => parseInt(v.verse) === vNum);
          const enV = enVerses.find((v: any) => parseInt(v.verse) === vNum);

          merged.push({
            bookId,
            chapter,
            verse: vNum,
            textEn: enV && enV.text ? enV.text.trim() : "",
            textMy: myV && myV.text ? myV.text.trim() : ""
          });
        }

        // Sort by verse number
        merged.sort((a, b) => a.verse - b.verse);

        // Cache the result
        chapterCache.set(cacheKey, merged);
        console.log(`Successfully merged ${merged.length} verses from getBible API for ${bookName} ${chapter}.`);
        return res.json({ verses: merged });
      }
    } catch (apiErr) {
      console.warn("Failed to retrieve from getBible API, falling back to Gemini model:", apiErr);
    }

    if (!process.env.GEMINI_API_KEY) {
      // Return null so the client falls back to the deterministic dummy generator gracefully
      return res.json({ verses: null });
    }

    console.log(`Fetching scriptures for ${bookName} Chapter ${chapter} via Gemini fallback...`);
    const ai = getAiClient();
    const prompt = `You are a precise, scholarly Bible scripture database proxy.
Retrieve the COMPLETE, UNABRIDGED scriptures for the requested book and chapter.
Book: "${bookName}" (Book ID: ${bookId})
Chapter: ${chapter}

Translation requirements:
- English text MUST be the classic King James Version (KJV) exactly.
- Myanmar (Burmese) text MUST be the beloved, original Judson Translation (ဆရာကြီး ယုဒသံ ဘာသာပြန်၊ ၁၈၃၅) exactly. Ensure correct Burmese Unicode spelling and formatting.

Format of output:
You must respond with a JSON array of verse objects. Each object represents a single verse and must have the following exact keys: "verse", "textEn", "textMy".
Ensure you return all verses in the chapter (e.g. if the chapter has 25 verses, return exactly 25 objects in the array, sorted by verse number).
The textEn and textMy fields should contain the pure scripture text without any prepended verse numbers (e.g., do not prepend "[1]" or "1." inside the text).

Respond ONLY with the JSON array. Do not include markdown code block formatting (such as \`\`\`json).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.1, // extremely low temperature for accurate recall
        responseMimeType: "application/json"
      },
    });

    const text = response.text?.trim() || "";
    let jsonStr = text;
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.substring(7);
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.substring(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }
    jsonStr = jsonStr.trim();

    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Deduplicate parsed verses by verse number to prevent any AI duplication/hallucination
        const seenVerses = new Set<number>();
        const uniqueParsed = parsed.filter((item: any) => {
          const vNum = parseInt(item.verse);
          if (isNaN(vNum)) return false;
          if (seenVerses.has(vNum)) {
            return false;
          }
          seenVerses.add(vNum);
          return true;
        });

        const formattedVerses = uniqueParsed.map((item: any) => ({
          bookId,
          chapter,
          verse: parseInt(item.verse) || 1,
          textEn: item.textEn || "",
          textMy: item.textMy || ""
        }));

        // Sort by verse number
        formattedVerses.sort((a, b) => a.verse - b.verse);

        // Cache the result
        chapterCache.set(cacheKey, formattedVerses);

        return res.json({ verses: formattedVerses });
      }
    } catch (parseErr) {
      console.error("Failed to parse Gemini Bible JSON. Raw output was:", text);
    }

    return res.json({ verses: null });

  } catch (err: any) {
    console.error("Bible fetch error:", err);
    res.status(500).json({ error: err.message || "Failed to retrieve chapter." });
  }
});

// Start express with Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Grace Bible server is running at http://localhost:${PORT}`);
  });
}

startServer();
