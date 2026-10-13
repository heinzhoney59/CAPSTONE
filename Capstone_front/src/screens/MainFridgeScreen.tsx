import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CATEGORY_LABELS, COMPARTMENTS, COMPARTMENT_LABELS, KNOWN_INGREDIENTS, UNITS, UNIT_LABELS } from "../constants/fridge";
import { API_BASE_URL, getErrorMessage } from "../services/api";
import { Compartment, Ingredient, IngredientUnit, NewIngredientInput } from "../types";
import { addDaysFromToday, formatKoreanDate } from "../utils/date";

interface Props {
  ingredients: Ingredient[];
  loading: boolean;
  /** 목록을 불러오지 못했을 때의 에러 메시지 */
  error: string | null;
  onShowAll: () => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
  /** 실패하면 에러를 던진다 (모달 안에 메시지 표시) */
  onAdd: (input: NewIngredientInput) => Promise<void>;
}

const DEFAULT_DAYS = "7";

export default function MainFridgeScreen({ ingredients, loading, error, onShowAll, onDelete, onRefresh, onAdd }: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 재료 추가 폼 상태
  const [inputName, setInputName] = useState("");
  const [selectedCompartment, setSelectedCompartment] = useState<Compartment | null>(null); // null = 자동(재료 기본 칸)
  const [inputQuantity, setInputQuantity] = useState("1");
  const [selectedUnit, setSelectedUnit] = useState<IngredientUnit>("PIECE");
  const [inputDays, setInputDays] = useState(DEFAULT_DAYS);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const daysValid = /^\d+$/.test(inputDays.trim());
  const expiryDate = daysValid ? addDaysFromToday(parseInt(inputDays.trim(), 10)) : null;

  const resetForm = () => {
    setInputName("");
    setSelectedCompartment(null);
    setInputQuantity("1");
    setSelectedUnit("PIECE");
    setInputDays(DEFAULT_DAYS);
    setFormError(null);
  };

  const closeModal = () => {
    if (submitting) return;
    setFormError(null);
    setIsAddModalOpen(false);
  };

  // 등록 가능한 재료를 누르면 이름·단위·기본 수량·기본 보관일을 채워준다
  const handlePickKnown = (item: (typeof KNOWN_INGREDIENTS)[number]) => {
    setInputName(item.name);
    setSelectedUnit(item.unit);
    setInputQuantity(String(item.defaultQuantity));
    setInputDays(String(item.defaultDays));
    setFormError(null);
  };

  const handleAddSubmit = async () => {
    const name = inputName.trim();
    const quantity = parseFloat(inputQuantity.replace(",", "."));

    if (!name) {
      setFormError("재료 이름을 입력해 주세요.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFormError("수량을 0보다 큰 숫자로 입력해 주세요.");
      return;
    }
    if (!expiryDate) {
      setFormError("유통기한까지 남은 일수를 숫자로 입력해 주세요. (오늘까지면 0)");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await onAdd({ name, compartment: selectedCompartment, quantity, unit: selectedUnit, expiryDate });
      resetForm();
      setIsAddModalOpen(false);
    } catch (e) {
      setFormError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const showInitialLoading = loading && !ingredients.length && !error;

  return (
    <View style={styles.container}>
      {/* 상단바 */}
      <View style={styles.topbar}>
        <View>
          <Text style={styles.eyebrow}>MY FRIDGE</Text>
          <Text style={styles.title}>우리집 냉장고</Text>
        </View>
        <View style={styles.freshScore}>
          <Text style={styles.freshScoreNum}>{ingredients.length}</Text>
          <Text style={styles.freshScoreSub}>가지 재료</Text>
        </View>
      </View>

      {/* 서버 연결 실패 안내 */}
      {error && (
        <View style={styles.errorBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.errorTitle}>재료를 불러오지 못했어요</Text>
            <Text style={styles.errorSub}>{error}</Text>
          </View>
          <TouchableOpacity style={styles.retryBtn} onPress={onRefresh} disabled={loading}>
            <Text style={styles.retryText}>{loading ? "연결 중…" : "다시 시도"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 전체 재료 보기 배너 */}
      <TouchableOpacity style={styles.viewAllButton} onPress={onShowAll} activeOpacity={0.8}>
        <View style={styles.listSymbol}>
          <View style={styles.symbolLine} />
          <View style={styles.symbolLine} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.viewAllTitle}>전체 재료 보기</Text>
          <Text style={styles.viewAllSub}>{ingredients.length}가지 재료를 한눈에 확인해요</Text>
        </View>
        <Text style={styles.arrowText}>›</Text>
      </TouchableOpacity>

      {/* 냉장실 내부 인테리어 영역 (아래로 당기면 새로고침) */}
      <ScrollView
        style={styles.fridgeContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading && ingredients.length > 0} onRefresh={onRefresh} />}
      >
        <View style={styles.fridgeHeader}>
          <View style={styles.coolingLight} />
          <View style={{ flex: 1 }}>
            <Text style={styles.fridgeRoomTitle}>냉장실</Text>
            <Text style={styles.fridgeRoomSub}>신선하게 보관 중</Text>
          </View>
          <Text style={styles.temperature}>3°C</Text>
        </View>

        {CATEGORY_LABELS.map((category) => {
          const items = ingredients.filter((item) => item.category === category);
          if (!items.length) return null;
          const isDrawer = category === COMPARTMENT_LABELS.FRUIT || category === COMPARTMENT_LABELS.ETC;

          return (
            <View key={category} style={[styles.shelf, isDrawer && styles.drawerShelf]}>
              <View style={styles.shelfTitleRow}>
                <Text style={styles.shelfTitle}>{category}</Text>
                <View style={styles.shelfCountBadge}>
                  <Text style={styles.shelfCountText}>{items.length}</Text>
                </View>
              </View>

              <View style={styles.ingredientGrid}>
                {items.map((item) => (
                  <View key={item.id} style={styles.ingredientCard}>
                    <View style={styles.iconBox}>
                      <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
                    </View>
                    <View style={styles.ingredientCopy}>
                      <Text style={styles.ingredientName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.ingredientInfo} numberOfLines={1}>{item.amount}</Text>
                      <View style={styles.dateRow}>
                        <View style={[
                          styles.dateDot,
                          item.freshness === "fresh" ? styles.dotFresh : item.freshness === "soon" ? styles.dotSoon : styles.dotUrgent
                        ]} />
                        <Text style={styles.dateText} numberOfLines={1}>{item.days === 0 ? "오늘까지" : `${item.days}일 남음`}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)} hitSlop={8}>
                      <Text style={styles.deleteText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {showInitialLoading && (
          <View style={styles.emptyBox}>
            <ActivityIndicator color="#3a846b" />
            <Text style={[styles.emptySub, { marginTop: 10 }]}>냉장고를 여는 중…</Text>
          </View>
        )}

        {!ingredients.length && !showInitialLoading && !error && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>냉장고가 비어 있어요</Text>
            <Text style={styles.emptySub}>아래 버튼을 눌러 새 재료를 추가해 보세요.</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 우측 하단 플로팅 재료 추가 버튼 */}
      <TouchableOpacity
        style={styles.floatingAddBtn}
        activeOpacity={0.85}
        onPress={() => setIsAddModalOpen(true)}
      >
        <Text style={styles.floatingAddText}>＋ 재료 추가</Text>
      </TouchableOpacity>

      {/* 재료 추가 모달 */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🥕 새 재료 담기</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.inputLabel}>재료 이름</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="예: 당근, 우유"
                  placeholderTextColor="#9aa6a1"
                  value={inputName}
                  onChangeText={(text) => {
                    setInputName(text);
                    setFormError(null);
                  }}
                />
                <Text style={styles.helperText}>지금 서버에 등록된 재료만 넣을 수 있어요. 눌러서 바로 채우기:</Text>
                <View style={styles.chipRow}>
                  {KNOWN_INGREDIENTS.map((item) => (
                    <TouchableOpacity
                      key={item.name}
                      style={[styles.chip, inputName.trim() === item.name && styles.chipActive]}
                      onPress={() => handlePickKnown(item)}
                    >
                      <Text style={[styles.chipText, inputName.trim() === item.name && styles.chipTextActive]}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>보관 칸</Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[styles.chip, selectedCompartment === null && styles.chipActive]}
                    onPress={() => setSelectedCompartment(null)}
                  >
                    <Text style={[styles.chipText, selectedCompartment === null && styles.chipTextActive]}>자동</Text>
                  </TouchableOpacity>
                  {COMPARTMENTS.map((compartment) => (
                    <TouchableOpacity
                      key={compartment}
                      style={[styles.chip, selectedCompartment === compartment && styles.chipActive]}
                      onPress={() => setSelectedCompartment(compartment)}
                    >
                      <Text style={[styles.chipText, selectedCompartment === compartment && styles.chipTextActive]}>
                        {COMPARTMENT_LABELS[compartment]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {selectedCompartment === null && (
                  <Text style={styles.helperText}>자동: 재료마다 정해진 기본 칸에 넣어요 (예: 당근 → 채소칸)</Text>
                )}

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>수량</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="예: 2"
                      placeholderTextColor="#9aa6a1"
                      keyboardType="decimal-pad"
                      value={inputQuantity}
                      onChangeText={setInputQuantity}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>단위</Text>
                    <View style={styles.unitRow}>
                      {UNITS.map((unit) => (
                        <TouchableOpacity
                          key={unit}
                          style={[styles.unitChip, selectedUnit === unit && styles.chipActive]}
                          onPress={() => setSelectedUnit(unit)}
                        >
                          <Text style={[styles.chipText, selectedUnit === unit && styles.chipTextActive]}>{UNIT_LABELS[unit]}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <Text style={styles.inputLabel}>유통기한까지 남은 일수</Text>
                <View style={styles.daysRow}>
                  <TextInput
                    style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                    placeholder="예: 5 (오늘까지면 0)"
                    placeholderTextColor="#9aa6a1"
                    keyboardType="number-pad"
                    value={inputDays}
                    onChangeText={setInputDays}
                  />
                  <Text style={styles.datePreview}>
                    {expiryDate ? `→ ${formatKoreanDate(expiryDate)}까지` : "숫자만 입력"}
                  </Text>
                </View>

                {formError && <Text style={styles.formErrorText}>{formError}</Text>}

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleAddSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitBtnText}>냉장고에 넣기</Text>
                  )}
                </TouchableOpacity>
                <Text style={styles.serverHint}>서버: {API_BASE_URL}</Text>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fbfcf8" },
  topbar: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { fontFamily: "Nunito", fontSize: 10, fontWeight: "800", color: "#55a384", letterSpacing: 1.6, marginBottom: 3 },
  title: { fontSize: 25, fontWeight: "bold", color: "#233b35", letterSpacing: -0.8 },
  freshScore: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#e3f2ea", justifyContent: "center", alignItems: "center" },
  freshScoreNum: { fontFamily: "Nunito", fontSize: 17, fontWeight: "800", color: "#338165" },
  freshScoreSub: { fontSize: 8, color: "#638179", marginTop: 2 },

  errorBanner: { marginHorizontal: 22, marginBottom: 12, padding: 12, backgroundColor: "#fdeeed", borderWidth: 1, borderColor: "#f3cfcb", borderRadius: 15, flexDirection: "row", alignItems: "center", gap: 10 },
  errorTitle: { fontSize: 12, fontWeight: "bold", color: "#a8443d", marginBottom: 3 },
  errorSub: { fontSize: 10, color: "#8a5a55", lineHeight: 14 },
  retryBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eab8b3", borderRadius: 10 },
  retryText: { fontSize: 11, fontWeight: "bold", color: "#a8443d" },

  viewAllButton: { marginHorizontal: 22, marginBottom: 14, padding: 12, backgroundColor: "#edf7f3", borderWidth: 1, borderColor: "#d7ebe3", borderRadius: 15, flexDirection: "row", alignItems: "center" },
  listSymbol: { width: 33, height: 33, borderRadius: 10, backgroundColor: "#cfe8de", justifyContent: "space-between", padding: 8, marginRight: 11 },
  symbolLine: { height: 2, backgroundColor: "#488a73", borderRadius: 99 },
  viewAllTitle: { fontSize: 12, fontWeight: "bold", color: "#2d4941" },
  viewAllSub: { fontSize: 9, color: "#789087", marginTop: 2 },
  arrowText: { fontFamily: "Nunito", fontSize: 22, color: "#58937e" },

  fridgeContent: { flex: 1, marginHorizontal: 13, paddingHorizontal: 18, backgroundColor: "#f0f6f8", borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingTop: 10 },
  fridgeHeader: { height: 60, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  coolingLight: { width: 31, height: 15, borderRadius: 5, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#c0d4da", marginRight: 9 },
  fridgeRoomTitle: { fontSize: 12, fontWeight: "bold", color: "#334c44" },
  fridgeRoomSub: { fontSize: 8, color: "#81969c", marginTop: 1 },
  temperature: { paddingHorizontal: 8, paddingVertical: 5, backgroundColor: "rgba(255,255,255,0.7)", borderWidth: 1, borderColor: "#d3e2e6", borderRadius: 7, fontFamily: "Nunito", fontSize: 10, fontWeight: "800", color: "#3f7888" },

  shelf: { marginBottom: 20, padding: 10, backgroundColor: "rgba(255,255,255,0.35)", borderRadius: 10 },
  drawerShelf: { backgroundColor: "rgba(194, 218, 225, 0.4)", borderRadius: 12 },
  shelfTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 9 },
  shelfTitle: { fontSize: 12, fontWeight: "bold", color: "#405b62", marginRight: 7 },
  shelfCountBadge: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "rgba(205,229,234,0.8)", borderRadius: 99 },
  shelfCountText: { fontFamily: "Nunito", fontSize: 9, fontWeight: "700", color: "#4c7d88" },

  // 2열 그리드: 카드 48.5% × 2 + 사이 간격 3% (예전엔 marginRight 3%까지 더해져 103%가 되어 한 줄에 1개씩만 보였음)
  ingredientGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  ingredientCard: { width: "48.5%", padding: 8, paddingRight: 22, backgroundColor: "rgba(255,255,255,0.75)", borderWidth: 1, borderColor: "rgba(183,207,214,0.75)", borderRadius: 10, flexDirection: "row", alignItems: "center", marginBottom: 7 },
  iconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: "rgba(245,250,250,0.8)", justifyContent: "center", alignItems: "center", marginRight: 7 },
  ingredientCopy: { flex: 1, minWidth: 0 },
  ingredientName: { fontSize: 12, fontWeight: "bold", color: "#233b35", marginBottom: 1 },
  ingredientInfo: { fontSize: 8, color: "#899892", marginBottom: 3 },
  dateRow: { flexDirection: "row", alignItems: "center" },
  dateDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  dotFresh: { backgroundColor: "#64bd72" },
  dotSoon: { backgroundColor: "#f1ba3d" },
  dotUrgent: { backgroundColor: "#ed675e" },
  dateText: { fontFamily: "Nunito", fontSize: 8, fontWeight: "700", color: "#667c75" },
  deleteBtn: { position: "absolute", top: 4, right: 4, width: 18, height: 18, justifyContent: "center", alignItems: "center" },
  deleteText: { fontSize: 14, color: "#b24d46", fontWeight: "bold" },

  emptyBox: { padding: 50, alignItems: "center" },
  emptyTitle: { fontSize: 13, fontWeight: "bold", color: "#496059", marginBottom: 4 },
  emptySub: { fontSize: 10, color: "#80928c" },

  floatingAddBtn: { position: "absolute", bottom: 25, right: 22, backgroundColor: "#3a846b", paddingHorizontal: 20, paddingVertical: 14, borderRadius: 99, shadowColor: "#204a3c", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  floatingAddText: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: "#ffffff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  modalTitle: { fontSize: 17, fontWeight: "bold", color: "#233b35" },
  modalCloseText: { fontSize: 20, color: "#888", padding: 4 },
  inputLabel: { fontSize: 11, fontWeight: "bold", color: "#3a564d", marginBottom: 5, marginTop: 10 },
  helperText: { fontSize: 10, color: "#7d8f88", marginBottom: 6 },
  textInput: { backgroundColor: "#f4f7f5", borderWidth: 1, borderColor: "#d8e3de", borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 12, color: "#233b35", marginBottom: 5 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 5 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: "#f4f7f5", borderWidth: 1, borderColor: "#d8e3de", borderRadius: 8 },
  chipActive: { backgroundColor: "#3a846b", borderColor: "#3a846b" },
  chipText: { fontSize: 11, color: "#556b62" },
  chipTextActive: { color: "#ffffff", fontWeight: "bold" },
  unitRow: { flexDirection: "row", gap: 6, height: 44, marginBottom: 5 },
  unitChip: { flex: 1, backgroundColor: "#f4f7f5", borderWidth: 1, borderColor: "#d8e3de", borderRadius: 10, justifyContent: "center", alignItems: "center" },
  daysRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  datePreview: { fontSize: 11, fontWeight: "bold", color: "#3a846b" },

  formErrorText: { fontSize: 11, color: "#d95850", fontWeight: "600", marginTop: 14, lineHeight: 16 },
  submitBtn: { backgroundColor: "#3a846b", borderRadius: 12, height: 48, justifyContent: "center", alignItems: "center", marginTop: 20, marginBottom: 8 },
  submitBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },
  serverHint: { fontSize: 9, color: "#a3b0ab", textAlign: "center", marginBottom: 24 },
});
