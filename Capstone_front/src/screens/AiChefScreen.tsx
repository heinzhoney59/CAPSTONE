import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { QUICK_QUESTIONS, SERVING_OPTIONS, buildChefPrompt, findAllergyConflicts, parseChefReply } from "../services/aiChef";
import { getErrorMessage, requestAiChat } from "../services/api";
import { AiRecipe, ChatMessage, Ingredient } from "../types";

interface Props {
  ingredients: Ingredient[];
  /** 성분 탭에서 선택한 알레르기 (추천에서 제외) */
  allergies: string[];
  onBack: () => void;
}

const GREETING: ChatMessage = {
  id: 1,
  role: "ai",
  text: "안녕하세요! 냉장고 재료와 유통기한을 보고 지금 만들기 좋은 요리를 추천해 드릴게요. 인원수는 위에서 고를 수 있고, 성분 탭에서 고른 알레르기 재료는 빼고 추천해요.",
};

/** AI가 추천한 레시피 한 개를 카드로 보여준다 */
function RecipeCard({ recipe, allergies }: { recipe: AiRecipe; allergies: string[] }) {
  // AI가 규칙을 어기고 알레르기 재료를 넣었을 수도 있으니 한 번 더 확인
  const conflicts = findAllergyConflicts(recipe, allergies);
  const meta = [
    recipe.time && `⏱ ${recipe.time}`,
    recipe.difficulty,
    recipe.servings && `${recipe.servings}인분`,
    recipe.calories,
  ].filter(Boolean) as string[];

  return (
    <View style={styles.recipeCard}>
      {conflicts.length > 0 && (
        <View style={styles.allergyWarn}>
          <Text style={styles.allergyWarnText}>
            ⚠️ 선택한 알레르기({conflicts.join(", ")})와 관련된 재료가 보여요. 먹기 전에 꼭 확인하세요.
          </Text>
        </View>
      )}
      <Text style={styles.recipeTitle}>{recipe.title}</Text>
      {!!recipe.summary && <Text style={styles.recipeSummary}>{recipe.summary}</Text>}

      {meta.length > 0 && (
        <View style={styles.metaRow}>
          {meta.map((m, i) => (
            <Text key={`${i}-${m}`} style={styles.metaPill}>{m}</Text>
          ))}
        </View>
      )}

      {recipe.usedIngredients.length > 0 && (
        <>
          <Text style={styles.cardLabel}>냉장고 재료</Text>
          <View style={styles.tagWrap}>
            {recipe.usedIngredients.map((item, i) => (
              <Text key={`${i}-${item}`} style={[styles.tag, styles.tagFridge]}>{item}</Text>
            ))}
          </View>
        </>
      )}

      <Text style={styles.cardLabel}>추가로 필요한 재료</Text>
      {recipe.extraIngredients.length > 0 ? (
        <View style={styles.tagWrap}>
          {recipe.extraIngredients.map((item, i) => (
            <Text key={`${i}-${item}`} style={[styles.tag, styles.tagExtra]}>{item}</Text>
          ))}
        </View>
      ) : (
        <Text style={styles.noExtraText}>없어요. 냉장고 재료로 바로 만들 수 있어요 👍</Text>
      )}

      {recipe.steps.length > 0 && (
        <>
          <Text style={styles.cardLabel}>만드는 법</Text>
          {recipe.steps.map((step, idx) => (
            <View key={`${idx}-${step}`} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </>
      )}

      {!!recipe.tip && (
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>💡 {recipe.tip}</Text>
        </View>
      )}
    </View>
  );
}

export default function AiChefScreen({ ingredients, allergies, onBack }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [servings, setServings] = useState(1);
  const scrollRef = useRef<ScrollView>(null);

  const urgentCount = ingredients.filter((item) => item.days <= 3).length;

  const handleSend = async (textToSend?: string) => {
    const question = (textToSend ?? input).trim();
    if (!question || sending) return;

    // 서버에는 질문 + 냉장고 재료 + 인원 + 알레르기 + 최근 대화를 하나의 프롬프트로 보낸다
    const history = messages.filter((m) => m.id !== GREETING.id);
    const userMsg: ChatMessage = { id: Date.now(), role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const raw = await requestAiChat(buildChefPrompt(question, { ingredients, allergies, servings, history }));
      const reply = parseChefReply(raw);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ai", text: reply.text, recipes: reply.recipes, isError: reply.isError },
      ]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "ai", text: getErrorMessage(error), isError: true }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.eyebrow}>SMART COOKING</Text>
          <Text style={styles.title}>AI 셰프</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{sending ? "답변 작성 중" : "온라인"}</Text>
        </View>
      </View>

      {/* 냉장고 연동 안내 + 인원 선택 */}
      <View style={styles.contextBanner}>
        <View style={styles.chefBadge}>
          <View style={styles.chefBadgeInner} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.contextTitle}>냉장고와 연결됐어요</Text>
          <Text style={styles.contextSub}>
            {ingredients.length}가지 재료{urgentCount > 0 ? ` · 임박 ${urgentCount}개 먼저 사용` : ""}
          </Text>
          <Text style={[styles.contextSub, allergies.length > 0 && styles.allergyText]} numberOfLines={1}>
            {allergies.length > 0 ? `알레르기 제외: ${allergies.join(", ")}` : "알레르기: 없음 (성분 탭에서 설정)"}
          </Text>
        </View>
        <View style={styles.servingsBox}>
          <Text style={styles.servingsLabel}>인원</Text>
          <View style={styles.servingsRow}>
            {SERVING_OPTIONS.map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.servingChip, servings === n && styles.servingChipActive]}
                onPress={() => setServings(n)}
                disabled={sending}
              >
                <Text style={[styles.servingChipText, servings === n && styles.servingChipTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* 채팅 메시지 영역 */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={styles.msgBlock}>
            <View style={[styles.msgRow, msg.role === "user" && styles.msgRowUser]}>
              {msg.role === "ai" && (
                <View style={styles.botAvatar}>
                  <View style={styles.botAvatarInner} />
                </View>
              )}
              <View style={[styles.bubble, msg.role === "user" && styles.bubbleUser, msg.isError && styles.bubbleError]}>
                <Text style={[styles.bubbleText, msg.role === "user" && styles.bubbleTextUser, msg.isError && styles.bubbleTextError]}>
                  {msg.text}
                </Text>
              </View>
            </View>
            {msg.recipes?.map((recipe, idx) => (
              <RecipeCard key={`${msg.id}-${idx}`} recipe={recipe} allergies={allergies} />
            ))}
          </View>
        ))}
        {sending && (
          <View style={styles.msgBlock}>
            <View style={styles.msgRow}>
              <View style={styles.botAvatar}>
                <View style={styles.botAvatarInner} />
              </View>
              <View style={[styles.bubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#3c8b70" />
                <Text style={styles.bubbleText}>레시피를 고민하는 중…</Text>
              </View>
            </View>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* 하단 입력바 및 빠른 질문 */}
      <View style={styles.composerWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickPrompts}>
          {QUICK_QUESTIONS.map((q) => (
            <TouchableOpacity
              key={q.label}
              style={[styles.promptChip, sending && { opacity: 0.5 }]}
              onPress={() => handleSend(q.question)}
              disabled={sending}
            >
              <Text style={styles.promptText}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="예: 당근으로 만들 반찬 알려줘"
            placeholderTextColor="#9aa6a1"
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.5 }]}
            onPress={() => handleSend()}
            disabled={!input.trim() || sending}
          >
            <Text style={styles.sendBtnText}>전송</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9f7" },
  header: { minHeight: 81, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.72)", borderBottomWidth: 1, borderBottomColor: "#e8eeea" },
  backButton: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#edf3ef", justifyContent: "center", alignItems: "center" },
  backButtonText: { fontSize: 26, color: "#476159", lineHeight: 28 },
  eyebrow: { fontFamily: "Nunito", fontSize: 10, fontWeight: "800", color: "#55a384", letterSpacing: 1.6, marginBottom: 3 },
  title: { fontSize: 21, fontWeight: "bold", color: "#233b35", letterSpacing: -0.8 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#5cbd79" },
  statusText: { fontSize: 8, color: "#71867e" },

  contextBanner: { marginHorizontal: 18, marginVertical: 10, padding: 10, backgroundColor: "rgba(233,246,240,0.84)", borderWidth: 1, borderColor: "#d7e9e1", borderRadius: 13, flexDirection: "row", alignItems: "center", gap: 9 },
  chefBadge: { width: 31, height: 31, borderRadius: 10, borderWidth: 2, borderColor: "#4e8b76", backgroundColor: "#ffffff", justifyContent: "center", alignItems: "center" },
  chefBadgeInner: { width: 13, height: 9, borderWidth: 1.5, borderColor: "#4e8b76", borderRadius: 4 },
  contextTitle: { fontSize: 10, fontWeight: "bold", color: "#233b35" },
  contextSub: { fontSize: 8, color: "#758b83", marginTop: 2 },
  allergyText: { color: "#c0623a", fontWeight: "bold" },
  servingsBox: { alignItems: "center" },
  servingsLabel: { fontSize: 8, color: "#758b83", marginBottom: 3 },
  servingsRow: { flexDirection: "row", gap: 3 },
  servingChip: { width: 22, height: 22, borderRadius: 7, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#cfe2da", justifyContent: "center", alignItems: "center" },
  servingChipActive: { backgroundColor: "#3c8b70", borderColor: "#3c8b70" },
  servingChipText: { fontSize: 10, color: "#516b62", fontWeight: "600" },
  servingChipTextActive: { color: "#ffffff" },

  chatScroll: { flex: 1, paddingHorizontal: 18, paddingTop: 13 },
  msgBlock: { marginBottom: 15 },
  msgRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  msgRowUser: { justifyContent: "flex-end" },
  botAvatar: { width: 31, height: 31, borderRadius: 10, backgroundColor: "#dff1ea", borderWidth: 1, borderColor: "#bee0d3", justifyContent: "center", alignItems: "center" },
  botAvatarInner: { width: 13, height: 10, borderWidth: 1.5, borderColor: "#397961", borderRadius: 4, backgroundColor: "#ffffff" },
  bubble: { maxWidth: "80%", padding: 11, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e0e8e4", borderTopLeftRadius: 5, borderTopRightRadius: 15, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, shadowColor: "#2f483f", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, elevation: 1 },
  bubbleUser: { backgroundColor: "#dcefe8", borderColor: "#cfe6dd", borderTopLeftRadius: 15, borderTopRightRadius: 5, borderBottomLeftRadius: 15, borderBottomRightRadius: 15 },
  bubbleText: { fontSize: 11, color: "#304941", lineHeight: 16 },
  bubbleTextUser: { color: "#255342" },
  bubbleError: { backgroundColor: "#fdeeed", borderColor: "#f3cfcb" },
  bubbleTextError: { color: "#a8443d" },
  typingBubble: { flexDirection: "row", alignItems: "center", gap: 8 },

  // AI 레시피 카드 (말풍선 아래, 아바타 너비만큼 들여씀)
  recipeCard: { marginLeft: 39, marginTop: 8, padding: 13, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d7e9e1", borderRadius: 14, shadowColor: "#2f483f", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, elevation: 1 },
  recipeTitle: { fontSize: 14, fontWeight: "bold", color: "#233b35" },
  allergyWarn: { marginBottom: 9, padding: 8, backgroundColor: "#fff3e8", borderWidth: 1, borderColor: "#f6d3b5", borderRadius: 9 },
  allergyWarnText: { fontSize: 10, color: "#b0541e", fontWeight: "600", lineHeight: 14 },
  recipeSummary: { fontSize: 10, color: "#667a72", marginTop: 3, lineHeight: 14 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 8 },
  metaPill: { fontSize: 9, color: "#3f6f5f", backgroundColor: "#edf7f3", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 99, overflow: "hidden" },
  cardLabel: { fontSize: 9, fontWeight: "bold", color: "#55a384", letterSpacing: 0.4, marginTop: 11, marginBottom: 5 },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  tag: { fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: "hidden" },
  tagFridge: { color: "#2f6b57", backgroundColor: "#e3f2ea" },
  tagExtra: { color: "#8a5a1c", backgroundColor: "#fdf1dd" },
  noExtraText: { fontSize: 10, color: "#5c8a78" },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 7, marginBottom: 6 },
  stepNum: { width: 17, height: 17, borderRadius: 9, backgroundColor: "#3c8b70", justifyContent: "center", alignItems: "center", marginTop: 1 },
  stepNumText: { fontSize: 9, color: "#ffffff", fontWeight: "bold" },
  stepText: { flex: 1, fontSize: 11, color: "#304941", lineHeight: 16 },
  tipBox: { marginTop: 8, padding: 9, backgroundColor: "#f6faf8", borderRadius: 10 },
  tipText: { fontSize: 10, color: "#4d6a60", lineHeight: 15 },

  composerWrap: { paddingHorizontal: 15, paddingVertical: 10, backgroundColor: "rgba(255,255,255,0.96)", borderTopWidth: 1, borderTopColor: "#e2e9e5" },
  quickPrompts: { marginBottom: 8 },
  promptChip: { paddingHorizontal: 10, paddingVertical: 7, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dbe6e1", borderRadius: 99, marginRight: 6 },
  promptText: { fontSize: 9, color: "#516b62" },
  inputRow: { height: 45, backgroundColor: "#f0f3f1", borderWidth: 1, borderColor: "#e1e7e3", borderRadius: 14, flexDirection: "row", alignItems: "center", paddingLeft: 13 },
  textInput: { flex: 1, fontSize: 11, color: "#304941" },
  sendBtn: { height: "100%", paddingHorizontal: 16, backgroundColor: "#3c8b70", borderTopRightRadius: 13, borderBottomRightRadius: 13, justifyContent: "center", alignItems: "center" },
  sendBtnText: { fontSize: 10, color: "#ffffff", fontWeight: "bold" },
});
