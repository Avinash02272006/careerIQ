import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { useCareerStore } from "../../lib/careerStore";

const TECH_NODES = [
  // --- AI & Data Science (AIDS) Core ---
  {
    id: "pytorch",
    title: "PyTorch & Deep Learning",
    category: "AI & Data Science",
    cluster: "aids",
    x: 0,
    y: 14,
    z: 0,
    color: 0x2dd4bf,
    demand: "98%",
    avgSalary: "$145,000 - $210,000",
    difficulty: "Advanced",
    marketGrowth: "+38% YoY",
    description: "Neural network architectures, autograd computational graphs, CUDA acceleration, and tensor parallel training.",
    connections: ["Transformers & LLMs", "Scikit-Learn", "FastAPI", "Vector DBs & RAG"],
    associatedRoles: ["AI & Data Science Engineer", "MLOps & LLM Systems Architect"],
    prerequisites: ["Linear Algebra", "Python", "Calculus"]
  },
  {
    id: "transformers",
    title: "Transformers & LLMs",
    category: "AI & Data Science",
    cluster: "aids",
    x: -16,
    y: 18,
    z: 10,
    color: 0xa855f7,
    demand: "99%",
    avgSalary: "$160,000 - $235,000",
    difficulty: "Advanced",
    marketGrowth: "+64% YoY",
    description: "Multi-head self-attention mechanisms, FlashAttention, PEFT/LoRA fine-tuning, RoPE embeddings, and prompt orchestration.",
    connections: ["PyTorch", "LangChain & RAG", "Vector DBs & RAG", "FastAPI"],
    associatedRoles: ["AI & Data Science Engineer", "MLOps & LLM Systems Architect"],
    prerequisites: ["PyTorch", "NLP", "Probability"]
  },
  {
    id: "sklearn",
    title: "Scikit-Learn & ML Algorithms",
    category: "AI & Data Science",
    cluster: "aids",
    x: 18,
    y: 10,
    z: -12,
    color: 0x38bdf8,
    demand: "92%",
    avgSalary: "$125,000 - $175,000",
    difficulty: "Intermediate",
    marketGrowth: "+22% YoY",
    description: "Supervised and unsupervised learning: Random Forests, XGBoost, PCA dimensionality reduction, and cross-validated pipelines.",
    connections: ["Pandas & Polars", "PyTorch", "Statistics & Math"],
    associatedRoles: ["AI & Data Science Engineer", "Quantitative Research Analyst"],
    prerequisites: ["Python", "Statistics"]
  },
  {
    id: "pandas",
    title: "Pandas & Polars Feature Engineering",
    category: "AI & Data Science",
    cluster: "aids",
    x: 22,
    y: -4,
    z: 14,
    color: 0x10b981,
    demand: "94%",
    avgSalary: "$120,000 - $170,000",
    difficulty: "Intermediate",
    marketGrowth: "+26% YoY",
    description: "High-throughput tabular vectorization, memory-mapped Arrow buffers, lazy execution plans, and data leakage prevention.",
    connections: ["Scikit-Learn", "PostgreSQL & pgvector", "Statistics & Math"],
    associatedRoles: ["AI & Data Science Engineer", "Quantitative Research Analyst"],
    prerequisites: ["Python", "SQL"]
  },
  {
    id: "vectordb",
    title: "Vector DBs & RAG",
    category: "AI & Data Science",
    cluster: "aids",
    x: -12,
    y: 6,
    z: -20,
    color: 0xf59e0b,
    demand: "97%",
    avgSalary: "$150,000 - $215,000",
    difficulty: "Advanced",
    marketGrowth: "+72% YoY",
    description: "Dense semantic retrieval, HNSW graphs, IVFFlat inverted Voronoi cells, hybrid reciprocal rank fusion, and rerankers.",
    connections: ["Transformers & LLMs", "PostgreSQL & pgvector", "PyTorch"],
    associatedRoles: ["AI & Data Science Engineer", "MLOps & LLM Systems Architect"],
    prerequisites: ["Embeddings", "Cosine Distance"]
  },
  {
    id: "math",
    title: "Statistics & Bayesian Math",
    category: "AI & Data Science",
    cluster: "aids",
    x: 14,
    y: 22,
    z: 4,
    color: 0xec4899,
    demand: "90%",
    avgSalary: "$135,000 - $190,000",
    difficulty: "Advanced",
    marketGrowth: "+18% YoY",
    description: "Bayesian inference, maximum likelihood estimation, Markov chains, hypothesis testing, and gradient loss manifolds.",
    connections: ["Scikit-Learn", "PyTorch", "Pandas & Polars"],
    associatedRoles: ["Quantitative Research Analyst", "AI & Data Science Engineer"],
    prerequisites: ["Multivariable Calculus", "Linear Algebra"]
  },

  // --- Backend & Systems ---
  {
    id: "fastapi",
    title: "FastAPI & Async Microservices",
    category: "Backend & Systems",
    cluster: "backend",
    x: -24,
    y: -2,
    z: 8,
    color: 0x06b6d4,
    demand: "93%",
    avgSalary: "$130,000 - $185,000",
    difficulty: "Intermediate",
    marketGrowth: "+34% YoY",
    description: "High-throughput asynchronous ASGI web services, Pydantic type validation, dependency injection, and model inference endpoints.",
    connections: ["PyTorch", "PostgreSQL & pgvector", "Docker & Kubernetes", "Redis & Caching"],
    associatedRoles: ["AI & Data Science Engineer", "Senior Full Stack Platform Engineer"],
    prerequisites: ["Python", "REST APIs", "Async/Await"]
  },
  {
    id: "node",
    title: "Node.js & Express.js",
    category: "Backend & Systems",
    cluster: "backend",
    x: -28,
    y: -14,
    z: -4,
    color: 0x3b82f6,
    demand: "91%",
    avgSalary: "$125,000 - $180,000",
    difficulty: "Intermediate",
    marketGrowth: "+15% YoY",
    description: "Event loop concurrency, non-blocking I/O stream buffers, JWT rotation middleware, and scalable microservice routing.",
    connections: ["React & Next.js", "PostgreSQL & pgvector", "Redis & Caching", "Docker & Kubernetes"],
    associatedRoles: ["Senior Full Stack Platform Engineer", "Backend Systems Engineer"],
    prerequisites: ["JavaScript / ES6", "HTTP Protocols"]
  },
  {
    id: "postgres",
    title: "PostgreSQL & pgvector",
    category: "Backend & Systems",
    cluster: "backend",
    x: -18,
    y: -20,
    z: -14,
    color: 0xfbbf24,
    demand: "96%",
    avgSalary: "$135,000 - $195,000",
    difficulty: "Intermediate",
    marketGrowth: "+41% YoY",
    description: "Relational ACID integrity, GIN trigram indexes, EXPLAIN ANALYZE tuning, and embedded vector similarity lookups.",
    connections: ["FastAPI & Async Microservices", "Node.js & Express.js", "Vector DBs & RAG", "Docker & Kubernetes"],
    associatedRoles: ["Senior Full Stack Platform Engineer", "AI & Data Science Engineer"],
    prerequisites: ["SQL Queries", "Relational Schema Design"]
  },
  {
    id: "redis",
    title: "Redis & Caching",
    category: "Backend & Systems",
    cluster: "backend",
    x: -8,
    y: -18,
    z: 22,
    color: 0xef4444,
    demand: "89%",
    avgSalary: "$130,000 - $180,000",
    difficulty: "Intermediate",
    marketGrowth: "+20% YoY",
    description: "In-memory key-value data structures, Cache-Aside patterns, distributed mutex locks (SETNX), and pub/sub message brokers.",
    connections: ["Node.js & Express.js", "FastAPI & Async Microservices", "PostgreSQL & pgvector"],
    associatedRoles: ["Senior Full Stack Platform Engineer", "Distributed Systems Engineer"],
    prerequisites: ["In-Memory Caching", "TTL Expiration"]
  },

  // --- Frontend & 3D Interactive ---
  {
    id: "react",
    title: "React & Next.js",
    category: "Frontend & 3D",
    cluster: "frontend",
    x: 8,
    y: -8,
    z: -22,
    color: 0x2dd4bf,
    demand: "96%",
    avgSalary: "$130,000 - $185,000",
    difficulty: "Intermediate",
    marketGrowth: "+24% YoY",
    description: "React 19 Server Components, hydration boundaries, Suspense lazy chunks, and stateful hook composition.",
    connections: ["Node.js & Express.js", "TypeScript", "Tailwind CSS", "Three.js & WebGL"],
    associatedRoles: ["Senior Full Stack Platform Engineer", "Lead Frontend Architect"],
    prerequisites: ["JavaScript", "HTML5/CSS3", "Virtual DOM"]
  },
  {
    id: "typescript",
    title: "TypeScript",
    category: "Frontend & 3D",
    cluster: "frontend",
    x: 0,
    y: -12,
    z: -16,
    color: 0x60a5fa,
    demand: "95%",
    avgSalary: "$135,000 - $190,000",
    difficulty: "Intermediate",
    marketGrowth: "+30% YoY",
    description: "Static type analysis, generic constraints, mapped types, discriminated unions, and compile-time contract enforcement.",
    connections: ["React & Next.js", "Node.js & Express.js", "Three.js & WebGL"],
    associatedRoles: ["Senior Full Stack Platform Engineer", "Lead Frontend Architect"],
    prerequisites: ["JavaScript"]
  },
  {
    id: "threejs",
    title: "Three.js & WebGL",
    category: "Frontend & 3D",
    cluster: "frontend",
    x: 16,
    y: 0,
    z: -26,
    color: 0xc084fc,
    demand: "84%",
    avgSalary: "$140,000 - $200,000",
    difficulty: "Advanced",
    marketGrowth: "+35% YoY",
    description: "Interactive 3D spatial scenes, custom GLSL vertex/fragment shaders, camera raycasting, and GPU buffer optimizations.",
    connections: ["React & Next.js", "TypeScript", "Tailwind CSS"],
    associatedRoles: ["Lead Frontend Architect", "Creative Technologist"],
    prerequisites: ["3D Math", "Matrices", "JavaScript"]
  },
  {
    id: "tailwind",
    title: "Tailwind CSS",
    category: "Frontend & 3D",
    cluster: "frontend",
    x: 24,
    y: -16,
    z: -8,
    color: 0x38bdf8,
    demand: "90%",
    avgSalary: "$115,000 - $160,000",
    difficulty: "Beginner",
    marketGrowth: "+28% YoY",
    description: "Utility-first design tokens, PostCSS JIT compilation, responsive grid layouts, and dark-mode glassmorphic styling.",
    connections: ["React & Next.js", "TypeScript"],
    associatedRoles: ["Lead Frontend Architect", "Senior Full Stack Platform Engineer"],
    prerequisites: ["CSS Grid", "Flexbox"]
  },

  // --- Cloud & MLOps Infrastructure ---
  {
    id: "docker",
    title: "Docker & Kubernetes",
    category: "Cloud & MLOps",
    cluster: "cloud",
    x: -8,
    y: -26,
    z: 2,
    color: 0x34d399,
    demand: "95%",
    avgSalary: "$140,000 - $205,000",
    difficulty: "Advanced",
    marketGrowth: "+32% YoY",
    description: "Multi-stage container builds, non-root security contexts, Kubernetes pod deployments, ingress controllers, and auto-scaling.",
    connections: ["FastAPI & Async Microservices", "PostgreSQL & pgvector", "AWS & Cloud", "MLOps Pipelines"],
    associatedRoles: ["MLOps & LLM Systems Architect", "Senior Full Stack Platform Engineer"],
    prerequisites: ["Linux CLI", "Networking"]
  },
  {
    id: "mlops",
    title: "MLOps Pipelines",
    category: "Cloud & MLOps",
    cluster: "cloud",
    x: -20,
    y: 8,
    z: -6,
    color: 0xf43f5e,
    demand: "97%",
    avgSalary: "$155,000 - $225,000",
    difficulty: "Advanced",
    marketGrowth: "+58% YoY",
    description: "Automated model registry, continuous integration for weights (CI/CD for ML), drift detection, and Triton inference serving.",
    connections: ["Docker & Kubernetes", "PyTorch", "FastAPI & Async Microservices", "AWS & Cloud"],
    associatedRoles: ["MLOps & LLM Systems Architect", "AI & Data Science Engineer"],
    prerequisites: ["Docker", "PyTorch", "CI/CD"]
  },
  {
    id: "aws",
    title: "AWS & Cloud",
    category: "Cloud & MLOps",
    cluster: "cloud",
    x: 8,
    y: -24,
    z: 16,
    color: 0xf97316,
    demand: "94%",
    avgSalary: "$140,000 - $200,000",
    difficulty: "Intermediate",
    marketGrowth: "+25% YoY",
    description: "Cloud IAM policies, EC2 GPU clusters, S3 data lakes, Lambda serverless, and cloud VPC network topology.",
    connections: ["Docker & Kubernetes", "FastAPI & Async Microservices", "MLOps Pipelines"],
    associatedRoles: ["MLOps & LLM Systems Architect", "Senior Full Stack Platform Engineer"],
    prerequisites: ["Cloud Computing Basics", "Linux"]
  }
];

const CLUSTER_FILTERS = [
  { id: "all", label: "All Constellation", count: 17 },
  { id: "aids", label: "AI & Data Science (AIDS)", count: 6, color: "#2DD4BF" },
  { id: "backend", label: "Backend & Systems", count: 4, color: "#38BDF8" },
  { id: "frontend", label: "Frontend & 3D", count: 4, color: "#C084FC" },
  { id: "cloud", label: "Cloud & MLOps", count: 3, color: "#34D399" }
];

export default function CareerUniverse() {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(TECH_NODES[0]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeCluster, setActiveCluster] = useState("all");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "market" | "roadmap"
  const [addedToast, setAddedToast] = useState(null);

  const { addSkill, skills } = useCareerStore();
  const nodeSkillName = selectedNode.title.split("&")[0].trim();
  const alreadyHasSkill = skills.some((s) => s.toLowerCase() === nodeSkillName.toLowerCase());

  const handleAddNodeSkill = () => {
    addSkill(nodeSkillName);
    setAddedToast(`Added "${nodeSkillName}" to your verified skills!`);
    setTimeout(() => setAddedToast(null), 2500);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE, FOG & LIGHTS
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08090c, 0.007);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 14, 68);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient and Point Lights for 3D depth
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x2dd4bf, 2.5, 120);
    pointLight.position.set(0, 20, 20);
    scene.add(pointLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2.0, 120);
    purpleLight.position.set(-20, -10, -20);
    scene.add(purpleLight);

    // 2. PARTICLE DUST / STARFIELD
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 260;
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.9,
      transparent: true,
      opacity: 0.5,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 3. NODES GROUP
    const group = new THREE.Group();
    scene.add(group);
    const nodeMeshes = [];
    const ringMeshes = [];

    TECH_NODES.forEach((node) => {
      // Solid sphere core with specular shine
      const geo = new THREE.SphereGeometry(2.3, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.45,
        roughness: 0.2,
        metalness: 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(node.x, node.y, node.z);
      mesh.userData = node;
      group.add(mesh);
      nodeMeshes.push(mesh);

      // Outer Orbital Halo Ring
      const ringGeo = new THREE.RingGeometry(3.2, 3.6, 36);
      const ringMat = new THREE.MeshBasicMaterial({
        color: node.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(node.x, node.y, node.z);
      ring.rotation.x = Math.PI / 2;
      ring.userData = { parentId: node.id };
      group.add(ring);
      ringMeshes.push(ring);
    });

    // 4. CONSTELLATION STRANDS / SYNAPSE LINES
    const linePositions = [];
    for (let i = 0; i < TECH_NODES.length; i++) {
      for (let j = i + 1; j < TECH_NODES.length; j++) {
        const p1 = TECH_NODES[i];
        const p2 = TECH_NODES[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
        // Connect if close or sharing category
        if (dist < 36 || (p1.cluster === p2.cluster && dist < 45)) {
          linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      }
    }
    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.22,
    });
    const constellationLines = new THREE.LineSegments(linesGeo, linesMat);
    group.add(constellationLines);

    // 5. INTERACTION & RAYCASTING
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        group.rotation.y += deltaX * 0.005;
        group.rotation.x += deltaY * 0.005;
        prevMousePos = { x: e.clientX, y: e.clientY };
      }

      // Raycaster
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        container.style.cursor = "pointer";
        setHoveredNode(intersects[0].object.userData);
      } else {
        container.style.cursor = isDragging ? "grabbing" : "grab";
        setHoveredNode(null);
      }
    };

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        setSelectedNode(intersects[0].object.userData);
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    domElement.addEventListener("mousemove", onMouseMove);
    domElement.addEventListener("click", onClick);

    // 6. ANIMATION LOOP WITH ROTATING HALOS
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        group.rotation.y += 0.0012;
      }
      starField.rotation.y += 0.0003;

      // Pulse rings
      ringMeshes.forEach((ring, idx) => {
        ring.rotation.z += 0.01;
        const scale = 1 + Math.sin(elapsed * 2 + idx) * 0.06;
        ring.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      domElement.removeEventListener("mousemove", onMouseMove);
      domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Filter nodes display
  const displayedNodes = activeCluster === "all"
    ? TECH_NODES
    : TECH_NODES.filter((n) => n.cluster === activeCluster);

  return (
    <div className="relative min-h-[calc(100vh-3.75rem)] w-full bg-[#08090C] overflow-hidden flex flex-col justify-between select-none">
      {/* TOP HEADER & CLUSTER FILTERS */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 font-bold">
                Three.js 3D Synaptic Graph
              </span>
              <span className="text-neutral-400 text-xs font-mono">• Drag to Orbit & Click Nodes</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              AI & Tech Competency Universe
            </h1>
            <p className="text-xs text-neutral-400">
              Interactive 3D graph connecting 17 core disciplines across AI, Deep Learning, Full Stack, and Cloud Systems.
            </p>
          </div>

          {/* Hovered Target Pill */}
          {hoveredNode && (
            <div className="px-3.5 py-1.5 rounded-xl bg-[#0E1015] border border-[#2DD4BF]/50 font-mono text-xs text-[#2DD4BF] shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping" />
              <span>Target: <strong>{hoveredNode.title}</strong> ({hoveredNode.demand} Demand)</span>
            </div>
          )}
        </div>

        {/* CLUSTER FILTER BUTTONS */}
        <div className="flex flex-wrap gap-2 pt-1">
          {CLUSTER_FILTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCluster(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeCluster === c.id
                  ? "bg-[#2DD4BF] text-black font-semibold shadow-lg"
                  : "bg-[#0E1015]/90 border border-white/[0.08] text-neutral-300 hover:text-white hover:border-white/[0.2]"
              }`}
            >
              <span>{c.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                activeCluster === c.id ? "bg-black/20 text-black font-bold" : "bg-white/[0.06] text-neutral-400"
              }`}>
                {c.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3D WEBGL CANVAS */}
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full cursor-grab" />

      {/* FLOATING HUD INSPECTOR CARD */}
      {selectedNode && (
        <div className="relative z-10 max-w-lg w-full ml-auto mr-4 sm:mr-8 mb-6">
          <div className="bg-[#0E1015]/95 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.1] space-y-4 shadow-2xl">
            {/* CARD HEADER */}
            <div className="flex justify-between items-start border-b border-white/[0.06] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#2DD4BF] font-semibold block mb-0.5">
                  {selectedNode.category}
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                  {selectedNode.title}
                </h3>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 text-[#2DD4BF] inline-block">
                  {selectedNode.demand} Market Demand
                </span>
                <span className="text-[10px] font-mono text-emerald-400 block mt-1">
                  {selectedNode.marketGrowth}
                </span>
              </div>
            </div>

            {/* TAB SELECTOR INSIDE HUD */}
            <div className="flex gap-2 border-b border-white/[0.06] pb-2 text-xs font-mono">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-1 ${activeTab === "overview" ? "text-[#2DD4BF] border-b-2 border-[#2DD4BF] font-semibold" : "text-neutral-400 hover:text-white"}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("market")}
                className={`pb-1 ${activeTab === "market" ? "text-[#2DD4BF] border-b-2 border-[#2DD4BF] font-semibold" : "text-neutral-400 hover:text-white"}`}
              >
                Salary & Roles
              </button>
              <button
                onClick={() => setActiveTab("roadmap")}
                className={`pb-1 ${activeTab === "roadmap" ? "text-[#2DD4BF] border-b-2 border-[#2DD4BF] font-semibold" : "text-neutral-400 hover:text-white"}`}
              >
                Prerequisites
              </button>
            </div>

            {/* TAB CONTENT 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-3">
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {selectedNode.description}
                </p>

                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">
                    Synaptic Connected Stack ({selectedNode.connections.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {selectedNode.connections.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/[0.08] text-neutral-300 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: SALARY & ROLES */}
            {activeTab === "market" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-neutral-400 block">Average Entry-to-Mid Comp:</span>
                    <span className="font-mono text-sm font-bold text-white">{selectedNode.avgSalary}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-neutral-400 block">Mastery Curve:</span>
                    <span className="font-mono text-xs text-amber-400 font-semibold">{selectedNode.difficulty}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-1.5 font-semibold">
                    Top Career Benchmark Roles Requiring This:
                  </span>
                  <div className="space-y-1">
                    {(selectedNode.associatedRoles || []).map((r, i) => (
                      <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[#2DD4BF] font-mono text-xs">★</span>
                        <span className="text-neutral-200 text-xs">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: PREREQUISITES */}
            {activeTab === "roadmap" && (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-1.5 font-semibold">
                    Foundational Knowledge Prior to Mastery:
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {(selectedNode.prerequisites || []).map((p) => (
                      <span key={p} className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-neutral-300">
                        • {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] text-xs">
                  💡 <strong>Pro Tip:</strong> Practice technical questions on this topic in our Practice Hub to boost your ATS match percentage.
                </div>
              </div>
            )}

            {/* TOAST NOTIFICATION */}
            {addedToast && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                ✓ {addedToast}
              </div>
            )}

            {/* INTERACTIVE ACTIONS ROW */}
            <div className="pt-2 flex flex-col gap-2 font-mono text-xs border-t border-white/[0.08]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate(`/simulator?role=${encodeURIComponent(selectedNode.title)}`)}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-[#2DD4BF] to-teal-500 text-black font-semibold hover:opacity-90 transition-opacity text-center"
                >
                  Simulate In Lab →
                </button>
                <button
                  onClick={() => navigate("/practice")}
                  className="py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white hover:bg-white/[0.12] transition-colors text-center"
                >
                  Practice Questions ⚡
                </button>
              </div>

              {!alreadyHasSkill && (
                <button
                  onClick={handleAddNodeSkill}
                  className="w-full py-2 rounded-xl bg-black/50 border border-[#2DD4BF]/40 text-[#2DD4BF] hover:bg-[#2DD4BF]/15 transition-colors text-center text-xs"
                >
                  + Add "{nodeSkillName}" to My Verified Skills
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
