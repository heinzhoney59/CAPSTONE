import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  onStart: () => void;
}

export default function LaunchScreen({ onStart }: Props) {
  return (
    <View style={styles.container}>
      {/* 배경 은은한 광채 효과 모형 */}
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      {/* 상단 타이틀 */}
      <View style={styles.headerCopy}>
        <Text style={styles.eyebrow}>MY SMART FRIDGE</Text>
        <Text style={styles.title}>냉장고 파먹기</Text>
        <Text style={styles.subTitle}>우리집 재료로 시작하는 신선한 하루</Text>
      </View>

      {/* 중앙 냉장고 일러스트 그래픽 */}
      <View style={styles.fridgeStage}>
        <View style={styles.fridgeBody}>
          {/* 냉장고 내부 선반 모형 */}
          <View style={styles.shelfTop} />
          <View style={styles.shelfBottom} />
          
          {/* 상단 문 (냉장실) */}
          <View style={styles.doorTop}>
            <View style={styles.doorShine} />
            <View style={styles.handleTop} />
            <Text style={styles.tempBadge}>3°</Text>
          </View>

          {/* 하단 문 (냉동실) */}
          <View style={styles.doorBottom}>
            <View style={styles.doorShine} />
            <View style={styles.handleBottom} />
            <View style={styles.brandMark}>
              <View style={styles.dot} /><View style={styles.dot} />
            </View>
          </View>
        </View>
      </View>

      {/* 하단 시작 버튼 */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.startButton} activeOpacity={0.85} onPress={onStart}>
          <Text style={styles.startBtnText}>TOUCH</Text>
          <Text style={styles.startBtnSub}>냉장고를 열어 시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f7f4", justifyContent: "space-between", alignItems: "center", paddingVertical: 50, paddingHorizontal: 24 },
  glowOne: { position: "absolute", top: 80, left: 20, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(85, 163, 132, 0.12)" },
  glowTwo: { position: "absolute", bottom: 120, right: 20, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(58, 132, 107, 0.08)" },

  headerCopy: { alignItems: "center", marginTop: 20 },
  eyebrow: { fontSize: 11, fontWeight: "800", color: "#55a384", letterSpacing: 1.8, marginBottom: 6 },
  title: { fontSize: 28, fontWeight: "bold", color: "#233b35", letterSpacing: -0.5, marginBottom: 6 },
  subTitle: { fontSize: 13, color: "#667a72" },

  fridgeStage: { width: 180, height: 280, justifyContent: "center", alignItems: "center", marginVertical: 10 },
  fridgeBody: { width: "100%", height: "100%", backgroundColor: "#e3ede7", borderRadius: 24, padding: 8, position: "relative", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, elevation: 6 },
  shelfTop: { position: "absolute", top: 90, left: 12, right: 12, height: 4, backgroundColor: "#d0ded6", borderRadius: 2 },
  shelfBottom: { position: "absolute", top: 180, left: 12, right: 12, height: 4, backgroundColor: "#d0ded6", borderRadius: 2 },
  
  doorTop: { flex: 1, backgroundColor: "#ffffff", borderRadius: 16, padding: 10, position: "relative", marginBottom: 6, borderWidth: 1, borderColor: "#d5e2dc" },
  doorBottom: { flex: 1.2, backgroundColor: "#ffffff", borderRadius: 16, padding: 10, position: "relative", borderWidth: 1, borderColor: "#d5e2dc" },
  doorShine: { position: "absolute", top: 10, left: 10, width: 6, height: "40%", backgroundColor: "rgba(240, 245, 243, 0.8)", borderRadius: 3 },
  handleTop: { position: "absolute", right: 10, top: "40%", width: 4, height: 24, backgroundColor: "#b2c7bd", borderRadius: 2 },
  handleBottom: { position: "absolute", right: 10, top: "35%", width: 4, height: 24, backgroundColor: "#b2c7bd", borderRadius: 2 },
  tempBadge: { position: "absolute", left: 18, top: 18, fontSize: 11, fontWeight: "bold", color: "#3a846b", backgroundColor: "#e8f4ef", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  brandMark: { position: "absolute", left: 18, top: 18, flexDirection: "row", gap: 3 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#b2c7bd" },

  footerContainer: { width: "100%", alignItems: "center" },
  startButton: { width: "100%", backgroundColor: "#2b4c3f", borderRadius: 18, paddingVertical: 16, alignItems: "center", shadowColor: "#2b4c3f", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, elevation: 5 },
  startBtnText: { fontSize: 15, fontWeight: "900", color: "#ffffff", letterSpacing: 2, marginBottom: 2 },
  startBtnSub: { fontSize: 11, color: "#a3c1ad" },
});