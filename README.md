# EzLaTeX

Colorize LaTeX equations and get AI-powered plain English explanations.

## Features

- Custom LaTeX parser with color-coded token types
- KaTeX rendering with dark mode support
- AI explanations via Claude or GPT-5
- Brief and detailed explanation modes
- Example equations gallery

## Development

```bash
# Install dependencies
npm install

# Run frontend + backend together
npm run dev:all

# Or run separately:
npm run dev          # Frontend (port 5173)
npm run dev:server   # Backend (port 3001)
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```
ANTHROPIC_API_KEY=your-key
OPENAI_API_KEY=your-key     # Optional, for GPT-5
DEFAULT_MODEL=claude
PORT=3001
```

## Deployment

### Backend (Railway)

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repo
3. Set environment variables:
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY` (optional)
   - `DEFAULT_MODEL=claude`
4. Railway will auto-detect the `Procfile` and deploy

### Frontend (Vercel/Netlify)

1. Create a new project and connect your repo
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable:
   - `VITE_API_URL=https://your-railway-app.railway.app/api`

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- KaTeX for LaTeX rendering
- Zustand for state management
- Express backend with Claude/GPT-5 APIs
