import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, runTransaction } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";

const app = initializeApp({
  apiKey: "AIzaSyACUyBIzpEegzi82S1ANoeVI4vqSCRF1gA",
  authDomain: "regularizacion-escolar.firebaseapp.com",
  projectId: "regularizacion-escolar",
  storageBucket: "regularizacion-escolar.firebasestorage.app",
  messagingSenderId: "1062377604658",
  appId: "1:1062377604658:web:f46f4111b3a9252cabde2b",
});

const bd = getFirestore(app);

export type Estado = "cargando" | "listo" | "error";
type Cambio<T> = T | ((previo: T) => T);

const leerDoc = <T,>(datos: { json?: string } | undefined, defecto: T): T => {
  if (!datos || typeof datos.json !== "string") return defecto;
  try {
    return JSON.parse(datos.json) as T;
  } catch {
    return defecto;
  }
};

export function useNube<T>(clave: string, defecto: T): [T, (cambio: Cambio<T>) => void, Estado] {
  const [valor, setValor] = useState<T>(defecto);
  const [estado, setEstado] = useState<Estado>("cargando");
  const base = useRef(defecto);

  useEffect(() => {
    const ref = doc(bd, "rr", clave);
    return onSnapshot(
      ref,
      (snap) => {
        setValor(snap.exists() ? leerDoc<T>(snap.data() as { json?: string }, base.current) : base.current);
        setEstado("listo");
      },
      (error) => {
        console.error(error);
        setEstado("error");
      }
    );
  }, [clave]);

  const cambiar = useCallback(
    (cambio: Cambio<T>) => {
      const ref = doc(bd, "rr", clave);
      if (typeof cambio === "function") {
        const f = cambio as (previo: T) => T;
        runTransaction(bd, async (tx) => {
          const snap = await tx.get(ref);
          const previo = snap.exists() ? leerDoc<T>(snap.data() as { json?: string }, base.current) : base.current;
          tx.set(ref, { json: JSON.stringify(f(previo)) });
        }).catch((e) => console.error(e));
      } else {
        setValor(cambio);
        setDoc(ref, { json: JSON.stringify(cambio) }).catch((e) => console.error(e));
      }
    },
    [clave]
  );

  return [valor, cambiar, estado];
}