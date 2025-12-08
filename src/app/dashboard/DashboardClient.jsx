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
    return JSON.parse(localStorage.getItem('favorite_tracks') || '[]');
  });
  const [loading, setLoading] = useState(false);
  const [GTR, setGTR] = useState(false);    // Generación en tiempo real

  // Inicializar playlist con favoritos
  useEffect(() => {
    setPlaylist(favorites);
  }, []);

  
  // Generación en tiempo real
  useEffect(() => {
    (async() => {
      if (GTR) generatePlaylist();
    })();
  }, [filters.tracks, filters.artists, filters.genres, filters.years]);


  // ESTO ES CUANDO LE DAMOS AL BOTÓN DE GENERAR PLAYLIST
  const generatePlaylist = async () => {
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

      // Esta API route utiliza lo que metemos en los widgets de géneros y años (primero se hace una llamada para buscar por género y luego se filtra por año)
      const response = await fetch('/api/generate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      
      const data = await response.json();
      const newGeneratedTracks = data.tracks || [];
      
      // Regeneramos la playlist

      const favoriteIds = favorites.map(f => f.id);
      const manuallySelectedTrackIds = filters.tracks.map(t => t.id);
      const artistTrackIds = artistTracks.map(t => t.id);
      
      // Cuando regerentamos la playlist, filtramos para que si un track vaya a salir por duplicado, no salga
      const manuallySelectedTracksFiltered = filters.tracks.filter(t => !favoriteIds.includes(t.id));
      const artistTracksFiltered = artistTracks.filter(t => !favoriteIds.includes(t.id) && !manuallySelectedTrackIds.includes(t.id));
      
      // Para los generados, vemos todo lo que hay en la playlist menos los favoritos, los manuales y los de artistas
      const generatedTracksFiltered = newGeneratedTracks.filter(t => 
        !favoriteIds.includes(t.id) && !manuallySelectedTrackIds.includes(t.id) && !artistTrackIds.includes(t.id)
      );
      
      setPlaylist([...favorites, ...manuallySelectedTracksFiltered, ...artistTracksFiltered, ...generatedTracksFiltered]);
    } catch (error) {
      console.error('Error generando playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar track (dándole a la X)
  const removeTrack = (trackId) => {
    const updated = favorites.filter(t => t.id !== trackId);
    setFavorites(updated);
    localStorage.setItem('favorite_tracks', JSON.stringify(updated));
    setPlaylist(playlist.filter(t => t.id !== trackId));
    setFilters(prev => ({ ...prev, tracks: prev.tracks.filter(t => t.id !== trackId) }));
  };

  // Toggle favorito (dándole a la estrella)
  const toggleFavorite = (track) => {
    const isFav = favorites.find(f => f.id === track.id);
    const updated = isFav
      ? favorites.filter(f => f.id !== track.id)
      : [...favorites, track];
    
    setFavorites(updated);    // Cambiamos el estado
    localStorage.setItem('favorite_tracks', JSON.stringify(updated));     // Y lo guardamos en localStorage
    
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

  const changeTracks = (newTracks) => setFilters(prev => ({
    ...prev,
    tracks: newTracks,
  }));

  const changeArtists = (newArtists) => setFilters(prev => ({
    ...prev,
    artists: newArtists,
  }));

  const changeGenres = (newGenres) => setFilters(prev => ({
    ...prev,
    genres: newGenres,
  }));

  const changeYears = (newYears) => setFilters(prev => ({
    ...prev,
    years: newYears,
  }));

  return (
    <div className="flex flex-col lg:flex-row p-5 gap-5">
      <aside className="content-cover lg:w-80 border-b lg:border-r border-gray-300 pr-5">
        <h1 className="text-2xl">¡Hola, {user.display_name}!</h1>

        <h2 className="text-xl mt-4">Widgets</h2>

        <label>
          <input
            type="checkbox"
            checked={GTR}
            onChange={() => {
              setGTR(!GTR);
            }}
            className="mr-2"
          />
          <span className="text-sm">Activar generación en tiempo real</span>
        </label>

        <WidgetTracks 
          selectedTracks={filters.tracks}
          onTracksChange={(newTracks) => changeTracks(newTracks)}
        />
        
        <WidgetArtistas
          selectedArtists={filters.artists}
          onArtistsChange={(newArtists) => changeArtists(newArtists)}
        />

        <WidgetGeneros 
          selectedGenres={filters.genres}
          onGenresChange={(newGenres) => changeGenres(newGenres)}
        />

        <WidgetAgnos 
          selectedYears={filters.years}
          onYearsChange={(newYears) => changeYears(newYears)}
        />

        <button
          onClick={generatePlaylist}
          disabled={loading}
          className="w-full p-4 font-bold text-xl border-4 bg-linear-to-r hover:scale-105 from-green-500 to-green-600 border-green-900 text-white mt-5 mb-5 rounded-sm"
        >
          {loading ? 'Generando...' : 'Generar Playlist'}
        </button>
      </aside>

      <Suspense fallback={<p>Cargando...</p>}>
      <main className="flex-1">
        <div className="flex justify-between mb-3">
          <h2 className="text-2xl">
            {`Tu Playlist (${playlist.length})`}
          </h2>
        </div>

        {playlist.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-sm">
            <p>No tienes nada aún. Puedes seleccionar canciones y artistas manualmente o generar una playlist escogiendo géneros y fechas</p>
          </div>
        ) : (
          <ul className="list-none p-0">
            {playlist.map((track) => (      // El estado playlist guarda objetos, y aquí se crean los componentes
              <Cancion      // Devuelve un li
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
      </Suspense>
    </div>
  );
}