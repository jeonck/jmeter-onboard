# Setup Guide

## EC2 서버 설정 (Target Server)

가장 먼저 쇼핑몰 서버가 돌아갈 EC2 인스턴스를 준비합니다.

### ① 환경 설치 (Java 17 & Tomcat 9 & MySQL)

- **Java 17**: `sudo apt update && sudo apt install openjdk-17-jdk`
- **Tomcat 9**: 공식 홈페이지에서 tar.gz 다운로드 후 `/usr/local/tomcat9`에 압축 해제
- **MySQL**: `sudo apt install mysql-server` 후 쇼핑몰 데이터(SQL) 로딩
  ```bash
  mysql -u [user] -p [database_name] < shopping_mall_data.sql
  ```

### ② Scouter Server & Agent 설정

Scouter는 데이터를 수집하는 Collector와 데이터를 보내는 Agent로 나뉩니다.

- **Collector(Server)**: EC2 내 적당한 폴더에 Scouter를 다운로드하고 startup.sh를 실행합니다. (기본 포트 6100)
- **Java Agent**: scouter.agent.java.jar 파일 위치를 확인합니다.
- **Tomcat 연동**: bin/catalina.sh 파일 최상단에 아래 옵션을 추가해야 Scouter가 Tomcat 내부를 들여다볼 수 있습니다.

```bash
export CATALINA_OPTS="$CATALINA_OPTS -javaagent:/path/to/scouter/agent.java/scouter.agent.java.jar"
export CATALINA_OPTS="$CATALINA_OPTS -Dscouter.config=/path/to/scouter/agent.java/conf/scouter.conf"
```

## 윈도우 로컬 설정 (Tester PC)

부하를 쏘는 JMeter와 모니터링 화면을 보는 Scouter Client를 설정합니다.

### ① Java 및 환경 변수

- **JAVA_HOME**: C:\Program Files\Java\jdk-17 (본인 경로)
- **Path**: `%JAVA_HOME%\bin` 추가
- **확인**: 터미널에서 `java -version` 입력 시 17 버전이 나와야 합니다.

### ② JMeter 설치

- Binaries(.zip) 파일을 다운로드하여 압축을 풉니다.
- bin/jmeter.bat을 실행하여 GUI 모드로 진입합니다.

### ③ Scouter Client (Viewer)

Scouter 시각화 도구(Client)를 설치하고 실행합니다.

- **Server Address**: EC2의 퍼블릭 IP와 포트(6100)를 입력하여 접속합니다.

## 부하 테스트 시나리오 흐름

환경 구축이 끝났다면 다음 순서로 실습을 진행하세요.

1. **Scouter 연결 확인**: 윈도우 클라이언트에서 EC2 서버의 자원이 정상적으로 잡히는지(CPU, Memory 그래프) 확인합니다.
2. **JMeter 시나리오 작성**:
   - Thread Group: 가상 사용자 수(VU)와 Ramp-up 기간 설정
   - HTTP Request: 쇼핑몰의 메인 페이지 또는 상품 리스트 조회 API 설정
3. **테스트 실행**: JMeter에서 'Start' 버튼을 클릭합니다.
4. **실시간 모니터링**:
   - JMeter: 응답 시간(Response Time)과 에러율 확인
   - Scouter: XLog 차트에 점이 찍히는 것을 확인하고, 유독 높게 찍히는 점(느린 요청)을 드래그하여 SQL 쿼리 병목이나 Java 메서드 지연을 분석합니다.

## ⚠️ 주의사항 (트러블슈팅)

- **보안 그룹 (Security Group)**: EC2 인스턴스의 보안 그룹에서 **JMeter가 찌를 포트(8080)**와 **Scouter 통신 포트(6100 TCP/UDP)**가 열려 있어야 합니다.
- **DB 커넥션**: 부하가 높아질 때 Too many connections 에러가 난다면 Scouter에서 DB Connection Pool 수치를 모니터링해 보세요.