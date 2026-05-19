// Shared UI primitives for Ubiklos prototype
// All components assume mobile context (375px) and use design tokens via CSS variables.

const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

// ── relative-time helper, in Spanish ─────────────────────────────────────────
function relTime(iso) {
  const now = window.UBIKLOS_DATA.TODAY;
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 30) {
    const months = Math.floor(d / 30);
    return `hace ${months} ${months === 1 ? "mes" : "meses"}`;
  }
  if (d > 0) return `hace ${d} ${d === 1 ? "día" : "días"}`;
  if (h > 0) return `hace ${h} h`;
  if (m > 0) return `hace ${m} min`;
  return "ahora";
}

function activityLabel(days) {
  if (days === 0) return "activo hoy";
  if (days === 1) return "activo ayer";
  if (days <= 7) return `activo hace ${days} días`;
  if (days <= 30) return `activo hace ${Math.floor(days/7)} sem`;
  return "inactivo";
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" });
}

// ── Photo placeholder ────────────────────────────────────────────────────────
// Striped pattern with monospace label. No hand-drawn illustrations.
function PhotoSlot({ label, tone = "#7B7AC4", style, aspect = "1/1", small }) {
  const id = useMemo(() => "p" + Math.random().toString(36).slice(2, 8), []);
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: aspect,
        background: tone,
        borderRadius: 10,
        overflow: "hidden",
        ...style,
      }}
    >
      <svg width="100%" height="100%" style={{ display: "block", opacity: 0.18 }}>
        <defs>
          <pattern id={id} patternUnits="userSpaceOnUse" width="14" height="14" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="#fff" strokeWidth="14" />
            <line x1="7" y1="0" x2="7" y2="14" stroke={tone} strokeWidth="6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.92)",
          fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
          fontSize: small ? 10 : 11,
          letterSpacing: 0.4,
          textAlign: "center",
          padding: 8,
        }}
      >
        {label}
      </div>
    </div>
  );
}

// Worker avatar — initials on tone. Always circular.
function Avatar({ name, initials, tone = "#7B7AC4", size = 48, ring }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: tone,
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: size * 0.38,
        letterSpacing: 0.5,
        flexShrink: 0,
        boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 4px ${ring}` : "none",
        fontFamily: "var(--font-display, inherit)",
      }}
      title={name}
    >
      {initials}
    </div>
  );
}

// Chip — pill, optionally selectable.
function Chip({ children, active, onClick, size = "md", tone = "neutral" }) {
  const heights = { sm: 24, md: 30 };
  const px = { sm: 10, md: 12 };
  const toneStyles = {
    neutral: {
      bg: active ? "var(--color-primary)" : "rgba(14,21,48,0.05)",
      fg: active ? "#fff" : "var(--color-text)",
      bd: active ? "var(--color-primary)" : "transparent",
    },
    quiet: {
      bg: "transparent",
      fg: "var(--color-text-muted)",
      bd: "var(--color-border)",
    },
  };
  const s = toneStyles[tone];
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: heights[size],
        padding: `0 ${px[size]}px`,
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.bd}`,
        font: "500 13px/1 var(--font-sans)",
        cursor: onClick ? "pointer" : "default",
        whiteSpace: "nowrap",
        transition: "background .15s, color .15s",
      }}
    >
      {children}
    </Tag>
  );
}

// Button
function Button({ children, variant = "primary", size = "md", onClick, full, icon, disabled, style, ...rest }) {
  const heights = { sm: 36, md: 44, lg: 52 };
  const variants = {
    primary: { bg: "var(--color-primary)", fg: "#fff", bd: "var(--color-primary)" },
    whatsapp: { bg: "var(--color-whatsapp)", fg: "#fff", bd: "var(--color-whatsapp)" },
    secondary: { bg: "transparent", fg: "var(--color-text)", bd: "var(--color-border)" },
    ghost: { bg: "transparent", fg: "var(--color-text)", bd: "transparent" },
    dark: { bg: "var(--color-text)", fg: "#fff", bd: "var(--color-text)" },
  };
  const v = variants[variant];
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: heights[size],
        padding: "0 18px",
        borderRadius: 12,
        background: v.bg,
        color: v.fg,
        border: `1px solid ${v.bd}`,
        font: `600 ${size === "sm" ? 13 : 15}px/1 var(--font-sans)`,
        cursor: disabled ? "not-allowed" : "pointer",
        width: full ? "100%" : "auto",
        opacity: disabled ? 0.4 : 1,
        transition: "transform .08s, opacity .15s",
        ...style,
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.98)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

// Star row
function Stars({ value, size = 14, count = 5 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1.5, color: "var(--color-amber)" }}>
      {Array.from({ length: count }).map((_, i) => {
        const filled = value >= i + 1;
        const half = !filled && value >= i + 0.5;
        return filled || half ? <IconStar key={i} size={size} /> : <IconStarOutline key={i} size={size} style={{ color: "rgba(14,21,48,0.18)" }} />;
      })}
    </span>
  );
}

// Verification badge — sober, no medals
function Badge({ icon, label, variant = "verified" }) {
  const variants = {
    verified: { bg: "var(--color-primary-soft)", fg: "var(--color-primary-dark)" },
    neutral:  { bg: "rgba(14,21,48,0.05)", fg: "var(--color-text)" },
    success:  { bg: "rgba(37,211,102,0.10)", fg: "#0e7a3b" },
    warning:  { bg: "rgba(220,138,30,0.10)", fg: "#9a5800" },
    pending:  { bg: "rgba(125,198,232,0.18)", fg: "#1f5d7a" },
  };
  const v = variants[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 9px",
        borderRadius: 8,
        background: v.bg,
        color: v.fg,
        font: "600 11.5px/1 var(--font-sans)",
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
    </span>
  );
}

// Card
function Card({ children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid var(--color-border)",
        borderRadius: 14,
        padding: 16,
        cursor: onClick ? "pointer" : "default",
        transition: "border-color .15s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Phone shell — wraps a "screen" so it looks like a real device.
// Renders status bar + safe areas + scrollable inner.
function PhoneShell({ children, statusBarTone = "dark", bg = "var(--color-bg)" }) {
  return (
    <div className="phone-shell" style={{ background: bg }}>
      <div className="phone-status" data-tone={statusBarTone}>
        <span className="phone-time">9:41</span>
        <span className="phone-status-icons">
          <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor"><rect x="0" y="6" width="3" height="4" rx=".5"/><rect x="4" y="4" width="3" height="6" rx=".5"/><rect x="8" y="2" width="3" height="8" rx=".5"/><rect x="12" y="0" width="3" height="10" rx=".5"/></svg>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1"><path d="M7 8.2c1.5-1.5 4-1.5 5.5 0M1.5 5.2c3-3 8-3 11 0M4.2 6.7c1.5-1.5 4-1.5 5.5 0" strokeLinecap="round"/></svg>
          <svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="1" width="17" height="8" rx="1.5"/><rect x="2" y="2.5" width="11" height="5" rx="0.5" fill="currentColor"/><rect x="18.5" y="3.5" width="1.5" height="3" rx=".4" fill="currentColor"/></svg>
        </span>
      </div>
      <div className="phone-screen-inner">{children}</div>
    </div>
  );
}

// Top app bar (within a phone screen)
function TopBar({ title, left, right, sticky = true, transparent }) {
  return (
    <div
      className="phone-topbar"
      style={{
        position: sticky ? "sticky" : "relative",
        top: 0,
        background: transparent ? "transparent" : "var(--color-bg)",
        zIndex: 5,
      }}
    >
      <div className="phone-topbar-side phone-topbar-left">{left}</div>
      <div className="phone-topbar-title">{title}</div>
      <div className="phone-topbar-side phone-topbar-right">{right}</div>
    </div>
  );
}

// Modal — bottom sheet, mobile-style
function Sheet({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet-card" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="sheet-head">
            <div style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
            <button className="sheet-close" onClick={onClose}><IconClose size={20} /></button>
          </div>
        )}
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

// Sectioned list label
function SectionLabel({ children, action }) {
  return (
    <div className="section-label">
      <span>{children}</span>
      {action}
    </div>
  );
}

// Toast / inline notice
function Notice({ tone = "info", children, icon }) {
  const tones = {
    info: { bg: "rgba(125,198,232,0.16)", fg: "#1f5d7a", bd: "rgba(125,198,232,0.3)" },
    success: { bg: "rgba(37,211,102,0.10)", fg: "#0e7a3b", bd: "rgba(37,211,102,0.3)" },
    warning: { bg: "rgba(220,138,30,0.10)", fg: "#9a5800", bd: "rgba(220,138,30,0.3)" },
    primary: { bg: "var(--color-primary-soft)", fg: "var(--color-primary-dark)", bd: "rgba(123,122,196,0.3)" },
  };
  const t = tones[tone];
  return (
    <div style={{
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      borderRadius: 12, padding: "12px 14px",
      display: "flex", gap: 10, alignItems: "flex-start",
      font: "500 13.5px/1.4 var(--font-sans)",
    }}>
      {icon && <div style={{ paddingTop: 1 }}>{icon}</div>}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

// Worker card — used in search results, home carousels
// densityProp: "compact" | "regular" | "comfy" — tweakable
function WorkerCard({ worker, onOpen, density = "regular", layout = "horizontal" }) {
  const O = window.UBIKLOS_DATA.OFICIOS;
  const M = window.UBIKLOS_DATA.MUNICIPIOS;
  const oficios = worker.oficios.map((o) => O.find((x) => x.id === o)?.label).filter(Boolean);
  const municipios = worker.municipios.map((m) => M.find((x) => x.id === m)?.label).filter(Boolean);
  const hasRating = worker.rating !== null && worker.ratingsCount >= 3;
  const compact = density === "compact";

  if (layout === "vertical") {
    return (
      <Card onClick={onOpen} style={{ padding: compact ? 12 : 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={worker.name} initials={worker.initials} tone={worker.photoTone} size={48} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ font: "600 15px/1.2 var(--font-display)", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{worker.name}</div>
            <div style={{ font: "500 12px/1.3 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 3 }}>
              {oficios.join(" · ")}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {municipios.slice(0, 2).map((m) => <Chip key={m} size="sm" tone="quiet">{m}</Chip>)}
        </div>
        <div style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--color-text-muted)", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <IconCheckCircle size={13} style={{ color: "var(--color-primary)" }} />
            <b style={{ color: "var(--color-text)" }}>{worker.confirmedJobs}</b> trabajos
          </span>
          {hasRating && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              <IconStar size={12} style={{ color: "var(--color-amber)" }} />
              <b style={{ color: "var(--color-text)" }}>{worker.rating}</b>
            </span>
          )}
        </div>
      </Card>
    );
  }

  // horizontal (default)
  return (
    <Card onClick={onOpen} style={{ padding: compact ? 12 : 14, display: "flex", gap: 12, alignItems: "stretch" }}>
      <Avatar name={worker.name} initials={worker.initials} tone={worker.photoTone} size={compact ? 48 : 56} />
      <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: compact ? 4 : 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <div style={{ font: "600 15px/1.2 var(--font-display)", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{worker.name}</div>
          {worker.activeDays <= 7 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-muted)", flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#25D366" }} />
              {activityLabel(worker.activeDays)}
            </span>
          )}
        </div>
        <div style={{ font: "500 12.5px/1.3 var(--font-sans)", color: "var(--color-text-muted)" }}>
          {oficios.join(" · ")} <span style={{ opacity: 0.5 }}>·</span> {municipios.join(", ")}
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 12, color: "var(--color-text-muted)", alignItems: "center", marginTop: compact ? 1 : 3, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <IconCheckCircle size={13} style={{ color: "var(--color-primary)" }} />
            <b style={{ color: "var(--color-text)" }}>{worker.confirmedJobs}</b> confirmados
          </span>
          {hasRating && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              <IconStar size={12} style={{ color: "var(--color-amber)" }} />
              <b style={{ color: "var(--color-text)" }}>{worker.rating}</b>
              <span style={{ opacity: 0.7 }}>({worker.ratingsCount})</span>
            </span>
          )}
          {worker.verified && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--color-primary-dark)" }}>
              <IconShieldCheck size={13} />
              verificado
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

// ── Contact Simulation Toast (DEMO) ─────────────────────────────────────
// Cuando el cliente "contacta" a un trabajador, este toast se muestra en lugar
// de abrir WhatsApp real. Deja claro que es un prototipo y que en producción
// abriría WhatsApp con un mensaje pre-cargado.
function ContactSimToast({ workerName, onClose }) {
  const [closing, setClosing] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => {
      setClosing(true);
      setTimeout(onClose, 220);
    }, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed",
      bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999,
      maxWidth: 380, width: "calc(100vw - 32px)",
      background: "#0E1530",
      color: "#fff",
      borderRadius: 16,
      padding: "14px 16px",
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
      animation: closing ? "toastOut .2s forwards" : "toastIn .25s ease-out",
    }}>
      <div style={{
        width: 36, height: 36, flexShrink: 0,
        borderRadius: 10,
        background: "var(--color-whatsapp, #25D366)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
          <path d="M17.6 6.3A8 8 0 0 0 4 12c0 1.4.4 2.8 1.1 4L4 20l4.1-1.1A8 8 0 0 0 20 12a7.9 7.9 0 0 0-2.4-5.7zM12 18.5a6.6 6.6 0 0 1-3.3-.9l-.2-.1-2.4.6.7-2.3-.2-.3a6.5 6.5 0 1 1 5.4 3z"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: "600 13.5px/1.3 var(--font-display)", marginBottom: 4 }}>
          Contacto registrado con {workerName}
        </div>
        <div style={{ font: "500 12px/1.45 var(--font-sans)", opacity: 0.75 }}>
          Demo del prototipo: en el producto real aquí se abriría WhatsApp
          con un mensaje pre-cargado. Te llegará un seguimiento para confirmar
          si el trabajo se concretó.
        </div>
      </div>
      <button onClick={() => { setClosing(true); setTimeout(onClose, 220); }}
        style={{
          all: "unset", cursor: "pointer",
          padding: 4, marginTop: -2,
          opacity: 0.6,
        }} aria-label="Cerrar">
        <svg width="16" height="16" viewBox="0 0 16 16" stroke="#fff" strokeWidth="1.5" fill="none">
          <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

Object.assign(window, {
  relTime, activityLabel, formatDate,
  PhotoSlot, Avatar, Chip, Button, Stars, Badge, Card,
  PhoneShell, TopBar, Sheet, SectionLabel, Notice, WorkerCard,
  ContactSimToast,
});
