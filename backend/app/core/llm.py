import os
from transformers import pipeline

# We use Qwen2.5-0.5B-Instruct because it's exceptionally small (~0.5B parameters), 
# very fast on CPU, and has excellent instruction-following capabilities.
MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"

class LLMGenerator:
    def __init__(self):
        self.generator = None
        # Lazy initialization

    def _initialize_pipeline(self):
        try:
            print(f"Initializing LLM pipeline with {MODEL_NAME}...")
            # We use device=-1 to force CPU since we don't assume a GPU is available.
            # torch_dtype="auto" will use the default dtype.
            self.generator = pipeline(
                "text-generation",
                model=MODEL_NAME,
                device=-1
            )
            print("LLM pipeline initialized successfully.")
        except Exception as e:
            print(f"Warning: Failed to initialize LLM. Falling back to raw snippets. Error: {e}")
            self.generator = None

    def generate_answer(self, query: str, context: str) -> str:
        if not self.generator:
            self._initialize_pipeline()
            
        if not self.generator:
            return "Here is the most relevant snippet from the documentation (LLM generation failed):"

        prompt = f"""You are a helpful onboarding assistant for a software repository. 
Use the following documentation snippet to answer the user's question clearly and concisely.
If the snippet does not contain the answer, say so. Do not invent information.

Documentation Snippet:
{context}

Question:
{query}

Answer:"""

        try:
            # We restrict max_new_tokens to ensure fast responses
            result = self.generator(
                prompt,
                max_new_tokens=256,
                do_sample=False,
                return_full_text=False,
                truncation=True
            )
            return result[0]['generated_text'].strip()
        except Exception as e:
            print(f"Generation error: {e}")
            return "Here is the most relevant snippet from the documentation (Generation failed):"

# Singleton instance
llm_generator = LLMGenerator()
