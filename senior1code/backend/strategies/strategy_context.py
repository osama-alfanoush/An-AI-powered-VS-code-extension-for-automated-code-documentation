class StrategyContext:
    def __init__(self, strategy):
        self.strategy = strategy

    def execute(self, system_prompt, user_code):
        return self.strategy.generate(system_prompt, user_code)
