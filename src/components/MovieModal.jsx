import React, { useState, useEffect } from 'react';

const MovieModal = ({ movie, isOpen, onClose }) => {
  const [movieDetails, setMovieDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://api.themoviedb.org/3';
  const API_KEY = import.meta.env.VITE_TMDB_TOKEN;
  const CORS_PROXY = 'https://corsproxy.io/?';

  const API_OPTIONS = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`
    }
  };

  useEffect(() => {
    if (isOpen && movie?.id) {
      fetchMovieDetails();
    }
  }, [isOpen, movie]);

  const fetchMovieDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let endpoint = `${API_BASE_URL}/movie/${movie.id}?append_to_response=credits,videos`;
      let response;

      try {
        response = await fetch(endpoint, API_OPTIONS);
      } catch (directError) {
        endpoint = `${CORS_PROXY}${endpoint}`;
        response = await fetch(endpoint, API_OPTIONS);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setMovieDetails(data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setError('Failed to load movie details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="w-12 h-12 border-4 border-gray-600 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-red-500">{error}</p>
            </div>
          ) : movieDetails ? (
            <>
              {/* Backdrop */}
              <div className="relative h-64 md:h-96">
                <img
                  src={
                    movieDetails.backdrop_path
                      ? `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}`
                      : "/BG.png"
                  }
                  alt={movieDetails.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                
                {/* Title overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{movieDetails.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span>{movieDetails.release_date?.split('-')[0]}</span>
                    <span>•</span>
                    <span>{Math.floor(movieDetails.runtime / 60)}h {movieDetails.runtime % 60}m</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <img src="/star.svg" alt="star" className="w-4 h-4" />
                      <span>{movieDetails.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {movieDetails.genres?.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                {/* Overview */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Overview</h3>
                  <p className="text-gray-300 leading-relaxed">{movieDetails.overview}</p>
                </div>

                {/* Cast */}
                {movieDetails.credits?.cast?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-3">Cast</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {movieDetails.credits.cast.slice(0, 10).map((person) => (
                        <div key={person.id} className="flex-shrink-0 text-center">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gray-700 mb-2">
                            {person.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                alt={person.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                No Photo
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-white truncate w-16 md:w-20">{person.name}</p>
                          <p className="text-xs text-gray-400 truncate w-16 md:w-20">{person.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trailer */}
                {movieDetails.videos?.results?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-3">Trailer</h3>
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe
                        src={`https://www.youtube.com/embed/${movieDetails.videos.results[0].key}`}
                        title={movieDetails.videos.results[0].name}
                        className="w-full h-64 md:h-96 rounded-lg"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-400">No details available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
