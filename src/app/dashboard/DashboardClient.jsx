'use client';
// Es necesario dividir el dashboard en 2 componentes para poder usar botones aquí

import { useState, useEffect } from 'react';
import WidgetGeneros from '../../components/WidgetGeneros';
import WidgetAgnos from '../../components/WidgetAgnos';
import WidgetTracks from '../../components/WidgetTracks';
import WidgetArtistas from '../../components/WidgetArtistas';
import Cancion from '../../components/Cancion';
import Artista from '../../components/Artista';

export default function DashboardClient({ user }) {
  if (!user) {
    return <div className="p-8">Cargando usuario...</div>;
  }

  // Aquí guardamos las preferencias del usuario
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedYears, setSelectedYears] = useState([1950, 2025]);
  
  // Playlist combinada (canciones y artistas)
  const [playlistItems, setPlaylistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Favoritos por tipo (localStorage)
  const [favoriteTracks, setFavoriteTracks] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('favorite_tracks') || '[]');
    }
    return [];
  });

  const [favoriteArtists, setFavoriteArtists] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('favorite_artists') || '[]');
    }
    return [];
  });

  // Cargar favoritos en la playlist al inicio
  useEffect(() => {
    const favoriteTracksWithType = favoriteTracks.map(track => ({ ...track, type: 'track' }));
    const favoriteArtistsWithType = favoriteArtists.map(artist => ({ ...artist, type: 'artist' }));
    setPlaylistItems([...favoriteTracksWithType, ...favoriteArtistsWithType]);
  }, []);

  // Cuando cambian las canciones o artistas seleccionados, añadirlos a la playlist
  useEffect(() => {
    const favoriteTrackIds = new Set(favoriteTracks.map(f => f.id));
    const favoriteArtistIds = new Set(favoriteArtists.map(f => f.id));
    const selectedTrackIds = new Set(selectedTracks.map(t => t.id));
    const selectedArtistIds = new Set(selectedArtists.map(a => a.id));
    
    // Obtener items que no son favoritos ni seleccionados
    const otherItems = playlistItems.filter(item => {
      if (item.type === 'track') {
        return !favoriteTrackIds.has(item.id) && !selectedTrackIds.has(item.id);
      } else {
        return !favoriteArtistIds.has(item.id) && !selectedArtistIds.has(item.id);
      }
    });
    
    // Nueva playlist: favoritos + seleccionados + otros
    const favoriteTracksWithType = favoriteTracks.map(track => ({ ...track, type: 'track' }));
    const favoriteArtistsWithType = favoriteArtists.map(artist => ({ ...artist, type: 'artist' }));
    const selectedTracksWithType = selectedTracks.map(track => ({ ...track, type: 'track' }));
    const selectedArtistsWithType = selectedArtists.map(artist => ({ ...artist, type: 'artist' }));
    
    setPlaylistItems([
      ...favoriteTracksWithType,
      ...favoriteArtistsWithType,
      ...selectedTracksWithType,
      ...selectedArtistsWithType,
      ...otherItems
    ]);
  }, [selectedTracks, selectedArtists, favoriteTracks, favoriteArtists]);

  // Función para generar playlist
  const generatePlaylist = async () => {
    if (selectedGenres.length === 0) {
      alert('Selecciona al menos un género');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracks: selectedTracks,
          artists: selectedArtists,
          genres: selectedGenres,
          years: selectedYears,
        })
      });
      
      const data = await response.json();
      const newTracks = (data.tracks || []).map(track => ({ ...track, type: 'track' }));
      
      // Combinar favoritos + seleccionados + nuevos (sin duplicados)
      const favoriteTrackIds = new Set(favoriteTracks.map(f => f.id));
      const favoriteArtistIds = new Set(favoriteArtists.map(f => f.id));
      const selectedTrackIds = new Set(selectedTracks.map(t => t.id));
      const selectedArtistIds = new Set(selectedArtists.map(a => a.id));
      
      const nonDuplicateTracks = newTracks.filter(item => 
        !favoriteTrackIds.has(item.id) && !selectedTrackIds.has(item.id)
      );
      
      const favoriteTracksWithType = favoriteTracks.map(track => ({ ...track, type: 'track' }));
      const favoriteArtistsWithType = favoriteArtists.map(artist => ({ ...artist, type: 'artist' }));
      const selectedTracksWithType = selectedTracks.map(track => ({ ...track, type: 'track' }));
      const selectedArtistsWithType = selectedArtists.map(artist => ({ ...artist, type: 'artist' }));
      
      setPlaylistItems([
        ...favoriteTracksWithType,
        ...favoriteArtistsWithType,
        ...selectedTracksWithType,
        ...selectedArtistsWithType,
        ...nonDuplicateTracks
      ]);
    } catch (error) {
      console.error('Error generando playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar item
  const removeItem = (itemId, itemType) => {
    setPlaylistItems(playlistItems.filter(item => item.id !== itemId));
    
    if (itemType === 'track') {
      setSelectedTracks(selectedTracks.filter(track => track.id !== itemId));
    } else if (itemType === 'artist') {
      setSelectedArtists(selectedArtists.filter(artist => artist.id !== itemId));
    }
  };

  // Función para marcar/desmarcar favorito
  const toggleFavorite = (item) => {
    if (item.type === 'track') {
      const isFavorite = favoriteTracks.find(f => f.id === item.id);
      let updatedFavorites;
      
      if (isFavorite) {
        updatedFavorites = favoriteTracks.filter(f => f.id !== item.id);
      } else {
        updatedFavorites = [...favoriteTracks, item];
      }
      
      setFavoriteTracks(updatedFavorites);
      localStorage.setItem('favorite_tracks', JSON.stringify(updatedFavorites));
      
      if (!isFavorite && !playlistItems.find(p => p.id === item.id)) {
        setPlaylistItems([{ ...item, type: 'track' }, ...playlistItems]);
      }
    } else if (item.type === 'artist') {
      const isFavorite = favoriteArtists.find(f => f.id === item.id);
      let updatedFavorites;
      
      if (isFavorite) {
        updatedFavorites = favoriteArtists.filter(f => f.id !== item.id);
      } else {
        updatedFavorites = [...favoriteArtists, item];
      }
      
      setFavoriteArtists(updatedFavorites);
      localStorage.setItem('favorite_artists', JSON.stringify(updatedFavorites));
      
      if (!isFavorite && !playlistItems.find(p => p.id === item.id)) {
        setPlaylistItems([{ ...item, type: 'artist' }, ...playlistItems]);
      }
    }
  };

  const isFavorite = (itemId, itemType) => {
    if (itemType === 'track') {
      return favoriteTracks.some(f => f.id === itemId);
    } else if (itemType === 'artist') {
      return favoriteArtists.some(f => f.id === itemId);
    }
    return false;
  };

  return (
    <div className="flex p-5 gap-5">
      <aside className="w-72 border-r border-gray-300 pr-5">
        <div>
          <h1 className="text-2xl">Hola, {user.display_name}!</h1>
        </div>

        <h2 className="text-xl mt-4">Configuración</h2>
        
        <WidgetArtistas 
          selectedArtists={selectedArtists}
          onArtistsChange={setSelectedArtists}
        />

        <WidgetTracks 
          selectedTracks={selectedTracks}
          onTracksChange={setSelectedTracks}
        />

        <WidgetGeneros 
          selectedGenres={selectedGenres}
          onGenresChange={setSelectedGenres}
        />

        <WidgetAgnos 
          selectedYears={selectedYears}
          onYearsChange={setSelectedYears}
        />

        {/* Botón de generar playlist */}
        <button 
          onClick={generatePlaylist} 
          disabled={loading}
          className="w-full p-4 bg-green-500 text-white mt-5"
        >
          {loading ? 'Generando...' : 'Generar Playlist'}
        </button>
      </aside>

      {/* Playlist principal */}
      <main className="flex-1">
        <div className="flex justify-between mb-3">
          <h2 className="text-2xl">
            Tu Playlist ({playlistItems.length})
          </h2>
          
          {playlistItems.length > 0 && (
            <div>
              <button onClick={generatePlaylist} className="p-2 mr-2 border">
                Refrescar
              </button>
              <button onClick={generatePlaylist} className="p-2 border">
                Añadir más
              </button>
            </div>
          )}
        </div>

        {playlistItems.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-gray-300">
            <p>No tienes favoritos aún. Busca y selecciona canciones o artistas, o genera una playlist ⭐</p>
          </div>
        ) : (
          <ul className="list-none p-0">
            {playlistItems.map((item) => {
              if (item.type === 'track') {
                return (
                  <Cancion
                    key={`track-${item.id}`}
                    artista={item.artists?.map(a => a.name).join(', ')}
                    nombre={item.name}
                    imagen={item.album?.images?.[2]?.url}
                    onFavorite={() => toggleFavorite(item)}
                    onRemove={() => removeItem(item.id, 'track')}
                    isFavorite={isFavorite(item.id, 'track')}
                  />
                );
              } else if (item.type === 'artist') {
                return (
                  <Artista
                    key={`artist-${item.id}`}
                    nombre={item.name}
                    imagen={item.images?.[1]?.url}
                    generos={item.genres?.slice(0, 3).join(', ')}
                    onFavorite={() => toggleFavorite(item)}
                    onRemove={() => removeItem(item.id, 'artist')}
                    isFavorite={isFavorite(item.id, 'artist')}
                  />
                );
              }
              return null;
            })}
          </ul>
        )}
      </main>
    </div>
  );
}