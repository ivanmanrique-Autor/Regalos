# Regalos familiares

Aplicación móvil con cuatro pantallas: añadir o editar deseos, ver regalos, agruparlos por persona y consultar gastos. Los datos se guardan en Google Sheets. Los gastos muestran los regalos comprados y se pueden filtrar por comprador y destinatario. Los registros antiguos «Idea» se muestran como «Deseo sin asignar» y «Entregado» como «Comprado».

## 1. Preparar Google Sheets y Apps Script

1. Abre tu hoja de Google Sheets. La aplicación creará una pestaña nueva llamada **RegalosApp**; las demás pestañas no se modifican. Si ya existe una pestaña con ese nombre y otras cabeceras, renómbrala primero. No se importan datos automáticamente de otras pestañas.
2. En la hoja, abre **Extensiones → Apps Script**. Sustituye el contenido de `Code.gs` por el archivo `apps-script/Code.gs` incluido en el ZIP y guarda. Si ya usas ese proyecto de Apps Script para otra cosa, crea otra hoja para esta aplicación o conserva una copia de su código antes de sustituirlo.
3. Selecciona **Implementar → Nueva implementación → Aplicación web**. En «Ejecutar como», elige **Yo**; en acceso, elige **Cualquier usuario**. Autoriza los permisos solicitados para tu hoja. Copia la URL de la aplicación web, que termina en `/exec` (no la URL de prueba `/dev`).
4. Cuando cambies el código de Apps Script, guarda y actualiza la implementación: **Implementar → Gestionar implementaciones → Editar → Nueva versión → Implementar**. Mantén la URL `/exec`.

## 2. Subir los archivos a GitHub

1. Descomprime el ZIP. Abre el repositorio `ivanmanrique-Autor/Regalos` en GitHub.
2. En **Add file → Upload files**, arrastra el contenido del ZIP conservando sus carpetas. Sube los archivos a la raíz del repositorio, no a una carpeta adicional. Confirma con **Commit changes**.
3. El ZIP no contiene `README.md`, así que tu README existente se conserva. Tampoco contiene ninguna clave ni URL privada.

## 3. Publicar en Vercel

1. En Vercel, importa el repositorio `Regalos`. El framework detectado debe ser Next.js.
2. Antes de desplegar, añade la variable de entorno **APPS_SCRIPT_URL** con la URL `/exec` copiada en el paso 1. Despliega el proyecto.
3. Si añades o cambias la variable después del despliegue, vuelve a desplegar desde Vercel. Abre la aplicación y prueba a guardar, editar y borrar un regalo; comprueba que aparece en la pestaña `RegalosApp` de la hoja.

## Probar en tu ordenador (opcional)

Necesitas Node.js 18.18 o posterior (se recomienda una versión LTS reciente). Copia `.env.example` como `.env.local`, sustituye el valor por tu URL `/exec` y ejecuta `npm install` y `npm run dev`. Abre http://localhost:3000. No subas `.env.local` a GitHub.

## Acceso y solución de problemas

La aplicación no tiene usuarios ni contraseña, como se acordó. Quien conozca la dirección pública de la aplicación puede leer y modificar los regalos; la URL de Apps Script también permite hacerlo directamente a quien la conozca. No guardes información sensible. La variable se mantiene en el servidor, pero no convierte el servicio en privado.

Si aparece un error de conexión, revisa que la URL sea la de la implementación `/exec`, que el acceso sea «Cualquier usuario» y que hayas autorizado Apps Script. Tras cambiar código, crea una nueva versión de la implementación. Si Vercel muestra que falta la variable, añádela y vuelve a desplegar. Para datos con ceros a la izquierda o formatos especiales, introduce esos valores como texto.

## Actualizar esta versión

Copia el contenido actualizado de `apps-script/Code.gs` en el proyecto de Apps Script existente y crea una nueva versión de su implementación web (paso 1.4). La aplicación conserva los regalos existentes, añade una columna `comprador` a `RegalosApp` y crea la pestaña `RegalosConfig` para compartir la pantalla de inicio. No cambia las demás pestañas. Sin actualizar la implementación, las funciones nuevas no podrán guardarse.


## Destinatarios y cambios de esta versión

La pestaña existente `Personas` proporciona los destinatarios desde la columna A, a partir de la fila 2. La columna A debe tener la cabecera `Nombre`. Las compras se muestran al instante y se guardan en segundo plano; espera al mensaje «Cambios guardados» antes de cerrar la aplicación. Al eliminar se conserva la fila en `RegalosApp` con estado `Eliminado`, y deja de mostrarse en la aplicación. Hay que actualizar y publicar una nueva versión de `apps-script/Code.gs` como se explica en el paso 1.4.
