'use client';

import { useState, useEffect } from 'react';
import WidgetGeneros from '../../components/WidgetGeneros';
import WidgetAgnos from '../../components/WidgetAgnos';
import WidgetTracks from '../../components/WidgetTracks';
import Cancion from '../../components/Cancion';
import WidgetArtistas from '@/components/WidgetArtistas';

export default function DashboardClient({ user }) {
  if (!user) {
    return <div className="p-8">Cargando usuario...</div>;
  }

  // Preferencias del usuario (filtros)
  const [filters, setFilters] = useState({
    tracks: [],
    artists: [],
    genres: [],
    years: [1950, 2025]
  });

  // Playlist y favoritos
  const [playlist, setPlaylist] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('favorite_tracks') || '[]');
    }
    return [];
  });
  const [loading, setLoading] = useState(false);

  // Inicializar playlist con favoritos
  useEffect(() => {
    setPlaylist(favorites);
  }, []);

  // Actualizar playlist cuando cambian tracks seleccionados
  useEffect(() => {
    const favoriteIds = new Set(favorites.map(f => f.id));
    const selectedIds = new Set(filters.tracks.map(t => t.id));
    const otherTracks = playlist.filter(t => !favoriteIds.has(t.id) && !selectedIds.has(t.id));
    
    setPlaylist([...favorites, ...filters.tracks, ...otherTracks]);
  }, [filters.tracks, favorites]);

  // Generar playlist
  const generatePlaylist = async () => {
    if (filters.genres.length === 0) {
      alert('Selecciona al menos un género');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      
      const data = await response.json();
      const newTracks = data.tracks || [];
      
      const existingIds = new Set([...favorites, ...filters.tracks].map(t => t.id));
      const uniqueNewTracks = newTracks.filter(t => !existingIds.has(t.id));
      
      setPlaylist([...favorites, ...filters.tracks, ...uniqueNewTracks]);
    } catch (error) {
      console.error('Error generando playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar track
  const removeTrack = (trackId) => {
    setPlaylist(playlist.filter(t => t.id !== trackId));
    setFilters(prev => ({ ...prev, tracks: prev.tracks.filter(t => t.id !== trackId) }));
  };

  // Toggle favorito
  const toggleFavorite = (track) => {
    const isFav = favorites.find(f => f.id === track.id);
    const updated = isFav 
      ? favorites.filter(f => f.id !== track.id)
      : [...favorites, track];
    
    setFavorites(updated);
    localStorage.setItem('favorite_tracks', JSON.stringify(updated));
    
    if (!isFav && !playlist.find(p => p.id === track.id)) {
      setPlaylist([track, ...playlist]);
    }
  };

  return (
    <div className="flex p-5 gap-5">
      <aside className="w-72 border-r border-gray-300 pr-5">
        <h1 className="text-2xl">Hola, {user.display_name}!</h1>
        <h2 className="text-xl mt-4">Configuración</h2>
        
        <WidgetArtistas
          selectedArtists={filters.artists}
          onArtistsChange={(artists) => setFilters(prev => ({ ...prev, artists }))}
        />

        <WidgetTracks 
          selectedTracks={filters.tracks}
          onTracksChange={(tracks) => setFilters(prev => ({ ...prev, tracks }))}
        />

        <WidgetGeneros 
          selectedGenres={filters.genres}
          onGenresChange={(genres) => setFilters(prev => ({ ...prev, genres }))}
        />

        <WidgetAgnos 
          selectedYears={filters.years}
          onYearsChange={(years) => setFilters(prev => ({ ...prev, years }))}
        />

        <button 
          onClick={generatePlaylist} 
          disabled={loading}
          className="w-full p-4 bg-green-500 text-white mt-5"
        >
          {loading ? 'Generando...' : 'Generar Playlist'}
        </button>
      </aside>

      <main className="flex-1">
        <div className="flex justify-between mb-3">
          <h2 className="text-2xl">
            {playlist.length === favorites.length && playlist.length > 0 
              ? `Tus Favoritos (${playlist.length})` 
              : `Tu Playlist (${playlist.length})`}
          </h2>
        </div>

        {playlist.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-gray-300">
            <p>No tienes favoritos aún. Busca y selecciona canciones o genera una playlist ⭐</p>
          </div>
        ) : (
          <ul className="list-none p-0">
            {playlist.map((track) => (
              <Cancion
                key={track.id}
                artista={track.artists?.map(a => a.name).join(', ')}
                nombre={track.name}
                imagen={track.album?.images?.[2]?.url}
                onFavorite={() => toggleFavorite(track)}
                onRemove={() => removeTrack(track.id)}
                isFavorite={favorites.some(f => f.id === track.id)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}