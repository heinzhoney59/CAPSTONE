import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AiChefScreen from "../screens/AiChefScreen";
import AllIngredientsScreen from "../screens/AllIngredientsScreen";
import AuthScreen from "../screens/AuthScreen";
import LaunchScreen from "../screens/LaunchScreen";
import MainFridgeScreen from "../screens/MainFridgeScreen";
import NutrientScreen from "../screens/NutrientScreen";
import RecipeScreen from "../screens/RecipeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { addIngredient, deleteIngredient, fetchIngredients, getErrorMessage } from "../services/api";
import { Ingredient, NewIngredientInput } from "../types";

const NAV_ITEMS = ["재료", "레시피", "성분", "AI 셰프", "설정"];

export default function HomeScreen() {
  // 앱 흐름 단계 상태 ("launch" -> "auth" -> "main")
  const [step, setStep] = useState<"launch" | "auth" | "main">("launch");

  // 하단 탭 및 서브 화면 상태
  const [activeNav, setActiveNav] = useState("재료");
  const [showAll, setShowAll] = useState(false);

  // 서버에서 받아온 냉장고 재료
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 성분 탭에서 고른 알레르기 (AI 셰프 추천에서도 제외)
  const [allergies, setAllergies] = useState<string[]>([]);
  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) => (prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]));
  };

  const loadIngredients = async () => {
    setLoading(true);
    try {
      setIngredients(await fetchIngredients());
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // 로그인에 성공하면 메인 화면으로 가면서 서버에서 재료를 불러온다
  const handleLoginSuccess = () => {
    setStep("main");
    loadIngredients();
  };

  // 재료 추가: 실패하면 에러를 그대로 던져서 추가 화면(모달)에 메시지를 보여준다
  const handleAddIngredient = async (input: NewIngredientInput) => {
    await addIngredient(input);
    await loadIngredients();
  };

  const handleDeleteIngredient = async (id: number) => {
    try {
      await deleteIngredient(id);
      setIngredients((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      Alert.alert("삭제하지 못했어요", getErrorMessage(error));
      loadIngredients();
    }
  };

  // 앱 데이터 초기화 (설정 > 데이터 관리): 서버에 있는 냉장고 재료를 모두 삭제
  const handleResetData = async () => {
    try {
      await Promise.all(ingredients.map((item) => deleteIngredient(item.id)));
    } finally {
      await loadIngredients();
      setShowAll(false);
      setActiveNav("재료");
    }
  };

  const handleLogout = () => {
    setIngredients([]);
    setLoadError(null);
    setShowAll(false);
    setActiveNav("재료");
    setStep("auth");
  };

  // 1단계: 시작 화면 상태인 경우
  if (step === "launch") {
    return (
      <SafeAreaView style={styles.container}>
        <LaunchScreen onStart={() => setStep("auth")} />
      </SafeAreaView>
    );
  }

  // 2단계: 로그인/회원가입 화면 상태인 경우
  if (step === "auth") {
    return (
      <SafeAreaView style={styles.container}>
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      </SafeAreaView>
    );
  }

  // 3단계: 로그인 성공 후 메인 앱 화면들
  return (
    <SafeAreaView style={styles.container}>
      {showAll ? (
        <AllIngredientsScreen
          ingredients={ingredients}
          onBack={() => setShowAll(false)}
          onDelete={handleDeleteIngredient}
        />
      ) : activeNav === "AI 셰프" ? (
        <AiChefScreen ingredients={ingredients} allergies={allergies} onBack={() => setActiveNav("재료")} />
      ) : activeNav === "레시피" ? (
        <RecipeScreen ingredients={ingredients} onBack={() => setActiveNav("재료")} />
      ) : activeNav === "성분" ? (
        <NutrientScreen
          ingredients={ingredients}
          selectedAllergies={allergies}
          onToggleAllergy={toggleAllergy}
          onBack={() => setActiveNav("재료")}
        />
      ) : activeNav === "설정" ? (
        <SettingsScreen
          ingredients={ingredients}
          recipes={[]}
          onBack={() => setActiveNav("재료")}
          onResetData={handleResetData}
          onLogout={handleLogout}
        />
      ) : activeNav === "장보기" ? (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderTitle}>🛒 장보기 목록</Text>
          <Text style={styles.placeholderSub}>부족한 식재료를 장보기 목록에 추가해 보세요!</Text>
        </View>
      ) : (
        <MainFridgeScreen
          ingredients={ingredients}
          loading={loading}
          error={loadError}
          onShowAll={() => setShowAll(true)}
          onDelete={handleDeleteIngredient}
          onRefresh={loadIngredients}
          onAdd={handleAddIngredient}
        />
      )}

      {/* 하단 네비게이션 바 */}
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((name) => (
          <TouchableOpacity
            key={name}
            style={styles.navItem}
            onPress={() => {
              setActiveNav(name);
              setShowAll(false);
            }}
          >
            <Text style={[styles.navText, activeNav === name && !showAll && styles.navTextActive]}>
              {name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  bottomNav: { flexDirection: "row", height: 60, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee", justifyContent: "space-around", alignItems: "center" },
  navItem: { padding: 10 },
  navText: { fontSize: 13, color: "#888" },
  navTextActive: { color: "#2B4C3F", fontWeight: "bold" },
  placeholderContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  placeholderTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 8 },
  placeholderSub: { fontSize: 14, color: "#666", textAlign: "center" },
});
