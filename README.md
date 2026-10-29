# Sitio Web Educativo de Regularización Escolar
Prototipo académico del Proyecto II (Licenciatura en Desarrollo de Sistemas Web, CUCEI, Universidad de Guadalajara, 2026).
Autora: Hazel Guadalupe Estrada Araiza. Asesor: Jose Martin Valencia Villalvazo.

## Qué hace
Sitio para practicar matemáticas, español y ciencias: videos de YouTube, resúmenes, ejercicios con cronómetro, examen diagnóstico, guías en PDF, foro de dudas con tutor, plan personalizado, paneles de avance y notificaciones.

## Roles
- Administrador: crea y elimina cuentas y publica o da de baja artículos.
- Docente: responde dudas, publica avisos y revisa el avance.
- Alumno: estudia, practica y consulta su plan.
- Familia: ve el avance de su alumno y escribe dudas.

## Tecnologías
React, TypeScript y Vite.

## Cómo ejecutarlo
npm install
npm run dev

## Estructura (carpeta src)
- App.tsx: secciones y lógica del sitio.
- Cuentas.tsx: gestión de cuentas y panel del administrador.
- almacen.ts: guardado local y contraseñas con hash.
- App.css: estilos y diseño adaptable.

## Limitaciones
Sin base de datos compartida: los datos se guardan en el navegador. Los videos dependen de YouTube.