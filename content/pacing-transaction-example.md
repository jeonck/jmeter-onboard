# JMeter Pacing Controller - Transaction Structure 예시

JMeter에서 Pacing Controller를 사용할 때, 전체 사용자 흐름을 하나의 트랜잭션으로 묶어 관리하면 더 정밀한 부하 제어가 가능합니다. 이 구조에서는 **Pacing Start**와 **Pacing Pause**를 사용하여 사용자 흐름을 하나의 단위로 감싸는 방식을 사용합니다.

## ⚠️ 중요: 플러그인 설치 필요

이 예시에서 사용하는 **Pacing Start**와 **Pacing Pause** 기능은 JMeter 기본 기능이 아니라, **Custom Thread Groups** 플러그인에 포함된 기능입니다. 사용 전에 반드시 JMeter Plugins Manager를 통해 **Custom Thread Groups** 플러그인을 설치해야 합니다.

**설치 방법**:
1. JMeter 실행 후 `Options` > `Plugins Manager` 클릭
2. Available 탭에서 `Custom Thread Groups` 검색
3. 체크박스 선택 후 `Apply Changes and Restart JMeter` 클릭

## 1. Pacing Controller + Transaction Controller 구조

이 구조는 사용자 흐름을 하나의 트랜잭션으로 묶어, 전체 흐름의 응답 시간과 TPS를 통합적으로 관리할 수 있게 해줍니다.

```
Thread Group
├── CSV Data Set Config (사용자 데이터)
├── Pacing Start (페이싱 시작)
├── Transaction Controller [TC_검색]
│   ├── HTTP Request [검색1 - 상품 검색]
│   ├── HTTP Request [검색2 - 카테고리 검색]
│   ├── HTTP Request [검색3 - 필터 적용]
│   └── Response Assertion (검색 결과 확인)
├── Pacing Pause (페이싱 일시 중지)
└── View Results Tree
```

## 2. UTG92_검색 예시 구조

이 구조는 Ultimate Thread Group(UTG)을 사용하여 92명의 사용자에게 검색 기능을 테스트하는 예시입니다.

```
Test Plan: UTG92_검색_성능테스트
├── 📝 User Defined Variables
│   ├── SERVER_IP = 13.125.xxx.xxx
│   └── SEARCH_TERM = laptop
├── 🍪 HTTP Cookie Manager
├── 🌐 HTTP Request Defaults
│   ├── Server: ${SERVER_IP}
│   └── Port: 8080
├── 🎯 Ultimate Thread Group (UTG92)
│   ├── Threads: 92
│   ├── Ramp-up: 30s
│   └── Hold: 300s
├── 📊 CSV Data Set Config
│   ├── File: search_terms.csv
│   └── Variables: search_keyword
├── ⏱️ Pacing Start (요청 주기 제어)
│   └── Request Interval: 5초 (TPS = VU/RI = 92/5 = 18.4 TPS)
├── 🔄 Transaction Controller [TC_검색]
│   ├── 🔍 HTTP Request [검색1 - 상품 검색]
│   │   ├── Method: GET
│   │   ├── Path: /search?q=${search_keyword}
│   │   └── Response Assertion: "검색 결과"
│   ├── 🔍 HTTP Request [검색2 - 카테고리 검색]
│   │   ├── Method: GET
│   │   ├── Path: /category/electronics
│   │   └── Response Assertion: "카테고리 페이지"
│   ├── 🔍 HTTP Request [검색3 - 필터 적용]
│   │   ├── Method: GET
│   │   ├── Path: /search?q=${search_keyword}&filter=price_asc
│   │   └── Response Assertion: "정렬 결과"
│   └── 📊 Response Time Graph (Transaction 응답 시간)
├── ⏸️ Pacing Pause (요청 주기 일시 중지)
├── 📊 View Results Tree
└── 📈 Summary Report
```

## 3. 각 구성 요소 설명

### Pacing Start
- **기능**: 요청 주기를 제어하기 시작합니다.
- **설정**: 요청 간격을 일정하게 유지 (예: 5초마다 요청).
- **목적**: 서버 성능에 관계없이 일정한 TPS를 유지합니다.

### Transaction Controller [TC_검색]
- **기능**: 여러 검색 요청을 하나의 트랜잭션으로 묶습니다.
- **이점**: 개별 요청 시간 외에 전체 검색 흐름의 시간도 측정합니다.
- **용도**: 사용자가 "검색 → 카테고리 → 필터"까지의 전체 흐름을 하나로 보기 위해 사용.

### Pacing Pause
- **기능**: Pacing Start에서 시작한 요청 주기 제어를 일시 중지합니다.
- **목적**: Transaction Controller가 완료된 후 다음 페이싱 주기를 시작하기 위해 사용.

## 4. 실전 적용 시나리오 (t3.medium 환경)

**테스트 목표**: 쇼핑몰의 검색 기능이 92명의 사용자에게 초당 약 18 TPS를 처리할 수 있는지 확인

**구성 요소 상호작용**:
1. **CSV Data Set Config**: 각 사용자에게 서로 다른 검색어를 제공
2. **Pacing Start**: 5초 간격으로 요청이 발생하도록 설정
3. **Transaction Controller**: 검색 관련 3개 요청을 하나로 묶어 전체 흐름 측정
4. **Pacing Pause**: 트랜잭션 완료 후 다음 주기 대기

**기대 효과**:
- 서버 응답 시간이 변해도 TPS는 일정하게 유지 (예: 18.4 TPS)
- 검색 흐름 전체의 성능을 단일 지표로 확인 가능
- 실제 사용자 흐름(검색 → 카테고리 → 필터)을 정확히 재현

## 5. Scouter와 연계 분석

이 구조를 사용하면 Scouter에서 다음과 같은 분석이 가능합니다:

- **Transaction 단위 분석**: XLog에서 "TC_검색" 트랜잭션의 응답 시간 분포를 확인
- **병목 지점 파악**: 특정 검색어(예: "laptop")에 대한 응답 시간이 긴 경우 식별
- **자원 사용 패턴**: 검색 요청이 들어올 때마다 CPU, Memory 사용량 변화 추적

## 💡 팁: 고급 설정

**Think Time과의 조합**: Pacing만으로도 요청 주기를 제어할 수 있지만, 실제 사용자 패턴을 더 정확히 재현하고 싶다면 Pacing과 Think Time을 조합하여 사용하세요.

**Nested Transaction**: 복잡한 사용자 흐름에서는 여러 Transaction Controller를 중첩하여 사용할 수 있습니다. 예를 들어, "로그인 → 검색 → 구매" 흐름에서는 각각을 별도의 Transaction으로 관리할 수 있습니다.