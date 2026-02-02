# Practice Scenarios

## Recommended Practice Flow

지금 JMeter 실습 중이시라면 다음과 같은 흐름으로 연동해 보세요.

1. **Scouter 설치**: 모니터링 대상 서버(WAS)에 Scouter Agent를 심습니다.
2. **부하 발생**: JMeter로 스레드(Thread)를 서서히 올리며 서버에 부하를 줍니다.
3. **관찰**: Scouter 대시보드에서 TPS가 꺾이는 지점이나 메모리가 치솟는 지점을 찾습니다.
4. **분석**: 느려진 지점의 XLog를 드래그하여 어떤 SQL 쿼리나 메서드가 시간을 잡아먹었는지 확인합니다.

## Detailed Scenario: "Finding Bottlenecks in Shopping Mall Server"

### Step 1: JMeter Load Start
- HTTP Request에 EC2 퍼블릭 IP와 포트(8080), 그리고 상품 목록 조회 경로(예: /api/products)를 입력합니다.
- 상단 'Start' (초록색 화살표) 버튼을 누릅니다.

### Step 2: Scouter XLog Analysis (핵심)
이제 웹 브라우저 대신 Scouter Client 화면을 봅니다.

- **XLog 차트**: 요청이 들어올 때마다 점이 찍힙니다.
  - 아래쪽에 깔리는 점: 정상적인 빠른 응답.
  - 위로 치솟는 점: 처리가 늦어지는 요청 (위험 신호!).
- **드래그 분석**: 위로 튀어 오른 점들을 마우스로 드래그해 보세요. 해당 요청이 어떤 SQL을 실행했는지, Java 메서드 중 어디서 시간을 끌었는지 상세 팝업이 뜹니다.

### Step 3: Performance Limit Point (Saturation Point) Finding
- JMeter의 Number of Threads를 10 → 50 → 100으로 단계적으로 높여봅니다.
- Scouter의 CPU/Memory/TPS 그래프를 관찰합니다.
- **TPS(초당 처리량)**가 더 이상 오르지 않고 정체되거나,
- 응답 시간이 급격히 길어지면 그 지점이 현재 서버의 한계입니다.

## Recommended Additional Settings (for Result Verification)
JMeter 왼쪽 트리에서 Http Request 우클릭 -> Add -> Listener를 통해 아래 두 가지를 추가해 보세요. 시각적으로 훨씬 이해하기 좋습니다.

- **View Results Tree**: 각 요청이 성공(초록)했는지 실패(빨강)했는지, 데이터는 잘 왔는지 개별 확인 가능.
- **Summary Report**: 평균 응답 시간, 최소/최대 시간, **Error %**를 표로 한눈에 정리.

## 💡 Pro Tips (for Unexpected Situations)
- **Infinite(무한 반복) 주의**: EC2 인스턴스 사양이 낮을 경우(t2.micro 등), 무한 반복으로 돌리면 서버가 완전히 멈춰서 SSH 접속조차 안 될 수 있습니다. 처음엔 Loop Count를 100 정도로 제한하고 테스트해 보시는 걸 권장해요.
- **Constant Timer의 위치**: 반드시 HTTP Request 안에 넣거나 같은 레벨에 두어야 해당 요청에 적용됩니다.