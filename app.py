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
from services.supabase_client import supabase

app = Flask(__name__, static_folder='app/dist', static_url_path='/')
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


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return app.send_static_file(path)
    else:
        return app.send_static_file("index.html")


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

    # -------------------------------------------------
    # Save to Supabase Database
    # -------------------------------------------------
    incident_id = report["id"]
    public_image_url = None
    
    if supabase:
        try:
            # 1. Upload image to Supabase Storage if it exists
            if image_info and image_info.get("path"):
                with open(image_info["path"], "rb") as f:
                    file_ext = image_info["filename"].rsplit(".", 1)[1].lower()
                    storage_path = f"{incident_id}.{file_ext}"
                    supabase.storage.from_("incident-images").upload(
                        file=f,
                        path=storage_path,
                        file_options={"content-type": f"image/{file_ext}"}
                    )
                    public_image_url = supabase.storage.from_("incident-images").get_public_url(storage_path)

            # Extract priority and severity from AI result (defaulting if AI didn't provide them clearly)
            severity = ai_result.get("severity_level", "medium").lower()
            if severity not in ['low', 'medium', 'high', 'critical']:
                severity = 'medium'
            
            # 2. Insert main incident record
            category = request.form.get("category", "General Emergency")
            contact_name = request.form.get("contactName", "Citizen Report")
            contact_phone = request.form.get("contactPhone", "")
            
            supabase.table("incidents").insert({
                "incident_id": incident_id,
                "title": f"{category} — AI Verified Report",
                "description": processed_data["description"],
                "disaster_type": category,
                "status": "reported",
                "severity_level": severity,
                "latitude": processed_data["location"]["latitude"],
                "longitude": processed_data["location"]["longitude"],
                "reported_by": contact_name,
                "contact_name": contact_name,
                "contact_phone": contact_phone
            }).execute()

            # 3. Insert Text Report
            supabase.table("text_reports").insert({
                "incident_id": incident_id,
                "report_text": processed_data["description"],
                "title": f"Report for {category}",
                "processing_status": "completed",
                "reported_at": datetime.utcnow().isoformat() + "Z"
            }).execute()

            # 4. Insert Image Record if exists
            if public_image_url:
                supabase.table("disaster_images").insert({
                    "incident_id": incident_id,
                    "image_path": storage_path,
                    "image_url": public_image_url,
                    "processing_status": "completed"
                }).execute()

            # 5. Insert AI Analysis into severity_assessments
            supabase.table("severity_assessments").insert({
                "incident_id": incident_id,
                "assessed_severity": severity,
                "reasoning": ai_result.get("reasoning", "AI completed assessment based on provided details."),
                "model_name": "ibm/granite-4-h-small"
            }).execute()

            # 6. Insert initial timeline entry
            supabase.table("incident_updates").insert({
                "incident_id": incident_id,
                "update_text": f"Incident verified by ResQ AI Backend. Assessed severity: {severity.upper()}.",
                "update_time": datetime.now().strftime("%I:%M %p")
            }).execute()

        except Exception as db_err:
            print("Database Insert Error:", str(db_err))
            # Even if DB insert fails, we return the AI report to the frontend
            pass

    report["image_url"] = public_image_url

    return jsonify({
        "success": True,
        "message": "Emergency report received successfully",
        "report": report
    }), 201


if __name__ == "__main__":
    app.run(debug=True, port=5000)