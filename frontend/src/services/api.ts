const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

// Arma los encabezados; si hay un token guardado, lo adjunta
function encabezados(): Record<string, string> {
  const cabeceras: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem("lakid_token");
  if (token) {
    cabeceras["Authorization"] = `Bearer ${token}`;
  }
  return cabeceras;
}

// Lee el motivo del error que explica el back en el campo "detail"
async function leerError(respuesta: Response, ruta: string): Promise<Error> {
  let mensaje = `Error ${respuesta.status} al llamar ${ruta}`;
  try {
    const datos = await respuesta.json();
    if (typeof datos.detail === "string") {
      mensaje = datos.detail;
    }
  } catch {
    // si no venía JSON, se queda el mensaje genérico
  }
  return new Error(mensaje);
}

export async function apiGet<T>(ruta: string): Promise<T> {
  const respuesta = await fetch(`${API_URL}${ruta}`, { headers: encabezados() });

  if (!respuesta.ok) {
    throw await leerError(respuesta, ruta);
  }

  const tipo = respuesta.headers.get("content-type") ?? "";
  if (!tipo.includes("application/json")) {
    throw new Error(`La respuesta de ${API_URL}${ruta} no es JSON`);
  }

  return respuesta.json() as Promise<T>;
}

export async function apiPost<T>(ruta: string, cuerpo: unknown): Promise<T> {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: "POST",
    headers: encabezados(),
    body: JSON.stringify(cuerpo),
  });

  if (!respuesta.ok) {
    throw await leerError(respuesta, ruta);
  }

  return respuesta.json() as Promise<T>;
}