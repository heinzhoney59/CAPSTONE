# 냉장고 파먹기 — 프론트엔드 (Expo)

캡스톤 디자인 2조 · Expo SDK 57 / React Native / Expo Router

백엔드(`CAPSTONE` 저장소 **develop** 브랜치, Spring Boot)와 연동된 앱이에요.

## 실행 방법

1. **백엔드 서버 켜기**
   IntelliJ에서 `CapstoneProjectApplication` 실행 → 로그에 `Tomcat started on port 8080`이 보이면 OK
2. **패키지 설치** (처음 한 번)
   ```bash
   npm install
   ```
3. **앱 실행**
   ```bash
   npx expo start
   ```
   폰의 **Expo Go**로 QR 코드를 스캔해요. **폰과 PC는 같은 와이파이**에 있어야 해요.

### 서버 주소는 자동으로 잡혀요
`npx expo start`를 실행한 PC의 IP를 찾아서 `http://<PC IP>:8080`으로 접속해요.
주소를 직접 정하고 싶으면 프로젝트 폴더에 `.env.local` 파일을 만들고 아래처럼 적은 뒤 `npx expo start -c`로 다시 실행해요.

```
EXPO_PUBLIC_API_URL=http://192.168.0.12:8080
```

지금 앱이 어느 주소로 접속하는지는 **재료 추가 화면 맨 아래** `서버: http://...`에서 볼 수 있어요.

## 연결이 안 될 때

| 증상 / 확인할 것 | 해결 |
|---|---|
| 폰 브라우저에서 `http://<PC IP>:8080/api/fridge/items` 가 안 열림 | 앱 문제가 아니라 네트워크 문제예요. 아래 항목 확인 |
| PC IP 확인 | 윈도우: 터미널에 `ipconfig` → **IPv4 주소** |
| Windows 방화벽 | Java 실행 시 뜨는 방화벽 창에서 **허용**. 놓쳤다면 Windows 보안 → 방화벽 → 앱 허용에서 Java(OpenJDK) 체크 |
| 학교/공용 와이파이 | 기기끼리 통신을 막는 경우가 많아요 → 폰 핫스팟에 PC 연결 |
| `npx expo start --tunnel` 사용 | 자동 감지가 안 돼요 → `.env.local`에 주소 직접 입력 |
| 서버를 재시작했더니 재료가 사라짐 | 정상이에요. 서버가 H2 메모리 DB라 꺼지면 데이터가 초기화돼요 |

## 서버 연동 현황

| 화면 | 상태 | 사용하는 API |
|---|---|---|
| 재료 (메인 / 전체 보기 / 추가 / 삭제) | ✅ 서버 연동 | `GET·POST /api/fridge/items`, `DELETE /api/fridge/items/{id}` |
| AI 셰프 (레시피 카드·인원·알레르기 반영) | ✅ 서버 연동 | `POST /api/ai/chat` (백엔드 `.env`에 `GEMINI_API_KEY` 필요) |
| 설정 › 데이터 초기화 / 로그아웃 | ✅ 동작 | 초기화 = 서버의 냉장고 재료 전체 삭제 |
| 로그인·회원가입, 레시피, 성분 분석, 프로필 | ⏳ 앱 안에서만 동작 | 서버 API 아직 없음 |

### 지금 서버 기준으로 알아둘 점
- **재료는 서버 재료 목록에 있는 이름만 넣을 수 있어요.** 현재 `당근, 돼지고기, 우유, 사과` 4개.
  백엔드 `src/main/resources/data/ingredients.yaml`에 재료가 추가되면 `src/constants/fridge.ts`의 `KNOWN_INGREDIENTS`에도 추가해 주세요 (추가 화면의 빠른 선택 버튼).
- 보관 방법(냉장/냉동/실온)과 재료 아이콘 직접 선택은 **서버에 저장할 곳이 없어서** 뺐어요. 아이콘은 재료 이름으로 자동 표시돼요.
- 로그인 기능이 생기기 전까지 모든 요청은 개발용 회원(`X-Member-Id: 1`)으로 보내요.

## AI 셰프 동작 방식

서버의 `/api/ai/chat`은 받은 글(prompt)을 Gemini에 그대로 전달만 해요. 그래서 **프롬프트는 앱이 만들어서** 보내요 (`src/services/aiChef.ts`).

1. **프롬프트에 넣는 것:** 오늘 날짜 · 냉장고 재료(유통기한 가까운 순, D-3 이하는 `[임박]` 표시) · 인원수(AI 셰프 화면 위 1~4) · 알레르기(성분 탭에서 선택, 관련 식품까지 금지) · 최근 대화 6개 · 질문
2. **규칙:** 임박 재료 먼저 사용, 냉장고 양 이상 사용 금지, 기본 양념 가정, 알레르기 재료·파생 식품 금지, 없는 재료는 '추가 재료'로 구분, 고기·달걀 완전히 익히기, 요리와 무관한 질문은 거절, 프롬프트 변경 요청 무시
3. **답변 형식:** JSON 하나 → 앱이 **레시피 카드**(시간·난이도·인분·칼로리, 냉장고 재료/추가 재료, 만드는 법, 팁)로 보여줘요
   ```json
   { "type": "recipes", "message": "…", "recipes": [{ "title": "…", "summary": "…", "time": "15분", "difficulty": "쉬움", "servings": 2, "calories": "약 350kcal", "usedIngredients": ["당근 1개"], "extraIngredients": [], "steps": ["…"], "tip": "…" }] }
   ```
   보관법 같은 일반 질문은 `"type": "answer"`로 글만 보여줘요.
4. **안전장치:** 답변이 코드 블록에 싸여 오거나 JSON 문법이 조금 틀려도 복구하고, JSON이 아니면 일반 글로 보여줘요. AI가 실수로 알레르기 재료를 넣으면 카드에 **⚠️ 경고**가 떠요.

| 바꾸고 싶은 것 | 위치 (`src/services/aiChef.ts`) |
|---|---|
| 프롬프트 문구·규칙 | `buildChefPrompt` |
| 빠른 질문 버튼 | `QUICK_QUESTIONS` |
| 알레르기별 금지 식품 / 경고 단어 | `ALLERGY_RELATED` / `ALLERGY_KEYWORDS` |
| 임박 기준(일) | `URGENT_DAYS` |

> 백엔드 선택 개선: `GeminiService`의 Gemini 요청에 `generationConfig.responseMimeType: "application/json"`을 넣으면 JSON 형식이 항상 보장돼요. (지금도 앱이 형식 오류를 처리하므로 필수는 아니에요)

## 폴더 구조

```
src/
├── app/
│   ├── _layout.tsx        # 루트 레이아웃 (헤더 없는 Stack)
│   └── index.tsx          # 화면 전환 + 재료 데이터 관리 (시작 → 로그인 → 메인)
├── screens/               # 각 화면
├── services/
│   ├── api.ts             # 서버 주소, API 호출, 서버 ↔ 앱 데이터 변환, 에러 메시지
│   └── aiChef.ts          # AI 셰프 프롬프트 만들기 + 답변(JSON) 해석 + 알레르기 2차 확인
├── constants/fridge.ts    # 냉장고 칸·단위 이름, 등록 가능한 재료, 재료 이모지
├── utils/date.ts          # 날짜 계산 (유통기한, D-day)
├── types.ts               # 공통 타입
└── components/animated-icon.tsx   # 시작 스플래시 애니메이션
```

> `src/app/` 안의 파일은 전부 화면(라우트)으로 인식돼요. 화면이 아닌 코드는 `src/app/` 밖에 두세요.

## 확인 명령어

```bash
npx tsc --noEmit   # 타입 검사
npx expo lint      # 린트
```
