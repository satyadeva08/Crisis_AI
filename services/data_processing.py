import re
from datetime import datetime


def clean_text(text):
    """
    Clean and normalize emergency report text.
    """

    if not text:
        return ""

    # Remove unnecessary spaces
    text = text.strip()

    # Replace multiple spaces with one space
    text = re.sub(r"\s+", " ", text)

    return text


def validate_coordinates(latitude, longitude):
    """
    Validate latitude and longitude.
    """

    try:
        latitude = float(latitude)
        longitude = float(longitude)
    except (TypeError, ValueError):
        return False, None, None

    if latitude < -90 or latitude > 90:
        return False, None, None

    if longitude < -180 or longitude > 180:
        return False, None, None

    return True, latitude, longitude


def process_emergency_data(
    description,
    latitude,
    longitude,
    image_info=None
):
    """
    Clean and structure raw emergency data.
    """

    # Clean description
    cleaned_description = clean_text(description)

    if not cleaned_description:
        raise ValueError("Emergency description cannot be empty.")

    # Validate location
    valid, latitude, longitude = validate_coordinates(
        latitude,
        longitude
    )

    if not valid:
        raise ValueError("Invalid latitude or longitude.")

    # Create structured data
    processed_data = {
        "description": cleaned_description,
        "location": {
            "latitude": latitude,
            "longitude": longitude
        },
        "image": image_info,
        "processed_at": datetime.utcnow().isoformat() + "Z",
        "status": "ready_for_ai"
    }

    return processed_data