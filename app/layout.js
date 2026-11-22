import './style.css';
export const metadata = { title: 'Regalos familiares', description: 'Nuestros deseos y regalos' };
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#23232B' };
export default function Layout({ children }) {
  return <html lang="es"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800;900&display=swap" rel="stylesheet" />
  </head><body>{children}</body></html>;
}
