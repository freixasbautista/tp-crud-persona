import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  personasApi,
  getApiBaseUrl,
  setApiBaseUrl,
  validarPersona,
  DEFAULT_API_URL,
  ApiError,
  type Persona,
} from "@/lib/personas-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gestión de Personas — Cliente CRUD" },
      { name: "description", content: "Administrá personas (DNI y nombre) conectándote a tu API Flask." },
      { property: "og:title", content: "Gestión de Personas — Cliente CRUD" },
      { property: "og:description", content: "Administrá personas (DNI y nombre) conectándote a tu API Flask." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Aviso = { tipo: "ok" | "error"; texto: string } | null;
type Estado = "idle" | "probando" | "ok" | "error";

const errMsg = (e: unknown) =>
  e instanceof ApiError ? (e.status ? `(${e.status}) ${e.message}` : e.message) : String(e);

const btn = "inline-flex items-center justify-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50";
const btnPrimary = `${btn} bg-primary text-primary-foreground hover:bg-primary/90`;
const btnOutline = `${btn} border border-input bg-card text-foreground hover:bg-muted`;
const btnDanger = `${btn} bg-destructive text-destructive-foreground hover:bg-destructive/90`;
const btnEdit = `${btn} bg-accent text-accent-foreground hover:bg-accent/70`;
const input = "w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const card = "rounded-xl border bg-card p-5 shadow-sm";

function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

function Index() {
  const [url, setUrl] = useState(DEFAULT_API_URL);
  const [estado, setEstado] = useState<Estado>("idle");
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [cargando, setCargando] = useState(false);
  const [errorLista, setErrorLista] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso>(null);

  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState<Persona | null>(null);
  const [buscando, setBuscando] = useState(false);

  const [editando, setEditando] = useState<number | null>(null);
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState<number | null>(null);

  const notificar = (a: Aviso) => {
    setAviso(a);
    setTimeout(() => setAviso(null), 5000);
  };

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorLista(null);
    try {
      const data = await personasApi.listar();
      setPersonas(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrorLista(errMsg(e));
      setPersonas([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    setUrl(getApiBaseUrl());
    cargar();
  }, [cargar]);

  const guardarUrl = async () => {
    setApiBaseUrl(url.trim());
    await probar();
    cargar();
  };

  const probar = async () => {
    setApiBaseUrl(url.trim());
    setEstado("probando");
    try {
      await personasApi.probarConexion();
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  };

  const buscar = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d+$/.test(busqueda.trim()) || Number(busqueda) <= 0) {
      notificar({ tipo: "error", texto: "Ingresá un DNI entero positivo para buscar." });
      return;
    }
    setBuscando(true);
    setResultado(null);
    try {
      setResultado(await personasApi.buscarPorDni(Number(busqueda)));
    } catch (e) {
      notificar({ tipo: "error", texto: errMsg(e) });
    } finally {
      setBuscando(false);
    }
  };

  const limpiarForm = () => {
    setEditando(null);
    setDni("");
    setNombre("");
    setErrorForm(null);
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const err = validarPersona(dni, nombre);
    if (err) return setErrorForm(err);
    setErrorForm(null);
    setGuardando(true);
    const persona = { dni: Number(dni), nombre };
    try {
      if (editando !== null) {
        await personasApi.modificar(editando, persona);
        notificar({ tipo: "ok", texto: `Persona ${editando} modificada correctamente.` });
      } else {
        await personasApi.crear(persona);
        notificar({ tipo: "ok", texto: `Persona ${persona.nombre} registrada correctamente.` });
      }
      limpiarForm();
      setResultado(null);
      cargar();
    } catch (e) {
      setErrorForm(errMsg(e));
    } finally {
      setGuardando(false);
    }
  };

  const editar = (p: Persona) => {
    setEditando(p.dni);
    setDni(String(p.dni));
    setNombre(p.nombre);
    setErrorForm(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (p: Persona) => {
    if (!window.confirm(`¿Eliminar a ${p.nombre} (DNI ${p.dni})?`)) return;
    setEliminando(p.dni);
    try {
      const r = await personasApi.eliminar(p.dni);
      const texto =
        r && typeof r === "object" && "mensaje" in r ? String((r as { mensaje: unknown }).mensaje) : `Persona ${p.dni} eliminada.`;
      notificar({ tipo: "ok", texto });
      if (editando === p.dni) limpiarForm();
      if (resultado?.dni === p.dni) setResultado(null);
      cargar();
    } catch (e) {
      notificar({ tipo: "error", texto: errMsg(e) });
    } finally {
      setEliminando(null);
    }
  };

  const filas = resultado ? [resultado] : personas;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestión de Personas</h1>
            <p className="text-sm text-muted-foreground">Cliente CRUD de tu API Flask</p>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            {personas.length} registradas
          </span>
        </div>
      </header>

      {aviso && (
        <div
          role="status"
          className={`fixed right-4 top-4 z-50 max-w-sm rounded-lg px-4 py-3 text-sm shadow-lg ${
            aviso.tipo === "ok" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
          }`}
        >
          {aviso.texto}
        </div>
      )}

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          {/* Configuración */}
          <section className={card}>
            <h2 className="mb-3 font-semibold">Configuración de la API</h2>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">URL base</label>
            <input className={input} value={url} onChange={(e) => setUrl(e.target.value)} />
            <div className="mt-3 flex flex-wrap gap-2">
              <button className={btnPrimary} onClick={guardarUrl}>Guardar y conectar</button>
              <button className={btnOutline} onClick={probar} disabled={estado === "probando"}>
                {estado === "probando" && <Spinner />} Probar conexión
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  estado === "ok" ? "bg-success" : estado === "error" ? "bg-destructive" : "bg-muted-foreground"
                }`}
              />
              {estado === "ok" && "API conectada"}
              {estado === "error" && "Sin conexión"}
              {estado === "idle" && "Sin probar"}
              {estado === "probando" && "Probando…"}
            </div>
            {estado === "error" && (
              <p className="mt-2 text-xs text-muted-foreground">
                Si es la primera vez, abrí la URL del túnel en otra pestaña para autorizarlo en VS Code, y verificá que el
                túnel sea público y que Flask tenga CORS habilitado.
              </p>
            )}
          </section>

          {/* Formulario */}
          <section className={card}>
            <h2 className="mb-3 font-semibold">{editando !== null ? `Editar persona ${editando}` : "Registrar persona"}</h2>
            <form onSubmit={enviar} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">DNI</label>
                <input className={input} inputMode="numeric" value={dni} onChange={(e) => setDni(e.target.value)} placeholder="12345678" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Nombre</label>
                <input className={input} maxLength={30} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Bautista" />
              </div>
              {errorForm && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorForm}</p>}
              <div className="flex gap-2">
                <button type="submit" className={btnPrimary} disabled={guardando}>
                  {guardando && <Spinner />} {editando !== null ? "Guardar cambios" : "Registrar"}
                </button>
                {editando !== null && (
                  <button type="button" className={btnOutline} onClick={limpiarForm}>Cancelar</button>
                )}
              </div>
            </form>
          </section>
        </div>

        {/* Listado */}
        <section className={card}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold">{resultado ? "Resultado de búsqueda" : "Listado de personas"}</h2>
            <form onSubmit={buscar} className="flex gap-2">
              <input className={`${input} sm:w-44`} inputMode="numeric" placeholder="Buscar por DNI" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              <button className={btnOutline} disabled={buscando}>{buscando ? <Spinner /> : "Buscar"}</button>
            </form>
          </div>
          <div className="mb-3 flex gap-2">
            {resultado && (
              <button className={btnOutline} onClick={() => { setResultado(null); setBusqueda(""); }}>
                ← Ver listado completo
              </button>
            )}
            <button className={btnOutline} onClick={cargar} disabled={cargando}>
              {cargando && <Spinner />} Actualizar
            </button>
          </div>

          {cargando && !resultado ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground"><Spinner /> Cargando personas…</div>
          ) : errorLista && !resultado ? (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{errorLista}</div>
          ) : filas.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No hay personas registradas.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">DNI</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((p) => (
                    <tr key={p.dni} className={`border-t hover:bg-muted/50 ${editando === p.dni ? "bg-accent/40" : ""}`}>
                      <td className="px-4 py-3 font-mono">{p.dni}</td>
                      <td className="px-4 py-3">{p.nombre}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button className={btnEdit} onClick={() => editar(p)}>Editar</button>
                          <button className={btnDanger} onClick={() => eliminar(p)} disabled={eliminando === p.dni}>
                            {eliminando === p.dni ? <Spinner /> : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
