package capstone.capstoneproject.recipe.service;

import capstone.capstoneproject.recipe.config.S3Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.services.s3.S3Client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RecipeImageServiceTest {

    @Mock
    private S3Client s3Client;

    private RecipeImageService service;

    @BeforeEach
    void setUp() {
        service = new RecipeImageService(
                s3Client,
                new S3Properties("test-bucket", "ap-northeast-2", "https://cdn.example.com")
        );
    }

    @Test
    void uploadsPublicRecipeImageAndReturnsUrl() {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "recipe.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );

        String url = service.upload(image);

        assertThat(url).startsWith("https://cdn.example.com/recipes/");
        assertThat(url).endsWith(".jpg");
        verify(s3Client).putObject(any(software.amazon.awssdk.services.s3.model.PutObjectRequest.class),
                any(software.amazon.awssdk.core.sync.RequestBody.class));
    }

    @Test
    void rejectsNonImageFile() {
        MockMultipartFile file = new MockMultipartFile(
                "image",
                "recipe.txt",
                "text/plain",
                "not image".getBytes()
        );

        assertThatThrownBy(() -> service.upload(file))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void rejectsImageOverTenMegabytes() {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "large.jpg",
                "image/jpeg",
                new byte[10 * 1024 * 1024 + 1]
        );

        assertThatThrownBy(() -> service.upload(image))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void requiresS3BucketConfiguration() {
        RecipeImageService noBucket = new RecipeImageService(
                s3Client,
                new S3Properties("", "ap-northeast-2", "")
        );
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "recipe.jpg",
                "image/jpeg",
                new byte[]{1}
        );

        assertThatThrownBy(() -> noBucket.upload(image))
                .isInstanceOf(ResponseStatusException.class);
    }
}
