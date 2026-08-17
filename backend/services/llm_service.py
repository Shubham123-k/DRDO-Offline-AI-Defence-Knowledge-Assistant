from langchain_ollama import ChatOllama
from services.prompt_service import build_prompt


llm = ChatOllama(
    model="gemma4:26b",
    temperature=0.2,
)

def generate_answer(
    context: str,
    question: str,
):

    prompt = build_prompt(
        context,
        question,
    )

    response = llm.invoke(
        prompt
    )

    return response.content