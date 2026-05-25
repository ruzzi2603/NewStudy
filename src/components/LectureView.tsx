/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Search,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Zap,
  Bookmark,
  Share2,
  Copy,
  Check,
  Send,
  Code,
  Globe,
  Award,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Lecture, ChatMessage, Formula } from "../types";

interface LectureViewProps {
  lecture: Lecture;
  onBack: () => void;
  onLaunchRecall: (mode: "flashcards" | "quiz") => void;
  onAskQuestion: (question: string) => Promise<void>;
  isResponding: boolean;
}

type ActiveTab = "summary" | "transcription" | "formulas" | "quiz";

export default function LectureView({
  lecture,
  onBack,
  onLaunchRecall,
  onAskQuestion,
  isResponding,
}: LectureViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [transcriptionQuery, setTranscriptionQuery] = useState("");
  
  // Quiz states
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom when messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lecture.chatHistory, isResponding]);

  const handleCopyStudyGuide = () => {
    const objectives = lecture.learningObjectives.map((o) => `* ${o}`).join("\n");
    const formulas = lecture.formulas
      .map((f) => `### ${f.title}\nEquation: $$${f.latex}$$\nDescription: ${f.description}`)
      .join("\n\n");

    const guideText = `# ${lecture.title}
Category: ${lecture.category}
Course Module: ${lecture.moduleName}

## Executive Summary
${lecture.summaryFull}

## Core Learning Objectives
${objectives}

## Principal Mathematical/Physical Formulas
${formulas}

## Core Axiom / Key Concept
**${lecture.keyConcept.title}**: ${lecture.keyConcept.body}
`;

    navigator.clipboard.writeText(guideText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isResponding) return;
    onAskQuestion(chatInput.trim());
    setChatInput("");
  };

  const filteredSegments = lecture.transcriptionSegments.filter((seg) =>
    seg.text.toLowerCase().includes(transcriptionQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans flex flex-col gap-6" id="lecture-workspace">
      {/* Dynamic Navigation Line */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-850 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 border border-neutral-200 dark:border-neutral-750 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer"
            id="back-button"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-neutral-400 dark:text-neutral-550 uppercase">
                {lecture.category}
              </span>
              <span className="text-neutral-300 dark:text-neutral-750 text-xs">•</span>
              <span className="text-xs text-neutral-400 dark:text-neutral-550 font-mono">
                {lecture.duration} Duration
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1 font-sans">
              {lecture.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyStudyGuide}
            className="px-3 py-2 text-xs font-semibold bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg flex items-center gap-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-all cursor-pointer"
            id="copy-syllabus-btn"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span>Copied Study Pack!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Markdown Guide</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Control Bar + Goals */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Active Recall Callout */}
          <div className="bg-neutral-900 dark:bg-neutral-950 border border-neutral-800 rounded-xl p-5 text-white flex flex-col gap-4 relative overflow-hidden shadow-sm">
            <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-3 translate-y-3">
              <Zap className="h-28 w-28 text-white stroke-[0.5]" />
            </div>
            
            <div>
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
                ACTIVE RECALL STAGE
              </span>
              <h3 className="text-lg font-bold tracking-tight mt-1 font-sans">
                Neural Retention
              </h3>
              <p className="text-xs text-neutral-300 mt-1 font-light">
                Leverage spaced repetition algorithms based on Leitner active memory methods.
              </p>
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <button
                onClick={() => onLaunchRecall("flashcards")}
                className="w-full py-2 bg-white text-neutral-900 text-xs font-bold rounded-lg hover:bg-neutral-100 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                id="recall-flashcards-btn"
              >
                <Zap className="h-3.5 w-3.5 text-amber-500 fill-current" />
                <span>Flashcards Mode</span>
              </button>
              
              <button
                onClick={() => onLaunchRecall("quiz")}
                className="w-full py-2 bg-neutral-800 text-neutral-100 hover:bg-neutral-700 text-xs font-bold rounded-lg border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                id="recall-quiz-btn"
              >
                <Award className="h-3.5 w-3.5 text-blue-400" />
                <span>Mastery Quiz Mode</span>
              </button>
            </div>
          </div>

          {/* Key concept bento */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 flex flex-col gap-3">
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-bold">
              CENTRAL AXIOM
            </span>
            <h4 className="text-sm font-bold text-neutral-950 dark:text-neutral-150">
              {lecture.keyConcept.title}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans leading-relaxed">
              {lecture.keyConcept.body}
            </p>
          </div>

          {/* Interactive stats */}
          <div className="bg-neutral-50 dark:bg-neutral-905 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 flex flex-col gap-4">
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-bold">
              STUDY PROFILE
            </span>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 dark:text-neutral-400 font-sans">Total Flashcards</span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                  {lecture.flashcards.length}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 dark:text-neutral-400 font-sans">Diagnostic Tests</span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                  {lecture.quizzes.length}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 dark:text-neutral-400 font-sans">Formulas Extracted</span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                  {lecture.formulas.length}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Middle Syllabus Panels & Tabs */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Dynamic Tabs list bar */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-800 text-sm gap-2">
            {[
              { id: "summary", label: "Summary Monograph", icon: FileText },
              { id: "transcription", label: "Syllabus Transcript", icon: BookOpen },
              { id: "formulas", label: "Formulas & Proofs", icon: Code },
              { id: "quiz", label: "Diagnostic Exam", icon: HelpCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    isActive
                      ? "border-neutral-900 dark:border-neutral-50 text-neutral-950 dark:text-neutral-50"
                      : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-350"
                  }`}
                  id={`tab-${tab.id}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab contents block */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 min-h-[450px]">
            <AnimatePresence mode="wait">
              {activeTab === "summary" && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      <span>Executive Study Synopsis</span>
                    </h2>
                    <p className="text-sm text-neutral-400 dark:text-neutral-500 font-mono">
                      Calculated from video audio sequence.
                    </p>
                  </div>

                  <p className="text-sm text-neutral-700 dark:text-neutral-350 leading-relaxed font-sans font-light bg-neutral-50 dark:bg-neutral-950/20 p-4 border dark:border-neutral-800 rounded-lg">
                    {lecture.summaryFull}
                  </p>

                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 font-mono tracking-wider">
                      COURSE OBJECTIVES FOCUS MAPS
                    </h3>
                    
                    <div className="flex flex-col gap-2">
                      {lecture.learningObjectives.map((objective, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                        >
                          <CheckCircle className="h-4.5 w-4.5 text-green-500 shrink-0 mt-0.5" />
                          <span>{objective}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "transcription" && (
                <motion.div
                  key="transcription"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      Narrative Transcript Mapping
                    </h2>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                      Corresponds to absolute audio markers.
                    </p>
                  </div>

                  {/* Transcript query search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search narrative context..."
                      value={transcriptionQuery}
                      onChange={(e) => setTranscriptionQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none transition-all font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
                    {filteredSegments.length === 0 ? (
                      <p className="text-xs text-neutral-400 text-center py-8">
                        No segments match your transcription query.
                      </p>
                    ) : (
                      filteredSegments.map((seg, idx) => (
                        <div
                          key={idx}
                          className="flex gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-850 p-2 rounded transition-colors"
                        >
                          <span className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded h-fit text-neutral-500 dark:text-neutral-450 border dark:border-neutral-700">
                            {seg.time}
                          </span>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed flex-1">
                            {seg.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "formulas" && (
                <motion.div
                  key="formulas"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      Scientific Formulations & Explanations
                    </h2>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                      Mathematical & Physics proof formulas extracted with variables.
                    </p>
                  </div>

                  {lecture.formulas.length === 0 ? (
                    <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-10 text-center text-neutral-400 dark:text-neutral-500 text-xs">
                      No mathematical or physics formulas detected in this specific session.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {lecture.formulas.map((formula, idx) => (
                        <div
                          key={idx}
                          className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col gap-4 hover:shadow-xs transition-shadow bg-neutral-50/50 dark:bg-neutral-950/10"
                        >
                          <div>
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-150">
                              {formula.title}
                            </h4>
                          </div>

                          {/* Raw math display */}
                          <div className="font-mono text-center text-lg bg-neutral-900 text-neutral-100 dark:bg-neutral-950 p-4 rounded-lg font-semibold overflow-x-auto border border-neutral-850 shadow-inner">
                            {formula.latex}
                          </div>

                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {formula.description}
                          </p>

                          {/* Variables analysis */}
                          {formula.variables && formula.variables.length > 0 && (
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-850 p-3 rounded-lg flex flex-col gap-2">
                              <span className="text-[10px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase font-semibold">
                                VARIABLES INTERPRETATION
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {formula.variables.map((v, vIdx) => (
                                  <div key={vIdx} className="flex gap-2">
                                    <span className="font-mono font-bold text-blue-500">{v.name}</span>
                                    <span className="text-neutral-400 dark:text-neutral-500">:</span>
                                    <span className="text-neutral-600 dark:text-neutral-400">{v.explanation}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Practical Application */}
                          {formula.application && (
                            <div className="flex gap-1 text-xs text-neutral-500">
                              <span className="font-bold font-mono text-[10px] uppercase text-neutral-400 dark:text-neutral-500">
                                CASE USE:
                              </span>
                              <span>{formula.application}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "quiz" && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      Syllabus Diagnostic Quiz
                    </h2>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                      Check retention level before launching recall mode.
                    </p>
                  </div>

                  <div className="flex flex-col gap-6">
                    {lecture.quizzes.map((q, idx) => {
                      const selectedOpt = userAnswers[q.id];
                      const isCorrect = selectedOpt === q.correctAnswerIndex;
                      
                      return (
                        <div
                          key={q.id}
                          className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 flex flex-col gap-4"
                        >
                          <div className="flex items-start gap-2">
                            <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono text-xs px-2 py-0.5 rounded font-bold">
                              Q{idx + 1}
                            </span>
                            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              {q.question}
                            </h4>
                          </div>

                          {/* Options */}
                          <div className="flex flex-col gap-2">
                            {q.options.map((option, optIdx) => {
                              const isSelected = selectedOpt === optIdx;
                              const showSuccess = submittedQuiz && optIdx === q.correctAnswerIndex;
                              const showFailure = submittedQuiz && isSelected && !isCorrect;

                              let btnStyle = "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300";
                              if (isSelected && !submittedQuiz) {
                                btnStyle = "border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900";
                              } else if (showSuccess) {
                                btnStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300";
                              } else if (showFailure) {
                                btnStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300";
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={submittedQuiz}
                                  onClick={() => {
                                    setUserAnswers({ ...userAnswers, [q.id]: optIdx });
                                  }}
                                  className={`w-full py-2.5 px-3 rounded-lg border text-left text-xs font-medium cursor-pointer transition-all ${btnStyle}`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>

                          {/* Diagnostic feedback */}
                          {submittedQuiz && selectedOpt !== undefined && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className={`p-3.5 rounded-lg border text-xs flex flex-col gap-1.5 ${
                                isCorrect
                                  ? "bg-green-500/5 border-green-550/20 text-green-750 dark:text-green-350"
                                  : "bg-red-500/5 border-red-550/20 text-red-750 dark:text-red-350"
                              }`}
                            >
                              <span className="font-bold flex items-center gap-1">
                                {isCorrect ? "Correct answer!" : "Incorrect option choice"}
                              </span>
                              <p className="opacity-90">{q.explanation}</p>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!submittedQuiz ? (
                    <button
                      onClick={() => setSubmittedQuiz(true)}
                      disabled={Object.keys(userAnswers).length < lecture.quizzes.length}
                      className={`w-full py-3 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        Object.keys(userAnswers).length < lecture.quizzes.length
                          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                          : "bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-bold"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                      <span>Submit Answers</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSubmittedQuiz(false);
                        setUserAnswers({});
                      }}
                      className="w-full py-3 border border-neutral-350 hover:bg-neutral-50 dark:border-neutral-750 dark:hover:bg-neutral-800 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer transition-all"
                    >
                      Reset and Try Again
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Chat Q&A Frame (Right side) */}
        <div className="lg:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col gap-4 shadow-sm min-h-[450px]" id="qa-chatter-panel">
          <div className="flex flex-col gap-1 border-b border-neutral-100 dark:border-neutral-850 pb-3">
            <span className="text-[10px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase font-semibold">
              SMART STUDY MATE
            </span>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
              <MessageSquare className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              <span>Syllabus Q&A</span>
            </h3>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              Ask deep conceptual questions about proofs or topics directly.
            </p>
          </div>

          {/* Chat scroll box */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[300px] text-xs pr-1">
            {(!lecture.chatHistory || lecture.chatHistory.length === 0) ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-400 dark:text-neutral-500 gap-2 h-full py-16">
                <Sparkles className="h-5 w-5 text-neutral-350 dark:text-neutral-750 animate-pulse" />
                <p className="text-[11px]">No query chat active. Submit a question to verify concepts.</p>
              </div>
            ) : (
              lecture.chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1 max-w-[85%] ${
                    msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-lg leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-tr-none"
                        : "bg-neutral-50 dark:bg-neutral-805 text-neutral-800 dark:text-neutral-200 rounded-tl-none border dark:border-neutral-750"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-neutral-400 font-mono tracking-wider">
                    {msg.sender === "user" ? "You" : "Lumina Bot"} • {msg.timestamp}
                  </span>
                </div>
              ))
            )}

            {isResponding && (
              <div className="self-start flex flex-col gap-1 items-start bg-neutral-50 dark:bg-neutral-805 p-3 rounded-lg border dark:border-neutral-750 max-w-[85%]">
                <div className="flex gap-1.5 items-center">
                  <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" />
                  <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Submission Input form */}
          <form onSubmit={handleSendChat} className="flex gap-2 border-t border-neutral-100 dark:border-neutral-850 pt-3">
            <input
              type="text"
              placeholder="Ask about formulas / theories..."
              value={chatInput}
              disabled={isResponding}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 text-xs py-2 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 transition-all font-sans"
              id="chat-input"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isResponding}
              className={`p-2 rounded-lg cursor-pointer transition-all flex items-center justify-center ${
                !chatInput.trim() || isResponding
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                  : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
              }`}
              id="send-chat-btn"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
