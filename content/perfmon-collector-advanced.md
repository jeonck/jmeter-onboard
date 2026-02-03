# PerfMon Metrics Collector (심화)

PerfMon Metrics Collector는 JMeter의 성능 지표(응답 시간, TPS 등)와 대상 서버의 하드웨어 지표(CPU, Memory, Disk, Network 등)를 하나의 그래프로 통합하여 분석할 수 있게 해주는 강력한 플러그인입니다.

단순히 "서버가 느리다"는 사실을 넘어, "서버의 어떤 자원이 부족해서 느려졌는가?"라는 근본적인 원인을 파악하는 데 결정적인 역할을 합니다.

## 1. 작동 구조 (Master-Agent 모델)

PerfMon은 JMeter 단독으로는 작동하지 않으며, 서버의 자원을 측정하여 보내주는 Server Agent와 통신해야 합니다.

- **Server Agent (서버 측)**: 부하 테스트 대상 서버(Target Server)에서 실행되는 가벼운 프로그램입니다. 서버의 자원을 수집하여 4444 포트로 대기합니다.
- **PerfMon Metrics Collector (JMeter 측)**: JMeter 리스너에서 Agent에 접속하여 실시간으로 수집된 자원 데이터를 가져와 시각화합니다.

## 2. 주요 설정 및 사용법

### ① 서버 설정 (Server Agent 실행)

1. **설치**: 서버에 ServerAgent-X.X.zip을 업로드하고 압축을 풉니다.
2. **실행 (Linux/Unix)**: ./startAgent.sh
3. **실행 (Windows)**: startAgent.bat
4. **포트 확인**: 기본적으로 4444(TCP/UDP) 포트를 사용합니다. 보안 그룹이나 방화벽에서 이 포트를 열어주어야 합니다.

### ② JMeter 설정 (Listener 추가)

1. **추가**: Add > Listener > jp@gc - PerfMon Metrics Collector 선택.
2. **지표 추가**: Add Row를 클릭하여 모니터링할 항목을 입력합니다.
   - Host: 대상 서버 IP
   - Port: 4444
   - Metric to Collect: CPU, Memory, Disks I/O, Network I/O 등 선택.

## 3. 실무 분석 팁: "병목의 범인을 찾아라"

이 리스너의 진가는 다른 그래프와의 중첩 분석에서 나옵니다.

- **CPU가 100%를 치는 경우**: 로직 연산이 복잡하거나 자바의 GC(Garbage Collection)가 과도하게 발생하고 있음을 뜻합니다. (Scouter로 어떤 메소드가 문제인지 확인 필요)

- **응답 시간은 느린데 CPU는 한가한 경우**:
  - **Memory**: 스왑(Swap)이 발생하고 있는지 확인하세요.
  - **Network I/O**: 대역폭이 꽉 찼거나 외부 API 호출 대기가 길어지는 상태일 수 있습니다.
  - **DB Connection**: 애플리케이션 설정 상의 커넥션 풀이 부족할 가능성이 높습니다.

- **Disk I/O가 튀는 경우**: 로그 출력이 너무 많거나 DB Index가 제대로 잡히지 않아 전체 테이블 스캔(Full Table Scan)이 발생하고 있을 수 있습니다.

## 4. t3.medium 환경에서의 특별 주의사항

- **CPU Credit 소진**: t3 인스턴스는 CPU 사용량이 급증하면 '크레딧'을 소모합니다. PerfMon으로 CPU를 보는데 100%가 아님에도 성능이 갑자기 훅 떨어진다면, AWS 콘솔에서 CPU Credit Balance가 0인지 확인해야 합니다.
- **Agent 생존 여부**: 테스트 중 갑자기 PerfMon 그래프가 멈춘다면 서버 Agent 프로세스가 OOM(Out of Memory) 등으로 죽었는지 확인하세요.

## 💡 성능 분석의 완성

PerfMon으로 하드웨어의 병목 지점을 찾았다면, 그 다음은 Scouter를 통해 소프트웨어(Java 소스 코드) 레벨의 병목을 찾는 단계로 넘어가는 것이 정석입니다.