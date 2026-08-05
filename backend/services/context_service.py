from collections import deque
from typing import List

class ContextService:
    @staticmethod
    def create_sliding_window(size: int = 10) -> deque:
        """
        Creates a sliding window queue of fixed size.
        """
        return deque(maxlen=size)

    @staticmethod
    def extract_context_list(window: deque) -> List[str]:
        """
        Extracts string content from the sliding window.
        """
        return list(window)
