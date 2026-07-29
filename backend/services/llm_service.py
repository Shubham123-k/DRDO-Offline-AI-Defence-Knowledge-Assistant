from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="gemma4:26b",
    temperature=0.2,
)


def generate_answer(context: str, question: str):
    prompt = f"""
You are an Offline Defence Knowledge Assistant.
Answer ONLY from the provided context.
If the answer is not present in the context, reply:
"I could not find this information in the uploaded documents."
Context:

{context}

Question:

{question}

Answer:
"""

    response = llm.invoke(prompt)

    return response.content