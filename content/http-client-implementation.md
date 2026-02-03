# JMeter HTTP Request Defaults - Client Implementation

JMeter의 HTTP Request Defaults에서 Advanced 탭에 있는 Client Implementation 옵션은 "어떤 엔진(라이브러리)을 사용하여 HTTP 요청을 처리할 것인가?"를 결정하는 설정입니다.

이 옵션에 따라 성능, 메모리 효율, 그리고 지원하는 기능(쿠키 처리, 타임아웃 등)이 달라지기 때문에 부하 테스트의 성격에 맞춰 선택해야 합니다.

## 1. 주요 옵션 설명

### ① HttpClient4 (기본값 / 권장)

Apache HttpClient 4.x 라이브러리를 사용합니다.

- **특징**: 가장 현대적이고 기능이 풍부합니다. Connection Pooling, Cookie 관리, 다양한 인증 방식을 완벽하게 지원합니다.
- **장점**: 대부분의 웹 애플리케이션 테스트에 최적화되어 있으며, 특히 Keep-Alive 연결 유지가 뛰어나 포트 고갈(Address already in use) 문제를 줄여줍니다.
- **추천**: 일반적인 모든 부하 테스트에서 이 옵션을 사용하세요.

### ② Java (Native)

Java JVM에서 제공하는 표준 HTTP 라이브러리(HttpURLConnection)를 사용합니다.

- **특징**: 외부 라이브러리 의존성 없이 가볍습니다.
- **단점**: 기능이 제한적입니다. 특히 연결 재사용이나 세밀한 타임아웃 설정이 HttpClient4보다 성능이 떨어질 수 있습니다.
- **추천**: 매우 가벼운 부하로 단순한 URL 호출만 할 때, 혹은 특정 Java 버전의 고유한 HTTP 동작을 테스트해야 할 때만 사용합니다.

## 2. 왜 HttpClient4를 써야 하나요?

부하 테스트는 단순히 요청을 보내는 것을 넘어 **"실제 브라우저처럼 행동"**해야 합니다. HttpClient4는 다음과 같은 강점을 가집니다.

- **커넥션 관리**: 매번 연결을 새로 맺지 않고 유지(Keep-Alive)하는 능력이 탁월하여 t3.medium 같은 서버에 불필요한 핸드셰이크 부하를 주지 않습니다.
- **Retry 정책**: 서버 응답 지연 시 재시도(Retry) 여부를 세밀하게 제어할 수 있습니다.
- **속도 및 안정성**: 대규모 동시 접속자(Thread)를 시뮬레이션할 때 Java 방식보다 메모리 효율과 응답 처리 속도가 안정적입니다.

## 3. 실전 설정 팁

HTTP Request Defaults에서 이 설정을 한 번만 해주면, 하위의 모든 HTTP Request 샘플러에 동일하게 적용됩니다.

- **Implementation**: HttpClient4로 설정.
- **Timeouts (Connect/Response)**: 서버 상태가 불안정한 t3.medium 환경이라면, 무한 대기를 방지하기 위해 각각 5000ms(5초) 정도의 값을 명시적으로 주는 것이 좋습니다.
- **Retrieve All Embedded Resources**: 실제 사용자가 브라우저를 통해 접속하는 환경을 재현하려면 이 옵션을 체크하여 이미지, CSS, JS 등을 함께 불러오도록 설정하세요. (단, 부하 발생기 사양을 고려해야 합니다.)

## 💡 Scouter 분석 시 차이점

- **HttpClient4 사용 시**: Scouter XLog에서 커넥션이 재사용되는 것을 볼 수 있어, 전체적인 응답 시간이 안정적으로 유지됩니다.
- **설정이 잘못되었을 때**: 클라이언트(JMeter) 측에서 포트 부족으로 인해 요청을 보내지도 못하고 에러가 날 수 있습니다. 이때 Scouter에는 아무런 로그가 남지 않게 됩니다.