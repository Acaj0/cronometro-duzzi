import type React from "react"
import "./globals.css"

export const metadata = {
  title: "Monitoramento de Tempo para Montagem de Pedidos",
  description: "Acompanhe o tempo de montagem de pedidos pela equipe",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
          {children}
      </body>
    </html>
  )
}



import './globals.css'