export default function Artista({ nombre, imagen, generos, onFavorite, onRemove, isFavorite }) {
  return (
    <li className="flex items-center gap-3 p-3 border-b border-gray-200 hover:bg-gray-50">
      {imagen && (
        <img 
          src={imagen} 
          alt={nombre}
          className="w-16 h-16 rounded-full object-cover"
        />
      )}
      
      <div className="flex-1">
        <div className="font-bold text-lg">{nombre}</div>
        <div className="text-sm text-gray-600">
          {generos || 'Artista'}
        </div>
      </div>
      
      <div>
        <button
          onClick={onFavorite}
          className="bg-transparent border-0 text-xl"
          title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          {isFavorite ? '⭐' : '☆'}
        </button>
        <button
          onClick={onRemove}
          className="bg-transparent border-0 text-xl"
          title="Eliminar de la playlist"
        >
          ❌
        </button>
      </div>
    </li>
  );
}