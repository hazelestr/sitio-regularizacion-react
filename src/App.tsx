import { useEffect, useRef, useState } from "react";
import "./App.css";

type Materia = "Matemáticas" | "Español" | "Ciencias";
type Seccion = "inicio" | "videos" | "resumenes" | "ejercicios" | "diagnostico" | "foro" | "panel";
type Nivel = "Básico" | "Intermedio" | "Avanzado";
type Pregunta = { pregunta: string; opciones: string[]; correcta: number; explicacion: string };
type PreguntaDiag = { materia: Materia; pregunta: string; opciones: string[]; correcta: number };
type Respuesta = { rol: string; texto: string };
type Publicacion = { id: number; materia: Materia; rol: string; texto: string; respuestas: Respuesta[] };
type Resultado = Record<Materia, number>;
type ResultadosEj = Record<Materia, number | null>;
type Fase = "elegir" | "aviso" | "examen" | "resultado";
type Articulo = { titulo: string; parrafos: string[] };
type Articulos = Record<Materia, Articulo[]>;
type Pendiente = { tipo: "publicar" } | { tipo: "baja"; indice: number };

const TIEMPO_MIN = 20;
const TIEMPO_DIAG_MIN = 30;
const PREG_POR_MATERIA = 10;

const materias: Materia[] = ["Matemáticas", "Español", "Ciencias"];

const tono: Record<Materia, string> = {
  Matemáticas: "azul",
  Español: "ambar",
  Ciencias: "morado",
};

const secciones: { id: Seccion; nombre: string; desc: string }[] = [
  { id: "videos", nombre: "Videos", desc: "Explicaciones cortas por materia para reforzar lo que no quedó claro en clase." },
  { id: "resumenes", nombre: "Resúmenes", desc: "Artículos breves para repasar la teoría antes de practicar." },
  { id: "ejercicios", nombre: "Ejercicios", desc: "Presenta ejercicios por materia con tiempo y conoce tus aciertos al final." },
  { id: "diagnostico", nombre: "Diagnóstico", desc: "Un examen de 30 preguntas con tiempo que calcula tu nivel en cada materia." },
  { id: "foro", nombre: "Foro", desc: "Espacio para publicar dudas y recibir respuestas de un tutor." },
];

const menu: { id: Seccion; nombre: string }[] = [{ id: "inicio", nombre: "Inicio" }, ...secciones.map((s) => ({ id: s.id, nombre: s.nombre }))];

const videos: { materia: Materia; titulo: string; url: string }[] = [
  { materia: "Matemáticas", titulo: "Suma de fracciones con distinto denominador", url: "" },
  { materia: "Matemáticas", titulo: "Porcentajes y su uso en la vida diaria", url: "" },
  { materia: "Matemáticas", titulo: "Ecuaciones de primer grado", url: "" },
  { materia: "Matemáticas", titulo: "Perímetro y área de figuras planas", url: "" },
  { materia: "Español", titulo: "Palabras agudas, graves y esdrújulas", url: "" },
  { materia: "Español", titulo: "Uso de los signos de puntuación", url: "" },
  { materia: "Español", titulo: "Sustantivos, adjetivos y verbos", url: "" },
  { materia: "Español", titulo: "Cómo encontrar la idea principal de un texto", url: "" },
  { materia: "Ciencias", titulo: "Estados de la materia y sus cambios", url: "" },
  { materia: "Ciencias", titulo: "La fotosíntesis paso a paso", url: "" },
  { materia: "Ciencias", titulo: "Cadenas alimenticias y ecosistemas", url: "" },
  { materia: "Ciencias", titulo: "El sistema solar", url: "" },
];

const resumenes: Articulos = {
  Matemáticas: [
    {
      titulo: "Suma de fracciones",
      parrafos: [
        "Una fracción representa una parte de un todo. El número de arriba es el numerador y el de abajo es el denominador.",
        "Para sumar fracciones con distinto denominador se buscan fracciones equivalentes que compartan el mismo denominador y después se suman los numeradores. Por ejemplo, 1/2 + 1/4 se convierte en 2/4 + 1/4, que da 3/4.",
      ],
    },
    {
      titulo: "Porcentajes",
      parrafos: [
        "Un porcentaje expresa una cantidad como parte de 100. Decir 25% significa 25 de cada 100.",
        "Para calcular el porcentaje de una cantidad se multiplica la cantidad por el porcentaje y se divide entre 100. Por ejemplo, el 25% de 80 es 80 × 25 ÷ 100, que da 20.",
      ],
    },
    {
      titulo: "Ecuaciones de primer grado",
      parrafos: [
        "Una ecuación es una igualdad que contiene un valor desconocido, casi siempre representado con la letra x. Resolverla consiste en encontrar el valor que vuelve verdadera la igualdad.",
        "La regla básica es que lo que se hace de un lado se hace del otro. Si x + 7 = 15, se resta 7 en ambos lados y x vale 8. Si 2x = 18, se divide entre 2 en ambos lados y x vale 9.",
      ],
    },
    {
      titulo: "Perímetro y área",
      parrafos: [
        "El perímetro es la suma de todos los lados de una figura, es decir, la longitud de su contorno. El área es la superficie que ocupa la figura.",
        "En un rectángulo, el área es base por altura y el perímetro es 2 por la suma de base y altura. En un triángulo, el área es base por altura entre 2. En un círculo, el área es π por el radio al cuadrado.",
      ],
    },
  ],
  Español: [
    {
      titulo: "Acentuación de palabras",
      parrafos: [
        "Las palabras agudas llevan la fuerza de voz en la última sílaba y se acentúan cuando terminan en n, s o vocal, como camión o café.",
        "Las graves cargan la fuerza en la penúltima sílaba y llevan tilde cuando no terminan en n, s o vocal, como árbol. Las esdrújulas siempre llevan tilde, como música.",
      ],
    },
    {
      titulo: "Signos de puntuación",
      parrafos: [
        "La coma separa los elementos de una enumeración y marca pausas breves. El punto cierra una oración o un párrafo. Los dos puntos anuncian una enumeración o una cita.",
        "El punto y coma marca una pausa mayor que la coma y menor que el punto. En español, las preguntas y las exclamaciones se abren y se cierran con signos, como ¿Qué hora es? o ¡Qué sorpresa!",
      ],
    },
    {
      titulo: "Sustantivos, adjetivos y verbos",
      parrafos: [
        "El sustantivo nombra personas, animales, cosas o lugares. El adjetivo acompaña al sustantivo y dice cómo es. El verbo expresa una acción, un estado o un proceso y cambia según la persona, el tiempo y el modo.",
        "En la oración El niño travieso corre, niño es el sustantivo, travieso es el adjetivo y corre es el verbo.",
      ],
    },
    {
      titulo: "La idea principal de un texto",
      parrafos: [
        "La idea principal es lo más importante que dice un texto. Las ideas secundarias la explican, la ejemplifican o la complementan.",
        "Para encontrarla conviene leer el texto completo, preguntarse de qué trata y qué dice el autor sobre ese tema, y revisar el inicio y el final de cada párrafo, donde suele aparecer.",
      ],
    },
  ],
  Ciencias: [
    {
      titulo: "Estados de la materia",
      parrafos: [
        "La materia se presenta principalmente en estado sólido, líquido y gaseoso, según qué tan unidas estén sus partículas.",
        "Los cambios de estado dependen de la temperatura. La fusión pasa de sólido a líquido, la evaporación de líquido a gas, la condensación de gas a líquido y la solidificación de líquido a sólido.",
      ],
    },
    {
      titulo: "La fotosíntesis",
      parrafos: [
        "La fotosíntesis es el proceso con el que las plantas, las algas y algunas bacterias producen su alimento usando la luz del sol.",
        "Toman dióxido de carbono del aire y agua del suelo y, con la energía de la luz, producen glucosa y liberan oxígeno. Ocurre en los cloroplastos, que contienen clorofila, el pigmento verde.",
      ],
    },
    {
      titulo: "Cadenas alimenticias",
      parrafos: [
        "Una cadena alimenticia muestra quién se alimenta de quién. Los productores, como las plantas, fabrican su propio alimento. Los consumidores primarios son herbívoros y los secundarios son carnívoros.",
        "Los descomponedores, como los hongos y las bacterias, transforman la materia muerta y devuelven nutrientes al suelo. En los esquemas, la flecha indica hacia dónde viaja la energía.",
      ],
    },
    {
      titulo: "El sistema solar",
      parrafos: [
        "El sistema solar está formado por el Sol y los cuerpos que giran a su alrededor. Tiene ocho planetas: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno.",
        "Los cuatro primeros son rocosos y los otros cuatro son gigantes gaseosos o helados. La Tierra gira sobre su eje en unas 24 horas, lo que produce el día y la noche, y tarda cerca de 365 días en dar una vuelta al Sol.",
      ],
    },
  ],
};

const banco: Record<Materia, Pregunta[]> = {
  Matemáticas: [
    { pregunta: "¿Cuánto es 1/2 + 1/4?", opciones: ["1/6", "3/4", "2/4", "1/8"], correcta: 1, explicacion: "Se convierte 1/2 en 2/4 y se suma con 1/4, lo que da 3/4." },
    { pregunta: "¿Cuánto es el 25% de 80?", opciones: ["10", "15", "20", "25"], correcta: 2, explicacion: "El 25% es la cuarta parte, y 80 entre 4 es 20." },
    { pregunta: "Si x + 7 = 15, ¿cuánto vale x?", opciones: ["6", "22", "8", "9"], correcta: 2, explicacion: "Se resta 7 de ambos lados, y 15 menos 7 es 8." },
    { pregunta: "¿Cuánto es 12 × 8?", opciones: ["96", "86", "108", "88"], correcta: 0, explicacion: "12 por 8 es 96, porque 10 por 8 es 80 y 2 por 8 es 16." },
    { pregunta: "Si 2x = 18, ¿cuánto vale x?", opciones: ["8", "36", "9", "16"], correcta: 2, explicacion: "Se divide entre 2 en ambos lados, y 18 entre 2 es 9." },
    { pregunta: "¿Cuál es el perímetro de un rectángulo de 5 cm de base y 3 cm de altura?", opciones: ["15 cm", "8 cm", "30 cm", "16 cm"], correcta: 3, explicacion: "El perímetro es 2 por (5 + 3), que da 16 cm." },
    { pregunta: "¿Cuál es el área de un rectángulo de 6 m por 4 m?", opciones: ["10 m²", "20 m²", "24 m²", "48 m²"], correcta: 2, explicacion: "El área es base por altura, 6 por 4 son 24 m²." },
    { pregunta: "¿Cuánto es 3/5 de 20?", opciones: ["12", "15", "8", "60"], correcta: 0, explicacion: "20 entre 5 es 4, y 4 por 3 es 12." },
    { pregunta: "¿Qué fracción es equivalente a 2/3?", opciones: ["4/6", "3/4", "2/6", "6/4"], correcta: 0, explicacion: "Multiplicando numerador y denominador por 2 se obtiene 4/6." },
    { pregunta: "¿Cuánto es 7 × 9 − 13?", opciones: ["40", "50", "63", "76"], correcta: 1, explicacion: "Primero se multiplica, 7 por 9 son 63, y luego se resta 13, lo que da 50." },
    { pregunta: "Resuelve: 3x − 5 = 10", opciones: ["x = 3", "x = 15", "x = 5/3", "x = 5"], correcta: 3, explicacion: "Se suma 5 en ambos lados y queda 3x = 15. Al dividir entre 3, x vale 5." },
    { pregunta: "¿Cuánto es el 10% de 350?", opciones: ["35", "3.5", "350", "3,500"], correcta: 0, explicacion: "El 10% es la décima parte, y 350 entre 10 es 35." },
    { pregunta: "¿Cuánto es 2/3 × 3/4?", opciones: ["5/7", "1/2", "9/8", "6/7"], correcta: 1, explicacion: "Se multiplican numeradores y denominadores, lo que da 6/12, que simplificado es 1/2." },
    { pregunta: "Un triángulo tiene 10 cm de base y 6 cm de altura. ¿Cuál es su área?", opciones: ["60 cm²", "16 cm²", "32 cm²", "30 cm²"], correcta: 3, explicacion: "El área del triángulo es base por altura entre 2, es decir, 10 por 6 entre 2, que da 30 cm²." },
    { pregunta: "¿Cuál de estos números es el mayor?", opciones: ["0.45", "0.405", "0.5", "0.095"], correcta: 2, explicacion: "Al escribir todos con tres decimales, 0.500 es mayor que 0.450, 0.405 y 0.095." },
  ],
  Español: [
    { pregunta: "¿Cuál de estas palabras es esdrújula?", opciones: ["camión", "música", "árbol", "café"], correcta: 1, explicacion: "Música lleva la fuerza en la antepenúltima sílaba, y las esdrújulas siempre llevan tilde." },
    { pregunta: "¿Cuál de estas palabras es aguda?", opciones: ["mesa", "lápiz", "árbol", "reloj"], correcta: 3, explicacion: "Reloj lleva la fuerza de voz en la última sílaba." },
    { pregunta: "¿Cuál es el sustantivo en la oración El perro corre rápido?", opciones: ["corre", "rápido", "perro", "el"], correcta: 2, explicacion: "Perro nombra a un animal, por eso es el sustantivo." },
    { pregunta: "¿Qué tipo de palabra es hermosa en la frase La casa hermosa?", opciones: ["Sustantivo", "Verbo", "Adverbio", "Adjetivo"], correcta: 3, explicacion: "Hermosa dice cómo es la casa, así que es un adjetivo." },
    { pregunta: "¿Qué signo se usa para separar los elementos de una enumeración?", opciones: ["La coma", "El punto", "Los dos puntos", "Las comillas"], correcta: 0, explicacion: "La coma separa los elementos de una lista." },
    { pregunta: "¿Cuál palabra está escrita correctamente?", opciones: ["Invierno", "Imbierno", "Inbierno", "Imvierno"], correcta: 0, explicacion: "Invierno se escribe con n antes de v. La m se usa antes de b y p." },
    { pregunta: "¿Qué es la idea principal de un texto?", opciones: ["El dato más pequeño que menciona", "El título únicamente", "Lo más importante que se dice en el texto", "La última palabra del texto"], correcta: 2, explicacion: "La idea principal resume lo más importante que el autor quiere comunicar." },
    { pregunta: "¿Cuál de estas palabras es un verbo?", opciones: ["Cantar", "Ventana", "Azul", "Rápidamente"], correcta: 0, explicacion: "Cantar expresa una acción, por eso es un verbo en infinitivo." },
    { pregunta: "¿Qué signos se usan en español para abrir y cerrar una pregunta?", opciones: ["Solo el signo ?", "¿ y ?", "¡ y !", "- y -"], correcta: 1, explicacion: "En español las preguntas se abren con ¿ y se cierran con ?." },
    { pregunta: "¿Cuál es un sinónimo de rápido?", opciones: ["Lento", "Pesado", "Tranquilo", "Veloz"], correcta: 3, explicacion: "Veloz tiene un significado muy parecido a rápido." },
    { pregunta: "¿Cuál es el antónimo de generoso?", opciones: ["Amable", "Alegre", "Egoísta", "Valiente"], correcta: 2, explicacion: "Egoísta es lo contrario de generoso." },
    { pregunta: "¿Cuál de estas palabras es grave y lleva tilde?", opciones: ["Camión", "Árbol", "Sofá", "Corazón"], correcta: 1, explicacion: "Árbol lleva la fuerza en la penúltima sílaba y termina en l, por eso se acentúa. Las otras tres son agudas." },
    { pregunta: "En la oración María come manzanas, ¿cuál es el sujeto?", opciones: ["manzanas", "come", "María", "María come"], correcta: 2, explicacion: "El sujeto es quien realiza la acción, en este caso María." },
    { pregunta: "¿Qué signo marca una pausa mayor que la coma y menor que el punto?", opciones: ["La coma", "Los dos puntos", "El punto", "El punto y coma"], correcta: 3, explicacion: "El punto y coma marca una pausa intermedia entre la coma y el punto." },
    { pregunta: "¿Qué tipo de texto da instrucciones paso a paso, como una receta?", opciones: ["Instructivo", "Narrativo", "Argumentativo", "Poético"], correcta: 0, explicacion: "El texto instructivo explica cómo hacer algo siguiendo pasos ordenados." },
  ],
  Ciencias: [
    { pregunta: "¿Cómo se llama el cambio de líquido a gas?", opciones: ["Fusión", "Evaporación", "Condensación", "Solidificación"], correcta: 1, explicacion: "La evaporación es el paso de líquido a gas." },
    { pregunta: "¿Qué gas necesitan las plantas para la fotosíntesis?", opciones: ["Oxígeno", "Nitrógeno", "Dióxido de carbono", "Hidrógeno"], correcta: 2, explicacion: "Las plantas toman dióxido de carbono del aire para producir su alimento." },
    { pregunta: "¿Cuál es el planeta más cercano al Sol?", opciones: ["Venus", "Tierra", "Marte", "Mercurio"], correcta: 3, explicacion: "Mercurio es el primer planeta a partir del Sol." },
    { pregunta: "¿Cómo se llama el cambio de sólido a líquido?", opciones: ["Fusión", "Evaporación", "Sublimación", "Condensación"], correcta: 0, explicacion: "La fusión es el paso de sólido a líquido, como cuando se derrite el hielo." },
    { pregunta: "¿Qué órgano bombea la sangre en el cuerpo humano?", opciones: ["Pulmón", "Hígado", "Riñón", "Corazón"], correcta: 3, explicacion: "El corazón impulsa la sangre a todo el cuerpo." },
    { pregunta: "En una cadena alimenticia, ¿qué organismos producen su propio alimento?", opciones: ["Consumidores", "Descomponedores", "Productores", "Carnívoros"], correcta: 2, explicacion: "Los productores, como las plantas, fabrican su alimento con la luz del sol." },
    { pregunta: "¿Cuántos planetas tiene el sistema solar?", opciones: ["Ocho", "Siete", "Nueve", "Diez"], correcta: 0, explicacion: "El sistema solar tiene ocho planetas, de Mercurio a Neptuno." },
    { pregunta: "¿En qué parte de la célula vegetal ocurre la fotosíntesis?", opciones: ["Núcleo", "Mitocondrias", "Pared celular", "Cloroplastos"], correcta: 3, explicacion: "Los cloroplastos contienen clorofila, que captura la luz del sol." },
    { pregunta: "¿Qué gas necesitan los seres humanos para respirar?", opciones: ["Oxígeno", "Helio", "Dióxido de carbono", "Nitrógeno"], correcta: 0, explicacion: "Las células usan el oxígeno para obtener energía de los alimentos." },
    { pregunta: "¿A qué temperatura hierve el agua al nivel del mar?", opciones: ["50 °C", "80 °C", "100 °C", "120 °C"], correcta: 2, explicacion: "Al nivel del mar el agua hierve a 100 °C." },
    { pregunta: "¿Qué tipo de energía tiene un objeto en movimiento?", opciones: ["Cinética", "Potencial", "Química", "Nuclear"], correcta: 0, explicacion: "La energía cinética es la que tiene un cuerpo por estar en movimiento." },
    { pregunta: "¿Cuál de estos materiales conduce bien la electricidad?", opciones: ["Madera", "Plástico", "Cobre", "Vidrio"], correcta: 2, explicacion: "Los metales como el cobre son buenos conductores de electricidad." },
    { pregunta: "¿Qué movimiento de la Tierra produce el día y la noche?", opciones: ["Traslación", "Rotación", "Eclipse", "Fases lunares"], correcta: 1, explicacion: "La rotación es el giro de la Tierra sobre su propio eje, que dura unas 24 horas." },
    { pregunta: "¿Cómo se llaman los organismos que descomponen la materia muerta, como hongos y bacterias?", opciones: ["Productores", "Herbívoros", "Descomponedores", "Depredadores"], correcta: 2, explicacion: "Los descomponedores devuelven nutrientes al suelo al descomponer la materia muerta." },
    { pregunta: "¿Cuál es la unidad básica de los seres vivos?", opciones: ["El átomo", "La célula", "El órgano", "El tejido"], correcta: 1, explicacion: "Todos los seres vivos están formados por células." },
  ],
};

const diagnostico: PreguntaDiag[] = [
  { materia: "Matemáticas", pregunta: "¿Cuánto es 12 × 8?", opciones: ["96", "86", "108", "88"], correcta: 0 },
  { materia: "Matemáticas", pregunta: "Si 2x = 18, ¿cuánto vale x?", opciones: ["8", "36", "9", "16"], correcta: 2 },
  { materia: "Matemáticas", pregunta: "¿Cuánto es 15 × 6?", opciones: ["80", "90", "96", "100"], correcta: 1 },
  { materia: "Matemáticas", pregunta: "¿Cuánto es 3/4 − 1/4?", opciones: ["1/2", "1/4", "2/3", "3/8"], correcta: 0 },
  { materia: "Matemáticas", pregunta: "¿Cuánto es el 50% de 90?", opciones: ["35", "40", "45", "50"], correcta: 2 },
  { materia: "Matemáticas", pregunta: "Si x − 4 = 9, ¿cuánto vale x?", opciones: ["5", "13", "36", "11"], correcta: 1 },
  { materia: "Matemáticas", pregunta: "¿Cuál es el área de un cuadrado de 7 cm de lado?", opciones: ["14 cm²", "28 cm²", "49 cm²", "21 cm²"], correcta: 2 },
  { materia: "Matemáticas", pregunta: "¿Cuánto es 144 ÷ 12?", opciones: ["10", "11", "12", "14"], correcta: 2 },
  { materia: "Matemáticas", pregunta: "¿Cuánto es 0.5 + 0.25?", opciones: ["0.30", "0.75", "0.55", "0.80"], correcta: 1 },
  { materia: "Matemáticas", pregunta: "¿Cuál es el perímetro de un cuadrado de 9 m de lado?", opciones: ["18 m", "27 m", "81 m", "36 m"], correcta: 3 },
  { materia: "Español", pregunta: "¿Cuál de estas palabras es esdrújula?", opciones: ["camión", "música", "árbol", "café"], correcta: 1 },
  { materia: "Español", pregunta: "¿Cuál de estas palabras es aguda?", opciones: ["mesa", "reloj", "lápiz", "árbol"], correcta: 1 },
  { materia: "Español", pregunta: "¿Cuál de estas palabras es grave?", opciones: ["pared", "sofá", "mesa", "teléfono"], correcta: 2 },
  { materia: "Español", pregunta: "¿Cuál es el plural de lápiz?", opciones: ["lápizes", "lápices", "lápiz", "lápizs"], correcta: 1 },
  { materia: "Español", pregunta: "¿Qué tipo de palabra es rápidamente?", opciones: ["Adjetivo", "Sustantivo", "Adverbio", "Verbo"], correcta: 2 },
  { materia: "Español", pregunta: "¿Cuál palabra está escrita correctamente?", opciones: ["Exagerar", "Exajerar", "Esagerar", "Exsagerar"], correcta: 0 },
  { materia: "Español", pregunta: "¿Cuál es el antónimo de alto?", opciones: ["Grande", "Largo", "Bajo", "Ancho"], correcta: 2 },
  { materia: "Español", pregunta: "¿Cuál es un sinónimo de feliz?", opciones: ["Triste", "Enojado", "Cansado", "Contento"], correcta: 3 },
  { materia: "Español", pregunta: "¿Qué tipo de texto cuenta una historia con personajes y sucesos?", opciones: ["Narrativo", "Instructivo", "Informativo", "Argumentativo"], correcta: 0 },
  { materia: "Español", pregunta: "En la oración Los niños juegan en el parque, ¿cuál es el verbo?", opciones: ["niños", "juegan", "parque", "en"], correcta: 1 },
  { materia: "Ciencias", pregunta: "¿Cómo se llama el cambio de líquido a gas?", opciones: ["Fusión", "Evaporación", "Condensación", "Solidificación"], correcta: 1 },
  { materia: "Ciencias", pregunta: "¿Qué gas necesitan las plantas para la fotosíntesis?", opciones: ["Oxígeno", "Nitrógeno", "Dióxido de carbono", "Hidrógeno"], correcta: 2 },
  { materia: "Ciencias", pregunta: "¿Cuál es el planeta conocido como el planeta rojo?", opciones: ["Venus", "Júpiter", "Marte", "Saturno"], correcta: 2 },
  { materia: "Ciencias", pregunta: "¿Qué órganos usamos principalmente para respirar?", opciones: ["Estómago", "Pulmones", "Corazón", "Riñones"], correcta: 1 },
  { materia: "Ciencias", pregunta: "¿En qué estado de la materia se encuentra el vapor de agua?", opciones: ["Sólido", "Gaseoso", "Líquido", "Congelado"], correcta: 1 },
  { materia: "Ciencias", pregunta: "¿Qué astro es el centro del sistema solar?", opciones: ["La Luna", "La Tierra", "Júpiter", "El Sol"], correcta: 3 },
  { materia: "Ciencias", pregunta: "¿Cuál de estos animales es un mamífero?", opciones: ["Delfín", "Tiburón", "Salmón", "Cocodrilo"], correcta: 0 },
  { materia: "Ciencias", pregunta: "Además de luz y dióxido de carbono, ¿qué necesitan las plantas para la fotosíntesis?", opciones: ["Aceite", "Agua", "Arena", "Sal"], correcta: 1 },
  { materia: "Ciencias", pregunta: "¿Qué estado de la materia tiene forma y volumen definidos?", opciones: ["Líquido", "Gaseoso", "Sólido", "Vapor"], correcta: 2 },
  { materia: "Ciencias", pregunta: "¿Qué parte de la planta absorbe el agua del suelo?", opciones: ["Hoja", "Flor", "Tallo", "Raíz"], correcta: 3 },
];

const prohibidas = ["idiota", "estupido", "estúpido", "tonto", "imbecil", "imbécil"];

const moderar = (texto: string): string | null => {
  if (texto.trim().length < 5) return "Escribe un mensaje un poco más largo para poder ayudarte.";
  const t = texto.toLowerCase();
  if (prohibidas.some((p) => t.includes(p))) return "Tu mensaje contiene lenguaje no permitido en el foro.";
  return null;
};

const nivelDe = (aciertos: number): Nivel => {
  if (aciertos >= 8) return "Avanzado";
  if (aciertos >= 5) return "Intermedio";
  return "Básico";
};

const consejo: Record<Nivel, string> = {
  Básico: "Mira el video, lee el resumen y después resuelve los ejercicios.",
  Intermedio: "Repasa el resumen y practica con ejercicios.",
  Avanzado: "Refuerza con ejercicios y avanza al siguiente tema.",
};

const destino: Record<Nivel, { seccion: Seccion; texto: string }> = {
  Básico: { seccion: "videos", texto: "Ver videos" },
  Intermedio: { seccion: "resumenes", texto: "Ver resúmenes" },
  Avanzado: { seccion: "ejercicios", texto: "Ir a ejercicios" },
};

const formato = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const mensajeDe = (pct: number) => {
  if (pct >= 80) return "Excelente trabajo, dominas bien este tema.";
  if (pct >= 50) return "Vas bien. Revisa las preguntas que fallaste para reforzar.";
  return "Conviene repasar los resúmenes y videos de esta materia antes de intentarlo de nuevo.";
};

function IconoUsuario() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5z" />
    </svg>
  );
}

function IconoMenu() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function Banner({ materia, chico }: { materia: Materia; chico?: boolean }) {
  return (
    <div className={`banner ${tono[materia]}${chico ? " chico" : ""}`}>
      <span>{materia}</span>
    </div>
  );
}

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

function Pestanas({ materia, setMateria }: { materia: Materia; setMateria: (m: Materia) => void }) {
  return (
    <div className="pestanas">
      {materias.map((m) => (
        <button key={m} className={m === materia ? "pestana activa" : "pestana"} onClick={() => setMateria(m)}>{m}</button>
      ))}
    </div>
  );
}

function Inicio({ ir, abrirMateria, articulos }: { ir: (s: Seccion) => void; abrirMateria: (m: Materia) => void; articulos: Articulos }) {
  return (
    <section>
      <div className="portada">
        <h1>Regulariza tus materias a tu ritmo</h1>
        <p>Videos, resúmenes, ejercicios y un diagnóstico para saber por dónde empezar en matemáticas, español y ciencias.</p>
        <button className="principal" onClick={() => ir("diagnostico")}>Hacer mi diagnóstico</button>
      </div>

      <h2>Materias</h2>
      <div className="rejilla">
        {materias.map((m) => (
          <div className="tarjeta materia" key={m}>
            <Banner materia={m} />
            <div className="info">
              <h3>{m}</h3>
              <p className="stats">
                {videos.filter((v) => v.materia === m).length} videos · {articulos[m].length} resúmenes · {banco[m].length} ejercicios
              </p>
              <button className="secundario" onClick={() => abrirMateria(m)}>Iniciar</button>
            </div>
          </div>
        ))}
      </div>

      <h2>Herramientas de estudio</h2>
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

function Videos({ materia, setMateria }: { materia: Materia; setMateria: (m: Materia) => void }) {
  const lista = videos.filter((v) => v.materia === materia);
  return (
    <section>
      <h2>Videos por materia</h2>
      <p className="sub">Explicaciones cortas para reforzar lo que no entendiste en clase.</p>
      <Pestanas materia={materia} setMateria={setMateria} />
      <div className="rejilla">
        {lista.map((v) => (
          <div className="tarjeta materia" key={v.titulo}>
            <Banner materia={v.materia} chico />
            <div className="info">
              <h3>{v.titulo}</h3>
              {v.url ? (
                <iframe className="video" src={v.url} title={v.titulo} allowFullScreen />
              ) : (
                <div className="video vacio">Video próximamente</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Resumenes({
  materia,
  setMateria,
  articulos,
  setArticulos,
}: {
  materia: Materia;
  setMateria: (m: Materia) => void;
  articulos: Articulos;
  setArticulos: (a: Articulos) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState("");
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);

  const pedirPublicar = () => {
    if (titulo.trim().length < 5 || texto.trim().length < 20) {
      setAviso("Escribe un título de al menos 5 caracteres y un texto de al menos 20.");
      return;
    }
    setAviso("");
    setPendiente({ tipo: "publicar" });
  };

  const confirmar = () => {
    if (!pendiente) return;
    if (pendiente.tipo === "publicar") {
      const nuevo: Articulo = { titulo: titulo.trim(), parrafos: texto.trim().split(/\n+/) };
      setArticulos({ ...articulos, [materia]: [...articulos[materia], nuevo] });
      setTitulo("");
      setTexto("");
    } else {
      setArticulos({ ...articulos, [materia]: articulos[materia].filter((_, i) => i !== pendiente.indice) });
    }
    setPendiente(null);
  };

  const nombreBaja = pendiente && pendiente.tipo === "baja" ? articulos[materia][pendiente.indice]?.titulo : "";

  return (
    <section>
      <h2>Resúmenes de apoyo</h2>
      <p className="sub">Repasa la teoría de cada tema antes de practicar.</p>
      <Pestanas materia={materia} setMateria={setMateria} />

      {articulos[materia].length === 0 && <p className="sub">No hay artículos publicados en esta materia.</p>}

      {articulos[materia].map((r, i) => (
        <div className={`tarjeta resumen ${tono[materia]}`} key={`${r.titulo}-${i}`}>
          <h3>{r.titulo}</h3>
          {r.parrafos.map((p, k) => (
            <p key={k}>{p}</p>
          ))}
          <button className="peligro" onClick={() => setPendiente({ tipo: "baja", indice: i })}>Dar de baja</button>
        </div>
      ))}

      <div className="tarjeta">
        <h3>Publicar un artículo en {materia}</h3>
        <div className="fila">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título del artículo" />
        </div>
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe el contenido del artículo" rows={4} />
        {aviso && <p className="mal">{aviso}</p>}
        <button className="principal" onClick={pedirPublicar}>Publicar artículo</button>
      </div>

      {pendiente && (
        <div className="modal-fondo">
          <div className="modal">
            <h3>{pendiente.tipo === "publicar" ? "¿Publicar artículo?" : "¿Dar de baja el artículo?"}</h3>
            <p>
              {pendiente.tipo === "publicar"
                ? `Vas a publicar el artículo "${titulo.trim()}" en ${materia}. Quedará visible para los estudiantes.`
                : `Vas a dar de baja el artículo "${nombreBaja}". Dejará de mostrarse en el sitio.`}
            </p>
            <div className="acciones">
              <button className="principal" onClick={confirmar}>
                {pendiente.tipo === "publicar" ? "Sí, publicar" : "Sí, dar de baja"}
              </button>
              <button className="secundario" onClick={() => setPendiente(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Ejercicios({ resultados, guardar }: { resultados: ResultadosEj; guardar: (m: Materia, n: number) => void }) {
  const [fase, setFase] = useState<Fase>("elegir");
  const [materia, setMateria] = useState<Materia>("Matemáticas");
  const [elegidas, setElegidas] = useState<Record<number, number>>({});
  const [fin, setFin] = useState(0);
  const [restante, setRestante] = useState(TIEMPO_MIN * 60);
  const [confirmando, setConfirmando] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const actual = useRef({ elegidas, materia });
  actual.current = { elegidas, materia };

  const preguntas = banco[materia];
  const total = preguntas.length;
  const contestadas = Object.keys(elegidas).length;

  const enviar = () => {
    const { elegidas: e, materia: m } = actual.current;
    const n = banco[m].filter((p, i) => e[i] === p.correcta).length;
    setAciertos(n);
    guardar(m, n);
    setConfirmando(false);
    setFase("resultado");
  };

  useEffect(() => {
    if (fase !== "examen") return;
    const id = window.setInterval(() => {
      const falta = Math.max(0, Math.ceil((fin - Date.now()) / 1000));
      setRestante(falta);
      if (falta === 0) {
        window.clearInterval(id);
        enviar();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [fase, fin]);

  const elegirMateria = (m: Materia) => {
    setMateria(m);
    setFase("aviso");
  };

  const comenzar = () => {
    setElegidas({});
    setRestante(TIEMPO_MIN * 60);
    setFin(Date.now() + TIEMPO_MIN * 60 * 1000);
    setFase("examen");
    window.scrollTo(0, 0);
  };

  const irA = (i: number) => {
    document.getElementById(`pregunta-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (fase === "elegir") {
    return (
      <section>
        <h2>Ejercicios</h2>
        <p className="sub">Elige una materia para presentar sus ejercicios.</p>
        <div className="rejilla">
          {materias.map((m) => (
            <div className="tarjeta materia" key={m}>
              <Banner materia={m} />
              <div className="info">
                <h3>{m}</h3>
                <p className="stats">{banco[m].length} ejercicios · {TIEMPO_MIN} minutos</p>
                {resultados[m] !== null && (
                  <p className="stats">Último intento: {resultados[m]} de {banco[m].length}</p>
                )}
                <button className="secundario" onClick={() => elegirMateria(m)}>Comenzar</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (fase === "aviso") {
    return (
      <section>
        <h2>Ejercicios de {materia}</h2>
        <div className="tarjeta aviso">
          <h3>Antes de comenzar</h3>
          <p>Vas a presentar {total} ejercicios de {materia}. Dispones de {TIEMPO_MIN} minutos para contestarlos y el tiempo empezará a correr en cuanto confirmes.</p>
          <p>Podrás cambiar tus respuestas antes de enviar. Si el tiempo se termina, tus respuestas se enviarán automáticamente.</p>
          <p className="pregunta">¿Estás seguro de que quieres comenzar?</p>
          <div className="acciones">
            <button className="principal" onClick={comenzar}>Sí, comenzar</button>
            <button className="secundario" onClick={() => setFase("elegir")}>Cancelar</button>
          </div>
        </div>
      </section>
    );
  }

  if (fase === "examen") {
    return (
      <section>
        <h2>Ejercicios de {materia}</h2>
        <div className="examen">
          <div>
            {preguntas.map((p, i) => (
              <div className="tarjeta" key={i} id={`pregunta-${i}`}>
                <p className="pregunta">{i + 1}. {p.pregunta}</p>
                <div className="opciones">
                  {p.opciones.map((op, j) => (
                    <button
                      key={j}
                      className={elegidas[i] === j ? "opcion elegida" : "opcion"}
                      onClick={() => setElegidas({ ...elegidas, [i]: j })}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <aside className="panel-examen">
            <p className="panel-titulo">Tiempo restante</p>
            <p className={restante <= 60 ? "reloj urgente" : "reloj"}>{formato(restante)}</p>
            <p className="panel-titulo">Contestadas: {contestadas} de {total}</p>
            <div className="numeros">
              {preguntas.map((_, i) => (
                <button key={i} className={elegidas[i] !== undefined ? "numero hecha" : "numero"} onClick={() => irA(i)}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button className="principal enviar" onClick={() => setConfirmando(true)}>Enviar ejercicios</button>
          </aside>
        </div>

        {confirmando && (
          <div className="modal-fondo">
            <div className="modal">
              <h3>¿Enviar ejercicios?</h3>
              <p>
                {contestadas < total
                  ? `Te faltan ${total - contestadas} preguntas por contestar y contarán como incorrectas si envías ahora.`
                  : "Ya contestaste todas las preguntas. Una vez enviados no podrás cambiar tus respuestas."}
              </p>
              <div className="acciones">
                <button
                  className="principal"
                  onClick={() => {
                    enviar();
                    window.scrollTo(0, 0);
                  }}
                >
                  Sí, enviar
                </button>
                <button className="secundario" onClick={() => setConfirmando(false)}>Seguir contestando</button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  const pct = Math.round((aciertos / total) * 100);
  return (
    <section>
      <h2>Resultado de {materia}</h2>
      <div className="tarjeta materia">
        <Banner materia={materia} chico />
        <div className="info">
          <p className="puntaje">{aciertos} de {total}</p>
          <p className="stats">aciertos ({pct}%)</p>
          <p>{mensajeDe(pct)}</p>
          <div className="acciones">
            <button className="principal" onClick={() => setFase("aviso")}>Intentar de nuevo</button>
            <button className="secundario" onClick={() => setFase("elegir")}>Elegir otra materia</button>
          </div>
        </div>
      </div>

      <h3>Revisión de respuestas</h3>
      {preguntas.map((p, i) => {
        const elegida = elegidas[i];
        const acerto = elegida === p.correcta;
        return (
          <div className="tarjeta" key={i}>
            <p className="pregunta">{i + 1}. {p.pregunta}</p>
            <div className="opciones">
              {p.opciones.map((op, j) => (
                <button
                  key={j}
                  disabled
                  className={j === p.correcta ? "opcion buena" : j === elegida ? "opcion mala" : "opcion"}
                >
                  {op}
                </button>
              ))}
            </div>
            <p className={acerto ? "ok" : "mal"}>
              {elegida === undefined ? "Sin contestar. " : acerto ? "Correcto. " : "Incorrecto. "}
              {p.explicacion}
            </p>
          </div>
        );
      })}
    </section>
  );
}

function Diagnostico({ diag, setDiag }: { diag: Resultado | null; setDiag: (r: Resultado | null) => void }) {
  const [fase, setFase] = useState<Fase>("aviso");
  const [elegidas, setElegidas] = useState<Record<number, number>>({});
  const [fin, setFin] = useState(0);
  const [restante, setRestante] = useState(TIEMPO_DIAG_MIN * 60);
  const [confirmando, setConfirmando] = useState(false);
  const actual = useRef(elegidas);
  actual.current = elegidas;

  const total = diagnostico.length;
  const contestadas = Object.keys(elegidas).length;

  const enviar = () => {
    const e = actual.current;
    const r: Resultado = { Matemáticas: 0, Español: 0, Ciencias: 0 };
    diagnostico.forEach((p, i) => {
      if (e[i] === p.correcta) r[p.materia] += 1;
    });
    setDiag(r);
    setConfirmando(false);
    setFase("resultado");
  };

  useEffect(() => {
    if (fase !== "examen") return;
    const id = window.setInterval(() => {
      const falta = Math.max(0, Math.ceil((fin - Date.now()) / 1000));
      setRestante(falta);
      if (falta === 0) {
        window.clearInterval(id);
        enviar();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [fase, fin]);

  const comenzar = () => {
    setElegidas({});
    setRestante(TIEMPO_DIAG_MIN * 60);
    setFin(Date.now() + TIEMPO_DIAG_MIN * 60 * 1000);
    setFase("examen");
    window.scrollTo(0, 0);
  };

  const reiniciar = () => {
    setElegidas({});
    setDiag(null);
    setFase("aviso");
  };

  const irA = (i: number) => {
    document.getElementById(`diag-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (fase === "resultado" && diag) {
    return (
      <section>
        <h2>Resultado del diagnóstico</h2>
        <div className="rejilla">
          {materias.map((m) => (
            <div className="tarjeta materia" key={m}>
              <Banner materia={m} chico />
              <div className="info">
                <h3>{nivelDe(diag[m])}</h3>
                <p>{diag[m]} de {PREG_POR_MATERIA} respuestas correctas</p>
              </div>
            </div>
          ))}
        </div>
        <button className="secundario" onClick={reiniciar}>Volver a contestar</button>
      </section>
    );
  }

  if (fase === "aviso") {
    return (
      <section>
        <h2>Examen diagnóstico</h2>
        <div className="tarjeta aviso">
          <h3>Antes de comenzar</h3>
          <p>Vas a presentar {total} preguntas, {PREG_POR_MATERIA} por materia, para calcular tu nivel en matemáticas, español y ciencias. Dispones de {TIEMPO_DIAG_MIN} minutos para contestarlas y el tiempo empezará a correr en cuanto confirmes.</p>
          <p>Podrás cambiar tus respuestas antes de enviar. Si el tiempo se termina, tus respuestas se enviarán automáticamente.</p>
          <p className="pregunta">¿Estás seguro de que quieres comenzar?</p>
          <div className="acciones">
            <button className="principal" onClick={comenzar}>Sí, comenzar</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2>Examen diagnóstico</h2>
      <div className="examen">
        <div>
          {diagnostico.map((p, i) => (
            <div className="tarjeta" key={i} id={`diag-${i}`}>
              <span className="etiqueta">{p.materia}</span>
              <p className="pregunta">{i + 1}. {p.pregunta}</p>
              <div className="opciones">
                {p.opciones.map((op, j) => (
                  <button
                    key={j}
                    className={elegidas[i] === j ? "opcion elegida" : "opcion"}
                    onClick={() => setElegidas({ ...elegidas, [i]: j })}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <aside className="panel-examen">
          <p className="panel-titulo">Tiempo restante</p>
          <p className={restante <= 60 ? "reloj urgente" : "reloj"}>{formato(restante)}</p>
          <p className="panel-titulo">Contestadas: {contestadas} de {total}</p>
          <div className="numeros">
            {diagnostico.map((_, i) => (
              <button key={i} className={elegidas[i] !== undefined ? "numero hecha" : "numero"} onClick={() => irA(i)}>
                {i + 1}
              </button>
            ))}
          </div>
          <button className="principal enviar" onClick={() => setConfirmando(true)}>Enviar diagnóstico</button>
        </aside>
      </div>

      {confirmando && (
        <div className="modal-fondo">
          <div className="modal">
            <h3>¿Enviar diagnóstico?</h3>
            <p>
              {contestadas < total
                ? `Te faltan ${total - contestadas} preguntas por contestar y contarán como incorrectas si envías ahora.`
                : "Ya contestaste todas las preguntas. Una vez enviadas no podrás cambiar tus respuestas."}
            </p>
            <div className="acciones">
              <button
                className="principal"
                onClick={() => {
                  enviar();
                  window.scrollTo(0, 0);
                }}
              >
                Sí, enviar
              </button>
              <button className="secundario" onClick={() => setConfirmando(false)}>Seguir contestando</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Avance({ resultados, diag }: { resultados: ResultadosEj; diag: Resultado | null }) {
  const totalDiag = diag ? materias.reduce((suma, m) => suma + diag[m], 0) : 0;
  const presentados = materias.filter((m) => resultados[m] !== null).length;

  return (
    <div>
      <h2>Mi avance</h2>
      <p className="sub">Resumen para que la familia vea cómo va el estudiante en cada materia.</p>

      <div className="tarjeta destacada">
        <h3>Resumen general</h3>
        {diag ? (
          <Barra etiqueta="Diagnóstico (todas las materias)" valor={totalDiag} total={diagnostico.length} />
        ) : (
          <p>Aún no se ha contestado el examen diagnóstico.</p>
        )}
        <Barra etiqueta="Materias con ejercicios presentados" valor={presentados} total={materias.length} />
      </div>

      <div className="rejilla">
        {materias.map((m) => (
          <div className="tarjeta materia" key={m}>
            <Banner materia={m} chico />
            <div className="info">
              {diag ? (
                <>
                  <h3>Nivel {nivelDe(diag[m])}</h3>
                  <Barra etiqueta="Diagnóstico" valor={diag[m]} total={PREG_POR_MATERIA} />
                </>
              ) : (
                <p>Sin diagnóstico todavía.</p>
              )}
              {resultados[m] !== null ? (
                <Barra etiqueta="Ejercicios (último intento)" valor={resultados[m] as number} total={banco[m].length} />
              ) : (
                <p className="sub">Aún no se han presentado los ejercicios.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
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
      <div>
        <h2>Mi plan de estudio</h2>
        <div className="tarjeta">
          <p>Para generar tu plan primero necesitas contestar el examen diagnóstico.</p>
          <button className="principal" onClick={() => ir("diagnostico")}>Ir al diagnóstico</button>
        </div>
      </div>
    );
  }
  const orden = [...materias].sort((a, b) => diag[a] - diag[b]);
  const primera = orden[0];
  const video = videos.find((v) => v.materia === primera);
  return (
    <div>
      <h2>Mi plan de estudio</h2>
      <div className="tarjeta destacada">
        <h3>Video recomendado para empezar</h3>
        <p>Según tu diagnóstico, conviene comenzar con el video de {primera}{video ? ` titulado ${video.titulo}` : ""}.</p>
        <button className="principal" onClick={() => ir("videos")}>Ver videos</button>
      </div>
      <div className="rejilla">
        {orden.map((m) => {
          const nivel = nivelDe(diag[m]);
          return (
            <div className="tarjeta materia" key={m}>
              <Banner materia={m} chico />
              <div className="info">
                <h3>Nivel {nivel}</h3>
                <p>{consejo[nivel]}</p>
                <button className="secundario" onClick={() => ir(destino[nivel].seccion)}>
                  {destino[nivel].texto}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Panel({ resultados, diag, ir }: { resultados: ResultadosEj; diag: Resultado | null; ir: (s: Seccion) => void }) {
  return (
    <section>
      <div className="portada">
        <h1>Bienvenido, alumno/a</h1>
        <p>Aquí puedes ver tu avance en cada materia y el plan de estudio que te recomendamos.</p>
      </div>
      <Avance resultados={resultados} diag={diag} />
      <Plan diag={diag} ir={ir} />
    </section>
  );
}

export default function App() {
  const [seccion, setSeccion] = useState<Seccion>("inicio");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [materiaSel, setMateriaSel] = useState<Materia>("Matemáticas");
  const [resultadosEj, setResultadosEj] = useState<ResultadosEj>({ Matemáticas: null, Español: null, Ciencias: null });
  const [diag, setDiag] = useState<Resultado | null>(null);
  const [articulos, setArticulos] = useState<Articulos>(resumenes);
  const [posts, setPosts] = useState<Publicacion[]>([
    { id: 1, materia: "Matemáticas", rol: "Tutor", texto: "Bienvenidos al foro. Publiquen aquí sus dudas de cada materia.", respuestas: [] },
  ]);

  const guardarResultado = (m: Materia, n: number) => setResultadosEj((r) => ({ ...r, [m]: n }));

  const ir = (s: Seccion) => {
    setSeccion(s);
    setMenuAbierto(false);
    window.scrollTo(0, 0);
  };

  const abrirMateria = (m: Materia) => {
    setMateriaSel(m);
    ir("resumenes");
  };

  return (
    <div className="app">
      <header className="barra">
        <button className="hamburguesa" aria-label="Abrir menú" onClick={() => setMenuAbierto(!menuAbierto)}>
          <IconoMenu />
        </button>
        <button className="logo" onClick={() => ir("inicio")}>Regularización Escolar</button>
        <button className={seccion === "panel" ? "usuario activo" : "usuario"} aria-label="Mi panel" onClick={() => ir("panel")}>
          <IconoUsuario />
        </button>
      </header>
      <div className="cuerpo">
        <aside className={menuAbierto ? "lateral abierto" : "lateral"}>
          <nav>
            {menu.map((s) => (
              <button key={s.id} className={seccion === s.id ? "item activo" : "item"} onClick={() => ir(s.id)}>
                {s.nombre}
              </button>
            ))}
          </nav>
        </aside>
        {menuAbierto && <div className="velo" onClick={() => setMenuAbierto(false)} />}
        <main>
          {seccion === "inicio" && <Inicio ir={ir} abrirMateria={abrirMateria} articulos={articulos} />}
          {seccion === "videos" && <Videos materia={materiaSel} setMateria={setMateriaSel} />}
          {seccion === "resumenes" && <Resumenes materia={materiaSel} setMateria={setMateriaSel} articulos={articulos} setArticulos={setArticulos} />}
          <div style={{ display: seccion === "ejercicios" ? "block" : "none" }}>
            <Ejercicios resultados={resultadosEj} guardar={guardarResultado} />
          </div>
          <div style={{ display: seccion === "diagnostico" ? "block" : "none" }}>
            <Diagnostico diag={diag} setDiag={setDiag} />
          </div>
          {seccion === "foro" && <Foro posts={posts} setPosts={setPosts} />}
          {seccion === "panel" && <Panel resultados={resultadosEj} diag={diag} ir={ir} />}
        </main>
      </div>
      <footer className="pie">
        <p>Sitio Web Educativo de Regularización Escolar</p>
        <p>Prototipo académico del Proyecto II, Universidad de Guadalajara, 2026</p>
      </footer>
    </div>
  );
}