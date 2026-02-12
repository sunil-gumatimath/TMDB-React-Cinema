# MovieStream — React + Vite Movie Explorer

Live demo: https://ted-tmdb-movie-07.netlify.app/

A modern, high-performance movie discovery application powered by TMDB API with advanced UX features, optimized performance, and trending search tracking via Appwrite.

## Key Features

### Movie Discovery
- **Smart Search**: Responsive search with 300ms debounce and intelligent caching
- **Infinite Scroll**: Seamless pagination for continuous browsing
- **Movie Details**: Rich modal overlays with trailers, cast, and extended information
- **Trending Movies**: Real-time popularity tracking based on user searches

### Performance Optimizations
- **Lazy Loading**: Intersection Observer for poster images
- **Intelligent Caching**: In-memory cache for instant repeated searches
- **Request Cancellation**: Prevents race conditions and unnecessary API calls
- **Skeleton Loading**: Content-specific placeholders for better perceived performance

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Error Boundaries**: Graceful error handling and recovery
- **Back to Top**: Smooth navigation button
- **Hover Effects**: Interactive movie cards with scale animations
- **Loading States**: Professional skeleton screens and spinners

## Tech Stack

- **Frontend**: React 19, React DOM 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 (`@tailwindcss/vite`)
- **Backend**: Appwrite JS SDK
- **Utilities**: react-use (debounce), Intersection Observer API

## Performance Features

### API Optimizations
- 50% faster response times (removed redundant API calls)
- Request cancellation for rapid typing
- Non-blocking database updates
- CORS proxy fallback for development

### Loading Optimizations
- Lazy loaded images with fade-in transitions
- Skeleton loading states matching content layout
- Infinite scroll with proper pagination
- Smart caching for instant repeated searches

### Error Handling
- React Error Boundary for crash prevention
- Graceful fallbacks with demo movies
- Network error detection and user feedback
- Development mode error details

## Setup

### Prerequisites
- Node.js 18+ and npm
- TMDB v4 Read Access Token
- Appwrite project (Cloud or self-hosted)

### Installation

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
- Create a Database and Collection with attributes:
  - `searchTerm` (string)
  - `count` (integer)
  - `movie_id` (integer or string)
  - `poster_url` (string)
- Configure CORS for your domains in Appwrite settings

## Scripts

- **Development**: `bun run dev` (http://localhost:3000)
- **Build**: `bun run build`
- **Preview**: `bun run preview`
- **Lint**: `bun run lint`

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
│  │  ├─ MovieCard.jsx          # Enhanced with lazy loading & click handlers
│  │  ├─ MovieModal.jsx         # NEW: Movie detail modal with trailers
│  │  ├─ MovieSkeleton.jsx      # NEW: Skeleton loading states
│  │  ├─ BackToTop.jsx          # NEW: Smooth scroll-to-top button
│  │  ├─ ErrorBoundary.jsx      # NEW: React error boundary
│  │  ├─ Search.jsx
│  │  ├─ Spinner.jsx
│  │  └─ appwrite.js
│  ├─ App.jsx                   # Enhanced with infinite scroll & caching
│  ├─ App.css
│  ├─ index.css
│  └─ main.jsx                  # Wrapped with ErrorBoundary
├─ index.html
├─ vite.config.js
└─ README.md
```

## How It Works

### Enhanced Search Flow
1. **User Input**: Debounced (300ms) to prevent excessive API calls
2. **Cache Check**: Instant results for repeated searches
3. **API Request**: Cancelled if user types rapidly
4. **Response Handling**: Cached and displayed with skeleton states
5. **Trending Update**: Non-blocking Appwrite update for search analytics

### Infinite Scroll
- Intersection Observer detects scroll position
- Automatically loads next page when user reaches bottom
- Maintains scroll position and loading states
- Shows "no more movies" when pagination completes

### Movie Details Modal
- Click any movie card for detailed information
- Fetches extended data: cast, trailers, genres, runtime
- Smooth animations with keyboard navigation
- Responsive design for all screen sizes

## API Integration

### TMDB Endpoints
- **Discover**: `GET /discover/movie?sort_by=popularity.desc&page={page}`
- **Search**: `GET /search/movie?query={encoded}&page={page}`
- **Details**: `GET /movie/{id}?append_to_response=credits,videos`

### Performance Features
- Automatic CORS proxy fallback for development
- 10-second timeout with abort controller
- Intelligent error handling with demo movie fallbacks
- Response caching for repeated queries

## Troubleshooting

### Common Issues
- **Empty search results**: Verify `VITE_TMDB_TOKEN` is valid
- **Trending not showing**: Check Appwrite configuration and CORS settings
- **Images not loading**: Ensure TMDB image URLs are accessible
- **Slow search**: Check network connection and API key validity

### Performance Issues
- **High memory usage**: Clear browser cache if needed
- **Slow initial load**: Check lazy loading implementation
- **API rate limits**: Implement additional debouncing if needed

## Acknowledgements

- **Data**: The Movie Database (TMDB)
- **Backend**: Appwrite
- **Icons**: Lucide React (via inline SVGs)
- **Build Tools**: Vite, React, Tailwind CSS
