from io import BytesIO

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image
from rembg import remove


app = FastAPI(
    title="ClearPix API",
    description="AI-powered image background removal API",
    version="1.0.0",
)


# Allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "ClearPix API is running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):

    # Check file type
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WEBP images are supported.",
        )

    try:
        # Read uploaded image
        image_bytes = await file.read()

        # Open image
        input_image = Image.open(BytesIO(image_bytes))

        # Convert to RGBA
        input_image = input_image.convert("RGBA")

        # Remove background using AI
        output_image = remove(input_image)

        # Save result to memory
        output_buffer = BytesIO()
        output_image.save(output_buffer, format="PNG")
        output_buffer.seek(0)

        return StreamingResponse(
            output_buffer,
            media_type="image/png",
            headers={
                "Content-Disposition": 'attachment; filename="clearpix-result.png"'
            },
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Background removal failed: {str(e)}",
        )