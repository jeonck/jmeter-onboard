# JMeter 테스트를 위한 명령어 가이드

JMeter 부하 테스트를 수행할 때 필요한 시스템 명령어들을 Windows와 Linux 환경별로 정리해 드립니다. 이 명령어들은 테스트 환경 설정, 문제 진단, 자원 모니터링 등에 유용합니다.

## Windows 명령어

### 네트워크 관련 명령어
- **포트 상태 확인**: `netstat -na | findstr :8080`
  - 특정 포트(예: 8080)의 상태를 확인합니다.
- **연결된 세션 수 확인**: `netstat -na | findstr ESTABLISHED | find /c /v ""`
  - 현재 ESTABLISHED 상태인 연결 수를 세줍니다.
- **TIME_WAIT 상태 확인**: `netstat -na | findstr TIME_WAIT`
  - TIME_WAIT 상태인 연결을 확인하여 포트 고갈 여부를 파악합니다.
- **모든 연결 보기**: `netstat -an`
  - 모든 네트워크 연결 상태를 확인합니다.

### 자원 모니터링
- **CPU 사용률 확인**: `wmic cpu get loadpercentage`
  - 현재 CPU 사용률을 확인합니다.
- **메모리 사용량 확인**: `wmic memorychip get capacity`
  - 시스템 메모리 용량을 확인합니다.
- **프로세스별 CPU/메모리 사용량**: `tasklist /fi "imagename eq java.exe"`
  - JMeter 프로세스(java.exe)의 자원 사용량을 확인합니다.
- **디스크 사용량 확인**: `dir /s C:\jmeter\results`
  - 특정 폴더의 디스크 사용량을 확인합니다.

### JMeter 실행 관련
- **GUI 없이 테스트 실행**: `jmeter -n -t test_plan.jmx -l result.jtl`
  - GUI를 띄우지 않고 테스트를 실행합니다.
- **GUI로 테스트 실행**: `jmeter -t test_plan.jmx`
  - GUI 모드로 테스트를 실행합니다.
- **속성 파일 지정**: `jmeter -n -t test_plan.jmx -l result.jtl -p user.properties`
  - 사용자 정의 속성 파일을 지정하여 실행합니다.

## Linux 명령어

### 네트워크 관련 명령어
- **포트 상태 확인**: `netstat -tulnp | grep :8080`
  - 특정 포트(예: 8080)의 상태를 확인합니다.
- **연결된 세션 수 확인**: `netstat -an | grep ESTABLISHED | wc -l`
  - 현재 ESTABLISHED 상태인 연결 수를 세줍니다.
- **TIME_WAIT 상태 확인**: `netstat -an | grep TIME_WAIT | wc -l`
  - TIME_WAIT 상태인 연결 수를 확인하여 포트 고갈 여부를 파악합니다.
- **모든 연결 보기**: `ss -tuln`
  - 모든 네트워크 연결 상태를 확인합니다 (ss는 netstat의 현대적 대안).

### 자원 모니터링
- **CPU 사용률 확인**: `top` 또는 `htop`
  - 실시간으로 CPU 사용률을 확인합니다.
- **메모리 사용량 확인**: `free -h`
  - 시스템 메모리 사용량을 확인합니다.
- **프로세스별 CPU/메모리 사용량**: `ps aux | grep java`
  - JMeter 프로세스(java)의 자원 사용량을 확인합니다.
- **디스크 사용량 확인**: `du -sh /home/ec2-user/jmeter/results`
  - 특정 폴더의 디스크 사용량을 확인합니다.

### JMeter 실행 관련
- **GUI 없이 테스트 실행**: `jmeter -n -t test_plan.jmx -l result.jtl`
  - GUI를 띄우지 않고 테스트를 실행합니다.
- **백그라운드에서 실행**: `nohup jmeter -n -t test_plan.jmx -l result.jtl &`
  - 터미널이 닫혀도 계속 실행되도록 백그라운드에서 실행합니다.
- **속성 파일 지정**: `jmeter -n -t test_plan.jmx -l result.jtl -q user.properties`
  - 사용자 정의 속성 파일을 지정하여 실행합니다.

## 실무 팁

### Windows
- **JMeter 로그 확인**: `type C:\jmeter\bin\jmeter.log`
  - JMeter 로그 파일 내용을 확인합니다.
- **파일 인코딩 문제 해결**: PowerShell에서 `Get-Content -Encoding UTF8 C:\jmeter\result.jtl`
  - UTF-8 인코딩으로 파일 내용을 확인합니다.

### Linux
- **JMeter 로그 확인**: `tail -f /home/ec2-user/jmeter/bin/jmeter.log`
  - 실시간으로 JMeter 로그를 확인합니다.
- **결과 파일 실시간 모니터링**: `tail -f result.jtl`
  - 테스트 결과 파일을 실시간으로 확인합니다.
- **CPU 과부하 감지**: `vmstat 1 5`
  - 1초 간격으로 5번 시스템 상태를 확인하여 CPU 부하를 감지합니다.

## 문제 해결을 위한 명령어 조합

### 포트 고갈 문제 진단
- **Windows**: `netstat -na | findstr :4444 | findstr TIME_WAIT`
- **Linux**: `netstat -an | grep :4444 | grep TIME_WAIT | wc -l`

### 메모리 부족 문제 진단
- **Windows**: `wmic process where "name='java.exe'" get name,processid,workingsetsize`
- **Linux**: `ps aux --sort=-%mem | head -n 10`
  - 메모리를 가장 많이 사용하는 상위 10개 프로세스를 확인합니다.

### 네트워크 대역폭 확인
- **Linux**: `iftop -i eth0`
  - 네트워크 인터페이스의 실시간 트래픽을 확인합니다.