import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface Props {
  onLoginSuccess: () => void;
}

export default function AuthScreen({ onLoginSuccess }: Props) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [autoLogin, setAutoLogin] = useState<boolean>(true);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!email || !password) {
      setNotice("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setNotice("비밀번호가 일치하지 않습니다.");
      return;
    }
    // 성공 시 앱 진입
    onLoginSuccess();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* 상단 타이틀 */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>WELCOME TO NAMPA</Text>
        <Text style={styles.title}>{isLogin ? "로그인" : "회원가입"}</Text>
        <Text style={styles.subTitle}>
          {isLogin ? "냉장고 파먹기로 스마트한 요리를 시작하세요." : "간편하게 가입하고 맞춤형 식단을 관리해 보세요."}
        </Text>
      </View>

      {/* 입력 폼 카드 */}
      <View style={styles.card}>
        {!isLogin && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이름</Text>
            <TextInput 
              style={styles.input} 
              placeholder="이름을 입력해 주세요" 
              placeholderTextColor="#9aa6a1"
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일 주소</Text>
          <TextInput 
            style={styles.input} 
            placeholder="example@email.com" 
            placeholderTextColor="#9aa6a1"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput 
            style={styles.input} 
            placeholder="비밀번호 입력 (6자 이상)" 
            placeholderTextColor="#9aa6a1"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {!isLogin && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput 
              style={styles.input} 
              placeholder="비밀번호를 한 번 더 입력해 주세요" 
              placeholderTextColor="#9aa6a1"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        )}

        {isLogin && (
          <View style={styles.autoLoginRow}>
            <Text style={styles.autoLoginText}>자동 로그인</Text>
            <Switch
              value={autoLogin}
              onValueChange={setAutoLogin}
              trackColor={{ false: "#d8e3de", true: "#3a846b" }}
              thumbColor="#ffffff"
            />
          </View>
        )}

        {notice && <Text style={styles.noticeText}>{notice}</Text>}

        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>{isLogin ? "로그인 완료" : "가입 완료"}</Text>
        </TouchableOpacity>
      </View>

      {/* 모드 전환 버튼 (로그인 ⇄ 회원가입) */}
      <View style={styles.switchRow}>
        <Text style={styles.switchText}>
          {isLogin ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}
        </Text>
        <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setNotice(null); }}>
          <Text style={styles.switchActionText}>{isLogin ? " 회원가입" : " 로그인"}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7f5" },
  contentContainer: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 24 },
  eyebrow: { fontSize: 10, fontWeight: "800", color: "#55a384", letterSpacing: 1.8, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: "bold", color: "#233b35", marginBottom: 6 },
  subTitle: { fontSize: 13, color: "#667a72", lineHeight: 18 },

  card: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e0e8e4", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, elevation: 3, marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: "bold", color: "#3a564d", marginBottom: 6 },
  input: { backgroundColor: "#f4f7f5", borderWidth: 1, borderColor: "#d8e3de", borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 13, color: "#233b35" },
  
  autoLoginRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 4, paddingHorizontal: 4 },
  autoLoginText: { fontSize: 13, fontWeight: "600", color: "#3a564d" },

  noticeText: { fontSize: 11, color: "#d95850", fontWeight: "600", marginTop: 4, marginBottom: 10, textAlign: "center" },

  submitBtn: { backgroundColor: "#2b4c3f", borderRadius: 14, height: 50, justifyContent: "center", alignItems: "center", marginTop: 10 },
  submitBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "bold" },

  switchRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  switchText: { fontSize: 13, color: "#667a72" },
  switchActionText: { fontSize: 13, fontWeight: "bold", color: "#3a846b" },
});