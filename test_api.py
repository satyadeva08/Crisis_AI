import requests

url = "http://127.0.0.1:5000/api/emergency/report"

data = {
    "description": "Flood water has entered my house",
    "latitude": "13.0827",
    "longitude": "80.2707"
}

image_path = r"C:\Users\Satyadeva\Downloads\images.jpg"

with open(image_path, "rb") as image:
    files = {
        "image": image
    }

    response = requests.post(
        url,
        data=data,
        files=files
    )

print("Status Code:", response.status_code)
print("Response:")
print(response.json())