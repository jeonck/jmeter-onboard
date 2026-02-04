# Firefox를 활용한 JMeter HTTPS 레코딩

Firefox는 다른 브라우저(Chrome, Edge)와 달리 OS의 인증서 저장소를 공유하지 않고 자체적인 인증서 저장소를 사용하기 때문에 설정 방식이 조금 다릅니다.

Firefox를 이용한 JMeter HTTPS 레코딩 절차를 4단계로 완벽하게 정리해 드립니다.

## 1. JMeter 인증서 생성 (준비)

레코딩을 시작하기 전, JMeter가 사용할 임시 인증서를 먼저 만들어야 합니다.

1. JMeter를 실행하고 HTTP(S) Test Script Recorder를 선택합니다.
2. 하단의 [Start] 버튼을 클릭합니다.
3. "Root CA certificate: ApacheJMeterTemporaryRootCA.crt created in JMeter bin directory"라는 팝업이 뜨면 성공입니다.
4. 인증서 위치: JMeter 설치 경로의 /bin 폴더 안에 해당 .crt 파일이 생성됩니다.

## 2. Firefox에 JMeter 인증서 등록

Firefox 내부 저장소에 이 인증서를 '신뢰할 수 있는 기관'으로 등록해야 보안 경고 없이 HTTPS 사이트에 접속할 수 있습니다.

1. Firefox 주소창에 about:preferences를 입력하거나 설정(Settings) 메뉴로 들어갑니다.
2. 왼쪽 메뉴에서 **개인 정보 및 보안(Privacy & Security)**을 클릭합니다.
3. 맨 아래로 내려가 인증서(Certificates) 섹션에서 **인증서 보기(View Certificates...)**를 클릭합니다.
4. 인증 기관(Authorities) 탭을 선택하고 하단의 **가져오기(Import...)**를 누릅니다.
5. JMeter의 /bin 폴더에 생성된 ApacheJMeterTemporaryRootCA.crt 파일을 선택합니다.
6. "이 인증 기관을 신뢰하여 웹 사이트를 식별함(Trust this CA to identify websites)" 체크박스에 반드시 체크한 후 확인을 누릅니다.

## 3. Firefox 네트워크 프록시 설정

Firefox의 모든 트래픽이 JMeter를 거쳐가도록 프록시를 설정합니다.

1. Firefox 설정 검색창에 **"proxy"**를 입력하거나, **일반(General) > 네트워크 설정(Network Settings) > 설정(Settings...)**을 클릭합니다.
2. **수동 프록시 설정(Manual proxy configuration)**을 선택합니다.
3. HTTP 프록시: localhost (또는 127.0.0.1) 입력
4. 포트: JMeter의 Script Recorder에 설정된 포트 번호(기본값 8888) 입력
5. "HTTPS에도 이 프록시를 사용(Also use this proxy for HTTPS)" 항목에 체크합니다.
6. 확인을 눌러 설정을 완료합니다.

## 4. 레코딩 수행

1. Firefox 주소창에 테스트할 HTTPS 주소를 입력하고 이동합니다.
2. JMeter의 Recording Controller 안에 브라우저에서 발생하는 요청(Sampler)들이 실시간으로 기록되는지 확인합니다.
3. 시나리오가 끝나면 JMeter에서 **[Stop]**을 누르고, Firefox의 프록시 설정을 다시 **"시스템 프록시 사용"**으로 되돌립니다.

## 💡 주의사항 및 팁

- **인증서 만료**: JMeter 인증서는 생성 후 7일간만 유효합니다. 일주일이 지나면 Firefox에서 기존 인증서를 삭제하고, /bin 폴더의 파일을 지운 뒤 다시 생성해서 등록해야 합니다.
- **HSTS 에러**: 특정 사이트가 보안 정책(HSTS) 때문에 접속이 막힌다면, Firefox 주소창에 about:config를 입력하고 network.stricttransportsecurity.preloadlist를 false로 임시 변경해 보세요.