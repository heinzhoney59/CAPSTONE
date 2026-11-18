package capstone.capstoneproject.ocr;

import java.util.List;

public interface OcrProvider {
    List<OcrIngredientCandidate> extract(byte[] imageBytes, String contentType);
}
