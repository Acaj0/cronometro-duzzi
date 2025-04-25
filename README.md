# Cronômetro Duzzi

Aplicação de cronômetro personalizada desenvolvida com Electron, Next.js, Tailwind CSS e TypeScript.

## Tecnologias

- [Electron](https://www.electronjs.org/) - Aplicativo desktop multiplataforma
- [Next.js](https://nextjs.org/) - Framework React para SSR e SSG
- [Tailwind CSS](https://tailwindcss.com/) - Framework de utilitários CSS
- [TypeScript](https://www.typescriptlang.org/) - Superset de JavaScript com tipagem
- [PNPM](https://pnpm.io/) - Gerenciador de pacotes

## Estrutura de Pastas

- `app/` - Páginas e rotas Next.js
- `components/` - Componentes reutilizáveis (UI, Cronômetro etc.)
- `electron/` - Arquivos específicos do Electron
- `hooks/` - Hooks customizados
- `lib/` - Funções utilitárias
- `public/` - Arquivos estáticos
- `scripts/` - Scripts de build e automação
- `styles/` - Configurações e estilos globais
- `electron-builder.json` - Configurações de build do Electron
- `next.config.mjs` - Configurações do Next.js
- `tailwind.config.ts` - Configurações do Tailwind CSS
- `tsconfig.json` - Configurações do TypeScript

## Como Rodar o Projeto
### Rodar o Electron (modo Desktop)

Como Rodar o Projeto:
# Como Rodar o Projeto

### Rodar o Electron (modo Desktop)

1. **Inicie o servidor Next.js em modo desenvolvimento:**
   ```bash
   pnpm dev
   
2. **Em outro terminal, execute o Electron:**
   ```bash
   pnpm electron:dev
   ```
Importante: Certifique-se de que o servidor Next.js (pnpm dev) esteja rodando antes de abrir o Electron, pois o Electron irá se conectar ao servidor Next.js.
