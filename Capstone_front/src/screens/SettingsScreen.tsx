import { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { getErrorMessage } from "../services/api";
import { Ingredient, Recipe } from "../types";

interface Props {
  ingredients: Ingredient[];
  recipes: Recipe[];
  onBack: () => void;
  /** 서버의 냉장고 재료를 모두 삭제 */
  onResetData: () => Promise<void>;
  /** 로그인 화면으로 돌아가기 */
  onLogout: () => void;
}

type SettingsPanelType = "profile" | "link" | "password" | "delete" | "theme" | "data" | "info" | "logout" | null;

export default function SettingsScreen({ ingredients, recipes, onBack, onResetData, onLogout }: Props) {
  // 모달(액션시트) 상태 관리
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanelType>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // 사용자 프로필 상태 (일반 예시 데이터 적용)
  const [profileName, setProfileName] = useState("홍길동");
  const [profileEmail, setProfileEmail] = useState("user@example.com");
  const [accountLinked, setAccountLinked] = useState(true);

  // 알림 토글 상태
  const [pushNotifications, setPushNotifications] = useState(true);
  const [expiryNotifications, setExpiryNotifications] = useState(true);
  const [importantNotifications, setImportantNotifications] = useState(false);

  // 테마 설정 상태 ("system" | "light" | "dark")
  const [appTheme, setAppTheme] = useState<"system" | "light" | "dark">("light");

  // 토스트 알림 표시 함수
  const showNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 2500);
  };

  // 앱 데이터 초기화: 서버에 저장된 냉장고 재료를 모두 지우므로 한 번 더 확인한다
  const handleResetPress = () => {
    const runReset = async () => {
      setSettingsPanel(null);
      try {
        await onResetData();
      } catch (error) {
        Alert.alert("초기화하지 못했어요", getErrorMessage(error));
      }
    };
    const message = `냉장고 재료 ${ingredients.length}개를 서버에서 모두 삭제할까요? 되돌릴 수 없어요.`;

    if (Platform.OS === "web") {
      if (window.confirm(message)) runReset();
      return;
    }
    Alert.alert("앱 데이터 초기화", message, [
      { text: "취소", style: "cancel" },
      { text: "모두 삭제", style: "destructive", onPress: runReset },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.eyebrow}>PREFERENCES</Text>
          <Text style={styles.title}>설정</Text>
        </View>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* 1. 프로필 요약 카드 */}
        <TouchableOpacity 
          style={styles.profileCard} 
          activeOpacity={0.9}
          onPress={() => setSettingsPanel("profile")}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>{profileName[0] || "홍"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileEmail}>{profileEmail}</Text>
          </View>
          <Text style={styles.arrowSymbol}>›</Text>
        </TouchableOpacity>

        {/* 2. 계정 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>계정 설정</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.rowItem} onPress={() => setSettingsPanel("link")}>
              <Text style={styles.rowLabel}>계정 연동</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowSubText}>{accountLinked ? "연동됨" : "연동 안 됨"}</Text>
                <Text style={styles.arrowSymbol}>›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rowItem} onPress={() => setSettingsPanel("password")}>
              <Text style={styles.rowLabel}>비밀번호 변경</Text>
              <Text style={styles.arrowSymbol}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.rowItem, { borderBottomWidth: 0 }]} onPress={() => setSettingsPanel("delete")}>
              <Text style={[styles.rowLabel, { color: "#d95850" }]}>계정 탈퇴</Text>
              <Text style={styles.arrowSymbol}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. 앱 알림 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>앱 알림</Text>
          <View style={styles.settingsCard}>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>푸시 알림</Text>
              <Switch
                value={pushNotifications}
                onValueChange={(val) => {
                  setPushNotifications(val);
                  showNotice(val ? "푸시 알림을 켰습니다." : "푸시 알림을 껐습니다.");
                }}
                trackColor={{ false: "#d8e3de", true: "#3a846b" }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>유통기한 임박 알림</Text>
              <Switch
                value={expiryNotifications}
                onValueChange={(val) => {
                  setExpiryNotifications(val);
                  showNotice(val ? "유통기한 알림을 켰습니다." : "유통기한 알림을 껐습니다.");
                }}
                trackColor={{ false: "#d8e3de", true: "#3a846b" }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={[styles.rowItem, { borderBottomWidth: 0 }]}>
              <Text style={styles.rowLabel}>중요 알림만 보기</Text>
              <Switch
                value={importantNotifications}
                onValueChange={(val) => {
                  setImportantNotifications(val);
                  showNotice(val ? "중요 알림 모드가 켜졌습니다." : "중요 알림 모드가 꺼졌습니다.");
                }}
                trackColor={{ false: "#d8e3de", true: "#3a846b" }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* 4. 앱 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>앱 설정</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.rowItem} onPress={() => setSettingsPanel("theme")}>
              <Text style={styles.rowLabel}>테마 및 화면</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowSubText}>
                  {appTheme === "system" ? "시스템 설정" : appTheme === "light" ? "라이트 모드" : "다크 모드"}
                </Text>
                <Text style={styles.arrowSymbol}>›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rowItem} onPress={() => setSettingsPanel("data")}>
              <Text style={styles.rowLabel}>데이터 관리</Text>
              <Text style={styles.arrowSymbol}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.rowItem, { borderBottomWidth: 0 }]} onPress={() => setSettingsPanel("info")}>
              <Text style={styles.rowLabel}>앱 정보</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowSubText}>v1.0.0</Text>
                <Text style={styles.arrowSymbol}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 하단 로그아웃 버튼 */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => setSettingsPanel("logout")}
        >
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>

        <Text style={styles.footnote}>냉장고 파먹기 · 건강한 식생활을 위한 기록</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 설정 상세 모달 (액션 시트) */}
      <Modal visible={settingsPanel !== null} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSettingsPanel(null)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* 1. 프로필 수정 모달 */}
              {settingsPanel === "profile" && (
                <View>
                  <Text style={styles.sheetEyebrow}>PROFILE</Text>
                  <Text style={styles.sheetTitle}>프로필 정보 수정</Text>
                  <Text style={styles.sheetDesc}>사용자 이름과 이메일을 변경할 수 있어요.</Text>

                  <Text style={styles.inputLabel}>이름</Text>
                  <TextInput
                    style={styles.textInput}
                    defaultValue={profileName}
                    onChangeText={setProfileName}
                  />

                  <Text style={styles.inputLabel}>이메일 주소</Text>
                  <TextInput
                    style={styles.textInput}
                    defaultValue={profileEmail}
                    onChangeText={setProfileEmail}
                    keyboardType="email-address"
                  />

                  <TouchableOpacity 
                    style={styles.primaryBtn} 
                    onPress={() => {
                      setSettingsPanel(null);
                      showNotice("프로필 정보가 수정되었습니다.");
                    }}
                  >
                    <Text style={styles.primaryBtnText}>변경 내용 저장</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 2. 계정 연동 모달 */}
              {settingsPanel === "link" && (
                <View>
                  <Text style={styles.sheetEyebrow}>CONNECTED ACCOUNT</Text>
                  <Text style={styles.sheetTitle}>계정 연동 관리</Text>
                  <Text style={styles.sheetDesc}>여러 기기에서 냉장고 데이터를 안전하게 동기화해요.</Text>

                  <View style={[styles.statusBox, accountLinked && styles.statusBoxActive]}>
                    <Text style={styles.statusTitle}>{accountLinked ? "이메일 계정 연동됨" : "연동된 계정이 없어요"}</Text>
                    <Text style={styles.statusSub}>{accountLinked ? profileEmail : "계정을 연결하면 데이터가 자동 저장됩니다."}</Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.primaryBtn, accountLinked && styles.dangerBtn]} 
                    onPress={() => {
                      setAccountLinked(!accountLinked);
                      setSettingsPanel(null);
                      showNotice(accountLinked ? "계정 연동을 해제했습니다." : "계정 연동을 완료했습니다.");
                    }}
                  >
                    <Text style={styles.primaryBtnText}>{accountLinked ? "계정 연동 해제" : "이메일 계정 연동하기"}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 3. 비밀번호 변경 모달 */}
              {settingsPanel === "password" && (
                <View>
                  <Text style={styles.sheetEyebrow}>SECURITY</Text>
                  <Text style={styles.sheetTitle}>비밀번호 변경</Text>
                  <Text style={styles.sheetDesc}>안전한 계정 사용을 위해 비밀번호를 변경해 주세요.</Text>

                  <Text style={styles.inputLabel}>현재 비밀번호</Text>
                  <TextInput style={styles.textInput} placeholder="현재 비밀번호 입력" secureTextEntry placeholderTextColor="#9aa6a1" />

                  <Text style={styles.inputLabel}>새 비밀번호</Text>
                  <TextInput style={styles.textInput} placeholder="6자 이상 입력" secureTextEntry placeholderTextColor="#9aa6a1" />

                  <TouchableOpacity 
                    style={styles.primaryBtn} 
                    onPress={() => {
                      setSettingsPanel(null);
                      showNotice("비밀번호가 성공적으로 변경되었습니다.");
                    }}
                  >
                    <Text style={styles.primaryBtnText}>비밀번호 변경</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 4. 계정 탈퇴 모달 */}
              {settingsPanel === "delete" && (
                <View>
                  <Text style={[styles.sheetEyebrow, { color: "#d95850" }]}>DELETE ACCOUNT</Text>
                  <Text style={styles.sheetTitle}>정말 계정을 탈퇴할까요?</Text>
                  <Text style={styles.sheetDesc}>프로필과 연동 정보가 해제되며 이 작업은 되돌릴 수 없어요.</Text>

                  <View style={styles.cautionBox}>
                    <Text style={styles.cautionText}>⚠️ 레시피와 냉장고 데이터는 먼저 데이터 관리에서 백업(내보내기)하시는 것을 권장해요.</Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.primaryBtn, styles.dangerBtn]} 
                    onPress={() => {
                      setProfileName("게스트");
                      setProfileEmail("guest@example.com");
                      setAccountLinked(false);
                      setSettingsPanel(null);
                      showNotice("계정 탈퇴가 완료되었습니다.");
                    }}
                  >
                    <Text style={styles.primaryBtnText}>계정 탈퇴하기</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 5. 테마 설정 모달 */}
              {settingsPanel === "theme" && (
                <View>
                  <Text style={styles.sheetEyebrow}>APPEARANCE</Text>
                  <Text style={styles.sheetTitle}>테마 및 화면</Text>
                  <Text style={styles.sheetDesc}>앱 화면에 사용할 테마를 선택해 주세요.</Text>

                  {(["system", "light", "dark"] as const).map((themeVal) => {
                    const label = themeVal === "system" ? "시스템 설정" : themeVal === "light" ? "라이트 모드" : "다크 모드";
                    const desc = themeVal === "system" ? "기기 설정에 맞춰 자동으로 표시" : themeVal === "light" ? "밝고 선명한 화면" : "어두운 곳에서 편안한 화면";
                    const isSelected = appTheme === themeVal;

                    return (
                      <TouchableOpacity
                        key={themeVal}
                        style={[styles.themeOptionRow, isSelected && styles.themeOptionActive]}
                        onPress={() => {
                          setAppTheme(themeVal);
                          setSettingsPanel(null);
                          showNotice(`${label}로 변경되었습니다.`);
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.themeTitle, isSelected && styles.themeTitleActive]}>{label}</Text>
                          <Text style={styles.themeSub}>{desc}</Text>
                        </View>
                        {isSelected && <Text style={styles.checkMark}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* 6. 데이터 관리 모달 */}
              {settingsPanel === "data" && (
                <View>
                  <Text style={styles.sheetEyebrow}>MY DATA</Text>
                  <Text style={styles.sheetTitle}>데이터 관리</Text>
                  <Text style={styles.sheetDesc}>냉장고와 레시피 데이터를 내보내거나 초기화할 수 있어요.</Text>

                  <TouchableOpacity 
                    style={styles.dataActionBtn} 
                    onPress={() => showNotice("데이터를 JSON 파일로 내보냈습니다.")}
                  >
                    <Text style={styles.dataActionTitle}>📥 데이터 내보내기</Text>
                    <Text style={styles.dataActionSub}>현재 냉장고 재료 및 레시피 백업</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.dataActionBtn, styles.dangerBorderBtn]}
                    onPress={handleResetPress}
                  >
                    <Text style={[styles.dataActionTitle, { color: "#d95850" }]}>🗑️ 앱 데이터 초기화</Text>
                    <Text style={styles.dataActionSub}>서버에 저장된 냉장고 재료를 모두 삭제</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 7. 앱 정보 모달 */}
              {settingsPanel === "info" && (
                <View>
                  <Text style={styles.sheetEyebrow}>ABOUT</Text>
                  <Text style={styles.sheetTitle}>냉장고 파먹기 (냉파)</Text>
                  <Text style={styles.sheetDesc}>냉장고 속 재료를 알뜰하고 건강하게 활용하는 앱이에요.</Text>

                  <View style={styles.versionBox}>
                    <Text style={styles.versionText}>버전 1.0.0 (Stable)</Text>
                    <Text style={styles.versionSub}>최신 버전을 사용하고 있습니다.</Text>
                  </View>

                  <View style={styles.infoLinks}>
                    <TouchableOpacity onPress={() => Alert.alert("이용약관", "냉파 서비스 이용약관 내용입니다.")}>
                      <Text style={styles.infoLinkText}>이용약관 ›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert("개인정보 처리방침", "개인정보 처리방침 내용입니다.")}>
                      <Text style={styles.infoLinkText}>개인정보 처리방침 ›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert("오픈소스 라이선스", "사용된 오픈소스 목록입니다.")}>
                      <Text style={styles.infoLinkText}>오픈소스 라이선스 ›</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 8. 로그아웃 확인 모달 */}
              {settingsPanel === "logout" && (
                <View style={{ alignItems: "center", paddingVertical: 10 }}>
                  <Text style={styles.sheetEyebrow}>LOG OUT</Text>
                  <Text style={styles.sheetTitle}>정말 로그아웃할까요?</Text>
                  <Text style={[styles.sheetDesc, { textAlign: "center" }]}>서버에 저장된 냉장고 데이터는 그대로 유지됩니다.</Text>

                  <TouchableOpacity
                    style={[styles.primaryBtn, styles.dangerBtn, { width: "100%", marginTop: 20 }]}
                    onPress={() => {
                      setSettingsPanel(null);
                      onLogout();
                    }}
                  >
                    <Text style={styles.primaryBtnText}>로그아웃하기</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 상단 토스트 알림 팝업 */}
      {noticeMessage && (
        <View style={styles.toastBox}>
          <Text style={styles.toastText}>✓ {noticeMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9f7" },
  header: { minHeight: 81, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.84)", borderBottomWidth: 1, borderBottomColor: "#e8eeea" },
  backButton: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#edf3ef", justifyContent: "center", alignItems: "center" },
  backButtonText: { fontSize: 26, color: "#476159", lineHeight: 28 },
  eyebrow: { fontFamily: "Nunito", fontSize: 10, fontWeight: "800", color: "#55a384", letterSpacing: 1.6, marginBottom: 3 },
  title: { fontSize: 21, fontWeight: "bold", color: "#233b35", letterSpacing: -0.8 },

  scroll: { flex: 1, paddingHorizontal: 19, paddingTop: 18 },

  profileCard: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e0e8e4", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2 },
  profileAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#e3f2ea", justifyContent: "center", alignItems: "center", marginRight: 14 },
  avatarText: { fontSize: 18, fontWeight: "bold", color: "#3a846b" },
  profileName: { fontSize: 15, fontWeight: "bold", color: "#233b35", marginBottom: 2 },
  profileEmail: { fontSize: 11, color: "#82908b" },
  arrowSymbol: { fontSize: 20, color: "#81a196", fontWeight: "bold" },

  section: { marginBottom: 20 },
  sectionHeaderTitle: { fontSize: 12, fontWeight: "bold", color: "#55a384", marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },
  settingsCard: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e0e8e4", borderRadius: 16, overflow: "hidden" },
  rowItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#f0f4f1" },
  rowLabel: { fontSize: 13, fontWeight: "600", color: "#233b35" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowSubText: { fontSize: 12, color: "#82908b" },

  logoutButton: { backgroundColor: "#fceeee", borderWidth: 1, borderColor: "#f5cdcd", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginBottom: 14 },
  logoutButtonText: { fontSize: 13, fontWeight: "bold", color: "#b84747" },
  footnote: { textAlign: "center", fontSize: 10, color: "#9aa6a1", marginBottom: 20 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: "#ffffff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, maxHeight: "85%" },
  modalHeader: { alignItems: "flex-end", marginBottom: 5 },
  modalCloseBtn: { padding: 4 },
  modalCloseText: { fontSize: 20, color: "#888" },

  sheetEyebrow: { fontSize: 10, fontWeight: "800", color: "#55a384", letterSpacing: 1.5, marginBottom: 4 },
  sheetTitle: { fontSize: 18, fontWeight: "bold", color: "#233b35", marginBottom: 6 },
  sheetDesc: { fontSize: 12, color: "#667a72", marginBottom: 20, lineHeight: 18 },

  inputLabel: { fontSize: 11, fontWeight: "bold", color: "#3a564d", marginBottom: 6, marginTop: 10 },
  textInput: { backgroundColor: "#f4f7f5", borderWidth: 1, borderColor: "#d8e3de", borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 12, color: "#233b35", marginBottom: 10 },

  primaryBtn: { backgroundColor: "#3a846b", borderRadius: 12, height: 48, justifyContent: "center", alignItems: "center", marginTop: 20, marginBottom: 20 },
  primaryBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },
  dangerBtn: { backgroundColor: "#d95850" },

  statusBox: { backgroundColor: "#f4f7f5", padding: 14, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: "#d8e3de" },
  statusBoxActive: { backgroundColor: "#e8f4ef", borderColor: "#3a846b" },
  statusTitle: { fontSize: 13, fontWeight: "bold", color: "#233b35", marginBottom: 2 },
  statusSub: { fontSize: 11, color: "#667a72" },

  cautionBox: { backgroundColor: "#fff9e6", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#ffe0b2", marginBottom: 15 },
  cautionText: { fontSize: 11, color: "#b27900", lineHeight: 16 },

  themeOptionRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#f4f7f5", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#d8e3de", marginBottom: 8 },
  themeOptionActive: { backgroundColor: "#e8f4ef", borderColor: "#3a846b" },
  themeTitle: { fontSize: 13, fontWeight: "bold", color: "#233b35", marginBottom: 2 },
  themeTitleActive: { color: "#3a846b" },
  themeSub: { fontSize: 10, color: "#788983" },
  checkMark: { fontSize: 16, fontWeight: "bold", color: "#3a846b" },

  dataActionBtn: { backgroundColor: "#f4f7f5", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#d8e3de", marginBottom: 10 },
  dangerBorderBtn: { borderColor: "#f5cdcd", backgroundColor: "#fceeee" },
  dataActionTitle: { fontSize: 13, fontWeight: "bold", color: "#233b35", marginBottom: 2 },
  dataActionSub: { fontSize: 10, color: "#788983" },

  versionBox: { backgroundColor: "#f4f7f5", padding: 16, borderRadius: 12, alignItems: "center", marginBottom: 15 },
  versionText: { fontSize: 13, fontWeight: "bold", color: "#233b35", marginBottom: 4 },
  versionSub: { fontSize: 11, color: "#3a846b" },
  infoLinks: { gap: 10 },
  infoLinkText: { fontSize: 13, color: "#476159", fontWeight: "600", paddingVertical: 4 },

  toastBox: { position: "absolute", bottom: 40, alignSelf: "center", backgroundColor: "rgba(35, 59, 53, 0.9)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99, shadowColor: "#000", shadowOpacity: 0.2, elevation: 5 },
  toastText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
});