package capstone.capstoneproject.recipe.service;

import capstone.capstoneproject.recipe.config.S3Properties;
import java.net.URLConnection;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class RecipeImageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final S3Client s3Client;
    private final S3Properties properties;

    public RecipeImageService(S3Client s3Client, S3Properties properties) {
        this.s3Client = s3Client;
        this.properties = properties;
    }

    public String upload(MultipartFile image) {
        if (properties.bucket() == null || properties.bucket().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "AWS_S3_BUCKET 설정이 필요합니다."
            );
        }
        if (image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일이 필요합니다.");
        }
        String contentType = image.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "JPEG, PNG, WebP 이미지만 업로드할 수 있습니다.");
        }
        if (image.getSize() > 10 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "이미지는 10MB 이하로 업로드해 주세요.");
        }

        String extension = switch (contentType) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "jpg";
        };
        String key = "recipes/" + UUID.randomUUID() + "." + extension;
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(properties.bucket())
                            .key(key)
                            .contentType(contentType)
                            .contentLength(image.getSize())
                            .build(),
                    RequestBody.fromBytes(image.getBytes())
            );
        } catch (RuntimeException | java.io.IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "레시피 이미지를 업로드하지 못했습니다.",
                    exception
            );
        }

        if (properties.publicBaseUrl() != null && !properties.publicBaseUrl().isBlank()) {
            return properties.publicBaseUrl().replaceAll("/+$", "") + "/" + key;
        }
        return "https://" + properties.bucket() + ".s3." + properties.region()
                + ".amazonaws.com/" + key;
    }
}
