'use client';

import { useState } from 'react';

export default function WidgetArtistas({ selectedArtists, onArtistsChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchArtists = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/search-artists?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.artists || []);
    } catch (error) {
      console.error('Error buscando artistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchArtists();
    }
  };

  const toggleArtist = (artist) => {
    const isSelected = selectedArtists.find(a => a.id === artist.id);
    
    if (isSelected) {
      onArtistsChange(selectedArtists.filter(a => a.id !== artist.id));
    } else {
      if (selectedArtists.length >= 5) {
        alert('Máximo 5 artistas');
        return;
      }
      onArtistsChange([...selectedArtists, artist]);
    }
  };

  const isSelected = (artistId) => {
    return selectedArtists.some(a => a.id === artistId);
  };

  return (
    <div className="mb-4 p-3 border border-gray-300">
      <h3 className="font-bold">Artistas</h3>
      <p className="text-sm mb-2">Seleccionados: {selectedArtists.length}/5</p>
      
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Buscar artistas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-2 border text-sm"
        />
        <button
          onClick={searchArtists}
          disabled={loading}
          className="p-2 bg-green-500 text-white text-sm"
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="max-h-48 overflow-y-auto border-t pt-2">
          {searchResults.map((artist) => (
            <label key={artist.id} className="flex items-center mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected(artist.id)}
                onChange={() => toggleArtist(artist)}
                className="mr-2"
              />
              {artist.images?.[2] && (
                <img 
                  src={artist.images[2].url} 
                  alt={artist.name}
                  className="w-8 h-8 mr-2 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="text-sm font-bold">{artist.name}</div>
                <div className="text-xs text-gray-600">
                  {artist.genres?.slice(0, 2).join(', ') || 'Sin géneros'}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      {selectedArtists.length > 0 && (
        <div className="mt-2 border-t pt-2">
          <p className="text-xs font-bold mb-1">Seleccionados:</p>
          {selectedArtists.map((artist) => (
            <div key={artist.id} className="flex items-center gap-2 mb-1">
              {artist.images?.[2] && (
                <img 
                  src={artist.images[2].url} 
                  alt={artist.name}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-xs flex-1">{artist.name}</span>
              <button
                onClick={() => toggleArtist(artist)}
                className="text-xs"
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}