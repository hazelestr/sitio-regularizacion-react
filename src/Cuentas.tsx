import { useState } from "react";
import { crearCuenta, usuarioValido, type Cuenta, type Rol } from "./almacen";

type CambiarCuentas = (f: (c: Cuenta[]) => Cuenta[]) => void;

const nombreRol: Record<Rol, string> = {
  admin: "Administrador",
  docente: "Docente",
  alumno: "Alumno",
  familia: "Familia",
};

const roles: Rol[] = ["admin", "docente", "alumno", "familia"];

export function GestionCuentas({
  cuentas,
  setCuentas,
  yo,
}: {
  cuentas: Cuenta[];
  setCuentas: CambiarCuentas;
  yo: string;
}) {
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [clave, setClave] = useState("");
  const [rol, setRol] = useState<Rol>("docente");
  const [alumno, setAlumno] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [porBorrar, setPorBorrar] = useState<Cuenta | null>(null);

  const admins = cuentas.filter((c) => c.rol === "admin").length;

  const agregar = async () => {
    if (ocupado) return;
    const u = usuario.trim().toLowerCase();
    const a = alumno.trim().toLowerCase();
    if (!usuarioValido(u)) {
      setAviso("El usuario debe tener de 3 a 20 caracteres: minúsculas, números, punto, guion o guion bajo.");
      return;
    }
    if (nombre.trim().length < 2) {
      setAviso("Escribe el nombre de la persona.");
      return;
    }
    if (clave.length < 8) {
      setAviso("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (cuentas.some((c) => c.usuario === u)) {
      setAviso("Ese usuario ya existe.");
      return;
    }
    if (rol === "familia" && !cuentas.some((c) => c.usuario === a && c.rol === "alumno")) {
      setAviso("Escribe el usuario de un alumno que ya exista para vincular a la familia.");
      return;
    }
    setOcupado(true);
    const nueva = await crearCuenta(u, nombre.trim(), clave, rol, rol === "familia" ? a : undefined);
    setCuentas((c) => (c.some((x) => x.usuario === nueva.usuario) ? c : [...c, nueva]));
    setUsuario("");
    setNombre("");
    setClave("");
    setAlumno("");
    setAviso("");
    setOcupado(false);
  };

  const borrar = () => {
    if (!porBorrar) return;
    const u = porBorrar.usuario;
    setCuentas((c) => c.filter((x) => x.usuario !== u));
    setPorBorrar(null);
  };

  const vinculadas = porBorrar ? cuentas.filter((c) => c.alumno === porBorrar.usuario).length : 0;

  return (
    <section>
      <h2>Cuentas</h2>
      <p className="sub">Crea cuentas de docente, administrador, alumno o familia y elimina las que ya no se usen.</p>

      <div className="tarjeta">
        <h3>Cuentas registradas ({cuentas.length})</h3>
        <div className="items">
          {cuentas.map((c) => {
            const bloqueada = c.usuario === yo || (c.rol === "admin" && admins <= 1);
            return (
              <div className="fila-item" key={c.usuario}>
                <span className={c.rol === "admin" ? "fila-icono negro" : "fila-icono"}>{c.nombre.charAt(0).toUpperCase()}</span>
                <span className="fila-texto">
                  <strong>{c.nombre}</strong>
                  <small>{c.rol === "familia" ? `${c.usuario} · alumno: ${c.alumno ?? "sin vincular"}` : c.usuario}</small>
                </span>
                <span className="estado ok">{nombreRol[c.rol]}</span>
                <button className="peligro" disabled={bloqueada} onClick={() => setPorBorrar(c)}>Eliminar</button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tarjeta">
        <h3>Crear una cuenta</h3>
        <div className="fila">
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Usuario" autoComplete="off" />
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" autoComplete="off" />
        </div>
        <div className="fila">
          <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} placeholder="Contraseña (mínimo 8 caracteres)" autoComplete="new-password" />
          <select value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
            {roles.map((r) => (
              <option key={r} value={r}>{nombreRol[r]}</option>
            ))}
          </select>
        </div>
        {rol === "familia" && (
          <div className="fila">
            <input value={alumno} onChange={(e) => setAlumno(e.target.value)} placeholder="Usuario del alumno que acompaña" autoComplete="off" />
          </div>
        )}
        {aviso && <p className="mal" role="alert">{aviso}</p>}
        <button className="principal" onClick={agregar}>Crear cuenta</button>
      </div>

      {porBorrar && (
        <div className="modal-fondo">
          <div className="modal">
            <h3>¿Eliminar la cuenta?</h3>
            <p>Vas a eliminar la cuenta de {porBorrar.nombre} ({porBorrar.usuario}). Ya no podrá iniciar sesión.</p>
            {vinculadas > 0 && <p>Hay {vinculadas} cuenta(s) de familia vinculadas a este alumno. Quedarán sin alumno y tendrán que vincularse de nuevo.</p>}
            <div className="acciones">
              <button className="principal" onClick={borrar}>Sí, eliminar</button>
              <button className="secundario" onClick={() => setPorBorrar(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function VincularAlumno({
  cuentas,
  yo,
  setCuentas,
}: {
  cuentas: Cuenta[];
  yo: string;
  setCuentas: CambiarCuentas;
}) {
  const [alumno, setAlumno] = useState("");
  const [aviso, setAviso] = useState("");

  const vincular = () => {
    const a = alumno.trim().toLowerCase();
    if (!cuentas.some((c) => c.usuario === a && c.rol === "alumno")) {
      setAviso("No existe un alumno con ese usuario. Pídele al alumno que se registre primero.");
      return;
    }
    setCuentas((c) => c.map((x) => (x.usuario === yo ? { ...x, alumno: a } : x)));
  };

  return (
    <section>
      <h2>Vincula a tu alumno</h2>
      <div className="tarjeta aviso">
        <h3>Tu cuenta aún no tiene un alumno</h3>
        <p>Escribe el usuario del alumno al que acompañas para ver su avance, recibir sus notificaciones y compartir el foro.</p>
        <div className="fila">
          <input
            value={alumno}
            onChange={(e) => {
              setAlumno(e.target.value);
              setAviso("");
            }}
            placeholder="Usuario del alumno"
            autoComplete="off"
          />
        </div>
        {aviso && <p className="mal" role="alert">{aviso}</p>}
        <button className="principal" onClick={vincular}>Vincular</button>
      </div>
    </section>
  );
}

export function PanelAdmin({
  nombre,
  cuentas,
  totalArticulos,
  irCuentas,
  irArticulos,
}: {
  nombre: string;
  cuentas: Cuenta[];
  totalArticulos: number;
  irCuentas: () => void;
  irArticulos: () => void;
}) {
  const cuenta = (r: Rol) => cuentas.filter((c) => c.rol === r).length;

  return (
    <section>
      <div className="portada">
        <h1>Bienvenido, {nombre}</h1>
        <p>Desde aquí administras las cuentas del sitio y los artículos de apoyo que ven los estudiantes.</p>
      </div>

      <div className="rejilla">
        <div className="tarjeta destacada">
          <h3>Cuentas</h3>
          <p className="puntaje">{cuentas.length}</p>
          <p className="stats">
            {cuenta("alumno")} alumnos · {cuenta("familia")} familias · {cuenta("docente")} docentes · {cuenta("admin")} administradores
          </p>
          <button className="secundario" onClick={irCuentas}>Gestionar cuentas</button>
        </div>
        <div className="tarjeta destacada">
          <h3>Artículos publicados</h3>
          <p className="puntaje">{totalArticulos}</p>
          <p className="stats">En las tres materias</p>
          <button className="secundario" onClick={irArticulos}>Gestionar artículos</button>
        </div>
      </div>
    </section>
  );
}