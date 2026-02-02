# JMeter Correlation (연관성 처리)

JMeter에서 **Correlation(연관성 처리)**이란, 서버가 보낸 동적인 값(세션 ID, 인증 토큰, 보안 키 등)을 추출하여 다음 요청에 다시 실어 보내는 과정을 말합니다.

웹 서비스(특히 로그인이나 결제)는 보안과 상태 유지를 위해 매번 바뀌는 값을 요구하기 때문에, 레코딩된 고정된 값을 그대로 쓰면 반드시 에러가 납니다. 이를 해결하는 표준 절차를 정리해 드립니다.

## 1. Correlation 처리의 4단계 프로세스

이 과정은 **"추출해서 변수에 담고, 그 변수를 사용한다"**는 논리로 움직입니다.

### ① 대상 찾기 (Identify)

레코딩된 시나리오를 실행했을 때 View Results Tree에서 첫 번째 요청은 성공인데 두 번째(로그인 등)부터 에러가 난다면 Correlation이 필요한 지점입니다.

보통 서버 응답 본문(Response Body)이나 헤더(Header)에 담겨 옵니다. (예: jsessionid, csrf_token, authorization)

### ② 추출기 설정 (Extract)

서버가 보낸 값을 낚아채기 위해 'Post Processor'를 사용합니다.

- **JSON Extractor**: 응답이 JSON 형식일 때 사용 (API 서버 테스트 시 추천)
- **Regular Expression Extractor**: HTML 본문에서 특정 텍스트를 찾을 때 사용
- **Boundary Extractor**: 시작과 끝 문자가 명확할 때 가장 간편하게 추출

### ③ 변수 확인 (Verify)

추출한 값이 변수에 잘 담겼는지 확인하기 위해 Debug Sampler를 추가합니다. 테스트를 돌린 후 View Results Tree에서 Debug Sampler를 클릭하면, 내가 만든 변수명에 실시간으로 바뀐 값이 들어있는지 확인할 수 있습니다.

### ④ 값 치환 (Replace)

이제 다음 요청(HTTP Request)으로 가서, 하드코딩된 고정값 대신 변수명 ${변수명}을 입력합니다.

## 2. 주요 추출 도구 활용법

### JSON Extractor (추천)

최근의 많은 웹 서비스가 JSON을 사용하므로 가장 활용도가 높습니다.

- Names of created variables: myToken
- JSON Path expressions: $.data.token
- Match No.: 1 (첫 번째 값을 가져옴)

### Regular Expression Extractor (만능)

HTML 내의 복잡한 값을 가져올 때 유용합니다.

- Reference Name: token
- Regular Expression: name="csrf_token" value="(.+?)"
- Template: $1$

## 3. 실습 예시: 로그인 후 장바구니 담기

1. **로그인 요청**: 서버가 응답으로 {"sessionId": "A1B2C3"}를 보냅니다.
2. **로그인 요청 아래**: JSON Extractor를 추가하여 sessionId를 변수 SID에 저장합니다.
3. **장바구니 담기 요청**: 파라미터나 헤더에 session_id 값을 ${SID}로 바꿉니다.
4. **결과**: 매번 실행할 때마다 서버가 새로 발급한 ID를 물고 들어가므로 테스트가 성공합니다.

## 💡 Scouter와 함께 분석하기

Correlation 처리가 잘못되면 서버는 401(Unauthorized) 혹은 403(Forbidden) 에러를 뱉습니다.

이때 Scouter XLog를 보면, 비즈니스 로직(Service)까지 진입하지 못하고 필터나 보안 계층에서 요청이 튕겨 나가는 것을 확인할 수 있습니다.

정상적으로 처리되었다면, Scouter에서 해당 세션 ID를 기반으로 사용자의 트랜잭션 경로를 추적할 수 있게 됩니다.