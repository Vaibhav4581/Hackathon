from fastapi import FastAPI, UploadFile, File, Form
import uuid
import shutil
import smtplib
from email.mime.text import MIMEText

from backend.matcher import final_similarity
from backend.database import supabase

app = FastAPI()


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

        print("Email sent successfully")

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

    # Save image locally
    if image:
        file_id = str(uuid.uuid4())
        file_path = f"backend/images/{file_id}_{image.filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    # Store item in database
    supabase.table("items").insert({
        "description": description,
        "type": type,
        "image_path": file_path,
        "email": email
    }).execute()

    # Determine opposite type
    search_type = "found" if type == "lost" else "lost"

    response = supabase.table("items").select("*").eq("type", search_type).execute()

    items = response.data

    best_score = 0
    best_match = None

    # Run AI matching
    for item in items:

        if file_path and item["image_path"]:

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

    # If strong match found
    if best_score > 0.75 and best_match:

        first_uploader_email = best_match["email"]

        # Send email to first uploader
        send_email(first_uploader_email)

        return {
            "status": "item_found",
            "similarity_score": best_score,
            "message": "Item Found! The first uploader has been notified."
        }

    return {
        "status": "stored",
        "similarity_score": best_score,
        "message": "Item stored. Waiting for a match."
    }