"""Safety-bounded, stateless answers for ClinixTech Assist clients."""

from __future__ import annotations

from dataclasses import dataclass
import logging
import re

from .knowledge import KnowledgeCard, retrieve_cards, retrieve_direct_card
from .providers import ProviderUnavailable, generate
from .safety import INFORMATION_ACTION, SafetyDecision, assess_safety


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class AssistantAnswer:
    response: str
    action: str
    source: str
    provider: str
    content_version: str
    citations: tuple[dict[str, str], ...]
    safety_reason: str | None = None


_UNSAFE_MODEL_PATTERNS = (
    r"\bdiagnos(?:e|is|ed)\b",
    r"\b(?:take|give|use)\b.{0,30}\b(?:mg|ml|tablet|medicine|medication|antibiotic|drug)\b",
    r"\bprescrib(?:e|ed|ing)\b",
    r"\bcure[sd]?\b",
)

_PHONE_PATTERN = re.compile(
    r"(?<!\w)(?:\+?234|0)(?:[\s().-]*\d){9,10}(?!\w)",
    flags=re.IGNORECASE,
)
_EMAIL_PATTERN = re.compile(r"\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b", flags=re.IGNORECASE)
_NAME_PATTERN = re.compile(
    r"\b(?:my name is|i am|i'm|baby(?:'s)? name is|the baby's name is)\s+"
    r"[A-Za-z][A-Za-z'’-]{1,40}",
    flags=re.IGNORECASE,
)
_PROMPT_INJECTION_PATTERN = re.compile(
    r"\b(?:ignore|disregard|override)\b.{0,80}\b(?:previous|system|instruction|rule|prompt)\b"
    r"|\b(?:reveal|show|print)\b.{0,80}\b(?:system prompt|secret instruction)\b",
    flags=re.IGNORECASE | re.DOTALL,
)


def _redact_outbound_text(question: str) -> str:
    """Minimise common direct identifiers before a hosted provider sees text.

    The original request remains in memory only for deterministic safety and
    retrieval. It is never persisted or logged. This is defence in depth, not
    permission to submit clinical identifiers to a third party: clients should
    still prompt users not to include names, phone numbers or record numbers.
    """

    redacted = _PHONE_PATTERN.sub("[phone number removed]", question)
    redacted = _EMAIL_PATTERN.sub("[email removed]", redacted)
    return _NAME_PATTERN.sub("[name removed]", redacted)


def _citations(cards: list[KnowledgeCard]) -> tuple[dict[str, str], ...]:
    return tuple(
        {
            "id": card.id,
            "title": card.source_title,
            "url": card.source_url,
            "version": card.version,
        }
        for card in cards
    )


def _fallback(cards: list[KnowledgeCard]) -> str:
    if cards:
        return "\n\n".join(card.answer for card in cards)
    return (
        "I cannot safely answer that from the current JaundiCare information "
        "currently available. Please ask a qualified health worker or immunisation "
        "clinic for guidance."
    )


def _assistant_identity(domain: str) -> str:
    if domain == "immunisation-ng":
        return (
            "You are VaccineAI, a clear vaccination-information assistant for pregnant "
            "women and caregivers of children from birth to two years. Support questions "
            "about maternal vaccines, routine childhood vaccines, missed doses, child health "
            "cards and clinic visits."
        )
    return (
        "You are BabyAI, a warm, practical health-information assistant for pregnant women, "
        "new mothers and caregivers. Support questions from pregnancy, through birth and "
        "postnatal recovery, to a child's second birthday. Prioritise feeding, newborn care, "
        "maternal wellbeing, child development and when to seek care."
    )


def _prompt(domain: str, question: str, language: str, cards: list[KnowledgeCard]) -> list[dict[str, str]]:
    source_material = "\n\n".join(
        f"[{card.id}] {card.title}: {card.answer}" for card in cards
    )
    system = (
        f"{_assistant_identity(domain)} "
        "Answer only from the allowed source material below. Do not diagnose, name "
        "a bilirubin level, prescribe medication, give a dose, invent an immunisation "
        "schedule, or claim certainty. Start with the answer; use 1–2 short sentences "
        f"(maximum 45 words) in the requested language code '{language}'. Do not lead "
        "with 'According to WHO', 'I cannot provide medical advice', or a general "
        "clinic disclaimer when the source material answers the question. Only direct "
        "the user to a health worker or clinic when the material does not answer the "
        "question or explicitly requires confirmation.\n\n"
        "ALLOWED SOURCE MATERIAL:\n"
        f"{source_material}"
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": question},
    ]


def _model_answer_is_acceptable(answer: str) -> bool:
    if not 1 <= len(answer) <= 1_100:
        return False
    normalized = answer.lower()
    return not any(re.search(pattern, normalized, flags=re.DOTALL) for pattern in _UNSAFE_MODEL_PATTERNS)


def _looks_like_prompt_injection(question: str) -> bool:
    return bool(_PROMPT_INJECTION_PATTERN.search(question))


async def answer_question(
    *,
    domain: str,
    question: str,
    language: str = "en",
) -> AssistantAnswer:
    """Answer one independent request without retaining a conversation transcript."""

    safety: SafetyDecision = assess_safety(question, language)
    cards = retrieve_cards(domain, question)
    citations = _citations(cards)
    content_version = cards[0].version if cards else "2026.1-draft"

    # Danger actions do not wait for retrieval or model inference.
    if safety.action != INFORMATION_ACTION:
        return AssistantAnswer(
            response=safety.response or _fallback(cards),
            action=safety.action,
            source="ClinixTech deterministic safety policy",
            provider="rules",
            content_version=content_version,
            citations=citations,
            safety_reason=safety.reason,
        )

    # High-frequency questions receive concise, source-backed wording rather
    # than a variable LLM paraphrase. The model remains available for other
    # questions; it is simply not allowed to dilute these clear next steps.
    direct_card = retrieve_direct_card(domain, question) if language == "en" else None
    if direct_card:
        return AssistantAnswer(
            response=direct_card.answer,
            action=INFORMATION_ACTION,
            source="ClinixAI curated quick answer",
            provider="retrieval",
            content_version=direct_card.version,
            citations=_citations([direct_card]),
        )

    fallback = _fallback(cards)
    if not cards:
        return AssistantAnswer(
            response=fallback,
            action=INFORMATION_ACTION,
            source="ClinixTech source-backed content fallback",
            provider="retrieval",
            content_version=content_version,
            citations=citations,
        )

    # Do not send instructions intended to alter the safety boundary to a
    # model provider. A useful, source-backed answer is still returned.
    if _looks_like_prompt_injection(question):
        logger.warning("ClinixTech Assist rejected an attempted prompt override")
        return AssistantAnswer(
            response=fallback,
            action=INFORMATION_ACTION,
            source="ClinixTech source-backed content fallback",
            provider="retrieval",
            content_version=content_version,
            citations=citations,
        )

    try:
        generated, provider = await generate(
            _prompt(domain, _redact_outbound_text(question), language, cards)
        )
    except ProviderUnavailable as error:
        # Questions and replies are deliberately not logged.  This operational
        # event is enough to diagnose a provider outage without retaining PHI.
        logger.warning("ClinixTech Assist inference fallback: %s", error)
        generated, provider = fallback, "retrieval"

    if not _model_answer_is_acceptable(generated):
        logger.warning("ClinixTech Assist rejected a provider response by safety policy")
        generated, provider = fallback, "retrieval"

    return AssistantAnswer(
        response=generated,
        action=INFORMATION_ACTION,
        source="ClinixTech source-backed knowledge pack",
        provider=provider,
        content_version=content_version,
        citations=citations,
    )
