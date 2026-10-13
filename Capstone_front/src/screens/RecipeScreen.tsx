import { useState } from "react";
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ingredient, Recipe } from "../types";

interface Props {
  ingredients: Ingredient[];
  onBack: () => void;
}

type LocalRecipe = Recipe & {
  isLiked?: boolean;
};

const initialRecipes: LocalRecipe[] = [
  {
    id: 1,
    title: "돼지고기 채소 불고기",
    description: "냉장고 속 돼지고기와 채소를 한 번에",
    image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=82&w=600&h=420",
    time: "20분",
    calories: "520 kcal",
    likes: 128,
    isLiked: false,
    tags: ["돼지고기", "믹스 채소"],
    steps: [
      "돼지고기와 채소를 먹기 좋은 크기로 손질해요.",
      "달군 팬에 고기를 먼저 볶고 채소를 넣어요.",
      "간장과 후추로 간한 뒤 센 불에서 빠르게 마무리해요."
    ],
    comments: [
      { id: 1, author: "민지", text: "남은 채소까지 활용할 수 있어서 정말 좋았어요." },
      { id: 2, author: "요리초보", text: "레시피대로 하니 20분 안에 완성됐어요!" }
    ],
    source: "curated",
  },
  {
    id: 2,
    title: "신선 채소 비빔밥",
    description: "알록달록 채소로 채운 든든한 한 그릇",
    image: "https://images.unsplash.com/photo-1718777791239-c473e9ce7376?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=82&w=600&h=420",
    time: "15분",
    calories: "430 kcal",
    likes: 96,
    isLiked: false,
    tags: ["당근", "믹스 채소"],
    steps: [
      "채소를 가늘게 썰어 각각 살짝 볶아요.",
      "따뜻한 밥 위에 채소를 보기 좋게 올려요.",
      "고추장과 참기름을 넣고 골고루 비벼요."
    ],
    comments: [
      { id: 3, author: "하늘", text: "가볍지만 든든해서 점심 메뉴로 딱이에요." }
    ],
    source: "curated",
  },
];

export default function RecipeScreen({ ingredients, onBack }: Props) {
  const [recipes, setRecipes] = useState<LocalRecipe[]>(initialRecipes);
  const [activeTab, setActiveTab] = useState<"likes" | "comments">("likes");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<LocalRecipe | null>(null);

  // 수정 중인 레시피 ID (null이면 새로 만들기)
  const [editingRecipeId, setEditingRecipeId] = useState<number | null>(null);

  // 폼 입력 상태
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTime, setNewTime] = useState("20분");
  const [newCalories, setNewCalories] = useState("450 kcal");
  const [newSteps, setNewSteps] = useState("");

  // 상세 보기 내 댓글 입력 상태
  const [newCommentText, setNewCommentText] = useState("");

  // 정렬 탭 (좋아요 많은 순 / 댓글 많은 순)
  const sortedRecipes = [...recipes].sort((a, b) =>
    activeTab === "likes" ? b.likes - a.likes : b.comments.length - a.comments.length
  );

  // 작성창 열기 (새로 만들기 모드)
  const handleOpenCreate = () => {
    setEditingRecipeId(null);
    setNewTitle("");
    setNewDesc("");
    setNewTime("20분");
    setNewCalories("450 kcal");
    setNewSteps("");
    setIsCreateModalOpen(true);
  };

  // 수정창 열기 (기존 데이터 채우기)
  const handleOpenEdit = (recipe: LocalRecipe) => {
    setSelectedRecipe(null); // 상세 보기 닫기
    setEditingRecipeId(recipe.id);
    setNewTitle(recipe.title);
    setNewDesc(recipe.description);
    setNewTime(recipe.time);
    setNewCalories(recipe.calories);
    setNewSteps(recipe.steps.join("\n"));
    setIsCreateModalOpen(true);
  };

  // 레시피 등록 또는 수정 저장
  const handleSaveRecipe = () => {
    if (!newTitle.trim()) return;

    if (editingRecipeId !== null) {
      // 수정 모드
      setRecipes(
        recipes.map((r) =>
          r.id === editingRecipeId
            ? {
                ...r,
                title: newTitle,
                description: newDesc || r.description,
                time: newTime,
                calories: newCalories,
                steps: newSteps ? newSteps.split("\n") : r.steps,
              }
            : r
        )
      );
    } else {
      // 새로 만들기 모드
      const newRecipeItem: LocalRecipe = {
        id: Date.now(),
        title: newTitle,
        description: newDesc || "나만의 특별한 레시피",
        image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=82&w=600&h=420",
        time: newTime,
        calories: newCalories,
        likes: 0,
        isLiked: false,
        tags: ["나만의 레시피"],
        steps: newSteps ? newSteps.split("\n") : ["재료를 손질하고 맛있게 조리해요."],
        comments: [],
        source: "user",
      };
      setRecipes([newRecipeItem, ...recipes]);
    }

    setIsCreateModalOpen(false);
    setEditingRecipeId(null);
  };

  // 레시피 삭제 핸들러
  const handleDeleteRecipe = (id: number) => {
    setRecipes(recipes.filter((r) => r.id !== id));
    setSelectedRecipe(null);
  };

  // 좋아요 토글 핸들러
  const handleLike = () => {
    if (!selectedRecipe) return;

    const currentlyLiked = selectedRecipe.isLiked || false;
    const updatedIsLiked = !currentlyLiked;
    const updatedLikes = updatedIsLiked 
      ? selectedRecipe.likes + 1 
      : Math.max(0, selectedRecipe.likes - 1);

    const updatedRecipe: LocalRecipe = {
      ...selectedRecipe,
      likes: updatedLikes,
      isLiked: updatedIsLiked,
    };

    setSelectedRecipe(updatedRecipe);
    setRecipes(recipes.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r)));
  };

  // 댓글 추가 핸들러
  const handleAddComment = () => {
    if (!newCommentText.trim() || !selectedRecipe) return;

    const newComment = {
      id: Date.now(),
      author: "나",
      text: newCommentText.trim(),
    };

    const updatedComments = [...selectedRecipe.comments, newComment];
    const updatedRecipe: LocalRecipe = { ...selectedRecipe, comments: updatedComments };

    setSelectedRecipe(updatedRecipe);
    setRecipes(recipes.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r)));
    setNewCommentText("");
  };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.eyebrow}>MY KITCHEN</Text>
          <Text style={styles.title}>레시피</Text>
        </View>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 새 레시피 만들기 배너 */}
        <TouchableOpacity 
          style={styles.createCard} 
          activeOpacity={0.85}
          onPress={handleOpenCreate}
        >
          <View style={styles.createMark}>
            <View style={styles.plusMarkInner} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.createTitle}>새 레시피 만들기</Text>
            <Text style={styles.createSub}>나만의 재료와 조리법을 직접 기록해요</Text>
          </View>
          <Text style={styles.createSymbol}>＋</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.eyebrow}>MY RECIPE BOOK</Text>
            <Text style={styles.sectionTitle}>레시피 모음</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{recipes.length}개</Text>
          </View>
        </View>

        {/* 정렬 탭 */}
        <View style={styles.sortRow}>
          <View style={styles.sortTabs}>
            <TouchableOpacity 
              style={[styles.sortTabBtn, activeTab === "likes" ? styles.sortTabActive : undefined]}
              onPress={() => setActiveTab("likes")}
            >
              <Text style={[styles.sortTabText, activeTab === "likes" ? styles.sortTabTextActive : undefined]}>좋아요</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sortTabBtn, activeTab === "comments" ? styles.sortTabActive : undefined]}
              onPress={() => setActiveTab("comments")}
            >
              <Text style={[styles.sortTabText, activeTab === "comments" ? styles.sortTabTextActive : undefined]}>댓글</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 레시피 카드 리스트 */}
        <View style={styles.recipeList}>
          {sortedRecipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recipeCard}
              activeOpacity={0.9}
              onPress={() => setSelectedRecipe(recipe)}
            >
              <Image source={{ uri: recipe.image }} style={styles.recipeImg} />
              <View style={styles.recipeCopy}>
                <View style={styles.tagRow}>
                  {recipe.tags.map((tag) => (
                    <Text key={tag} style={styles.tagBadge}>{tag}</Text>
                  ))}
                  {recipe.source === "user" && (
                    <Text style={styles.userBadge}>내가 쓴 글</Text>
                  )}
                </View>
                <Text style={styles.recipeTitle} numberOfLines={1}>{recipe.title}</Text>
                <Text style={styles.recipeDesc} numberOfLines={1}>{recipe.description}</Text>
                
                <View style={styles.recipeMeta}>
                  <Text style={styles.metaRightMargin}>⏱ {recipe.time}</Text>
                  <Text style={styles.metaRightMargin}>{recipe.calories}</Text>
                  <Text style={[styles.likeText, recipe.isLiked ? styles.likeTextActive : undefined]}>
                    ♥ {recipe.likes}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 1. 레시피 작성 및 수정 모달 */}
      <Modal visible={isCreateModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRecipeId !== null ? "✨ 레시피 수정하기" : "✨ 새 레시피 작성"}
              </Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>요리 이름</Text>
              <TextInput
                style={styles.textInput}
                placeholder="예: 나만의 김치볶음밥"
                placeholderTextColor="#9aa6a1"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>한 줄 설명</Text>
              <TextInput
                style={styles.textInput}
                placeholder="예: 남은 김치로 10분 만에 뚝딱"
                placeholderTextColor="#9aa6a1"
                value={newDesc}
                onChangeText={setNewDesc}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>조리 시간</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="15분"
                    placeholderTextColor="#9aa6a1"
                    value={newTime}
                    onChangeText={setNewTime}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>칼로리</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="450 kcal"
                    placeholderTextColor="#9aa6a1"
                    value={newCalories}
                    onChangeText={setNewCalories}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>조리 순서 (줄바꿈으로 구분)</Text>
              <TextInput
                style={[styles.textInput, { height: 90, textAlignVertical: "top", paddingTop: 10 }]}
                placeholder="1. 팬에 기름을 둘러요&#10;2. 재료를 볶아줘요"
                placeholderTextColor="#9aa6a1"
                multiline
                value={newSteps}
                onChangeText={setNewSteps}
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleSaveRecipe}>
                <Text style={styles.submitBtnText}>
                  {editingRecipeId !== null ? "수정 완료" : "레시피 등록하기"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. 레시피 상세 보기 및 수정/삭제 모달 */}
      <Modal visible={selectedRecipe !== null} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedRecipe && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle} numberOfLines={1}>{selectedRecipe.title}</Text>
                  <TouchableOpacity onPress={() => setSelectedRecipe(null)}>
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Image source={{ uri: selectedRecipe.image }} style={styles.detailImg} />
                  <Text style={styles.detailDesc}>{selectedRecipe.description}</Text>

                  {/* 메타 정보 및 좋아요 토글 버튼 */}
                  <View style={styles.detailMetaRow}>
                    <Text style={styles.metaRightMargin}>⏱ {selectedRecipe.time}</Text>
                    <Text style={styles.metaRightMargin}>🔥 {selectedRecipe.calories}</Text>
                    <TouchableOpacity 
                      style={[
                        styles.likeButtonBox, 
                        selectedRecipe.isLiked ? styles.likeButtonBoxActive : undefined
                      ]} 
                      onPress={handleLike}
                    >
                      <Text style={[styles.likeText, selectedRecipe.isLiked ? styles.likeTextActive : undefined]}>
                        {selectedRecipe.isLiked ? "♥ 좋아요 취소" : "♥ 좋아요"} ({selectedRecipe.likes})
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* 본인이 작성한 레시피일 때만 수정/삭제 버튼 노출 */}
                  {selectedRecipe.source === "user" && (
                    <View style={styles.authorActionsRow}>
                      <TouchableOpacity 
                        style={styles.editActionBtn} 
                        onPress={() => handleOpenEdit(selectedRecipe)}
                      >
                        <Text style={styles.editActionText}>수정하기</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.deleteActionBtn} 
                        onPress={() => handleDeleteRecipe(selectedRecipe.id)}
                      >
                        <Text style={styles.deleteActionText}>삭제하기</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <Text style={styles.detailSectionTitle}>🍳 조리 순서</Text>
                  {selectedRecipe.steps.map((step, idx) => (
                    <View key={idx} style={styles.stepRow}>
                      <View style={styles.stepNumBadge}>
                        <Text style={styles.stepNumText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}

                  <Text style={styles.detailSectionTitle}>💬 요리 후기 및 댓글</Text>
                  {selectedRecipe.comments.length > 0 ? (
                    selectedRecipe.comments.map((c) => (
                      <View key={c.id} style={styles.commentBox}>
                        <Text style={styles.commentAuthor}>{c.author}</Text>
                        <Text style={styles.commentText}>{c.text}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noCommentText}>아직 작성된 댓글이 없어요. 첫 후기를 남겨보세요!</Text>
                  )}

                  {/* 댓글 작성 입력창 */}
                  <View style={styles.commentInputRow}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="댓글을 남겨보세요..."
                      placeholderTextColor="#9aa6a1"
                      value={newCommentText}
                      onChangeText={setNewCommentText}
                    />
                    <TouchableOpacity style={styles.commentSubmitBtn} onPress={handleAddComment}>
                      <Text style={styles.commentSubmitText}>등록</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ height: 30 }} />
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  createCard: { width: "100%", marginBottom: 20, padding: 12, backgroundColor: "#3a846b", borderRadius: 15, flexDirection: "row", alignItems: "center", shadowColor: "#31775f", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 18, elevation: 4 },
  createMark: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.45)", backgroundColor: "rgba(255,255,255,0.13)", justifyContent: "center", alignItems: "center" },
  plusMarkInner: { width: 14, height: 2, backgroundColor: "#ffffff" },
  createTitle: { fontSize: 12, fontWeight: "bold", color: "#ffffff" },
  createSub: { fontSize: 8, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  createSymbol: { fontSize: 22, color: "#ffffff" },

  sectionHeader: { marginBottom: 12, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: "#233b35", letterSpacing: -0.6 },
  countBadge: { paddingHorizontal: 7, paddingVertical: 4, backgroundColor: "#e8f0ec", borderRadius: 99 },
  countBadgeText: { fontSize: 8, color: "#648078", fontWeight: "700" },

  sortRow: { marginBottom: 11 },
  sortTabs: { flexDirection: "row", backgroundColor: "#e9eeeb", borderRadius: 10, padding: 3, width: 130 },
  sortTabBtn: { flex: 1, paddingVertical: 7, borderRadius: 7, alignItems: "center" },
  sortTabActive: { backgroundColor: "#ffffff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 1 },
  sortTabText: { fontSize: 9, color: "#788983" },
  sortTabTextActive: { fontSize: 9, color: "#2f745b", fontWeight: "bold" },

  recipeList: {},
  recipeCard: { padding: 8, paddingRight: 24, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e0e8e4", borderRadius: 15, flexDirection: "row", alignItems: "center", marginBottom: 9 },
  recipeImg: { width: 96, height: 88, borderRadius: 11, backgroundColor: "#e6ece8", marginRight: 10 },
  recipeCopy: { flex: 1, minWidth: 0, justifyContent: "center" },
  tagRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  tagBadge: { paddingHorizontal: 5, paddingVertical: 3, backgroundColor: "#e8f4ef", borderRadius: 99, fontSize: 7, color: "#39765f", marginRight: 4 },
  userBadge: { paddingHorizontal: 5, paddingVertical: 3, backgroundColor: "#e0ede6", borderRadius: 99, fontSize: 7, color: "#2b5c49", fontWeight: "bold", marginRight: 4 },
  recipeTitle: { fontSize: 13, fontWeight: "bold", color: "#233b35", marginBottom: 2, letterSpacing: -0.4 },
  recipeDesc: { fontSize: 8, color: "#82908b", marginBottom: 6 },
  recipeMeta: { flexDirection: "row", alignItems: "center" },
  metaRightMargin: { fontSize: 9, fontWeight: "700", color: "#75857f", marginRight: 12 },
  likeText: { fontSize: 9, fontWeight: "700", color: "#888888" },
  likeTextActive: { color: "#d95850", fontWeight: "bold" },
  cardArrow: { position: "absolute", right: 10, fontSize: 20, color: "#81a196" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: "#ffffff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  modalTitle: { fontSize: 17, fontWeight: "bold", color: "#233b35" },
  modalCloseText: { fontSize: 20, color: "#888", padding: 4 },
  inputLabel: { fontSize: 11, fontWeight: "bold", color: "#3a564d", marginBottom: 5, marginTop: 10 },
  textInput: { backgroundColor: "#f4f7f5", borderWidth: 1, borderColor: "#d8e3de", borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 12, color: "#233b35", marginBottom: 5 },
  rowInputs: { flexDirection: "row" },
  submitBtn: { backgroundColor: "#3a846b", borderRadius: 12, height: 48, justifyContent: "center", alignItems: "center", marginTop: 20, marginBottom: 30 },
  submitBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },

  detailImg: { width: "100%", height: 180, borderRadius: 12, marginBottom: 12, backgroundColor: "#eee" },
  detailDesc: { fontSize: 12, color: "#667a72", marginBottom: 10 },
  detailMetaRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#edf3ef" },
  likeButtonBox: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#f4f7f5", borderRadius: 8, borderWidth: 1, borderColor: "#d8e3de" },
  likeButtonBoxActive: { backgroundColor: "#fce8e6", borderColor: "#f5c6c2" },
  
  // 수정/삭제 버튼 행 스타일
  authorActionsRow: { flexDirection: "row", marginBottom: 15, gap: 8 },
  editActionBtn: { flex: 1, backgroundColor: "#e9f2ee", paddingVertical: 8, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#c8dfd5", marginRight: 6 },
  editActionText: { fontSize: 11, fontWeight: "bold", color: "#306e57" },
  deleteActionBtn: { flex: 1, backgroundColor: "#fceeee", paddingVertical: 8, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#f5cdcd" },
  deleteActionText: { fontSize: 11, fontWeight: "bold", color: "#b84747" },

  detailSectionTitle: { fontSize: 14, fontWeight: "bold", color: "#233b35", marginTop: 15, marginBottom: 8 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  stepNumBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#dceee6", justifyContent: "center", alignItems: "center", marginTop: 1, marginRight: 8 },
  stepNumText: { fontSize: 10, fontWeight: "bold", color: "#32745d" },
  stepText: { flex: 1, fontSize: 12, color: "#334c44", lineHeight: 18 },
  commentBox: { backgroundColor: "#f7f9f7", padding: 10, borderRadius: 10, marginBottom: 6 },
  commentAuthor: { fontSize: 10, fontWeight: "bold", color: "#3a564d", marginBottom: 2 },
  commentText: { fontSize: 11, color: "#4f635c" },
  noCommentText: { fontSize: 11, color: "#9aa6a1", fontStyle: "italic" },

  commentInputRow: { flexDirection: "row", marginTop: 12 },
  commentInput: { flex: 1, backgroundColor: "#f4f7f5", borderWidth: 1, borderColor: "#d8e3de", borderRadius: 10, paddingHorizontal: 12, height: 40, fontSize: 11, color: "#233b35", marginRight: 8 },
  commentSubmitBtn: { backgroundColor: "#3a846b", borderRadius: 10, paddingHorizontal: 14, justifyContent: "center", alignItems: "center" },
  commentSubmitText: { color: "#ffffff", fontSize: 10, fontWeight: "bold" },
});