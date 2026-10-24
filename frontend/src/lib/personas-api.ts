// Módulo de servicios: centraliza todas las llamadas HTTP a la API Flask.
// La URL base es configurable por el usuario y se persiste en localStorage.

export interface Persona {
  dni: number;
  nombre: string;
}

const STORAGE_KEY = "personas_api_base_url";
export const DEFAULT_API_URL = "https://pl2ql4wk-5000.brs.devtunnels.ms/";

export function getApiBaseUrl(): string {
  if (typeof window === "undefined") return DEFAULT_API_URL;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_URL;
}

export function setApiBaseUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY, url);
}

/** Construye una URL evitando barras duplicadas entre base y ruta. */
function buildUrl(path: string): string {
  const base = getApiBaseUrl().replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${base}/${cleanPath}`;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Extrae el mensaje de error del JSON que devuelve el backend. */
async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      for (const key of ["error", "mensaje", "message", "msg", "detalle"]) {
        if (typeof obj[key] === "string") return obj[key] as string;
      }
      return JSON.stringify(data);
    }
  } catch {
    // respuesta sin JSON
  }
  return `Error HTTP ${res.status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(buildUrl(path), {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError(
      0,
      "No se pudo conectar con la API. Verificá la URL del túnel, que el backend esté activo y que no haya problemas de CORS o autorización del túnel de VS Code."
    );
  }
  if (!res.ok) {
    throw new ApiError(res.status, await extractErrorMessage(res));
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const personasApi = {
  listar: () => request<Persona[]>("/personas"),
  buscarPorDni: (dni: number) => request<Persona>(`/personas/${dni}`),
  crear: (persona: Persona) =>
    request<Persona>("/personas", { method: "POST", body: JSON.stringify(persona) }),
  modificar: (dni: number, persona: Persona) =>
    request<Persona>(`/personas/${dni}`, { method: "PUT", body: JSON.stringify(persona) }),
  eliminar: (dni: number) =>
    request<unknown>(`/personas/${dni}`, { method: "DELETE" }),
  /** Prueba de conexión usando GET /personas */
  probarConexion: () => request<Persona[]>("/personas"),
};

/** Validaciones del modelo Persona (el backend aplica las definitivas). */
export function validarPersona(dniRaw: string, nombre: string): string | null {
  const dni = Number(dniRaw);
  if (!/^\d+$/.test(dniRaw.trim()) || !Number.isInteger(dni) || dni <= 0) {
    return "El DNI debe ser un número entero positivo.";
  }
  if (nombre.length < 1 || nombre.length > 30) {
    return "El nombre debe tener entre 1 y 30 caracteres.";
  }
  if (!/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]*$/.test(nombre)) {
    return "El nombre debe comenzar con mayúscula y el resto en minúscula.";
  }
  return null;
}
