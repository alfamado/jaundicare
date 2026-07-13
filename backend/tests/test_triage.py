from backend.app.services.triage_engine import run_triage


def test_triage_rules():
    cases = [
        # --- GREEN cases ---
        {
            "name": "Healthy baby no signs",
            "input": {
                "age_hours": 10,
                "feeding": "good"
            },
            "expected": "GREEN"
        },

        # --- RED cases ---
        {
            "name": "Poor feeding",
            "input": {
                "age_hours": 30,
                "feeding": "poor"
            },
            "expected": "AMBER"
        },

        {
            "name": "Difficult to wake",
            "input": {
                "age_hours": 20,
                "feeding": "good",
                "difficult_to_wake": True
            },
            "expected": "RED"
        },

        {
            "name": "First 24h jaundice suspected",
            "input": {
                "age_hours": 10,
                "feeding": "good",
                "jaundice_first_24h": True
            },
            "expected": "RED"
        },

        {
            "name": "Yellow eyes in first 24h",
            "input": {
                "age_hours": 12,
                "feeding": "good",
                "yellow_eyes": True
            },
            "expected": "RED"
        },

        # --- AMBER cases ---
        {
            "name": "Yellow eyes after 24h",
            "input": {
                "age_hours": 40,
                "feeding": "good",
                "yellow_eyes": True
            },
            "expected": "AMBER"
        },

        {
            "name": "Jaundice spreading",
            "input": {
                "age_hours": 50,
                "feeding": "good",
                "jaundice_spreading": True
            },
            "expected": "AMBER"
        },
    ]

    print("\nRunning triage tests...\n")

    failures = []

    for case in cases:
        level, _, _ = run_triage(case["input"])
        result = "PASS" if level == case["expected"] else "FAIL"

        print(f"{case['name']} -> expected={case['expected']} got={level} [{result}]")

        if result == "FAIL":
            failures.append(case["name"])

    assert not failures, f"Triage rule failures: {', '.join(failures)}"
    print(f"\n{len(cases)}/{len(cases)} tests passed\n")


if __name__ == "__main__":
    test_triage_rules()
