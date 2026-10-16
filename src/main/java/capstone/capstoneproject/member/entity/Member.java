package capstone.capstoneproject.member.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "member")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, unique = true, length = 50)
    private String nickname;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "system_account", nullable = false)
    private boolean systemAccount;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MemberAllergy> allergies = new ArrayList<>();

    public Member(String email, String nickname, String passwordHash) {
        this.email = email;
        this.nickname = nickname;
        this.passwordHash = passwordHash;
        this.systemAccount = false;
    }

    public Member(String email, String nickname) {
        this(email, nickname, null);
    }

    public static Member system(String email, String nickname) {
        Member member = new Member(email, nickname, null);
        member.systemAccount = true;
        return member;
    }

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }

    public void addAllergy(String value) {
        if (value == null || value.isBlank()) return;
        String normalized = value.trim();
        if (allergies.stream().noneMatch(allergy -> allergy.getValue().equalsIgnoreCase(normalized))) {
            allergies.add(new MemberAllergy(this, normalized));
        }
    }

    public void replaceAllergies(List<String> values) {
        allergies.clear();
        if (values != null) values.forEach(this::addAllergy);
    }

    public List<String> allergyValues() {
        return allergies.stream().map(MemberAllergy::getValue).collect(Collectors.toList());
    }
}
