# Reel Radar — React + Vite Movie Explorer

Live demo: https://ted-tmdb-movie-07.netlify.app/

Browse and search movies powered by the TMDB API, with trending searches tracked via Appwrite. Styled with Tailwind CSS and built on Vite.

## Key Features

- Movie discovery and search via TMDB API
- Debounced search (500ms) to limit API calls
- Trending movies based on search popularity (Appwrite)
- Movie cards: poster, title, rating, language, year
- Responsive design with Tailwind CSS
- Loading spinner and error handling

## Features

- TMDB integration: Discover popular movies and search by query
- Debounced search using `react-use` to limit API calls
- Trending section backed by Appwrite (top searched terms/movies)
- Accessible loading spinner component
- Tailwind CSS v4 via `@tailwindcss/vite`

## Tech Stack

- React 19, React DOM 19
- Vite 7
- Tailwind CSS 4 (`@tailwindcss/vite`)
- Appwrite JS SDK
- react-use (debounce)

## Prerequisites

- Node.js 18+ and npm
- TMDB v4 Read Access Token
- Appwrite project (Cloud or self-hosted)

## Setup

1) Install dependencies
```bash
bun install
```

2) Environment variables (create `.env` in project root)
```bash
# TMDB
VITE_TMDB_TOKEN=YOUR_TMDB_V4_READ_ACCESS_TOKEN

# Appwrite
VITE_APPWRITE_PROJECT_ID=YOUR_PROJECT_ID
VITE_APPWRITE_DATABASE_ID=YOUR_DATABASE_ID
VITE_APPWRITE_COLLECTION_ID=YOUR_COLLECTION_ID
```

Example (do not commit secrets):
```bash
VITE_TMDB_TOKEN=eyJhbGciOiJIUzI1NiIsInR...
VITE_APPWRITE_PROJECT_ID=66abc1234567890fedcb
VITE_APPWRITE_DATABASE_ID=movies
VITE_APPWRITE_COLLECTION_ID=trending
```

3) Appwrite configuration
- The SDK is configured in `src/components/appwrite.js` to use `https://cloud.appwrite.io/v1`.
- Create a Database and a Collection with attributes matching usage:
  - `searchTerm` (string)
  - `count` (integer)
  - `movie_id` (integer or string)
  - `poster_url` (string)
- Ensure your Appwrite project allows web requests from your dev/production domains (CORS) and that the API keys/permissions fit your security needs. This project uses client-side SDK calls.

## Scripts

- Dev server: `bun run dev` (runs on http://localhost:3000)
- Build: `bun run build`
- Preview build: `bun run preview`
- Lint: `bun run lint`

## How it works

- `src/App.jsx`
  - Builds TMDB endpoint based on search term: Discover for empty queries, Search for non-empty queries.
  - Debounces user input by 500ms (`useDebounce`) before fetching.
  - After successful search, updates Appwrite with the term and top result (`updateSearchCount`).
  - Loads trending items from Appwrite (`getTrendingMovies`) and displays top 5 by `count`.

- `src/components/MovieCard.jsx`
  - Displays poster, title, rating, language, and year.
  - Poster path: `https://image.tmdb.org/t/p/w500/${poster_path}` with fallback `/No-Poster.png`.

- `src/components/Spinner.jsx`
  - Simple SVG-based loading indicator.

- `src/components/Search.jsx`
  - Controlled input bound to `searchTerm`.

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
│  │  ├─ MovieCard.jsx
│  │  ├─ Search.jsx
│  │  ├─ Spinner.jsx
│  │  └─ appwrite.js
│  ├─ App.jsx
│  ├─ App.css
│  ├─ index.css
│  └─ main.jsx
├─ index.html
├─ vite.config.js
└─ README.md
```

## Environment & API Notes

- TMDB token is read from `import.meta.env.VITE_TMDB_TOKEN` and sent as a Bearer token.
- Endpoints used:
  - Discover: `GET /discover/movie?sort_by=popularity.desc`
  - Search: `GET /search/movie?query={encoded}`
- Appwrite reads/writes documents in the provided collection and orders trending by `count`.

Appwrite document shape used by this app (minimally):
```json
{
  "searchTerm": "string",
  "count": 1,
  "movie_id": 123,
  "poster_url": "https://image.tmdb.org/t/p/w500/abc123.jpg"
}
```

## Troubleshooting

- Empty results when searching: verify `VITE_TMDB_TOKEN` is set and valid; ensure the search URL encodes the query.
- Trending not visible: confirm Appwrite env vars and that the collection exists with the attributes above; allow your app’s origin in Appwrite CORS.
- Images not loading: ensure `poster_url` includes `https://image.tmdb.org/t/p/w500` and that `/No-Poster.png` exists under `public/`.
- CORS with Appwrite: add your dev URL (e.g., `http://localhost:5173`) and production domain to allowed origins in the Appwrite project settings.
- Env updates not taking effect: stop and restart the dev server after changing `.env` values.

## License

MIT

## Acknowledgements

- Data: The Movie Database (TMDB)
- Backend-as-a-service: Appwrite
