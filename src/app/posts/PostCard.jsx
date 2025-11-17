"use client"            // Como hay un button esto es obligatorio -> Componente CLIENT
import Link from 'next/link'

export default function PostCard({ post }) {
    return (
    <div>
        <Link href={`/posts/${post.id}`}>Ir al post</Link>
        <h3>{post.title}</h3>
        <p>{post.body}</p>
        <button onClick={() => alert(`${post.id}`)}>Click aquí para ver el ID del post</button>
    </div>)
}