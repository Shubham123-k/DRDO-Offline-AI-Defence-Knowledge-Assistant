from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)


def split_pages(pages):
    """
    Split page-aware extracted text.

    Input:
        [
            {
                "page": 1,
                "text": "..."
            }
        ]

    Output:
        [
            {
                "page": 1,
                "text": "chunk..."
            }
        ]
    """

    chunks = []

    for page_data in pages:
        page_number = page_data["page"]
        text = page_data["text"]

        page_chunks = splitter.split_text(text)

        for chunk in page_chunks:
            chunks.append(
                {
                    "page": page_number,
                    "text": chunk,
                }
            )

    return chunks


def split_text(text: str):
    """
    Backward-compatible helper.

    This treats plain text as page 1.
    """

    return splitter.split_text(text)