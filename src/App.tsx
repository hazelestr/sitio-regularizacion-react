import { useState } from "react";
import "./App.css";

const VIDEO_URL = "";

const ejercicios = [
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

const diagnostico = [
  { pregunta: "¿Cuánto es 12 × 8?", opciones: ["96", "86", "108", "88"], correcta: 0 },
  { pregunta: "¿Cuánto es 3/5 de 20?", opciones: ["10", "12", "15", "8"], correcta: 1 },
  { pregunta: "¿Cuánto es 0.5 + 0.25?", opciones: ["0.3", "0.75", "0.525", "1"], correcta: 1 },
  { pregunta: "Si 2x = 18, ¿cuánto vale x?", opciones: ["8", "36", "9", "16"], correcta: 2 },
];

function Resumen() {
  return (
    <section className="tarjeta">
      <h2>Resumen de apoyo, fracciones (HU-04)</h2>
      <p>
        Una fracción representa una parte de un todo. Para sumar fracciones con
        distinto denominador, primero se buscan fracciones equivalentes que
        compartan el mismo denominador y después se suman los numeradores.
      </p>
    </section>
  );
}

function Video() {
  return (
    <section className="tarjeta">
      <h2>Video de matemáticas (HU-01)</h2>
      {VIDEO_URL ? (
        <iframe
          width="100%"
          height="315"
          src={VIDEO_URL}
          title="Video de matemáticas"
          allowFullScreen
        />
      ) : (
        <p>Aquí se mostrará el video de matemáticas.</p>
      )}
    </section>
  );
}

function Ejercicios() {
  const [respuestas, setRespuestas] = useState({});

  return (
    <section className="tarjeta">
      <h2>Ejercicios interactivos (HU-02)</h2>
      {ejercicios.map((e, i) => {
        const elegida = respuestas[i];
        const contestada = elegida !== undefined;
        return (
          <div key={i} className="pregunta">
            <p>{e.pregunta}</p>
            {e.opciones.map((op, j) => (
              <button
                key={j}
                disabled={contestada}
                onClick={() => setRespuestas({ ...respuestas, [i]: j })}
              >
                {op}
              </button>
            ))}
            {contestada && (
              <p className={elegida === e.correcta ? "ok" : "mal"}>
                {elegida === e.correcta ? "¡Correcto! " : "Respuesta incorrecta. "}
                {e.explicacion}
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}

function Diagnostico() {
  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);

  const calcularNivel = () => {
    const aciertos = diagnostico.filter((p, i) => respuestas[i] === p.correcta).length;
    let nivel = "Básico";
    if (aciertos >= 4) nivel = "Avanzado";
    else if (aciertos >= 2) nivel = "Intermedio";
    setResultado({ aciertos, nivel });
  };

  return (
    <section className="tarjeta">
      <h2>Examen diagnóstico (HU-03)</h2>
      {diagnostico.map((p, i) => (
        <div key={i} className="pregunta">
          <p>{p.pregunta}</p>
          {p.opciones.map((op, j) => (
            <button
              key={j}
              className={respuestas[i] === j ? "elegida" : ""}
              onClick={() => setRespuestas({ ...respuestas, [i]: j })}
            >
              {op}
            </button>
          ))}
        </div>
      ))}
      <button
        className="principal"
        disabled={Object.keys(respuestas).length < diagnostico.length}
        onClick={calcularNivel}
      >
        Ver mi nivel
      </button>
      {resultado && (
        <p className="ok">
          Acertaste {resultado.aciertos} de {diagnostico.length}. Tu nivel es{" "}
          {resultado.nivel}.
        </p>
      )}
    </section>
  );
}

export default function App() {
  return (
    <main>
      <h1>Sitio Web Educativo de Regularización Escolar</h1>
      <p>Prototipo del Sprint 1, materia de matemáticas</p>
      <Video />
      <Resumen />
      <Ejercicios />
      <Diagnostico />
    </main>
  );
}