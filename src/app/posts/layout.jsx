export default function PostsLayout( {children} ) {     // El nombre da igual
    {/* Se utiliza el layout global + este */}

    return (
        <>
            <div>
                <p>Esto son los posts</p>
            </div>
            {children}
        </>
    );
}