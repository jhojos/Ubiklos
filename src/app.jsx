// Ubiklos main app — router, global state, persona switcher, Tweaks panel.

const { useState: useS, useEffect: useE, useMemo: useM, useCallback: useC, useRef: useR } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#7B7AC4", "#7DC6E8", "#0E1530", "#F7F7FB"],
  "cardDensity": "regular",
  "cardLayout": "horizontal",
  "ctaStyle": "sticky",
  "fontFamily": "system",
  "badgeStyle": "soft",
  "borderRadius": 12,
  "showActivityDots": true,
  "homeHeroStyle": "soft"
}/*EDITMODE-END*/;

// Font stacks
const FONT_STACKS = {
  system: { sans: "system-ui, -apple-system, 'Segoe UI', sans-serif", display: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  dmsans: { sans: "'DM Sans', system-ui, sans-serif", display: "'DM Sans', system-ui, sans-serif" },
  inter:  { sans: "'Inter', system-ui, sans-serif", display: "'Inter', system-ui, sans-serif" },
  manrope:{ sans: "'Manrope', system-ui, sans-serif", display: "'Manrope', system-ui, sans-serif" },
  serif:  { sans: "'Inter', system-ui, sans-serif", display: "'Fraunces', Georgia, serif" },
};

// Apply tokens to CSS vars on :root.
function applyTheme(t) {
  const r = document.documentElement;
  const [primary, secondary, text, bg] = t.palette;
  r.style.setProperty("--color-primary", primary);
  r.style.setProperty("--color-secondary", secondary);
  r.style.setProperty("--color-text", text);
  r.style.setProperty("--color-bg", bg);
  // Derived
  r.style.setProperty("--color-primary-soft", hexAlpha(primary, 0.14));
  r.style.setProperty("--color-primary-dark", oklchShift(primary, -0.18));
  r.style.setProperty("--color-text-muted", oklchShift(text, 0.42));
  r.style.setProperty("--color-bg-soft", oklchShift(bg, -0.012));
  r.style.setProperty("--color-border", oklchShift(bg, -0.04));
  r.style.setProperty("--color-whatsapp", "#25D366");
  r.style.setProperty("--color-whatsapp-dark", "#0e7a3b");
  r.style.setProperty("--color-amber", "#E5A019");
  r.style.setProperty("--radius", `${t.borderRadius}px`);
  const fonts = FONT_STACKS[t.fontFamily] || FONT_STACKS.system;
  r.style.setProperty("--font-sans", fonts.sans);
  r.style.setProperty("--font-display", fonts.display);
}

function hexAlpha(hex, a) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function oklchShift(hex, lAdd) {
  // Very rough: mix toward white or black in hex space.
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);
  if (lAdd > 0) {
    r = Math.round(r + (255 - r) * lAdd);
    g = Math.round(g + (255 - g) * lAdd);
    b = Math.round(b + (255 - b) * lAdd);
  } else {
    const f = 1 + lAdd;
    r = Math.round(r * f);
    g = Math.round(g * f);
    b = Math.round(b * f);
  }
  return `rgb(${Math.max(0, Math.min(255, r))}, ${Math.max(0, Math.min(255, g))}, ${Math.max(0, Math.min(255, b))})`;
}

// ── Main App ──────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useE(() => applyTheme(t), [t]);

  const [route, setRoute] = useS({ id: "client.home", params: {} });
  const [history, setHistory] = useS([]);
  const [persona, setPersona] = useS("client"); // "client" | "worker" | "admin"

  // Mutable world state.
  const [workers, setWorkers] = useS([...window.UBIKLOS_DATA.WORKERS]);
  const [pendingVerifications, setPendingVerifications] = useS([...window.UBIKLOS_DATA.PENDING_VERIFICATIONS]);
  const [followups, setFollowups] = useS([...window.UBIKLOS_DATA.PENDING_FOLLOWUPS]);
  const [confirmations, setConfirmations] = useS([...window.UBIKLOS_DATA.PENDING_CONFIRMATIONS]);
  const [currentWorkerId, setCurrentWorkerId] = useS(window.UBIKLOS_DATA.CURRENT_WORKER_ID);
  const [regData, setRegData] = useS({});
  const [workerStatus, setWorkerStatus] = useS("pending"); // pending | approved | rejected
  const [workerStats, setWorkerStats] = useS({ viewsWeek: 47, viewsDelta: 12, contactsWeek: 8, contactsDelta: 3 });
  const [jobsExpanded, setJobsExpanded] = useS(false);
  const [reportTarget, setReportTarget] = useS(null);

  const go = (id, params = {}) => {
    setHistory((h) => [...h, route]);
    setRoute({ id, params });
    setJobsExpanded(false);
    // Sync persona to route
    if (id.startsWith("worker.")) setPersona("worker");
    else if (id.startsWith("admin.")) setPersona("admin");
    else if (id.startsWith("client.")) setPersona("client");
    // Scroll screen to top
    setTimeout(() => {
      document.querySelectorAll(".phone-screen-inner").forEach((el) => el.scrollTop = 0);
    }, 0);
  };

  const back = () => {
    setHistory((h) => {
      if (h.length === 0) {
        setRoute({ id: "client.home", params: {} });
        return [];
      }
      const last = h[h.length - 1];
      setRoute(last);
      return h.slice(0, -1);
    });
  };

  // Persona switcher: jump to root screen for that persona
  const switchPersona = (p) => {
    setPersona(p);
    if (p === "client") go("client.home");
    else if (p === "worker") {
      go(workerStatus === "approved" ? "worker.dashboard" : "worker.landing");
    } else {
      go("admin.queue");
    }
  };

  // Actions
  const contactWorker = (worker) => {
    // Simulate opening WhatsApp + queueing follow-up
    const id = "fu-" + Date.now();
    setFollowups((arr) => [{ id, workerId: worker.id, contactedAt: new Date().toISOString(), status: "pending" }, ...arr]);
    setWorkerStats((s) => ({ ...s, contactsWeek: s.contactsWeek + 1 }));
    // Open WhatsApp in new tab (simulated — won't actually open)
    window.open(`https://wa.me/${worker.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${worker.name.split(" ")[0]}, te encontré en Ubiklos. ¿Estás disponible?`)}`, "_blank");
    go("client.home");
  };

  const dismissFollowup = (id) => {
    setFollowups((arr) => arr.filter((f) => f.id !== id));
  };

  const submitRating = (workerId, followupId, { stars, text }) => {
    // Add review to worker
    setWorkers((arr) => arr.map((w) => {
      if (w.id !== workerId) return w;
      const newReview = {
        id: "r-" + Date.now(),
        stars, text: text || "Trabajo bien hecho.",
        clientName: "Cliente",
        date: new Date().toISOString(),
      };
      const reviews = [newReview, ...w.reviews];
      const ratingsCount = w.ratingsCount + 1;
      const totalStars = (w.rating || 0) * w.ratingsCount + stars;
      const rating = ratingsCount >= 3 ? +(totalStars / ratingsCount).toFixed(1) : null;
      return {
        ...w,
        reviews,
        ratingsCount,
        rating,
        confirmedJobs: w.confirmedJobs + 1,
      };
    }));
    dismissFollowup(followupId);
  };

  const expandJobs = () => setJobsExpanded(true);

  const openReport = (worker) => setReportTarget(worker);

  // Registration helpers
  const updateReg = (patch) => setRegData((r) => ({ ...r, ...patch }));
  const submitRegistration = () => {
    // Add to pending verifications
    setWorkerStatus("pending");
    const id = "pending-" + Date.now();
    setPendingVerifications((arr) => [{
      id,
      name: regData.name || "Nuevo trabajador",
      initials: (regData.name || "NT").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
      photoTone: "#7B7AC4",
      cedula: regData.cedula || "V-—",
      oficios: regData.oficios || [],
      municipios: regData.municipios || [],
      phone: regData.phone || "",
      submitted: new Date().toISOString(),
      photoFront: "ok",
      photoBack: "ok",
      selfie: "ok",
      bio: regData.bio || "",
      flags: [],
    }, ...arr]);
  };
  const simulateApproval = () => setWorkerStatus("approved");

  // Worker dashboard actions
  const addJob = (job) => {
    setWorkers((arr) => arr.map((w) => {
      if (w.id !== currentWorkerId) return w;
      const newJob = {
        id: "j-" + Date.now(),
        title: job.title,
        desc: job.desc,
        photo: job.photo,
        date: new Date().toISOString(),
        confirmed: false,
        clientName: job.clientName,
      };
      return { ...w, jobs: [newJob, ...w.jobs], selfReportedJobs: w.selfReportedJobs + 1 };
    }));
  };

  const updateWorker = (id, patch) => {
    setWorkers((arr) => arr.map((w) => w.id === id ? { ...w, ...patch } : w));
  };

  const acceptConfirmation = (id) => {
    const c = confirmations.find((x) => x.id === id);
    if (!c) return;
    // Both confirmed -> add a confirmed job + increment counter
    setWorkers((arr) => arr.map((w) => {
      if (w.id !== c.workerId) return w;
      const newJob = {
        id: "j-" + Date.now(),
        title: c.jobHint.split(",")[0],
        desc: c.jobHint,
        photo: "trabajo",
        date: c.contactedAt,
        confirmed: true,
        clientName: c.clientName,
      };
      return { ...w, jobs: [newJob, ...w.jobs], confirmedJobs: w.confirmedJobs + 1 };
    }));
    setConfirmations((arr) => arr.filter((x) => x.id !== id));
  };

  const rejectConfirmation = (id) => {
    setConfirmations((arr) => arr.filter((x) => x.id !== id));
  };

  const approveVerification = (id) => {
    const v = pendingVerifications.find((p) => p.id === id);
    if (!v) return;
    setPendingVerifications((arr) => arr.filter((p) => p.id !== id));
    setWorkers((arr) => [...arr, {
      id: v.id,
      slug: v.name.toLowerCase().split(" ")[0],
      name: v.name,
      initials: v.initials,
      photoTone: v.photoTone,
      oficios: v.oficios.map((o) => o.toLowerCase()),
      municipios: v.municipios.map((m) => m.toLowerCase()),
      verified: true,
      whatsapp: true,
      location: true,
      activeDays: 0,
      confirmedJobs: 0,
      selfReportedJobs: 0,
      rating: null,
      ratingsCount: 0,
      memberSince: new Date().toISOString().slice(0, 10),
      phone: v.phone,
      bio: v.bio,
      jobs: [],
      reviews: [],
    }]);
  };

  const rejectVerification = (id, reason) => {
    setPendingVerifications((arr) => arr.filter((p) => p.id !== id));
  };

  const tweaks = t;

  const ctx = {
    go, back, tweaks,
    workers, followups, confirmations, pendingVerifications,
    currentWorkerId, regData, workerStatus, workerStats,
    jobsExpanded,
    // mutations
    contactWorker, dismissFollowup, submitRating, expandJobs, openReport,
    updateReg, submitRegistration, simulateApproval,
    addJob, updateWorker, acceptConfirmation, rejectConfirmation,
    approveVerification, rejectVerification,
  };

  const screen = renderScreen(route, ctx);

  return (
    <div className="app-root">
      <div className="phone-frame-outer">
        <div className="phone-frame">
          <div className="phone-notch" />
          <div className="phone-screen">
            {screen}
          </div>
        </div>
      </div>

      {/* Persona bar — sits outside the phone, like a designer tool */}
      <PersonaBar persona={persona} switchPersona={switchPersona} ctx={ctx} />

      {/* Report sheet (global) */}
      <Sheet open={!!reportTarget} onClose={() => setReportTarget(null)} title="Reportar perfil">
        {reportTarget && (
          <div>
            <p style={{ font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", margin: "0 0 14px" }}>
              ¿Por qué quieres reportar a {reportTarget.name}?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Información falsa", "No respondió o desapareció", "Mal trabajo", "Trato inadecuado", "Otro"].map((r) => (
                <button key={r} onClick={() => { setReportTarget(null); }} style={{
                  all: "unset", cursor: "pointer",
                  padding: "12px 14px", borderRadius: 12,
                  background: "var(--color-bg-soft)",
                  border: "1px solid var(--color-border)",
                  font: "500 14px/1.3 var(--font-sans)", color: "var(--color-text)",
                }}>{r}</button>
              ))}
            </div>
          </div>
        )}
      </Sheet>

      {/* Tweaks Panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Marca" />
        <TweakColor label="Paleta"
          value={t.palette}
          options={[
            ["#7B7AC4", "#7DC6E8", "#0E1530", "#F7F7FB"],
            ["#2D5BFF", "#25D366", "#1A1F36", "#FAFAFA"],
            ["#5448C8", "#E8E4DA", "#111315", "#F5F3EF"],
            ["#0E1530", "#7B7AC4", "#0E1530", "#FFFFFF"],
            ["#198754", "#7DC6E8", "#0F1A1A", "#F4F7F2"],
          ]}
          onChange={(v) => setTweak('palette', v)} />
        <TweakSelect label="Tipografía"
          value={t.fontFamily}
          options={[
            { value: "system", label: "System" },
            { value: "dmsans", label: "DM Sans" },
            { value: "inter", label: "Inter" },
            { value: "manrope", label: "Manrope" },
            { value: "serif", label: "Display serif" },
          ]}
          onChange={(v) => setTweak('fontFamily', v)} />
        <TweakSlider label="Radio de bordes" value={t.borderRadius} min={4} max={20} unit="px" onChange={(v) => setTweak('borderRadius', v)} />

        <TweakSection label="Búsqueda" />
        <TweakRadio label="Layout tarjeta" value={t.cardLayout} options={[{value:"horizontal", label:"Horiz."}, {value:"vertical", label:"Vert."}]} onChange={(v) => setTweak('cardLayout', v)} />
        <TweakRadio label="Densidad" value={t.cardDensity} options={[{value:"compact", label:"Compact"}, {value:"regular", label:"Regular"}]} onChange={(v) => setTweak('cardDensity', v)} />

        <TweakSection label="Perfil del trabajador" />
        <TweakSelect label="Botón WhatsApp"
          value={t.ctaStyle}
          options={[
            { value: "sticky", label: "Sticky abajo" },
            { value: "inline", label: "En línea (arriba)" },
            { value: "fab", label: "FAB flotante" },
          ]}
          onChange={(v) => setTweak('ctaStyle', v)} />

        <TweakSection label="Persona (demo)" />
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { id: "client", label: "Cliente" },
            { id: "worker", label: "Trabajador" },
            { id: "admin", label: "Admin" },
          ].map((p) => (
            <button key={p.id} onClick={() => switchPersona(p.id)} style={{
              flex: 1, padding: "8px 6px",
              background: persona === p.id ? "var(--color-text)" : "rgba(0,0,0,0.04)",
              color: persona === p.id ? "#fff" : "var(--color-text)",
              border: 0, borderRadius: 8,
              font: "600 11px/1 var(--font-sans)", cursor: "pointer",
            }}>{p.label}</button>
          ))}
        </div>
      </TweaksPanel>
    </div>
  );
}

function renderScreen(route, ctx) {
  const { id, params } = route;
  switch (id) {
    case "client.home":     return <ScreenHome ctx={{ ...ctx, expandJobs: ctx.expandJobs }} />;
    case "client.search":   return <ScreenSearch ctx={ctx} params={params} />;
    case "client.profile":  return <ScreenProfile ctx={{ ...ctx, expandJobs: ctx.expandJobs, openReport: ctx.openReport, jobsExpanded: ctx.jobsExpanded, tweaks: ctx.tweaks }} params={params} />;
    case "client.followup": return <ScreenFollowup ctx={ctx} params={params} />;
    case "client.rating":   return <ScreenRating ctx={ctx} params={params} />;
    case "worker.landing":  return <ScreenWorkerLanding ctx={ctx} />;
    case "worker.register": return <ScreenRegister ctx={ctx} params={params} />;
    case "worker.review":   return <ScreenReview ctx={ctx} />;
    case "worker.dashboard": return <ScreenDashboard ctx={ctx} />;
    case "worker.edit":     return <ScreenEdit ctx={ctx} />;
    case "worker.addJob":   return <ScreenAddJob ctx={ctx} />;
    case "worker.confirmations": return <ScreenConfirmations ctx={ctx} />;
    case "admin.queue":     return <ScreenAdminQueue ctx={ctx} />;
    case "admin.review":    return <ScreenAdminReview ctx={ctx} params={params} />;
    case "admin.metrics":   return <ScreenAdminMetrics ctx={ctx} />;
    default: return <ScreenHome ctx={ctx} />;
  }
}

// ── PersonaBar — outside the phone, like a Figma tool ──────────────────────
function PersonaBar({ persona, switchPersona, ctx }) {
  const items = [
    { id: "client",  label: "Cliente",     hint: "Busca + contrata", icon: <IconUser size={18} /> },
    { id: "worker",  label: "Trabajador",  hint: ctx.workerStatus === "approved" ? "Dashboard" : "Onboarding", icon: <IconUsers size={18} /> },
    { id: "admin",   label: "Admin",       hint: `${ctx.pendingVerifications.length} pendientes`, icon: <IconShield size={18} /> },
  ];
  return (
    <div className="persona-bar">
      <div className="persona-bar-head">
        <IconLogo size={22} />
        <div>
          <div style={{ font: "700 14px/1 var(--font-display)", color: "#fff", letterSpacing: -0.2 }}>Ubiklos</div>
          <div style={{ font: "500 11px/1 var(--font-sans)", color: "rgba(255,255,255,0.55)", marginTop: 4 }}>Prototipo · Caracas</div>
        </div>
      </div>
      <div className="persona-bar-list">
        {items.map((it) => (
          <button key={it.id}
            onClick={() => switchPersona(it.id)}
            className={`persona-btn ${persona === it.id ? "is-active" : ""}`}>
            <div className="persona-btn-icon">{it.icon}</div>
            <div className="persona-btn-text">
              <div className="persona-btn-label">{it.label}</div>
              <div className="persona-btn-hint">{it.hint}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="persona-bar-foot">
        Demo — todos los datos son ficticios. WhatsApp se abre por wa.me con mensaje pre-cargado.
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
