"use client";

import { useState } from "react";

// ─── Quiz Data ────────────────────────────────────────────────────────────────
const quizData = {
  q1: {
    title: "Quiz: React Basics",
    questions: [
      {
        id: "q1_1",
        question: "What hook do you use to manage local state in a functional component?",
        options: ["useEffect", "useState", "useContext", "useRef"],
        correct: 1,
      },
      {
        id: "q1_2",
        question: "What does JSX stand for?",
        options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extra"],
        correct: 0,
      },
      {
        id: "q1_3",
        question: "Which of the following is true about props?",
        options: ["Props are mutable", "Props flow from child to parent", "Props are read-only", "Props replace state"],
        correct: 2,
      },
    ],
  },
  q2: {
    title: "Quiz: Next.js Core",
    questions: [
      {
        id: "q2_1",
        question: "In Next.js App Router, where do you define page components?",
        options: ["pages/", "app/", "src/routes/", "components/"],
        correct: 1,
      },
      {
        id: "q2_2",
        question: "Which component type runs only on the server by default in App Router?",
        options: ["Client Component", "Shared Component", "Server Component", "Static Component"],
        correct: 2,
      },
    ],
  },
};

// ─── Quiz Component ───────────────────────────────────────────────────────────
export default function Quiz({ quizId }) {
  const quiz = quizData[quizId];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz)
    return <div style={{ color: "#a0a0b0", padding: "2rem" }}>Quiz not found.</div>;

  const score = submitted
    ? quiz.questions.filter((q) => answers[q.id] === q.correct).length
    : 0;
  const passed = score >= Math.ceil(quiz.questions.length * 0.7);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1rem" }}>
      <h2 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 700, marginBottom: "2rem" }}>
        {quiz.title}
      </h2>

      {quiz.questions.map((q, qi) => (
        <div
          key={q.id}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "1.25rem 1.5rem",
            marginBottom: "1.25rem",
          }}
        >
          <p style={{ color: "#e0e0f0", fontWeight: 600, marginBottom: "1rem" }}>
            {qi + 1}. {q.question}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {q.options.map((opt, oi) => {
              const selected = answers[q.id] === oi;
              const isCorrect = oi === q.correct;
              let bg = "rgba(255,255,255,0.03)";
              let border = "1px solid rgba(255,255,255,0.08)";

              if (submitted) {
                if (isCorrect) {
                  bg = "rgba(99,214,130,0.15)";
                  border = "1px solid #63d682";
                } else if (selected && !isCorrect) {
                  bg = "rgba(255,90,90,0.15)";
                  border = "1px solid #ff5a5a";
                }
              } else if (selected) {
                bg = "rgba(109,99,255,0.25)";
                border = "1px solid #6d63ff";
              }

              return (
                <button
                  key={oi}
                  disabled={submitted}
                  onClick={() => setAnswers((p) => ({ ...p, [q.id]: oi }))}
                  style={{
                    background: bg,
                    border,
                    borderRadius: 8,
                    padding: "0.65rem 1rem",
                    color: "#d0d0e8",
                    textAlign: "left",
                    cursor: submitted ? "default" : "pointer",
                    fontSize: "0.9rem",
                    transition: "all 0.15s",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < quiz.questions.length}
          style={{
            background:
              Object.keys(answers).length < quiz.questions.length
                ? "rgba(109,99,255,0.3)"
                : "#6d63ff",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "0.85rem 2rem",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor:
              Object.keys(answers).length < quiz.questions.length
                ? "not-allowed"
                : "pointer",
            marginTop: "0.5rem",
            transition: "background 0.2s",
          }}
        >
          Submit Answers
        </button>
      ) : (
        <div
          style={{
            background: passed ? "rgba(99,214,130,0.1)" : "rgba(255,90,90,0.1)",
            border: `1px solid ${passed ? "#63d682" : "#ff5a5a"}`,
            borderRadius: 12,
            padding: "1.25rem 1.5rem",
            marginTop: "0.5rem",
          }}
        >
          <p
            style={{
              color: passed ? "#63d682" : "#ff5a5a",
              fontWeight: 700,
              fontSize: "1.1rem",
              margin: 0,
            }}
          >
            {passed ? "🎉 Passed!" : "❌ Try Again"} — {score}/{quiz.questions.length} correct
          </p>
          {!passed && (
            <button
              onClick={() => { setAnswers({}); setSubmitted(false); }}
              style={{
                marginTop: "0.75rem",
                background: "rgba(255,255,255,0.08)",
                color: "#d0d0e8",
                border: "none",
                borderRadius: 8,
                padding: "0.5rem 1.25rem",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Retry Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}