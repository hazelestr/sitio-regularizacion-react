import { useState } from "react";
import "./App.css";

type Materia = "Matemáticas" | "Español" | "Ciencias";
type Seccion = "inicio" | "videos" | "resumenes" | "ejercicios" | "diagnostico" | "avance" | "foro" | "plan";
type Nivel = "Básico" | "Intermedio" | "Avanzado";
type Pregunta = { pregunta: string; opciones: string[]; correcta: number; explicacion: string };
type PreguntaDiag = { materia: Materia; pregunta: string; opciones: string[]; correcta: number };
type Respuesta = { rol: string; texto: string };
type Publicacion = { id: number; materia: Materia; rol: string; texto: string; respuestas: Respuesta[] };
type Resultado = Record<Materia, number>;

const materias: Materia[] = ["Matemáticas", "Español", "Ciencias"];

const secciones: { id: Seccion; nombre: string; desc: string }[] = [
  { id: "videos", nombre: "Videos", desc: "Explicaciones cortas por materia para reforzar lo que no quedó claro en clase." },
  { id: "resumenes", nombre: "Resúmenes", desc: "Artículos breves para repasar la teoría antes de practicar." },
  { id: "ejercicios", nombre: "Ejercicios", desc: "Práctica con retroalimentación inmediata en cada respuesta." },
  { id: "diagnostico", nombre: "Diagnóstico", desc: "Un examen corto que calcula tu nivel en cada materia." },
  { id: "avance", nombre: "Avance", desc: "Panel para que la familia vea cómo va el estudiante." },
  { id: "foro", nombre: "Foro", desc: "Espacio para publicar dudas y recibir respuestas de un tutor." },
  { id: "plan", nombre: "Mi plan", desc: "Recomendaciones de qué repasar según tus resultados." },
];

const videos: { materia: Materia; titulo: string; url: string }[] = [
  { materia: "Matemáticas", titulo: "Suma de fracciones con distinto denominador", url: "" },
  { materia: "Español", titulo: "Palabras agudas, graves y esdrújulas", url: "" },
  { materia: "Ciencias", titulo: "Estados de la materia y sus cambios", url: "" },
];

const resumenes: Record<Materia, { titulo: string; parrafos: string[] }> = {
  Matemáticas: {
    titulo: "Suma de fracciones",
    parrafos: [
      "Una fracción representa una parte de un todo. El número de arriba es el numerador y el de abajo es el denominador.",
      "Para sumar fracciones con distinto denominador se buscan fracciones equivalentes que compartan el mismo denominador y después se suman los numeradores. Por ejemplo, 1/2 + 1/4 se convierte en 2/4 + 1/4, que da 3/4.",
    ],
  },
  Español: {
    titulo: "Acentuación de palabras",
    parrafos: [
      "Las palabras agudas llevan la fuerza de voz en la última sílaba y se acentúan cuando terminan en n, s o vocal, como camión o café.",
      "Las graves cargan la fuerza en la penúltima sílaba y llevan tilde cuando no terminan en n, s o vocal, como árbol. Las esdrújulas siempre llevan tilde, como música.",
    ],
  },
  Ciencias: {
    titulo: "Estados de la materia",
    parrafos: [
      "La materia se presenta principalmente en estado sólido, líquido y gaseoso, según qué tan unidas estén sus partículas.",
      "Los cambios de estado dependen de la temperatura. La fusión pasa de sólido a líquido, la evaporación de líquido a gas, la condensación de gas a líquido y la solidificación de líquido a sólido.",
    ],
  },
};

const ejercicios: Pregunta[] = [
  {
    pregunta: "¿Cuánto es 1/2 + 1/4?",
    opciones: ["1/6", "3/4", "2/4", "1/8"],
    correcta: 1,
    explicacion: "Se convierte 1/2 en 2/4 y se suma con 1/4, lo que da 3/4.",
  },
  {
    pregunta: "¿Cuánto es el 25% de 80?",
    opciones: ["10", "15", "20", "25"],
    correcta: 2,
    explicacion: "El 25% es la cuarta parte, y 80 entre 4 es 20.",
  },
  {
    pregunta: "Si x + 7 = 15, ¿cuánto vale x?",
    opciones: ["6", "8", "22", "9"],
    correcta: 1,
    explicacion: "Se resta 7 de ambos lados, y 15 menos 7 es 8.",
  },
];

const diagnostico: PreguntaDiag[] = [
  { materia: "Matemáticas", pregunta: "¿Cuánto es 12 × 8?", opciones: ["96", "86", "108", "88"], correcta: 0 },
  { materia: "Matemáticas", pregunta: "Si 2x = 18, ¿cuánto vale x?", opciones: ["8", "36", "9", "16"], correcta: 2 },
  { materia: "Español", pregunta: "¿Cuál de estas palabras es esdrújula?", opciones: ["camión", "música", "árbol", "café"], correcta: 1 },
  { materia: "Español", pregunta: "¿Cuál de estas palabras es aguda?", opciones: ["mesa", "reloj", "lápiz", "árbol"], correcta: 1 },
  { materia: "Ciencias", pregunta: "¿Cómo se llama el cambio de líquido a gas?", opciones: ["Fusión", "Evaporación", "Condensación", "Solidificación"], correcta: 1 },
  { materia: "Ciencias", pregunta: "¿Qué gas necesitan las plantas para la fotosíntesis?", opciones: ["Oxígeno", "Nitrógeno", "Dióxido de carbono", "Hidrógeno"], correcta: 2 },
];

const prohibidas = ["idiota", "estupido", "estúpido", "tonto", "imbecil", "imbécil"];

const moderar = (texto: string): string | null => {
  if (texto.trim().length < 5) return "Escribe un mensaje un poco más largo para poder ayudarte.";
  const t = texto.toLowerCase();
  if (prohibidas.some((p) => t.includes(p))) return "Tu mensaje contiene lenguaje no permitido en el foro.";
  return null;
};

const nivelDe = (aciertos: number): Nivel => {
  if (aciertos >= 2) return "Avanzado";
  if (aciertos === 1) return "Intermedio";
  return "Básico";
};

const consejo: Record<Nivel, string> = {
  Básico: "Mira el video, lee el resumen y después resuelve los ejercicios.",
  Intermedio: "Repasa el resumen y practica con ejercicios.",
  Avanzado: "Refuerza con ejercicios y avanza al siguiente tema.",
};

function Barra({ etiqueta, valor, total }: { etiqueta: string; valor: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((valor / total) * 100);
  return (
    <div className="medida">
      <div className="medida-texto">
        <span>{etiqueta}</span>
        <span>{valor} de {total}</span>
      </div>
      <div className="pista">
        <div className="relleno" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Inicio({ ir }: { ir: (s: Seccion) => void }) {
  return (
    <section>
      <div className="portada">
        <h1>Regulariza tus materias a tu ritmo</h1>
        <p>Videos, resúmenes, ejercicios y un diagnóstico para saber por dónde empezar en matemáticas, español y ciencias.</p>
        <button className="principal" onClick={() => ir("diagnostico")}>Hacer mi diagnóstico</button>
      </div>
      <div className="rejilla">
        {secciones.map((s) => (
          <div className="tarjeta" key={s.id}>
            <h3>{s.nombre}</h3>
            <p>{s.desc}</p>
            <button className="secundario" onClick={() => ir(s.id)}>Abrir</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Videos() {
  return (
    <section>
      <h2>Videos por materia</h2>
      <p className="sub">Explicaciones cortas para reforzar lo que no entendiste en clase.</p>
      <div className="rejilla">
        {videos.map((v) => (
          <div className="tarjeta" key={v.materia}>
            <span className="etiqueta">{v.materia}</span>
            <h3>{v.titulo}</h3>
            {v.url ? (
              <iframe className="video" src={v.url} title={v.titulo} allowFullScreen />
            ) : (
              <div className="video vacio">Video en producción</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Resumenes() {
  const [materia, setMateria] = useState<Materia>("Matemáticas");
  const r = resumenes[materia];
  return (
    <section>
      <h2>Resúmenes de apoyo</h2>
      <div className="pestanas">
        {materias.map((m) => (
          <button key={m} className={m === materia ? "pestana activa" : "pestana"} onClick={() => setMateria(m)}>{m}</button>
        ))}
      </div>
      <div className="tarjeta">
        <h3>{r.titulo}</h3>
        {r.parrafos.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}

function Ejercicios({ respuestas, setRespuestas }: { respuestas: Record<number, number>; setRespuestas: (r: Record<number, number>) => void }) {
  const correctas = ejercicios.filter((e, i) => respuestas[i] === e.correcta).length;
  return (
    <section>
      <h2>Ejercicios de matemáticas</h2>
      <p className="sub">Elige una respuesta y verás al instante si es correcta.</p>
      {ejercicios.map((e, i) => {
        const elegida = respuestas[i];
        const contestada = elegida !== undefined;
        return (
          <div className="tarjeta" key={i}>
            <p className="pregunta">{i + 1}. {e.pregunta}</p>
            <div className="opciones">
              {e.opciones.map((op, j) => (
                <button
                  key={j}
                  className={contestada && j === e.correcta ? "opcion buena" : contestada && j === elegida ? "opcion mala" : "opcion"}
                  disabled={contestada}
                  onClick={() => setRespuestas({ ...respuestas, [i]: j })}
                >
                  {op}
                </button>
              ))}
            </div>
            {contestada && (
              <p className={elegida === e.correcta ? "ok" : "mal"}>
                {elegida === e.correcta ? "¡Correcto! " : "No es correcta. "}
                {e.explicacion}
              </p>
            )}
          </div>
        );
      })}
      <p className="sub">Llevas {correctas} respuestas correctas de {ejercicios.length}.</p>
      <button className="secundario" onClick={() => setRespuestas({})}>Reiniciar ejercicios</button>
    </section>
  );
}

function Diagnostico({ diag, setDiag }: { diag: Resultado | null; setDiag: (r: Resultado | null) => void }) {
  const [elegidas, setElegidas] = useState<Record<number, number>>({});

  const calcular = () => {
    const r: Resultado = { Matemáticas: 0, Español: 0, Ciencias: 0 };
    diagnostico.forEach((p, i) => {
      if (elegidas[i] === p.correcta) r[p.materia] += 1;
    });
    setDiag(r);
  };

  const reiniciar = () => {
    setElegidas({});
    setDiag(null);
  };

  if (diag) {
    return (
      <section>
        <h2>Resultado del diagnóstico</h2>
        <div className="rejilla">
          {materias.map((m) => (
            <div className="tarjeta" key={m}>
              <span className="etiqueta">{m}</span>
              <h3>{nivelDe(diag[m])}</h3>
              <p>{diag[m]} de 2 respuestas correctas</p>
            </div>
          ))}
        </div>
        <button className="secundario" onClick={reiniciar}>Volver a contestar</button>
      </section>
    );
  }

  return (
    <section>
      <h2>Examen diagnóstico</h2>
      <p className="sub">Seis preguntas, dos por materia, para calcular tu nivel.</p>
      {diagnostico.map((p, i) => (
        <div className="tarjeta" key={i}>
          <span className="etiqueta">{p.materia}</span>
          <p className="pregunta">{p.pregunta}</p>
          <div className="opciones">
            {p.opciones.map((op, j) => (
              <button key={j} className={elegidas[i] === j ? "opcion elegida" : "opcion"} onClick={() => setElegidas({ ...elegidas, [i]: j })}>{op}</button>
            ))}
          </div>
        </div>
      ))}
      <button className="principal" disabled={Object.keys(elegidas).length < diagnostico.length} onClick={calcular}>Ver mi nivel</button>
    </section>
  );
}

function Avance({ respuestas, diag }: { respuestas: Record<number, number>; diag: Resultado | null }) {
  const correctas = ejercicios.filter((e, i) => respuestas[i] === e.correcta).length;
  const contestadas = Object.keys(respuestas).length;
  return (
    <section>
      <h2>Panel de avance</h2>
      <p className="sub">Resumen para que la familia vea cómo va el estudiante en cada materia.</p>
      <div className="tarjeta">
        <h3>Ejercicios de matemáticas</h3>
        <Barra etiqueta="Ejercicios contestados" valor={contestadas} total={ejercicios.length} />
        <Barra etiqueta="Respuestas correctas" valor={correctas} total={ejercicios.length} />
      </div>
      <div className="tarjeta">
        <h3>Diagnóstico por materia</h3>
        {diag ? (
          materias.map((m) => <Barra key={m} etiqueta={`${m} (${nivelDe(diag[m])})`} valor={diag[m]} total={2} />)
        ) : (
          <p>Aún no se ha contestado el examen diagnóstico.</p>
        )}
      </div>
    </section>
  );
}

function Foro({ posts, setPosts }: { posts: Publicacion[]; setPosts: (p: Publicacion[]) => void }) {
  const [materia, setMateria] = useState<Materia>("Matemáticas");
  const [rol, setRol] = useState("Estudiante");
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState("");
  const [borradores, setBorradores] = useState<Record<number, string>>({});
  const [filtro, setFiltro] = useState<Materia | "Todas">("Todas");

  const publicar = () => {
    const problema = moderar(texto);
    if (problema) {
      setAviso(problema);
      return;
    }
    setPosts([{ id: Date.now(), materia, rol, texto: texto.trim(), respuestas: [] }, ...posts]);
    setTexto("");
    setAviso("");
  };

  const responder = (id: number) => {
    const t = (borradores[id] ?? "").trim();
    const problema = moderar(t);
    if (problema) {
      setAviso(problema);
      return;
    }
    setPosts(posts.map((p) => (p.id === id ? { ...p, respuestas: [...p.respuestas, { rol, texto: t }] } : p)));
    setBorradores({ ...borradores, [id]: "" });
    setAviso("");
  };

  const visibles = posts.filter((p) => filtro === "Todas" || p.materia === filtro);

  return (
    <section>
      <h2>Foro de dudas</h2>
      <p className="sub">Publica tu duda por materia y un tutor podrá responderte.</p>
      <div className="tarjeta">
        <div className="fila">
          <select value={materia} onChange={(e) => setMateria(e.target.value as Materia)}>
            {materias.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option>Estudiante</option>
            <option>Tutor</option>
          </select>
        </div>
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe tu duda" rows={3} />
        {aviso && <p className="mal">{aviso}</p>}
        <button className="principal" onClick={publicar}>Publicar</button>
      </div>
      <div className="pestanas">
        {(["Todas", ...materias] as const).map((m) => (
          <button key={m} className={m === filtro ? "pestana activa" : "pestana"} onClick={() => setFiltro(m)}>{m}</button>
        ))}
      </div>
      {visibles.map((p) => (
        <div className="tarjeta" key={p.id}>
          <span className="etiqueta">{p.materia}</span>
          <p><strong>{p.rol}</strong> pregunta o comenta</p>
          <p>{p.texto}</p>
          {p.respuestas.map((r, i) => (
            <p className="respuesta" key={i}><strong>{r.rol}</strong> responde. {r.texto}</p>
          ))}
          <div className="fila">
            <input value={borradores[p.id] ?? ""} onChange={(e) => setBorradores({ ...borradores, [p.id]: e.target.value })} placeholder="Escribe una respuesta" />
            <button className="secundario" onClick={() => responder(p.id)}>Responder</button>
          </div>
        </div>
      ))}
    </section>
  );
}

function Plan({ diag, ir }: { diag: Resultado | null; ir: (s: Seccion) => void }) {
  if (!diag) {
    return (
      <section>
        <h2>Mi plan de estudio</h2>
        <div className="tarjeta">
          <p>Para generar tu plan primero necesitas contestar el examen diagnóstico.</p>
          <button className="principal" onClick={() => ir("diagnostico")}>Ir al diagnóstico</button>
        </div>
      </section>
    );
  }
  const orden = [...materias].sort((a, b) => diag[a] - diag[b]);
  const primera = orden[0];
  const video = videos.find((v) => v.materia === primera);
  return (
    <section>
      <h2>Mi plan de estudio</h2>
      <div className="tarjeta destacada">
        <h3>Video recomendado para empezar</h3>
        <p>Según tu diagnóstico, conviene comenzar con el video de {primera}{video ? ` titulado ${video.titulo}` : ""}.</p>
        <button className="principal" onClick={() => ir("videos")}>Ver videos</button>
      </div>
      {orden.map((m) => (
        <div className="tarjeta" key={m}>
          <span className="etiqueta">{m}</span>
          <h3>Nivel {nivelDe(diag[m])}</h3>
          <p>{consejo[nivelDe(diag[m])]}</p>
        </div>
      ))}
    </section>
  );
}

export default function App() {
  const [seccion, setSeccion] = useState<Seccion>("inicio");
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [diag, setDiag] = useState<Resultado | null>(null);
  const [posts, setPosts] = useState<Publicacion[]>([
    { id: 1, materia: "Matemáticas", rol: "Tutor", texto: "Bienvenidos al foro. Publiquen aquí sus dudas de cada materia.", respuestas: [] },
  ]);

  const ir = (s: Seccion) => {
    setSeccion(s);
    window.scrollTo(0, 0);
  };

  return (
    <div className="app">
      <header className="barra">
        <button className="logo" onClick={() => ir("inicio")}>Regularización Escolar</button>
        <nav>
          {secciones.map((s) => (
            <button key={s.id} className={seccion === s.id ? "enlace activo" : "enlace"} onClick={() => ir(s.id)}>{s.nombre}</button>
          ))}
        </nav>
      </header>
      <main>
        {seccion === "inicio" && <Inicio ir={ir} />}
        {seccion === "videos" && <Videos />}
        {seccion === "resumenes" && <Resumenes />}
        {seccion === "ejercicios" && <Ejercicios respuestas={respuestas} setRespuestas={setRespuestas} />}
        {seccion === "diagnostico" && <Diagnostico diag={diag} setDiag={setDiag} />}
        {seccion === "avance" && <Avance respuestas={respuestas} diag={diag} />}
        {seccion === "foro" && <Foro posts={posts} setPosts={setPosts} />}
        {seccion === "plan" && <Plan diag={diag} ir={ir} />}
      </main>
      <footer className="pie">
        <p>Sitio Web Educativo de Regularización Escolar</p>
        <p>Prototipo académico del Proyecto II, Universidad de Guadalajara, 2026</p>
      </footer>
    </div>
  );
}