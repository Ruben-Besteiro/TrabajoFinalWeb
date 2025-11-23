'use client';
// Es necesario dividir el dashboard en 2 componentes para poder usar botones aquí

import { useState } from 'react';

export default function DashboardClient({ user }) {
  // Verificar que user existe
  if (!user) {
    return <div className="p-8">Cargando usuario...</div>;
  }

  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedDecades, setSelectedDecades] = useState([]);
  const [moodSettings, setMoodSettings] = useState({
    energy: 50,
    valence: 50,
    danceability: 50
  });
  const [popularityRange, setPopularityRange] = useState([0, 100]);
  
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('favorite_tracks') || '[]');
    }
    return [];
  });

  // Función para generar playlist
  const generatePlaylist = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artists: selectedArtists,
          genres: selectedGenres,
          decades: selectedDecades,
          mood: moodSettings,
          popularity: popularityRange
        })
      });
      
      const data = await response.json();
      setPlaylist(data.tracks || []);
    } catch (error) {
      console.error('Error generando playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar track
  const removeTrack = (trackId) => {
    setPlaylist(playlist.filter(track => track.id !== trackId));
  };

  // Función para marcar/desmarcar favorito
  const toggleFavorite = (track) => {
    const isFavorite = favorites.find(f => f.id === track.id);
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favorites.filter(f => f.id !== track.id);
    } else {
      updatedFavorites = [...favorites, track];
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favorite_tracks', JSON.stringify(updatedFavorites));
  };

  const isFavorite = (trackId) => {
    return favorites.some(f => f.id === trackId);
  };

  return (
    <div className="flex p-5 gap-5">
      <aside className="w-72 border-r border-gray-300 pr-5">
        <div>
          <h1 className="text-2xl">Hola, {user.display_name}!</h1>
          {user.images?.[0] && (
            <img src={user.images[0].url} alt="Perfil" className="w-20 rounded-full" />
          )}
        </div>

        <h2 className="text-xl mt-4">Configuración</h2>
        
        <div className="mb-4 p-3 border border-gray-300">
          <h3 className="font-bold">Artistas</h3>
          <p>Seleccionados: {selectedArtists.length}</p>
          <button className="w-full p-2 bg-green-500 text-white mt-2">
            Buscar Artistas
          </button>
        </div>

        <div className="mb-4 p-3 border border-gray-300">
          <h3 className="font-bold">Géneros</h3>
          <p>Seleccionados: {selectedGenres.length}</p>
          <button className="w-full p-2 bg-green-500 text-white mt-2">
            Elegir Géneros
          </button>
        </div>

        <div className="mb-4 p-3 border border-gray-300">
          <h3 className="font-bold">Décadas</h3>
          <p>Seleccionadas: {selectedDecades.length}</p>
        </div>

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
          <h2 className="text-2xl">Tu Playlist ({playlist.length})</h2>
          
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
            <p>Configura tus preferencias y genera una playlist</p>
          </div>
        ) : (
          <ul className="list-none p-0">
            {playlist.map((track) => (
              <li key={track.id} className="flex p-3 border-b border-gray-200">
                {track.album?.images?.[2] && (
                  <img src={track.album.images[2].url} alt={track.name} className="w-12 h-12" />
                )}
                
                <div className="flex-1 ml-3">
                  <div className="font-bold">{track.name}</div>
                  <div className="text-gray-600">
                    {track.artists?.map(a => a.name).join(', ')}
                  </div>
                </div>

                <div>
                  <button 
                    onClick={() => toggleFavorite(track)}
                    className="bg-transparent border-0 text-xl"
                  >
                    {isFavorite(track.id) ? '⭐' : '☆'}
                  </button>
                  
                  <button 
                    onClick={() => removeTrack(track.id)}
                    className="bg-transparent border-0 text-xl"
                  >
                    ❌
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}