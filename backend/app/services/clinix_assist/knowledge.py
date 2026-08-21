"""Versioned, source-backed content used by ClinixTech Assist.

This first pack is intentionally small.  It provides a testable safety
baseline while clinical reviewers expand it.  The inference model may explain
these cards, but it must never answer from knowledge outside them.
"""

from __future__ import annotations

from dataclasses import dataclass
import re
import unicodedata


CONTENT_VERSION = "2026.1-draft"


@dataclass(frozen=True)
class KnowledgeCard:
    """One clinically scoped answer selected for retrieval.

    ``review_status`` is exposed to operations, not end users. It prevents a
    draft card from being mistaken for a clinical guideline during review.
    """

    id: str
    domain: str
    title: str
    keywords: tuple[str, ...]
    answer: str
    source_title: str
    source_url: str
    direct_response: bool = False
    review_status: str = "clinical_review_required"
    version: str = CONTENT_VERSION


NEWBORN_CARE = "newborn-care"
IMMUNISATION_NG = "immunisation-ng"


KNOWLEDGE_CARDS: tuple[KnowledgeCard, ...] = (
    KnowledgeCard(
        id="newborn-breastfeeding-frequency-001",
        domain=NEWBORN_CARE,
        title="How often to breastfeed a newborn",
        keywords=(
            "how often breastfeed", "how often feed", "breastfeeding frequency",
            "how many times breastfeed", "feed day and night",
        ),
        answer=(
            "Breastfeed on demand—usually 8–12 times in 24 hours, including overnight. "
            "Feed whenever your baby roots, sucks their hands, or seems hungry."
        ),
        source_title="WHO: Infant and young child feeding",
        source_url="https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding",
        direct_response=True,
    ),
    KnowledgeCard(
        id="newborn-water-under-six-months-001",
        domain=NEWBORN_CARE,
        title="Water for a baby under six months",
        keywords=(
            "give baby water", "give my baby water", "should baby drink water",
            "baby water", "water under six months", "water hot days",
        ),
        answer=(
            "No. Babies under 6 months do not need water; breast milk provides the "
            "water they need. If your baby seems thirsty, offer an extra breastfeed."
        ),
        source_title="WHO: Breastfeeding questions and answers",
        source_url="https://www.who.int/news-room/questions-and-answers/item/breastfeeding",
        direct_response=True,
    ),
    KnowledgeCard(
        id="newborn-sleepy-feeds-001",
        domain=NEWBORN_CARE,
        title="Baby sleepy during feeds",
        keywords=(
            "sleepy during feeds", "sleepy feeding", "sleep during feeds",
            "drowsy during feeds", "baby sleepy feed",
        ),
        answer=(
            "Offer the breast again when your baby is more alert and keep offering "
            "feeds often. If your baby is hard to wake, refuses feeds, or looks "
            "yellow, take them for urgent assessment today."
        ),
        source_title="WHO: Early Essential Newborn Care",
        source_url="https://www.who.int/news-room/questions-and-answers/item/early-essential-newborn-care",
        direct_response=True,
    ),
    KnowledgeCard(
        id="newborn-feeding-001",
        domain=NEWBORN_CARE,
        title="Newborn feeding support",
        keywords=(
            "breastfeed", "breastfeeding", "breast feed", "feed", "feeding",
            "suck", "sucking", "milk", "water", "glucose water", "newborn",
        ),
        answer=(
            "For the first six months, WHO recommends only breast milk unless a "
            "health worker says otherwise. Feed responsively, day and night, when "
            "your baby shows hunger cues. Do not give water or glucose water to a "
            "newborn unless a qualified health worker specifically advises it. If "
            "your baby cannot feed, is very sleepy or difficult to wake, seek "
            "urgent medical care."
        ),
        source_title="WHO: Infant and young child feeding",
        source_url="https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding",
    ),
    KnowledgeCard(
        id="newborn-jaundice-001",
        domain=NEWBORN_CARE,
        title="Jaundice warning signs",
        keywords=(
            "jaundice", "yellow", "yellowing", "yellow skin", "yellow eyes",
            "yellow eye", "eyes", "gums", "palm", "palms", "sole", "soles",
            "bilirubin", "phototherapy", "day 1", "first day", "24 hours",
        ),
        answer=(
            "Jaundice can appear as yellowing of the eyes or skin. In babies with "
            "darker skin, check the whites of the eyes, gums, palms and soles as "
            "well as behaviour and feeding. Yellowing in the first 24 hours, yellow "
            "palms or soles, poor feeding, unusual sleepiness, dark urine or pale "
            "stool need urgent assessment. A photo screen cannot confirm bilirubin "
            "level or replace an in-person clinical assessment."
        ),
        source_title="WHO: Early Essential Newborn Care",
        source_url="https://iris.who.int/bitstream/handle/10665/361145/9789290619659-eng.pdf?sequence=1",
    ),
    KnowledgeCard(
        id="newborn-care-when-to-seek-help-001",
        domain=NEWBORN_CARE,
        title="When to seek newborn care",
        keywords=(
            "sleepy", "drowsy", "wake", "waking", "floppy", "limp", "breathing",
            "breathe", "blue", "seizure", "convulsion", "not feeding", "refusing",
            "hospital", "emergency", "danger sign",
        ),
        answer=(
            "Take a newborn for urgent assessment if they are difficult to wake for "
            "feeds, floppy, having trouble breathing, having a seizure, blue around "
            "the lips, not feeding, or have yellowing in the first 24 hours. Do not "
            "wait for a chatbot reply or a repeat photo screen when a danger sign is "
            "present."
        ),
        source_title="WHO: Early Essential Newborn Care",
        source_url="https://www.who.int/news-room/questions-and-answers/item/early-essential-newborn-care",
    ),
    KnowledgeCard(
        id="immunisation-ng-birth-direct-001",
        domain=IMMUNISATION_NG,
        title="Vaccines due at birth in Nigeria",
        keywords=(
            "vaccines due at birth", "vaccine due at birth", "vaccines at birth",
            "vaccine at birth", "birth vaccines", "birth vaccine",
        ),
        answer=(
            "At birth: BCG, OPV0 (oral polio) and hepatitis B. Take your child's "
            "health card so every dose is recorded."
        ),
        source_title="UNICEF Nigeria: Immunization Schedule",
        source_url="https://www.unicef.org/nigeria/media/9911/file/Nigeria%20Immunization%20Schedule.pdf.pdf",
        direct_response=True,
    ),
    KnowledgeCard(
        id="immunisation-ng-next-visit-001",
        domain=IMMUNISATION_NG,
        title="Next routine immunisation visit",
        keywords=(
            "next vaccines", "next vaccine", "next immunisation", "next immunization",
            "when next vaccine", "when should next", "next routine visit",
        ),
        answer=(
            "Next clinic visit: 6 weeks after birth. Take the child health card so "
            "the clinic can record the dose and confirm any missed vaccines."
        ),
        source_title="UNICEF Nigeria: Immunization Schedule",
        source_url="https://www.unicef.org/nigeria/media/9911/file/Nigeria%20Immunization%20Schedule.pdf.pdf",
        direct_response=True,
    ),
    KnowledgeCard(
        id="immunisation-ng-birth-001",
        domain=IMMUNISATION_NG,
        title="Nigeria birth immunisation visit",
        keywords=(
            "vaccine", "vaccines", "vaccination", "immunisation", "immunization",
            "birth", "born", "bcg", "opv", "polio", "hepatitis", "hep b",
            "card", "clinic", "schedule",
        ),
        answer=(
            "For a baby born in Nigeria, ask the birth facility or immunisation clinic "
            "to check the current national schedule and record every dose on the child "
            "health card. The birth visit commonly includes BCG, an oral polio birth "
            "dose (OPV0), and hepatitis B birth-dose services where available. Bring "
            "the card to every visit because schedules and availability can change by "
            "programme or facility."
        ),
        source_title="WHO Immunization Data: Nigeria vaccination schedule",
        source_url="https://immunizationdata.who.int/global/wiise-detail-page/vaccination-schedule-for-country_name?ISO_3_CODE=NGA",
    ),
    KnowledgeCard(
        id="immunisation-ng-follow-up-001",
        domain=IMMUNISATION_NG,
        title="Keeping immunisation visits on track",
        keywords=(
            "next", "missed", "late", "catch up", "catch-up", "appointment",
            "six weeks", "6 weeks", "ten weeks", "10 weeks", "fourteen weeks",
            "14 weeks", "where", "when", "card",
        ),
        answer=(
            "Take the child health card to a routine immunisation clinic so a health "
            "worker can confirm the next or catch-up dose from the current Nigerian "
            "schedule. Do not guess a catch-up timetable from a chatbot. If a dose was "
            "missed, the clinic can advise the appropriate next step and document it "
            "on the card."
        ),
        source_title="WHO Immunization Data: Nigeria vaccination schedule",
        source_url="https://immunizationdata.who.int/global/wiise-detail-page/vaccination-schedule-for-country_name?ISO_3_CODE=NGA",
    ),
)


_STOP_WORDS = {
    "a", "an", "and", "are", "at", "be", "can", "do", "for", "how", "i", "in",
    "is", "it", "my", "of", "on", "or", "please", "should", "the", "to", "what",
    "when", "with", "you", "your",
}

_DIRECT_QUESTION_PATTERNS = (
    (
        "newborn-breastfeeding-frequency-001",
        re.compile(r"\\bhow often\\b.{0,60}\\b(?:breastfeed|breast feed|feed)\\b", re.IGNORECASE),
    ),
    (
        "newborn-sleepy-feeds-001",
        re.compile(r"\\b(?:sleepy|drowsy|sleep)\\b.{0,60}\\b(?:feed|feeds|breastfeed|suck)\\b", re.IGNORECASE),
    ),
    (
        "newborn-water-under-six-months-001",
        re.compile(
            r"\\b(?:give|drink|need|should)\\b.{0,60}\\bwater\\b"
            r"|\\bwater\\b.{0,60}\\b(?:baby|newborn|month|breastfeed)\\b",
            re.IGNORECASE,
        ),
    ),
    (
        "immunisation-ng-birth-direct-001",
        re.compile(
            r"\\b(?:vaccine|vaccines|immunisation|immunization)\\b.{0,60}\\b(?:birth|born)\\b"
            r"|\\b(?:birth|born)\\b.{0,60}\\b(?:vaccine|vaccines|immunisation|immunization)\\b",
            re.IGNORECASE,
        ),
    ),
    (
        "immunisation-ng-next-visit-001",
        re.compile(
            r"\\bnext\\b.{0,60}\\b(?:vaccine|vaccines|immunisation|immunization|visit)\\b"
            r"|\\b(?:vaccine|vaccines|immunisation|immunization)\\b.{0,60}\\b(?:next|when)\\b",
            re.IGNORECASE,
        ),
    ),
)


def _normalise(value: str) -> str:
    without_marks = "".join(
        character
        for character in unicodedata.normalize("NFKD", value.lower())
        if not unicodedata.combining(character)
    )
    return re.sub(r"\s+", " ", without_marks).strip()


def _tokens(value: str) -> set[str]:
    return {
        token
        for token in re.findall(r"[a-z0-9]+", _normalise(value))
        if len(token) > 1 and token not in _STOP_WORDS
    }


def retrieve_cards(domain: str, question: str, *, limit: int = 2) -> list[KnowledgeCard]:
    """Retrieve a small, transparent set of cards without a vector database.

    A lexical scorer is intentional at this stage: it is cheap, deterministic,
    easy to test and does not send health text to an embedding provider.  The
    interface can later be backed by a reviewed embedding index without
    changing the API contract.
    """

    query = _normalise(question)
    query_tokens = _tokens(question)
    candidates: list[tuple[int, KnowledgeCard]] = []

    for card in KNOWLEDGE_CARDS:
        if card.domain != domain:
            continue

        score = 0
        for keyword in card.keywords:
            normalised_keyword = _normalise(keyword)
            if normalised_keyword in query:
                score += 4 if " " in normalised_keyword else 2
            score += len(_tokens(normalised_keyword) & query_tokens)

        if score:
            candidates.append((score, card))

    candidates.sort(key=lambda item: (-item[0], item[1].id))
    return [card for _, card in candidates[:limit]]


def retrieve_direct_card(domain: str, question: str) -> KnowledgeCard | None:
    """Return a short source-backed answer for a narrow, frequent English question.

    These curated answers prevent a language model from turning a straightforward
    parent question into a vague disclaimer. Other languages stay provider-
    backed until their wording receives clinical review.
    """

    cards_by_id = {card.id: card for card in KNOWLEDGE_CARDS if card.domain == domain}
    for card_id, pattern in _DIRECT_QUESTION_PATTERNS:
        card = cards_by_id.get(card_id)
        if card and pattern.search(question):
            return card
    return None
