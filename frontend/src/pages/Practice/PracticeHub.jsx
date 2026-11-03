import { useState, useEffect } from "react";
import apiClient from "../../lib/apiClient";

export default function PracticeHub() {
  const [activeTab, setActiveTab] = useState("quiz"); // "quiz" | "ask" | "cheatsheet"
  const [track, setTrack] = useState("AI & Data Science (AIDS)");
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("Medium");
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Ask AI Doubt State
  const [doubtQuery, setDoubtQuery] = useState("");
  const [solvingDoubt, setSolvingDoubt] = useState(false);
  const [doubtSolution, setDoubtSolution] = useState(null);

  // Auto-fetch initial quiz on mount
  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async (overrideTrack) => {
    setLoadingQuiz(true);
    setQuizResult(null);
    setSelectedAnswers({});
    try {
      const res = await apiClient.get("/practice/quiz", {
        params: {
          track: overrideTrack || track,
          topic: topic,
          difficulty: difficulty,
          count: 5,
        },
      });
      setQuizQuestions(res.data.questions || []);
    } catch {
      // Fallback questions if offline
      setQuizQuestions([
        {
          id: "fb-q1",
          question: "In a binary classification problem with 95 negative and 5 positive instances, a model predicting negative for all samples has what accuracy and positive class F1-Score?",
          type: "Technical",
          topic: "ML Evaluation Metrics",
          options: [
            "Accuracy: 95%, F1-Score: 0.0",
            "Accuracy: 95%, F1-Score: 0.95",
            "Accuracy: 50%, F1-Score: 0.05",
            "Accuracy: 90%, F1-Score: Undefined"
          ],
          correct_index: 0,
          explanation: "Accuracy = 95/100 = 95%. But with 0 True Positives, Precision = 0 and Recall = 0, so F1-Score = 0.0.",
          shortcut_formula: "When TP = 0, F1-Score is always 0.0 regardless of accuracy."
        },
        {
          id: "fb-q2",
          question: "A rare disease has 0.1% prevalence. A test has 99% sensitivity and 99% specificity. If someone tests positive, what is the probability they actually have the disease?",
          type: "Probability & Stats",
          topic: "Bayes' Theorem",
          options: ["Around 99%", "Around 50%", "Around 9%", "Around 1%"],
          correct_index: 2,
          explanation: "Out of 100,000: 100 have disease (99 test positive). 99,900 do not (999 false positives). Total positive tests = 1,098. P = 99 / 1098 ≈ 9%.",
          shortcut_formula: "P(D|+) ≈ True Positives / (True Positives + False Positives)."
        }
      ]);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await apiClient.post("/practice/submit", {
        answers: selectedAnswers,
        questions: quizQuestions,
      });
      setQuizResult(res.data);
    } catch {
      // Local calculation fallback
      let correct = 0;
      const breakdown = quizQuestions.map((q) => {
        const userChoice = selectedAnswers[q.id] ?? -1;
        const isCorrect = userChoice === q.correct_index;
        if (isCorrect) correct++;
        return {
          id: q.id,
          question: q.question,
          topic: q.topic,
          selected_index: userChoice,
          correct_index: q.correct_index,
          is_correct: isCorrect,
          explanation: q.explanation,
          shortcut_formula: q.shortcut_formula
        };
      });
      const pct = Math.round((correct / quizQuestions.length) * 100);
      setQuizResult({
        score_percentage: pct,
        correct_count: correct,
        total_questions: quizQuestions.length,
        verdict: pct >= 80 ? "Exceptional Mastery! Placement Ready." : "Good Practice. Review solutions below.",
        breakdown: breakdown
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSolveDoubt = async () => {
    if (!doubtQuery.trim()) return;
    setSolvingDoubt(true);
    setDoubtSolution(null);
    try {
      const res = await apiClient.post("/practice/ask-ai", {
        query: doubtQuery,
        track: track,
      });
      setDoubtSolution(res.data.ai_solution);
    } catch {
      setDoubtSolution("AI doubt solver error. Please try again with specific problem text.");
    } finally {
      setSolvingDoubt(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 font-bold">
              Groq AI Assessment Engine
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              llama-3.3 / qwen-3.8
            </span>
          </div>
          <h1 className="text-3xl font-display font-normal text-white">
            AI Practice & Placement Test Hub
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Real-time Technical, Quantitative Aptitude, Probability, and Machine Learning question generator tailored for AI & Data Science (AIDS) students and engineering job seekers.
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-[#0E1015] border border-white/[0.08]">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === "quiz"
                ? "bg-[#2DD4BF] text-black font-semibold shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Timed Practice Test
          </button>
          <button
            onClick={() => setActiveTab("ask")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === "ask"
                ? "bg-[#2DD4BF] text-black font-semibold shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            AI Doubt Solver
          </button>
          <button
            onClick={() => setActiveTab("cheatsheet")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === "cheatsheet"
                ? "bg-[#2DD4BF] text-black font-semibold shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            AIDS Formula Bank
          </button>
        </div>
      </div>

      {/* TAB 1: TIMED PRACTICE TEST */}
      {activeTab === "quiz" && (
        <div className="space-y-6">
          {/* TRACK SELECTOR & GENERATION CONTROLS */}
          <div className="bg-[#0E1015] border border-white/[0.08] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono text-neutral-500 block mb-1">
                  Target Domain / Track:
                </label>
                <select
                  value={track}
                  onChange={(e) => {
                    setTrack(e.target.value);
                    fetchQuiz(e.target.value);
                  }}
                  className="bg-[#08090C] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                >
                  <option value="AI & Data Science (AIDS)">AI & Data Science (AIDS) Core</option>
                  <option value="Machine Learning & Deep Learning">Machine Learning & Deep Learning</option>
                  <option value="Quantitative Aptitude & Math">Quantitative Aptitude & Math</option>
                  <option value="Probability & Statistics">Probability & Statistics</option>
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Full Stack Engineering">Full Stack Engineering</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-neutral-500 block mb-1">
                  Difficulty Level:
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="bg-[#08090C] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                >
                  <option value="Standard">Standard (Campus Placement)</option>
                  <option value="Medium">Medium (Technical Screening)</option>
                  <option value="Challenging">Challenging (FAANG / Product Firm)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => fetchQuiz()}
              disabled={loadingQuiz}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-mono text-white flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loadingQuiz ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-t-[#2DD4BF] border-white/20 animate-spin" />
                  Generating via Groq AI...
                </>
              ) : (
                <>⚡ Generate Fresh Real-Time Questions</>
              )}
            </button>
          </div>

          {/* QUIZ SCORECARD BANNER */}
          {quizResult && (
            <div className="bg-gradient-to-r from-[#2DD4BF]/15 via-teal-900/20 to-black border border-[#2DD4BF]/40 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#2DD4BF] font-bold block mb-1">
                  ✓ Assessment Completed
                </span>
                <h3 className="text-xl font-bold text-white">{quizResult.verdict}</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Answered {quizResult.correct_count} of {quizResult.total_questions} questions correctly. Detailed derivations and shortcut formulas are unlocked below.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-black/50 px-5 py-3 rounded-xl border border-white/[0.1]">
                <div className="text-center">
                  <span className="text-3xl font-mono font-bold text-[#2DD4BF]">
                    {quizResult.score_percentage}%
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono block">Placement Score</span>
                </div>
                <button
                  onClick={() => fetchQuiz()}
                  className="px-3 py-2 rounded-lg bg-[#2DD4BF] text-black font-semibold text-xs hover:opacity-90"
                >
                  Try Another Quiz →
                </button>
              </div>
            </div>
          )}

          {/* QUESTIONS LIST */}
          {loadingQuiz ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-t-[#2DD4BF] border-white/20 animate-spin mx-auto" />
              <p className="text-xs font-mono text-neutral-400">
                Groq AI is assembling fresh real-time technical & aptitude challenges...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {quizQuestions.map((q, qIdx) => {
                const userChoice = selectedAnswers[q.id];
                const evaluatedItem = quizResult?.breakdown?.find((b) => b.id === q.id);

                return (
                  <div
                    key={q.id || qIdx}
                    className="bg-[#0E1015] border border-white/[0.08] rounded-2xl p-6 space-y-4 shadow-lg"
                  >
                    {/* Question Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/[0.05] text-[#2DD4BF]">
                          Q{qIdx + 1}
                        </span>
                        <span className="text-xs font-medium text-neutral-300 font-mono">
                          {q.topic || "Technical & Math Core"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.03] text-neutral-400 border border-white/[0.06]">
                        {q.type || "Multiple Choice"}
                      </span>
                    </div>

                    {/* Question Statement */}
                    <p className="text-sm font-sans text-white leading-relaxed font-medium">
                      {q.question}
                    </p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {(q.options || []).map((opt, oIdx) => {
                        const isSelected = userChoice === oIdx;
                        let optionStyle = "bg-[#08090C] border-white/[0.08] text-neutral-300 hover:border-white/[0.2]";

                        if (quizResult && evaluatedItem) {
                          if (oIdx === evaluatedItem.correct_index) {
                            optionStyle = "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold";
                          } else if (isSelected && !evaluatedItem.is_correct) {
                            optionStyle = "bg-rose-500/15 border-rose-500/50 text-rose-300 line-through";
                          }
                        } else if (isSelected) {
                          optionStyle = "bg-[#2DD4BF]/15 border-[#2DD4BF]/50 text-white font-medium";
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => !quizResult && handleSelectOption(q.id, oIdx)}
                            disabled={!!quizResult}
                            className={`p-3.5 rounded-xl border text-xs text-left transition-all flex items-start gap-3 ${optionStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] bg-black/40 border border-white/[0.1] shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Evaluated Explanation & Shortcut Box */}
                    {quizResult && evaluatedItem && (
                      <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={evaluatedItem.is_correct ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {evaluatedItem.is_correct ? "✓ Correct Solution:" : "✗ Incorrect Solution:"}
                          </span>
                        </div>
                        <p className="text-neutral-300 leading-relaxed">
                          {evaluatedItem.explanation}
                        </p>
                        {evaluatedItem.shortcut_formula && (
                          <div className="p-2.5 rounded-lg bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] font-mono text-[11px]">
                            💡 <strong>30-Second Shortcut Trick:</strong> {evaluatedItem.shortcut_formula}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* SUBMIT BUTTON */}
              {!quizResult && quizQuestions.length > 0 && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2DD4BF] to-teal-500 text-black font-semibold text-xs hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2"
                  >
                    {submitting ? "Grading Test with AI..." : "Submit Test & Reveal Detailed Solutions →"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI DOUBT SOLVER */}
      {activeTab === "ask" && (
        <div className="bg-[#0E1015] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h2 className="text-lg font-medium text-white">AI Doubt Solver & Math Mentor</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Paste any technical scenario, probability puzzle, linear algebra problem, or aptitude question to receive step-by-step mathematical derivations and shortcuts.
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              rows={4}
              value={doubtQuery}
              onChange={(e) => setDoubtQuery(e.target.value)}
              placeholder="e.g. 'How does Backpropagation calculate gradients across the cross-entropy loss function?' or 'A person covers half distance at 40 km/h and half at 60 km/h. What is average speed?'"
              className="w-full bg-[#08090C] border border-white/[0.1] rounded-xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#2DD4BF] font-sans leading-relaxed"
            />

            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-neutral-500">
                Powered by Groq LLM (High-Speed Reasoning)
              </span>
              <button
                onClick={handleSolveDoubt}
                disabled={solvingDoubt || !doubtQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#2DD4BF] text-black font-semibold text-xs hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {solvingDoubt ? "Deriving Solution..." : "Solve with Step-by-Step Derivation →"}
              </button>
            </div>
          </div>

          {doubtSolution && (
            <div className="p-5 rounded-xl bg-[#08090C] border border-white/[0.08] space-y-3">
              <span className="font-mono text-[10px] tracking-wider uppercase text-[#2DD4BF] block font-bold">
                ✓ AI Mathematical & Conceptual Solution:
              </span>
              <div className="text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans">
                {doubtSolution}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AIDS FORMULA BANK */}
      {activeTab === "cheatsheet" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3 shadow-lg">
            <h3 className="text-xs font-mono font-bold text-[#2DD4BF] uppercase">
              1. Machine Learning Metrics & Loss Functions
            </h3>
            <ul className="text-xs text-neutral-300 space-y-2 font-mono">
              <li>• Precision = TP / (TP + FP)</li>
              <li>• Recall = TP / (TP + FN)</li>
              <li>• F1-Score = 2 * (Precision * Recall) / (Precision + Recall)</li>
              <li>• Binary Cross Entropy = -[y*log(p) + (1-y)*log(1-p)]</li>
              <li>• ROC-AUC = Area under True Positive Rate vs False Positive Rate curve</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3 shadow-lg">
            <h3 className="text-xs font-mono font-bold text-[#2DD4BF] uppercase">
              2. Probability & Bayes' Theorem
            </h3>
            <ul className="text-xs text-neutral-300 space-y-2 font-mono">
              <li>• Bayes: P(A|B) = [P(B|A) * P(A)] / P(B)</li>
              <li>• Total Probability: P(B) = Σ P(B|Ai) * P(Ai)</li>
              <li>• Expectation: E[X] = Σ x * P(x)</li>
              <li>• Variance: Var(X) = E[X²] - (E[X])²</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3 shadow-lg">
            <h3 className="text-xs font-mono font-bold text-[#2DD4BF] uppercase">
              3. Deep Learning & Transformer Math
            </h3>
            <ul className="text-xs text-neutral-300 space-y-2 font-mono">
              <li>• Self-Attention = softmax((Q * K^T) / sqrt(d_k)) * V</li>
              <li>• Memory Complexity = O(N²) without FlashAttention</li>
              <li>• FlashAttention Memory = O(N) by tiling into SRAM blocks</li>
              <li>• Softmax: S(zi) = exp(zi) / Σ exp(zj)</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3 shadow-lg">
            <h3 className="text-xs font-mono font-bold text-[#2DD4BF] uppercase">
              4. Quantitative Aptitude Shortcuts
            </h3>
            <ul className="text-xs text-neutral-300 space-y-2 font-mono">
              <li>• Average Speed (equal distance) = (2 * S1 * S2) / (S1 + S2)</li>
              <li>• Relative Speed (opposite dir) = S1 + S2 (same dir = |S1 - S2|)</li>
              <li>• Work Done: If A takes x days and B takes y &rarr; Together = (x * y) / (x + y)</li>
              <li>• Permutation: nPr = n! / (n-r)! | Combination: nCr = n! / [r! * (n-r)!]</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
