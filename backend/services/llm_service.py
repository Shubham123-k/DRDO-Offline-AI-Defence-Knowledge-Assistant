import os
import time

from langchain_ollama import ChatOllama
from services.prompt_service import build_prompt


llm = ChatOllama(
    model=os.getenv("OLLAMA_MODEL"),
    base_url=os.getenv("OLLAMA_BASE_URL"),
    reasoning=False,
    temperature=0.2,
    num_predict=500,
    num_ctx=4096,
)

def generate_answer(
    context: str,
    question: str,
    conversation_history: str = "",
):
    start_time = time.perf_counter()

    prompt = build_prompt(
        context=context,
        question=question,
        conversation_history=conversation_history,
    )

    print(
        f"LLM: Prompt built in "
        f"{time.perf_counter() - start_time:.2f} seconds"
    )

    print("LLM: Sending request to Ollama...")
    print(f"LLM: Model = {os.getenv('OLLAMA_MODEL')}")

    print(
        f"LLM: Context characters = "
        f"{len(context)}"
    )

    print(
        f"LLM: Question = "
        f"{question}"
    )

    if conversation_history:
        print(
            f"LLM: Conversation history characters = "
            f"{len(conversation_history)}"
        )

    try:
        response = llm.invoke(prompt)

    except Exception as error:
        print(
            f"LLM: Ollama request failed: "
            f"{error}"
        )
        raise

    elapsed = time.perf_counter() - start_time

    print(
        f"LLM: Response received in "
        f"{elapsed:.2f} seconds"
    )

    print(
        f"LLM: Response type = "
        f"{type(response)}"
    )

    if response is None:
        raise ValueError(
            "Ollama returned no response."
        )

    content = response.content

    print(
        f"LLM: Content type = "
        f"{type(content)}"
    )

    print(
        f"LLM: Content preview = "
        f"{str(content)[:200]}"
    )

    if isinstance(content, list):
        parts = []

        for item in content:
            if isinstance(item, str):
                parts.append(item)

            elif isinstance(item, dict):
                text = item.get("text")

                if text:
                    parts.append(text)

        content = "".join(parts)

    if content is None:
        raise ValueError(
            "Ollama returned an empty answer."
        )

    content = str(content).strip()

    if not content:
        raise ValueError(
            "Ollama returned an empty answer."
        )

    return content