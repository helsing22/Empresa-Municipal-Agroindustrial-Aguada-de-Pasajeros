import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Granja de Aguada | Productos Agrícolas y Ganaderos - Cienfuegos, Cuba",
  description:
    "La mayor granja de Aguada, Cienfuegos. Compre productos agrícolas frescos, lácteos, carnes e insumos directamente de la granja. Entrega local y atención personalizada.",
  keywords: [
    "granja Aguada",
    "Cienfuegos",
    "Cuba",
    "productos agrícolas",
    "ganadería",
    "frutas frescas",
    "verduras",
    "leche fresca",
    "huevos de granja",
    "comprar online Cuba",
  ],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Granja de Aguada | Productos Frescos de Cienfuegos",
    description: "Compre productos agrícolas y ganaderos directamente de la granja más grande de Aguada, Cienfuegos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body style={{margin:0}}>{children}</body>
    </html>
  );
}
