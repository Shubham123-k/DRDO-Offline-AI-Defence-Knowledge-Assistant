import chromadb


# Connect to the same ChromaDB used by the application
client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="documents"
)


print("\n========================================")
print("       CHROMADB VERIFICATION")
print("========================================\n")


# Number of stored chunks
count = collection.count()

print(f"Total chunks stored: {count}")


if count == 0:
    print("\n❌ ChromaDB is empty.")
    print("The document was uploaded, but it was not indexed.")
    exit()


# Get stored data
results = collection.get(
    include=[
        "documents",
        "metadatas",
    ]
)


documents = results.get("documents", [])
metadatas = results.get("metadatas", [])
ids = results.get("ids", [])


print("\n========================================")
print("         STORED CHUNKS")
print("========================================\n")


for i, (chunk_id, document, metadata) in enumerate(
    zip(ids, documents, metadatas)
):

    print(f"Chunk #{i + 1}")
    print("----------------------------------------")

    print(f"ID:")
    print(chunk_id)

    print("\nMetadata:")
    print(metadata)

    print("\nContent preview:")
    print(document[:300])

    print("\n")


print("========================================")
print("       VERIFICATION COMPLETED")
print("========================================")