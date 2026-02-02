# JMeter Test Fragment 구조화 전략

JMeter에서 Test Fragment를 사용해 구획을 나누는 것은 복잡한 테스트 계획을 **구조화(Refactoring)**하고 모듈화하는 가장 프로페셔널한 방법입니다.

단순히 나열된 스크립트를 '조립식 레고' 형태로 바꾸는 과정이라고 이해하시면 됩니다. t3.medium 실습 환경에서 어떻게 구조화하면 좋을지 가이드를 드릴게요.

## 🏗️ Test Fragment를 이용한 구조화 전략

테스트 계획(Test Plan) 전체를 하나의 거대한 흐름으로 두지 않고, 비즈니스 로직별로 '조각(Fragment)'을 냅니다.

### 1. 기능별 구획 구분 (Fragments)

테스트 계획 최상단에 Test Fragment를 만들고, 그 안에 실제 동작들을 넣습니다.

- Fragment 1: [Auth] (로그인, 로그아웃)
- Fragment 2: [Shop] (메인 페이지, 카테고리 이동, 상품 상세)
- Fragment 3: [Cart] (장바구니 담기, 장바구니 조회, 삭제)

### 2. 실행부 조립 (Thread Groups)

실제 부하를 주는 Thread Group에서는 직접 HTTP Request를 넣는 대신, Module Controller를 사용해 위에서 만든 조각들을 호출합니다.

## 🛠️ 구조화 시 얻는 실질적인 이점

### ① 가독성 끝판왕 (Clean Script)

Thread Group 안에는 Module Controller 몇 개만 딱 들어있게 됩니다.

"아, 이 테스트는 [로그인] 하고 [장바구니] 담는 시나리오구나!"라는 것을 코드를 보지 않고도 이름만으로 바로 알 수 있습니다.

### ② 유지보수의 단일화 (Single Point of Change)

만약 개발팀에서 로그인 API의 주소나 파라미터를 바꿨다면?

- **구조화 전**: 로그인이 포함된 모든 Thread Group(10개라면 10번)을 찾아가서 수정해야 합니다.
- **구조화 후**: [Auth] Fragment에 있는 로그인 요청 하나만 수정하면 모든 시나리오에 즉시 반영됩니다.

### ③ 테스트 시나리오 무한 조합

- 시나리오 A: [로그인] → [상품선택] → [장바구니 담기]
- 시나리오 B: [로그인] → [장바구니 조회] → [로그아웃] 

새로운 시나리오를 만들 때, 기존에 잘 만들어둔 Fragment 조각들을 Module Controller로 끌어다 놓기만 하면 됩니다.

## 📝 실습 적용 예시

t3.medium 서버에서 **'장바구니 담기'**를 구조화한다면 트리는 다음과 같은 모양이 됩니다.

```
Test Plan
├── 📂 Test Fragment: [Common_Logic]
│   ├── ⚙️ 로그인 요청 (POST /login)
│   └── ⚙️ 로그아웃 요청 (GET /logout)
├── 📂 Test Fragment: [Business_Logic]
│   ├── ⚙️ 상품 상세 조회 (GET /product)
│   └── ⚙️ 장바구니 담기 (POST /cart)
└── 👥 Thread Group: [장바구니_부하테스트] (t3.medium용 100명 설정)
    ├── 🧩 Module Controller (선택: [Common_Logic] > 로그인)
    ├── 🧩 Module Controller (선택: [Business_Logic] > 상품 상세)
    ├── 🧩 Module Controller (선택: [Business_Logic] > 장바구니 담기)
    └── 🧩 Module Controller (선택: [Common_Logic] > 로그아웃)
```

## 💡 주의할 점: 변수 공유(Scope)

Test Fragment는 별도의 파일이나 구획에 있지만, 같은 Test Plan 안에 있다면 변수(${IP}, ${ID} 등)와 쿠키를 공유합니다. 따라서 구조화를 해도 로그인 세션이 끊길 걱정은 하지 않으셔도 됩니다.