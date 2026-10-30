import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { useCareerStore } from "../../lib/careerStore";

const techNodes = [
  {
    id: "react",
    title: "React 19 & Next.js",
    category: "Frontend",
    x: 0,
    y: 8,
    z: 0,
    color: 0x2dd4bf,
    description: "Component architecture, Server Components, Hooks, and client state pipelines.",
    connections: ["Framer Motion", "Three.js", "TypeScript", "Node.js"],
    demand: "95%",
  },
  {
    id: "node",
    title: "Node.js & Express.js",
    category: "Backend",
    x: -24,
    y: -4,
    z: 12,
    color: 0x38bdf8,
    description: "Asynchronous microservices, middleware routing, and REST/GraphQL APIs.",
    connections: ["PostgreSQL", "Docker", "Express", "React"],
    demand: "91%",
  },
  {
    id: "angular",
    title: "Angular & TypeScript",
    category: "Enterprise",
    x: 24,
    y: -6,
    z: -10,
    color: 0xf43f5e,
    description: "Enterprise single-page applications, RxJS reactive patterns, and strict typing.",
    connections: ["TypeScript", "Node.js", "REST APIs"],
    demand: "82%",
  },
  {
    id: "threejs",
    title: "Three.js & WebGL",
    category: "3D & Creative",
    x: 16,
    y: 18,
    z: 14,
    color: 0xa855f7,
    description: "Interactive 3D spatial scenes, WebGL shaders, camera orbits, and raycasters.",
    connections: ["React", "Framer Motion", "GSAP"],
    demand: "84%",
  },
  {
    id: "framermotion",
    title: "Framer Motion & GSAP",
    category: "Motion & UI",
    x: -14,
    y: 20,
    z: -14,
    color: 0xec4899,
    description: "Declarative spring physics, gesture tracking, layoutId transitions, and timeline morphs.",
    connections: ["React", "Three.js"],
    demand: "86%",
  },
  {
    id: "docker",
    title: "Docker & Kubernetes",
    category: "Infrastructure",
    x: 0,
    y: -22,
    z: 18,
    color: 0x10b981,
    description: "Service isolation, multi-stage container builds, orchestration, and CI/CD.",
    connections: ["Node.js", "Express", "PostgreSQL"],
    demand: "93%",
  },
  {
    id: "postgres",
    title: "PostgreSQL & pgvector",
    category: "Databases",
    x: -22,
    y: -18,
    z: -16,
    color: 0xfbbf24,
    description: "Relational modeling, indexing strategies, CTEs, and 384-dimensional vector queries.",
    connections: ["Node.js", "Express", "Docker"],
    demand: "88%",
  },
];

export default function CareerUniverse() {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(techNodes[0]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [addedToast, setAddedToast] = useState(null);

  const { addSkill, skills } = useCareerStore();
  const nodeSkillName = selectedNode.title.split("&")[0].trim();
  const alreadyHasSkill = skills.some((s) => s.toLowerCase() === nodeSkillName.toLowerCase());

  const handleAddNodeSkill = () => {
    addSkill(nodeSkillName);
    setAddedToast(`Added ${nodeSkillName} to verified skills!`);
    setTimeout(() => setAddedToast(null), 2500);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090a0f, 0.008);

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 12, 60);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. STARFIELD BACKGROUND
    const starsGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(300 * 3);
    for (let i = 0; i < 300 * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 200;
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.8,
      transparent: true,
      opacity: 0.4,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 3. NODES GROUP
    const group = new THREE.Group();
    scene.add(group);
    const nodeMeshes = [];

    techNodes.forEach((node) => {
      // Solid sphere core
      const geo = new THREE.SphereGeometry(2.2, 24, 24);
      const mat = new THREE.MeshBasicMaterial({ color: node.color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(node.x, node.y, node.z);
      mesh.userData = node;
      group.add(mesh);
      nodeMeshes.push(mesh);

      // Orbital boundary ring
      const ringGeo = new THREE.RingGeometry(3.0, 3.3, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: node.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(node.x, node.y, node.z);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
    });

    // 4. CONSTELLATION STRANDS
    const linePositions = [];
    for (let i = 0; i < techNodes.length; i++) {
      for (let j = i + 1; j < techNodes.length; j++) {
        const p1 = techNodes[i];
        const p2 = techNodes[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
        if (dist < 42) {
          linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      }
    }
    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.2,
    });
    const constellationLines = new THREE.LineSegments(linesGeo, linesMat);
    group.add(constellationLines);

    // 5. INTERACTION & ORBIT
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

    // 6. ANIMATION LOOP
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (!isDragging) {
        group.rotation.y += 0.0015;
      }
      starField.rotation.y += 0.0002;
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

  return (
    <div className="relative min-h-[calc(100vh-3.75rem)] w-full bg-[#090A0F] overflow-hidden flex flex-col justify-between">
      {/* TOP HEADER CONTROLS */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface border border-border text-accent">
              Three.js Spatial Graph
            </span>
            <span className="text-textSecondary text-xs">• Drag to Orbit</span>
          </div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-textPrimary tracking-tight mt-1">
            Career Constellation 3D
          </h1>
          <p className="text-xs text-textSecondary">
            Explore interconnected frameworks: React, Node.js, Express, Angular, Three.js, and Docker.
          </p>
        </div>

        {/* Hovered Target Pill */}
        {hoveredNode && (
          <div className="px-3 py-1.5 rounded-lg bg-[#11131E] border border-accent/40 font-mono text-xs text-accent">
            Hovered: {hoveredNode.title}
          </div>
        )}
      </div>

      {/* 3D WEBGL CANVAS */}
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full cursor-grab" />

      {/* FLOATING INSPECTOR CARD */}
      {selectedNode && (
        <div className="relative z-10 max-w-md w-full ml-auto mr-4 sm:mr-8 mb-6">
          <div className="ui-card rounded-xl p-5 border border-border space-y-3.5 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-accent font-semibold">
                  {selectedNode.category} Node
                </span>
                <h3 className="font-display font-bold text-base sm:text-lg text-textPrimary">
                  {selectedNode.title}
                </h3>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0C0E15] border border-border text-accent">
                {selectedNode.demand} Demand
              </span>
            </div>

            <p className="text-xs text-textSecondary leading-relaxed">
              {selectedNode.description}
            </p>

            <div className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-textMuted">
                Adjacent Connected Stack
              </span>
              <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                {selectedNode.connections.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded bg-[#0C0E15] border border-border text-textSecondary flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {addedToast && (
              <div className="p-2 rounded bg-[#0F2922] border border-[#2DD4BF]/40 text-[#2DD4BF] text-[11px] font-mono">
                ✓ {addedToast}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2 font-mono text-xs border-t border-border/80">
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/simulator?role=${encodeURIComponent(selectedNode.title)}`)}
                  className="flex-1 py-2 rounded-lg bg-accent text-black font-semibold hover:bg-teal-300 transition-all text-center"
                >
                  Simulate In Lab →
                </button>
                <button
                  onClick={() => navigate("/roles")}
                  className="px-3 py-2 rounded-lg bg-[#0C0E15] border border-border text-textSecondary hover:text-textPrimary"
                >
                  Role Matrix
                </button>
              </div>

              {!alreadyHasSkill && (
                <button
                  onClick={handleAddNodeSkill}
                  className="w-full py-1.5 rounded-lg bg-[#141724] border border-[#2DD4BF]/40 text-[#2DD4BF] hover:bg-[#2DD4BF]/10 transition-colors text-center text-[11px]"
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
