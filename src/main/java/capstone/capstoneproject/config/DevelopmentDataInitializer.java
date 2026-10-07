package capstone.capstoneproject.config;

import capstone.capstoneproject.fridge.entity.IngredientMaster;
import capstone.capstoneproject.fridge.repository.IngredientMasterRepository;
import capstone.capstoneproject.member.entity.Member;
import capstone.capstoneproject.member.repository.MemberRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Configuration
@ConditionalOnProperty(name = "ingredient-seed.enabled", havingValue = "true")
public class DevelopmentDataInitializer {

    @Bean
    CommandLineRunner seedDevelopmentData(
            MemberRepository memberRepository,
            IngredientMasterRepository ingredientMasterRepository,
            IngredientSeedProperties ingredientSeedProperties
    ) {
        return args -> {
            // 인증 기능이 아직 없으므로 Postman 테스트용 개발 회원을 하나만 만든다.
            if (memberRepository.count() == 0) {
                memberRepository.save(new Member("dev@example.com", "개발사용자"));
            }

            // 재료명으로 존재 여부를 확인해 애플리케이션 재시작 시 중복 생성을 막는다.
            ingredientSeedProperties.getIngredients().forEach(seed ->
                    ingredientMasterRepository.findByName(seed.getName()).orElseGet(() ->
                            ingredientMasterRepository.save(new IngredientMaster(
                                    seed.getName(),
                                    seed.getDefaultCompartment(),
                                    seed.getIconUrl(),
                                    seed.getDefaultShelfLifeDays()
                            ))
                    )
            );
        };
    }
}
