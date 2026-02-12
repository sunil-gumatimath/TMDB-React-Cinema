import React, { useRef, useState, useEffect } from "react";

const MovieCard = ({
  movie: { title, vote_average, poster_path, release_date, original_language },
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleClick = () => {
    onClick && onClick();
  };

  return (
    <div 
      className="movie-card cursor-pointer transform transition-transform duration-200 hover:scale-105"
      onClick={handleClick}
    >
      <div ref={imgRef} className="relative aspect-[2/3] overflow-hidden bg-gray-800 rounded-lg">
        {isInView && (
          <img
            src={
              poster_path
                ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                : "/No-Poster.png"
            }
            alt={title}
            loading="lazy"
            onLoad={handleImageLoad}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-white truncate">{title}</h3>

        <div className="content flex items-center gap-2 text-sm text-gray-400">
          <div className="rating flex items-center gap-1">
            <img src="/star.svg" alt="star icon" className="w-4 h-4" />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>

          <span>•</span>
          <p className="lang uppercase">{original_language}</p>
          <span>•</span>
          <p className="year">
            {release_date ? release_date.split("-")[0] : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
