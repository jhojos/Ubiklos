// Worker flow screens: landing, registration (4 steps), in-review,
// dashboard, edit profile, add job, confirmations queue.

const { useState: useStateW, useEffect: useEffectW, useMemo: useMemoW } = React;

// ── Worker landing ─────────────────────────────────────────────────────────
function ScreenWorkerLanding({ ctx }) {
  return (
    <PhoneShell>
      <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => ctx.go("client.home")} style={iconBtn}><IconChevronLeft size={22} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconLogo size={22} />
          <span style={{ font: "700 14px/1 var(--font-display)" }}>ubiklos</span>
        </div>
        <div style={{ width: 38 }} />
      </div>

      <div style={{ padding: "20px 22px 0" }}>
        <h1 style={{ font: "700 28px/1.15 var(--font-display)", color: "var(--color-text)", margin: 0, letterSpacing: -0.5, textWrap: "balance" }}>
          Consigue clientes en tu zona con un perfil verificado.
        </h1>
        <p style={{ font: "500 14.5px/1.5 var(--font-sans)", color: "var(--color-text-muted)", margin: "12px 0 0" }}>
          Ubiklos no cobra comisión. Solo te conecta con clientes que ya están buscando tu oficio. El contacto pasa directo a tu WhatsApp.
        </p>
      </div>

      <div style={{ padding: "28px 22px 0", display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { t: "Sin comisiones ni pagos", d: "El cliente te paga directo, como siempre. Ubiklos no toca el dinero.", icon: <IconShieldCheck size={20} /> },
          { t: "Cada trabajo cuenta", d: "Cuando un cliente confirma que te contrató, tu historial crece. Es tu mejor publicidad.", icon: <IconCheckCircle size={20} /> },
          { t: "Tu propio link", d: "Te damos una página web tuya: ubiklos.com/tu-nombre. La compartes por WhatsApp.", icon: <IconUser size={20} /> },
        ].map((b) => (
          <div key={b.t} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--color-primary-soft)", color: "var(--color-primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{b.icon}</div>
            <div>
              <div style={{ font: "600 15px/1.25 var(--font-display)", color: "var(--color-text)" }}>{b.t}</div>
              <div style={{ font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 3 }}>{b.d}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ padding: "28px 22px 24px" }}>
        <Button variant="primary" size="lg" full onClick={() => ctx.go("worker.register", { step: 1 })}>
          Crear mi perfil
        </Button>
        <div style={{ font: "500 12px/1.4 var(--font-sans)", color: "var(--color-text-muted)", textAlign: "center", marginTop: 12 }}>
          Toma menos de 8 minutos. Necesitas tu cédula a mano.
        </div>
      </div>
    </PhoneShell>
  );
}

// ── Registration (multi-step) ──────────────────────────────────────────────
function ScreenRegister({ ctx, params }) {
  const step = params.step || 1;
  return (
    <PhoneShell>
      <TopBar
        left={step > 1 ? <BackButton onClick={() => ctx.go("worker.register", { step: step - 1 })} /> : <BackButton onClick={() => ctx.go("worker.landing")} />}
        title={
          <div>
            <div style={{ font: "600 14px/1.1 var(--font-display)" }}>Crear perfil</div>
            <div style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 2 }}>Paso {step} de 4</div>
          </div>
        }
        right={null}
      />
      <ProgressBar step={step} total={4} />
      {step === 1 && <RegStep1 ctx={ctx} />}
      {step === 2 && <RegStep2 ctx={ctx} />}
      {step === 3 && <RegStep3 ctx={ctx} />}
      {step === 4 && <RegStep4 ctx={ctx} />}
    </PhoneShell>
  );
}

function ProgressBar({ step, total }) {
  return (
    <div style={{ padding: "6px 18px 14px" }}>
      <div style={{ display: "flex", gap: 5 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i < step ? "var(--color-primary)" : "rgba(14,21,48,0.08)",
            transition: "background .2s",
          }} />
        ))}
      </div>
    </div>
  );
}

function RegStep1({ ctx }) {
  const [phone, setPhone] = useStateW(ctx.regData.phone || "");
  const [stage, setStage] = useStateW(phone ? "otp" : "phone");
  const [otp, setOtp] = useStateW("");
  const valid = /^\+?58?\s*\d{3}\s*\d{3}\s*\d{4}$/.test(phone.replace(/\s/g, "")) || phone.replace(/\D/g, "").length >= 10;

  const sendOtp = () => {
    ctx.updateReg({ phone });
    setStage("otp");
  };

  const verify = () => {
    if (otp.length === 6) {
      ctx.updateReg({ phone, phoneVerified: true });
      ctx.go("worker.register", { step: 2 });
    }
  };

  return (
    <div style={{ padding: "0 22px 24px" }}>
      <h2 style={{ font: "700 22px/1.2 var(--font-display)", color: "var(--color-text)", margin: "8px 0 6px", letterSpacing: -0.3 }}>
        Tu número de WhatsApp
      </h2>
      <p style={{ font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", margin: "0 0 20px" }}>
        Es el número donde los clientes te contactan. Te enviamos un código por WhatsApp para confirmar.
      </p>

      {stage === "phone" && (
        <>
          <Field label="Número de WhatsApp">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+58 412 123 4567"
              style={inputStyle}
              autoFocus
            />
          </Field>
          <div style={{ marginTop: 24 }}>
            <Button variant="primary" size="lg" full disabled={!valid} onClick={sendOtp}>
              Enviar código por WhatsApp
            </Button>
          </div>
          <div style={{ font: "500 11.5px/1.5 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 14, textAlign: "center" }}>
            No te pedimos email. Solo necesitamos tu teléfono.
          </div>
        </>
      )}

      {stage === "otp" && (
        <>
          <Notice tone="primary" icon={<IconWhatsapp size={18} />}>
            Te enviamos un código de 6 dígitos a {phone}. <span style={{ opacity: 0.7 }}>(Demo: usa 123456)</span>
          </Notice>
          <div style={{ marginTop: 18 }}>
            <Field label="Código">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="······"
                style={{ ...inputStyle, font: "600 22px/1 var(--font-display)", letterSpacing: 8, textAlign: "center" }}
                autoFocus
              />
            </Field>
          </div>
          <div style={{ marginTop: 24 }}>
            <Button variant="primary" size="lg" full disabled={otp.length < 6} onClick={verify}>
              Verificar y continuar
            </Button>
          </div>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button style={{ ...linkBtn, color: "var(--color-text-muted)" }} onClick={() => setStage("phone")}>
              Cambiar número
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function RegStep2({ ctx }) {
  const [name, setName] = useStateW(ctx.regData.name || "");
  const [cedula, setCedula] = useStateW(ctx.regData.cedula || "");
  const [front, setFront] = useStateW(ctx.regData.front || false);
  const [back, setBack] = useStateW(ctx.regData.back || false);
  const [selfie, setSelfie] = useStateW(ctx.regData.selfie || false);

  const canContinue = name.trim().length > 3 && /^V?-?\d{6,}$/.test(cedula.replace(/[.\-]/g, "")) && front && back && selfie;

  const next = () => {
    ctx.updateReg({ name, cedula, front, back, selfie });
    ctx.go("worker.register", { step: 3 });
  };

  return (
    <div style={{ padding: "0 22px 24px" }}>
      <h2 style={{ font: "700 22px/1.2 var(--font-display)", color: "var(--color-text)", margin: "8px 0 6px", letterSpacing: -0.3 }}>
        Tus datos y cédula
      </h2>
      <p style={{ font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", margin: "0 0 20px" }}>
        Verificamos tu cédula con tu selfie. Solo el equipo de Ubiklos la revisa. No se publica.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Nombre completo">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Andrés Mendoza" style={inputStyle} />
        </Field>
        <Field label="Cédula de identidad">
          <input value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="V-12.345.678" style={inputStyle} />
        </Field>

        <div style={{ font: "600 11px/1 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.3, marginTop: 8 }}>Fotos de cédula</div>

        <UploadSlot
          label="Cédula — frente"
          hint="Sin reflejos, todos los datos visibles"
          done={front}
          onClick={() => setFront(!front)}
        />
        <UploadSlot
          label="Cédula — reverso"
          hint="Sin reflejos, plano"
          done={back}
          onClick={() => setBack(!back)}
        />
        <UploadSlot
          label="Selfie con cédula"
          hint="Tu cara y la cédula en la misma foto"
          done={selfie}
          onClick={() => setSelfie(!selfie)}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <Button variant="primary" size="lg" full disabled={!canContinue} onClick={next}>
          Continuar
        </Button>
      </div>
    </div>
  );
}

function UploadSlot({ label, hint, done, onClick }) {
  return (
    <button onClick={onClick} style={{
      all: "unset", cursor: "pointer",
      display: "flex", gap: 12, alignItems: "center", padding: 12,
      borderRadius: 12,
      background: done ? "var(--color-primary-soft)" : "var(--color-bg-soft)",
      border: `1px dashed ${done ? "rgba(123,122,196,0.5)" : "var(--color-border)"}`,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: done ? "var(--color-primary)" : "#fff",
        color: done ? "#fff" : "var(--color-text-muted)",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: done ? 0 : "1px solid var(--color-border)",
      }}>
        {done ? <IconCheck size={22} /> : <IconCamera size={22} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ font: "600 14px/1.2 var(--font-display)", color: "var(--color-text)" }}>{label}</div>
        <div style={{ font: "500 12px/1.35 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 2 }}>
          {done ? "Foto cargada · toca para reemplazar" : hint}
        </div>
      </div>
    </button>
  );
}

function RegStep3({ ctx }) {
  const { OFICIOS, MUNICIPIOS } = window.UBIKLOS_DATA;
  const [oficios, setOficios] = useStateW(ctx.regData.oficios || []);
  const [main, setMain] = useStateW(ctx.regData.mainOficio || "");
  const [municipios, setMunicipios] = useStateW(ctx.regData.municipios || []);

  const toggle = (arr, set, id) => {
    const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
    set(next);
    return next;
  };

  const valid = oficios.length > 0 && main && municipios.length > 0;

  const next = () => {
    ctx.updateReg({ oficios, mainOficio: main, municipios });
    ctx.go("worker.register", { step: 4 });
  };

  return (
    <div style={{ padding: "0 22px 24px" }}>
      <h2 style={{ font: "700 22px/1.2 var(--font-display)", color: "var(--color-text)", margin: "8px 0 6px", letterSpacing: -0.3 }}>
        Tu oficio y zona
      </h2>
      <p style={{ font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", margin: "0 0 20px" }}>
        Elige los oficios que dominas y los municipios donde trabajas.
      </p>

      <div style={{ font: "600 11px/1 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>Oficios</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
        {OFICIOS.map((o) => (
          <Chip key={o.id} active={oficios.includes(o.id)} onClick={() => {
            const next = toggle(oficios, setOficios, o.id);
            if (next.length === 1) setMain(next[0]);
            if (!next.includes(main)) setMain(next[0] || "");
          }}>
            {o.label}
          </Chip>
        ))}
      </div>

      {oficios.length > 1 && (
        <>
          <div style={{ font: "600 11px/1 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>Oficio principal</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
            {oficios.map((o) => {
              const ofc = OFICIOS.find((x) => x.id === o);
              return <Chip key={o} active={main === o} onClick={() => setMain(o)}>{ofc?.label}</Chip>;
            })}
          </div>
        </>
      )}

      <div style={{ font: "600 11px/1 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>Municipios donde trabajas</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {MUNICIPIOS.map((m) => (
          <Chip key={m.id} active={municipios.includes(m.id)} onClick={() => toggle(municipios, setMunicipios, m.id)}>{m.label}</Chip>
        ))}
      </div>

      <div style={{ marginTop: 28 }}>
        <Button variant="primary" size="lg" full disabled={!valid} onClick={next}>
          Continuar
        </Button>
      </div>
    </div>
  );
}

function RegStep4({ ctx }) {
  const [bio, setBio] = useStateW(ctx.regData.bio || "");
  const [photos, setPhotos] = useStateW(ctx.regData.photos || []);
  const togglePhoto = (i) => {
    setPhotos((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  };
  const finish = () => {
    ctx.updateReg({ bio, photos });
    ctx.submitRegistration();
    ctx.go("worker.review");
  };

  return (
    <div style={{ padding: "0 22px 24px" }}>
      <h2 style={{ font: "700 22px/1.2 var(--font-display)", color: "var(--color-text)", margin: "8px 0 6px", letterSpacing: -0.3 }}>
        Cuéntale al cliente quién eres
      </h2>
      <p style={{ font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", margin: "0 0 20px" }}>
        Una bio corta y unas fotos de trabajos previos. Esto es lo primero que ven los clientes.
      </p>

      <Field label="Bio (1–2 párrafos)">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Plomero con 14 años de oficio. Trabajo fugas, instalaciones de baño y calentadores. Llego puntual y cobro lo justo."
          style={{ ...inputStyle, resize: "none", minHeight: 92 }}
        />
      </Field>

      <div style={{ marginTop: 18 }}>
        <div style={{ font: "600 11px/1 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>Fotos de trabajos previos</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[0,1,2,3,4,5].map((i) => {
            const active = photos.includes(i);
            return (
              <button key={i} onClick={() => togglePhoto(i)} style={{
                all: "unset", cursor: "pointer",
                aspectRatio: "1/1", borderRadius: 10,
                background: active ? "var(--color-primary-soft)" : "var(--color-bg-soft)",
                border: `1px dashed ${active ? "rgba(123,122,196,0.5)" : "var(--color-border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: active ? "var(--color-primary-dark)" : "var(--color-text-muted)",
                position: "relative",
              }}>
                {active ? <IconCheck size={26} /> : <IconCamera size={22} />}
              </button>
            );
          })}
        </div>
        <div style={{ font: "500 11.5px/1.4 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 8 }}>
          Sube al menos 3. Trabajos antes/después funcionan muy bien.
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <Button variant="primary" size="lg" full disabled={bio.length < 30 || photos.length < 3} onClick={finish}>
          Enviar para revisión
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ font: "600 11.5px/1 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "var(--color-bg-soft)",
  border: "1px solid var(--color-border)",
  borderRadius: 12, padding: "12px 14px",
  font: "500 15px/1.3 var(--font-sans)", color: "var(--color-text)",
  outline: "none",
};

// ── In-review screen ──────────────────────────────────────────────────────
function ScreenReview({ ctx }) {
  const status = ctx.workerStatus; // "pending" | "approved" | "rejected"

  if (status === "approved") {
    return (
      <PhoneShell>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--color-primary-soft)", color: "var(--color-primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
            <IconShieldCheck size={42} />
          </div>
          <h2 style={{ font: "700 24px/1.2 var(--font-display)", color: "var(--color-text)", margin: "0 0 8px", letterSpacing: -0.4 }}>¡Tu perfil está aprobado!</h2>
          <p style={{ font: "500 14px/1.5 var(--font-sans)", color: "var(--color-text-muted)", margin: 0, maxWidth: 280, textWrap: "balance" }}>
            Ya apareces en las búsquedas. Empieza por subir un par de trabajos para construir tu historial.
          </p>
          <div style={{ width: "100%", marginTop: 28 }}>
            <Button variant="primary" size="lg" full onClick={() => ctx.go("worker.dashboard")}>Ir a mi panel</Button>
          </div>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <TopBar left={<BackButton onClick={() => ctx.go("client.home")} />} title="En revisión" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(125,198,232,0.18)", color: "#1f5d7a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
          <IconClock size={42} />
        </div>
        <h2 style={{ font: "700 22px/1.2 var(--font-display)", color: "var(--color-text)", margin: "0 0 8px", letterSpacing: -0.4 }}>
          Estamos verificando tu identidad
        </h2>
        <p style={{ font: "500 14px/1.5 var(--font-sans)", color: "var(--color-text-muted)", margin: 0, maxWidth: 280, textWrap: "balance" }}>
          Te avisamos por WhatsApp cuando esté listo. Suele tomar menos de 24 horas.
        </p>

        <div style={{ width: "100%", marginTop: 28, padding: "16px 16px", background: "#fff", border: "1px solid var(--color-border)", borderRadius: 14, textAlign: "left" }}>
          <div style={{ font: "600 13px/1.3 var(--font-display)", color: "var(--color-text)", marginBottom: 6 }}>Mientras esperas</div>
          <div style={{ font: "500 13px/1.5 var(--font-sans)", color: "var(--color-text-muted)" }}>
            Puedes ver cómo se verá tu perfil aquí. Cuando estemos aprobados, los clientes podrán encontrarte.
          </div>
        </div>

        <div style={{ width: "100%", marginTop: 14, display: "flex", gap: 8 }}>
          <Button variant="secondary" full onClick={() => ctx.simulateApproval()}>
            Simular aprobación
          </Button>
        </div>
        <div style={{ font: "500 11.5px/1.4 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 10 }}>
          (Botón de demo. En producción, esperarías el WhatsApp.)
        </div>
      </div>
    </PhoneShell>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────
function ScreenDashboard({ ctx }) {
  const { WORKERS, PENDING_CONFIRMATIONS } = window.UBIKLOS_DATA;
  const workerId = ctx.currentWorkerId;
  const worker = (ctx.workers || WORKERS).find((w) => w.id === workerId);
  const stats = ctx.workerStats;
  const pending = ctx.confirmations.filter((c) => c.workerId === workerId && !c.workerConfirmed);

  if (!worker) return null;

  return (
    <PhoneShell>
      <div style={{ padding: "10px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => ctx.go("client.home")} style={iconBtn}><IconHome size={20} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconLogo size={20} />
          <span style={{ font: "700 13px/1 var(--font-display)" }}>ubiklos</span>
        </div>
        <button onClick={() => ctx.go("client.profile", { id: worker.id })} style={iconBtn}>
          <IconEye size={20} />
        </button>
      </div>

      {/* Greeting */}
      <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={worker.name} initials={worker.initials} tone={worker.photoTone} size={56} />
        <div>
          <div style={{ font: "700 19px/1.15 var(--font-display)", color: "var(--color-text)", letterSpacing: -0.3 }}>
            Hola, {worker.name.split(" ")[0]}
          </div>
          <div style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 2 }}>
            ubiklos.com/{worker.slug}
          </div>
        </div>
      </div>

      {/* Pending confirmations alert */}
      {pending.length > 0 && (
        <div style={{ padding: "16px 18px 0" }}>
          <button
            onClick={() => ctx.go("worker.confirmations")}
            style={{
              all: "unset", cursor: "pointer",
              display: "flex", gap: 12, alignItems: "center",
              padding: "12px 14px",
              background: "var(--color-primary-soft)",
              border: "1px solid rgba(123,122,196,0.3)",
              borderRadius: 12, width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconBolt size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ font: "600 14px/1.2 var(--font-display)", color: "var(--color-primary-dark)" }}>
                {pending.length} {pending.length === 1 ? "confirmación pendiente" : "confirmaciones pendientes"}
              </div>
              <div style={{ font: "500 12px/1.35 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 2 }}>
                Confirma para sumar a tu historial
              </div>
            </div>
            <IconChevronRight size={20} style={{ color: "var(--color-primary)" }} />
          </button>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ padding: "18px 18px 0" }}>
        <SectionLabel>Esta semana</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard label="Vistas al perfil" value={stats.viewsWeek} delta={stats.viewsDelta} />
          <StatCard label="Clics a WhatsApp" value={stats.contactsWeek} delta={stats.contactsDelta} tone="whatsapp" />
        </div>
      </div>
      <div style={{ padding: "10px 18px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard label="Trabajos confirmados" value={worker.confirmedJobs} sub="Total" />
          <StatCard label="Calificación" value={worker.rating ?? "—"} sub={worker.ratingsCount >= 3 ? `${worker.ratingsCount} reseñas` : "Necesitas 3+"} />
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: "20px 18px 0" }}>
        <SectionLabel>Acciones</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ActionRow icon={<IconPlus size={20} />} label="Agregar trabajo nuevo" sub="Suma a tu historial" onClick={() => ctx.go("worker.addJob")} primary />
          <ActionRow icon={<IconEdit size={20} />} label="Editar perfil" sub="Bio, oficios, zonas" onClick={() => ctx.go("worker.edit")} />
          <ActionRow icon={<IconEye size={20} />} label="Ver mi perfil público" sub={`Como lo verán los clientes`} onClick={() => ctx.go("client.profile", { id: worker.id })} />
        </div>
      </div>

      {/* Tip */}
      {worker.confirmedJobs < 5 && (
        <div style={{ padding: "20px 18px 28px" }}>
          <Notice tone="info" icon={<IconBolt size={18} />}>
            Sube más fotos para aumentar tu credibilidad. Los perfiles con 5+ trabajos confirmados reciben 3x más contactos.
          </Notice>
        </div>
      )}
      {worker.confirmedJobs >= 5 && <div style={{ height: 24 }} />}
    </PhoneShell>
  );
}

function StatCard({ label, value, delta, sub, tone }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid var(--color-border)",
      borderRadius: 14, padding: 14,
    }}>
      <div style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
        <span style={{
          font: "700 28px/1 var(--font-display)",
          color: tone === "whatsapp" ? "var(--color-whatsapp-dark)" : "var(--color-text)",
          letterSpacing: -0.5,
          fontVariantNumeric: "tabular-nums",
        }}>{value}</span>
        {delta !== undefined && delta !== 0 && (
          <span style={{
            font: "600 12px/1 var(--font-sans)",
            color: delta > 0 ? "#0e7a3b" : "#a83232",
          }}>
            {delta > 0 ? "+" : ""}{delta}
          </span>
        )}
      </div>
      {sub && <div style={{ font: "500 11.5px/1.3 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ActionRow({ icon, label, sub, onClick, primary }) {
  return (
    <button onClick={onClick} style={{
      all: "unset", cursor: "pointer",
      display: "flex", gap: 12, alignItems: "center", padding: 14,
      background: "#fff",
      border: "1px solid var(--color-border)",
      borderRadius: 12,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: primary ? "var(--color-primary)" : "var(--color-bg-soft)",
        color: primary ? "#fff" : "var(--color-text)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ font: "600 14.5px/1.2 var(--font-display)", color: "var(--color-text)" }}>{label}</div>
        <div style={{ font: "500 12px/1.3 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 2 }}>{sub}</div>
      </div>
      <IconChevronRight size={18} style={{ color: "var(--color-text-muted)" }} />
    </button>
  );
}

// ── Add job screen ────────────────────────────────────────────────────────
function ScreenAddJob({ ctx }) {
  const [title, setTitle] = useStateW("");
  const [desc, setDesc] = useStateW("");
  const [client, setClient] = useStateW("");
  const [photo, setPhoto] = useStateW(false);
  const [submitted, setSubmitted] = useStateW(false);

  const submit = () => {
    ctx.addJob({ title, desc, clientName: client, photo: photo ? "trabajo" : "trabajo" });
    setSubmitted(true);
    setTimeout(() => ctx.go("worker.dashboard"), 1400);
  };

  if (submitted) {
    return (
      <PhoneShell>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--color-primary-soft)", color: "var(--color-primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <IconCheck size={36} />
          </div>
          <h2 style={{ font: "700 22px/1.2 var(--font-display)", color: "var(--color-text)", margin: "0 0 6px", letterSpacing: -0.4 }}>Trabajo agregado</h2>
          <p style={{ font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", margin: 0, textWrap: "balance" }}>
            {client ? `Le mandamos un WhatsApp a ${client} para que confirme.` : "Quedó como autoreportado. Si nos das el contacto del cliente, podemos pedirle que confirme."}
          </p>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <TopBar left={<BackButton onClick={() => ctx.go("worker.dashboard")} />} title="Agregar trabajo" />
      <div style={{ padding: "0 20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Título del trabajo">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cambio de tubería en cocina" style={inputStyle} />
        </Field>
        <Field label="Descripción">
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Qué hiciste, dónde, cuánto tardó." style={{ ...inputStyle, resize: "none" }} />
        </Field>

        <Field label="Foto del trabajo">
          <UploadSlot label={photo ? "Foto cargada" : "Sube una foto"} hint="Antes/después funciona muy bien" done={photo} onClick={() => setPhoto(!photo)} />
        </Field>

        <Field label="Nombre del cliente (opcional)">
          <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Sra. Patricia" style={inputStyle} />
        </Field>

        <Notice tone="info" icon={<IconCheckCircle size={18} />}>
          Si nos das el WhatsApp del cliente, le pedimos que confirme y el trabajo cuenta como verificado. Si no, queda como autoreportado.
        </Notice>

        <Button variant="primary" size="lg" full disabled={title.length < 3 || desc.length < 10} onClick={submit}>
          Guardar trabajo
        </Button>
      </div>
    </PhoneShell>
  );
}

// ── Edit profile ──────────────────────────────────────────────────────────
function ScreenEdit({ ctx }) {
  const { WORKERS, OFICIOS, MUNICIPIOS } = window.UBIKLOS_DATA;
  const workerId = ctx.currentWorkerId;
  const worker = (ctx.workers || WORKERS).find((w) => w.id === workerId);
  const [bio, setBio] = useStateW(worker.bio);
  const [oficios, setOficios] = useStateW(worker.oficios);
  const [municipios, setMunicipios] = useStateW(worker.municipios);

  const toggle = (arr, set, id) => set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const save = () => {
    ctx.updateWorker(workerId, { bio, oficios, municipios });
    ctx.go("worker.dashboard");
  };

  return (
    <PhoneShell>
      <TopBar
        left={<BackButton onClick={() => ctx.go("worker.dashboard")} />}
        title="Editar perfil"
        right={<button onClick={save} style={{ ...linkBtn, color: "var(--color-primary)", padding: "8px 12px" }}>Guardar</button>}
      />
      <div style={{ padding: "0 20px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Bio">
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} style={{ ...inputStyle, resize: "none" }} />
        </Field>

        <div>
          <div style={{ font: "600 11.5px/1 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>Oficios</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {OFICIOS.map((o) => <Chip key={o.id} active={oficios.includes(o.id)} onClick={() => toggle(oficios, setOficios, o.id)}>{o.label}</Chip>)}
          </div>
        </div>

        <div>
          <div style={{ font: "600 11.5px/1 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>Municipios</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {MUNICIPIOS.map((m) => <Chip key={m.id} active={municipios.includes(m.id)} onClick={() => toggle(municipios, setMunicipios, m.id)}>{m.label}</Chip>)}
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

// ── Confirmations queue ────────────────────────────────────────────────────
function ScreenConfirmations({ ctx }) {
  const { WORKERS } = window.UBIKLOS_DATA;
  const workerId = ctx.currentWorkerId;
  const worker = (ctx.workers || WORKERS).find((w) => w.id === workerId);
  const pending = ctx.confirmations.filter((c) => c.workerId === workerId && !c.workerConfirmed);

  return (
    <PhoneShell>
      <TopBar left={<BackButton onClick={() => ctx.go("worker.dashboard")} />} title="Confirmaciones" />
      <div style={{ padding: "0 18px 8px" }}>
        <p style={{ font: "500 13.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", margin: "4px 0 16px" }}>
          Estos clientes dijeron que te contrataron. Confirma si lograste hacer el trabajo para que cuente en tu historial.
        </p>
      </div>

      <div style={{ padding: "0 18px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
        {pending.length === 0 ? (
          <Card style={{ padding: 18, textAlign: "center" }}>
            <div style={{ font: "600 14px/1.3 var(--font-display)", color: "var(--color-text)" }}>Sin pendientes</div>
            <div style={{ font: "500 12.5px/1.45 var(--font-sans)", color: "var(--color-text-muted)", marginTop: 4 }}>
              Cuando un cliente confirme un trabajo contigo, aparece aquí.
            </div>
          </Card>
        ) : pending.map((c) => (
          <Card key={c.id} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <div style={{ font: "600 14.5px/1.2 var(--font-display)", color: "var(--color-text)" }}>{c.clientName}</div>
              <div style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--color-text-muted)" }}>{relTime(c.contactedAt)}</div>
            </div>
            <div style={{ font: "500 13px/1.4 var(--font-sans)", color: "var(--color-text-muted)" }}>{c.jobHint}</div>
            <Notice tone="primary" icon={<IconCheckCircle size={16} />}>
              <span style={{ font: "500 12.5px/1.35 var(--font-sans)" }}>El cliente ya confirmó. Falta tu confirmación para sumar al historial.</span>
            </Notice>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Button variant="secondary" full size="sm" onClick={() => ctx.rejectConfirmation(c.id)}>No lo hice</Button>
              <Button variant="primary" full size="sm" onClick={() => ctx.acceptConfirmation(c.id)}>Sí, completé</Button>
            </div>
          </Card>
        ))}
      </div>
    </PhoneShell>
  );
}

Object.assign(window, {
  ScreenWorkerLanding, ScreenRegister, ScreenReview, ScreenDashboard,
  ScreenAddJob, ScreenEdit, ScreenConfirmations,
  Field, inputStyle,
});
