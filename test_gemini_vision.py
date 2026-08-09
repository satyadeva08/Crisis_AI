from services.gemini_vision import gemini_vision_service


print("========================================")
print("       RESQ AI - GEMINI VISION TEST")
print("========================================")


image_path = (
    "uploads/images/"
    "81eae53a-79e4-4c16-bec3-5d3916a56677.jpg"
)


description = """
Flood water has entered my house.
Several people may be trapped inside the
residential area and immediate rescue may
be required.
"""


location = {
    "latitude": 13.0827,
    "longitude": 80.2707
}


print("\n[1] Sending emergency image to Gemini...")


result = gemini_vision_service.analyze_image(
    image_path=image_path,
    emergency_description=description,
    location=location
)


print("\n========================================")
print("       GEMINI VISION RESULT")
print("========================================")

print(result)

print("\n========================================")
print("              TEST END")
print("========================================")