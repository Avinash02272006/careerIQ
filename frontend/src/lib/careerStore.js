import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "./apiClient";

export const BENCHMARK_ROLES = [
  {
    id: "role-fs",
    title: "Full Stack Developer",
    category: "fullstack",
    description: "Works across client React interfaces and scalable backend Node.js / Express services with relational databases.",
    demand: 94,
    required_skills: ["React", "Node.js", "Express", "PostgreSQL", "REST APIs", "TypeScript", "Git", "Docker"],
    weights: { React: 1.0, "Node.js": 1.0, Express: 0.9, PostgreSQL: 0.8, "REST APIs": 0.8, TypeScript: 0.8, Git: 0.6, Docker: 0.6 },
  },
  {
    id: "role-fe",
    title: "Frontend Developer",
    category: "frontend",
    description: "Builds high-performance client web applications with modern JS frameworks, TypeScript, and responsive CSS.",
    demand: 92,
    required_skills: ["HTML", "CSS", "JavaScript", "React", "Next.js", "TypeScript", "Tailwind CSS", "Git"],
    weights: { React: 1.0, TypeScript: 0.9, "Next.js": 0.8, JavaScript: 1.0, "Tailwind CSS": 0.7, HTML: 0.8, CSS: 0.8, Git: 0.6 },
  },
  {
    id: "role-be",
    title: "Backend Developer",
    category: "backend",
    description: "Designs and builds server-side microservices, REST APIs, cache layers, and scalable database schemas.",
    demand: 90,
    required_skills: ["Python", "FastAPI", "SQL", "PostgreSQL", "REST APIs", "Docker", "Redis", "Microservices"],
    weights: { Python: 1.0, PostgreSQL: 0.9, SQL: 0.9, FastAPI: 0.8, "REST APIs": 0.8, Docker: 0.7, Redis: 0.7, Microservices: 0.7 },
  },
  {
    id: "role-devops",
    title: "DevOps & Cloud Engineer",
    category: "systems",
    description: "Automates continuous delivery pipelines, orchestrates container clusters, and provisions AWS cloud infrastructure.",
    demand: 91,
    required_skills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform", "Git"],
    weights: { Docker: 1.0, Kubernetes: 0.9, "CI/CD": 0.9, AWS: 0.9, Linux: 0.8, Terraform: 0.7, Git: 0.6 },
  },
  {
    id: "role-ai",
    title: "AI & Machine Learning Engineer",
    category: "ai_ml",
    description: "Develops, trains, and productionizes deep learning models, LLMs, and intelligent automation pipelines.",
    demand: 95,
    required_skills: ["Python", "Machine Learning", "Deep Learning", "PyTorch", "Scikit-Learn", "NLP", "REST APIs", "Docker"],
    weights: { Python: 1.0, "Machine Learning": 1.0, "Deep Learning": 0.8, PyTorch: 0.8, "Scikit-Learn": 0.7, NLP: 0.7, "REST APIs": 0.6, Docker: 0.6 },
  },
  {
    id: "role-data-scientist",
    title: "Data Scientist",
    category: "ai_ml",
    description: "Extracts actionable insights, engineers statistical models, and creates predictive data pipelines.",
    demand: 88,
    required_skills: ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Data Visualization", "Problem Solving"],
    weights: { Python: 1.0, SQL: 0.9, "Machine Learning": 0.9, Pandas: 0.8, "Data Visualization": 0.8, NumPy: 0.7, "Problem Solving": 0.7 },
  },
  {
    id: "role-data-analyst",
    title: "Data Analyst",
    category: "ai_ml",
    description: "Transforms raw company datasets into executive dashboards, business metrics, and statistical reports.",
    demand: 82,
    required_skills: ["SQL", "Python", "Pandas", "Data Visualization", "NumPy", "Communication"],
    weights: { SQL: 1.0, "Data Visualization": 0.9, Python: 0.8, Pandas: 0.8, NumPy: 0.6, Communication: 0.7 },
  },
  {
    id: "role-creative-3d",
    title: "Creative 3D Web Engineer",
    category: "creative",
    description: "Crafts interactive 3D WebGL scenes, shader animations, and fluid motion interfaces using Three.js & Framer Motion.",
    demand: 85,
    required_skills: ["Three.js", "Framer Motion", "React", "WebGL", "GSAP", "JavaScript"],
    weights: { "Three.js": 1.0, "Framer Motion": 0.9, React: 0.8, WebGL: 0.8, GSAP: 0.7, JavaScript: 0.8 },
  },
  {
    id: "role-uiux",
    title: "UI/UX Designer & Prototyper",
    category: "design",
    description: "Designs intuitive user interfaces, visual design systems, user journey maps, and high-fidelity Figma prototypes.",
    demand: 78,
    required_skills: ["Figma", "UI Design", "UX Research", "Prototyping", "Wireframing", "Design Systems"],
    weights: { Figma: 1.0, "UI Design": 1.0, "UX Research": 0.8, Prototyping: 0.8, "Design Systems": 0.8, Wireframing: 0.7 },
  },
  {
    id: "role-swe",
    title: "Software Engineer (DSA & Systems)",
    category: "systems",
    description: "Builds robust software applications with emphasis on optimal algorithms, data structures, and system design.",
    demand: 89,
    required_skills: ["Data Structures", "Algorithms", "System Design", "Problem Solving", "Git", "SQL"],
    weights: { "Data Structures": 1.0, Algorithms: 1.0, "System Design": 0.9, "Problem Solving": 0.9, Git: 0.6, SQL: 0.6 },
  },
];

export const useCareerStore = create(
  persist(
    (set, get) => ({
      // State flag: true ONLY after a resume has been uploaded & extracted
      hasAnalyzedResume: false,

      // Raw extracted text from uploaded document
      rawExtractedText: "",

      // Candidate Profile State
      candidateName: "",
      candidateEmail: "",
      candidatePhone: "",
      candidateLinks: {
        github: "",
        linkedin: "",
        portfolio: "",
      },
      resumeQuality: null,
      skills: [],
      experience: [],
      projects: [],
      education: [],

      // ATS Audit & Recommendations
      atsAudit: null,

      // Target Career Goal
      targetRoleId: "role-fs",
      completedTasks: {},

      // Actions: Set Target Goal
      setTargetRole: (roleId) => set({ targetRoleId: roleId }),

      // Action: Populate Store from Resume Parsing
      setExtractedProfileData: (extractedData) => {
        if (!extractedData) return;

        let skillNames = [];
        if (Array.isArray(extractedData.matched_skills)) {
          skillNames = extractedData.matched_skills.map((s) => (typeof s === "string" ? s : s.name));
        } else if (Array.isArray(extractedData.skills)) {
          skillNames = extractedData.skills.map((s) => (typeof s === "string" ? s : s.name));
        }

        const candidateInfo = extractedData.contact_info || {};
        const audit = extractedData.quality_audit || {};
        const overallScore = audit.overall_score || extractedData.quality_score || 80.0;

        set({
          hasAnalyzedResume: true,
          rawExtractedText: extractedData.raw_text || "",
          candidateName: candidateInfo.name || "Candidate",
          candidateEmail: candidateInfo.email || "",
          candidatePhone: candidateInfo.phone || "",
          candidateLinks: {
            github: candidateInfo.github || "",
            linkedin: candidateInfo.linkedin || "",
            portfolio: candidateInfo.portfolio || "",
          },
          skills: skillNames,
          resumeQuality: overallScore,
          atsAudit: audit.overall_score ? audit : null,
          projects: Array.isArray(extractedData.projects) ? extractedData.projects : [],
          experience: Array.isArray(extractedData.experience) ? extractedData.experience : [],
          education: Array.isArray(extractedData.education) ? extractedData.education : [],
        });
      },

      // Actions: Manage Skills
      addSkill: (skill) => {
        const clean = skill.trim();
        if (!clean) return;
        const current = get().skills;
        if (!current.some((s) => s.toLowerCase() === clean.toLowerCase())) {
          const updated = [...current, clean];
          set({ skills: updated, hasAnalyzedResume: true });
          apiClient.post("/profile/skills/update", { skills: updated }).catch(() => {});
        }
      },

      removeSkill: (skill) => {
        const updated = get().skills.filter((s) => s.toLowerCase() !== skill.toLowerCase());
        set({ skills: updated });
        apiClient.post("/profile/skills/update", { skills: updated }).catch(() => {});
      },

      resetSkills: () => {
        set({
          hasAnalyzedResume: false,
          skills: [],
          rawExtractedText: "",
          candidateName: "",
          candidateEmail: "",
          resumeQuality: null,
          experience: [],
          projects: [],
          education: [],
          atsAudit: null,
          completedTasks: {},
        });
      },

      // Action: Load Sample Profile for Demo testing
      loadSampleDemo: () => {
        set({
          hasAnalyzedResume: true,
          candidateName: "Alex Morgan",
          candidateEmail: "alex.morgan@developer.io",
          candidatePhone: "(555) 234-5678",
          candidateLinks: {
            github: "https://github.com/alexmorgan-dev",
            linkedin: "https://linkedin.com/in/alexmorgan-engineer",
          },
          rawExtractedText: "Alex Morgan\nalex.morgan@developer.io | (555) 234-5678\n\nSUMMARY\nFull Stack Developer with 3+ years building high-throughput web applications with React, Node.js, Express, and PostgreSQL.\n\nTECHNICAL SKILLS\nReact, JavaScript, TypeScript, Node.js, Express, PostgreSQL, SQL, REST APIs, Git, Docker, Tailwind CSS, HTML, CSS\n\nEXPERIENCE\nFull Stack Software Engineer | TechScale Solutions Inc. | 2023 - Present\n• Developed scalable microservices in Node.js and Express, improving response times by 35%.\n• Built reactive analytics dashboards with React and TypeScript.\n\nPROJECTS\nReal-Time Distributed Microservices Gateway (Node.js, Express, PostgreSQL, Redis, Docker)\n• Engineered API gateway processing 25,000+ daily requests.\n\nEDUCATION\nBachelor of Science in Computer Science | State University | GPA: 3.8",
          skills: [
            "React", "JavaScript", "TypeScript", "Node.js", "Express",
            "PostgreSQL", "SQL", "REST APIs", "Git", "Docker", "Tailwind CSS", "HTML", "CSS"
          ],
          resumeQuality: 92.0,
          atsAudit: {
            overall_score: 92.0,
            breakdown: {
              section_completeness: 30.0,
              action_verbs: 23.0,
              quantified_impact: 21.0,
              keyword_density: 18.0,
            },
            suggestions: [
              "Include cloud deployment infrastructure (AWS / GCP) details.",
              "Add metrics to your earlier role descriptions.",
            ],
          },
          experience: [
            {
              role_hint: "Full Stack Software Engineer",
              company: "TechScale Solutions Inc.",
              start: "2023",
              end: "Present",
              raw_line: "Developed scalable microservices in Node.js and Express, improving response times by 35%.",
              tech_stack: ["Node.js", "Express", "PostgreSQL", "Docker"],
            },
          ],
          projects: [
            {
              title: "Real-Time Distributed Microservices Gateway",
              description: "Engineered API gateway processing 25,000+ daily requests with rate limiting and automated JWT auth.",
              tech_stack: ["Node.js", "Express", "PostgreSQL", "Docker", "Redis"],
            },
          ],
          education: [
            {
              degree: "Bachelor of Science in Computer Science",
              institution: "State University",
              cgpa: 3.8,
              start_year: "2019",
              end_year: "2023",
            },
          ],
        });
      },

      // Actions: Task Checklist Tracking
      toggleTask: (taskId) => {
        const current = get().completedTasks;
        set({
          completedTasks: { ...current, [taskId]: !current[taskId] },
        });
      },

      // Actions: Commit from What-If Simulator
      commitSimulatedSkills: (newSkills) => {
        const current = get().skills;
        const toAdd = newSkills.filter(
          (ns) => !current.some((cs) => cs.toLowerCase() === ns.toLowerCase())
        );
        if (toAdd.length > 0) {
          const updated = [...current, ...toAdd];
          set({ skills: updated, hasAnalyzedResume: true });
          apiClient.post("/profile/skills/update", { skills: updated }).catch(() => {});
        }
      },

      // Helper: Calculate Readiness Score
      getReadinessScore: () => {
        const { hasAnalyzedResume, resumeQuality, skills, experience, projects } = get();
        if (!hasAnalyzedResume || skills.length === 0) return null;

        const quality = resumeQuality || 70.0;
        const skillScore = Math.min(skills.length * 4.5, 40);
        const expScore = experience && experience.length > 0 ? 10 : 0;
        const projScore = projects && projects.length > 0 ? 10 : 0;
        const total = (quality * 0.4) + skillScore + expScore + projScore;
        return Math.min(Math.round(total * 10) / 10, 100);
      },

      // Helper: Calculate Compatibility for a Role
      getRoleCompatibility: (roleId) => {
        const { hasAnalyzedResume, skills } = get();
        if (!hasAnalyzedResume || skills.length === 0) return 0;

        const role = BENCHMARK_ROLES.find((r) => r.id === roleId) || BENCHMARK_ROLES[0];
        const userSkills = skills.map((s) => s.toLowerCase());

        let matchedWeight = 0;
        let totalWeight = 0;

        role.required_skills.forEach((req) => {
          const wt = (role.weights && role.weights[req]) || 1.0;
          totalWeight += wt;
          if (userSkills.includes(req.toLowerCase())) {
            matchedWeight += wt;
          }
        });

        return totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 1000) / 10 : 0;
      },

      // Helper: Get Gaps for the Target Role
      getTargetRoleGaps: () => {
        const { hasAnalyzedResume, targetRoleId, skills } = get();
        if (!hasAnalyzedResume) return [];

        const role = BENCHMARK_ROLES.find((r) => r.id === targetRoleId) || BENCHMARK_ROLES[0];
        const userSkills = skills.map((s) => s.toLowerCase());

        const gaps = [];
        role.required_skills.forEach((req) => {
          if (!userSkills.includes(req.toLowerCase())) {
            const wt = (role.weights && role.weights[req]) || 1.0;
            gaps.push({
              skill_name: req,
              priority: Math.round(wt * 10),
              estimated_gain: Math.round(wt * 4.5 * 10) / 10,
            });
          }
        });

        return gaps.sort((a, b) => b.priority - a.priority);
      },

      // Helper: Get Domain Radar Metrics for Spider Chart
      // Job Matching & Application Tracking
      savedJobIds: [],
      appliedJobIds: [],
      toggleSaveJob: (jobId) => {
        const saved = get().savedJobIds;
        if (saved.includes(jobId)) {
          set({ savedJobIds: saved.filter((id) => id !== jobId) });
        } else {
          set({ savedJobIds: [...saved, jobId] });
        }
      },
      applyToJob: (jobId) => {
        const applied = get().appliedJobIds;
        if (!applied.includes(jobId)) {
          set({ appliedJobIds: [...applied, jobId] });
        }
      },

      // Mock Interview State & History
      interviewHistory: [
        {
          id: "hist-demo-1",
          questionTitle: "Architecting an API Gateway & Microservice Authentication",
          role: "Full Stack Developer",
          category: "System Design",
          score: 88,
          verdict: "Strong Response",
          timestamp: "Yesterday",
          feedback: "Great discussion on asymmetric JWT validation and Redis token revocation."
        }
      ],
      addInterviewRecord: (record) => {
        const history = get().interviewHistory;
        set({
          interviewHistory: [
            {
              id: `hist-${Date.now()}`,
              timestamp: "Just now",
              ...record,
            },
            ...history,
          ],
        });
      },
      clearInterviewHistory: () => set({ interviewHistory: [] }),

      getDomainRadarMetrics: () => {
        const { hasAnalyzedResume, skills } = get();
        const lowerSkills = skills.map((s) => s.toLowerCase());

        const domains = [
          {
            domain: "Frontend & UI",
            benchmark: 85,
            keys: ["react", "vue", "angular", "next.js", "html", "css", "tailwind css", "javascript", "typescript", "figma"],
            maxCount: 5,
          },
          {
            domain: "Backend & APIs",
            benchmark: 90,
            keys: ["node.js", "express", "fastapi", "python", "django", "rest apis", "graphql", "microservices"],
            maxCount: 5,
          },
          {
            domain: "Databases & Cache",
            benchmark: 80,
            keys: ["sql", "postgresql", "mongodb", "redis", "mysql", "database design"],
            maxCount: 4,
          },
          {
            domain: "Cloud & DevOps",
            benchmark: 75,
            keys: ["docker", "kubernetes", "ci/cd", "aws", "linux", "git", "terraform"],
            maxCount: 4,
          },
          {
            domain: "AI & Machine Learning",
            benchmark: 70,
            keys: ["python", "machine learning", "deep learning", "pytorch", "pandas", "scikit-learn", "nlp", "numpy"],
            maxCount: 4,
          },
          {
            domain: "DSA & Systems",
            benchmark: 80,
            keys: ["data structures", "algorithms", "system design", "problem solving", "oop"],
            maxCount: 4,
          },
        ];

        return domains.map((d) => {
          const matched = hasAnalyzedResume ? d.keys.filter((k) => lowerSkills.includes(k)).length : 0;
          const candidateScore = hasAnalyzedResume
            ? Math.min(Math.round((matched / d.maxCount) * 100), 100)
            : 0;
          return {
            domain: d.domain,
            candidateScore,
            benchmarkScore: d.benchmark,
            matchedCount: matched,
          };
        });
      },
    }),
    {
      name: "careeriq-user-state",
    }
  )
);
