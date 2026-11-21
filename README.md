# Regalos en familia

Aplicación web con Next.js para organizar regalos familiares usando la hoja de Google Sheets como almacenamiento.

## Preparar Google Sheets

1. Abre la hoja compartida: https://docs.google.com/spreadsheets/d/120XsAhnaWCw7sX1Ib90rVSCis8i7bAvHocKm3YOJtVk/edit
2. En **Extensiones → Apps Script**, pega el contenido de `apps-script/Code.gs` y guarda.
3. En **Implementar → Nueva implementación**, elige **Aplicación web**. Ejecutar como tu cuenta. Restringe el acceso a los usuarios que usarán la app según las opciones disponibles para tu cuenta.
4. Copia la URL terminada en `/exec`.

La API espera los encabezados estándar de las hojas `Regalos`, `Personas` y `Celebraciones` del libro. Lee catálogos y permite crear/editar regalos. No ofrece una acción para borrar filas. El acceso de la web a la API depende de la configuración de acceso de la implementación Apps Script.

## Ejecutar

Configura `NEXT_PUBLIC_SHEETS_API` con la URL `/exec` de Apps Script y ejecuta `npm install`, `npm run dev`. Para Vercel, importa el repositorio GitHub y define esa misma variable en Project Settings → Environment Variables antes del despliegue.

La hoja `Gastos` no es fuente de edición: los gastos se calculan a partir de los registros de Regalos. La navegación incluye Inicio, Regalos, Gastos, Personas y Celebraciones.
