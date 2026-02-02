# JMeter 설치 프로세스

JMeter는 자바(Java) 기반의 애플리케이션이기 때문에 설치 과정이 매우 단순합니다. 별도의 설치 마법사(next 버튼 연타) 없이, 압축을 풀고 실행하는 '무설치형(Portable)' 방식입니다.

준비하신 윈도우(로컬 PC) 환경에 맞춰 3단계로 나누어 설명해 드릴게요.

## 1. 사전 준비: Java(JDK) 설치

JMeter는 Java 위에서 돌아갑니다. Java 17을 사용하기로 하셨으므로, 이미 설치되어 있다면 이 단계는 건너뛰셔도 됩니다.

- **설치 확인**: 터미널(CMD)에서 `java -version`을 입력합니다.
- **환경 변수 설정**: 
  - JAVA_HOME: C:\Program Files\Java\jdk-17 (본인의 설치 경로)
  - Path: %JAVA_HOME%\bin 추가

## 2. JMeter 다운로드 및 압축 해제

- JMeter 공식 홈페이지에 접속합니다.
- Binaries 항목에서 apache-jmeter-5.x.zip 파일을 다운로드합니다. (Source 파일이 아님에 주의하세요!)
- 원하는 위치(예: C:\jmeter)에 압축을 풉니다.
- Tip: 경로에 한글이나 공백이 있으면 가끔 에러가 날 수 있으니 가급적 영문 폴더명을 추천합니다.

## 3. 실행 및 초기 설정

### ① 실행하기

- 압축 푼 폴더의 bin 폴더로 이동합니다.
- jmeter.bat 파일을 더블 클릭하여 실행합니다. (잠시 검은색 CMD 창이 떴다가 JMeter GUI 화면이 나타납니다.)

### ② 테마 및 언어 변경 (선택 사항)

- 처음 실행 시 화면이 너무 어둡거나 밝다면: 상단 메뉴 Options > Look and Feel에서 테마를 바꿀 수 있습니다.
- 한국어가 편하시다면: Options > Choose Language > Korean을 선택하세요.

## 4. [중요] MySQL JDBC 드라이버 배치

지금 실습 환경에 MySQL이 포함되어 있으므로, JMeter가 DB와 통신할 수 있게 전용 드라이버를 넣어줘야 합니다.

- MySQL Connector/J 사이트에서 Platform Independent 버전을 다운로드합니다.
- 압축 파일 안의 mysql-connector-j-x.x.x.jar 파일을 복사합니다.
- JMeter의 lib 폴더 안에 붙여넣기 합니다.
- JMeter를 재시작합니다. (재시작해야 라이브러리를 인식합니다.)

## 5. 설치 확인 테스트

설치가 잘 되었는지 확인하려면 다음 블록들을 순서대로 추가해 보세요.

- Test Plan 우클릭 > Add > Threads (Users) > Thread Group
- Thread Group 우클릭 > Add > Sampler > HTTP Request
- HTTP Request 우클릭 > Add > Listener > View Results Tree

이제 상단의 초록색 화살표(Start)를 눌렀을 때, 우측 상단의 숫자가 변하며 실행된다면 모든 준비가 끝난 것입니다!