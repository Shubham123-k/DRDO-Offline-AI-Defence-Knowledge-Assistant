import os
from langchain_ollama import OllamaEmbeddings


embeddings = OllamaEmbeddings(
    model=os.getenv("OLLAMA_MODEL_1"),
    base_url=os.getenv("OLLAMA_BASE_URL"),
    client_kwargs={
        "timeout": 120
    },
) 


def embed_documents(chunks):
    if not chunks:
        return []

    return embeddings.embed_documents(chunks)


def embed_query(query: str):
    if not query or not query.strip():
        return []

    return embeddings.embed_query(query.strip())