# Thread Group Settings

## Understanding Thread Group Configuration

### Meaning of Thread Group Settings

입력하신 설정은 서버에 지속적이고 일정한 압박을 가하는 방식입니다.

- **Number of Threads (Users)**: 동시에 접속하는 가상 사용자 수입니다. (예: 100)
- **Ramp-up Period (seconds)**: 설정한 인원이 다 접속할 때까지 걸리는 시간입니다.
  - Tip: 100명을 10초로 설정하면, 1초마다 10명씩 투입됩니다.
- **Loop Count (Infinite)**: 체크 시 멈추지 않고 계속 요청을 보냅니다. (중지 버튼을 누를 때까지)
- **Constant Timer (Thread Delay)**: 사용자 한 명이 요청을 보낸 후 다음 요청을 보내기 전까지 쉬는 시간(ms)입니다.

주의: 이 값이 너무 작거나 없으면 서버가 순식간에 뻗을 수 있습니다. 보통 300~500ms 정도로 시작해 보세요.