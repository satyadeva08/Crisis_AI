from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
from services.data_processing import process_emergency_data
from services.rag_service import rag_service
from services.granite_ai import granite_service
from services.gemini_vision import gemini_vision_service

app = Flask(__name__)
CORS(app)

# Upload configuration
UPLOAD_FOLDER = "uploads/images"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


@app.route("/")
def home():
    return jsonify({
        "message": "ResQ AI Backend is running!"
    })


@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "ResQ AI Backend"
    })


@app.route("/api/emergency/report", methods=["POST"])
def create_emergency_report():

    description = request.form.get("description")
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")

    # Validate description
    if not description:
        return jsonify({
            "success": False,
            "error": "Emergency description is required"
        }), 400

    image_info = None

    # Check if an image was uploaded
    if "image" in request.files:

        image = request.files["image"]

        if image.filename == "":
            return jsonify({
                "success": False,
                "error": "Image filename is empty"
            }), 400

        if not allowed_file(image.filename):
            return jsonify({
                "success": False,
                "error": "Invalid image format. Use PNG, JPG, JPEG or WEBP."
            }), 400

        # Generate unique filename
        extension = image.filename.rsplit(".", 1)[1].lower()
        filename = f"{uuid.uuid4()}.{extension}"

        filepath = os.path.join(
            app.config["UPLOAD_FOLDER"],
            secure_filename(filename)
        )

        image.save(filepath)

        image_info = {
            "filename": filename,
            "path": filepath
        }

    try:
        processed_data = process_emergency_data(
        description=description,
        latitude=latitude,
        longitude=longitude,
        image_info=image_info
    )

    except ValueError as error:
        return jsonify({
        "success": False,
        "error": str(error)
    }), 400

    # Retrieve relevant disaster safety knowledge
    rag_context = rag_service.get_context(
    query=processed_data["description"],
    top_k=3
)
    # Information currently available from our system
    nlp_data = {
    "source": "Emergency description",
    "description": processed_data["description"]
}

    # -------------------------------------------------
# Gemini Vision Analysis
# -------------------------------------------------

    vision_data = {}

    if processed_data.get("image"):

        image_path = processed_data["image"].get("path")

        if image_path:

            vision_result = gemini_vision_service.analyze_image(
            image_path=image_path,
            emergency_description=processed_data["description"],
            location=processed_data["location"]
        )

        vision_data = vision_result

    else:

        vision_data = {
        "success": False,
        "message": "No image was provided."
    }
    # Send emergency information + RAG knowledge to Granite
    ai_result = granite_service.analyze_emergency(
    description=processed_data["description"],

    location=processed_data["location"],

    nlp_data=nlp_data,

    vision_data=vision_data,

    sop_context=rag_context
)

    report = {
     "id": str(uuid.uuid4()),
    **processed_data,
    "vision_analysis": vision_data,
    "ai_analysis": ai_result,
    "rag_context": rag_context

}

    return jsonify({
        "success": True,
        "message": "Emergency report received successfully",
        "report": report
    }), 201


if __name__ == "__main__":
    app.run(debug=True, port=5000)