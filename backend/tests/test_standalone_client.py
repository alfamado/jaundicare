import pytest

from app.services.clinix_assist import standalone_client


def test_parse_standalone_answer_normalises_response_shape():
    answer = standalone_client._parse_answer(
        {
            "response": "Breastfeed on demand.",
            "action": "information",
            "provider": "retrieval",
            "content_version": "2026.1-draft",
            "citations": [
                {
                    "id": "newborn-feeding-001",
                    "title": "WHO source",
                    "url": "https://www.who.int/example",
                    "version": "2026.1-draft",
                }
            ],
        }
    )

    assert answer.source == "Clinix Assist standalone service"
    assert answer.provider == "retrieval"
    assert answer.citations[0]["id"] == "newborn-feeding-001"


def test_partial_standalone_configuration_is_not_silently_accepted(monkeypatch):
    monkeypatch.setenv("CLINIX_ASSIST_BASE_URL", "https://clinix-assist.onrender.com")
    monkeypatch.delenv("CLINIX_ASSIST_API_KEY", raising=False)

    with pytest.raises(standalone_client.StandaloneAssistUnavailable):
        standalone_client._configuration()
