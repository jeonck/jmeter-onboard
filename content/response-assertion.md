# JMeter Response Assertion 활용

Response Assertion은 서버로부터 받은 응답이 내가 의도한 결과가 맞는지 자동으로 검사하는 **'합격/불합격 판독기'**입니다.

---

## Test Plan 구조 예시

```
Test Plan
├── 🍪 HTTP Cookie Manager
├── 👥 Thread Group (100 Users)
│   ├── ⚙️ HTTP Request: 로그인 (POST /login)
│   │   └── ✅ Response Assertion ← 로그인 성공 검증
│   │       ├── Field to Test: Text Response
│   │       ├── Pattern Matching: Contains
│   │       └── Patterns: "환영합니다", "Logout"
│   ├── ⚙️ HTTP Request: 상품 조회 (GET /product)
│   │   └── ✅ Response Assertion ← 상태 코드 검증
│   │       ├── Field to Test: Response Code
│   │       └── Patterns: "200"
│   ├── ⚙️ HTTP Request: 장바구니 담기 (POST /cart)
│   │   └── ✅ Response Assertion ← 에러 메시지 없음 검증
│   │       ├── Pattern Matching: Contains
│   │       ├── Patterns: "Error", "Exception"
│   │       └── ☑️ Not (체크) ← 이 단어가 없어야 성공
│   └── ⚙️ HTTP Request: 결제 (POST /order)
│       └── ✅ Response Assertion
│           └── Patterns: "주문 완료"
└── 📊 View Results Tree ← Assertion 결과 확인
```

**Assertion 배치 위치:** 검증이 필요한 각 요청 아래에 개별 배치

---

단순히 서버가 응답을 줬다고 해서(HTTP 200) 테스트가 성공한 것은 아닙니다. 예를 들어, 로그인에 실패했는데도 서버는 "아이디가 틀립니다"라는 문구와 함께 200 OK 응답을 보낼 수 있기 때문입니다. 이때 Response Assertion이 실제 본문에 "환영합니다"라는 글자가 있는지 확인하여 성공 여부를 결정합니다.

## 1. 주요 설정 항목 및 기능

| 항목 (Field) | 상세 설명 |
|--------------|------------|
| Apply to | 검사 범위를 지정합니다. 보통 Main sample only를 사용합니다. |
| Field to Test | 무엇을 검사할지 선택합니다. (Text Response, Response Code, Response Message 등) |
| Pattern Matching Rules | 검사 방식입니다. Contains(포함), Matches(완전 일치), Substring(단순 문자열 포함) 등이 있습니다. |
| Patterns to Test | 서버 응답에 포함되어야 할(혹은 없어야 할) 실제 텍스트나 정규식을 입력합니다. |
| Not (체크박스) | 반대로 동작합니다. 즉, 특정 단어가 없어야 성공으로 처리하고 싶을 때 사용합니다. (예: "에러 발생" 문구가 없어야 함) |

## 2. 실전 활용 사례

### ① 로그인 성공 여부 검증

서버 응답 본문에 사용자 이름이나 "로그아웃" 버튼이 있는지 확인합니다.

- Field to Test: Text Response
- Pattern Matching Rules: Contains
- Patterns to Test: 님, 환영합니다!, Logout

### ② HTTP 상태 코드 검증

특정 요청이 반드시 201(Created)이나 302(Redirect)여야 하는 경우 사용합니다.

- Field to Test: Response Code
- Patterns to Test: 201

### ③ 에러 페이지 감지 (Negative Test)

"Internal Server Error"나 "Access Denied" 같은 문구가 뜨면 무조건 실패로 처리하고 싶을 때 사용합니다.

- Patterns to Test: Error, Exception, 실패
- Check: Not 체크박스 선택 (이 단어들이 없어야 초록색 Pass가 뜹니다.)

## 3. View Results Tree와의 연동

Assertion을 설정하면 View Results Tree에서 결과가 달라집니다.

- **Assertion 통과**: 요청 결과가 초록색으로 표시됩니다.
- **Assertion 실패**: 서버 응답 코드가 200 OK이더라도 결과가 빨간색으로 변하며, 하위 항목인 Assertion Results를 클릭하면 "어떤 단어를 찾지 못해서 실패했는지" 상세 이유가 출력됩니다.

## 4. t3.medium 실습 환경에서의 팁

- **자원 효율성**: Response Assertion은 정규 표현식 추출기(Extractor)보다 연산 부하가 적습니다. 하지만 모든 요청에 너무 많은 검증 규칙을 넣으면 JMeter를 실행하는 PC의 CPU 점유율이 올라가니 꼭 필요한 비즈니스 체크포인트에만 배치하세요.
- **Scouter와의 연계**: Assertion 실패(빨간불)가 떴을 때, Scouter에서 해당 요청의 응답 속도와 에러 로그를 확인하세요. "응답은 오는데 내용이 잘못된 경우(Assertion Fail)"는 주로 DB 데이터 부족이나 소스 코드의 로직 오류일 가능성이 높습니다.

## 💡 팁: 'Ignore Status' 활용

가끔은 404 에러가 나는 것이 정상인 테스트(예: 없는 페이지 접근 테스트)를 할 때가 있습니다. 이럴 때는 Assertion의 Ignore Status를 체크하면, HTTP 응답 코드가 404여도 에러로 처리하지 않고 내가 설정한 조건에 따라 성공/실패를 결정할 수 있습니다.