import re
from datetime import datetime
import requests


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


def reverse_geocode(latitude, longitude):
    """
    Convert raw GPS coordinates into a human-readable location address using 
    OpenStreetMap Nominatim (Free, no API key required).
    """
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?lat={latitude}&lon={longitude}&format=json"
        headers = {
            "User-Agent": "ResQAIAssistant/1.0 (Hackathon Emergency App)"
        }
        # Add timeout so it doesn't block emergency processing if the service is down
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if "display_name" in data:
                return data["display_name"]
    except Exception as e:
        print("Geocoding failed:", str(e))
        pass
        
    return "Unknown Physical Address"

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

    # Attempt to reverse geocode the coordinates into a physical address
    physical_address = reverse_geocode(latitude, longitude)

    # Create structured data
    processed_data = {
        "description": cleaned_description,
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "address": physical_address
        },
        "image": image_info,
        "processed_at": datetime.utcnow().isoformat() + "Z",
        "status": "ready_for_ai"
    }

    return processed_data