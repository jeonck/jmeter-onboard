# Scouter 도구 소개 및 설치/구동 방법

JMeter와 함께 사용되는 Scouter는 서버의 성능을 실시간으로 모니터링하는 도구입니다. JMeter로 부하를 주는 동안 Scouter를 통해 서버 내부의 CPU, 메모리, 느린 DB 쿼리, 소스 코드 병목 등을 실시간으로 관찰할 수 있어, 성능 병목 지점을 정확히 파악할 수 있습니다.

## 1. Scouter란?

Scouter는 오픈소스 APM(Application Performance Management) 도구로, Java 애플리케이션의 성능을 모니터링하는 데 특화되어 있습니다.

### 주요 기능
- **XLog (엑스로그)**: 개별 요청의 처리 과정을 점으로 표시하여, 어떤 요청이 유독 오래 걸리는지 시각적으로 보여줍니다.
- **Heap Memory 모니터링**: 서버의 메모리 사용량을 실시간으로 확인하여 GC(Garbage Collection) 발생 여부를 파악할 수 있습니다.
- **SQL 추적**: 느린 SQL 쿼리를 감지하고, 어떤 쿼리가 병목을 일으키는지 확인할 수 있습니다.
- **서비스 덤프**: 현재 서버에서 어떤 소스 코드 라인이 실행 중인지 스냅샷을 찍어 병목 지점을 찾습니다.

## 2. Scouter 구성 요소

Scouter는 다음과 같은 3가지 구성 요소로 이루어져 있습니다:

- **Scouter Server (Collector)**: 서버에서 수집된 성능 데이터를 수집하고 저장하는 역할
- **Scouter Agent (Java Agent)**: 모니터링 대상 서버(WAS)에 설치되어 성능 데이터를 수집하는 역할
- **Scouter Client (Viewer)**: 수집된 데이터를 시각적으로 보여주는 데스크탑 애플리케이션

## 3. Scouter Server 설치 (Linux 환경)

Scouter Server는 모니터링 대상 서버에서 수집된 데이터를 수신하는 역할을 합니다.

### 설치 절차

1. **Scouter 다운로드**
   - 공식 GitHub 저장소에서 최신 버전을 다운로드합니다.
   - `wget https://github.com/scouter-project/scouter/releases/download/v{version}/scouter-{version}.tar.gz`

2. **압축 해제**
   ```bash
   tar -xzf scouter-{version}.tar.gz
   cd scouter-{version}
   ```

3. **서버 실행**
   ```bash
   cd server/bin
   ./startup.sh
   ```
   
   기본 포트는 6100(TCP/UDP)입니다.

4. **서버 설정 확인**
   - `conf/scouter.conf` 파일에서 포트 및 기타 설정을 변경할 수 있습니다.
   - `netstat -tulnp | grep 6100` 명령으로 포트가 열려 있는지 확인합니다.

## 4. Scouter Agent 설치 (Linux WAS 서버)

Scouter Agent는 모니터링 대상 WAS에 설치되어 성능 데이터를 수집합니다.

### 설치 절차

1. **Agent 파일 위치 확인**
   - Scouter 설치 폴더의 `lib` 디렉토리에 `scouter.agent.java.jar` 파일이 있습니다.

2. **Tomcat 연동 설정**
   - Tomcat의 `bin/catalina.sh` 파일 최상단에 다음 옵션을 추가합니다:
   ```bash
   export CATALINA_OPTS="$CATALINA_OPTS -javaagent:/path/to/scouter/agent/java/scouter.agent.java.jar"
   export CATALINA_OPTS="$CATALINA_OPTS -Dscouter.config=/path/to/scouter/agent/java/conf/scouter.conf"
   ```

3. **Spring Boot 애플리케이션 연동**
   - 애플리케이션 실행 시 다음 옵션을 추가합니다:
   ```bash
   java -javaagent:/path/to/scouter.agent.java.jar -Dscouter.config=/path/to/scouter.conf -jar your-application.jar
   ```

4. **Agent 설정 파일**
   - `conf/scouter.conf` 파일에서 서버 주소 및 포트를 설정합니다:
   ```
   net_collector_ip=SCOUTER_SERVER_IP
   net_collector_udp_port=6100
   net_collector_tcp_port=6100
   ```

## 5. Scouter Client 설치 (Windows 환경)

Scouter Client는 수집된 데이터를 시각적으로 보여주는 데스크탑 애플리케이션입니다.

### 설치 절차

1. **Client 다운로드**
   - 공식 GitHub 저장소에서 Client 버전을 다운로드합니다.
   - Windows용 ZIP 파일을 다운로드하여 압축을 해제합니다.

2. **Client 실행**
   - `scouter.exe` 파일을 실행합니다.
   - 처음 실행 시 workspace 설정이 필요합니다.

3. **서버 연결 설정**
   - 실행 후, 서버 주소(EC2의 퍼블릭 IP)와 포트(6100)를 입력하여 Scouter Server에 접속합니다.

4. **대시보드 구성**
   - 연결이 성공하면 서버의 자원(CPU, Memory 그래프)이 정상적으로 잡히는지 확인합니다.

## 6. JMeter와 Scouter 연동 테스트

### 테스트 절차

1. **Scouter Server 및 Agent 실행**
   - 모니터링 대상 서버에 Agent가 정상적으로 동작 중인지 확인합니다.

2. **Scouter Client 연결 확인**
   - Windows PC에서 Client를 실행하여 Server에 접속합니다.

3. **JMeter 테스트 실행**
   - JMeter에서 부하 테스트를 시작합니다.

4. **실시간 모니터링**
   - JMeter: 응답 시간(Response Time)과 에러율 확인
   - Scouter: XLog 차트에 점이 찍히는 것을 확인하고, 유독 높게 찍히는 점(느린 요청)을 드래그하여 SQL 쿼리 병목이나 Java 메서드 지연을 분석합니다.

## 7. 주요 팁

- **보안 그룹 설정**: EC2 인스턴스의 보안 그룹에서 Scouter 통신 포트(6100 TCP/UDP)가 열려 있어야 합니다.
- **Agent 로그 확인**: 문제가 발생하면 `scouter-agent.log` 파일을 확인하여 에러 원인을 파악합니다.
- **성능 영향**: Scouter Agent는 최소한의 오버헤드로 동작하지만, 매우 민감한 성능 테스트에서는 영향을 줄 수 있으므로 테스트 환경에 따라 조정이 필요합니다.

## 8. 문제 해결

- **서버에 연결되지 않을 때**: 방화벽 설정 및 포트 6100이 열려 있는지 확인합니다.
- **데이터가 수신되지 않을 때**: Agent의 설정 파일에서 Server IP 주소가 정확한지 확인합니다.
- **성능 저하 발생 시**: Agent의 샘플링 주기를 조정하거나 일부 기능을 비활성화할 수 있습니다.