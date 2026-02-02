# EC2 Micro Instance Settings

## Recommended Values for Practical Load Testing

실용적인 부하 테스트를 위해서는 서버의 사양(특히 EC2 t2.micro 같은 프리티어 여부)에 따라 값을 조절해야 합니다. 입문 단계에서 "서버를 죽이지 않으면서 의미 있는 데이터를 뽑아낼 수 있는" 권장 설정값을 안내해 드립니다.

### 1. Step-by-Step Recommended Load Test Values (Based on EC2 Spec)

보통 학습용 EC2(t2.micro, 1vCPU, 1GB RAM)를 사용 중이라고 가정할 때의 설정입니다.

| Test Stage | Number of Threads (Users) | Ramp-up Period (Warm-up Time) | Constant Timer (Delay Time) | Purpose |
|------------|---------------------------|-------------------------------|------------------------------|---------|
| 1st Stage: Verification | 1 ~ 10 | 1 sec | 1000ms (1 sec) | Check if settings are correct, see points in Scouter |
| 2nd Stage: Normal Load | 30 ~ 50 | 10 ~ 20 sec | 500ms | Monitor typical user access situation |
| 3rd Stage: Find Threshold | 100 ~ 200 | 30 ~ 60 sec | 300ms | Check when server slows down (TPS degradation) |

### 2. Guide for Key Parameters

#### ① Number of Threads (Virtual Users)
- **Recommended**: Start with 30~50 people initially.
- **Reason**: Too many threads (e.g., 500+) will exhaust your Windows PC's resources before the server's, distorting test results.

#### ② Ramp-up Period (Important!)
- **Recommended**: Set equal to or higher than thread count (e.g., 50 people = 50 seconds).
- **Reason**: Deploying 100 people in 1 second is like bombing the server. Realistic services have users entering sequentially, so setting it to increase 1~2 people per second is best for viewing graph trends in Scouter.

#### ③ Loop Count (Repeat Count)
- **Recommended**: Initially recommend specifying 100~500 times rather than Infinite.
- **Reason**: With infinite repeat setting, when the load becomes too much for the server to handle, the EC2 may become unresponsive until manually stopped, possibly requiring forced reboot.

#### ④ Constant Timer (Think Time)
- **Recommended**: 300ms ~ 1000ms (0.3 sec ~ 1 sec)
- **Reason**: Real people don't click the next button 0.001 seconds after opening a page. Setting this value too low will quickly drain the server's connection pool, making performance analysis difficult.

### 3. Scouter Monitoring Points During Practice

Apply these values and check the following in Scouter:

- **TPS (Transaction Per Second)**: When increasing threads, TPS rises together, but when it flattens or drops at some point, that's the server's limit.
- **Heap Memory**: If the memory graph rises upward and doesn't come down when Loop Count is set high, suspect **Memory Leak**.
- **XLog**: If points start lining up horizontally at specific times (e.g., 3-second line), suspect DB Lock or external API integration delays.

Tip: If using EC2 free tier, the server will slow down dramatically when CPU Credits are exhausted. If CPU usage continuously exceeds 90% in Scouter, immediately reduce the load!