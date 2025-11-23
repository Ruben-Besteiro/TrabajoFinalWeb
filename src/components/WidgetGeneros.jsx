'use client';

import { useState, useEffect } from 'react';

export default function WidgetGeneros({ selectedGenres, onGenresChange }) {
  const [availableGenres, setAvailableGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Primero hacemos una llamada a la API de Spotify para obtener los géneros
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/genres');        // Llamamos a la API route de géneros

        if (!response.ok) {
          console.error('Error response:', response.status, response.statusText);
          const text = await response.text();
          console.error('Response body:', text);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setAvailableGenres(data.genres || []);
      } catch (error) {
        console.error('Error obteniendo géneros:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  // Aquí metemos o quitamos géneros de la selección
  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      onGenresChange(selectedGenres.filter(g => g !== genre));
    } else {
      if (selectedGenres.length >= 5) {
        alert('Máximo 5 géneros');
        return;
      }
      onGenresChange([...selectedGenres, genre]);
    }
  };

  if (loading) {
    return (
      <div className="mb-4 p-3 border border-gray-300">
        <h3 className="font-bold">Géneros</h3>
        <p className="text-sm">Cargando géneros...</p>
      </div>
    );
  }

  return (
    <div className="mb-4 p-3 border border-gray-300">
      <h3 className="font-bold">Géneros</h3>
      <p className="text-sm mb-2">Seleccionados: {selectedGenres.length}/5</p>
      
      <div className="max-h-48 overflow-y-auto">
        {availableGenres.map((genre) => (
          <label key={genre} className="flex items-center mb-1 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedGenres.includes(genre)}
              onChange={() => toggleGenre(genre)}
              className="mr-2"
            />
            <span className="text-sm">{genre}</span>
          </label>
        ))}
      </div>
    </div>
  );
}