# JMeter Pacing Controller 사용 예시

성능 테스트에서 **Pacing(페이싱)**이란 가상 사용자(VU)가 요청을 보내는 '주기'를 일정하게 강제하는 기법을 말합니다.

앞서 학습한 $TPS = VU / RI$ 공식에서 **Request Interval(요청 주기, RI)**을 시스템의 응답 시간(RT)과 관계없이 일정하게 유지하기 위해 사용합니다.

## 1. Pacing이 왜 필요한가? (Think Time과의 차이)

일반적인 **Think Time(Timer)**만 사용하면 서버가 느려질 때 전체 테스트 부하(TPS)가 요동치는 문제가 발생합니다.

- **일반 Timer**: 응답이 1초든 10초든 무조건 그 뒤에 3초를 쉽니다. (서버가 느려지면 요청 간격이 늘어나 TPS가 급감함)
- **Pacing**: "응답 시간 + 쉬는 시간"의 합을 무조건 5초로 맞춥니다.
  - 응답이 1초면 4초를 쉽니다.
  - 응답이 4초면 1초만 쉽니다.
- **결과**: 서버 상태와 상관없이 초당 부하(TPS)를 일정하게 유지할 수 있습니다.

## 2. JMeter에서 Pacing을 구현하는 방법

JMeter에는 'Pacing Controller'라는 이름의 단일 컴포넌트는 없지만, 다음의 방법들로 완벽하게 구현할 수 있습니다.

### ① Constant Throughput Timer (가장 대중적)

가장 간단한 방법으로, 전체 스레드가 생성할 총 목표 TPS를 설정합니다.

- **Target Throughput**: 분당 샘플 수(Samples per minute)로 설정합니다. (예: 600이면 초당 10 TPS)
- **Calculate Throughput based on**: 'All active threads'로 설정하면 전체 VU가 협력하여 목표 TPS를 유지합니다.

### ② Precise Throughput Timer (정밀한 제어)

조금 더 고도화된 타이머로, 요청을 수학적으로 정밀하게 분산시켜 '스파이크' 없는 부하를 보냅니다.

- 부하 주기를 가변적으로 조절하여 목표 TPS를 칼같이 맞춥니다.

### ③ Flow Control Action + JSR223 (커스텀 Pacing)

스크립트를 통해 직접 pacing = 목표주기 - 응답시간을 계산하여 대기 시간을 조절하는 방식입니다. 특정 루프 안에서 정교한 제어가 필요할 때 사용합니다.

## 3. Pacing 활용의 장점

- **예측 가능한 부하**: 서버 성능이 저하되더라도 테스트 설계 시 의도한 부하(TPS)를 끝까지 밀어붙일 수 있습니다. (Saturation Point를 찾기에 최적)
- **리소스 최적화**: 가상 사용자 수를 늘리는 대신 Pacing을 짧게 가져감으로써 부하 발생기(t3.medium)의 자원을 아낄 수 있습니다.
- **실제 사용자 패턴 재현**: "사용자는 응답 속도와 관계없이 10초에 한 번씩 클릭한다"는 시나리오를 완벽히 구현합니다.

## 4. 실전 요약 가이드

| 상황 | 추천 설정 |
|------|-----------|
| 일정한 TPS 부하를 주고 싶을 때 | Constant Throughput Timer |
| 매우 정밀하고 불규칙한 유입을 재현할 때 | Precise Throughput Timer |
| 서버 응답 속도에 따라 유동적으로 쉬고 싶을 때 | Uniform Random Timer (일반 Think Time) |

## 5. Pacing Controller를 사용하는 Test Plan 예시

### 쇼핑몰 결제 시나리오 (t3.medium 환경)

```
Test Plan: 쇼핑몰_결제_부하테스트_with_Pacing
├── 📝 User Defined Variables
│   ├── SERVER_IP = 13.125.xxx.xxx
│   └── PORT = 8080
├── 🍪 HTTP Cookie Manager
├── 🌐 HTTP Request Defaults
│   ├── Server: ${SERVER_IP}
│   └── Port: ${PORT}
├── ⏱️ Constant Throughput Timer (TPS 제어)
│   ├── Target Throughput: 100 (분당 100 샘플 = 초당 1.67 TPS)
│   └── Calculate based on: All active threads
├── 👥 Thread Group (50 Users / 10s Ramp-up)
│   ├── 🛒 Step 1: 장바구니 조회 (GET /cart)
│   ├── 🔐 Step 2: 결제 페이지 (GET /payment)
│   ├── 💳 Step 3: 결제 요청 (POST /payment/process)
│   │   └── ✅ Response Assertion: "결제 완료"
│   └── 🏠 Step 4: 홈으로 (GET /)
├── 📊 View Results Tree
└── 📈 Summary Report
```

**각 구성 요소 설명:**
- **Constant Throughput Timer**: 전체 50명의 사용자가 협력하여 초당 1.67 TPS를 유지하도록 설정 (100 samples per minute).
- **Thread Group**: 50명의 가상 사용자로 구성.
- **요청 흐름**: 실제 사용자처럼 장바구니 → 결제 페이지 → 결제 요청 → 홈으로 이동.
- **Pacing 효과**: 서버 응답 시간이 0.5초든 2초든 관계없이, 요청 주기는 일정하게 유지되어 TPS가 일정한 수준을 유지.

### Pacing 설정 시나리오 예시

**목표**: t3.medium 서버에 10 TPS를 10분 동안 일정하게 유지

1. **Thread Group 설정**: 20명의 가상 사용자
2. **Constant Throughput Timer 설정**: 600 samples per minute (10 TPS)
3. **기대 효과**: 20명의 사용자가 10 TPS를 유지하기 위해 각 사용자는 평균적으로 2초 간격으로 요청을 보냄 (Request Interval = 20명 / 10 TPS = 2초)

이 설정을 통해 서버 성능이 저하되어도 TPS는 일정하게 유지되며, 병목 지점을 더 명확하게 파악할 수 있습니다.

## 💡 팁: Pacing과 Scouter 연계

Pacing을 사용하면 TPS가 일정하게 유지되므로, Scouter에서 XLog 분석 시 "어느 시점부터 응답 시간이 길어졌는지"를 더 명확하게 파악할 수 있습니다. 서버 성능 저하가 발생해도 TPS는 일정하므로, 응답 시간 증가가 병목 지점을 정확히 가리키게 됩니다.