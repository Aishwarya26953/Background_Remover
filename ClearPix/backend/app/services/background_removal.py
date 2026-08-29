from io import BytesIO

from PIL import Image
from rembg import new_session, remove

# ---------------------------------------------------------------------------
# Pre-load the AI model once when the module is imported.
# Without this, rembg loads the ONNX model from disk on every single request,
# adding 3–8 seconds of cold-start latency each time.
# ---------------------------------------------------------------------------
_SESSION = new_session("u2net")

# Maximum pixels on the longest side sent to the AI model.
# Images larger than this are downscaled before inference and the result is
# returned at that reduced size. 1500px gives excellent quality for most
# use cases while keeping inference fast. Raise to 2000 if quality is
# more important than speed on your hardware.
_MAX_INFERENCE_SIZE = 1500


def remove_background(image_bytes: bytes) -> bytes:
    """
    Accept raw image bytes, remove the background, and return PNG bytes.

    Steps:
    1. Decode the image.
    2. Resize if the longest side exceeds _MAX_INFERENCE_SIZE.
    3. Run rembg inference using the pre-loaded session.
    4. Encode the result as PNG and return.
    """
    input_image = Image.open(BytesIO(image_bytes))

    # Normalise to RGB/RGBA — rembg handles the alpha channel internally,
    # but we strip an explicit pre-conversion to avoid double work.
    if input_image.mode not in ("RGB", "RGBA"):
        input_image = input_image.convert("RGB")

    # Resize large images before inference to reduce memory and speed up
    # processing. Aspect ratio is always preserved.
    w, h = input_image.size
    longest = max(w, h)

    if longest > _MAX_INFERENCE_SIZE:
        scale = _MAX_INFERENCE_SIZE / longest
        new_w = round(w * scale)
        new_h = round(h * scale)
        input_image = input_image.resize(
            (new_w, new_h),
            Image.LANCZOS,
        )

    # Run background removal with the pre-loaded session.
    output_image = remove(input_image, session=_SESSION)

    # Encode result as PNG (preserves transparency).
    output_buffer = BytesIO()
    output_image.save(output_buffer, format="PNG")
    output_buffer.seek(0)

    return output_buffer.read()
