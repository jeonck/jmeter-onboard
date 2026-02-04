# JMeter Java Request를 활용한 소켓 통신 테스트

성능 테스트 중 표준 HTTP 프로토콜이 아닌, **커스텀 TCP/IP 소켓 통신**을 테스트해야 할 때 JMeter의 Java Request 샘플러를 활용합니다. 이는 Java로 직접 소켓 통신 클라이언트 코드를 작성하여 JMeter의 생명주기에 통합하는 방식입니다.

## 1. Java Request 기반 소켓 테스트의 원리

JMeter의 기본 TCP Sampler로 처리하기 힘든 복잡한 바이너리 데이터, 특수한 인코딩, 혹은 세션 유지가 필요한 소켓 통신을 Java 코드로 직접 제어합니다.

- **동작 방식**: JavaSamplerClient 인터페이스를 상속받은 Java 클래스를 작성하고, 이를 JAR 파일로 빌드하여 JMeter에 로드합니다.
- **장점**: 암호화, 복잡한 비즈니스 로직, 멀티플렉싱 통신 등을 코드 수준에서 완벽하게 제어할 수 있습니다.

## 2. 구현 절차 (개발 단계)

### ① Java 프로젝트 생성 및 라이브러리 추가

먼저 Java 프로젝트에 `ApacheJMeter_core.jar`와 `ApacheJMeter_java.jar`를 라이브러리로 추가해야 합니다.

- **JMeter 라이브러리 위치**: JMeter 설치 폴더의 `/lib` 폴더에 있습니다.
- **IDE 설정**: Maven 또는 Gradle을 사용하는 경우, 아래와 같은 의존성을 추가합니다.

**Maven**:
```xml
<dependency>
    <groupId>org.apache.jmeter</groupId>
    <artifactId>ApacheJMeter_core</artifactId>
    <version>5.6.3</version>
    <scope>provided</scope>
</dependency>
<dependency>
    <groupId>org.apache.jmeter</groupId>
    <artifactId>ApacheJMeter_java</artifactId>
    <version>5.6.3</version>
    <scope>provided</scope>
</dependency>
```

### ② JavaSamplerClient 구현

핵심은 `runTest` 메소드를 구현하는 것입니다.

```java
import org.apache.jmeter.protocol.java.sampler.AbstractJavaSamplerClient;
import org.apache.jmeter.protocol.java.sampler.JavaSamplerContext;
import org.apache.jmeter.samplers.SampleResult;

import java.io.OutputStream;
import java.net.Socket;

public class MySocketClient extends AbstractJavaSamplerClient {
    // 테스트 매개변수 설정 (GUI에 노출됨)
    @Override
    public Arguments getDefaultParameters() {
        Arguments params = new Arguments();
        params.addArgument("ip", "127.0.0.1");
        params.addArgument("port", "9000");
        params.addArgument("message", "HELLO");
        return params;
    }

    @Override
    public SampleResult runTest(JavaSamplerContext context) {
        SampleResult result = new SampleResult();
        String ip = context.getParameter("ip");
        int port = Integer.parseInt(context.getParameter("port"));
        String message = context.getParameter("message");

        result.sampleStart(); // 타이머 시작
        try (Socket socket = new Socket(ip, port)) {
            // 소켓 송수신 로직
            OutputStream out = socket.getOutputStream();
            out.write(message.getBytes());
            
            result.setSuccessful(true);
            result.setResponseCodeOK();
            result.setResponseMessage("Success");
        } catch (Exception e) {
            result.setSuccessful(false);
            result.setResponseMessage("Error: " + e.getMessage());
        } finally {
            result.sampleEnd(); // 타이머 종료
        }
        return result;
    }
}
```

## 3. JMeter 적용 절차 (배포 및 실행)

### ① JAR 파일 빌드 및 배치

1. **JAR 파일 빌드**: IDE 또는 Maven/Gradle을 사용하여 프로젝트를 JAR 파일로 빌드합니다.
2. **JAR 파일 배치**: 빌드된 JAR 파일을 JMeter 설치 경로의 `/lib/ext` 폴더에 복사합니다.
3. **JMeter 재기동**: JAR 파일을 적용하기 위해 JMeter를 재시작합니다.

### ② Java Request 샘플러 설정

1. **샘플러 추가**: Thread Group에서 Add > Sampler > Java Request를 선택합니다.
2. **클래스 선택**: Classname 드롭다운 메뉴에서 본인이 작성한 클래스(MySocketClient)를 선택합니다.
3. **파라미터 설정**: 하단에 자동으로 나타나는 Parameters 값(IP, Port 등)을 입력합니다.

## 4. 성능 테스트 시 주의사항 (임계 부하 관점)

소켓 테스트는 일반 HTTP 테스트보다 리소스 관리가 훨씬 중요합니다.

- **Connection Pool**: `runTest` 안에서 매번 소켓을 맺고 끊는(3-way handshake) 로직은 성능 저하의 원인이 됩니다. 지속 연결(Keep-Alive)이 필요하다면 `setupTest`에서 연결하고 `teardownTest`에서 종료하도록 설계해야 합니다.
- **Timeout 설정**: 소켓 통신은 응답이 없을 경우 무한 대기에 빠질 수 있습니다. 반드시 `setSoTimeout` 등을 통해 타임아웃을 명시해야 합니다.
- **로그 관리**: `System.out.println` 대신 JMeter의 `getLogger()`를 사용해야 부하 테스트 시 I/O 병목을 줄일 수 있습니다.

### ③ 고급 팁: 연결 풀링 구현

```java
public class AdvancedSocketClient extends AbstractJavaSamplerClient {
    private static Socket sharedSocket;
    
    @Override
    public void setupTest(JavaSamplerContext context) {
        // 테스트 시작 전에 소켓 연결
        try {
            String ip = context.getParameter("ip");
            int port = Integer.parseInt(context.getParameter("port"));
            sharedSocket = new Socket(ip, port);
        } catch (Exception e) {
            // 연결 실패 시 예외 처리
        }
    }

    @Override
    public SampleResult runTest(JavaSamplerContext context) {
        // 이미 연결된 소켓을 재사용
        SampleResult result = new SampleResult();
        result.sampleStart();
        
        try {
            // sharedSocket을 사용하여 데이터 송수신
            // ...
            result.setSuccessful(true);
        } catch (Exception e) {
            result.setSuccessful(false);
            result.setResponseMessage("Error: " + e.getMessage());
        } finally {
            result.sampleEnd();
        }
        return result;
    }

    @Override
    public void teardownTest(JavaSamplerContext context) {
        // 테스트 종료 후 연결 종료
        if (sharedSocket != null && !sharedSocket.isClosed()) {
            try {
                sharedSocket.close();
            } catch (Exception e) {
                // 종료 시 예외 처리
            }
        }
    }
}
```

## 5. 비교: TCP Sampler vs Java Request

| 구분 | TCP Sampler (기본) | Java Request (커스텀) |
|------|-------------------|----------------------|
| 난이도 | 낮음 | 높음 (코딩 필요) |
| 유연성 | 제한적 (Text/Hex 전송) | 무한함 (모든 로직 가능) |
| 권장 상황 | 단순한 문자열 송수신 | 암호화, 프로토콜 조합, 복잡한 헤더 처리 |

## 💡 결론: 언제 사용해야 할까?

Java Request는 HTTP 이외의 복잡한 통신 프로토콜을 테스트해야 할 때의 최후의 수단입니다. TCP Sampler로는 해결할 수 없는 고도화된 시나리오(예: 게임 서버, 금융 API, IoT 장비 통신 등)에서만 사용하는 것이 좋습니다. 단순한 텍스트 송수신은 TCP Sampler로 충분하며, Java Request는 진짜로 복잡한 로직이 필요한 경우에만 사용하세요.