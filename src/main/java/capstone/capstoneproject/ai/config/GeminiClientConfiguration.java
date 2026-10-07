package capstone.capstoneproject.ai.config;

import java.time.Duration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class GeminiClientConfiguration {

    @Bean
    RestClient.Builder geminiRestClientBuilder() {
        return RestClient.builder();
    }

    @Bean
    RestClient geminiRestClient(RestClient.Builder builder, GeminiProperties properties) {
        Duration timeout = properties.timeout();
        int timeoutMillis = Math.toIntExact(timeout.toMillis());
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(timeoutMillis);
        requestFactory.setReadTimeout(timeoutMillis);
        return builder
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory)
                .build();
    }
}
