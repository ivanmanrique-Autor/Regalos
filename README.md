# Regalos en familia

Aplicación web Next.js para organizar regalos usando Google Sheets como almacenamiento.

## Conexión con Google Sheets

1. Abre la hoja: https://docs.google.com/spreadsheets/d/120XsAhnaWCw7sX1Ib90rVSCis8i7bAvHocKm3YOJtVk/edit
2. En **Extensiones → Apps Script**, pega y guarda `apps-script/Code.gs`.
3. En **Implementar → Nueva implementación → Aplicación web**, ejecútala como tu cuenta y elige el acceso permitido para las personas que usarán la app. Copia la URL `/exec`.
4. Añade esa URL en Vercel como variable **SHEETS_API_URL**, con tipo **Secret** y entorno Production (y Preview si lo usarás allí). No uses `NEXT_PUBLIC_`: la dirección debe permanecer en el servidor. Si guardaste la variable con el nombre público anterior, elimínala y rota la URL de implementación si consideras que quedó expuesta.

El Apps Script lee las hojas Regalos, Personas y Celebraciones, y permite guardar regalos nuevos o editados. No ofrece una acción para borrar filas. La hoja Gastos se calcula en la app a partir de los registros.

## Ejecutar localmente

Crea `.env.local` con `SHEETS_API_URL=https://script.google.com/macros/s/ID/exec`, luego ejecuta `npm install` y `npm run dev`.

En Vercel, importa el repositorio GitHub. El secreto se usa desde la ruta de servidor `/api/regalos`; el navegador solo se comunica con esa ruta.
