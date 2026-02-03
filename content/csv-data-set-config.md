# JMeter CSV Data Set Config 설정

CSV Data Set Config는 JMeter에서 '현실적인 부하'를 만들기 위해 가장 빈번하게 사용하는 설정 요소입니다. 앞서 만든 login_data.csv 같은 외부 파일을 읽어와서, 수많은 가상 사용자(Threads)에게 서로 다른 데이터를 골고루 나눠주는 역할을 합니다.

---

## Test Plan 구조 예시

```
Test Plan
├── 📂 CSV Data Set Config ← Thread Group 외부에 배치 (전역)
│   ├── Filename: login_data.csv
│   ├── Variable Names: USER_ID, USER_PW
│   ├── Ignore first line: True
│   ├── Delimiter: ,
│   ├── Recycle on EOF: True
│   └── Sharing mode: All threads
├── 👥 Thread Group (100 Users, Loop: 10)
│   ├── ⚙️ HTTP Request: 로그인
│   │   ├── Parameter: username = ${USER_ID} ← CSV 변수 사용
│   │   └── Parameter: password = ${USER_PW}
│   ├── ⚙️ HTTP Request: 상품 조회
│   └── ⚙️ HTTP Request: 장바구니
└── 📊 View Results Tree
```

**CSV 파일 예시 (login_data.csv):**
```
USER_ID,USER_PW
user001,pass001
user002,pass002
user003,pass003
...
```

**데이터 배분:**
- User 1 → user001, pass001
- User 2 → user002, pass002
- User 3 → user003, pass003

---

핵심 기능과 설정 옵션을 알기 쉽게 정리해 드릴게요.

## 1. 주요 설정 항목 (Field) 설명

JMeter에서 이 블록을 클릭하면 보이는 주요 필드들의 의미입니다.

| 설정 항목 | 설명 및 권장 설정 |
|-----------|-------------------|
| Filename | CSV 파일의 경로. (절대경로보다는 .jmx 파일과 같은 폴더에 두고 파일명만 쓰는 것이 관리하기 편합니다.) |
| File encoding | 보통 UTF-8을 사용합니다. 한글이 깨진다면 EUC-KR이나 MS949를 시도하세요. |
| Variable Names | CSV의 각 열에 부여할 변수명. (예: USER_ID,USER_PW) 쉼표로 구분합니다. |
| Ignore first line | 파일의 첫 줄이 데이터가 아닌 제목(Header)일 경우 True로 설정하여 건너뜁니다. |
| Delimiter | 데이터를 나누는 기준. 기본값은 쉼표(,)입니다. |
| Recycle on EOF? | 파일의 끝(End Of File)에 도달했을 때, 처음으로 돌아가 다시 읽을지 결정합니다. (True 권장) |
| Stop thread on EOF? | 파일 데이터를 다 쓰면 해당 가상 사용자를 중지시킬지 결정합니다. |
| Sharing mode | All threads: 모든 사용자가 파일을 공유하며 한 줄씩 순서대로 읽습니다. (가장 일반적) |

## 2. 데이터 배분 원리 (Multi-Threading)

JMeter는 가상 사용자가 요청을 보낼 때마다 CSV에서 다음 줄을 읽어 변수에 할당합니다.

- 사용자 A: 1행 데이터(${USER_ID}=user001)를 가지고 로그인 시도
- 사용자 B: 2행 데이터(${USER_ID}=user002)를 가지고 로그인 시도
- 사용자 C: 3행 데이터(${USER_ID}=user003)를 가지고 로그인 시도

이렇게 하면 100명의 사용자가 동시에 각기 다른 계정으로 로그인하는 현실적인 시나리오가 완성됩니다.

## 3. 실전 활용 팁

### ① 변수 사용법

CSV에서 정의한 변수 이름 앞뒤에 ${ }를 붙여 사용합니다.

예: HTTP Request의 Parameter 값에 ${USER_ID} 입력.

### ② 데이터의 정합성 (Scouter 연계)

CSV에 있는 ID들이 실제 DB에 존재하는 데이터여야 합니다. 만약 존재하지 않는 ID로 테스트하면 서버는 401 Unauthorized 에러를 내뱉을 것이고, Scouter에서는 비즈니스 로직(장바구니 담기 등)까지 도달하지 못하는 빈껍데기 테스트 결과만 보게 됩니다.

### ③ 성능 영향

CSV 파일이 너무 크면(몇십만 줄 이상) 읽어오는 과정에서 JMeter 자체에 부하가 갈 수 있습니다. t3.medium 사양에서 실습할 때는 적절히 몇 천 줄 이내로 구성하는 것이 좋습니다.

## 4. [심화] Sharing Mode의 차이

- **All threads**: 전체 사용자가 파일 하나를 두고 번호표 뽑듯 순서대로 읽음.
- **Current thread group**: 같은 그룹 내의 사용자들끼리만 순서 공유.
- **Current thread**: 각 사용자마다 파일을 처음부터 따로 읽음 (모든 사용자가 같은 순서로 데이터를 쓰게 됨 - 비권장).