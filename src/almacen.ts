export type Rol = "docente" | "alumno" | "familia" | "admin";
export type Cuenta = { usuario: string; nombre: string; rol: Rol; sal: string; hash: string; alumno?: string };

export function leer<T>(clave: string, defecto: T): T {
  try {
    const v = localStorage.getItem(clave);
    return v === null ? defecto : (JSON.parse(v) as T);
  } catch {
    return defecto;
  }
}

export function escribir(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    return;
  }
}

const aHex = (b: ArrayBuffer) =>
  Array.from(new Uint8Array(b))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");

const nuevaSal = () => aHex(crypto.getRandomValues(new Uint8Array(16)).buffer);

const calcularHash = async (clave: string, sal: string) => {
  const llave = await crypto.subtle.importKey("raw", new TextEncoder().encode(clave), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: new TextEncoder().encode(sal), iterations: 100000, hash: "SHA-256" },
    llave,
    256
  );
  return aHex(bits);
};

export const usuarioValido = (u: string) => /^[a-z0-9._-]{3,20}$/.test(u);

export async function crearCuenta(usuario: string, nombre: string, clave: string, rol: Rol, alumno?: string): Promise<Cuenta> {
  const sal = nuevaSal();
  const hash = await calcularHash(clave, sal);
  return alumno ? { usuario, nombre, rol, sal, hash, alumno } : { usuario, nombre, rol, sal, hash };
}

export async function verificar(cuenta: Cuenta, clave: string): Promise<boolean> {
  return (await calcularHash(clave, cuenta.sal)) === cuenta.hash;
}