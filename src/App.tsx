/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Lecture } from "./types";
import Dashboard from "./components/Dashboard";
import LectureView from "./components/LectureView";
import RecallStage from "./components/RecallStage";
import { BookOpen, Sparkles } from "lucide-react";

export default function App() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"dashboard" | "lecture" | "recall">("dashboard");
  const [recallMode, setRecallMode] = useState<"flashcards" | "quiz">("flashcards");

  // Load state helpers
  const [isAdding, setIsAdding] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // Fetch all monographs
  const fetchLectures = async () => {
    try {
      const res = await fetch("/api/lectures");
      if (res.ok) {
        const data = await res.json();
        setLectures(data);
      }
    } catch (err) {
      console.error("Failed to load study monographs database:", err);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  // Responsive polling mechanism: if there are lectures with "ANALYZING" status, poll every 2 seconds
  useEffect(() => {
    const hasAnalyzing = lectures.some((l) => l.status === "ANALYZING");
    if (!hasAnalyzing) return;

    const interval = setInterval(() => {
      fetchLectures();
    }, 2000);

    return () => clearInterval(interval);
  }, [lectures]);

  // Actions routing
  const handleSelectLecture = (id: string) => {
    setSelectedLectureId(id);
    setCurrentView("lecture");
  };

  const handleAddLecture = async (url: string, topicHint: string) => {
    setIsAdding(true);
    try {
      const res = await fetch("/api/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, topicHint }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit lecture.");
      }

      await fetchLectures();
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteLecture = async (id: string) => {
    try {
      const res = await fetch(`/api/lectures/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLectures((prev) => prev.filter((l) => l.id !== id));
        if (selectedLectureId === id) {
          setSelectedLectureId(null);
          setCurrentView("dashboard");
        }
      }
    } catch (err) {
      console.error("Failed to discard study session:", err);
    }
  };

  const handleUpdateFlashcard = async (
    flashcardId: string,
    difficulty?: "easy" | "good" | "hard",
    reviewState?: boolean
  ) => {
    if (!selectedLectureId) return;
    try {
      const res = await fetch(`/api/lectures/${selectedLectureId}/flashcards/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashcardId, difficulty, reviewState }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local list
        setLectures((prev) => prev.map((l) => (l.id === selectedLectureId ? data.lecture : l)));
      }
    } catch (err) {
      console.error("Failed to update active memory Leitner states:", err);
    }
  };

  const handleAskQuestion = async (question: string) => {
    if (!selectedLectureId) return;
    setIsResponding(true);
    try {
      const res = await fetch(`/api/lectures/${selectedLectureId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local logs list
        setLectures((prev) =>
          prev.map((l) =>
            l.id === selectedLectureId ? { ...l, chatHistory: data.chatHistory } : l
          )
        );
      }
    } catch (err) {
      console.error("Unable to query Smart Bot context companion:", err);
    } finally {
      setIsResponding(false);
    }
  };

  const activeLecture = lectures.find((l) => l.id === selectedLectureId);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 transition-colors duration-200 flex flex-col justify-between">
      
      {/* Universal header layout */}
      <header className="border-b border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex justify-between items-center">
          <div
            onClick={() => setCurrentView("dashboard")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="h-8 w-8 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-102">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white font-sans">
              Lumina Study
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-neutral-400 select-none bg-neutral-50 dark:bg-neutral-800 border dark:border-neutral-700 rounded px-2.5 py-0.5">
              PROTOTYPE V1.0
            </span>
          </div>
        </div>
      </header>

      {/* Main View Workspace Routing */}
      <main className="flex-1 pb-16">
        {currentView === "dashboard" && (
          <Dashboard
            lectures={lectures}
            onSelectLecture={handleSelectLecture}
            onAddLecture={handleAddLecture}
            onDeleteLecture={handleDeleteLecture}
            isAdding={isAdding}
          />
        )}

        {currentView === "lecture" && activeLecture && (
          <LectureView
            lecture={activeLecture}
            onBack={() => setCurrentView("dashboard")}
            onLaunchRecall={(mode) => {
              setRecallMode(mode);
              setCurrentView("recall");
            }}
            onAskQuestion={handleAskQuestion}
            isResponding={isResponding}
          />
        )}

        {currentView === "recall" && activeLecture && (
          <RecallStage
            lecture={activeLecture}
            mode={recallMode}
            onBack={() => setCurrentView("lecture")}
            onUpdateFlashcard={handleUpdateFlashcard}
          />
        )}
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-neutral-200/80 dark:border-neutral-900 py-6 text-center text-xs text-neutral-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; 2026 Lumina Study Platform. All permissions reserved.</span>
          <span className="flex items-center gap-1 opacity-80">
            <Sparkles className="h-3 w-3 text-yellow-500" /> Powered by Gemini-3.5-Flash
          </span>
        </div>
      </footer>
    </div>
  );
}
