export default function Cancion({ artista, nombre, imagen }) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "0.5rem 0",
        borderBottom: "1px solid #eee",
      }}
    >
      {imagen && (
        <img src={imagen} alt={nombre} style={{ width: "50px", height: "50px" }} />
      )}
      <div>
        <b>{nombre}</b>
        <p style={{ margin: 0, color: "#666" }}>
            {artista}
        </p>
      </div>
    </li>
  );
}