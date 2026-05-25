/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { readDb, writeDb } from "./src/server/db";
import { generateLectureStudyMaterial, askQuestionAboutLecture } from "./src/server/ai";
import { Lecture } from "./src/types";

// Polyfill dotenv just in case
import dotenv from "dotenv";
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Endpoints ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get all lectures
  app.get("/api/lectures", (req, res) => {
    try {
      const db = readDb();
      res.json(db.lectures);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get single lecture
  app.get("/api/lectures/:id", (req, res) => {
    try {
      const { id } = req.params;
      const db = readDb();
      const lecture = db.lectures.find((l) => l.id === id);
      if (!lecture) {
        return res.status(404).json({ error: "Lecture not found" });
      }
      res.json(lecture);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete lecture
  app.delete("/api/lectures/:id", (req, res) => {
    try {
      const { id } = req.params;
      const db = readDb();
      const filtered = db.lectures.filter((l) => l.id !== id);
      writeDb({ lectures: filtered });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update a flashcard difficulty or marked review state
  app.post("/api/lectures/:id/flashcards/review", (req, res) => {
    try {
      const { id } = req.params;
      const { flashcardId, difficulty, reviewState } = req.body;

      const db = readDb();
      const lectureIdx = db.lectures.findIndex((l) => l.id === id);
      if (lectureIdx === -1) {
        return res.status(404).json({ error: "Lecture not found" });
      }

      const fcIdx = db.lectures[lectureIdx].flashcards.findIndex((fc) => fc.id === flashcardId);
      if (fcIdx === -1) {
        return res.status(404).json({ error: "Flashcard not found" });
      }

      if (difficulty !== undefined) {
        db.lectures[lectureIdx].flashcards[fcIdx].difficulty = difficulty;
      }
      if (reviewState !== undefined) {
        db.lectures[lectureIdx].flashcards[fcIdx].reviewState = reviewState;
      }

      writeDb(db);
      res.json({ success: true, lecture: db.lectures[lectureIdx] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Ask question about lecture URL / context
  app.post("/api/lectures/:id/ask", async (req, res) => {
    try {
      const { id } = req.params;
      const { question } = req.body;

      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Question is required" });
      }

      const db = readDb();
      const lectureIdx = db.lectures.findIndex((l) => l.id === id);
      if (lectureIdx === -1) {
        return res.status(404).json({ error: "Lecture not found" });
      }

      const lecture = db.lectures[lectureIdx];

      // Call Gemini API to ask
      const answer = await askQuestionAboutLecture(lecture, question, lecture.chatHistory || []);

      // Append user & AI messages
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const userMsg = { sender: "user" as const, text: question, timestamp };
      const aiMsg = { sender: "ai" as const, text: answer, timestamp };

      if (!db.lectures[lectureIdx].chatHistory) {
        db.lectures[lectureIdx].chatHistory = [];
      }
      db.lectures[lectureIdx].chatHistory.push(userMsg, aiMsg);

      writeDb(db);
      res.json({ answer, chatHistory: db.lectures[lectureIdx].chatHistory });
    } catch (err: any) {
      console.error("Q&A Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Add new lecture via URL & prompt
  app.post("/api/lectures", async (req, res) => {
    try {
      const { url, topicHint } = req.body;

      if (!url) {
        return res.status(400).json({ error: "Source video/lecture URL is required" });
      }

      const newId = `lecture-${Date.now()}`;
      
      // Basic initial configuration showing up in study board as analyzing
      const newLecture: Lecture = {
        id: newId,
        title: topicHint || "Analyzing Lecture Content...",
        sourceUrl: url,
        category: "General Study",
        moduleName: "New Module",
        duration: "00:00",
        status: "ANALYZING",
        progress: 10,
        summaryShort: "Identifying core components and structure...",
        summaryFull: "Please wait while our structural study model maps the topics.",
        learningObjectives: [],
        keyConcept: { title: "Initiating...", body: "Processing video segments." },
        transcriptionSegments: [],
        formulas: [],
        flashcards: [],
        quizzes: [],
        chatHistory: [],
        createdAt: new Date().toISOString()
      };

      // Read, append and save initial lecture before long processing
      const db = readDb();
      db.lectures.unshift(newLecture);
      writeDb(db);

      // Return immediately to make user flow responsive, background processing kicks off!
      res.json({ success: true, lecture: newLecture });

      // Run Progressive Async Processing
      (async () => {
        try {
          // Step 1: Progress to 35%
          await new Promise((resolve) => setTimeout(resolve, 1500));
          let currentDb = readDb();
          let lIdx = currentDb.lectures.findIndex((l) => l.id === newId);
          if (lIdx !== -1) {
            currentDb.lectures[lIdx].progress = 35;
            currentDb.lectures[lIdx].summaryShort = "Transcribing narrative stream and matching concepts...";
            writeDb(currentDb);
          }

          // Step 2: Progress to 65%
          await new Promise((resolve) => setTimeout(resolve, 1500));
          currentDb = readDb();
          lIdx = currentDb.lectures.findIndex((l) => l.id === newId);
          if (lIdx !== -1) {
            currentDb.lectures[lIdx].progress = 65;
            currentDb.lectures[lIdx].summaryShort = "Extracting math equations and generating flashcards...";
            writeDb(currentDb);
          }

          // Step 3: Run Gemini Generation
          const generatedData = await generateLectureStudyMaterial(url, topicHint);

          // Step 4: Progress to 90%
          currentDb = readDb();
          lIdx = currentDb.lectures.findIndex((l) => l.id === newId);
          if (lIdx !== -1) {
            currentDb.lectures[lIdx].progress = 90;
            currentDb.lectures[lIdx].summaryShort = "Structuring practice diagnostic quizzes...";
            writeDb(currentDb);
          }

          // Step 5: Save fully ready lecture content at 100%
          await new Promise((resolve) => setTimeout(resolve, 1000));
          currentDb = readDb();
          lIdx = currentDb.lectures.findIndex((l) => l.id === newId);
          if (lIdx !== -1) {
            // Apply all structured assets
            const completeLecture: Lecture = {
              ...currentDb.lectures[lIdx],
              title: generatedData.title || currentDb.lectures[lIdx].title,
              category: generatedData.category || "General Study",
              moduleName: generatedData.moduleName || "General Course",
              duration: generatedData.duration || "24:00",
              status: "READY",
              progress: 100,
              summaryShort: generatedData.summaryShort || "Processed successful academic summary.",
              summaryFull: generatedData.summaryFull || "Comprehensive syllabus overview successfully calculated.",
              learningObjectives: generatedData.learningObjectives || [],
              keyConcept: generatedData.keyConcept || { title: "Essential Concept", body: "Explanation content placeholder" },
              transcriptionSegments: generatedData.transcriptionSegments || [],
              formulas: generatedData.formulas || [],
              flashcards: (generatedData.flashcards || []).map((fc: any, index: number) => ({
                id: `fc-${newId}-${index}`,
                question: fc.question,
                answer: fc.answer,
                difficulty: undefined as any,
                reviewState: false
              })),
              quizzes: (generatedData.quizzes || []).map((q: any, index: number) => ({
                id: `q-${newId}-${index}`,
                question: q.question,
                options: q.options,
                correctAnswerIndex: q.correctAnswerIndex,
                explanation: q.explanation
              })),
            };

            currentDb.lectures[lIdx] = completeLecture;
            writeDb(currentDb);
            console.log(`Lecture ${newId} completely successfully analyzed by Gemini!`);
          }
        } catch (err: any) {
          console.error("Async Analysis Error:", err);
          const currentDb = readDb();
          const lIdx = currentDb.lectures.findIndex((l) => l.id === newId);
          if (lIdx !== -1) {
            currentDb.lectures[lIdx].status = "FAILED";
            currentDb.lectures[lIdx].progress = 100;
            currentDb.lectures[lIdx].summaryShort = "Failed to process lecture content.";
            currentDb.lectures[lIdx].summaryFull = `Error encountered during Gemini analysis: ${err.message || err}`;
            writeDb(currentDb);
          }
        }
      })();

    } catch (err: any) {
      console.error("Creation Error:", err);
      res.status(500).json({ error: err.message });
    }
  });


  // --- Vite Middleware or Static Assets serving ---

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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
