import PostCard from './PostCard';   // Importamos el componente PostCard
// Si no ponemos nada es un componente del SERVER

async function loadPosts() {        // Como tiene un await, la función debe ser async
    const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
      next: {revalidate: 1}
    });
    return res.json();
}

export default async function PostsPage() {
  const posts = await loadPosts();      // La función nos hace el fetch y el resultado lo almacenamos aquí

  await new Promise((resolve) => setTimeout(resolve, 1000));
  return (
    <div>
      <h1>Posts</h1>
      <p>Welcome to the posts page!</p>
      <ul>
        {posts.map(post => (        // Los paréntesis no son necesarios pero mejoran la legibilidad
          <PostCard key={post.id} post={post} />        // El key es obligatorio en mapas porque es un identificador único
        ))}                                             {/* El post es lo que realmente importa*/}
      </ul>
    </div>
  );
}