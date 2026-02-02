# JMeter Summary Report 활용

Summary Report는 JMeter 테스트가 끝난 후(또는 진행 중) 전체적인 성능 수치를 한눈에 파악할 수 있게 해주는 핵심 통계 리스너입니다.

'View Results Tree'가 개별 요청의 상세 내용을 보여주는 현미경이라면, Summary Report는 전체적인 성적표를 보여주는 대시보드라고 할 수 있습니다.

## 📊 Summary Report의 주요 항목(Column) 설명

Summary Report 표에 나열된 각 항목은 부하 테스트의 성패를 가르는 중요한 지표들입니다.

| 항목 (Column) | 의미 및 활용법 |
|---------------|----------------|
| Label | HTTP Request 샘플러의 이름 (또는 Transaction Controller 이름) |
| # Samples | 실행된 총 요청 횟수 |
| Average | 평균 응답 시간 (ms) |
| Min / Max | 가장 빨랐던 시간과 가장 느렸던 시간 (ms) |
| Std. Dev. | 표준편차. 이 값이 크면 응답 시간이 들쭉날쭉하여 시스템이 불안정하다는 뜻입니다. |
| Error % | 전체 요청 중 실패한 비율. 0%에 가까워야 합니다. |
| Throughput | 가장 중요한 지표. 초당 처리량(TPS/RPS). 서버가 초당 몇 개의 요청을 처리했는가? |
| Received/Sent KB/sec | 초당 송수신 데이터 양 (네트워크 대역폭 확인용) |

## 💡 실무 활용 포인트 (t3.medium 환경 기준)

### 1. 성능 임계점(Saturation Point) 찾기

사용자(Thread)를 늘려가며 Summary Report를 관찰하세요. 어느 순간부터 사용자는 늘어나는데 **Throughput(초당 처리량)**이 더 이상 오르지 않고 **Average(응답 시간)**만 급격히 늘어난다면, 그 지점이 서버의 한계치입니다.

### 2. 에러율(Error %) 감시

t3.medium 같은 인스턴스는 자원이 한정적입니다. CPU가 100%를 치거나 DB 커넥션이 풀(Full)이 되면 Summary Report의 **Error %**가 올라가기 시작합니다. 이때 바로 Scouter를 열어 어느 자원이 부족한지 연결해서 분석해야 합니다.

### 3. 통계 데이터 저장

하단의 Write results to file / Read from file 섹션에서 파일 경로를 지정하면, 테스트 결과를 .jtl 또는 .csv 파일로 저장할 수 있습니다. 이 파일은 나중에 보고서를 쓰거나 엑셀에서 그래프를 그릴 때 사용됩니다.

## ⚠️ 사용 시 주의사항

- **메모리 효율성**: 'View Results Tree'보다는 훨씬 가볍지만, 그래도 데이터를 실시간으로 계산하기 때문에 아주 정밀한 고부하 테스트 시에는 GUI 모드 자체를 지양하는 것이 좋습니다.
- **초기 데이터 제외**: 테스트 시작 직후(Warm-up 기간)의 불안정한 데이터가 평균값을 왜곡할 수 있으니 주의 깊게 살펴봐야 합니다.

## 💡 꿀팁: Transaction Controller와의 조합

앞서 배운 Transaction Controller를 사용하면, 개별 이미지/API 요청이 아닌 '로그인 시나리오 전체'에 대한 평균 시간과 Throughput을 Summary Report에서 확인할 수 있어 훨씬 비즈니스 관점의 분석이 가능해집니다.