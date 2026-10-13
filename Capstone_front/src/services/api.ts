import Constants from "expo-constants";
import { Platform } from "react-native";
import { COMPARTMENT_LABELS, KNOWN_INGREDIENTS, UNIT_LABELS, emojiFor } from "../constants/fridge";
import { Compartment, Freshness, Ingredient, IngredientUnit, NewIngredientInput } from "../types";
import { daysUntil } from "../utils/date";

// ─────────────────────────────────────────────
// 서버 주소
// ─────────────────────────────────────────────
// 1) .env.local 의 EXPO_PUBLIC_API_URL 이 있으면 그 주소를 쓴다.
//    예) EXPO_PUBLIC_API_URL=http://192.168.0.12:8080
// 2) 없으면 Expo 개발 서버(npx expo start)를 띄운 PC의 IP를 자동으로 찾아서
//    http://<PC IP>:8080 으로 접속한다. (Expo Go로 폰에서 테스트할 때 그대로 동작)
// ※ 폰과 PC가 같은 와이파이에 있어야 하고, `npx expo start --tunnel` 로 띄우면
//    자동 감지가 안 되므로 그때는 1)번처럼 주소를 직접 적어야 한다.

const SERVER_PORT = 8080;

/** 로그인 기능이 생기기 전까지 사용하는 개발용 회원 ID (서버가 시작할 때 1번 회원을 만든다) */
const DEV_MEMBER_ID = "1";

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  if (Platform.OS === "web" && typeof window !== "undefined" && window.location?.hostname) {
    return `http://${window.location.hostname}:${SERVER_PORT}`;
  }

  // 개발 중에는 "192.168.0.12:8081" 같은 값 (Metro 개발 서버 주소)
  const hostUri = Constants.expoConfig?.hostUri ?? "";
  const host = hostUri.match(/^([^/:]+)/)?.[1];
  const isTunnel = !!host && (host.endsWith(".exp.direct") || host.includes("ngrok"));

  if (host && !isTunnel) {
    const isLoopback = host === "localhost" || host === "127.0.0.1";
    // 안드로이드 에뮬레이터에서는 PC가 10.0.2.2 로 보인다
    if (isLoopback && Platform.OS === "android") return `http://10.0.2.2:${SERVER_PORT}`;
    return `http://${host}:${SERVER_PORT}`;
  }

  return Platform.OS === "android" ? `http://10.0.2.2:${SERVER_PORT}` : `http://localhost:${SERVER_PORT}`;
}

export const API_BASE_URL = resolveApiBaseUrl();

// ─────────────────────────────────────────────
// 공통 요청 함수
// ─────────────────────────────────────────────

export class ApiError extends Error {
  /** HTTP 상태 코드 (서버에 연결조차 못 했으면 0) */
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** 화면에 보여줄 에러 문구 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "알 수 없는 오류가 발생했어요.";
}

const CONNECTION_HELP =
  `서버(${API_BASE_URL})에 연결할 수 없어요. 서버가 켜져 있는지, 폰과 PC가 같은 와이파이인지 확인해 주세요.`;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  timeoutMs?: number;
};

/** 서버가 보낸 에러 본문에서 메시지를 꺼낸다 (Spring 기본 설정이면 message가 비어 있을 수 있음) */
async function readServerMessage(res: Response): Promise<string | null> {
  try {
    const text = await res.text();
    if (!text) return null;
    const data = JSON.parse(text);
    const message = data?.detail || data?.message;
    return typeof message === "string" && message.trim() ? message.trim() : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, timeoutMs = 10000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "X-Member-Id": DEV_MEMBER_ID,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    console.log(`[API] ${method} ${path} 연결 실패:`, error);
    if (controller.signal.aborted) {
      throw new ApiError(0, `서버 응답이 ${Math.round(timeoutMs / 1000)}초 넘게 없어요. ${CONNECTION_HELP}`);
    }
    throw new ApiError(0, CONNECTION_HELP);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const serverMessage = await readServerMessage(res);
    console.log(`[API] ${method} ${path} 실패: ${res.status}`, serverMessage ?? "");
    throw new ApiError(res.status, serverMessage ?? `요청에 실패했어요. (HTTP ${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ─────────────────────────────────────────────
// 냉장고 재료  (/api/fridge/items)
// ─────────────────────────────────────────────

/** 서버 응답 형태 (백엔드 FridgeItemResponse) */
type FridgeItemResponse = {
  id: number;
  ingredientName: string;
  iconUrl: string | null;
  compartment: Compartment;
  quantity: number | string;
  unit: IngredientUnit;
  expiryDate: string | number[];
  registeredAt: string | number[];
  status: "STORED" | "CONSUMED" | "DISCARDED";
  dDay?: number;
  expiryStatus?: "FRESH" | "WARNING" | "URGENT" | "EXPIRED";
  state?: string;
  expiryProgressRate?: number;
};

/** LocalDate가 "2026-10-20" 또는 [2026, 10, 20] 으로 올 수 있어 둘 다 처리 */
function normalizeDate(value: string | number[]): string {
  if (Array.isArray(value)) {
    const [y, m, d] = value;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  return value;
}

function formatQuantity(quantity: number): string {
  return Number.isInteger(quantity) ? String(quantity) : String(Math.round(quantity * 1000) / 1000);
}

export function formatAmount(quantity: number, unit: IngredientUnit): string {
  return `${formatQuantity(quantity)}${UNIT_LABELS[unit] ?? ""}`;
}

function toFreshness(expiryStatus: FridgeItemResponse["expiryStatus"], days: number): Freshness {
  switch (expiryStatus) {
    case "FRESH":
      return "fresh";
    case "WARNING":
      return "soon";
    case "URGENT":
    case "EXPIRED":
      return "urgent";
    default:
      // 서버와 같은 기준: 1일 이하 긴급, 3일 이하 임박
      return days <= 1 ? "urgent" : days <= 3 ? "soon" : "fresh";
  }
}

function toIngredient(raw: FridgeItemResponse): Ingredient {
  const compartment: Compartment = raw.compartment in COMPARTMENT_LABELS ? raw.compartment : "ETC";
  const unit: IngredientUnit = raw.unit in UNIT_LABELS ? raw.unit : "PIECE";
  const quantity = Number(raw.quantity);
  const expiryDate = normalizeDate(raw.expiryDate);
  const days = typeof raw.dDay === "number" ? raw.dDay : daysUntil(expiryDate);

  return {
    id: raw.id,
    name: raw.ingredientName,
    category: COMPARTMENT_LABELS[compartment],
    compartment,
    quantity,
    unit,
    amount: formatAmount(quantity, unit),
    expiryDate,
    days,
    freshness: toFreshness(raw.expiryStatus, days),
    emoji: emojiFor(raw.ingredientName, compartment),
  };
}

/** 냉장고 재료 목록 (유통기한 빠른 순) */
export async function fetchIngredients(): Promise<Ingredient[]> {
  const items = await request<FridgeItemResponse[]>("/api/fridge/items?sort=expiryDate&direction=asc");
  return (items ?? []).map(toIngredient);
}

/** 재료 추가 — 서버 재료 목록(재료 마스터)에 있는 이름만 가능 */
export async function addIngredient(input: NewIngredientInput): Promise<Ingredient> {
  try {
    const created = await request<FridgeItemResponse>("/api/fridge/items", {
      method: "POST",
      body: {
        ingredientName: input.name,
        compartment: input.compartment,
        quantity: input.quantity,
        unit: input.unit,
        expiryDate: input.expiryDate,
      },
    });
    return toIngredient(created);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      const available = KNOWN_INGREDIENTS.map((i) => i.name).join(", ");
      throw new ApiError(
        404,
        `'${input.name}'은(는) 아직 서버 재료 목록에 없어서 넣을 수 없어요.\n지금 넣을 수 있는 재료: ${available}`
      );
    }
    if (error instanceof ApiError && error.status === 400) {
      throw new ApiError(400, "입력값을 확인해 주세요. (수량은 0보다 커야 하고, 유통기한 날짜가 필요해요)");
    }
    throw error;
  }
}

/** 재료 삭제 */
export async function deleteIngredient(id: number): Promise<void> {
  await request<void>(`/api/fridge/items/${id}`, { method: "DELETE" });
}

// ─────────────────────────────────────────────
// AI 셰프  (/api/ai/chat)
// ─────────────────────────────────────────────

type AiChatResponse = { model: string; answer: string };

export async function requestAiChat(prompt: string): Promise<string> {
  try {
    // 서버가 Gemini를 최대 30초까지 기다리므로 넉넉하게 잡는다
    const res = await request<AiChatResponse>("/api/ai/chat", {
      method: "POST",
      body: { prompt },
      timeoutMs: 45000,
    });
    return res.answer;
  } catch (error) {
    if (error instanceof ApiError && error.status === 503) {
      throw new ApiError(503, "서버에 Gemini API 키가 설정되지 않았어요. 백엔드 .env 파일의 GEMINI_API_KEY를 확인해 주세요.");
    }
    if (error instanceof ApiError && error.status === 502) {
      throw new ApiError(502, "AI 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
    throw error;
  }
}
