export default function Cancion({key, artista, nombre, imagen}) {
    return (
        <li 
          key={track.id} 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "1rem",
            padding: "0.5rem 0",
            borderBottom: "1px solid #eee"
          }}
        >
            {track.album.images?.[2] && (
              <img 
                src={imagen} 
                style={{ width: "50px", height: "50px" }}
              />
            )}
            <div>
              <b>{nombre}</b>
              <p style={{ margin: 0, color: "#666" }}>
                {artista}
              </p>
            </div>
        </li>
    )
}