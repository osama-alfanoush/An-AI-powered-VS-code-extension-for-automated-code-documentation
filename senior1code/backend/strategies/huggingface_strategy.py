import os
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()

class HuggingFaceStrategy:
    def __init__(self):
        api_key = os.getenv("HUGGINGFACE_API_KEY")
        if not api_key:
            raise ValueError("HUGGINGFACE_API_KEY is missing")
        self.client = InferenceClient(api_key=api_key)
        self.model_name = "deepseek-ai/DeepSeek-V3"

    def generate(self, system_prompt: str, user_code: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_code}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
