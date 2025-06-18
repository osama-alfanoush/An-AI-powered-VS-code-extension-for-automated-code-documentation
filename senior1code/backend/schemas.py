from pydantic import BaseModel

class PromptInput(BaseModel):
    prompt: str

class GeneratedResponse(BaseModel):
    result: str