import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../lib/apiClient";
import { useCareerStore } from "../../lib/careerStore";

const STAGES = [
  "Reading document layers & binary streams",
  "Executing OCR / text extraction engine",
  "Extracting candidate metadata & technical competencies",
  "Computing placement readiness & role benchmarks",
];

const SAMPLE_DEV_RESUME = `Alex Morgan
alex.morgan@developer.io | (555) 234-5678 | San Francisco, CA
https://github.com/alexmorgan-dev | https://linkedin.com/in/alexmorgan-engineer

SUMMARY
High-impact Full Stack Engineer with 3+ years of experience engineering distributed web services and interactive client applications. Specialized in React, Node.js, Express, PostgreSQL, and Docker containerization. Proven track record of improving system latency by 35% and deploying production architectures handling 20,000+ daily active users.

TECHNICAL SKILLS
• Programming Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3
• Frontend Engineering: React, Next.js, Redux, Tailwind CSS, Three.js, Framer Motion
• Backend & Systems: Node.js, Express, FastAPI, REST APIs, Microservices, GraphQL
• Databases & Caching: PostgreSQL, MongoDB, Redis, Database Design
• Cloud & DevOps: Docker, Kubernetes, CI/CD, AWS, Linux, Git, GitHub Actions

PROFESSIONAL EXPERIENCE
Full Stack Software Engineer | TechScale Solutions Inc. | 2023 - Present
• Architected and deployed microservices backend using Node.js, Express, and PostgreSQL, reducing API response latency by 35%.
• Engineered customer-facing reactive dashboards using React 19, TypeScript, and Tailwind CSS serving 15,000+ daily sessions.
• Configured automated GitHub Actions CI/CD workflows and containerized multi-stage deployments with Docker on AWS.
• Implemented distributed cache-aside layer with Redis, reducing database CPU load by 42%.

Associate Software Developer | CloudSprint Labs | 2021 - 2023
• Developed and maintained 14+ REST APIs handling data pipelines and user authentication with JWT.
• Refactored legacy monolithic views into modular React components, boosting client render performance by 28%.
• Collaborated in cross-functional agile sprints, conducting code reviews and optimizing SQL query execution plans.

KEY PROJECTS
Real-Time Distributed Microservices Gateway (Node.js, Express, PostgreSQL, Redis, Docker)
• Engineered high-throughput API gateway processing 25,000+ daily requests with rate limiting and automated JWT auth.
• Designed relational schema with connection pooling in PostgreSQL handling complex transactional joins.

Interactive 3D Data Constellation (React, Three.js, WebGL, Framer Motion)
• Created spatial graph visualizer rendering 500+ interconnected technology nodes with 60 FPS WebGL shaders.
• Integrated spring-physics gesture controls and smooth camera orbits for interactive data exploration.

EDUCATION
Bachelor of Science in Computer Science | State University of California | 2017 - 2021
• GPA: 3.8 / 4.0 | Dean's Honor Roll
• Core Coursework: Data Structures & Algorithms, Distributed Systems, Database Management, System Design`;

export default function ResumeUpload() {
  const [activeTab, setActiveTab] = useState("file"); // "file" | "text"
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [stageIndex, setStageIndex] = useState(-1);
  const [error, setError] = useState(null);
  const [extractedResult, setExtractedResult] = useState(null);
  const [showRawText, setShowRawText] = useState(false);
  const navigate = useNavigate();

  const { setExtractedProfileData } = useCareerStore();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setError(null);
    setStageIndex(0);

    const formData = new FormData();
    formData.append("file", file);

    const timer = setInterval(() => {
      setStageIndex((prev) => (prev < 3 ? prev + 1 : prev));
    }, 700);

    try {
      const res = await apiClient.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(timer);
      setStageIndex(3);

      const data = res.data.extracted_data || {};
      const score = res.data.quality_score || (data.quality_audit && data.quality_audit.overall_score) || 80;

      setExtractedProfileData({
        ...data,
        quality_score: score,
      });

      setExtractedResult({
        fileName: file.name,
        candidateName: data.contact_info?.name || "Candidate",
        skills: data.matched_skills || [],
        rawText: data.raw_text || "",
        score: score,
        sectionsCount: Object.keys(data.sections || {}).filter((k) => data.sections[k]).length,
      });
    } catch (err) {
      clearInterval(timer);
      setStageIndex(-1);
      setError(
        err.response?.data?.detail || "Extraction failed. Check file format or network connection."
      );
    }
  };

  const handleTextUpload = async () => {
    if (!pastedText.trim() || pastedText.trim().length < 30) {
      setError("Please paste resume text with at least 30 characters.");
      return;
    }

    setError(null);
    setStageIndex(0);

    const timer = setInterval(() => {
      setStageIndex((prev) => (prev < 3 ? prev + 1 : prev));
    }, 500);

    try {
      const res = await apiClient.post("/resume/parse-text", {
        text: pastedText,
      });

      clearInterval(timer);
      setStageIndex(3);

      const data = res.data.extracted_data || {};
      const score = res.data.quality_score || (data.quality_audit && data.quality_audit.overall_score) || 85;

      setExtractedProfileData({
        ...data,
        quality_score: score,
      });

      setExtractedResult({
        fileName: "Pasted Text Document",
        candidateName: data.contact_info?.name || "Candidate",
        skills: data.matched_skills || [],
        rawText: data.raw_text || pastedText,
        score: score,
        sectionsCount: Object.keys(data.sections || {}).filter((k) => data.sections[k]).length,
      });
    } catch (err) {
      clearInterval(timer);
      setStageIndex(-1);
      setError(err.response?.data?.detail || "Failed to process text.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 w-full flex flex-col items-center space-y-8">
      {/* MINIMALIST AWWWARDS HEADER */}
      <div className="text-center space-y-2">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-400 block">
          Document Ingestion & OCR Engine
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
          Extract Resume Data
        </h1>
        <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
          Supports native PDFs, high-resolution Images (PNG, JPG, WEBP), Word documents (.docx), and plain text.
        </p>
      </div>

      {/* COMPLETED EXTRACTION REPORT VIEW */}
      {extractedResult ? (
        <div className="w-full bg-[#0E1015] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-white/[0.06]">
            <div>
              <span className="font-mono text-[10px] text-[#2DD4BF] tracking-wider uppercase block mb-0.5">
                ✓ Extraction Successful
              </span>
              <h2 className="text-lg font-medium text-white">{extractedResult.fileName}</h2>
              <p className="text-xs text-neutral-400">
                Candidate: <strong className="text-white">{extractedResult.candidateName}</strong> • {extractedResult.sectionsCount} Sections Identified
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-light text-[#2DD4BF]">
                {extractedResult.score}%
              </span>
              <span className="text-[10px] text-neutral-500 font-mono block">ATS Quality</span>
            </div>
          </div>

          {/* EXTRACTED SKILLS PILLS */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] tracking-wider uppercase text-neutral-400 block">
              Verified Technical Skills ({extractedResult.skills.length})
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
              {extractedResult.skills.map((s, i) => {
                const name = typeof s === "string" ? s : s.name;
                return (
                  <span
                    key={i}
                    className="font-mono text-[11px] px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-neutral-200"
                  >
                    ✓ {name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* RAW TEXT INSPECTION DRAWER */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="font-mono text-[11px] text-[#2DD4BF] hover:underline flex items-center gap-1.5"
            >
              <span>{showRawText ? "▲ Hide" : "▼ Inspect"} Exact Extracted Raw Text</span>
              <span className="text-neutral-500">({extractedResult.rawText.length} characters)</span>
            </button>

            {showRawText && (
              <pre className="p-4 rounded-xl bg-[#08090C] border border-white/[0.06] text-[11px] font-mono text-neutral-300 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {extractedResult.rawText}
              </pre>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors text-center"
            >
              View Diagnostics Dashboard →
            </button>
            <button
              onClick={() => navigate("/job-matching")}
              className="py-3 px-4 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 text-[#2DD4BF] font-semibold text-xs hover:bg-[#2DD4BF]/25 transition-colors text-center"
            >
              Match Jobs Now →
            </button>
            <button
              onClick={() => navigate("/interview")}
              className="py-3 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-300 text-xs hover:text-white transition-colors text-center"
            >
              Mock Interview →
            </button>
            <button
              onClick={() => {
                setExtractedResult(null);
                setFile(null);
                setPastedText("");
              }}
              className="px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-neutral-400 text-xs hover:text-white"
            >
              Upload Another
            </button>
          </div>
        </div>
      ) : (
        /* UPLOAD / EXTRACTION CARD */
        <div className="w-full bg-[#0E1015] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* TABS */}
          <div className="flex border-b border-white/[0.06] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("file")}
              className={`pb-3 font-mono text-[11px] tracking-wider uppercase transition-colors mr-6 ${
                activeTab === "file"
                  ? "border-b-2 border-white text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Upload Document (PDF / Image / Word / TXT)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`pb-3 font-mono text-[11px] tracking-wider uppercase transition-colors ${
                activeTab === "text"
                  ? "border-b-2 border-white text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Paste Raw Resume Text
            </button>
          </div>

          {stageIndex === -1 ? (
            activeTab === "file" ? (
              <div className="space-y-5">
                {/* ARCHITECTURAL DROP ZONE */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`border border-dashed rounded-xl p-10 text-center transition-all ${
                    dragActive
                      ? "border-white bg-white/[0.02]"
                      : "border-white/[0.12] bg-[#0A0C10] hover:border-white/[0.25]"
                  }`}
                >
                  {file ? (
                    <div className="space-y-2">
                      <div className="w-8 h-8 mx-auto rounded bg-white/[0.08] flex items-center justify-center font-mono text-[11px] text-[#2DD4BF]">
                        OK
                      </div>
                      <p className="font-medium text-white text-sm">{file.name}</p>
                      <p className="text-neutral-500 text-xs font-mono">
                        {(file.size / 1024).toFixed(1)} KB • Ready for extraction
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-white text-sm font-medium">
                        Drag and drop your resume file here
                      </p>
                      <p className="text-neutral-500 text-xs font-mono">
                        Accepts PDF, PNG, JPG, WEBP, DOCX, TXT
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc,.txt,.md"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setFile(e.target.files[0]);
                        setError(null);
                      }
                    }}
                    className="hidden"
                    id="file-input"
                  />

                  <label
                    htmlFor="file-input"
                    className="mt-4 inline-block font-mono text-xs text-neutral-300 underline hover:text-white cursor-pointer"
                  >
                    {file ? "Choose different file" : "browse from device"}
                  </label>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleFileUpload}
                  disabled={!file}
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 disabled:opacity-20 transition-all shadow-md font-mono"
                >
                  Extract Real Text & Run Diagnostics →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  rows={10}
                  placeholder="Paste your exact resume text here (Skills, Experience, Projects, Education)..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-white/[0.1] rounded-xl p-3.5 text-xs text-white placeholder-neutral-600 outline-none focus:border-white/[0.3] font-mono leading-relaxed"
                />

                {error && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleTextUpload}
                  disabled={!pastedText.trim()}
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 disabled:opacity-20 transition-all shadow-md font-mono"
                >
                  Extract Text & Run Diagnostics →
                </button>
              </div>
            )
          ) : (
            /* ANIMATED EXTRACTION STAGE */
            <div className="py-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
                <span className="font-mono text-xs text-white">Extracting & Analyzing Document</span>
                <span className="font-mono text-[11px] text-[#2DD4BF] animate-pulse">Processing...</span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                {STAGES.map((stg, i) => {
                  const isDone = i < stageIndex;
                  const isCurrent = i === stageIndex;
                  return (
                    <div key={stg} className="flex items-center gap-3">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isDone
                            ? "bg-[#2DD4BF] text-black font-bold"
                            : isCurrent
                            ? "border border-[#2DD4BF] text-[#2DD4BF] animate-spin"
                            : "bg-white/[0.05] text-neutral-600"
                        }`}
                      >
                        {isDone ? "✓" : "•"}
                      </span>
                      <span className={isDone || isCurrent ? "text-neutral-200" : "text-neutral-600"}>
                        {stg}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUICK SAMPLE BUTTON */}
          <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center text-xs">
            <span className="text-neutral-500 text-[11px]">Don't have a resume right now?</span>
            <button
              type="button"
              onClick={() => {
                setActiveTab("text");
                setPastedText(SAMPLE_DEV_RESUME);
                setError(null);
              }}
              className="text-neutral-400 hover:text-white font-mono text-[11px] underline"
            >
              Fill Sample Developer Text
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
