from io import BytesIO

import httpx
from pypdf import PdfReader


class CvTextExtractionError(Exception):
    pass


def extract_text_from_pdf(url: str) -> str:
    try:
        response = httpx.get(url, timeout=30.0)
        response.raise_for_status()
        reader = PdfReader(BytesIO(response.content))
        return "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    except Exception as exc:
        raise CvTextExtractionError(f"Could not read the uploaded CV file: {exc}") from exc
