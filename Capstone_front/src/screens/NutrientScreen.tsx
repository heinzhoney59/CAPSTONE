import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ingredient } from "../types";

interface Props {
  ingredients: Ingredient[];
  onBack: () => void;
  /** 선택한 알레르기 (index.tsx에서 관리 — AI 셰프 추천에서도 제외됨) */
  selectedAllergies: string[];
  onToggleAllergy: (allergy: string) => void;
}

export default function NutrientScreen({ ingredients, onBack, selectedAllergies, onToggleAllergy }: Props) {

  // 현재 시스템 시간 기준 연도, 월, 일 동기화 (2026년 10월 기준)
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const todayDate = currentDate.getDate();

  // 조회 중인 연도 및 월 상태
  const [viewYear, setViewYear] = useState<number>(currentYear);
  const [viewMonth, setViewMonth] = useState<number>(currentMonth);

  // 선택한 날짜 상태 (기본값: 오늘)
  const [selectedDay, setSelectedDay] = useState<number>(todayDate);

  // 이전 3개월 전까지의 최소 월 계산
  const minTotalMonths = currentYear * 12 + currentMonth - 3;
  const currentTotalMonths = viewYear * 12 + viewMonth;

  // 이전 달로 이동
  const handlePrevMonth = () => {
    if (currentTotalMonths > minTotalMonths) {
      if (viewMonth === 1) {
        setViewYear(viewYear - 1);
        setViewMonth(12);
      } else {
        setViewMonth(viewMonth - 1);
      }
      setSelectedDay(1); // 달이 바뀌면 1일 선택
    }
  };

  // 다음 달로 이동
  const handleNextMonth = () => {
    const maxTotalMonths = currentYear * 12 + currentMonth;
    if (currentTotalMonths < maxTotalMonths) {
      if (viewMonth === 12) {
        setViewYear(viewYear + 1);
        setViewMonth(1);
      } else {
        setViewMonth(viewMonth + 1);
      }
      setSelectedDay(viewYear * 12 + viewMonth + 1 === maxTotalMonths ? todayDate : 1);
    }
  };

  const isCurrentMonth = viewYear === currentYear && viewMonth === currentMonth;

  // 해당 월 1일의 요일과 총 일수 계산
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

  // 1일이 시작하는 요일에 맞추기 위한 빈 칸(패딩) 생성
  const paddingDays = Array.from({ length: firstDayOfWeek }, () => null);

  // 실제 날짜 배열 생성
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    let status = "none";
    if (isCurrentMonth) {
      if (day < todayDate) {
        status = day % 2 === 0 ? "achieved" : "warning";
      } else if (day === todayDate) {
        status = "achieved";
      }
    } else {
      status = day % 3 === 0 ? "warning" : "achieved";
    }
    return { day, status };
  });

  const calendarDays = [...paddingDays, ...monthDays];
  const allergies = ["난류", "우유", "대두", "밀", "땅콩", "갑각류"];

  // 알레르기 토글 (중복 선택 가능) — 선택 상태는 앱 전체에서 공유
  const handleToggleAllergy = (allergy: string) => onToggleAllergy(allergy);

  // 알레르기 성분 매칭 검사
  const matchedAllergyItems = ingredients.filter((item) =>
    selectedAllergies.some(
      (allergy) => item.name.includes(allergy) || item.category.includes(allergy)
    )
  );
  const hasAllergyItem = matchedAllergyItems.length > 0;

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEyebrow}>DAILY REPORT</Text>
          <Text style={styles.headerTitle}>성분 분석</Text>
        </View>
        <TouchableOpacity 
          style={styles.todayBtn} 
          onPress={() => {
            setViewYear(currentYear);
            setViewMonth(currentMonth);
            setSelectedDay(todayDate);
          }}
        >
          <Text style={styles.todayText}>오늘</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* 1. 섭취 요약 카드 */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryDate}>{viewMonth}월 {selectedDay}일 섭취 요약</Text>
            <Text style={styles.summaryKcalNum}>
              {isCurrentMonth && selectedDay === todayDate ? "2,119" : "1,850"} <Text style={styles.kcalUnit}>kcal</Text>
            </Text>
            <Text style={styles.summaryGoal}>목표 2,230 kcal</Text>
          </View>
          
          <View style={styles.circleProgress}>
            <View style={styles.circleInner}>
              <Text style={styles.circlePercent}>{isCurrentMonth && selectedDay === todayDate ? "94%" : "83%"}</Text>
              <Text style={styles.circleLabel}>목표 달성</Text>
            </View>
          </View>
        </View>

        {/* 2. 월간 섭취 칼로리 캘린더 섹션 */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionEyebrow}>MONTHLY CALORIES</Text>
              <Text style={styles.sectionTitle}>월간 섭취 칼로리</Text>
            </View>
            
            {/* 월 이동 컨트롤 */}
            <View style={styles.monthToggle}>
              <TouchableOpacity 
                onPress={handlePrevMonth} 
                disabled={currentTotalMonths <= minTotalMonths}
              >
                <Text style={[styles.monthToggleArrow, currentTotalMonths <= minTotalMonths && { opacity: 0.3 }]}>
                  ‹
                </Text>
              </TouchableOpacity>
              <Text style={styles.monthText}>{viewYear}년 {viewMonth}월</Text>
              <TouchableOpacity 
                onPress={handleNextMonth} 
                disabled={currentTotalMonths >= currentYear * 12 + currentMonth}
              >
                <Text style={[styles.monthToggleArrow, currentTotalMonths >= currentYear * 12 + currentMonth && { opacity: 0.3 }]}>
                  ›
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarCard}>
            {/* 요일 라벨 (일~토) */}
            <View style={styles.weekRow}>
              {["일", "월", "화", "수", "목", "금", "토"].map((w, idx) => (
                <Text key={idx} style={[styles.weekLabel, idx === 0 && { color: "#E57373" }]}>
                  {w}
                </Text>
              ))}
            </View>

            {/* 날짜 그리드 (요일 밀림 현상 완벽 해결) */}
            <View style={styles.daysGrid}>
              {calendarDays.map((item, index) => {
                if (item === null) {
                  return <View key={`empty-${index}`} style={styles.dayBoxEmpty} />;
                }

                const isAchieved = item.status === "achieved";
                const isWarning = item.status === "warning";
                const isSelected = item.day === selectedDay;
                const isToday = isCurrentMonth && item.day === todayDate;

                return (
                  <TouchableOpacity
                    key={`day-${item.day}`}
                    activeOpacity={0.7}
                    onPress={() => setSelectedDay(item.day)}
                    style={[
                      styles.dayBox,
                      isAchieved && styles.dayAchieved,
                      isWarning && styles.dayWarning,
                      isToday && styles.dayToday,
                      isSelected && styles.daySelected
                    ]}
                  >
                    <Text style={[styles.dayNumber, (isAchieved || isWarning) && styles.dayNumActive]}>
                      {item.day}
                    </Text>
                    <Text style={[styles.daySub, (isAchieved || isWarning) && styles.daySubActive]}>
                      {isCurrentMonth && item.day > todayDate ? "—" : "2.1k"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 범례 */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#C8E6C9" }]} />
                <Text style={styles.legendText}>달성</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#FFCCBC" }]} />
                <Text style={styles.legendText}>주의·초과</Text>
              </View>
            </View>
          </View>
          <Text style={styles.calendarNotice}>• 최대 3개월 전까지의 기록을 조회할 수 있어요.</Text>
        </View>

        {/* 3. 알레르기 체크 섹션 */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionEyebrow}>ALLERGY CHECK</Text>
              <Text style={styles.sectionTitle}>알레르기 정보</Text>
            </View>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>
                {selectedAllergies.length > 0 ? `${selectedAllergies.length}개 선택` : "선택 없음"}
              </Text>
            </View>
          </View>
          <Text style={styles.sectionSubTitle}>주의해야 할 알레르기 항목을 중복 선택해 주세요. 선택한 항목은 AI 셰프 추천에서도 빠져요.</Text>

          {/* 알레르기 선택 칩 가로 스크롤 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {allergies.map((allergy) => {
              const isSelected = selectedAllergies.includes(allergy);
              return (
                <TouchableOpacity
                  key={allergy}
                  style={[styles.allergyChip, isSelected && styles.allergyChipActive]}
                  onPress={() => handleToggleAllergy(allergy)}
                >
                  <Text style={[styles.allergyChipText, isSelected && styles.allergyChipTextActive]}>
                    {isSelected ? "✓ " : ""}{allergy}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 알레르기 결과 배너 */}
          {selectedAllergies.length > 0 ? (
            hasAllergyItem ? (
              <View style={styles.warningBanner}>
                <View style={styles.warningIconCircle}>
                  <Text style={styles.warningIconText}>!</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.warningTitle}>주의 재료가 냉장고에 있어요</Text>
                  <Text style={styles.warningSub}>
                    선택하신 성분({selectedAllergies.join(", ")})이 포함된 재료가 총 {matchedAllergyItems.length}개 있습니다. ({matchedAllergyItems.map(i => i.name).join(", ")})
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.safeBanner}>
                <View style={styles.safeIconCircle}>
                  <Text style={styles.safeIconText}>✓</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.safeTitle}>안심하세요!</Text>
                  <Text style={styles.safeSub}>
                    선택하신 알레르기 성분이 포함된 재료가 현재 냉장고에 없습니다.
                  </Text>
                </View>
              </View>
            )
          ) : (
            <View style={styles.infoBanner}>
              <Text style={styles.infoText}>💡 주의할 알레르기 항목을 위에서 선택해 보세요. (중복 선택 가능)</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F5" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "#F4F7F5" },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#E4EBE6", justifyContent: "center", alignItems: "center" },
  backButtonText: { fontSize: 24, color: "#333", fontWeight: "300" },
  headerCenter: { alignItems: "center" },
  headerEyebrow: { fontSize: 10, fontWeight: "bold", color: "#689F38", letterSpacing: 1 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#2C3E50" },
  todayBtn: { backgroundColor: "#E8F5E9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  todayText: { fontSize: 12, fontWeight: "bold", color: "#388E3C" },

  content: { flex: 1, paddingHorizontal: 20 },

  summaryCard: { backgroundColor: "#2B4C3F", borderRadius: 24, padding: 22, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  summaryDate: { fontSize: 12, color: "#A3C1AD", marginBottom: 6 },
  summaryKcalNum: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  kcalUnit: { fontSize: 15, fontWeight: "normal" },
  summaryGoal: { fontSize: 12, color: "#D2DCD6", marginTop: 4 },
  circleProgress: { width: 72, height: 72, borderRadius: 36, borderWidth: 6, borderColor: "#456858", justifyContent: "center", alignItems: "center", position: "relative" },
  circleInner: { alignItems: "center" },
  circlePercent: { fontSize: 15, fontWeight: "bold", color: "#FFD54F" },
  circleLabel: { fontSize: 8, color: "#fff", marginTop: 2 },

  sectionContainer: { marginBottom: 24 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  sectionEyebrow: { fontSize: 10, fontWeight: "bold", color: "#689F38", letterSpacing: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#2C3E50" },
  sectionSubTitle: { fontSize: 12, color: "#7F8C8D", marginBottom: 12 },

  monthToggle: { flexDirection: "row", alignItems: "center", backgroundColor: "#E8F5E9", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 8 },
  monthToggleArrow: { fontSize: 16, fontWeight: "bold", color: "#388E3C", paddingHorizontal: 4 },
  monthText: { fontSize: 12, fontWeight: "bold", color: "#2E7D32" },

  calendarCard: { backgroundColor: "#fff", borderRadius: 20, padding: 16, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  weekRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  weekLabel: { width: "13.5%", fontSize: 12, fontWeight: "bold", color: "#95A5A6", textAlign: "center" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 8 },
  dayBox: { width: "13.5%", aspectRatio: 0.9, borderRadius: 12, backgroundColor: "#F9FCFA", justifyContent: "center", alignItems: "center", paddingVertical: 4 },
  dayBoxEmpty: { width: "13.5%", aspectRatio: 0.9 }, // 빈 칸 패딩 정확한 비율 유지
  dayAchieved: { backgroundColor: "#C8E6C9" },
  dayWarning: { backgroundColor: "#FFCCBC" },
  dayToday: { borderWidth: 1.5, borderColor: "#2B4C3F" },
  daySelected: { borderWidth: 2, borderColor: "#1B5E20", backgroundColor: "#E8F5E9" },
  dayNumber: { fontSize: 12, fontWeight: "bold", color: "#2C3E50" },
  dayNumActive: { color: "#1B5E20" },
  daySub: { fontSize: 9, color: "#95A5A6", marginTop: 2 },
  daySubActive: { color: "#388E3C" },

  legendRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F2" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: "#7F8C8D" },
  calendarNotice: { fontSize: 11, color: "#95A5A6", marginTop: 8, marginLeft: 4 },

  badgeCount: { backgroundColor: "#E8F5E9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeCountText: { fontSize: 11, fontWeight: "bold", color: "#388E3C" },

  chipScroll: { flexDirection: "row", marginBottom: 12 },
  allergyChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E0E0E0", marginRight: 8 },
  allergyChipActive: { backgroundColor: "#FFF3E0", borderColor: "#FF7043" },
  allergyChipText: { fontSize: 13, color: "#7F8C8D", fontWeight: "600" },
  allergyChipTextActive: { color: "#D84315", fontWeight: "bold" },

  warningBanner: { backgroundColor: "#FFEBE5", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#FFCCBC" },
  warningIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FF7043", justifyContent: "center", alignItems: "center" },
  warningIconText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  warningTitle: { fontSize: 14, fontWeight: "bold", color: "#D84315" },
  warningSub: { fontSize: 11, color: "#C0392B", opacity: 0.85, marginTop: 2 },

  safeBanner: { backgroundColor: "#E8F5E9", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#C8E6C9" },
  safeIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#388E3C", justifyContent: "center", alignItems: "center" },
  safeIconText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  safeTitle: { fontSize: 14, fontWeight: "bold", color: "#2E7D32" },
  safeSub: { fontSize: 11, color: "#388E3C", opacity: 0.85, marginTop: 2 },

  infoBanner: { backgroundColor: "#F0F4F1", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#D5DED7" },
  infoText: { fontSize: 12, color: "#667A72", fontWeight: "600" },
});