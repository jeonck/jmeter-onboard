# Test Plan Components

## Understanding Test Plan

JMeter에서 **Test Plan(테스트 계획)**은 모든 테스트의 최상위 컨테이너이자, "무엇을, 어떻게, 얼마나" 테스트할지를 정의한 설계도 전체를 의미합니다.

쉽게 비유하자면, Test Plan은 하나의 **'프로젝트 파일'**이고, 그 안에 들어가는 Thread Group, Sampler 등이 구체적인 **'작업 지침'**들입니다.

## 1. Key Features of Test Plan

- **최상위 레벨**: 모든 요소(Thread Group, Listener 등)는 반드시 Test Plan 아래에 위치해야 합니다.
- **파일 저장**: Test Plan을 저장하면 .jmx라는 확장자로 저장되며, 이 파일만 있으면 다른 PC에서도 동일한 테스트를 수행할 수 있습니다.
- **전역 설정**: 프로젝트 전체에 공통으로 적용될 변수나 설정을 여기서 관리합니다.

## 2. Key Items in Test Plan Settings Screen

Test Plan을 클릭했을 때 우측에 나오는 설정 창에서 눈여겨봐야 할 항목들입니다.

- **User Defined Variables (사용자 정의 변수)**:
  - 프로젝트 전체에서 쓸 변수를 미리 선언합니다.
  - 예: IP라는 변수에 13.125.xx.xx를 넣어두면, 하위 블록들에서 ${IP}라고 호출해서 쓸 수 있습니다. (서버 주소가 바뀔 때 여기서 한 번만 바꾸면 되니 매우 편리합니다.)

- **Run Thread Groups consecutively (스레드 그룹을 순차적으로 실행)**:
  - 체크 해제(기본값): 여러 개의 Thread Group이 있다면 동시에 실행됩니다.
  - 체크 시: 첫 번째 그룹이 완전히 끝난 뒤 두 번째 그룹이 시작됩니다. (예: 로그인 테스트 후 상품 주문 테스트를 할 때 사용)

- **Functional Test Mode**:
  - 체크하면 서버로부터 받은 모든 응답 데이터를 파일로 저장합니다.
  - 주의: 부하 테스트 시에는 디스크 I/O를 엄청나게 잡아먹어 성능에 영향을 주므로, 디버깅할 때만 잠깐 사용하고 실제 테스트 시에는 꺼두어야 합니다.

## 3. Test Plan Components (Tree Structure Example)

Test Plan 블록 아래에 주로 쌓는 '레고 블록'들의 순서는 보통 다음과 같습니다.

- **Test Plan (설계도)**
  - HTTP Cookie Manager (설정): 세션/쿠키 유지
  - User Defined Variables (변수): 서버 주소 등
  - Thread Group (사용자 그룹): 몇 명이 접속할 것인가?
  - HTTP Request (작업): 어떤 페이지를 볼 것인가?
  - Constant Timer (대기): 몇 초 쉬고 다음 클릭을 할 것인가?
  - Response Assertion (검증): 응답이 200 OK가 맞는가?
  - View Results Tree (결과): 성공/실패 확인

## 💡 Practice Tip: Naming Test Plans
실무에서는 Test Plan의 이름을 단순히 'Test Plan'으로 두지 않고, ShoppingMall_LoadTest_v1 처럼 명확하게 바꿉니다. 왼쪽 트리 최상단의 Test Plan을 클릭하고 이름을 수정한 뒤 Ctrl + S를 눌러 저장해 보세요.

---

## 5 Core Components of Test Plan

JMeter의 **Test Plan(테스트 계획)**은 일종의 '설계도 파일'이며, 그 안에 어떤 '부품(요소)'들을 어떤 순서로 조립하느냐가 테스트의 성패를 결정합니다.

Test Plan을 구성하는 5가지 핵심 요소를 가장 이해하기 쉬운 비유와 함께 정리해 드립니다.

### 🏗️ 5 Core Components of Test Plan

#### 1. Threads (Users): "Who"
테스트의 주체입니다.

- **Thread Group**: 가상 사용자들을 정의합니다. 몇 명이(Number of Threads), 얼마 동안(Ramp-up), 몇 번(Loop Count) 실행할지를 결정하는 가장 기본 블록입니다.

#### 2. Samplers: "What"
서버에 가하는 실제 액션입니다.

- **HTTP Request**: 웹 페이지를 호출하거나 API를 찌릅니다.
- **JDBC Request**: DB에 직접 쿼리를 날립니다.
- 그 외 FTP, SMTP 등 다양한 통신 규약을 지원합니다.

#### 3. Logic Controllers: "Under what conditions"
Sampler들이 실행되는 순서나 조건을 제어합니다. (블록코딩의 핵심)

- **If Controller**: 특정 조건이 맞을 때만 실행.
- **Loop Controller**: 특정 횟수만큼 반복 실행.
- **Transaction Controller**: 여러 개의 요청을 하나의 작업 단위(예: 결제 프로세스)로 묶어서 측정.

#### 4. Configuration Elements: "How"
Sampler들이 사용할 환경 값을 미리 세팅합니다.

- **HTTP Cookie Manager**: 로그인을 유지하기 위한 쿼리 관리.
- **CSV Data Set Config**: 로그인 아이디/패스워드 목록이 담긴 파일을 불러와서 여러 계정으로 테스트할 때 사용.
- **User Defined Variables**: IP 주소 같은 공통 변수 관리.

#### 5. Listeners: "How to get results"
테스트 결과를 수집하고 시각화합니다.

- **View Results Tree**: 모든 요청과 응답의 상세 내용(성공/실패) 확인.
- **Summary Report**: 평균 응답 시간, 처리량(TPS), 에러율 등을 표로 정리.
- **Aggregate Graph**: 통계 데이터를 그래프로 표시.

### 🛠️ Recommended Assembly Order in Practice (Scope)
JMeter는 위에서 아래로, 바깥에서 안쪽으로 영향을 미칩니다. 보통 다음과 같은 구조로 배치합니다.

- **Test Plan (최상위)**
  - Config Elements (전역 설정: 쿼리, 변수 등)
  - Thread Group (사용자 그룹)
  - Timers (요청 사이의 지연 시간)
  - Logic Controllers (실행 흐름 제어)
  - Samplers (실제 HTTP 요청)
  - Assertions (결과 검증: "응답 내용에 '성공'이라는 글자가 있는가?")
  - Listeners (결과 보고서: 트리, 리포트 등)

### 💡 Practice Tip: Always Include Assertions!
초보자가 가장 많이 하는 실수가 **'응답 코드 200'**만 보고 성공했다고 착각하는 것입니다. 서버가 에러 페이지를 띄우면서도 상태 코드는 200을 보낼 때가 있거든요. Response Assertion 블록을 추가해서, 실제 화면에 "상품 목록"이라는 텍스트가 포함되어 있는지 확인하는 절차를 넣는 것이 좋습니다.