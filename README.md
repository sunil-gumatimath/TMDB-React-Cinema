# Reel Radar — React + Vite Movie Explorer

Browse popular movies powered by the TMDB API with a clean React + Vite setup and Tailwind CSS styling.

## Features

- Fetches popular movies from TMDB (Discover API)
- Search input (controlled) ready for filtering
- Tailwind CSS v4 styles via `@tailwindcss/vite`
- Fast dev server and production build with Vite

## Tech Stack

- React 19, React DOM 19
- Vite 7
- Tailwind CSS 4 (`@tailwindcss/vite` plugin)

## Prerequisites

- Node.js 18+ and npm
- A TMDB account and API token (v4 Read Access Token)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root and add your TMDB v4 Read Access Token:
   ```bash
   VITE_TMDB_TOKEN=YOUR_TMDB_V4_READ_ACCESS_TOKEN
   ```
   - Get this from TMDB: Account Settings → API → “v4 auth” → Copy “Read Access Token”.

## Scripts

- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Lint: `npm run lint`

## Project Structure

```
react-project/
├─ public/
│  ├─ BG.png
│  ├─ hero-img.png
│  ├─ logo.png
│  ├─ No-Poster.png
│  ├─ search.svg
│  └─ star.svg
├─ src/
│  ├─ components/
│  │  └─ Search.jsx
│  ├─ App.jsx
│  ├─ App.css
│  ├─ index.css
│  └─ main.jsx
├─ index.html
├─ vite.config.js
└─ README.md
```

## Environment & API Notes

- The app reads your token from `import.meta.env.VITE_TMDB_TOKEN` and sends it as a Bearer token.
- Current endpoint used in `App.jsx`:
  - `GET https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc`
- If requests fail at runtime, confirm your `.env` is set and the token is valid.

## Development Tips

- Tailwind CSS is configured via `@tailwindcss/vite`; utilities and layers are in `src/App.css`.
- Static assets are served from `public/` and referenced with root paths like `/hero-img.png`.

## License

MIT

## Acknowledgements

- Data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
