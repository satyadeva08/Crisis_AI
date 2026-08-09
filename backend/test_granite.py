from services.granite_ai import granite_service

print("========================================")
print("       RESQ AI - GRANITE TEST")
print("========================================")

result = granite_service.analyze_emergency(
    description=(
        "Severe flood water has entered a residential area. "
        "Several vehicles are submerged and people are trapped "
        "inside houses. Immediate rescue is required."
    ),

    location="Latitude: 13.0827, Longitude: 80.2707",

    nlp_data={
        "victims_count": 5,
        "is_trapped": True,
        "has_medical_need": False,
        "required_resources": [
            "rescue boat",
            "rescue team",
            "medical team"
        ],
        "urgency_keywords": [
            "severe",
            "trapped",
            "rescue",
            "emergency"
        ]
    },

    vision_data={
        "scene_type": "Flood / Submerged Area",
        "visual_severity_score": 9,
        "detected_hazards": [
            {
                "hazard": "Flood water",
                "confidence": 0.95
            },
            {
                "hazard": "Submerged vehicles",
                "confidence": 0.91
            },
            {
                "hazard": "Blocked road",
                "confidence": 0.88
            }
        ]
    },

    sop_context=(
        "Move victims to higher ground. "
        "Do not walk or drive through flood water. "
        "Deploy rescue boats for stranded people. "
        "Prioritize trapped victims and medical emergencies."
    )
)

print("\n========== GRANITE RESULT ==========")
print(result)
print("====================================")