'use client';
// Es necesario dividir el dashboard en 2 componentes para poder usar botones aquí

import { useState, useEffect } from 'react';
import WidgetGeneros from '../../components/WidgetGeneros';
import WidgetAgnos from '../../components/WidgetAgnos';
import Cancion from '../../components/Cancion';

export default function DashboardClient({ user }) {
  if (!user) {
    return <div className="p-8">Cargando usuario...</div>;
  }

  // Aquí guardamos las preferencias del usuario. Por esto es necesaria la división del dashboard (porque son hooks)
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedYears, setSelectedYears] = useState([1950, 2025]);
  /*const [moodSettings, setMoodSettings] = useState({
    energy: 50,
    valence: 50,
    danceability: 50
  });
  const [popularityRange, setPopularityRange] = useState([0, 100]);*/
  
  // Cuando le damos al botón de generar playlist las canciones generadas se guardan aquí
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Los favs (localStorage)
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('favorite_tracks') || '[]');
    }
    return [];
  });

  // Cargar favoritos en la playlist al inicio
  useEffect(() => {
    setPlaylist(favorites);
  }, []); // Solo se ejecuta una vez al montar

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
          artists: selectedArtists,
          genres: selectedGenres,
          years: selectedYears,
          /*mood: moodSettings,
          popularity: popularityRange*/
        })
      });
      
      const data = await response.json();
      const newTracks = data.tracks || [];
      
      // Combinar favoritos con las nuevas canciones
      // Primero los favoritos, luego las nuevas (sin duplicados)
      const favoriteIds = new Set(favorites.map(f => f.id));
      const nonFavoriteTracks = newTracks.filter(track => !favoriteIds.has(track.id));
      
      setPlaylist([...favorites, ...nonFavoriteTracks]);
    } catch (error) {
      console.error('Error generando playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar track (por si en la playlist que se ha generado hay alguno que no me gusta)
  const removeTrack = (trackId) => {
    setPlaylist(playlist.filter(track => track.id !== trackId));
  };

  // Función para marcar/desmarcar favorito (este persiste en localStorage)
  const toggleFavorite = (track) => {
    const isFavorite = favorites.find(f => f.id === track.id);
    let updatedFavorites;
    
    if (isFavorite) {
      // Quitar de favoritos
      updatedFavorites = favorites.filter(f => f.id !== track.id);
    } else {
      // Añadir a favoritos
      updatedFavorites = [...favorites, track];
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favorite_tracks', JSON.stringify(updatedFavorites));
    
    // Actualizar la playlist para reflejar el cambio
    // Si añadimos favorito y no está en playlist, lo añadimos al principio
    if (!isFavorite && !playlist.find(p => p.id === track.id)) {
      setPlaylist([track, ...playlist]);
    }
  };

  const isFavorite = (trackId) => {
    return favorites.some(f => f.id === trackId);
  };

  return (
    <div className="flex p-5 gap-5">
      <aside className="w-72 border-r border-gray-300 pr-5">
        <div>
          <h1 className="text-2xl">Hola, {user.display_name}!</h1>
        </div>

        <h2 className="text-xl mt-4">Configuración</h2>
        
        {/* Esto de aquí son los widgets (lado izquierdo) */}
        <div className="mb-4 p-3 border border-gray-300">
          <h3 className="font-bold">Artistas</h3>
          <p>Seleccionados: {selectedArtists.length}</p>
          <button className="w-full p-2 bg-green-500 text-white mt-2">
            Buscar Artistas
          </button>
        </div>

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

      {/* Y esta es la sección donde va la playlist generada (lado derecho) */}
      <main className="flex-1">
        <div className="flex justify-between mb-3">
          <h2 className="text-2xl">
            {playlist.length === favorites.length && playlist.length > 0 
              ? `Tus Favoritos (${playlist.length})` 
              : `Tu Playlist (${playlist.length})`}
          </h2>
          
          {playlist.length > 0 && (
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

        {playlist.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-gray-300">
            <p>No tienes favoritos aún. Genera una playlist y marca tus canciones favoritas ⭐</p>
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
                isFavorite={isFavorite(track.id)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}