/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { Lecture } from "../types.js";

const DB_PATH = path.join(process.cwd(), "db.json");

const defaultLectures: Lecture[] = [
  {
    id: "lecture-1",
    title: "Quantum Entanglement and Information Theory",
    sourceUrl: "https://www.youtube.com/watch?v=zN_3EAsbyNo",
    category: "Advanced Physics",
    moduleName: "Module 4",
    duration: "42:15",
    status: "READY",
    progress: 100,
    summaryShort: "A deep dive into the mathematical foundations of EPR paradox and Bell's inequality in the context of modern quantum computing.",
    summaryFull: "This lecture introduces quantum entanglement, exploring the EPR paradox that troubled the founders of quantum mechanics, and dives into the mathematics of the Bell States. We analyze the Bell's inequality (CHSH formulation) and show how experimental violations of local realism prove that quantum information is non-locally distributed, serving as the raw material for quantum teleportation and cryptography like QKD.",
    learningObjectives: [
      "Defining non-locality in quantum mechanics vs classic local realism",
      "Deriving and understanding the CHSH formulation of Bell's Inequality",
      "Analyzing applications of entanglement in Quantum Key Distribution (QKD)"
    ],
    keyConcept: {
      title: "The Bell State",
      body: "The Bell states are four specific maximally entangled quantum states of two qubits. They represent the simplest possible examples of quantum entanglement."
    },
    transcriptionSegments: [
      { time: "00:00", text: "Good morning everyone. Today we're diving into what Einstein famously called 'spooky action at a distance.' We'll start with the EPR paradox." },
      { time: "04:30", text: "When we speak about entanglement, we aren't just saying things are related. We are saying that the information itself is distributed globally across the wave function." },
      { time: "12:15", text: "Now let's look at the mathematics of Bell States. If we have two qubits in a singlet state, we can write down the wavefunction as the superposition of anti-correlated spin states." },
      { time: "28:50", text: "In 1964, John Stewart Bell showed that any local hidden-variable theory must satisfy a mathematical limit, which we'll derive here. Quantum mechanics violates this limit." },
      { time: "38:00", text: "In conclusion, this violation isn't a bug; it is the core resource powering everything from teleportation to military-grade quantum cryptography." }
    ],
    formulas: [
      {
        title: "Singlet State Wavefunction",
        latex: "|\\psi^-\\rangle = \\frac{1}{\\sqrt{2}} (|01\\rangle - |10\\rangle)",
        description: "Represents a pair of entangled qubits with zero total angular momentum. Measuring one qubit instantly collapses the other into the opposite state.",
        variables: [
          { name: "|\\psi^-\\rangle", explanation: "The state vector of the system" },
          { name: "|01\\rangle, |10\\rangle", explanation: "Computational basis states" }
        ],
        application: "Used as the primary entangled channel in quantum teleportation and E91 cryptography."
      },
      {
        title: "Bell's Inequality (CHSH)",
        latex: "|E(a,b) - E(a,b')| + |E(a',b) + E(a',b')| \\leq 2",
        description: "The mathematical inequality under local realism constraint. Quantum mechanics achieves a Tsirelson limit of 2\\sqrt{2}, proving non-locality.",
        variables: [
          { name: "E(x,y)", explanation: "Expectation value of joint measurements at detector angles x and y" },
          { name: "a, a', b, b'", explanation: "Measurement settings for Alice's and Bob's detectors" }
        ],
        application: "Used in device-independent quantum cryptography to check if an eavesdropper is intercepting the key."
      }
    ],
    flashcards: [
      { id: "fc-1-1", question: "What is quantum entanglement?", answer: "A physical phenomenon where multiple particles interact such that the quantum state of each particle cannot be described independently of the others." },
      { id: "fc-1-2", question: "What limit does local realism place on CHSH?", answer: "Under local realism, the CHSH sum must be less than or equal to 2." },
      { id: "fc-1-3", question: "What is the maximum quantum violation value of the CHSH inequality?", answer: "Quantum mechanics can violate the inequality up to 2\\sqrt{2} (~2.828), which is known as Tsirelson's bound." },
      { id: "fc-1-4", question: "Name a real-world application of Bell's Theorem.", answer: "Device-unique Quantum Key Distribution (QKD) protocols like Ekert91." }
    ],
    quizzes: [
      {
        id: "q-1-1",
        question: "Which of the following best describes the 'EPR Paradox' conclusion regarding local realism?",
        options: [
          "Quantum mechanics is complete but non-local.",
          "Quantum mechanics must be incomplete because local realism is preserved.",
          "Bell's Theorem proves that physical hidden variables must exist."
        ],
        correctAnswerIndex: 1,
        explanation: "Einstein, Podolsky, and Rosen argued that physical reality should be local and complete, thus quantum mechanics' non-local predictions must imply the theory is incomplete."
      },
      {
        id: "q-1-2",
        question: "What is the classical limit for the CHSH inequality versus the quantum Tsirelson limit?",
        options: [
          "Classical limit is 1, Quantum is 2",
          "Classical limit is 2, Quantum is 2.82",
          "Classical limit is 4, Quantum is 8"
        ],
        correctAnswerIndex: 1,
        explanation: "Under local realism (classical physics), the CHSH sum is <= 2. Quantum entangled states violate this, reaching up to 2*sqrt(2) ≈ 2.82."
      }
    ],
    chatHistory: [],
    createdAt: new Date().toISOString()
  },
  {
    id: "lecture-2",
    title: "Advanced Data Structures and Algorithms",
    sourceUrl: "https://www.youtube.com/watch?v=RBSGKlAia30",
    category: "Computer Science",
    moduleName: "MIT 6.001",
    duration: "42:15",
    status: "READY",
    progress: 100,
    summaryShort: "Analyzing amortized runtime efficiency, splay tree rotations, and implementing sub-linear query Fibonacci heaps.",
    summaryFull: "This lecture presents advanced mechanisms for balancing performance. We explore amortized cost analysis using the potential method and prove bounds on self-adjusting data structures, primarily splay trees and Fibonacci heaps, demonstrating performance boosts in network routing algorithms.",
    learningObjectives: [
      "Explain the Potential Method of amortized analysis",
      "Demonstrate splay tree zig-zig and zig-zag rotation effects",
      "Contrast Fibonacci heaps with standard Binary heaps for Dijkstra"
    ],
    keyConcept: {
      title: "Amortized Analysis",
      body: "Amortized analysis guarantees the average performance of each operation in the worst-case sequence of operations, bypassing overly pessimistic individual bounds."
    },
    transcriptionSegments: [
      { time: "00:00", text: "Today we take dynamic sizing and tree indexing to the absolute limit." },
      { time: "10:30", text: "We define our potential function Phi. If an operation is cheap, it deposits energy; if it is expensive, we spend this stored potential energy." }
    ],
    formulas: [
      {
        title: "Amortized Cost Definition",
        latex: "\\hat{c}_i = c_i + \\Phi(D_i) - \\Phi(D_{i-1})",
        description: "Defines the amortized cost of the i-th step, balancing actual cost with the change in potential of the data structure.",
        variables: [
          { name: "\\hat{c}_i", explanation: "Amortized cost" },
          { name: "c_i", explanation: "Actual execution cost of the operation" },
          { name: "\\Phi(D)", explanation: "Calculated state potential function" }
        ],
        application: "Used under the Potential Method to prove O(log N) amortized splay tree access bounds."
      }
    ],
    flashcards: [
      { id: "fc-2-1", question: "What is a Splay Tree?", answer: "A self-adjusting binary search tree where recently accessed elements are quickly moved to the root via splay rotations." }
    ],
    quizzes: [
      {
        id: "q-2-1",
        question: "Under the potential method, what does it mean if Phi(D_i) - Phi(D_i-1) is positive?",
        options: [
          "The operation made the structure simpler, releasing potential.",
          "The operation built up potential inside the structure, storing credits.",
          "The database crashed during access."
        ],
        correctAnswerIndex: 1,
        explanation: "A positive delta potential indicates that some work was stored as credit inside the database representation for later expensive steps."
      }
    ],
    chatHistory: [],
    createdAt: new Date().toISOString()
  },
  {
    id: "lecture-3",
    title: "Modernist Philosophy in 20th Century Design",
    sourceUrl: "https://www.youtube.com/watch?v=Nn_-4Xp38sc",
    category: "Architecture",
    moduleName: "History 101",
    duration: "1:24:00",
    status: "READY",
    progress: 100,
    summaryShort: "A historical dissection of Bauhaus, minimalist architecture, Bauhaus masteries, and functional aesthetics.",
    summaryFull: "We trace modernist design through the mid-20th century. Focusing on Ludwig Mies van der Rohe's 'less is more' and Walter Gropius at the Weimar Bauhaus school, we analyze the integration of technological mass production with pure form.",
    learningObjectives: [
      "Critically explain Gropius' Bauhaus manifesto",
      "Recognize Mies van der Rohe's steel-and-glass structural minimalism",
      "Understand the economic factors of postwar residential design"
    ],
    keyConcept: {
      title: "Form Follows Function",
      body: "The design principle stating that the shape of a building or object should be primarily based upon its intended function or purpose, eliminating useless ornamentation."
    },
    transcriptionSegments: [
      { time: "00:00", text: "We trace how industrial fabrication completely shook up structural philosophy." }
    ],
    formulas: [],
    flashcards: [
      { id: "fc-3-1", question: "Who coined 'Less is More'?", answer: "Architect Ludwig Mies van der Rohe." }
    ],
    quizzes: [
      {
        id: "q-3-1",
        question: "Which school of design is celebrated for integrating craftsmanship with mass production in Germany?",
        options: [
          "The Beaux-Arts School",
          "The Bauhaus School",
          "The Rococo Guilds"
        ],
        correctAnswerIndex: 1,
        explanation: "Founded in 1919 by Walter Gropius, Bauhaus integrated art and design with modern manufacturing technology."
      }
    ],
    chatHistory: [],
    createdAt: new Date().toISOString()
  }
];

export function readDb(): { lectures: Lecture[] } {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDb({ lectures: defaultLectures });
      return { lectures: defaultLectures };
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading db", err);
    return { lectures: defaultLectures };
  }
}

export function writeDb(data: { lectures: Lecture[] }) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db", err);
  }
}
