def get_allowed_classifications(clearance: str):
    clearance = clearance.lower()

    if clearance == "public":
        return ["Public"]

    if clearance == "confidential":
        return [
            "Public",
            "Confidential",
        ]

    if clearance == "secret":
        return [
            "Public",
            "Confidential",
            "Secret",
        ]

    return []