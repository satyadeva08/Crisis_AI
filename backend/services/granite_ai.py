import os
import json
from dotenv import load_dotenv

from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams


# Load variables from .env
load_dotenv()


class GraniteAIService:

    def __init__(self):
        self.api_key = os.getenv("WATSONX_API_KEY")
        self.project_id = os.getenv("WATSONX_PROJECT_ID")
        self.url = os.getenv("WATSONX_URL")

        # We are using Granite 4 H Small
        self.model_id = "ibm/granite-4-h-small"

        self.model = None

        self._initialize_model()

    def _initialize_model(self):

        if not self.api_key:
            print("WARNING: WATSONX_API_KEY not found")
            return

        if not self.project_id:
            print("WARNING: WATSONX_PROJECT_ID not found")
            return

        if not self.url:
            print("WARNING: WATSONX_URL not found")
            return

        try:

            credentials = Credentials(
                api_key=self.api_key,
                url=self.url
            )

            parameters = {
                GenParams.MAX_NEW_TOKENS: 500,
                GenParams.TEMPERATURE: 0.1
            }

            self.model = ModelInference(
                model_id=self.model_id,
                credentials=credentials,
                project_id=self.project_id,
                params=parameters
            )

            print("IBM Granite initialized successfully")
            print(f"Granite model: {self.model_id}")

        except Exception as e:

            print("ERROR initializing IBM Granite:")
            print(str(e))

            self.model = None

    def analyze_emergency(
        self,
        description,
        location=None,
        nlp_data=None,
        vision_data=None,
        sop_context=None
    ):

        # Make sure optional values are always dictionaries/strings
        if nlp_data is None:
            nlp_data = {}

        if vision_data is None:
            vision_data = {}

        if sop_context is None:
            sop_context = "No emergency SOP information available."

        prompt = f"""
You are ResQ AI, an emergency intelligence system.

Analyze the following emergency report.

EMERGENCY DESCRIPTION:
{description}

LOCATION:
{location}

NLP ANALYSIS:
{json.dumps(nlp_data, indent=2)}

COMPUTER VISION ANALYSIS:
{json.dumps(vision_data, indent=2)}

EMERGENCY SAFETY SOP:
{sop_context}

Your task is to assess the emergency and provide a structured response.

Determine:

1. Severity score from 1 to 10.
2. Emergency category.
3. Urgency level.
4. Short emergency summary.
5. Immediate safety actions.
6. Recommended rescue resources.
7. Priority rank.

Return ONLY valid JSON using exactly this structure:

{{
    "severity_score": 1,
    "emergency_category": "Flood",
    "urgency_level": "Critical",
    "summary": "Short explanation",
    "immediate_actions": [
        "Action 1",
        "Action 2"
    ],
    "recommended_resources": [
        "Resource 1",
        "Resource 2"
    ],
    "priority_rank": 1
}}
"""

        # If Granite could not be initialized
        if self.model is None:

            return {
                "success": False,
                "engine": "IBM Granite unavailable",
                "error": "Granite model was not initialized"
            }

        try:

            response = self.model.generate_text(
                prompt=prompt
            )

            print("\n===== RAW GRANITE RESPONSE =====")
            print(response)
            print("================================\n")

            # Try to convert Granite's response into JSON
            result = self._parse_json_response(response)

            result["success"] = True
            result["engine"] = "IBM watsonx.ai - Granite"

            return result

        except Exception as e:

            print("ERROR calling IBM Granite:")
            print(str(e))

            return {
                "success": False,
                "engine": "IBM Granite",
                "error": str(e)
            }

    def _parse_json_response(self, response):

        # Remove markdown code fences if Granite returns them
        cleaned = response.strip()

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

            # If the model returns text instead of JSON,
            # preserve the response rather than crashing.
            return {
                "severity_score": None,
                "emergency_category": "Unknown",
                "urgency_level": "Unknown",
                "summary": response,
                "immediate_actions": [],
                "recommended_resources": [],
                "priority_rank": None
            }


# Create one shared Granite service
granite_service = GraniteAIService()