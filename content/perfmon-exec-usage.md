# PerfMon Metrics Collector - EXEC 활용

PerfMon Metrics Collector의 가장 강력하면서도 위험한 기능인 EXEC(Custom Execution) 활용법을 추가하여 내용을 업데이트해 드립니다.

이 기능을 사용하면 PerfMon이 기본으로 제공하는 지표(CPU, Memory 등) 외에, 서버 내의 커스텀 스크립트나 명령어를 실행한 결과값을 JMeter 그래프로 직접 가져올 수 있습니다.

## 1. EXEC 활용: "내가 원하는 모든 것을 그래프로"

EXEC는 서버에서 실행 가능한 모든 명령어(Shell Script, Python, Batch 등)의 표준 출력(Standard Output)값을 실시간으로 가로채서 JMeter로 전송합니다.

### 주요 활용 사례

- **DB 커넥션 수 모니터링**: netstat 명령어로 특정 포트의 접속자 수 추적
- **로그 파일 추적**: 특정 로그 파일의 크기 변화나 특정 단어(Error 등) 발생 빈도 감시
- **JVM 상세 지표**: jstat을 실행하여 GC(Garbage Collection) 발생 횟수나 힙 메모리 상세 상태 추출
- **OS 전용 지표**: iostat, vmstat 등 고급 시스템 도구의 결과값 시각화

## 2. EXEC 설정 방법

1. **Metric to collect**: 드롭다운에서 **EXEC**를 선택합니다.
2. **Metric parameter**: 실행할 명령어와 인자값을 입력합니다.

**예시 (리눅스 커넥션 수)**: netstat -an | grep :8080 | grep ESTABLISHED | wc -l

**예시 (스크립트 실행)**: /home/ec2-user/check_app_status.sh

**주의사항**: 출력값은 반드시 숫자(Integer 또는 Float) 형태여야 그래프에 점이 찍힙니다.

## 3. 실전 활용 팁: Scouter와 EXEC의 협업

t3.medium 환경에서 부하 테스트를 할 때, EXEC를 이렇게 활용하면 분석의 질이 달라집니다.

- **Scouter는 '내부'를, EXEC는 '외부'를**: Scouter가 Java 메서드 성능을 측정하는 동안, EXEC를 통해 OS의 파일 디스크립터(File Descriptor) 개수나 커널 세션 수를 모니터링하세요.
- **임계점 알람**: TPS가 떨어지는 시점에 EXEC 그래프가 급증한다면, 이는 애플리케이션 외부(OS 설정, 네트워크 장비 등)에 병목이 있음을 시사합니다.

## 4. EXEC 사용 시 주의사항 (Security & Performance)

- **보안 위험**: ServerAgent가 실행 중인 계정의 권한으로 명령어가 실행됩니다. 외부 노출 시 위험할 수 있으므로 반드시 방화벽(4444 포트)으로 허용된 IP만 접속하게 하세요.
- **리소스 소모**: 너무 무거운 스크립트를 EXEC로 매초 실행하면, 부하를 측정하기 위한 도구가 서버에 부하를 주는 주객전도 상황이 발생합니다. 실행 시간이 짧고 가벼운 명령어 위주로 구성하세요.
- **데이터 타입**: 문자열이 출력되면 JMeter 그래프에 표시되지 않습니다. 반드시 숫자만 출력되도록 grep, awk, cut 등을 조합하여 가공해야 합니다.

## 💡 종합 요약: PerfMon의 3대장

- **CPU/Memory**: 기본적인 하드웨어 건강 상태 체크
- **Network/Disk I/O**: 입출력 병목 현상 감지
- **EXEC (New)**: 비즈니스 특화 지표(DB 연결, 로그 카운트 등) 커스텀 모니터링