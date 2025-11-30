# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start Vite frontend (port 5173)
npm run dev:server   # Start Express backend (port 3001)
npm run dev:all      # Start both concurrently
npm run build        # TypeScript compile + Vite build
npm run lint         # ESLint
```

**Important:** The Vite dev server proxies `/api/*` requests to `http://localhost:3001`. Ensure the Express server is running on port 3001 before testing API features.

## Environment

Requires `.env` file with:
```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

## Architecture

**EzLaTeX** colorizes LaTeX equations and generates plain English explanations using Claude AI.

### Frontend (React + Vite + Tailwind)

- **State Management**: Zustand store in `src/store/useEquationStore.ts` manages equation state, parsing, and API calls
- **LaTeX Parser**: Custom recursive descent parser in `src/lib/latexParser.ts` tokenizes LaTeX into a typed AST with color assignments
- **Rendering**: KaTeX renders the colorized LaTeX output; colors are injected via `\color{}` commands
- **Token Types**: Defined in `src/types/latex.ts` - includes result_var, input_var, index_var, summation, integral, fraction, etc.

### Backend (Express)

Single file at `server/index.ts` with two endpoints:
- `POST /api/explain` - Generates explanation via Claude (claude-sonnet-4-20250514)
- `POST /api/explain/stream` - Streaming variant
- `GET /api/health` - Health check

The prompt in `buildPrompt()` instructs Claude to return HTML with `<span style="color:...">` tags matching the token colors from the parser.

### Data Flow

1. User enters LaTeX → `LatexParser` tokenizes and assigns colors
2. Colorized LaTeX rendered via KaTeX in `ColorizedEquation`
3. "Explain" button calls `/api/explain` with tokens
4. Claude returns color-coded HTML explanation displayed in `PlainEnglish`
