"""ClinixTech Assist Core.

The package is deliberately product-neutral: JaundiCare is its first caller,
but every future product must bring its own approved knowledge pack and safety
policy.  The module contains no client credentials and does not persist chat
messages.
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .service import AssistantAnswer, answer_question

__all__ = ["AssistantAnswer", "answer_question"]


def __getattr__(name: str):
    """Keep static knowledge tooling importable without an inference runtime."""

    if name in __all__:
        from .service import AssistantAnswer, answer_question

        return {"AssistantAnswer": AssistantAnswer, "answer_question": answer_question}[name]
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
