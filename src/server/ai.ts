/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Lecture } from "../types.js";

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "dummy-key") {
    throw new Error(
      "GEMINI_API_KEY is not configured or is invalid. Please add a valid Gemini API Key under the Secrets panel in the AI Studio Settings."
    );
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * Uses Gemini to generate complete, high-quality study materials based on a URL & user topic input.
 */
export async function generateLectureStudyMaterial(
  url: string,
  topicHint: string
): Promise<Partial<Lecture>> {
  const client = getAiClient();

  const prompt = `
    Analyze the following Educational Video details and generate a comprehensive, highly detailed study material package.
    Video URL: ${url}
    Topic Hint or Video Title: ${topicHint || "General educational content"}

    Please provide a thorough study package. Ensure formulas are formatted in clear mathematical LaTeX equations (e.g. "E = mc^2" or "\\Psi(x,t)"). Make sure explanations are academic and precise.
  `;

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: `You are an elite, senior university pedagogical designer. Your goal is to construct absolute masterpieces of study materials.
Always provide rich explanations, realistic transcription segments with timestamps (e.g. "01:20"), useful formulas with application cases, interactive flashcards, and diagnostic multiple-choice quizzes with detailed explanations of why the correct answer is right and others are wrong. Only output in the requested JSON scheme.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "The official academic title of this video or lecture.",
          },
          category: {
            type: Type.STRING,
            description: "Category or field of study, e.g. Quantum Computing, Machine Learning, World History.",
          },
          moduleName: {
            type: Type.STRING,
            description: "Module or course name placeholder, e.g. Advanced AI, Intro Physics.",
          },
          duration: {
            type: Type.STRING,
            description: "Plausible format of video duration, e.g. '34:20' or '1:12:00'.",
          },
          summaryShort: {
            type: Type.STRING,
            description: "A single, highly punchy, scannable summary sentence summarizing the core takeaway.",
          },
          summaryFull: {
            type: Type.STRING,
            description: "A comprehensive, high-quality multi-sentence background summary outlining what was discussed.",
          },
          learningObjectives: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List 3-4 specific academic learning objectives that the user will master.",
          },
          keyConcept: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              body: { type: Type.STRING },
            },
            required: ["title", "body"],
          },
          transcriptionSegments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING, description: "Timestamp in MM:SS format, e.g. '00:00'." },
                text: { type: Type.STRING, description: "The transcribed voice or narration for this segment." },
              },
              required: ["time", "text"],
            },
          },
          formulas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Formula name, e.g., Euler's Identity." },
                latex: { type: Type.STRING, description: "Pure LaTeX code without surrounding dollar signs." },
                description: { type: Type.STRING, description: "Concise description of what this formula computes." },
                variables: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "The symbol, e.g. 'E' or '\\rho'." },
                      explanation: { type: Type.STRING, description: "Explanation of this variable." },
                    },
                    required: ["name", "explanation"],
                  },
                },
                application: { type: Type.STRING, description: "Practical cases and usage of this formula." },
              },
              required: ["title", "latex", "description"],
            },
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "Clear conceptual query." },
                answer: { type: Type.STRING, description: "Thorough, clear answer to the flashcard question." },
              },
              required: ["question", "answer"],
            },
          },
          quizzes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 3 distinct multiple choice options.",
                },
                correctAnswerIndex: { type: Type.INTEGER, description: "0-based index of the correct option." },
                explanation: { type: Type.STRING, description: "Thorough explanation of correct choice vs distractors." },
              },
              required: ["question", "options", "correctAnswerIndex", "explanation"],
            },
          },
        },
        required: [
          "title",
          "category",
          "moduleName",
          "duration",
          "summaryShort",
          "summaryFull",
          "learningObjectives",
          "keyConcept",
          "transcriptionSegments",
          "formulas",
          "flashcards",
          "quizzes",
        ],
      },
    },
  });

  const rawText = response.text || "{}";
  try {
    return JSON.parse(rawText.trim());
  } catch (err) {
    console.error("Failed to parse Gemini generated json response", rawText, err);
    throw new Error("Invalid output received from the learning structure synthesis agent.");
  }
}

/**
 * Answer standard questions about a lecture using the lecture content as context.
 */
export async function askQuestionAboutLecture(
  lecture: Lecture,
  question: string,
  history: { sender: string; text: string }[]
): Promise<string> {
  const client = getAiClient();

  const historyText = history
    .map((msg) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
    .join("\n");

  const prompt = `
    Context Lecture:
    Title: ${lecture.title}
    Category: ${lecture.category}
    Summary: ${lecture.summaryFull}
    Objectives: ${lecture.learningObjectives.join("; ")}
    Key Concept: ${lecture.keyConcept.title} - ${lecture.keyConcept.body}
    Formulas: ${JSON.stringify(lecture.formulas)}

    Message History:
    ${historyText}

    User Question:
    ${question}

    Provide an inspiring, highly academic, yet clear and scannable answer directly related to the lecture context.
    Highlight formulas or values where appropriate. Support LaTeX syntax (e.g. $F = ma$) for inline math.
  `;

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are the smart study companion. Keep answers professional, concise, clearly formatted using markdown, and strictly grounded in the provided lecture. Do not hallucinate external details.",
    },
  });

  return response.text || "I was unable to synthesize an answer. Please rephrase your question.";
}
