import { useEffect, useRef, useState } from "react";

/* ─── Realistic 3D Sci-Fi Robotic Multi-Agent Workflow Simulation ───────── */
const WORKFLOW_STEPS = [
  {
    step: 1,
    agent: "architect",
    title: "01. ARCHITECT ROBOT — SYSTEM BLUEPRINTING",
    desc: "Scanning repository AST & generating task_blueprint.json containing file dependencies and API interfaces...",
    color: "#5b7cfa",
    dataType: "📦 DATA PACKET: task_blueprint.json",
    dataDetail: "Payload: { targetFiles: ['src/auth/session.ts'], methods: ['validateToken()', 'refreshSession()'] }",
  },
  {
    step: 2,
    agent: "developer",
    title: "02. DEVELOPER ROBOT — CODE SYNTHESIS",
    desc: "Synthesizing code diff & writing session.ts AST nodes via dual precision welding lasers...",
    color: "#ff6b2b",
    dataType: "📦 DATA PACKET: code_patch_v1.diff",
    dataDetail: "Payload: [+export function validateToken(payload) { return payload.exp > Date.now()/1000; }]",
  },
  {
    step: 3,
    agent: "qa",
    title: "03. QA INSPECTOR ROBOT — AUTOMATED VERIFICATION",
    desc: "Executing 14 automated unit tests, validating edge cases, and running self-correcting retry loops...",
    color: "#f5c518",
    dataType: "📦 DATA PACKET: qa_test_report.log",
    dataDetail: "Payload: { totalTests: 14, passed: 14, failed: 0, retriesNeeded: 0, status: 'VERIFIED_PASS' }",
  },
  {
    step: 4,
    agent: "system",
    title: "04. SYSTEM COMPLETE — CODE COMMITTED & DEPLOYED",
    desc: "All checks passed with 100% test coverage. Task successfully committed and deployed to workspace!",
    color: "#00ff41",
    dataType: "📦 DATA PACKET: deployment_success.event",
    dataDetail: "Payload: { commitHash: 'a7f920c', branch: 'main', status: 'COMPLETED_SUCCESS' }",
  },
];

export default function DevMeshRoboticWorkflow() {
  const canvasRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [winWidth, setWinWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* Slower step transitions (6.5 seconds per step) for clear data reading */
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % WORKFLOW_STEPS.length);
      }, 6500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : (window.innerWidth < 500 ? 320 : 420);
    };
    resize();
    window.addEventListener("resize", resize);

    /* 3D Projection Helper */
    const project = (x, y, z, cx, cy, fov = 420) => {
      const scale = fov / (fov + z);
      return { x: cx + x * scale, y: cy + y * scale, scale };
    };

    const render = () => {
      time += 0.02;
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2 + (W < 500 ? 10 : 15);

      const isMobile = W < 580;
      const botOffset = isMobile ? Math.min(W * 0.28, 105) : 220;
      const fovVal    = isMobile ? 310 : 420;
      const botScale  = isMobile ? 0.62 : 1.0;

      ctx.clearRect(0, 0, W, H);

      /* 3D Robot Positions */
      const robots = [
        { id: "architect", name: isMobile ? "ARCH" : "ARCHITECT BOT", x: -botOffset, y: isMobile ? 10 : 20, z: 0, color: "#5b7cfa", tag: "PLANNER" },
        { id: "developer", name: isMobile ? "DEV"  : "DEVELOPER BOT", x: 0,          y: isMobile ? 10 : 20, z: 0, color: "#ff6b2b", tag: "BUILDER" },
        { id: "qa",        name: isMobile ? "QA"   : "QA ROBOT",        x: botOffset,  y: isMobile ? 10 : 20, z: 0, color: "#f5c518", tag: "INSPECTOR" },
      ];

      /* 1. Metallic Sci-Fi Ground Grid */
      ctx.strokeStyle = "rgba(42, 42, 56, 0.45)";
      ctx.lineWidth = 1;
      for (let x = -450; x <= 450; x += (isMobile ? 35 : 45)) {
        const p1 = project(x, 110 * botScale, -120, cx, cy, fovVal);
        const p2 = project(x, 110 * botScale, 220, cx, cy, fovVal);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      /* 2. Conduit Beams & Floating Data Packets */
      for (let i = 0; i < 2; i++) {
        const r1 = project(robots[i].x, robots[i].y - 25 * botScale, 0, cx, cy, fovVal);
        const r2 = project(robots[i + 1].x, robots[i + 1].y - 25 * botScale, 0, cx, cy, fovVal);

        // Pipe
        ctx.strokeStyle = "rgba(90, 96, 112, 0.4)";
        ctx.lineWidth = isMobile ? 2.5 : 4;
        ctx.beginPath();
        ctx.moveTo(r1.x, r1.y);
        ctx.lineTo(r2.x, r2.y);
        ctx.stroke();

        // Laser stream inside pipe
        const isConduitActive = currentStep === i || currentStep === i + 1;
        ctx.strokeStyle = isConduitActive ? robots[i].color : "rgba(42, 42, 56, 0.6)";
        ctx.lineWidth = isMobile ? 1.2 : 1.8;
        ctx.beginPath();
        ctx.moveTo(r1.x, r1.y);
        ctx.lineTo(r2.x, r2.y);
        ctx.stroke();

        /* SLOW FLOWING DATA PACKET VISUALIZATION */
        if (currentStep === i) {
          const dataProgress = (time * 0.25) % 1; 
          const px = r1.x + (r2.x - r1.x) * dataProgress;
          const py = r1.y + (r2.y - r1.y) * dataProgress;

          // Glowing Data Orb
          const orbGrad = ctx.createRadialGradient(px, py, 0, px, py, 12 * botScale);
          orbGrad.addColorStop(0, robots[i].color);
          orbGrad.addColorStop(0.6, `${robots[i].color}66`);
          orbGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = orbGrad;
          ctx.beginPath();
          ctx.arc(px, py, 12 * botScale, 0, Math.PI * 2);
          ctx.fill();

          // Data Label Tag hovering above moving packet
          const packetTag = isMobile ? (i === 0 ? "blueprint.json" : "patch.diff") : (i === 0 ? "📦 task_blueprint.json" : "📦 code_patch_v1.diff");
          ctx.font = `${isMobile ? 8 : 10}px JetBrains Mono, monospace`;
          const tw = ctx.measureText(packetTag).width;

          ctx.fillStyle = "rgba(10, 10, 12, 0.94)";
          ctx.strokeStyle = robots[i].color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(px - tw / 2 - 6, py - (isMobile ? 20 : 28), tw + 12, isMobile ? 16 : 20, 3);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.fillText(packetTag, px, py - (isMobile ? 9 : 14));
          ctx.textAlign = "left"; // reset
        }
      }

      /* 3. Render 3 Realistic Metallic 3D Sci-Fi Robots */
      robots.forEach((bot, idx) => {
        const isBotActive = WORKFLOW_STEPS[currentStep].agent === bot.id || currentStep === 3;
        const hoverY = Math.sin(time * 1.5 + idx * 2) * (isMobile ? 4 : 6);
        const botY = bot.y + hoverY;

        const pShadow = project(bot.x, botY + 65 * botScale, bot.z, cx, cy, fovVal);
        const pTorso  = project(bot.x, botY, bot.z, cx, cy, fovVal);
        const pHead   = project(bot.x, botY - 50 * botScale, bot.z, cx, cy, fovVal);
        const pShoulderL = project(bot.x - 36 * botScale, botY - 20 * botScale, bot.z, cx, cy, fovVal);
        const pShoulderR = project(bot.x + 36 * botScale, botY - 20 * botScale, bot.z, cx, cy, fovVal);
        const pHandL = project(bot.x - 44 * botScale, botY + 15 * botScale + Math.sin(time * 2 + idx) * 6, bot.z + 15, cx, cy, fovVal);
        const pHandR = project(bot.x + 44 * botScale, botY + 15 * botScale - Math.sin(time * 2 + idx) * 6, bot.z - 15, cx, cy, fovVal);

        /* Shadow Reflection */
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.beginPath();
        ctx.ellipse(pShadow.x, pShadow.y, 40 * pShadow.scale * botScale, 12 * pShadow.scale * botScale, 0, 0, Math.PI * 2);
        ctx.fill();

        if (isBotActive) {
          ctx.strokeStyle = bot.color;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.ellipse(pShadow.x, pShadow.y, (50 + Math.sin(time * 4) * 5) * pShadow.scale * botScale, 14 * pShadow.scale * botScale, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        /* Metallic Body Shading */
        const metalGrad = ctx.createLinearGradient(pTorso.x - 20, pTorso.y - 20, pTorso.x + 20, pTorso.y + 20);
        if (isBotActive) {
          metalGrad.addColorStop(0, "#2a2a38");
          metalGrad.addColorStop(0.5, "#1a1a22");
          metalGrad.addColorStop(1, "#0f0f12");
        } else {
          metalGrad.addColorStop(0, "#1c1c24");
          metalGrad.addColorStop(1, "#0a0a0c");
        }

        /* Torso */
        const tW = 60 * pTorso.scale * botScale;
        const tH = 64 * pTorso.scale * botScale;
        ctx.fillStyle = metalGrad;
        ctx.strokeStyle = isBotActive ? bot.color : "rgba(90, 96, 112, 0.4)";
        ctx.lineWidth = isBotActive ? 2 : 1.2;

        ctx.beginPath();
        ctx.roundRect(pTorso.x - tW / 2, pTorso.y - tH / 2, tW, tH, 6);
        ctx.fill();
        ctx.stroke();

        /* Arc Core */
        ctx.fillStyle = isBotActive ? bot.color : "#3a3d4a";
        ctx.beginPath();
        ctx.arc(pTorso.x, pTorso.y - 4 * botScale, 10 * botScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isBotActive ? "#ffffff" : "#5a6070";
        ctx.beginPath();
        ctx.arc(pTorso.x, pTorso.y - 4 * botScale, 4 * botScale, 0, Math.PI * 2);
        ctx.fill();

        /* Head */
        const hW = 44 * pHead.scale * botScale;
        const hH = 36 * pHead.scale * botScale;
        ctx.fillStyle = metalGrad;
        ctx.strokeStyle = isBotActive ? bot.color : "rgba(90, 96, 112, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(pHead.x - hW / 2, pHead.y - hH / 2, hW, hH, 5);
        ctx.fill();
        ctx.stroke();

        // Visor Eyes
        ctx.fillStyle = isBotActive ? bot.color : "#3a3d4a";
        ctx.beginPath();
        ctx.roundRect(pHead.x - 14 * botScale, pHead.y - 4 * botScale, 28 * botScale, 7 * botScale, 2);
        ctx.fill();

        if (isBotActive) {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(pHead.x - 5 * botScale, pHead.y - 1 * botScale, 2 * botScale, 0, Math.PI * 2);
          ctx.arc(pHead.x + 5 * botScale, pHead.y - 1 * botScale, 2 * botScale, 0, Math.PI * 2);
          ctx.fill();
        }

        /* Arms & Shoulders */
        ctx.fillStyle = isBotActive ? bot.color : "#3a3d4a";
        ctx.beginPath();
        ctx.arc(pShoulderL.x, pShoulderL.y, 5 * botScale, 0, Math.PI * 2);
        ctx.arc(pShoulderR.x, pShoulderR.y, 5 * botScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isBotActive ? bot.color : "rgba(90, 96, 112, 0.4)";
        ctx.lineWidth = isMobile ? 1.8 : 2.5;
        ctx.beginPath();
        ctx.moveTo(pShoulderL.x, pShoulderL.y);
        ctx.lineTo(pHandL.x, pHandL.y);
        ctx.moveTo(pShoulderR.x, pShoulderR.y);
        ctx.lineTo(pHandR.x, pHandR.y);
        ctx.stroke();

        ctx.fillStyle = isBotActive ? bot.color : "#5a6070";
        ctx.beginPath();
        ctx.arc(pHandL.x, pHandL.y, 4 * botScale, 0, Math.PI * 2);
        ctx.arc(pHandR.x, pHandR.y, 4 * botScale, 0, Math.PI * 2);
        ctx.fill();

        /* Actions Overlay for Desktop / Tablet */
        if (isBotActive && !isMobile) {
          if (bot.id === "architect") {
            ctx.fillStyle = "rgba(15, 15, 18, 0.95)";
            ctx.strokeStyle = "#5b7cfa";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(pHandL.x - 90, pHandL.y - 65, 95, 26, 4);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#5b7cfa";
            ctx.font = "9px JetBrains Mono";
            ctx.fillText("📐 blueprint.json", pHandL.x - 84, pHandL.y - 48);
          }
          if (bot.id === "developer") {
            ctx.fillStyle = "rgba(15, 15, 18, 0.95)";
            ctx.strokeStyle = "#ff6b2b";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(pHandR.x + 25, pHandR.y - 55, 95, 26, 4);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#00ff41";
            ctx.font = "9px JetBrains Mono";
            ctx.fillText("+validateToken()", pHandR.x + 30, pHandR.y - 38);
          }
          if (bot.id === "qa") {
            ctx.fillStyle = "rgba(15, 15, 18, 0.95)";
            ctx.strokeStyle = "#f5c518";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(pTorso.x - 45, pTorso.y + 35, 90, 24, 4);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#00ff41";
            ctx.font = "9px JetBrains Mono";
            ctx.textAlign = "center";
            ctx.fillText("✓ 14/14 PASSED", pTorso.x, pTorso.y + 50);
            ctx.textAlign = "left";
          }
        }

        /* 3D Metallic Name Badges */
        ctx.textAlign = "center";
        ctx.font = `${isMobile ? 9 : 11}px Archivo, sans-serif`;
        ctx.fillStyle = isBotActive ? bot.color : "var(--steel)";
        ctx.fillText(bot.name, pTorso.x, pShadow.y + (isMobile ? 18 : 24));

        ctx.font = `${isMobile ? 7 : 9}px JetBrains Mono, monospace`;
        ctx.fillStyle = isBotActive ? bot.color : "var(--muted)";
        ctx.fillText(bot.tag, pTorso.x, pShadow.y + (isMobile ? 28 : 37));
        ctx.textAlign = "left";
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [currentStep]);

  const activeStepInfo = WORKFLOW_STEPS[currentStep];
  const isMobileScreen  = winWidth < 600;

  return (
    <div
      className="glass-panel"
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 8,
        overflow: "hidden",
        border: `1px solid ${activeStepInfo.color}55`,
        background: "radial-gradient(ellipse at center, rgba(20,20,26,0.96) 0%, rgba(10,10,12,0.99) 100%)",
        boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 35px ${activeStepInfo.color}15`,
        transition: "border-color 0.4s, box-shadow 0.4s",
      }}
    >
      {/* HUD Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justify: "space-between",
          padding: isMobileScreen ? "10px 14px" : "14px 22px",
          borderBottom: "1px solid var(--panel-border)",
          background: "rgba(15, 15, 18, 0.92)",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: activeStepInfo.color, animation: "blink 1.2s infinite", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: isMobileScreen ? 10 : 11, textTransform: "uppercase", letterSpacing: isMobileScreen ? 1 : 2, color: "var(--steel)", fontWeight: 700 }}>
            {isMobileScreen ? "DEVMESH 3D AGENT SIMULATION" : "DEVMESH 3D ROBOTIC MULTI-AGENT DATAFLOW SIMULATION"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 10, padding: "4px 10px",
              background: isPlaying ? "rgba(255,107,43,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${isPlaying ? "var(--orange)" : "var(--panel-border)"}`,
              borderRadius: 3, color: isPlaying ? "var(--orange)" : "var(--muted)",
              cursor: "pointer", textTransform: "uppercase", fontWeight: 600,
            }}
          >
            {isPlaying ? "▌▌ Pause" : "▶ Play"}
          </button>
          {!isMobileScreen && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#00ff41", border: "1px solid rgba(0,255,65,0.3)", padding: "4px 8px", borderRadius: 3 }}>
              REALISTIC 3D METALLIC BOTS
            </span>
          )}
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div style={{ position: "relative", width: "100%", height: isMobileScreen ? 310 : 380 }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      {/* Step Navigator Bar */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          borderTop: "1px solid var(--panel-border)",
          background: "rgba(15, 15, 18, 0.9)",
        }}
      >
        {WORKFLOW_STEPS.map((s, idx) => {
          const isActive = currentStep === idx;
          const label = isMobileScreen
            ? (s.agent === "architect" ? "ARCH" : s.agent === "developer" ? "DEV" : s.agent === "qa" ? "QA" : "DONE")
            : s.agent.toUpperCase();

          return (
            <button
              key={s.step}
              onClick={() => setCurrentStep(idx)}
              style={{
                padding: isMobileScreen ? "10px 4px" : "14px 16px",
                background: isActive ? `${s.color}18` : "transparent",
                border: "none",
                borderTop: isActive ? `3px solid ${s.color}` : "3px solid transparent",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: isActive ? s.color : "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                STEP 0{s.step}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: isMobileScreen ? 10 : 11, fontWeight: 700, color: isActive ? "#ffffff" : "var(--steel)", marginTop: 2 }}>
                {label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
