# PriceAlarm — 서울시 생필품 가격 지도

서울시 25개 구의 생필품·농수축산물 평균가격을 인터랙티브 SVG 지도로 시각화하는 서비스입니다.  
구를 클릭하면 행정동 목록으로, 동을 클릭하면 전 품목 가격을 한눈에 확인할 수 있습니다.

---

## 주요 기능

- **서울시 구별 가격 지도** — 품목 선택 시 각 구의 평균가를 히트맵으로 표시
- **구 드릴다운** — 선택한 구 내 모든 행정동을 카드 그리드로 표시
- **동 상세 가격** — 해당 동(구 단위 기준)의 16개 품목 평균가 카드
- **KAMIS 농산물 데이터** — 전국 농수축산물 카테고리/상품 상세 페이지
- **가격 알림 구독** — 관심 품목 구독 관리 (localStorage)

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| Framework | Next.js 16.2.1 (App Router, Turbopack) |
| Runtime | React 19 · TypeScript 5 |
| Styling | Tailwind CSS v4 · shadcn/ui |
| 지도 | react-simple-maps v3 · d3-scale · d3-scale-chromatic |
| 차트 | recharts v3 |
| 데이터 | 서울 열린데이터 OpenAPI (OA-1170) · KAMIS 농산물유통정보 |

---

## 시작하기

### 1. 설치

```bash
git clone https://github.com/maxhong97/PriceAlarm.git
cd PriceAlarm
npm install --legacy-peer-deps
```

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 Seoul API 키를 설정합니다.

```env
# 개발용 목업 데이터 사용 (API 키 없이 바로 실행 가능)
SEOUL_API_KEY=mock

# 실제 데이터 사용 시 → data.seoul.go.kr 에서 발급
# SEOUL_API_KEY=발급받은키
```

> **참고:** `SEOUL_API_KEY=mock` 설정 시 구별 ±8% 변동을 반영한 목업 데이터를 사용합니다.  
> 실제 서울 OpenAPI는 **한국 IP 환경**에서만 접근 가능합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                       # 메인: 서울 구별 가격 지도
│   ├── district/[gu]/page.tsx         # 구 상세: 행정동 그리드 + 품목 가격
│   ├── district/[gu]/[dong]/page.tsx  # 동 상세: 전 품목 가격 카드
│   ├── api/
│   │   ├── seoul-prices/route.ts      # 서울 OpenAPI 프록시
│   │   ├── agri/route.ts              # KAMIS 농산물 API
│   │   └── agri/trend/route.ts        # KAMIS 가격 트렌드
│   ├── category/[slug]/page.tsx       # 카테고리별 농산물 목록
│   ├── product/[name]/page.tsx        # 상품 상세
│   ├── search/page.tsx                # 검색
│   └── alerts/page.tsx                # 알림 구독 관리
├── components/
│   ├── SeoulMap.tsx                   # SVG 인터랙티브 지도 (Client)
│   ├── DongGrid.tsx                   # 행정동 카드 그리드 (Client)
│   ├── PriceTable.tsx                 # 품목 가격 카드 테이블
│   ├── PriceChart.tsx                 # 가격 추이 차트
│   └── Nav.tsx                        # 하단/상단 네비게이션
└── lib/
    ├── seoul-api.ts                   # 서울 OpenAPI 클라이언트 + 집계 헬퍼
    ├── seoul-geo.ts                   # 25개 구 + 424개 행정동 정적 데이터
    ├── seoul-mock.ts                  # 개발용 목업 데이터 생성기
    ├── api-server.ts                  # KAMIS 서버 사이드 함수
    └── kamisCodes.ts                  # KAMIS 카테고리/단위 코드 매핑
```

---

## 데이터 소스

### 서울시 생필품 가격 (OA-1170)
- **출처:** [서울 열린데이터 광장](https://data.seoul.go.kr/dataList/OA-1170/A/1/datasetView.do)
- **API:** `ListNecessariesPricesService`
- **갱신:** 매주 화요일
- **품목:** 배추, 무, 양파, 오이, 상추, 애호박, 호박, 사과, 배, 달걀, 닭고기, 삼겹살, 쇠고기, 고등어, 갈치, 오징어 (16개)
- **범위:** 서울시 25개 자치구 전통시장 기준

### 농산물 시세 (KAMIS)
- **출처:** [농산물유통정보](https://www.kamis.or.kr)
- **API:** `dailySalesList`, `recentPriceTrendList`
- **범위:** 전국 평균 소매/도매가

### 지도 경계 데이터
- **출처:** [southkorea/seoul-maps](https://github.com/southkorea/seoul-maps) (CC0)
- **형식:** GeoJSON (통계청 2013년 행정구역)

---

## 배포 시 주의사항

서울 OpenAPI(`openapi.seoul.go.kr:8088`)는 **한국 IP에서만 접근 가능**합니다.  
Vercel(미국 서버) 등 해외 클라우드 배포 시 API 호출이 차단될 수 있습니다.

**권장 해결 방법:**
1. Vercel Edge Config 또는 KV에 주기적으로 데이터를 캐싱하는 별도 스크립트 운용
2. 한국 리전 클라우드(NCP, KT Cloud 등) 사용
3. GitHub Actions + 한국 IP 환경에서 주기적으로 데이터를 JSON 파일로 커밋

---

## 개발 현황 (2026-04-09)

- [x] 서울시 구별 SVG 지도 (히트맵)
- [x] 구 → 동 드릴다운
- [x] 서울 OpenAPI + 목업 폴백
- [x] 유가 관련 기능 제거
- [ ] 실제 Seoul API 키 연동 및 검증
- [ ] Vercel 배포 + 데이터 캐싱 전략
- [ ] 가격 변동 트렌드 (전주 대비)
- [ ] 모바일 터치 최적화

---

## License

MIT
