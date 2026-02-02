# JMeter 레코딩 기능 활용

JMeter의 레코딩(Recording) 기능은 하나씩 블록을 쌓는 수고를 덜어주는 매우 강력한 도구입니다. 웹 브라우저에서 내가 직접 쇼핑몰을 이용(메인 -> 로그인 -> 장바구니)하면, JMeter가 그 사이의 통신을 낚아채서 자동으로 스크립트를 생성해 줍니다.

이때 핵심 기술이 바로 프록시 서버(Proxy Server) 설정입니다.

## 1. 레코딩의 원리 (프록시 서버)

중간에서 편지를 가로채 복사본을 만드는 '중계인'을 세운다고 생각하면 쉽습니다.

- 브라우저: "네이버(서버)로 이 데이터를 보내줘!"
- JMeter 프록시: "잠깐, 내가 중간에서 그 데이터를 기록하고 서버로 전달해줄게."

## 2. JMeter 레코딩 설정 순서

### ① JMeter 설정 (중계인 준비)

- Test Plan 우클릭 > Add > Non-Test Elements > HTTP(S) Test Script Recorder 추가.
- Port: 기본값 8888 (다른 프로그램과 겹치지 않으면 그대로 둡니다).
- Target Controller: 기록된 블록들이 저장될 위치를 선택합니다 (보통 Test Plan > Thread Group 선택).
- Requests Filtering (중요): 
  - 웹페이지에는 이미지(.png, .jpg), 광고, 폰트 등 불필요한 요청이 많습니다.
  - URL Patterns to Exclude 탭에서 Add suggested excludes 버튼을 눌러 정적인 파일들을 제외해야 깨끗한 시나리오가 나옵니다.

### ② 윈도우/브라우저 설정 (중계인에게 데이터 보내기)

브라우저의 트래픽이 JMeter를 거쳐가도록 길을 바꿔줘야 합니다.

- 윈도우 설정: '프록시 설정' 검색 -> '수동 프록시 설정' 켬.
- 주소: localhost (또는 127.0.0.1) / 포트: 8888 입력 후 저장.
- Tip: 브라우저 전용 플러그인(FoxyProxy 등)을 쓰면 더 편하게 켜고 끌 수 있습니다.

## 3. 실무 레코딩 꿀팁

### HTTPS 보안 인증서 설치

요즘 대부분의 사이트는 HTTPS를 씁니다. 인증서가 없으면 브라우저에서 "연결이 안전하지 않음" 에러가 납니다.

- JMeter에서 Start 버튼을 한 번 누르면 bin 폴더 내에 ApacheJMeterTemporaryRootCA.crt 파일이 생성됩니다.
- 이 파일을 브라우저 설정(인증서 관리)에서 신뢰할 수 있는 루트 인증 기관으로 가져오기 해야 정상적으로 레코딩이 가능합니다.

### Transaction Controller 활용

레코딩 화면의 Transaction Name 입력창에 'Login', 'AddToCart' 등을 입력하면서 브라우저를 클릭해 보세요. JMeter가 요청들을 이름별로 예쁘게 그룹화해줍니다.

## 4. 레코딩 후 해야 할 일 (Post-Recording)

레코딩으로 만든 스크립트는 **'반쪽짜리'**입니다. 그대로 실행하면 백퍼센트 실패합니다. 그 이유는 동적 값 때문입니다.

- **Correlation (연관성)**: 로그인할 때마다 바뀌는 토큰이나 세션 ID는 레코딩 당시의 값으로 고정되어 있습니다.
- **해결**: 이 고정된 값을 ${variable} 형태의 변수로 바꾸고, Regular Expression Extractor 같은 블록을 추가해 실시간으로 값을 받아오도록 수정해야 합니다.