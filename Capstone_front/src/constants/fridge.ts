import { Compartment, IngredientUnit } from "../types";

/** 서버 칸(enum) → 화면 이름. 화면에 표시되는 순서이기도 하다. */
export const COMPARTMENT_LABELS: Record<Compartment, string> = {
  VEGETABLE: "채소칸",
  FRESH_MEAT: "신선육",
  DAIRY_AND_BEVERAGE: "유제품 및 음료",
  FRUIT: "과일칸",
  ETC: "기타",
};

export const COMPARTMENTS = Object.keys(COMPARTMENT_LABELS) as Compartment[];

/** 화면에 보여줄 칸 이름 목록 (냉장고 선반 순서) */
export const CATEGORY_LABELS = COMPARTMENTS.map((c) => COMPARTMENT_LABELS[c]);

/** 서버 단위(enum) → 화면 표시 */
export const UNIT_LABELS: Record<IngredientUnit, string> = {
  PIECE: "개",
  GRAM: "g",
  MILLILITER: "ml",
};

export const UNITS = Object.keys(UNIT_LABELS) as IngredientUnit[];

/**
 * 지금 서버에 등록돼 있는 재료 이름 (백엔드 src/main/resources/data/ingredients.yaml).
 * 서버는 이 목록(재료 마스터)에 있는 이름만 냉장고에 넣을 수 있다.
 * 백엔드에서 재료를 추가하면 여기에도 추가해 주면 추가 화면에서 바로 고를 수 있다.
 * (defaultDays는 ingredients.yaml의 default-shelf-life-days와 같은 값)
 */
export const KNOWN_INGREDIENTS: {
  name: string;
  unit: IngredientUnit;
  defaultQuantity: number;
  defaultDays: number;
}[] = [
  { name: "당근", unit: "PIECE", defaultQuantity: 1, defaultDays: 14 },
  { name: "돼지고기", unit: "GRAM", defaultQuantity: 300, defaultDays: 3 },
  { name: "우유", unit: "MILLILITER", defaultQuantity: 1000, defaultDays: 7 },
  { name: "사과", unit: "PIECE", defaultQuantity: 1, defaultDays: 14 },
];

/** 재료 이름에 들어 있는 단어로 이모지를 고른다 (위에서부터 먼저 맞는 것) */
const NAME_EMOJIS: [string, string][] = [
  ["당근", "🥕"],
  ["양배추", "🥬"],
  ["배추", "🥬"],
  ["상추", "🥬"],
  ["시금치", "🥬"],
  ["브로콜리", "🥦"],
  ["토마토", "🍅"],
  ["양파", "🧅"],
  ["마늘", "🧄"],
  ["감자", "🥔"],
  ["고구마", "🍠"],
  ["오이", "🥒"],
  ["옥수수", "🌽"],
  ["버섯", "🍄"],
  ["고추", "🌶️"],
  ["파프리카", "🫑"],
  ["돼지", "🥩"],
  ["소고기", "🥩"],
  ["쇠고기", "🥩"],
  ["삼겹", "🥓"],
  ["베이컨", "🥓"],
  ["닭", "🍗"],
  ["생선", "🐟"],
  ["고등어", "🐟"],
  ["연어", "🐟"],
  ["새우", "🦐"],
  ["우유", "🥛"],
  ["치즈", "🧀"],
  ["버터", "🧈"],
  ["계란", "🥚"],
  ["달걀", "🥚"],
  ["요거트", "🥛"],
  ["주스", "🧃"],
  ["사과", "🍎"],
  ["배", "🍐"],
  ["바나나", "🍌"],
  ["딸기", "🍓"],
  ["포도", "🍇"],
  ["귤", "🍊"],
  ["오렌지", "🍊"],
  ["레몬", "🍋"],
  ["키위", "🥝"],
  ["수박", "🍉"],
  ["밥", "🍚"],
  ["빵", "🍞"],
  ["면", "🍝"],
];

const COMPARTMENT_EMOJIS: Record<Compartment, string> = {
  VEGETABLE: "🥬",
  FRESH_MEAT: "🥩",
  DAIRY_AND_BEVERAGE: "🥛",
  FRUIT: "🍎",
  ETC: "🥫",
};

export function emojiFor(name: string, compartment: Compartment): string {
  const match = NAME_EMOJIS.find(([keyword]) => name.includes(keyword));
  return match ? match[1] : COMPARTMENT_EMOJIS[compartment];
}
