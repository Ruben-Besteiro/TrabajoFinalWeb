'use client';

const GENRES = [
  "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime",
  "black-metal", "bluegrass", "blues", "bossanova", "brazil", "breakbeat",
  "british", "cantopop", "chicago-house", "children", "chill", "classical",
  "club", "comedy", "country", "dance", "dancehall", "death-metal", "deep-house",
  "detroit-techno", "disco", "disney", "drum-and-bass", "dub", "dubstep",
  "edm", "electro", "electronic", "emo", "folk", "forro", "french", "funk",
  "garage", "german", "gospel", "goth", "grindcore", "groove", "grunge",
  "guitar", "happy", "hard-rock", "hardcore", "hardstyle", "heavy-metal",
  "hip-hop", "holidays", "honky-tonk", "house", "idm", "indian", "indie",
  "indie-pop", "industrial", "iranian", "j-dance", "j-idol", "j-pop", "j-rock",
  "jazz", "k-pop", "kids", "latin", "latino", "malay", "mandopop", "metal",
  "metal-misc", "metalcore", "minimal-techno", "movies", "mpb", "new-age",
  "new-release", "opera", "pagode", "party", "philippines-opm", "piano", "pop",
  "pop-film", "post-dubstep", "power-pop", "progressive-house", "psych-rock",
  "punk", "punk-rock", "r-n-b", "rainy-day", "reggae", "reggaeton", "road-trip",
  "rock", "rock-n-roll", "rockabilly", "romance", "sad", "salsa", "samba",
  "sertanejo", "show-tunes", "singer-songwriter", "ska", "sleep", "songwriter",
  "soul", "soundtracks", "spanish", "study", "summer", "swedish", "synth-pop",
  "tango", "techno", "trance", "trip-hop", "turkish", "work-out", "world-music"
];

export default function WidgetGeneros({ selectedGenres, onGenresChange }) {
  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      onGenresChange(selectedGenres.filter(g => g !== genre));      // Si el género ya está lo quitamos
    } else {
      if (selectedGenres.length >= 5) {
        alert('Máximo 5 géneros');
        return;
      }
      onGenresChange([...selectedGenres, genre]);   // Y si no lo añadimos al estado
    }
  };

  return (
    <div className="mb-4 p-3 bg-linear-to-r from-green-800 to-green-900 border border-green-500 rounded-sm">
      <h3 className="font-bold">Géneros</h3>
      <p className="text-sm mb-2">Seleccionados: {selectedGenres.length}/5</p>
      
      {/* Convertimos los géneros a checkboxes */}
      <div className="max-h-48 overflow-y-auto">
        {GENRES.map((genre) => (
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