from services.rag_service import rag_service
from services.granite_ai import granite_service


print("========================================")
print("     RESQ AI - RAG + GRANITE TEST")
print("========================================")


# -------------------------------------------------
# 1. Emergency report
# -------------------------------------------------

description = """
Severe flood water has entered a residential area.
Several people are trapped inside houses and vehicles
are submerged. Immediate rescue is required.
"""


location = {
    "latitude": 13.0827,
    "longitude": 80.2707
}


print("\n[1] Emergency received")
print(description)


# -------------------------------------------------
# 2. Retrieve relevant safety knowledge using RAG
# -------------------------------------------------

print("\n[2] Searching disaster knowledge base...")

rag_context = rag_service.get_context(
    query=description,
    top_k=3
)


print("\n[3] RAG retrieved:")
print(rag_context)


# -------------------------------------------------
# 3. Send emergency + RAG knowledge to Granite
# -------------------------------------------------

print("\n[4] Sending information to IBM Granite...")


result = granite_service.analyze_emergency(
    description=description,

    location=location,

    nlp_data={
        "victims_count": 5,
        "is_trapped": True,
        "has_medical_need": False,
        "required_resources": [
            "rescue boat",
            "rescue team",
            "medical team"
        ]
    },

    vision_data={
        "scene_type": "Flood / Submerged Area",
        "visual_severity_score": 9,
        "detected_hazards": [
            "Flood water",
            "Submerged vehicles",
            "Blocked road"
        ]
    },

    # THIS IS THE IMPORTANT PART
    # RAG knowledge is being supplied to Granite.
    sop_context=rag_context
)


# -------------------------------------------------
# 4. Display final AI decision
# -------------------------------------------------

print("\n========================================")
print("       FINAL RESQ AI RESULT")
print("========================================")

print(result)

print("\n========================================")
print("              TEST END")
print("========================================")