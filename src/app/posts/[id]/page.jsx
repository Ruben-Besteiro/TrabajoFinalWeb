import { Suspense } from "react";
import Posts from "../page";

async function loadPost(id) {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
    const data = await res.json()
    return data
}

export default async function Page({ params }) {
    const {id} = await params;
    const post = await loadPost(id);

    return (
        <div>
            <h1>Post page {id}</h1>
            <h2>{id}. {post.title}</h2>
            <p>{post.body}</p>

            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>

            <p>Otros posts</p>
            <Suspense fallback={<div>Cargando posts...</div>}>
                <Posts/>
            </Suspense>
        </div>
    )
}