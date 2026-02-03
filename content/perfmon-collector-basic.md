# PerfMon Metrics Collector (기초)

PerfMon Metrics Collector는 JMeter 플러그인 중에서 유일하게 대상 서버(Target Server)의 하드웨어 자원 상태를 JMeter 내부로 낚아채 오는 도구입니다.

일반적인 리스너는 서버의 응답 속도만 측정하지만, PerfMon을 사용하면 응답 시간이 느려진 이유가 "서버 CPU가 100%여서인지" 혹은 "메모리가 꽉 차서인지"를 한 그래프 내에서 시공간적으로 분석할 수 있습니다.

## 1. 작동 원리 (Master - Agent 구조)

PerfMon은 독특하게 서버 측에 별도의 실행 파일이 필요합니다.

- **Server Agent**: 부하 테스트 대상 서버(예: t3.medium 리눅스 인스턴스)에 ServerAgent를 업로드하고 실행합니다. (기본 포트: 4444)
- **PerfMon Metrics Collector (JMeter 플러그인)**: JMeter 리스너에서 서버의 IP와 포트를 지정하여 데이터를 요청합니다.
- **데이터 시각화**: Server Agent가 수집한 CPU, RAM, Disk I/O 등의 수치를 JMeter 그래프로 전송합니다.

## 2. 주요 설정 방법

### [Step 1] 서버 측 설정 (Server Agent)

1. 대상 서버에 ServerAgent-X.X.X.zip을 업로드하고 압축을 풉니다.
2. 실행: ./startAgent.sh (리눅스) 또는 startAgent.bat (윈도우).
3. 방화벽: 서버의 4444(TCP/UDP) 포트가 부하 발생기로부터 열려 있어야 합니다.

### [Step 2] JMeter 측 설정 (Listener)

1. Add > Listener > jp@gc - PerfMon Metrics Collector 추가.
2. Add Row 클릭 후 상세 설정 입력:
   - Host: 서버 IP 주소
   - Port: 4444
   - Metric to collect: CPU, Memory, Disks I/O, Network I/O 중 선택.
3. Filename: 데이터를 저장할 파일 경로 입력 (예: perf_results.jtl).

## 3. 실무 분석 팁 (Scouter와 차이점)

많은 분들이 "Scouter가 있는데 왜 PerfMon을 써야 하나요?"라고 묻습니다. 용도가 조금 다릅니다.

- **Scouter**: Java 애플리케이션 내부(JVM, 힙 메모리, SQL 쿼리)를 정교하게 프로파일링하는 데 탁월합니다.
- **PerfMon**: JMeter의 TPS, Response Time 그래프와 서버 자원을 '단일 그래프'에 겹쳐서 볼 수 있다는 것이 최대 강점입니다.

**분석 예시**: "사용자가 100명을 넘는 순간(Active Threads) 응답 시간은 급증하는데, PerfMon 그래프 상의 CPU는 30%라면? 아, 이건 CPU 문제가 아니라 DB 커넥션 풀이나 네트워크 병목이구나!"라고 즉시 판단할 수 있습니다.

## 4. t3.medium 환경에서의 주의사항

- **크레딧 고갈 확인**: t3 인스턴스는 CPU 사용량이 일정 수준을 넘으면 크레딧을 소모합니다. PerfMon으로 CPU를 모니터링하다가 100%가 아님에도 성능이 갑자기 툭 떨어진다면, 인스턴스 대시보드에서 CPU Credit 소진 여부를 확인해야 합니다.
- **에이전트 부하**: ServerAgent 자체는 매우 가볍지만, 너무 잦은 주기(1초 미만)로 데이터를 수집하면 서버에 추가적인 부하를 줄 수 있으므로 기본 설정을 권장합니다.