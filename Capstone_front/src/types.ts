// ─────────────────────────────────────────────
// 냉장고 재료 (백엔드 /api/fridge/items 기준)
// ─────────────────────────────────────────────

/** 서버의 냉장고 칸 (Compartment enum) */
export type Compartment = "VEGETABLE" | "FRESH_MEAT" | "DAIRY_AND_BEVERAGE" | "FRUIT" | "ETC";

/** 서버의 수량 단위 (IngredientUnit enum) */
export type IngredientUnit = "PIECE" | "GRAM" | "MILLILITER";

/** 화면에서 쓰는 신선도 3단계 (서버 expiryStatus를 변환한 값) */
export type Freshness = "fresh" | "soon" | "urgent";

/** 서버 응답(FridgeItemResponse)을 화면에서 쓰기 좋게 바꾼 재료 */
export type Ingredient = {
  id: number;
  name: string;
  /** 화면에 보여줄 칸 이름 (채소칸, 신선육, 유제품 및 음료, 과일칸, 기타) */
  category: string;
  compartment: Compartment;
  quantity: number;
  unit: IngredientUnit;
  /** 화면 표시용 수량 문자열 (예: "2개", "500g", "1000ml") */
  amount: string;
  /** 유통기한 (YYYY-MM-DD) */
  expiryDate: string;
  /** 유통기한까지 남은 일수 (서버 dDay, 0이면 오늘까지) */
  days: number;
  freshness: Freshness;
  /** 이름/칸으로 정한 아이콘 이모지 (서버에는 저장되지 않음) */
  emoji: string;
};

/** 재료 추가 폼에서 서버로 보내는 값 */
export type NewIngredientInput = {
  name: string;
  /** null이면 서버가 재료별 기본 칸을 사용 */
  compartment: Compartment | null;
  quantity: number;
  unit: IngredientUnit;
  /** 유통기한 (YYYY-MM-DD) */
  expiryDate: string;
};

// ─────────────────────────────────────────────
// AI 셰프 / 레시피 / 설정 (아직 서버 연동 전인 화면들)
// ─────────────────────────────────────────────

/** AI 셰프가 추천한 레시피 (AI 답변 JSON의 recipes 항목) */
export type AiRecipe = {
  title: string;
  summary: string;
  /** 조리 시간 (예: "15분") */
  time: string;
  /** 쉬움 / 보통 / 어려움 */
  difficulty: string;
  servings: number | null;
  /** 1인분 대략 칼로리 (예: "약 350kcal") */
  calories: string;
  /** 냉장고 재료 중 사용하는 것과 양 */
  usedIngredients: string[];
  /** 냉장고에 없어서 추가로 필요한 재료 */
  extraIngredients: string[];
  steps: string[];
  tip: string;
};

export type ChatMessage = {
  id: number;
  role: "ai" | "user";
  text: string;
  /** 에러 안내 메시지면 true (말풍선 색을 다르게 표시) */
  isError?: boolean;
  /** AI가 추천한 레시피 카드 */
  recipes?: AiRecipe[];
};

export type Recipe = {
  id: number;
  title: string;
  description: string;
  image: string;
  time: string;
  calories: string;
  likes: number;
  tags: string[];
  steps: string[];
  comments: Array<{ id: number; author: string; text: string }>;
  source?: "curated" | "user" | "ai";
};

export type SettingsPanel = "profile" | "link" | "password" | "delete" | "theme" | "data" | "info" | "logout";
export type AuthMode = "signup" | "login";

export type StoredAccount = {
  userId: string;
  passwordHash: string;
  name: string;
  email: string;
  height: string;
  weight: string;
  bodyType: string;
};
