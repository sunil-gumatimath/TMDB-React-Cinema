# Reel Radar — React + Vite Movie Explorer

Browse and search movies powered by the TMDB API, with trending searches tracked via Appwrite. Styled with Tailwind CSS and built on Vite.

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
npm install
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

3) Appwrite configuration
- The SDK is configured in `src/components/appwrite.js` to use `https://cloud.appwrite.io/v1`.
- Create a Database and a Collection with attributes matching usage:
  - `searchTerm` (string)
  - `count` (integer)
  - `movie_id` (integer or string)
  - `poster_url` (string)
- Ensure your Appwrite project allows web requests from your dev/production domains (CORS) and that the API keys/permissions fit your security needs. This project uses client-side SDK calls.

## Scripts

- Dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`
- Lint: `npm run lint`

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

## Troubleshooting

- Empty results when searching: verify `VITE_TMDB_TOKEN` is set and valid; ensure the search URL encodes the query.
- Trending not visible: confirm Appwrite env vars and that the collection exists with the attributes above; allow your app’s origin in Appwrite CORS.
- Images not loading: ensure `poster_url` includes `https://image.tmdb.org/t/p/w500` and that `/No-Poster.png` exists under `public/`.

## License

MIT

## Acknowledgements

- Data: The Movie Database (TMDB)
- Backend-as-a-service: Appwrite
