import React, { useEffect, useState, useCallback } from 'react'
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from './components/MovieCard.jsx';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './components/appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3'

// Fallback CORS proxy for development
const CORS_PROXY = 'https://corsproxy.io/?';

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



  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms
  useDebounce(useCallback(() => setDebouncedSearchTerm(searchTerm), [searchTerm]), 500, [searchTerm])

  const fetchMovies = async (query = '') => {

    setIsLoading(true);
    setErrorMessage('');

    try {
      // First, try a simple API test
      let testEndpoint = `${API_BASE_URL}/movie/550`;
      console.log('🔍 Testing TMDB API connectivity...');
      
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      let testResponse;
      try {
        testResponse = await fetch(testEndpoint, {
          ...API_OPTIONS,
          signal: controller.signal
        });
      } catch (directError) {
        console.log('🔄 Direct request failed, trying CORS proxy...');
        clearTimeout(timeoutId);
        
        // Try with CORS proxy
        const proxyController = new AbortController();
        const proxyTimeoutId = setTimeout(() => proxyController.abort(), 10000);
        
        testEndpoint = `${CORS_PROXY}${API_BASE_URL}/movie/550`;
        testResponse = await fetch(testEndpoint, {
          ...API_OPTIONS,
          signal: proxyController.signal
        });
        
        clearTimeout(proxyTimeoutId);
      }

      clearTimeout(timeoutId);

      if (!testResponse.ok) {
        throw new Error(`API test failed: HTTP ${testResponse.status}`);
      }

      console.log('✅ TMDB API connectivity confirmed');

      // If test passes, proceed with actual request
      let endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      // Use proxy if direct request failed
      if (testEndpoint.includes(CORS_PROXY)) {
        endpoint = `${CORS_PROXY}${endpoint}`;
        console.log('🔄 Using CORS proxy for movie request');
      }

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }


    } catch (error) {
      console.error(`error fetching movies ${error}`);
      let errorMessage = 'Error fetching movies. Please try again later.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Loading demo movies...';
        // Load demo movies as fallback
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
        console.log('🎬 Loaded demo movies as fallback');
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Invalid API key. Please check your TMDB configuration.';
      } else if (error.message.includes('404')) {
        errorMessage = 'API endpoint not found. Please check the API configuration.';
      }
      
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
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
              isLoading ? (
                < Spinner />
              ) : errorMessage ? (
                <p className='text-red-500'>{errorMessage}</p>
              ) : (
                <ul>
                  {movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </ul>
              )
            }
          </section>

        </div>
      </div>
    </main>
  )
}
export default App
