# JMeter 원격 부하 테스트 (Distributed Testing)

JMeter의 분산 테스트(Distributed Testing)는 하나의 Controller(마스터)가 여러 개의 Agent(슬레이브)를 통해 동시에 부하를 발생시키는 방식입니다. 이 방식을 사용하면 단일 머신의 한계를 넘어 더 많은 가상 사용자(Virtual Users)를 생성할 수 있으며, 실제 사용자의 지리적 분포를 시뮬레이션할 수도 있습니다.

## 1. 분산 테스트의 필요성

- **단일 머신의 한계 극복**: 하나의 머신에서 생성할 수 있는 스레드 수는 CPU, 메모리, 네트워크 포트 수 등에 의해 제한됩니다.
- **대규모 부하 생성**: 수천 명 이상의 동시 사용자를 시뮬레이션해야 할 때, 여러 머신을 사용하면 더 많은 부하를 생성할 수 있습니다.
- **지리적 분포 시뮬레이션**: 실제 사용자가 다양한 지역에 분포되어 있을 때, 각 지역의 머신을 Agent로 사용하면 네트워크 지연을 더 현실적으로 반영할 수 있습니다.

## 2. 시스템 구성 및 아키텍처

### 2.1 기본 구성

- **Controller (Master)**: 테스트 스크립트를 관리하고, Agent들에게 명령을 전달하며, 결과를 수집합니다.
- **Agent (Slave/Worker)**: Controller의 지시에 따라 실제 부하를 발생시킵니다.

### 2.2 네트워크 포트 구성

분산 테스트 시 방화벽이 있다면 아래 포트들이 반드시 양방향으로 개방되어야 합니다.

| 역할 | 포트 번호 | 용도 |
|------|-----------|------|
| Controller | 5000 | Agent가 Controller로 결과를 전송할 때 사용하는 포트 |
| Agent | 1099 | RMI 레지스트리 포트 (Agent가 명령을 기다리는 포트) |
| Agent | 4000 | RMI 데이터 통신 포트 (Agent가 Controller와 데이터를 주고받는 포트) |

## 3. Agent 서버 설정 및 실행

각 Agent 서버에서 JMeter를 설정하고 실행하는 절차입니다.

### 3.1 Agent 서버의 jmeter.properties 파일 수정

Agent 서버의 `$JMETER_HOME/bin/jmeter.properties` 파일을 수정합니다.

```properties
# RMI 레지스트리 포트 (기본값)
server_port=1099

# 실제 데이터 통신을 위한 로컬 포트 고정
server.rmi.localport=4000

# SSL 인증 해제 (보안 설정 해제)
server.rmi.ssl.disable=true
```

### 3.2 Agent 서버 실행

Agent 서버에서 자신의 IP를 명시하여 실행합니다.

```bash
./jmeter-server -Djava.rmi.server.hostname=[Agent_자신_IP]
```

**예시**:
```bash
./jmeter-server -Djava.rmi.server.hostname=192.168.1.100
```

## 4. Controller 서버 설정 및 실행

Controller 서버에서 Agent들을 등록하고 실행하는 절차입니다.

### 4.1 Controller 서버의 jmeter.properties 파일 수정

Controller 서버의 `$JMETER_HOME/bin/jmeter.properties` 파일을 수정합니다.

```properties
# 대상 Agent들의 IP 및 포트 등록
remote_hosts=[Agent1_IP]:1099,[Agent2_IP]:1099

# Agent가 Controller로 데이터를 보낼 때 사용할 포트 고정
client.rmi.localport=5000

# SSL 인증 해제 (Agent와 동일하게 설정)
server.rmi.ssl.disable=true
```

**예시**:
```properties
remote_hosts=192.168.1.100:1099,192.168.1.101:1099
client.rmi.localport=5000
server.rmi.ssl.disable=true
```

### 4.2 Controller GUI 실행

터미널 점유 없이 GUI를 실행합니다.

```bash
./jmeter.sh > /dev/null 2>&1 &
```

## 5. 방화벽 설정 (필수 확인)

리눅스 서버(iptables 또는 ufw)에서 아래 규칙을 적용해야 통신이 끊기지 않습니다.

### 5.1 Controller 서버 설정

- **5000번 포트 인바운드(Inbound) 허용**:
  ```bash
  # iptables 사용 시
  sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
  
  # ufw 사용 시
  sudo ufw allow 5000/tcp
  ```

### 5.2 Agent 서버 설정

- **1099번 및 4000번 포트 인바운드(Inbound) 허용**:
  ```bash
  # iptables 사용 시
  sudo iptables -A INPUT -p tcp --dport 1099 -j ACCEPT
  sudo iptables -A INPUT -p tcp --dport 4000 -j ACCEPT
  
  # ufw 사용 시
  sudo ufw allow 1099/tcp
  sudo ufw allow 4000/tcp
  ```

## 6. 테스트 수행 절차

### 6.1 사전 준비

- **테스트 스크립트 배포**: Controller에서 사용하는 .jmx 파일을 모든 Agent 서버의 동일한 절대 경로에 복사합니다.
- **CSV 데이터 파일 배포**: 테스트에 사용되는 CSV 데이터 파일이 있다면, 모든 Agent 서버의 동일한 절대 경로에 미리 복사해 두어야 합니다.

### 6.2 테스트 실행

#### GUI 모드 실행
1. Controller의 JMeter GUI에서 상단 메뉴의 `Run > Remote Start > Remote Start All` 클릭

#### CLI 모드 실행 (권장)
Controller 서버에서 아래 명령어로 실행합니다.

```bash
./jmeter -n -t [테스트_스크립트].jmx -r -l [결과_파일].jtl
```

**예시**:
```bash
./jmeter -n -t shopping_cart_test.jmx -r -l distributed_test_result.jtl
```

**명령어 옵션 설명**:
- `-n`: Non-GUI 모드 (CLI 모드)
- `-t`: 테스트 스크립트 파일 경로
- `-r`: 원격 테스트 실행 (모든 Agent에서 실행)
- `-l`: 결과 로그 파일 경로

## 7. 설정 요약표

| 구분 | 설정 항목 | 값 |
|------|-----------|-----|
| Controller | remote_hosts | Agent1_IP:1099, Agent2_IP:1099 |
| Controller | client.rmi.localport | 5000 |
| Agent | server_port | 1099 |
| Agent | server.rmi.localport | 4000 |
| 공통 | server.rmi.ssl.disable | true |

## 8. 문제 해결 팁

### 8.1 자주 발생하는 오류 및 해결 방법

| 오류 메시지 | 원인 | 해결 방법 |
|-------------|------|------------|
| Connection refused to host | Agent 서버에 연결할 수 없음 | Agent 실행 시 `-Djava.rmi.server.hostname`에 적은 IP가 Controller에서 접속 가능한 IP인지 확인 |
| Port already in use | 포트가 이미 사용 중 | 다른 포트를 사용하거나 기존 프로세스 종료 |
| Cannot initialize RMI | RMI 설정 오류 | jmeter.properties의 RMI 설정 확인 및 방화벽 포트 개방 확인 |

### 8.2 연결 테스트

Agent 서버가 정상적으로 작동하는지 확인하려면 telnet으로 연결을 테스트할 수 있습니다.

```bash
telnet [Agent_IP] 1099
```

## 9. 실전 팁

- **Agent 성능 모니터링**: 각 Agent 서버의 CPU, 메모리 사용률을 모니터링하여 Agent 자체가 병목이 되지 않도록 주의합니다.
- **결과 파일 통합**: 여러 Agent에서 생성된 결과 파일을 하나로 합치려면 JMeter의 Merge Results 기능을 사용합니다.
- **보안 고려**: Production 환경에서는 SSL 설정을 활성화하고, 방화벽 규칙을 최소한으로 구성하는 것이 좋습니다.

이제 모든 설정이 완료되었습니다! Controller에서 `Remote Start All`을 눌러 분산 테스트를 시작해 보세요.