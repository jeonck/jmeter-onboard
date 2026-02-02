# JMeter 로그인 데이터 CSV 파일 작성

현실적인 부하 테스트를 위해 작성하는 로그인 데이터 CSV 파일은 단순히 아이디와 비밀번호만 넣는 것이 아니라, **테스트 목적(성공/실패 케이스 분리)**에 따라 구성하는 것이 좋습니다.

실제 실습에 바로 활용하실 수 있도록 login_data.csv 예시 파일을 작성해 드립니다.

## 1. 현실적인 CSV 파일 예시 (login_data.csv)

이 파일은 메모장이나 엑셀에서 작성한 뒤 반드시 CSV(쉼표로 구분) 형식으로 저장해야 합니다.

```
# 아이디,비밀번호,테스트유형,메모
user001,pass1234,SUCCESS,일반사용자_01
user002,pass1234,SUCCESS,일반사용자_02
vip_member,vip777,SUCCESS,우수회원_할인적용대상
wrong_user,1111,FAIL,존재하지않는_아이디
user001,wrong_pass,FAIL,비밀번호_오류_케이스
admin_01,admin!@#$,SUCCESS,관리자_권한_테스트
```

## 2. CSV 파일 구성의 '현실적' 포인트

- **다양한 계정 상태**: 모두 성공하는 데이터만 넣지 말고, **실패 케이스(오타, 탈퇴 계정 등)**를 1~5% 정도 섞어주어야 서버의 예외 처리 로직(Exception Handling)에 대한 부하도 측정할 수 있습니다.

- **권한별 분리**: 일반 유저와 관리자(또는 VIP)는 로그인 후 불러오는 데이터의 양이나 쿼리가 다를 수 있습니다. 이를 통해 Scouter에서 권한별 쿼리 성능 차이를 모니터링하기 좋습니다.

- **데이터 양**: 100명이 테스트한다면 최소 100줄 이상의 중복되지 않은 아이디를 준비하는 것이 좋습니다. (DB 인덱스 활용 여부를 정확히 판단하기 위함)

## 3. JMeter 적용 방법 (CSV Data Set Config 설정)

CSV 파일을 준비했다면 JMeter에서 다음과 같이 연결합니다.

- Add > Config Element > CSV Data Set Config 추가.
- Filename: C:\\path\\to\\login_data.csv (또는 상대 경로)
- Variable Names: USER_ID,USER_PW,EXPECTED_RESULT,REMARK
- 파일의 첫 줄이 헤더가 아니라면 순서대로 적어줍니다.
- Delimiter: , (쉼표)

## 4. HTTP Request에서 변수 사용법

로그인 샘플러(HTTP Request)의 파라미터 창에 고정된 값 대신 변수를 입력합니다.

- username: ${USER_ID}
- password: ${USER_PW}

## 💡 Scouter와 연계한 심화 실습 팁

CSV 파일에 REMARK 컬럼을 넣은 이유는 나중에 분석을 위해서입니다.

- **성공 케이스**: Scouter XLog에서 정상적인 응답 시간 분포를 확인합니다.
- **실패 케이스**: 잘못된 비번으로 로그인 시 DB에서 사용자 조회 후 비밀번호 비교 로직이 얼마나 CPU를 점유하는지, 혹은 반복적인 로그인 실패 시 계정 잠금(Lock) 처리가 발생하며 DB 부하가 생기는지 감시할 수 있습니다.