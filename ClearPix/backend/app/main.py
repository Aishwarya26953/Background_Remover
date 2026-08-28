import time
from io import BytesIO

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.services.background_removal import remove_background


app = FastAPI(
    title="ClearPix API",
    description="AI-powered image background removal API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "ClearPix API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/remove-background")
async def remove_background_endpoint(file: UploadFile = File(...)):

    allowed_types = {"image/jpeg", "image/png", "image/webp"}

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WEBP images are supported.",
        )

    try:
        image_bytes = await file.read()

        start = time.perf_counter()
        result_bytes = remove_background(image_bytes)
        elapsed = round((time.perf_counter() - start) * 1000)

        return StreamingResponse(
            BytesIO(result_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": 'attachment; filename="clearpix-result.png"',
                "X-Processing-Time": f"{elapsed}ms",
            },
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Background removal failed: {str(e)}",
        )
