/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Youtube,
  Search,
  BookOpen,
  Sparkles,
  Play,
  RotateCw,
  Trash2,
  Clock,
  ArrowRight,
  TrendingUp,
  X,
  AlertCircle
} from "lucide-react";
import { Lecture } from "../types";

interface DashboardProps {
  lectures: Lecture[];
  onSelectLecture: (id: string) => void;
  onAddLecture: (url: string, topicHint: string) => Promise<void>;
  onDeleteLecture: (id: string) => void;
  isAdding: boolean;
}

export default function Dashboard({
  lectures,
  onSelectLecture,
  onAddLecture,
  onDeleteLecture,
  isAdding,
}: DashboardProps) {
  const [url, setUrl] = useState("");
  const [topicHint, setTopicHint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!url) {
      setError("Please put a valid study link or video URL.");
      return;
    }
    try {
      await onAddLecture(url, topicHint);
      setUrl("");
      setTopicHint("");
    } catch (err: any) {
      setError(err.message || "Failed to submit course. Please check connection.");
    }
  };

  const filteredLectures = lectures.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.summaryShort.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12" id="dashboard-container">
      {/* Hero Section */}
      <div className="text-center mb-12 lg:mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-600 dark:text-neutral-300 mb-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
          <span>Syllabus Synthesis Platform</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-4 font-sans"
        >
          Lumina Study
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-sans font-light"
        >
          Transform lecture recordings, YouTube seminars, and educational links into high-retention interactive study packs.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Link input panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col gap-6"
          id="link-processor-panel"
        >
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              <span>Import Audio/Video Session</span>
            </h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 font-mono">
              YouTube URL parsed via Gemini pedagogical pipeline.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 font-mono tracking-wider">
                VIDEO OR LECTURE LINK
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full text-sm py-2.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 font-sans transition-all"
                  id="url-input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 font-mono tracking-wider">
                TOPIC HINT / COGNITIVE SCOPE (RECOMMENDED)
              </label>
              <input
                type="text"
                placeholder="e.g. Advanced Quantum Entanglement, MIT 6.001 Algorithms"
                value={topicHint}
                onChange={(e) => setTopicHint(e.target.value)}
                className="w-full text-sm py-2.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 font-sans transition-all"
                id="topic-input"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isAdding || !url}
              className={`w-full text-sm font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isAdding || !url
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                  : "bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold"
              }`}
              id="analyze-submit-button"
            >
              {isAdding ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Learning Assets...</span>
                </>
              ) : (
                <>
                  <span>Process Study Lecture</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 text-xs text-neutral-400 dark:text-neutral-500 flex flex-col gap-2 font-light">
            <span className="font-mono font-semibold text-neutral-500 dark:text-neutral-400">WHAT WE EXTRACT:</span>
            <div className="flex gap-4 flex-wrap">
              <span className="flex items-center gap-1">✦ Transcription</span>
              <span className="flex items-center gap-1">✦ Math LaTeX formulas</span>
              <span className="flex items-center gap-1">✦ Interactive Flashcards</span>
              <span className="flex items-center gap-1">✦ Diagnostic Quizzes</span>
            </div>
          </div>
        </motion.div>

        {/* Lectures library list */}
        <div className="lg:col-span-7 flex flex-col gap-6" id="library-panel">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 font-sans">
                <BookOpen className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                <span>Lecture Monograph Library</span>
                <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border dark:border-neutral-700 px-2.5 py-0.5 rounded-full font-mono font-medium">
                  {lectures.length}
                </span>
              </h2>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">
                Saved files accessible under sandbox cache.
              </p>
            </div>

            {/* Local search bar */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Query topic or field..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-905 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-900 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 p-0.5 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filteredLectures.length === 0 ? (
              <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center text-neutral-400 dark:text-neutral-505 flex flex-col items-center gap-3">
                <BookOpen className="h-8 w-8 text-neutral-350 dark:text-neutral-700 font-light" />
                <div>
                  <p className="text-sm font-medium">No processed study guides loaded.</p>
                  <p className="text-xs mt-0.5 opacity-80">Import a study link or clear your search input.</p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredLectures.map((lecture) => {
                  const isAnalyzing = lecture.status === "ANALYZING";
                  const isFailed = lecture.status === "FAILED";

                  return (
                    <motion.div
                      key={lecture.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-700 hover:shadow-md rounded-xl p-5 transition-all flex flex-col gap-3 relative"
                      id={`lecture-card-${lecture.id}`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                              {lecture.category}
                            </span>
                            <span className="text-neutral-300 dark:text-neutral-750 font-sans text-xs">•</span>
                            <span className="text-xs text-neutral-400 font-mono flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800/85 px-1.5 py-0.5 rounded border dark:border-neutral-700">
                              <Clock className="h-3 w-3" />
                              {lecture.duration}
                            </span>
                            {lecture.moduleName && (
                              <>
                                <span className="text-neutral-300 dark:text-neutral-750 font-sans text-xs">•</span>
                                <span className="text-xs text-neutral-400 font-mono font-medium">
                                  {lecture.moduleName}
                                </span>
                              </>
                            )}
                          </div>

                          <h3
                            onClick={() => !isAnalyzing && !isFailed && onSelectLecture(lecture.id)}
                            className={`text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1 cursor-pointer transition-colors ${
                              isAnalyzing || isFailed ? "cursor-default" : "hover:text-blue-600 dark:hover:text-neutral-300"
                            }`}
                          >
                            {lecture.title}
                          </h3>
                        </div>

                        {/* Status / Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDeleteLecture(lecture.id)}
                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/85 rounded-lg transition-all cursor-pointer text-neutral-400"
                            title="Remove Monograph"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          {isAnalyzing && (
                            <span className="text-xs font-mono font-semibold bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 px-2 py-1 rounded border border-blue-100 dark:border-blue-900 animate-pulse">
                              {lecture.progress}% ANALYSIS
                            </span>
                          )}

                          {isFailed && (
                            <span className="text-xs font-mono font-semibold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-450 px-2 py-1 rounded border border-red-100 dark:border-red-900">
                              ERROR
                            </span>
                          )}

                          {lecture.status === "READY" && (
                            <button
                              onClick={() => onSelectLecture(lecture.id)}
                              className="px-3 py-1.5 text-xs font-semibold bg-neutral-50 hover:bg-neutral-150 dark:bg-neutral-805 dark:hover:bg-neutral-705 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Play className="h-3 w-3 fill-current" />
                              <span>Study</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {lecture.summaryShort}
                      </p>

                      {/* Display live processing progress bar */}
                      {isAnalyzing && (
                        <div className="mt-2 flex flex-col gap-1">
                          <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: "10%" }}
                              animate={{ width: `${lecture.progress}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full bg-blue-500 rounded-full"
                            />
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 mt-0.5">
                            <RotateCw className="h-3 w-3 animate-spin text-blue-500" />
                            Analyzing narratives and extracting Math equations...
                          </span>
                        </div>
                      )}

                      {/* Display failure diagnostics */}
                      {isFailed && (
                        <div className="text-xs text-red-550 dark:text-red-400/90 font-sans bg-red-500/5 p-3 rounded-lg border border-red-500/10 mt-1">
                          {lecture.summaryFull}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
