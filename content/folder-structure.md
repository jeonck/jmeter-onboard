# JMeter Folder Structure

JMeter를 설치하고 압축을 풀면 여러 폴더가 나오는데, 실습 중에 주로 들어가게 될 폴더는 **딱 3개(bin, lib, extras)**로 압축됩니다.

구조를 미리 파악해두면 나중에 플러그인을 추가하거나 에러 로그를 확인할 때 훨씬 수월합니다.

## 📂 JMeter Main Folder Structure

```
apache-jmeter-[version]/
├── bin/           # 실행 파일, 설정 파일, 로그 파일 (가장 많이 방문)
├── docs/          # 오프라인 도움말 (API 문서)
├── extras/        # Ant, 젠킨스 연동 등 부가 기능 관련
├── lib/           # 라이브러리 (JDBC 드라이버 등 jar 파일 배치)
│   └── ext/       # 플러그인 전용 폴더
├── licenses/      # 라이선스 정보
└── printable_docs/ # 인쇄용 문서
```

## 1. bin/ Folder (Center of Operations)

실습하면서 가장 자주 열게 될 폴더입니다.

- **jmeter.bat (윈도우)**: JMeter GUI를 실행하는 파일입니다.
- **jmeter.sh (리눅스/맥)**: 리눅스 환경에서 실행할 때 사용합니다.
- **jmeter.properties**: JMeter의 전반적인 환경 설정 파일입니다. (언어 변경, 로그 레벨 설정 등)
- **user.properties**: 사용자가 커스텀하게 설정을 덮어쓸 때 권장되는 파일입니다.
- **jmeter.log**: 실행 중 에러가 나면 원인을 찾기 위해 반드시 확인해야 하는 로그 파일입니다.

## 2. lib/ Folder (Extensibility)

JMeter가 외부 시스템(DB 등)과 통신하기 위한 "부품"을 넣는 곳입니다.

- **JDBC 드라이버**: 이번 실습에서 MySQL을 쓰신다면, MySQL 커넥터(mysql-connector-java.jar)를 이 lib 폴더에 복사해 넣어야 JMeter가 DB에 직접 쿼리를 날릴 수 있습니다.
- **ext/ 하위 폴더**: JMeter 플러그인 매니저나 커스텀 그래프 같은 플러그인들을 설치할 때 이 폴더에 넣습니다.

## 3. extras/ Folder

실무에서 Jenkins(젠킨스) 같은 CI/CD 도구와 연동하여 자동화 테스트를 구축할 때 필요한 파일들이 들어있습니다. 초반 실습 단계에서는 크게 건드릴 일이 없습니다.

## 💡 Practice Tips

- **바로가기 만들기**: bin/jmeter.bat 파일을 바탕화면에 바로가기로 만들어 두면 편합니다.
- **환경 변수**: 시스템 환경 변수 Path에 이 bin 폴더 경로를 등록해두면, 터미널(CMD) 어디서든 jmeter라고 입력해 실행할 수 있습니다.
- **로그 확인**: 테스트 중에 "왜 요청이 안 나가지?" 싶을 때는 bin/jmeter.log 파일을 메모장으로 열어보세요.