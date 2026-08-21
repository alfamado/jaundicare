"""Deterministic safety policy for the ClinixTech Assist API.

This module deliberately makes the high-risk action before any generative model
is contacted. It is a conservative English/Pidgin baseline; every additional
language must receive clinician-reviewed trigger terms before being promoted.
"""

from __future__ import annotations

from dataclasses import dataclass
import re
import unicodedata

from app.i18n import tr


URGENT_ACTION = "urgent"
SAME_DAY_ACTION = "same_day"
INFORMATION_ACTION = "information"


@dataclass(frozen=True)
class SafetyDecision:
    action: str
    response: str | None = None
    reason: str | None = None


def _normalise(value: str) -> str:
    without_marks = "".join(
        character
        for character in unicodedata.normalize("NFKD", value.lower())
        if not unicodedata.combining(character)
    )
    return re.sub(r"\s+", " ", without_marks).strip()


# Phrases match direct caregiver reports, not broad health topics.  A question
# such as "what does jaundice mean" should still reach the knowledge pack.
_URGENT_PATTERNS = (
    r"\b(can(?:not|'t) wake|not waking|hard to wake|difficult to wake|unresponsive)\b",
    r"\b(floppy|limp|seizure|seizures|convulsion|convulsions)\b",
    r"\b(not breathing|cannot breathe|can(?:not|'t) breathe|struggling to breathe|difficulty breathing)\b",
    r"\b(blue lips|turning blue|lips are blue)\b",
    r"\b(yellow(?:ing)? .*first (?:24|twenty four) hours|jaundice .*first (?:24|twenty four) hours)\b",
    r"\b(yellow (?:palms|soles)|(?:palms|soles) .*yellow)\b",
    r"\b(?:poor feeding|not feeding|refusing (?:to )?feed).{0,50}\b(?:yellow|jaundice)\b",
    r"\b(?:yellow|jaundice).{0,50}\b(?:poor feeding|not feeding|refusing (?:to )?feed)\b",
    r"\b(dark urine|pale stool|white stool)\b",
    r"\b(high[- ]pitched cry|shrill cry)\b",
    r"\b(no dey breathe|pikin no dey wake|pikin no dey chop)\b",
)

_SAME_DAY_PATTERNS = (
    r"\b(not feeding|refusing (?:to )?feed|will not feed|won't feed|poor feeding)\b",
    r"\b(very sleepy|unusually sleepy|yellow eyes|yellow skin|yellow palms|yellow soles)\b",
    r"\b(jaundice.*worse|yellow(?:ing)? .*worse)\b",
    r"\b(no dey feed|e no dey chop|body dey yellow)\b",
)


def assess_safety(message: str, language: str = "en") -> SafetyDecision:
    """Return an action without delegating a danger decision to an LLM."""

    normalised = _normalise(message)
    if any(re.search(pattern, normalised) for pattern in _URGENT_PATTERNS):
        return SafetyDecision(
            action=URGENT_ACTION,
            response=tr(language, "urgent_parent"),
            reason="reported_newborn_danger_sign",
        )
    if any(re.search(pattern, normalised) for pattern in _SAME_DAY_PATTERNS):
        return SafetyDecision(
            action=SAME_DAY_ACTION,
            response=tr(language, "same_day_parent"),
            reason="reported_newborn_concern",
        )
    return SafetyDecision(action=INFORMATION_ACTION)
