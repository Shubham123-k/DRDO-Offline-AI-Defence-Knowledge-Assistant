from services.text_extractor import extract_pages
from services.text_splitter import split_pages
from services.embedding_service import embed_documents
from services.chroma_service import add_chunks


def ingest_document(
    file_path: str,
    document_id: int,
    filename: str,
    classification: str,
    uploaded_by: int,
):
    """
    Complete document ingestion pipeline.

    PDF:
        Extract pages
        ↓
        Split each page
        ↓
        Generate embeddings
        ↓
        Store chunks + page metadata in ChromaDB
    """

    pages = extract_pages(
        file_path
    )

    if not pages:
        raise ValueError(
            "No readable text was found in the document."
        )

    chunks = split_pages(
        pages
    )

    if not chunks:
        raise ValueError(
            "No text chunks could be created."
        )
        
    chunk_texts = [
        chunk["text"]
        for chunk in chunks
    ]

    embeddings = embed_documents(
        chunk_texts
    )
    
    metadata = {
        "document_id": document_id,
        "filename": filename,
        "classification": classification,
        "uploaded_by": uploaded_by,
    }

    add_chunks(
        chunks=chunks,
        embeddings=embeddings,
        metadata=metadata,
    )

    return {
        "pages": len(pages),
        "chunks": len(chunks),
    }