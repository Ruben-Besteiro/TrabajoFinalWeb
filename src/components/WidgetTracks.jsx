'use client';

import { useState } from 'react';

export default function WidgetTracks({ selectedTracks, onTracksChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchTracks = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {       // Aquí la llamada a la API
      const response = await fetch(`/api/search-tracks?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.tracks || []);
    } catch (error) {
      console.error('Error buscando tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchTracks();
    }
  };

  {/* Aquí es donde añadimos o quitamos canciones manualmente */}
  const toggleTrack = (track) => {
    const isSelected = selectedTracks.find(t => t.id === track.id);
    
    if (!isSelected) {
      if (selectedTracks.length >= 5) {
        alert('Máximo 5 canciones');
        return;
      }
      onTracksChange([...selectedTracks, track]);   // Si no está, se añade a la parte de "tracks" de los filters
    } else {
      onTracksChange(selectedTracks.filter(t => t.id !== track.id));    // Si está, se quita editando el estado directamente
    }
  };

  const isSelected = (trackId) => {
    return selectedTracks.some(t => t.id === trackId);
  };

  return (
    <div className="mb-4 p-3 bg-linear-to-r from-green-800 to-green-900 border-4 border-green-500 rounded-sm">
      <h3 className="font-bold">Canciones</h3>
      <p className="text-sm mb-2">Seleccionadas: {selectedTracks.length}/5</p>
      
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Buscar canciones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-2 bg-green-950 border text-sm rounded-sm"
        />
        <button
          onClick={searchTracks}
          disabled={loading}
          className="p-2 border-2 bg-linear-to-r hover:scale-105 from-green-500 to-green-600 border-green-900 text-white text-sm rounded-sm"
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </div>

      {/* Los tracks los metemos en un menú pequeño y si le damos a la checkbox ahí es donde modificamos el estado del padre */}
      {searchResults.length > 0 && (
        <div className="max-h-48 overflow-y-auto border-t pt-2">
          {searchResults.map((track) => (
            <label key={track.id} className="flex items-center mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected(track.id)}
                onChange={() => toggleTrack(track)}
                className="mr-2"
              />
              {track.album?.images?.[2] && (
                <img 
                  src={track.album.images[2].url} 
                  alt={track.name}
                  className="w-8 h-8 mr-2"
                />
              )}
              <div className="flex-1">
                <div className="text-sm font-bold">{track.name}</div>
                <div className="text-xs text-gray-600">
                  {track.artists?.map(a => a.name).join(', ')}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}