from langchain_ollama import OllamaEmbeddings


embeddings = OllamaEmbeddings(
    model="nomic-embed-text:latest",
)

def embed_documents(chunks):
    return embeddings.embed_documents(
        chunks
    )

def embed_query(query: str):
    return embeddings.embed_query(
        query
    )