'use client';

import { useState } from 'react';

export default function WidgetTracks({ selectedTracks, onTracksChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchTracks = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
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

  const toggleTrack = (track) => {
    const isSelected = selectedTracks.find(t => t.id === track.id);
    
    if (isSelected) {
      onTracksChange(selectedTracks.filter(t => t.id !== track.id));
    } else {
      if (selectedTracks.length >= 5) {
        alert('Máximo 5 canciones');
        return;
      }
      onTracksChange([...selectedTracks, track]);
    }
  };

  const isSelected = (trackId) => {
    return selectedTracks.some(t => t.id === trackId);
  };

  return (
    <div className="mb-4 p-3 border border-gray-300">
      <h3 className="font-bold">Canciones</h3>
      <p className="text-sm mb-2">Seleccionadas: {selectedTracks.length}/5</p>
      
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Buscar canciones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-2 border text-sm"
        />
        <button
          onClick={searchTracks}
          disabled={loading}
          className="p-2 bg-green-500 text-white text-sm"
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </div>

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