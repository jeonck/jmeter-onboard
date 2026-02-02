# 장바구니 담기 시나리오

장바구니 담기 시나리오는 단순한 호출이 아니라 **'로그인 -> 상품 선택 -> 담기'**로 이어지는 흐름이 중요합니다. t3.medium 서버와 Scouter가 준비되었다고 가정하고, JMeter에서 **'블록'**을 쌓는 순서대로 가이드를 드릴게요.

## 🛒 장바구니 담기 Test Plan 구성 (시나리오)

이 시나리오는 Cookie Manager를 통해 로그인 세션을 유지하는 것이 핵심입니다.

### 1단계: 전역 설정 (모든 요청의 기본 베이스)

- **HTTP Cookie Manager**: 로그인을 하면 서버에서 주는 세션 ID를 기억했다가 다음 요청(장바구니 담기) 때 자동으로 보내줍니다. (설정 없이 빈 블록만 두어도 작동합니다.)
- **HTTP Request Defaults**: 서버 IP(EC2 Public IP)와 포트(8080)를 한 번만 적어두면 모든 HTTP Request에 자동 적용됩니다.

### 2단계: Thread Group 설정 (t3.medium 권장값)

- **Number of Threads**: 100
- **Ramp-up Period**: 50초 (2초당 1명씩 투입)
- **Loop Count**: Infinite
- **Constant Timer**: 500ms (실제 사람처럼 약간의 간격을 둡니다.)

### 3단계: 개별 요청 블록 쌓기 (Step-by-Step)

#### [HTTP Request] 로그인:

- Method: POST / Path: /login
- Parameters: username, password 입력

#### [HTTP Request] 상품 목록 조회:

- Method: GET / Path: /products
- Scouter 관찰 포인트: 상품 목록을 가져올 때 DB 쿼리 속도가 느려지지 않는지 확인합니다.

#### [HTTP Request] 장바구니 담기:

- Method: POST / Path: /cart/add
- Parameters: product_id=123, quantity=1

## 🔍 Scouter로 분석해야 할 성능 병목 지점

JMeter로 위 시나리오를 돌리는 동안, Scouter 화면에서 다음을 집중적으로 보세요.

- **XLog의 점 분포**:
  - 로그인은 빠른데 '장바구니 담기' 점들만 위로(응답시간 길게) 치솟는다면? → DB의 Insert 작업이나 트랜잭션 처리에 병목이 있는 것입니다.

- **SQL 탭 분석**:
  - XLog의 느린 점을 드래그하여 실제 쿼리를 확인합니다. 장바구니에 이미 상품이 있는지 체크하는 SELECT 쿼리에 인덱스가 없어서 느려지는 경우가 흔합니다.

- **Heap Memory**:
  - 사용자가 늘어남에 따라 메모리가 급격히 차오른다면, 로그인 세션 정보가 메모리를 너무 많이 잡아먹고 있지 않은지 체크해야 합니다.

## 💡 실습 꿀팁: 실패 확인을 위한 Assertion 추가

장바구니 담기 버튼을 눌렀는데 서버 에러(500 Error)가 나면 JMeter에서는 성공으로 표시될 수 있습니다.

- 장바구니 담기 요청 우클릭 -> Add -> Assertions -> Response Assertion 추가
- Patterns to Test에 성공적으로 담겼습니다 또는 Success 등 실제 응답에 포함될 메시지를 넣으세요. 그러면 서버 에러 시 JMeter 결과창에 빨간불이 들어와서 한눈에 파악하기 좋습니다.