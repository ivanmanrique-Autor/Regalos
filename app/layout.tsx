import type { Metadata } from 'next';
import './styles.css';
export const metadata: Metadata = { title: 'Regalos en familia', description: 'Organiza regalos, celebraciones y gastos familiares.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="es"><body>{children}</body></html>; }
