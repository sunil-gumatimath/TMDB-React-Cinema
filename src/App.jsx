import React, { useEffect, useState, useCallback, useRef } from 'react'
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from './components/MovieCard.jsx';
import MovieModal from './components/MovieModal.jsx';
import MovieSkeleton from './components/MovieSkeleton.jsx';
import BackToTop from './components/BackToTop.jsx';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './components/appwrite.js';

const API_BASE_URL = '/api'

const API_KEY = import.meta.env.VITE_TMDB_TOKEN;

// Debug: Check if API key is available
if (!API_KEY) {
  console.error('❌ TMDB API key is missing. Please check your .env.local file');
} else {
  console.log('✅ TMDB API key found');
}

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  },
  timeout: 10000 // 10 second timeout
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  // Modal state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cache for storing movie results
  const movieCache = useRef(new Map());
  // AbortController reference for cancelling requests
  const abortControllerRef = useRef(null);
  // Intersection observer for infinite scroll
  const observerRef = useRef(null);



  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 300ms
  useDebounce(useCallback(() => setDebouncedSearchTerm(searchTerm), [searchTerm]), 300, [searchTerm])

  const fetchMovies = async (query = '', pageNum = 1, append = false) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    const cacheKey = query ? `${query}-page-${pageNum}` : `popular-page-${pageNum}`;
    if (movieCache.current.has(cacheKey) && !append) {
      const cachedData = movieCache.current.get(cacheKey);
      setMovieList(cachedData.results || []);
      setTotalPages(cachedData.total_pages || 0);
      setHasMore(pageNum < (cachedData.total_pages || 1));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => abortControllerRef.current.abort(), 10000);

      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${pageNum}`;

      const response = await fetch(endpoint, {
        ...API_OPTIONS,
        signal: abortControllerRef.current.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const movies = data.results || [];
      
      // Cache the results
      movieCache.current.set(cacheKey, data);
      
      if (append) {
        setMovieList(prev => [...prev, ...movies]);
      } else {
        setMovieList(movies);
      }
      
      setTotalPages(data.total_pages || 0);
      setHasMore(pageNum < (data.total_pages || 1));

      if (query && movies.length > 0 && pageNum === 1) {
        updateSearchCount(query, movies[0]).catch(console.error);
      }

    } catch (error) {
      // Don't show error for aborted requests
      if (error.name === 'AbortError') {
        return;
      }
      
      console.error(`error fetching movies ${error}`);
      let errorMessage = 'Error fetching movies. Please try again later.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Loading demo movies...';
        const demoMovies = [
          {
            id: 1,
            title: "The Shawshank Redemption",
            vote_average: 9.3,
            poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
            release_date: "1994-09-23",
            original_language: "en"
          },
          {
            id: 2,
            title: "The Godfather",
            vote_average: 9.2,
            poster_path: "/3bhkrj58Vtu7enYsRolB1fAM3AT.jpg",
            release_date: "1972-03-24",
            original_language: "en"
          },
          {
            id: 3,
            title: "The Dark Knight",
            vote_average: 9.0,
            poster_path: "/1hRoyzDtpgMV7DcaJLAWQdwqOq4.jpg",
            release_date: "2008-07-18",
            original_language: "en"
          }
        ];
        setMovieList(demoMovies);
        setHasMore(false);
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
        errorMessage = 'Network error. Please check your internet connection or try again later.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Invalid API key. Please check your TMDB configuration.';
      } else if (error.message.includes('404')) {
        errorMessage = 'API endpoint not found. Please check the API configuration.';
      }
      
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  // Modal handlers
  const handleMovieClick = useCallback((movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  }, []);

  // Load more movies when user scrolls to bottom
  const loadMoreMovies = useCallback(() => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(debouncedSearchTerm, nextPage, true);
    }
  }, [hasMore, isLoading, page, debouncedSearchTerm]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreMovies();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreMovies, hasMore]);

  // Reset pagination when search term changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchMovies(debouncedSearchTerm, 1, false);
  }, [debouncedSearchTerm])

  useEffect(() => {
    loadTrendingMovies();
  }, [])

  return (
    <main>
      <div className='pattern'>
        <div className='wrapper'>
          <header>

            <img src="/hero-img.png" alt="Hero Banner" />

            <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          {
            trendingMovies.length > 0 && (
              <section className='trending'>
                <h2>Trending Movies</h2>
                <ul>
                  {
                    trendingMovies.map((movie, index) => (
                      <li key={movie.$id}>
                        <p>{index + 1}</p>
                        <img src={movie.poster_url} alt={movie.title} />
                      </li>
                    ))
                  }
                </ul>
              </section>
            )}

          <section className='all-movies'>
            <h2>All Movies</h2>
            {
              isLoading && movieList.length === 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <MovieSkeleton key={index} />
                  ))}
                </div>
              ) : errorMessage ? (
                <p className='text-red-500'>{errorMessage}</p>
              ) : (
                <>
                  <ul>
                    {movieList.map((movie) => (
                      <MovieCard 
                        key={`${movie.id}-${page}`} 
                        movie={movie} 
                        onClick={() => handleMovieClick(movie)}
                      />
                    ))}
                  </ul>
                  
                  {/* Infinite scroll trigger */}
                  <div ref={observerRef} className="h-10 flex items-center justify-center">
                    {isLoading && movieList.length > 0 && (
                      <div className="w-8 h-8 border-2 border-gray-600 border-t-indigo-500 rounded-full animate-spin"></div>
                    )}
                    {!hasMore && movieList.length > 0 && (
                      <p className="text-gray-500 text-sm">No more movies to load</p>
                    )}
                  </div>
                </>
              )
            }
          </section>

        </div>
      </div>
      
      {/* Movie Detail Modal */}
      <MovieModal 
        movie={selectedMovie} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
      
      {/* Back to Top Button */}
      <BackToTop />
    </main>
  )
}
export default App
