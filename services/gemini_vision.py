import os
import json
import base64
import mimetypes
import requests

from dotenv import load_dotenv


load_dotenv()


class GeminiVisionService:

    def __init__(self):

        self.api_key = os.getenv("GEMINI_API_KEY")

        # Stable Gemini model with image understanding
        self.model_id = "gemini-3.6-flash"

        self.api_url = (
            f"https://generativelanguage.googleapis.com/v1beta/"
            f"models/{self.model_id}:generateContent"
        )

        if self.api_key:
            print("Gemini Vision initialized successfully")
            print(f"Gemini model: {self.model_id}")
        else:
            print("WARNING: GEMINI_API_KEY not found")

    def analyze_image(
        self,
        image_path,
        emergency_description="",
        location=None
    ):
        """
        Analyze an emergency image.

        The analysis has two stages conceptually:

        1. Assess whether the image is visually consistent
           with the supplied emergency information.

        2. Analyze the actual emergency scene.

        NOTE:
        This is an AI assessment, not forensic proof of
        image authenticity.
        """

        if not self.api_key:

            return {
                "success": False,
                "engine": "Google Gemini",
                "error": "GEMINI_API_KEY not configured"
            }

        if not os.path.exists(image_path):

            return {
                "success": False,
                "engine": "Google Gemini",
                "error": f"Image not found: {image_path}"
            }

        try:

            # -------------------------------------------------
            # Read image
            # -------------------------------------------------

            with open(image_path, "rb") as image_file:
                image_bytes = image_file.read()

            # Convert image to Base64
            image_base64 = base64.b64encode(
                image_bytes
            ).decode("utf-8")

            # Detect MIME type
            mime_type, _ = mimetypes.guess_type(image_path)

            if mime_type is None:
                mime_type = "image/jpeg"

            # -------------------------------------------------
            # Gemini prompt
            # -------------------------------------------------

            prompt = f"""
You are the visual intelligence component of RESQ AI,
an emergency response intelligence system.

You have received an emergency report and an image.

Your job has TWO PRIMARY STAGES.

==================================================
STAGE 1 — INFORMATION / IMAGE VERIFICATION
==================================================

Assess whether the image appears consistent with the
information supplied by the user.

USER EMERGENCY DESCRIPTION:
{emergency_description}

USER LOCATION:
{json.dumps(location or {}, indent=2)}

Determine:

1. Whether the image appears visually consistent with
   the emergency description.

2. Whether there are visible signs suggesting that the
   image may be manipulated, AI-generated, edited,
   misleading, or unrelated.

3. Whether the image contains enough evidence to support
   the user's description.

IMPORTANT:

Do NOT claim that an image is definitively real or fake
based only on visual inspection.

Use cautious categories:

- likely_real
- likely_fake
- uncertain
- insufficient_evidence

==================================================
STAGE 2 — EMERGENCY IMAGE ANALYSIS
==================================================

If the image contains a genuine-looking emergency scene,
analyze the visible situation.

Identify:

- disaster type
- visible hazards
- visible damage
- people/victims
- vehicles
- buildings
- roads
- water
- fire (if present, identify fuel source: buildings, forests, trees, vehicles)
- smoke
- structural damage
- electrical hazards
- accessibility problems
- possible rescue requirements
- vulnerable surroundings (e.g., dense buildings near a fire)

Estimate visual severity from 1 to 10.

Do not invent details that cannot be observed.

==================================================
RETURN ONLY JSON
==================================================

Use exactly this structure:

{{
    "verification_status": "likely_real",
    "verification_confidence": 0,
    "verification_reason": "Short explanation",

    "claim_consistency": "consistent",
    "claim_consistency_reason": "Short explanation",

    "possible_manipulation_signs": [],

    "scene_type": "Flood",

    "visual_severity_score": 1,

    "detected_hazards": [],

    "visible_victims": 0,

    "visible_damage": [],

    "visible_rescue_needs": [],

    "summary": "Short description of what is visibly present"
}}

Rules:

- verification_confidence must be between 0 and 100.
- visual_severity_score must be between 1 and 10.
- visible_victims should only count people clearly visible.
- Do not assume hidden victims.
- Do not claim forensic certainty.
- Return ONLY valid JSON.
"""

            # -------------------------------------------------
            # Request body
            # -------------------------------------------------

            payload = {

                "contents": [
                    {
                        "parts": [

                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": image_base64
                                }
                            },

                            {
                                "text": prompt
                            }

                        ]
                    }
                ],

                "generationConfig": {
                    "responseMimeType": "application/json"
}
            }

            # -------------------------------------------------
            # Send request
            # -------------------------------------------------

            headers = {
                "Content-Type": "application/json",
                "x-goog-api-key": self.api_key
            }

            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=120
            )

            # -------------------------------------------------
            # Handle API errors
            # -------------------------------------------------

            if response.status_code != 200:

                return {
                    "success": False,
                    "engine": "Google Gemini",
                    "status_code": response.status_code,
                    "error": response.text
                }

            data = response.json()

            # -------------------------------------------------
            # Extract Gemini text
            # -------------------------------------------------

            candidates = data.get("candidates", [])

            if not candidates:

                return {
                    "success": False,
                    "engine": "Google Gemini",
                    "error": "Gemini returned no candidates"
                }

            parts = (
                candidates[0]
                .get("content", {})
                .get("parts", [])
            )

            text_response = ""

            for part in parts:

                if "text" in part:
                    text_response += part["text"]

            if not text_response:

                return {
                    "success": False,
                    "engine": "Google Gemini",
                    "error": "Gemini returned an empty response"
                }

            # -------------------------------------------------
            # Parse JSON
            # -------------------------------------------------

            result = self._parse_json_response(
                text_response
            )

            result["success"] = True
            result["engine"] = "Google Gemini Vision"

            return result

        except requests.exceptions.Timeout:

            return {
                "success": False,
                "engine": "Google Gemini",
                "error": "Gemini API request timed out"
            }

        except requests.exceptions.RequestException as e:

            return {
                "success": False,
                "engine": "Google Gemini",
                "error": f"Gemini network error: {str(e)}"
            }

        except Exception as e:

            return {
                "success": False,
                "engine": "Google Gemini",
                "error": str(e)
            }

    def _parse_json_response(self, response):

        cleaned = response.strip()

        # Remove markdown fences if present
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]

        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]

        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]

        cleaned = cleaned.strip()

        try:

            return json.loads(cleaned)

        except json.JSONDecodeError:

            return {
                "verification_status": "uncertain",
                "verification_confidence": 0,
                "verification_reason": (
                    "Gemini returned a response that "
                    "could not be parsed as JSON."
                ),

                "claim_consistency": "uncertain",
                "claim_consistency_reason": "",

                "possible_manipulation_signs": [],

                "scene_type": "Unknown",

                "visual_severity_score": None,

                "detected_hazards": [],
                "visible_victims": 0,
                "visible_damage": [],
                "visible_rescue_needs": [],

                "summary": response
            }


# Create shared service
gemini_vision_service = GeminiVisionService()