from strategies.huggingface_strategy import HuggingFaceStrategy
from strategies.strategy_context import StrategyContext

class GenerationService:
    def __init__(self):
        strategy = HuggingFaceStrategy()
        self.context = StrategyContext(strategy)

    def generate_docs(self, system_prompt: str, user_code: str) -> str:
        return self.context.execute(system_prompt, user_code)
