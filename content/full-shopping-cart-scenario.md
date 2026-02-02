# 쇼핑몰 장바구니 풀 시나리오

t3.medium 서버 환경에서 Scouter 모니터링을 병행하며 수행할 수 있는 '쇼핑몰 장바구니 풀 시나리오' 설계도입니다. JMeter의 블록 조립 방식에 맞춰 순서대로 설명해 드릴게요.

## 🏗️ JMeter Test Plan 전체 구조 (Tree)

- **Test Plan** (최상위: 전역 변수 설정 IP, PORT 등)
  - HTTP Cookie Manager (로그인 세션 유지 필수 부품)
  - HTTP Request Defaults (서버 공통 IP/Port 입력)
  - Thread Group (t3.medium 권장: 100 Threads / 50s Ramp-up)
  - Constant Timer (각 단계 사이 500ms~1000ms 대기)
  - **Step 1**: 메인 페이지 조회 (HTTP Request)
  - **Step 2**: 로그인 수행 (HTTP Request, POST 방식)
  - **Step 3**: 카테고리 선택 (HTTP Request, GET 방식)
  - **Step 4**: 상품 상세 선택 (HTTP Request, GET 방식)
  - **Step 5**: 장바구니 담기 (HTTP Request, POST 방식)
  - **Step 6**: 로그아웃 수행 (HTTP Request)
  - View Results Tree / Summary Report (결과 확인용 리스너)

## ⚙️ 각 단계별 상세 설정 방법

### 1. 전역 설정 (Config Elements)

- **HTTP Cookie Manager**: 별도 설정 없이 추가만 해두세요. 로그인을 통해 얻은 세션 ID를 '장바구니 담기'까지 자동으로 끌고 갑니다.

- **HTTP Request Defaults**:
  - Server Name or IP: EC2 퍼블릭 IP
  - Port Number: 8080

### 2. 시나리오 단계 (Samplers)

#### Step 1: 메인 페이지
- Path: / (또는 /index)

#### Step 2: 로그인 (중요)
- Method: POST / Path: /login
- Parameters: username, password (실제 DB에 로딩된 데이터 입력)

#### Step 3: 카테고리 선택
- Method: GET / Path: /category
- Parameters: id=electronics (예시)

#### Step 4: 상품 선택
- Method: GET / Path: /product/detail
- Parameters: item_id=1001

#### Step 5: 장바구니 담기 (핵심 병목 구간)
- Method: POST / Path: /cart/add
- Parameters: item_id=1001, quantity=1
- Tip: 여기에 Response Assertion을 추가해 '성공' 메시지가 오는지 확인하세요.

#### Step 6: 로그아웃
- Method: GET (또는 POST) / Path: /logout

## 📊 Scouter로 관찰해야 할 시나리오별 포인트

JMeter가 100명의 가상 사용자로 이 시나리오를 반복해서 돌릴 때, Scouter에서 다음을 확인하세요.

- **로그인 구간**: 
  - 사용자가 몰릴 때 비밀번호 암호화 연산으로 인해 CPU 점유율이 급증하는지 확인합니다.

- **카테고리/상품 선택**: 
  - SELECT 쿼리가 많이 발생합니다. Scouter의 XLog에서 점이 높게 찍힌다면 DB 인덱스가 없는 쿼리를 찾아서 튜닝 포인트로 삼습니다.

- **장바구니 담기**: 
  - 실제 INSERT가 발생하는 구간입니다. DB Lock이 발생하는지, 혹은 커넥션 풀이 모자라서 대기(Active Service 증가)가 발생하는지 실시간으로 모니터링합니다.

- **로그아웃**: 
  - 세션이 정상적으로 만료되는지, 메모리(Heap)가 계단식으로 계속 쌓이기만 하고 내려오지 않는지(메모리 누수 여부) 확인합니다.

## 💡 실습 시 주의사항

- **DB 초기화**: '장바구니 담기'를 무한 반복하면 DB 데이터가 계속 쌓입니다. 테스트가 끝나면 TRUNCATE TABLE cart; 등으로 데이터를 비워주어야 다음 테스트 결과가 정확합니다.
- **Redirect 설정**: 로그인 후 메인으로 자동 이동한다면 Follow Redirects 옵션을 체크해 두는 것이 좋습니다.