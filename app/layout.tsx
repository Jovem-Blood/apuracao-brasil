import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Apuração Brasil · Eleições 2026',description:'Acompanhe a apuração presidencial de 2026 em um mapa interativo dos estados, com dados oficiais do TSE.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}</body></html>}
