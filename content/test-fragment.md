# JMeter Test Fragment 활용

JMeter에서 Test Fragment는 한마디로 **"필요할 때 언제든 꺼내 쓸 수 있도록 잘 보관해둔 시나리오 조각"**입니다.

일반적인 Thread Group과 달리 자체적으로는 실행되지 않는다는 점이 가장 큰 특징입니다. t3.medium처럼 제한된 자원에서 복잡한 시나리오를 관리할 때 매우 유용합니다.

## 1. Test Fragment의 핵심 역할

### ① 시나리오의 재사용 (Reusability)

쇼핑몰 테스트를 하다 보면 '로그인'이나 '로그아웃' 동작은 장바구니 테스트, 마이페이지 테스트, 주문 테스트 등 모든 곳에서 공통적으로 쓰입니다.

- **역할**: 공통 로직을 Test Fragment에 한 번만 만들어두고, 여러 Thread Group에서 불러와 사용합니다.
- **이점**: 로그인 로직(URL이나 파라미터)이 변경되었을 때, Test Fragment 한 곳만 수정하면 이를 참조하는 모든 테스트에 자동 반영됩니다.

### ② 스크립트의 모듈화 (Modularity)

하나의 Thread Group 안에 수십 개의 HTTP Request가 쌓여 있으면 가독성이 떨어지고 관리가 힘듭니다.

- **역할**: '로그인 조각', '상품조회 조각', '결제 조각'으로 기능을 잘게 쪼개어 관리합니다.
- **이점**: 마치 레고 블록을 조립하듯, 필요한 기능 조각들을 조합해 새로운 테스트 시나리오를 뚝딱 만들 수 있습니다.

## 2. 어떻게 활용하나요? (짝꿍 요소들)

Test Fragment는 혼자서는 아무 일도 하지 않습니다. 아래 두 가지 요소와 결합했을 때 진가를 발휘합니다.

**Module Controller**: 
- **동일한 .jmx 파일 내에 있는 Test Fragment를 가리킬 때 사용합니다**.
- 실행하고 싶은 Thread Group 안에 Module Controller를 넣고, 미리 만든 Test Fragment를 선택하면 해당 로직이 그 자리에서 실행됩니다.

**Include Controller**:
- **다른 파일(.jmx)**에 저장된 Test Fragment를 불러올 때 사용합니다.
- 팀 단위 협업 시 "로그인 스크립트는 A님이 관리하고, 나는 그걸 내 테스트 파일에 포함(Include)만 시켜서 쓴다"는 식의 분업이 가능해집니다.

## 3. 실무 실습 예시 (t3.medium 환경)

t3.medium 서버에서 부하 테스트를 할 때 다음과 같이 구성해 보세요.

```
Test Plan
├── Test Fragment: [공통_로그인]
│   └── HTTP Request (Login API)
├── Thread Group A: 장바구니 부하 테스트
│   ├── Module Controller (선택: [공통_로그인])
│   └── HTTP Request (장바구니 담기)
└── Thread Group B: 마이페이지 조회 테스트
    ├── Module Controller (선택: [공통_로그인])
    └── HTTP Request (내 정보 조회)
```

## 💡 유용한 이유 요약

- **가독성**: 전체 트리가 깔끔해집니다.
- **유지보수**: 한 곳만 고치면 다 고쳐집니다.
- **비활성 상태**: Test Fragment는 트리 상단에 있어도 실행 버튼을 눌렀을 때 무시되므로, 실제 부하를 주는 Thread Group에만 집중할 수 있습니다.