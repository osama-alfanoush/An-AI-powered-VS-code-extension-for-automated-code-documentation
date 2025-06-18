from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.generation_service import GenerationService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Code Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptInput(BaseModel):
    prompt: str

class GeneratedResponse(BaseModel):
    result: str

def validate_prompt(prompt: str):
    if 'Code:' not in prompt:
        raise ValueError("Missing code section")
    parts = prompt.split("Code:", 1)
    if len(parts[0].strip()) < 10:
        raise ValueError("System prompt too short (min 10 characters)")
    if len(parts[1].strip()) < 10:
        raise ValueError("Code content too short (min 10 characters)")

generation_service = GenerationService()

@app.post("/generate-docs", response_model=GeneratedResponse)
async def generate_docs(input: PromptInput):
    try:
        validate_prompt(input.prompt)
        system_prompt, user_code = input.prompt.split("Code:", 1)
        result = generation_service.generate_docs(system_prompt.strip(), user_code.strip())
        return {"result": result}
    except Exception as e:
        logger.error(f"Error generating docs: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
