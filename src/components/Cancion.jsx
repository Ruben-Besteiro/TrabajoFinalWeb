export default function Cancion({ artista, nombre, imagen, onFavorite, onRemove, isFavorite }) {
  return (
    <li className="flex items-center p-3 border-b border-gray-200">
      {imagen && (
        <img src={imagen} alt={nombre} className="w-12 h-12" />
      )}
      
      <div className="flex-1 ml-3">
        <div className="font-bold">{nombre}</div>
        <div className="text-gray-600">{artista}</div>
      </div>

      <div>
        <button 
          onClick={onFavorite}
          className="bg-transparent border-0 text-xl"
        >
          {isFavorite ? '⭐' : '☆'}
        </button>
        
        <button 
          onClick={onRemove}
          className="bg-transparent border-0 text-xl"
        >
          ❌
        </button>
      </div>
    </li>
  );
}