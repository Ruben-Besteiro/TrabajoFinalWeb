'use client';

import { useState, useEffect } from 'react';
import WidgetGeneros from '../../components/WidgetGeneros';
import WidgetAgnos from '../../components/WidgetAgnos';
import WidgetTracks from '../../components/WidgetTracks';
import WidgetArtistas from '../../components/WidgetArtistas';
import Cancion from '../../components/Cancion';

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
    
    // Filtrar tracks seleccionados que no sean favoritos
    const nonFavoriteTracks = filters.tracks.filter(t => !favoriteIds.has(t.id));
    
    const otherTracks = playlist.filter(t => !favoriteIds.has(t.id) && !selectedIds.has(t.id));
    
    setPlaylist([...favorites, ...nonFavoriteTracks, ...otherTracks]);
  }, [filters.tracks, favorites]);

  // Actualizar playlist cuando cambian artistas seleccionados
  useEffect(() => {
    const fetchArtistTracks = async () => {
      const artistTracks = [];
      // Por cada artista generamos los top tracks
      for (const artist of filters.artists) {
        try {
          const response = await fetch(`/api/artist-top-tracks?artistId=${artist.id}`);
          const data = await response.json();
          if (data.tracks) {
            artistTracks.push(...data.tracks.slice(0, 5));
          }
        } catch (error) {
          console.error('Error obteniendo tracks del artista:', error);
        }
      }
      
      const favoriteIds = favorites.map(f => f.id);
      const selectedIds = filters.tracks.map(t => t.id);
      const artistTrackIds = artistTracks.map(t => t.id);
      
      // Esto son los tracks seleccionados con los widgets que no están en favoritos
      const nonFavoriteTracks = filters.tracks.filter(t => !favoriteIds.includes(t.id));
      const nonFavoriteArtistTracks = artistTracks.filter(t => !favoriteIds.includes(t.id) && !selectedIds.includes(t.id));
      
      const otherTracks = playlist.filter(t => 
        !favoriteIds.includes(t.id) && !selectedIds.includes(t.id) && !artistTrackIds.includes(t.id)
      );
      
      setPlaylist([...favorites, ...nonFavoriteTracks, ...nonFavoriteArtistTracks, ...otherTracks]);
    };
    
    if (filters.artists.length > 0) {
      fetchArtistTracks();
    }
  }, [filters.artists]);

  // ESTO ES CUANDO LE DAMOS AL BOTÓN DE GENERAR PLAYLIST
  const generatePlaylist = async () => {
    if (filters.genres.length === 0) {
      alert('Selecciona al menos un género');
      return;
    }

    setLoading(true);
    try {
      // Regeneramos los top tracks de los artistas para que no desaparezcan
      const artistTracks = [];
      for (const artist of filters.artists) {
        try {
          const response = await fetch(`/api/artist-top-tracks?artistId=${artist.id}`);
          const data = await response.json();
          if (data.tracks) {
            artistTracks.push(...data.tracks.slice(0, 5));
          }
        } catch (error) {
          console.error('Error obteniendo tracks del artista:', error);
        }
      }

      // El botón de Generar Playlist genera canciones con los widgets de géneros y años
      const response = await fetch('/api/generate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      
      const data = await response.json();
      const newGeneratedTracks = data.tracks || [];
      
      // Aquí metemos todos los IDs de las canciones que ya están y hacemos un filter para que no salgan 2 veces
      const existingIds = new Set([...favorites, ...filters.tracks, ...artistTracks].map(t => t.id));
      const uniqueNewGeneratedTracks = newGeneratedTracks.filter(t => !existingIds.has(t.id));

      const nonFavoriteTracks = filters.tracks.filter(t => !existingIds.has(t.id));
      const nonFavoriteArtistTracks = artistTracks.filter(t => !existingIds.has(t.id));
      
      // La playlist va en orden: Primero los favoritos, luego los tracks que seleccionamos manualmente
      // con los widgets de tracks y artistas, y por último los que generamos con el botón de Generar Playlist
      // (filtrando los duplicados)
      setPlaylist([...favorites, ...nonFavoriteTracks, ...nonFavoriteArtistTracks, ...uniqueNewGeneratedTracks]);
    } catch (error) {
      console.error('Error generando playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar track (dándole a la X)
  const removeTrack = (trackId) => {
    setPlaylist(playlist.filter(t => t.id !== trackId));
    setFilters(prev => ({ ...prev, tracks: prev.tracks.filter(t => t.id !== trackId) }));
  };

  // Toggle favorito (dándole a la estrella)
  const toggleFavorite = (track) => {
    const isFav = favorites.find(f => f.id === track.id);
    const updated = isFav 
      ? favorites.filter(f => f.id !== track.id)
      : [...favorites, track];
    
    setFavorites(updated);
    localStorage.setItem('favorite_tracks', JSON.stringify(updated));
    
    // Si añadimos a favoritos lo quitamos de filters.tracks para que no salga 2 veces
    if (!isFav) {
      setFilters(prev => ({
        ...prev,
        tracks: prev.tracks.filter(t => t.id !== track.id)
      }));
      
      if (!playlist.find(p => p.id === track.id)) {
        setPlaylist([track, ...playlist]);
      }
    }
  };

  return (
    <div className="flex p-5 gap-5">
      <aside className="w-72 border-r border-gray-300 pr-5">
        <h1 className="text-2xl">¡Hola, {user.display_name}!</h1>
        <h2 className="text-xl mt-4">Widgets</h2>

        <WidgetTracks 
          selectedTracks={filters.tracks}
          onTracksChange={(tracks) => setFilters(prev => ({ ...prev, tracks }))}
        />
        
        <WidgetArtistas
          selectedArtists={filters.artists}
          onArtistsChange={(artists) => setFilters(prev => ({ ...prev, artists }))}
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
            <p>No tienes nada aún. Puedes seleccionar canciones y artistas manualmente o generar una playlist escogiendo géneros y fechas</p>
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