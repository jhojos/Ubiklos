// Client flow screens: Home, Search Results, Profile, How-it-works,
// post-contact follow-up modal, rating screen.

const { useState: useStateC, useEffect: useEffectC, useMemo: useMemoC, useRef: useRefC } = React;

// ── Home / Landing ─────────────────────────────────────────────────────────
function ScreenHome({ ctx }) {
  const { OFICIOS, MUNICIPIOS, WORKERS } = window.UBIKLOS_DATA;
  const [oficio, setOficio] = useStateC("");
  const [municipio, setMunicipio] = useStateC("");
  const tweaks = ctx.tweaks;

  // featured: take 6 most active confirmed workers
  const featured = useMemoC(() =>
    [...WORKERS].sort((a, b) => (a.activeDays - b.activeDays) || (b.confirmedJobs - a.confirmedJobs)).slice(0, 6),
  []);

  // Stats reales calculados desde el mock data
  const stats = useMemoC(() => ({
    workers: WORKERS.length,
    jobs: WORKERS.reduce((s, w) => s + (w.confirmedJobs || 0), 0),
    municipios: MUNICIPIOS.length,
  }), []);

  const doSearch = () => ctx.go("client.search", { oficio, municipio });

  return (
    <PhoneShell statusBarTone="dark" bg="var(--color-bg)">
      {/* Header */}
      <div style={{ padding: "10px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconLogo size={28} />
          <span style={{ font: "700 18px/1 var(--font-display)", color: "var(--color-text)", letterSpacing: -0.3 }}>ubiklos</span>
        </div>
        <button
          onClick={() => ctx.go("worker.landing")}
          style={{
            font: "500 13px/1 var(--font-sans)",
            color: "var(--color-text-muted)",
            background: "transparent",
            border: 0,
            padding: "8px 4px",
            cursor: "pointer",
          }}
        >
          Soy trabajador →
        </button>
      </div>

      {/* Active follow-up banner (if any) */}
      {ctx.followups && ctx.followups.length > 0 && (
        <div style={{ padding: "16px 0 0" }}>
          <PostContactBanner ctx={ctx} followup={ctx.followups[0]} />
        </div>
      )}

      {/* Hero */}
      <div style={{ padding: "22px 18px 14px" }}>
        {/* Mini-etiqueta categórica */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 10px",
          background: "var(--color-primary-soft)",
          color: "var(--color-primary-dark)",
          borderRadius: 999,
          font: "600 11px/1 var(--font-sans)",
          letterSpacing: 0.3,
          textTransform: "uppercase",
          marginBottom: 12,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--color-primary)",
            display: "inline-block",
          }} />
          Directorio de oficios · Caracas
        </div>

        {/* Titular + isotipo */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              font: `700 26px/1.15 var(--font-display)`,
              color: "var(--color-text)",
              margin: 0,
              letterSpacing: -0.6,
              textWrap: "balance",
            }}>
              Encuentra plomeros, electricistas y más en tu zona.
            </h1>
            <p style={{
              font: "500 14px/1.45 var(--font-sans)",
              color: "var(--color-text-muted)",
              margin: "10px 0 0",
            }}>
              Trabajadores verificados con historial de trabajos confirmados por clientes reales.
            </p>
          </div>
          <img
            src="icons/icon-192.png"
            alt=""
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(14,21,48,0.10)",
              border: "1px solid var(--color-border)",
            }}
          />
        </div>

        {/* Chips de confianza */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {[
            "Cédula verificada",
            "Sin comisiones",
            "Trabajos confirmados",
          ].map((t) => (
            <span key={t} style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 9px 5px 7px",
              background: "#fff",
              border: "1px solid var(--color-border)",
              borderRadius: 999,
              font: "600 11.5px/1 var(--font-sans)",
              color: "var(--color-text)",
            }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <circle cx="5.5" cy="5.5" r="5" fill="var(--color-primary)" />
                <path d="M3.3 5.6l1.6 1.4 2.8-3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Search panel */}
      <div style={{ padding: "0 18px" }}>
        <div style={{
          background: "#fff",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          boxShadow: "0 2px 6px rgba(14,21,48,0.04)",
        }}>
          <SelectorField
            label="Qué necesitas"
            value={oficio}
            options={[{ id: "", label: "Cualquier oficio" }, ...OFICIOS]}
            onChange={setOficio}
          />
          <SelectorField
            label="En qué zona"
            value={municipio}
            options={[{ id: "", label: "Cualquier municipio" }, ...MUNICIPIOS]}
            onChange={setMunicipio}
          />
          <Button variant="primary" full size="lg" onClick={doSearch} icon={<IconSearch size={18} />}>
            Buscar trabajadores
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ padding: "18px 18px 0" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          background: "var(--color-bg-soft)",
          border: "1px solid var(--color-border)",
          borderRadius: 14,
          overflow: "hidden",
        }}>
          {[
            { n: stats.workers, l: "trabajadores" },
            { n: stats.jobs, l: "trabajos confirmados" },
            { n: stats.municipios, l: "municipios" },
          ].map((s, i) => (
            <div key={s.l} style={{
              padding: "12px 8px",
              textAlign: "center",
              borderLeft: i > 0 ? "1px solid var(--color-border)" : "none",
            }}>
              <div style={{
                font: "700 20px/1 var(--font-display)",
                color: "var(--color-text)",
                letterSpacing: -0.5,
              }}>{s.n}</div>
              <div style={{
                font: "500 11px/1.2 var(--font-sans)",
                color: "var(--color-text-muted)",
                marginTop: 4,
              }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Por qué Ubiklos */}
      <div style={{ padding: "26px 18px 8px" }}>
        <SectionLabel>Por qué Ubiklos</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { t: "Identidad verificada", d: "Cada trabajador valida su cédula antes de aparecer en el directorio." },
            { t: "Historial real", d: "Los trabajos cuentan solo cuando el cliente los confirma. No hay reseñas falsas." },
            { t: "Sin intermediarios", d: "Hablas directo por WhatsApp. Ubiklos no cobra comisiones ni intermedia pagos." },
          ].map((r) => (
            <div key={r.t} style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              padding: "12px 14px",
              background: "#fff",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8,
                background: "var(--color-primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7.2l2.5 2.3L11 4.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ font: "700 14px/1.3 var(--font-display)", color: "var(--color-text)" }}>{r.t}</div>
                <div style={{ font: "500 13px/1.45 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 3 }}>{r.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: "20px 18px 8px" }}>
        <SectionLabel>Cómo funciona</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { n: "1", t: "Busca por oficio y zona", d: "Filtra entre trabajadores activos en tu municipio." },
            { n: "2", t: "Revisa su historial", d: "Cada trabajo confirmado fue verificado con el cliente." },
            { n: "3", t: "Contacta por WhatsApp", d: "Coordina directamente. Ubiklos no intermedia el trabajo." },
          ].map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "var(--color-primary-soft)",
                color: "var(--color-primary-dark)",
                display: "flex", alignItems: "center", justifyContent: "center",
                font: "700 14px/1 var(--font-display)",
                flexShrink: 0,
              }}>{s.n}</div>
              <div>
                <div style={{ font: "600 14px/1.3 var(--font-display)", color: "var(--color-text)" }}>{s.t}</div>
                <div style={{ font: "500 13px/1.4 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 2 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured this week */}
      <div style={{ padding: "20px 0 8px" }}>
        <div style={{ padding: "0 18px" }}>
          <SectionLabel
            action={<button onClick={() => ctx.go("client.search", {})} style={linkBtn}>Ver todos →</button>}
          >Activos esta semana</SectionLabel>
        </div>
        <div style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "4px 18px 16px",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }} className="hide-scroll">
          {featured.map((w) => (
            <div key={w.id} style={{ scrollSnapAlign: "start", flex: "0 0 168px" }}>
              <FeaturedCard worker={w} onClick={() => ctx.go("client.profile", { id: w.id })} />
            </div>
          ))}
        </div>
      </div>

      {/* CTA worker */}
      <div style={{ padding: "8px 18px 28px" }}>
        <div style={{
          background: "var(--color-text)",
          color: "#fff",
          borderRadius: 16,
          padding: "18px 18px",
          display: "flex",
          gap: 14,
          alignItems: "center",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ font: "700 15px/1.2 var(--font-display)" }}>¿Eres trabajador?</div>
            <div style={{ font: "500 13px/1.4 var(--font-sans)", opacity: 0.7, marginTop: 4 }}>
              Crea tu perfil con verificación de cédula. Sin comisiones, sin pagos en la plataforma.
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => ctx.go("worker.landing")}>Registrarme</Button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 18px 26px", textAlign: "center", color: "var(--color-text-muted)", font: "500 12px/1.6 var(--font-sans)" }}>
        Ubiklos · Caracas · v0.1<br />
        <span style={{ opacity: 0.7 }}>Términos · Privacidad · Contacto</span>
      </div>
    </PhoneShell>
  );
}

const linkBtn = {
  background: "transparent", border: 0, padding: 0,
  font: "500 13px/1 var(--font-sans)",
  color: "var(--color-primary)", cursor: "pointer",
};

function SelectorField({ label, value, options, onChange }) {
  return (
    <label style={{
      display: "flex", flexDirection: "column", gap: 4,
      background: "var(--color-bg-soft)",
      border: "1px solid var(--color-border)",
      borderRadius: 12,
      padding: "9px 14px 8px",
      cursor: "pointer",
      position: "relative",
    }}>
      <span style={{ font: "500 11px/1 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ font: "600 15px/1.2 var(--font-display)", color: "var(--color-text)" }}>
          {options.find((o) => o.id === value)?.label || options[0].label}
        </span>
        <IconChevronDown size={16} style={{ color: "var(--color-text-muted)" }} />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", appearance: "none", border: 0 }}
      >
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}

function FeaturedCard({ worker, onClick }) {
  const { OFICIOS } = window.UBIKLOS_DATA;
  const officio = OFICIOS.find((o) => o.id === worker.oficios[0])?.label;
  return (
    <button
      onClick={onClick}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 12,
        background: "#fff",
        border: "1px solid var(--color-border)",
        borderRadius: 14,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={worker.name} initials={worker.initials} tone={worker.photoTone} size={40} />
        {worker.verified && (
          <span style={{
            marginLeft: "auto",
            color: "var(--color-primary-dark)",
            display: "inline-flex",
          }}><IconShieldCheck size={16} /></span>
        )}
      </div>
      <div>
        <div style={{ font: "600 14px/1.2 var(--font-display)", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{worker.name}</div>
        <div style={{ font: "500 12px/1.3 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 2 }}>{officio}</div>
      </div>
      <div style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--color-text-muted)", display: "inline-flex", gap: 4, alignItems: "center" }}>
        <IconCheckCircle size={12} style={{ color: "var(--color-primary)" }} />
        {worker.confirmedJobs} trabajos
      </div>
    </button>
  );
}

// ── Search Results ─────────────────────────────────────────────────────────
function ScreenSearch({ ctx, params }) {
  const { OFICIOS, MUNICIPIOS, WORKERS } = window.UBIKLOS_DATA;
  const tweaks = ctx.tweaks;

  const [selectedOficios, setSelectedOficios] = useStateC(params?.oficio ? [params.oficio] : []);
  const [selectedMunicipios, setSelectedMunicipios] = useStateC(params?.municipio ? [params.municipio] : []);
  const [verifiedOnly, setVerifiedOnly] = useStateC(false);
  const [sort, setSort] = useStateC("relevance");
  const [filtersOpen, setFiltersOpen] = useStateC(false);

  const toggleIn = (arr, id) => arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  const list = useMemoC(() => {
    let r = ctx.workers || WORKERS;
    if (selectedOficios.length) r = r.filter((w) => w.oficios.some((o) => selectedOficios.includes(o)));
    if (selectedMunicipios.length) r = r.filter((w) => w.municipios.some((m) => selectedMunicipios.includes(m)));
    if (verifiedOnly) r = r.filter((w) => w.verified);
    if (sort === "active") r = [...r].sort((a, b) => a.activeDays - b.activeDays);
    else if (sort === "rated") r = [...r].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else r = [...r].sort((a, b) => {
      // relevance: confirmed jobs / 2 - activeDays
      const score = (w) => w.confirmedJobs * 2 - w.activeDays * 1.5 - (w.activeDays > 7 ? 20 : 0);
      return score(b) - score(a);
    });
    return r;
  }, [ctx.workers, selectedOficios, selectedMunicipios, verifiedOnly, sort]);

  const headerSubtitle = useMemoC(() => {
    const ofText = selectedOficios.length === 1 ? OFICIOS.find((o) => o.id === selectedOficios[0])?.label.toLowerCase() + "s" :
      selectedOficios.length > 1 ? `${selectedOficios.length} oficios` : "todos";
    const muText = selectedMunicipios.length === 1 ? MUNICIPIOS.find((m) => m.id === selectedMunicipios[0])?.label :
      selectedMunicipios.length > 1 ? `${selectedMunicipios.length} zonas` : "Caracas";
    return `${ofText} en ${muText}`;
  }, [selectedOficios, selectedMunicipios]);

  return (
    <PhoneShell>
      <TopBar
        left={<BackButton onClick={() => ctx.go("client.home")} />}
        title={
          <div>
            <div style={{ font: "600 15px/1.1 var(--font-display)", color: "var(--color-text)" }}>Buscar</div>
            <div style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 2 }}>{headerSubtitle}</div>
          </div>
        }
        right={
          <button onClick={() => setFiltersOpen(true)} style={iconBtn}>
            <IconFilter size={20} />
          </button>
        }
      />

      {/* Quick filter strip */}
      <div className="hide-scroll" style={{ display: "flex", gap: 6, padding: "4px 18px 10px", overflowX: "auto" }}>
        {OFICIOS.map((o) => (
          <Chip key={o.id} size="sm" active={selectedOficios.includes(o.id)} onClick={() => setSelectedOficios(toggleIn(selectedOficios, o.id))}>
            {o.label}
          </Chip>
        ))}
      </div>

      {/* Sort */}
      <div style={{ display: "flex", padding: "0 18px 10px", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ font: "500 13px/1 var(--font-sans)", color: "var(--color-text-muted)" }}>
          {list.length} {list.length === 1 ? "trabajador" : "trabajadores"}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["relevance", "active", "rated"].map((s) => (
            <button key={s}
              onClick={() => setSort(s)}
              style={{
                background: sort === s ? "var(--color-text)" : "transparent",
                color: sort === s ? "#fff" : "var(--color-text-muted)",
                border: 0,
                padding: "6px 10px",
                borderRadius: 8,
                font: "600 11.5px/1 var(--font-sans)",
                cursor: "pointer",
              }}>
              {s === "relevance" ? "Relevancia" : s === "active" ? "Más activos" : "Mejor calificados"}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: "0 18px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
        {list.length === 0 && (
          <EmptyResults oficios={selectedOficios} municipios={selectedMunicipios} onSuggestion={(m) => {
            setSelectedMunicipios([m]);
          }} />
        )}
        {list.map((w) => (
          <WorkerCard
            key={w.id}
            worker={w}
            density={tweaks.cardDensity}
            layout={tweaks.cardLayout}
            onOpen={() => ctx.go("client.profile", { id: w.id })}
          />
        ))}
      </div>

      {/* Filters sheet */}
      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <div style={{ font: "600 13px/1 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>Oficio</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {OFICIOS.map((o) => (
                <Chip key={o.id} active={selectedOficios.includes(o.id)} onClick={() => setSelectedOficios(toggleIn(selectedOficios, o.id))}>{o.label}</Chip>
              ))}
            </div>
          </div>
          <div>
            <div style={{ font: "600 13px/1 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>Municipio</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {MUNICIPIOS.map((m) => (
                <Chip key={m.id} active={selectedMunicipios.includes(m.id)} onClick={() => setSelectedMunicipios(toggleIn(selectedMunicipios, m.id))}>{m.label}</Chip>
              ))}
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0", borderTop: "1px solid var(--color-border)" }}>
            <div>
              <div style={{ font: "600 14px/1.3 var(--font-display)", color: "var(--color-text)" }}>Solo verificados</div>
              <div style={{ font: "500 12px/1.3 var(--font-sans)", color: "var(--color-text-muted)" }}>Cédula confirmada por Ubiklos.</div>
            </div>
            <Toggle value={verifiedOnly} onChange={setVerifiedOnly} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" full onClick={() => { setSelectedOficios([]); setSelectedMunicipios([]); setVerifiedOnly(false); }}>Limpiar</Button>
            <Button variant="primary" full onClick={() => setFiltersOpen(false)}>Aplicar</Button>
          </div>
        </div>
      </Sheet>
    </PhoneShell>
  );
}

function EmptyResults({ oficios, municipios, onSuggestion }) {
  const { OFICIOS, MUNICIPIOS } = window.UBIKLOS_DATA;
  const ofLabel = oficios[0] ? OFICIOS.find((o) => o.id === oficios[0])?.label.toLowerCase() : "trabajadores";
  const muLabel = municipios[0] ? MUNICIPIOS.find((m) => m.id === municipios[0])?.label : "tu zona";
  const nearby = MUNICIPIOS.filter((m) => !municipios.includes(m.id)).slice(0, 3);
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ font: "600 15px/1.3 var(--font-display)", color: "var(--color-text)", marginBottom: 6 }}>
        Aún no tenemos {ofLabel} en {muLabel}.
      </div>
      <div style={{ font: "500 13px/1.4 var(--font-sans)", color: "var(--color-text-muted)", marginBottom: 14 }}>
        Mientras tanto, mira {ofLabel} en zonas cercanas:
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {nearby.map((m) => (
          <Chip key={m.id} onClick={() => onSuggestion(m.id)}>{m.label} →</Chip>
        ))}
      </div>
    </Card>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 999,
        background: value ? "var(--color-primary)" : "rgba(14,21,48,0.16)",
        position: "relative", border: 0, cursor: "pointer",
        transition: "background .15s",
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: value ? 21 : 3,
        width: 20, height: 20, borderRadius: "50%", background: "#fff",
        transition: "left .15s",
        boxShadow: "0 1px 3px rgba(0,0,0,.2)",
      }} />
    </button>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} style={iconBtn}>
      <IconChevronLeft size={22} />
    </button>
  );
}

const iconBtn = {
  width: 38, height: 38, borderRadius: 10, border: 0,
  background: "transparent", color: "var(--color-text)",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
};

// ── Public Profile ─────────────────────────────────────────────────────────
function ScreenProfile({ ctx, params }) {
  const { WORKERS, OFICIOS, MUNICIPIOS } = window.UBIKLOS_DATA;
  const workers = ctx.workers || WORKERS;
  const worker = workers.find((w) => w.id === params.id);
  const tweaks = ctx.tweaks;
  const [photoOpen, setPhotoOpen] = useStateC(null);
  const [confirmContact, setConfirmContact] = useStateC(false);

  if (!worker) return <PhoneShell><div style={{ padding: 24 }}>Trabajador no encontrado.</div></PhoneShell>;

  const officios = worker.oficios.map((o) => OFICIOS.find((x) => x.id === o)).filter(Boolean);
  const municipios = worker.municipios.map((m) => MUNICIPIOS.find((x) => x.id === m)).filter(Boolean);
  const hasRating = worker.rating !== null && worker.ratingsCount >= 3;
  const hasReviews = worker.reviews.length > 0;
  const confirmedJobs = worker.jobs.filter((j) => j.confirmed);
  const selfReportedJobs = worker.jobs.filter((j) => !j.confirmed);

  const handleWhatsapp = () => {
    setConfirmContact(false);
    ctx.contactWorker(worker);
  };

  const ctaStyle = tweaks.ctaStyle; // "sticky" | "inline" | "fab"

  return (
    <PhoneShell>
      <TopBar
        left={<BackButton onClick={() => ctx.back()} />}
        title=""
        right={<button style={iconBtn} onClick={() => ctx.openReport(worker)}><IconMore size={20} /></button>}
        transparent
      />

      {/* Profile header */}
      <div style={{ padding: "8px 20px 0" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <Avatar name={worker.name} initials={worker.initials} tone={worker.photoTone} size={84} ring={worker.verified ? "var(--color-primary-soft)" : null} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: "700 22px/1.15 var(--font-display)", color: "var(--color-text)", letterSpacing: -0.4 }}>{worker.name}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
              {officios.map((o) => <Chip key={o.id} size="sm">{o.label}</Chip>)}
            </div>
            <div style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}>
              <IconPin size={13} />
              {municipios.map((m) => m.label).join(" · ")}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: hasRating ? "1fr 1fr 1fr" : "1fr 1fr",
          gap: 8,
          marginTop: 16,
          padding: "12px 4px",
          background: "var(--color-bg-soft)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
        }}>
          <div style={{ textAlign: "center", padding: "2px 4px" }}>
            <div style={{ font: "700 20px/1 var(--font-display)", color: "var(--color-text)", letterSpacing: -0.4 }}>{worker.confirmedJobs}</div>
            <div style={{ font: "500 10.5px/1.2 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 3 }}>trabajos confirmados</div>
          </div>
          {hasRating && (
            <div style={{ textAlign: "center", padding: "2px 4px", borderLeft: "1px solid var(--color-border)" }}>
              <div style={{ font: "700 20px/1 var(--font-display)", color: "var(--color-text)", letterSpacing: -0.4 }}>{worker.rating}</div>
              <div style={{ font: "500 10.5px/1.2 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 3 }}>{worker.ratingsCount} calificaciones</div>
            </div>
          )}
          <div style={{ textAlign: "center", padding: "2px 4px", borderLeft: "1px solid var(--color-border)" }}>
            <div style={{
              font: "700 13.5px/1.1 var(--font-display)",
              color: worker.activeDays <= 7 ? "#1a8a4a" : "var(--color-text)",
              letterSpacing: -0.3,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}>
              {worker.activeDays <= 7 && (
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#25D366", display: "inline-block" }} />
              )}
              {activityLabel(worker.activeDays)}
            </div>
            <div style={{ font: "500 10.5px/1.2 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 3 }}>
              desde {formatDate(worker.memberSince)}
            </div>
          </div>
        </div>
      </div>

      {/* Verification badges row */}
      <div className="hide-scroll" style={{ display: "flex", gap: 6, padding: "14px 20px 0", overflowX: "auto" }}>
        {worker.verified && <Badge icon={<IconShieldCheck size={13} />} label="Cédula verificada" />}
        {worker.whatsapp && <Badge icon={<IconWhatsapp size={13} />} label="WhatsApp verificado" />}
        {worker.location && <Badge icon={<IconPin size={13} />} label="Ubicación verificada" />}
        <Badge icon={<IconCheckCircle size={13} />} label={`${worker.confirmedJobs} confirmados`} variant="success" />
      </div>

      {/* CTA (inline variant rendered here too) */}
      {ctaStyle === "inline" && (
        <div style={{ padding: "16px 20px 0" }}>
          <Button variant="whatsapp" size="lg" full icon={<IconWhatsapp size={20} />} onClick={() => setConfirmContact(true)}>
            Contactar por WhatsApp
          </Button>
        </div>
      )}

      {/* Bio */}
      <div style={{ padding: "20px 20px 0" }}>
        <SectionLabel>Sobre {worker.name.split(" ")[0]}</SectionLabel>
        <p style={{ font: "500 14px/1.55 var(--font-sans)", color: "var(--color-text)", margin: 0, textWrap: "pretty" }}>{worker.bio}</p>
      </div>

      {/* Rating summary if applicable */}
      {hasRating && (
        <div style={{ padding: "20px 20px 0" }}>
          <SectionLabel>Calificaciones</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--color-bg-soft)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 14 }}>
            <div>
              <div style={{ font: "700 30px/1 var(--font-display)", color: "var(--color-text)", letterSpacing: -0.5 }}>{worker.rating}</div>
              <Stars value={worker.rating} size={13} />
            </div>
            <div style={{ flex: 1, font: "500 13px/1.4 var(--font-sans)", color: "var(--color-text-muted)" }}>
              Promedio de {worker.ratingsCount} clientes que confirmaron el trabajo.
            </div>
          </div>
        </div>
      )}

      {/* Confirmed jobs */}
      <div style={{ padding: "20px 20px 0" }}>
        <SectionLabel>Trabajos confirmados ({confirmedJobs.length})</SectionLabel>
        {confirmedJobs.length === 0 ? (
          <div style={{ font: "500 13px/1.4 var(--font-sans)", color: "var(--color-text-muted)" }}>
            Aún no hay trabajos confirmados por clientes.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {confirmedJobs.slice(0, tweaks.jobsExpanded ? confirmedJobs.length : 3).map((j) => (
              <JobRow key={j.id} job={j} confirmed tone={worker.photoTone} onClick={() => setPhotoOpen(j)} />
            ))}
            {!tweaks.jobsExpanded && confirmedJobs.length > 3 && (
              <button style={{ ...linkBtn, alignSelf: "flex-start" }} onClick={() => ctx.expandJobs()}>
                Ver {confirmedJobs.length - 3} más →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Self reported */}
      {selfReportedJobs.length > 0 && (
        <div style={{ padding: "20px 20px 0" }}>
          <SectionLabel>Trabajos autoreportados</SectionLabel>
          <div style={{ font: "500 12px/1.4 var(--font-sans)", color: "var(--color-text-muted)", marginBottom: 8 }}>
            Reportados por {worker.name.split(" ")[0]}. Aún sin confirmación del cliente.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {selfReportedJobs.map((j) => (
              <JobRow key={j.id} job={j} confirmed={false} tone={worker.photoTone} onClick={() => setPhotoOpen(j)} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {hasReviews && (
        <div style={{ padding: "20px 20px 0" }}>
          <SectionLabel>Lo que dicen los clientes</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {worker.reviews.map((r) => (
              <Card key={r.id} style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <Stars value={r.stars} />
                  <span style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--color-text-muted)" }}>{relTime(r.date)}</span>
                </div>
                <p style={{ font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text)", margin: "4px 0 6px" }}>"{r.text}"</p>
                <div style={{ font: "500 12px/1 var(--font-sans)", color: "var(--color-text-muted)" }}>— {r.clientName}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Report */}
      <div style={{ padding: "28px 20px 28px", textAlign: "center" }}>
        <button style={{ ...linkBtn, color: "var(--color-text-muted)" }} onClick={() => ctx.openReport(worker)}>
          <IconFlag size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
          Reportar este perfil
        </button>
      </div>

      {/* Bottom spacer for sticky CTA */}
      {ctaStyle === "sticky" && <div style={{ height: 78 }} />}
      {ctaStyle === "fab" && <div style={{ height: 24 }} />}

      {/* Sticky CTA */}
      {ctaStyle === "sticky" && (
        <div style={{
          position: "sticky", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(180deg, rgba(247,247,251,0) 0%, var(--color-bg) 40%)",
          padding: "12px 16px 18px",
        }}>
          <Button variant="whatsapp" size="lg" full icon={<IconWhatsapp size={20} />} onClick={() => setConfirmContact(true)}>
            Contactar por WhatsApp
          </Button>
        </div>
      )}

      {/* FAB */}
      {ctaStyle === "fab" && (
        <button
          onClick={() => setConfirmContact(true)}
          style={{
            position: "fixed", right: 20, bottom: 20,
            width: 56, height: 56, borderRadius: "50%",
            background: "var(--color-whatsapp)", color: "#fff",
            border: 0, cursor: "pointer",
            boxShadow: "0 6px 16px rgba(37,211,102,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 8,
          }}
        >
          <IconWhatsapp size={26} />
        </button>
      )}

      {/* Photo viewer */}
      <Sheet open={!!photoOpen} onClose={() => setPhotoOpen(null)} title={photoOpen?.title}>
        {photoOpen && (
          <div>
            <PhotoSlot label={`foto: ${photoOpen.photo}`} tone={worker.photoTone} aspect="4/3" style={{ marginBottom: 12 }} />
            <p style={{ font: "500 13.5px/1.5 var(--font-sans)", color: "var(--color-text)", margin: 0 }}>{photoOpen.desc}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12, font: "500 12px/1.3 var(--font-sans)", color: "var(--color-text-muted)" }}>
              <span>{formatDate(photoOpen.date)}</span>
              {photoOpen.confirmed ? (
                <span style={{ color: "var(--color-primary-dark)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <IconCheckCircle size={12} /> Confirmado por {photoOpen.clientName}
                </span>
              ) : (
                <span>Autoreportado</span>
              )}
            </div>
          </div>
        )}
      </Sheet>

      {/* Pre-WhatsApp confirm */}
      <Sheet open={confirmContact} onClose={() => setConfirmContact(false)} title="">
        <div style={{ paddingTop: 4 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
            <Avatar name={worker.name} initials={worker.initials} tone={worker.photoTone} size={56} />
            <div>
              <div style={{ font: "700 17px/1.2 var(--font-display)", color: "var(--color-text)" }}>{worker.name}</div>
              <div style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--color-text-muted)" }}>{officios.map((o) => o.label).join(", ")}</div>
            </div>
          </div>
          <Notice tone="info" icon={<IconChat size={18} />}>
            Mensaje que se enviaría por WhatsApp:
          </Notice>
          <div style={{
            background: "rgba(37,211,102,0.07)",
            border: "1px solid rgba(37,211,102,0.18)",
            borderRadius: 12, padding: 14, marginTop: 10,
            font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text)",
          }}>
            "Hola {worker.name.split(" ")[0]}, te encontré en Ubiklos. Necesito ayuda con {officios[0]?.label.toLowerCase()}. ¿Estás disponible?"
          </div>
          <div style={{
            marginTop: 12,
            padding: "10px 12px",
            background: "rgba(229,160,25,0.10)",
            border: "1px solid rgba(229,160,25,0.25)",
            borderRadius: 10,
            font: "500 12px/1.45 var(--font-sans)",
            color: "var(--color-text)",
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <span style={{
              fontSize: 14, lineHeight: 1, marginTop: 1,
            }}>⚠️</span>
            <span>
              <strong>Demo del prototipo:</strong> al continuar no se abrirá WhatsApp. Esto es solo una simulación para mostrar el flujo. En el producto real, este botón abre WhatsApp con el mensaje pre-cargado.
            </span>
          </div>
          <div style={{ font: "500 11.5px/1.4 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 12, marginBottom: 14 }}>
            En 48 horas te pediremos confirmar si lograron coordinar el trabajo. Eso construye su historial verificable.
          </div>
          <Button variant="whatsapp" size="lg" full icon={<IconWhatsapp size={20} />} onClick={handleWhatsapp}>
            Simular contacto
          </Button>
        </div>
      </Sheet>
    </PhoneShell>
  );
}

function JobRow({ job, confirmed, tone, onClick }) {
  return (
    <button onClick={onClick} style={{
      all: "unset", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start",
      padding: 10, borderRadius: 12, border: "1px solid var(--color-border)", background: "#fff",
    }}>
      <PhotoSlot label={job.photo} tone={tone} aspect="1/1" small style={{ width: 64, height: 64, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: "600 14px/1.25 var(--font-display)", color: "var(--color-text)" }}>{job.title}</div>
        <div style={{ font: "500 12px/1.35 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 3 }}>{job.desc}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 6, font: "500 11.5px/1 var(--font-sans)", color: "var(--color-text-muted)", alignItems: "center", flexWrap: "wrap" }}>
          <span>{relTime(job.date)}</span>
          {confirmed ? (
            <span style={{ color: "var(--color-primary-dark)", display: "inline-flex", alignItems: "center", gap: 3 }}>
              <IconCheckCircle size={12} /> Confirmado
            </span>
          ) : (
            <span style={{ color: "var(--color-text-muted)", display: "inline-flex", alignItems: "center", gap: 3 }}>
              <IconClock size={12} /> Autoreportado
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Post-contact follow-up modal ───────────────────────────────────────────
function PostContactBanner({ ctx, followup }) {
  const { WORKERS } = window.UBIKLOS_DATA;
  const worker = (ctx.workers || WORKERS).find((w) => w.id === followup.workerId);
  if (!worker) return null;
  return (
    <button
      onClick={() => ctx.go("client.followup", { id: followup.id })}
      style={{
        all: "unset", cursor: "pointer",
        margin: "0 18px 12px",
        background: "var(--color-primary-soft)",
        border: "1px solid rgba(123,122,196,0.3)",
        borderRadius: 14, padding: 14,
        display: "flex", alignItems: "center", gap: 12,
      }}
    >
      <Avatar name={worker.name} initials={worker.initials} tone={worker.photoTone} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: "600 14px/1.25 var(--font-display)", color: "var(--color-primary-dark)" }}>
          ¿Pudiste coordinar con {worker.name.split(" ")[0]}?
        </div>
        <div style={{ font: "500 12px/1.35 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 2 }}>
          Lo contactaste {relTime(followup.contactedAt)}. Tu respuesta construye su historial.
        </div>
      </div>
      <IconChevronRight size={18} style={{ color: "var(--color-primary)" }} />
    </button>
  );
}

function ScreenFollowup({ ctx, params }) {
  const followup = ctx.followups.find((f) => f.id === params.id);
  const { WORKERS } = window.UBIKLOS_DATA;
  const worker = (ctx.workers || WORKERS).find((w) => w.id === followup?.workerId);
  const [outcome, setOutcome] = useStateC(null);

  if (!worker) return <PhoneShell><div style={{ padding: 24 }}>No encontrado</div></PhoneShell>;

  const handle = (val) => {
    setOutcome(val);
    if (val === "hired") {
      setTimeout(() => ctx.go("client.rating", { workerId: worker.id, followupId: followup.id }), 200);
    } else {
      ctx.dismissFollowup(followup.id);
      setTimeout(() => ctx.go("client.home"), 800);
    }
  };

  return (
    <PhoneShell>
      <TopBar left={<BackButton onClick={() => ctx.go("client.home")} />} title="Seguimiento" />
      <div style={{ padding: "20px 20px 0", textAlign: "center" }}>
        <Avatar name={worker.name} initials={worker.initials} tone={worker.photoTone} size={72} />
        <h2 style={{ font: "700 22px/1.2 var(--font-display)", color: "var(--color-text)", margin: "16px 0 6px", letterSpacing: -0.4, textWrap: "balance" }}>
          ¿Pudiste coordinar el trabajo con {worker.name.split(" ")[0]}?
        </h2>
        <p style={{ font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", margin: 0 }}>
          Lo contactaste {relTime(followup.contactedAt)}. Tu respuesta construye su historial verificable.
        </p>
      </div>

      <div style={{ padding: "26px 20px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
        <FollowupOption icon={<IconCheckCircle size={20} />} label="Sí, lo contraté" sub="Suma a su historial confirmado" tone="primary" onClick={() => handle("hired")} active={outcome === "hired"} />
        <FollowupOption icon={<IconChat size={20} />} label="Hablamos pero no contraté" sub="No suma, no penaliza" onClick={() => handle("talked")} active={outcome === "talked"} />
        <FollowupOption icon={<IconClock size={20} />} label="No respondió todavía" sub="Te recordamos en unos días" onClick={() => handle("noreply")} active={outcome === "noreply"} />
        <FollowupOption icon={<IconClose size={20} />} label="Prefiero no responder" sub="" onClick={() => handle("skip")} active={outcome === "skip"} />
      </div>
    </PhoneShell>
  );
}

function FollowupOption({ icon, label, sub, onClick, active, tone }) {
  return (
    <button
      onClick={onClick}
      style={{
        all: "unset", cursor: "pointer",
        display: "flex", gap: 12, alignItems: "center",
        padding: 14, borderRadius: 12,
        background: active ? "var(--color-primary-soft)" : "#fff",
        border: `1px solid ${active ? "rgba(123,122,196,0.4)" : "var(--color-border)"}`,
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: tone === "primary" ? "var(--color-primary)" : "var(--color-bg-soft)",
        color: tone === "primary" ? "#fff" : "var(--color-text)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ font: "600 14.5px/1.2 var(--font-display)", color: "var(--color-text)" }}>{label}</div>
        {sub && <div style={{ font: "500 12px/1.3 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 2 }}>{sub}</div>}
      </div>
      <IconChevronRight size={18} style={{ color: "var(--color-text-muted)" }} />
    </button>
  );
}

// ── Rating screen ──────────────────────────────────────────────────────────
function ScreenRating({ ctx, params }) {
  const { WORKERS } = window.UBIKLOS_DATA;
  const worker = (ctx.workers || WORKERS).find((w) => w.id === params.workerId);
  const [stars, setStars] = useStateC(0);
  const [text, setText] = useStateC("");
  const [submitted, setSubmitted] = useStateC(false);

  if (!worker) return null;

  const submit = () => {
    ctx.submitRating(worker.id, params.followupId, { stars, text });
    setSubmitted(true);
    setTimeout(() => ctx.go("client.home"), 1600);
  };

  if (submitted) {
    return (
      <PhoneShell>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--color-primary-soft)", color: "var(--color-primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <IconCheck size={36} />
          </div>
          <h2 style={{ font: "700 22px/1.2 var(--font-display)", color: "var(--color-text)", margin: "0 0 6px", letterSpacing: -0.4 }}>Gracias</h2>
          <p style={{ font: "500 14px/1.45 var(--font-sans)", color: "var(--color-text-muted)", margin: 0, textWrap: "balance" }}>
            Tu calificación suma al historial de {worker.name.split(" ")[0]} y ayuda a otros clientes a decidir.
          </p>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <TopBar left={<BackButton onClick={() => ctx.back()} />} title="Calificar trabajo" />
      <div style={{ padding: "10px 20px 0", textAlign: "center" }}>
        <Avatar name={worker.name} initials={worker.initials} tone={worker.photoTone} size={64} />
        <h2 style={{ font: "700 20px/1.2 var(--font-display)", color: "var(--color-text)", margin: "14px 0 4px", letterSpacing: -0.3 }}>
          ¿Cómo te fue con {worker.name.split(" ")[0]}?
        </h2>
        <p style={{ font: "500 13px/1.4 var(--font-sans)", color: "var(--color-text-muted)", margin: 0 }}>
          Tu opinión ayuda a otros clientes.
        </p>
      </div>

      <div style={{ padding: "26px 20px 0", display: "flex", justifyContent: "center", gap: 10 }}>
        {[1,2,3,4,5].map((n) => (
          <button key={n} onClick={() => setStars(n)} style={{ background: "transparent", border: 0, padding: 6, cursor: "pointer", color: stars >= n ? "var(--color-amber)" : "rgba(14,21,48,0.18)" }}>
            <IconStar size={36} />
          </button>
        ))}
      </div>
      <div style={{ textAlign: "center", font: "500 13px/1.4 var(--font-sans)", color: "var(--color-text-muted)", padding: "10px 20px 0" }}>
        {stars === 0 ? "Toca una estrella" : ["", "Muy malo", "Malo", "Bien", "Muy bien", "Excelente"][stars]}
      </div>

      <div style={{ padding: "26px 20px 0" }}>
        <SectionLabel>Comentario (opcional)</SectionLabel>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Llegó puntual, trabajo limpio…"
          rows={4}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "var(--color-bg-soft)",
            border: "1px solid var(--color-border)",
            borderRadius: 12, padding: 12,
            font: "500 14px/1.4 var(--font-sans)", color: "var(--color-text)",
            resize: "none",
          }}
        />
      </div>

      <div style={{ padding: "16px 20px 24px" }}>
        <Button variant="primary" size="lg" full disabled={stars === 0} onClick={submit}>
          Enviar calificación
        </Button>
      </div>
    </PhoneShell>
  );
}

Object.assign(window, {
  ScreenHome, ScreenSearch, ScreenProfile, ScreenFollowup, ScreenRating,
  PostContactBanner, BackButton, iconBtn, linkBtn, Toggle,
});
