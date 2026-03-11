from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uuid
import shutil
import smtplib
import os
from email.mime.text import MIMEText

from backend.matcher import final_similarity
from backend.database import supabase

app = FastAPI()

# -------- STATIC FILES SETUP --------
# This makes the images accessible to your React frontend
# URL will be: http://127.0.0.1:8000/backend/images/your_image.png
app.mount("/backend/images", StaticFiles(directory="backend/images"), name="images")

# -------- CORS SETUP --------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure the local images directory exists
IMAGE_DIR = "backend/images"
if not os.path.exists(IMAGE_DIR):
    os.makedirs(IMAGE_DIR)

@app.get("/")
def home():
    return {"message": "SmartFind AI backend running"}

# -------- EMAIL FUNCTION --------
def send_email(receiver_email):
    sender_email = "asimsudheer512@gmail.com"
    sender_password = "hzxwotgnftwomtqz"

    subject = "Lost Item Match Found!"
    body = """
Hello,

A similar item to the one you reported has been found on SmartFind.
Please log in to the platform to check the details.

Thank you.
"""
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = receiver_email

    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, receiver_email, msg.as_string())
        server.quit()
        print(f"Email sent successfully to {receiver_email}")
    except Exception as e:
        print("Email error:", e)

# -------- UPLOAD API --------
@app.post("/upload")
async def upload_item(
    description: str = Form(...),
    type: str = Form(...),
    email: str = Form(...),
    image: UploadFile = File(None)
):
    file_path = None

    if image:
        file_id = str(uuid.uuid4())
        safe_filename = image.filename.replace(" ", "_")
        file_path = f"{IMAGE_DIR}/{file_id}_{safe_filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    try:
        supabase.table("items").insert({
            "description": description,
            "type": type.lower(),
            "image_path": file_path,
            "email": email
        }).execute()
    except Exception as e:
        print("Supabase Insert Error:", e)

    search_type = "found" if type.lower() == "lost" else "lost"
    response = supabase.table("items").select("*").eq("type", search_type).execute()
    items = response.data

    best_score = 0
    best_match = None

    if items:
        for item in items:
            if file_path and item.get("image_path"):
                try:
                    score = final_similarity(
                        description,
                        item["description"],
                        file_path,
                        item["image_path"]
                    )
                    score = float(score)
                    if score > best_score:
                        best_score = score
                        best_match = item
                except Exception as e:
                    print(f"Matching error for item {item.get('id')}: {e}")

    if best_score > 0.75 and best_match:
        first_uploader_email = best_match.get("email")
        if first_uploader_email:
            send_email(first_uploader_email)

        return {
            "status": "item_found",
            "similarity_score": round(best_score, 2),
            "message": "AI Match Detected! Notification email sent.",
            "match_details": best_match
        }

    return {
        "status": "stored",
        "similarity_score": round(best_score, 2),
        "message": "Item stored. No match found."
    }