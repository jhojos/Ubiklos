// Admin flow: cédula verification queue, reports, metrics.

const { useState: useStateA, useMemo: useMemoA } = React;

function ScreenAdminQueue({ ctx }) {
  const pending = ctx.pendingVerifications;
  const [filter, setFilter] = useStateA("all");

  const filtered = useMemoA(() => {
    if (filter === "flagged") return pending.filter((p) => p.flags.length > 0);
    if (filter === "clean") return pending.filter((p) => p.flags.length === 0);
    return pending;
  }, [pending, filter]);

  return (
    <PhoneShell>
      <div style={{ padding: "10px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => ctx.go("client.home")} style={iconBtn}><IconHome size={20} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ font: "700 12px/1 var(--font-display)", color: "var(--color-text)", padding: "4px 8px", background: "var(--color-text)", color: "#fff", borderRadius: 6, letterSpacing: 0.5 }}>ADMIN</span>
        </div>
        <button onClick={() => ctx.go("admin.metrics")} style={iconBtn}><IconDashboard size={20} /></button>
      </div>

      <div style={{ padding: "16px 18px 0" }}>
        <h1 style={{ font: "700 22px/1.15 var(--font-display)", color: "var(--color-text)", margin: 0, letterSpacing: -0.3 }}>
          Cola de verificación
        </h1>
        <p style={{ font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", margin: "6px 0 0" }}>
          {pending.length} {pending.length === 1 ? "perfil pendiente" : "perfiles pendientes"} de aprobar
        </p>
      </div>

      <div style={{ padding: "16px 18px 0", display: "flex", gap: 6 }}>
        <Chip size="sm" active={filter === "all"} onClick={() => setFilter("all")}>Todos ({pending.length})</Chip>
        <Chip size="sm" active={filter === "flagged"} onClick={() => setFilter("flagged")}>
          Con alertas ({pending.filter((p) => p.flags.length > 0).length})
        </Chip>
        <Chip size="sm" active={filter === "clean"} onClick={() => setFilter("clean")}>
          Limpios ({pending.filter((p) => p.flags.length === 0).length})
        </Chip>
      </div>

      <div style={{ padding: "16px 18px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <Card style={{ padding: 24, textAlign: "center" }}>
            <div style={{ font: "600 14px/1.3 var(--font-display)", color: "var(--color-text)" }}>Sin pendientes en esta vista</div>
            <div style={{ font: "500 12.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 4 }}>
              Buen trabajo. Vuelve más tarde.
            </div>
          </Card>
        )}
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => ctx.go("admin.review", { id: p.id })}
            style={{ all: "unset", cursor: "pointer", display: "block" }}
          >
            <Card style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar name={p.name} initials={p.initials} tone={p.photoTone} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <div style={{ font: "600 15px/1.2 var(--font-display)", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--color-text-muted)" }}>{relTime(p.submitted)}</div>
                </div>
                <div style={{ font: "500 12.5px/1.3 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 3 }}>
                  {p.cedula} · {p.oficios[0]}
                </div>
                <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {p.flags.length === 0 ? (
                    <Badge icon={<IconCheck size={12} />} label="Sin alertas" variant="success" />
                  ) : (
                    p.flags.map((f) => <Badge key={f} icon={<IconWarning size={12} />} label={f} variant="warning" />)
                  )}
                </div>
              </div>
              <IconChevronRight size={18} style={{ color: "var(--color-text-muted)" }} />
            </Card>
          </button>
        ))}
      </div>
    </PhoneShell>
  );
}

function ScreenAdminReview({ ctx, params }) {
  const pending = ctx.pendingVerifications.find((p) => p.id === params.id);
  const [tab, setTab] = useStateA("docs");
  const [decision, setDecision] = useStateA(null);
  const [rejectReason, setRejectReason] = useStateA("");

  if (!pending) {
    return (
      <PhoneShell>
        <div style={{ padding: 24 }}>No encontrado.</div>
        <Button onClick={() => ctx.go("admin.queue")}>Volver</Button>
      </PhoneShell>
    );
  }

  const approve = () => {
    ctx.approveVerification(pending.id);
    setDecision("approved");
    setTimeout(() => ctx.go("admin.queue"), 1000);
  };

  const reject = () => {
    if (!rejectReason) return;
    ctx.rejectVerification(pending.id, rejectReason);
    setDecision("rejected");
    setTimeout(() => ctx.go("admin.queue"), 1000);
  };

  if (decision) {
    return (
      <PhoneShell>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: decision === "approved" ? "var(--color-primary-soft)" : "rgba(220,138,30,0.15)", color: decision === "approved" ? "var(--color-primary-dark)" : "#9a5800", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            {decision === "approved" ? <IconCheck size={36} /> : <IconClose size={36} />}
          </div>
          <h2 style={{ font: "700 20px/1.2 var(--font-display)", color: "var(--color-text)", margin: "0 0 6px" }}>
            {decision === "approved" ? "Perfil aprobado" : "Perfil rechazado"}
          </h2>
          <p style={{ font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", margin: 0 }}>
            {decision === "approved" ? "Le mandamos un WhatsApp avisándole." : "Le mandamos un WhatsApp con el motivo."}
          </p>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <TopBar
        left={<BackButton onClick={() => ctx.go("admin.queue")} />}
        title={
          <div>
            <div style={{ font: "600 14px/1.1 var(--font-display)" }}>{pending.name}</div>
            <div style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 2 }}>{pending.cedula}</div>
          </div>
        }
      />

      {/* Tab strip */}
      <div style={{ display: "flex", padding: "0 18px 12px", gap: 4, borderBottom: "1px solid var(--color-border)" }}>
        {[
          { id: "docs", label: "Documentos" },
          { id: "profile", label: "Perfil" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "transparent", border: 0,
              padding: "10px 14px",
              font: `${tab === t.id ? 700 : 500} 13px/1 var(--font-sans)`,
              color: tab === t.id ? "var(--color-text)" : "var(--color-text-muted)",
              borderBottom: `2px solid ${tab === t.id ? "var(--color-primary)" : "transparent"}`,
              marginBottom: -1,
              cursor: "pointer",
            }}
          >{t.label}</button>
        ))}
      </div>

      {tab === "docs" && (
        <div style={{ padding: "16px 18px 0", display: "flex", flexDirection: "column", gap: 14 }}>
          {pending.flags.length > 0 && (
            <Notice tone="warning" icon={<IconWarning size={18} />}>
              <b>Atención:</b> {pending.flags.join(", ")}.
            </Notice>
          )}
          <DocCard label="Cédula — frente" status={pending.photoFront} tone={pending.photoTone} />
          <DocCard label="Cédula — reverso" status={pending.photoBack} tone={pending.photoTone} />
          <DocCard label="Selfie con cédula" status={pending.selfie} tone={pending.photoTone} />
        </div>
      )}

      {tab === "profile" && (
        <div style={{ padding: "16px 18px 0", display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: 14 }}>
            <Row k="Nombre" v={pending.name} />
            <Row k="Cédula" v={pending.cedula} />
            <Row k="Teléfono" v={`${pending.phone} (ficticio · demo)`} />
            <Row k="Oficios" v={pending.oficios.join(", ")} />
            <Row k="Municipios" v={pending.municipios.join(", ")} last />
          </Card>
          <Card style={{ padding: 14 }}>
            <div style={{ font: "600 11.5px/1 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>Bio</div>
            <p style={{ font: "500 13.5px/1.5 var(--font-sans)", color: "var(--color-text)", margin: 0 }}>{pending.bio}</p>
          </Card>
        </div>
      )}

      {/* Decision panel */}
      <div style={{ padding: "20px 18px 24px", marginTop: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Button variant="primary" size="lg" full icon={<IconCheck size={20} />} onClick={approve}>
            Aprobar
          </Button>
          <details>
            <summary style={{ cursor: "pointer", font: "500 13px/1 var(--font-sans)", color: "var(--color-text-muted)", textAlign: "center", padding: "8px 0" }}>
              Rechazar con motivo
            </summary>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Foto borrosa", "Datos no coinciden", "Selfie no clara",
                "Cédula vencida", "Foto con reflejos",
              ].map((r) => (
                <button key={r} onClick={() => setRejectReason(r)} style={{
                  all: "unset", cursor: "pointer",
                  padding: "10px 12px", borderRadius: 10,
                  background: rejectReason === r ? "rgba(220,138,30,0.10)" : "var(--color-bg-soft)",
                  border: `1px solid ${rejectReason === r ? "rgba(220,138,30,0.3)" : "var(--color-border)"}`,
                  font: "500 13px/1.3 var(--font-sans)",
                  color: rejectReason === r ? "#9a5800" : "var(--color-text)",
                }}>{r}</button>
              ))}
              <Button variant="dark" size="md" full disabled={!rejectReason} onClick={reject}>
                Rechazar y notificar
              </Button>
            </div>
          </details>
        </div>
      </div>
    </PhoneShell>
  );
}

function DocCard({ label, status, tone }) {
  const labels = {
    ok: { tag: "OK", variant: "success", icon: <IconCheck size={12} /> },
    blurry: { tag: "Borrosa", variant: "warning", icon: <IconWarning size={12} /> },
    reflective: { tag: "Reflejos", variant: "warning", icon: <IconWarning size={12} /> },
  };
  const s = labels[status] || labels.ok;
  return (
    <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: 14, overflow: "hidden" }}>
      <PhotoSlot label={`scan: ${label}`} tone={tone} aspect="3/2" />
      <div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ font: "600 13.5px/1.2 var(--font-display)", color: "var(--color-text)" }}>{label}</div>
        <Badge icon={s.icon} label={s.tag} variant={s.variant} />
      </div>
    </div>
  );
}

function Row({ k, v, last }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", gap: 12,
      padding: "10px 0",
      borderBottom: last ? 0 : "1px solid var(--color-border)",
    }}>
      <span style={{ font: "500 12.5px/1.3 var(--font-sans)", color: "var(--color-text-muted)" }}>{k}</span>
      <span style={{ font: "600 13px/1.3 var(--font-display)", color: "var(--color-text)", textAlign: "right" }}>{v}</span>
    </div>
  );
}

function ScreenAdminMetrics({ ctx }) {
  const { WORKERS } = window.UBIKLOS_DATA;
  const workers = ctx.workers || WORKERS;
  const total = workers.length;
  const verifiedCount = workers.filter((w) => w.verified).length;
  const activeWeek = workers.filter((w) => w.activeDays <= 7).length;
  const allConfirmed = workers.reduce((sum, w) => sum + w.confirmedJobs, 0);
  const pendingCount = ctx.pendingVerifications.length;

  return (
    <PhoneShell>
      <TopBar
        left={<BackButton onClick={() => ctx.go("admin.queue")} />}
        title="Métricas"
      />
      <div style={{ padding: "0 18px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", margin: "0 0 0" }}>
          Estado de la plataforma. Datos del demo.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard label="Trabajadores activos" value={total} sub={`${verifiedCount} verificados`} />
          <StatCard label="Activos esta semana" value={activeWeek} sub={`de ${total}`} />
          <StatCard label="Trabajos confirmados" value={allConfirmed} sub="histórico" />
          <StatCard label="Pendientes de revisar" value={pendingCount} sub="cola actual" />
        </div>

        <Card style={{ padding: 14 }}>
          <div style={{ font: "600 13px/1.2 var(--font-display)", color: "var(--color-text)", marginBottom: 12 }}>Por oficio</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {window.UBIKLOS_DATA.OFICIOS.map((o) => {
              const count = workers.filter((w) => w.oficios.includes(o.id)).length;
              const pct = (count / total) * 100;
              return (
                <div key={o.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", font: "500 12.5px/1.3 var(--font-sans)", marginBottom: 4 }}>
                    <span style={{ color: "var(--color-text)" }}>{o.label}</span>
                    <span style={{ color: "var(--color-text-muted)" }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(14,21,48,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "var(--color-primary)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card style={{ padding: 14 }}>
          <div style={{ font: "600 13px/1.2 var(--font-display)", color: "var(--color-text)", marginBottom: 12 }}>Por municipio</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {window.UBIKLOS_DATA.MUNICIPIOS.map((m) => {
              const count = workers.filter((w) => w.municipios.includes(m.id)).length;
              const pct = (count / total) * 100;
              return (
                <div key={m.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", font: "500 12.5px/1.3 var(--font-sans)", marginBottom: 4 }}>
                    <span style={{ color: "var(--color-text)" }}>{m.label}</span>
                    <span style={{ color: "var(--color-text-muted)" }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(14,21,48,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "var(--color-secondary)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </PhoneShell>
  );
}

Object.assign(window, {
  ScreenAdminQueue, ScreenAdminReview, ScreenAdminMetrics,
});
