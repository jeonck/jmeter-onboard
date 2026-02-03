# JMeter Ultimate Thread Group

Ultimate Thread Group은 JMeter 플러그인 중에서도 가장 자유도가 높고 강력한 부하 시나리오 설계 도구입니다. 기본 Thread Group이 단순히 사용자를 순차적으로 늘리는 기능만 있다면, Ultimate Thread Group은 시간대별로 가상 사용자(Thread)의 증감을 아주 세밀하게 예약할 수 있습니다.

## 1. 주요 특징 및 장점

- **가상 사용자 수의 시각화**: 설정을 입력함과 동시에 하단 그래프에 부하 패턴이 실시간으로 그려져 실수를 방지할 수 있습니다.
- **복합 시나리오 구성**: 하나의 그룹 내에서 여러 개의 부하 스케줄(Rows)을 겹쳐서 사용할 수 있습니다.
- **유연한 램프업/다운**: 부하를 계단식으로 올리거나(Step-up), 갑자기 폭발적으로 늘리거나(Spike), 서서히 줄이는 설정이 모두 가능합니다.

## 2. 설정 항목 (Threads Schedule Table)

테이블의 각 컬럼은 하나의 '부하 뭉치'를 정의합니다.

| 설정 항목 | 설명 |
|-----------|------|
| Start Threads Count | 이 스케줄에서 투입할 총 가상 사용자 수 |
| Initial Delay, sec | 테스트 시작 후 몇 초 뒤에 이 스케줄을 가동할 것인가? |
| Startup Time, sec | 설정한 사용자 수까지 도달하는 데 걸리는 시간 (Ramp-up) |
| Hold Load For, sec | 목표 사용자 수를 유지하며 부하를 주는 지속 시간 |
| Shutdown Time, sec | 테스트 종료 시 사용자를 서서히 정리하는 시간 (Ramp-down) |

## 3. 실무 활용 시나리오 (예시)

### ① 계단식 부하 테스트 (Step-up Test)

서버의 한계를 찾기 위해 10명씩 늘려가는 방식입니다.

- Row 1: 10명, Delay 0s, Startup 10s, Hold 100s
- Row 2: 10명, Delay 30s, Startup 10s, Hold 70s

이렇게 설정하면 30초 간격으로 10명씩 사용자가 추가됩니다.

### ② 스파이크 테스트 (Spike Test)

이벤트 오픈 직후처럼 찰나에 접속자가 몰리는 상황을 재현합니다.

- Row 1: 10명 (상시 부하 유지)
- Row 2: 500명, Delay 60s, Startup 1s, Hold 10s (1분 뒤에 1초 만에 500명 투입)

### ③ 점진적 부하 및 종료

서버에 가해진 부하를 갑자기 끊지 않고 서서히 줄여가며, 자원 회수(Garbage Collection 등)가 정상적으로 이루어지는지 확인할 때 유용합니다.

## 4. Scouter와 함께 분석하는 포인트

Ultimate Thread Group으로 복잡한 부하를 줄 때 Scouter를 보면 시스템의 반응을 더 입체적으로 이해할 수 있습니다.

- **Startup 구간**: 사용자가 늘어날 때 Scouter의 CPU 사용률과 Active Service가 정비례하게 오르는지 확인합니다.
- **Hold 구간**: 부하가 일정하게 유지될 때 응답 시간(XLog)의 분포가 일정한지, 아니면 점점 위로 치솟는지(병목 발생) 관찰합니다.
- **Shutdown 구간**: 테스트가 끝나고 나서 서버의 Memory Heap이 정상적으로 반환되는지 확인하여 메모리 누수 여부를 판단합니다.

## 💡 팁: 실제 사용 시 주의사항

Ultimate Thread Group은 매우 정교한 만큼, t3.medium 같은 낮은 사양의 서버를 테스트할 때는 주의가 필요합니다. 한 번에 너무 많은 사용자(Start Threads Count)를 짧은 시간(Startup Time) 내에 투입하면, 서버가 대응하기도 전에 네트워크 타임아웃이 발생하여 정확한 성능 측정이 어려울 수 있습니다.