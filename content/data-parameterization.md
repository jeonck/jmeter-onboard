# JMeter 테스트 데이터 치환 (Data Parameterization)

현실적인 부하 테스트에서 **테스트 데이터 치환(Data Parameterization)**이란, 매번 똑같은 값으로 요청을 보내는 것이 아니라 실제 사용자처럼 다양하고 가변적인 데이터를 사용하여 테스트를 수행하는 기법을 말합니다.

---

## Test Plan 구조 예시

```
Test Plan
├── 📝 User Defined Variables
│   ├── SERVER_IP = 13.125.xxx.xxx
│   └── SERVER_PORT = 8080
├── 📂 CSV Data Set Config ← 외부 데이터 파일 연결
│   ├── Filename: users.csv
│   ├── Variable Names: USER_ID, USER_PW
│   └── Sharing Mode: All Threads
├── 👥 Thread Group (100 Users)
│   ├── ⚙️ HTTP Request: 로그인
│   │   ├── Server: ${SERVER_IP}
│   │   ├── Parameter: username = ${USER_ID} ← CSV에서 읽은 값
│   │   └── Parameter: password = ${USER_PW}
│   ├── ⚙️ HTTP Request: 상품 조회
│   │   └── Parameter: product_id = ${__Random(1,1000)} ← 랜덤 함수
│   └── ⚙️ HTTP Request: 장바구니
│       └── Parameter: order_id = ${__UUID} ← 고유값 생성
└── 📊 Summary Report
```

**데이터 소스별 사용:**
- `${USER_ID}`: CSV 파일에서 순차 읽기
- `${__Random(1,1000)}`: 1~1000 랜덤 숫자
- `${__UUID}`: 고유 ID 자동 생성

---

예를 들어, 100명의 가상 사용자가 모두 test01이라는 아이디 하나로 동시에 로그인을 시도한다면, 이는 실제 상황과 다를 뿐더러 DB 캐시나 락(Lock) 때문에 왜곡된 결과가 나올 수 있습니다.

## 1. 왜 데이터 치환이 필수적인가요?

- **캐시(Cache) 효과 방지**: 동일한 상품 ID만 계속 조회하면 서버나 DB의 메모리 캐시 덕분에 속도가 비정상적으로 빠릅니다. 현실은 수만 명의 사용자가 각기 다른 상품을 봅니다.
- **데이터 무결성 및 제약 조건**: '장바구니 담기'나 '회원가입'처럼 DB에 쓰기(Insert)가 발생하는 경우, 중복된 ID나 데이터는 에러를 유발합니다.
- **현실적인 부하 분산**: DB 인덱스가 타지 않는 검색어나 아주 무거운 쿼리를 유발하는 데이터를 섞어 넣어야 시스템의 진정한 한계를 알 수 있습니다.

## 2. JMeter에서 데이터를 치환하는 주요 도구

### ① CSV Data Set Config (가장 많이 사용)

외부 CSV 파일에 테스트 데이터를 미리 준비해두고, JMeter가 한 줄씩 읽어서 변수로 할당하는 방식입니다.

- **준비물**: users.csv (아이디, 비밀번호가 담긴 파일)
- **설정**: Variable Names에 USER_ID, USER_PW 입력.
- **사용**: 요청 본문에 ${USER_ID} 처럼 변수 형태로 입력.

### ② User Defined Variables (UDV)

테스트 계획 전체에서 공통으로 사용할 고정된 변수(서버 IP, 포트 등)를 정의할 때 사용합니다.

### ③ Random Variable / Functions

- **Random Variable**: 특정 범위 내의 숫자를 무작위로 생성합니다. (예: 상품 번호 1~5000번 무작위 호출)
- **Functions**: ${__UUID} (고유 아이디 생성), ${__time} (현재 시간) 등 JMeter 내장 함수를 사용해 동적인 값을 만듭니다.

## 3. Scouter와 연계한 데이터 분석

데이터 치환을 적용한 상태로 테스트를 돌리면서 Scouter를 보면 시스템의 민낯이 드러납니다.

- **XLog 분석**: 특정 아이디나 특정 상품 조회 시에만 유독 응답 시간이 길게 찍히는 '튀는 점'을 발견할 수 있습니다.
- **SQL 분석**: 데이터 치환을 통해 다양한 쿼리가 발생할 때, 어떤 조건(Where절)에서 풀 스캔(Full Scan)이 발생하는지 실시간으로 포착할 수 있습니다.

## 4. 실무적인 데이터 준비 팁

| 구분 | 치환 대상 | 준비 방법 |
|------|-----------|------------|
| 로그인 | ID, Password | DB에서 기존 회원 정보를 추출하여 CSV 생성 |
| 검색/조회 | 검색어, 상품 카테고리 | 인기 키워드 및 비인기 키워드를 섞어서 구성 |
| 등록/수정 | 게시글 제목, 본문 | 변수를 조합하거나 난수 함수를 사용하여 중복 방지 |