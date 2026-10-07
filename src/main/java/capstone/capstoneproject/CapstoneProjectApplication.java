package capstone.capstoneproject;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableScheduling
public class CapstoneProjectApplication {

    public static void main(String[] args) {
    loadDotenv();
    SpringApplication.run(CapstoneProjectApplication.class, args);
}

private static void loadDotenv() {
    Dotenv dotenv = Dotenv.configure()
            .directory(System.getProperty("user.dir"))
            .ignoreIfMissing()
            .load();
    dotenv.entries().forEach(entry -> {
        if (System.getProperty(entry.getKey()) == null
                && System.getenv(entry.getKey()) == null) {
            System.setProperty(entry.getKey(), entry.getValue());
        }
    });
}
}
