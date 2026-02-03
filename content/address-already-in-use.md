# Address Already In Use 에러 대응 방법

부하 테스트를 진행하다 보면 마주치는 "Address already in use (BindException)" 에러는 서버의 문제가 아니라, JMeter를 실행하는 클라이언트(PC/슬레이브 서버)의 네트워크 자원이 고갈되었을 때 발생하는 현상입니다.

쉽게 말해, JMeter가 서버에 접속하기 위해 사용하는 통로(Local Port)가 더 이상 남아있지 않다는 뜻입니다. 이를 해결하기 위한 현실적인 대응 방법 3가지를 정리해 드립니다.

## 1. OS 레벨의 네트워크 파라미터 튜닝 (가장 확실한 해결책)

Windows나 Linux 같은 운영체제는 한 번 사용한 포트를 안전을 위해 일정 시간 동안 '대기(TIME_WAIT)' 상태로 둡니다. 이 대기 시간이 너무 길면 새로운 요청을 보낼 포트가 부족해집니다.

### Windows 환경
1. regedit(레지스트리 편집기) 실행
2. 경로: HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters
3. 다음 두 값을 추가/수정 (DWORD 32비트):
   - MaxUserPort: 65534 (사용 가능한 포트 수를 최대로 확장)
   - TcpTimedWaitDelay: 30 (포트 재사용 대기 시간을 30초로 단축, 기본값은 보통 240초)
4. 재부팅 후 적용

### Linux 환경
sysctl.conf 파일을 수정하여 커널 설정을 변경합니다.

```bash
# 포트 재사용 허용 및 대기 시간 단축
sysctl -w net.ipv4.tcp_tw_reuse=1
sysctl -w net.ipv4.ip_local_port_range="1024 65535"
```

## 2. JMeter 설정 변경 (Keep-Alive 활용)

HTTP 요청마다 연결을 새로 맺고 끊으면 포트 소모가 극심해집니다.

- **Use KeepAlive 체크**: HTTP Request Default 또는 각 샘플러에서 Use KeepAlive가 체크되어 있는지 확인하세요. 연결을 유지함으로써 포트 하나로 여러 번의 데이터를 주고받을 수 있습니다.
- **HttpClient4 사용**: HTTP Request의 Implementation 설정을 HttpClient4로 사용하면 커넥션 관리가 더 효율적입니다.

## 3. 부하 테스트 설계 및 구조 변경

설정 튜닝으로도 해결되지 않는다면 테스트 구조 자체를 점검해야 합니다.

- **가상 사용자(Thread) 수 조절**: 클라이언트 PC 사양에 비해 너무 많은 Thread를 생성하고 있지 않은지 확인하세요. t3.medium 급의 슬레이브라면 대략 500~1,000명 이상의 동시 접속 시 포트 고갈이 올 수 있습니다.
- **분산 테스팅 (Distributed Testing)**: 클라이언트 한 대의 한계를 넘었다면, 여러 대의 슬레이브 서버를 사용하는 원격 부하 테스트로 부하를 분산시켜야 합니다.
- **Timer 활용**: 앞서 배운 Constant Timer 등을 사용하여 요청 사이의 간격을 미세하게 조정하세요. 너무 짧은 시간에 폭발적으로 요청을 보내면 포트가 순식간에 동납니다.

## 🔍 Scouter에서 징후 포착하기

이 에러가 발생하면 서버(t3.medium)는 평온한데 JMeter 쪽에서만 에러가 찍히는 기현상이 발생합니다.

- **Scouter 모니터링**: Scouter에서 서버의 Active Service는 늘어나지 않는데, JMeter의 Response Time Graph에서 에러(빨간 점)가 쏟아진다면 100% 클라이언트 포트 고갈 문제입니다.
- **결과 분석**: 이때는 서버의 성능 한계를 측정한 것이 아니라, 내 테스트 장비의 한계를 측정한 꼴이 되므로 설정을 수정한 뒤 다시 테스트해야 합니다.