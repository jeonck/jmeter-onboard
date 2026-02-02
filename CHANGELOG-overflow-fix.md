# 마크다운 렌더링 오버플로우 버그 수정

## 문제 현상
마크다운 콘텐츠가 렌더링될 때 컨테이너 영역을 넘어가는 오버플로우 발생

## 원인 분석

### 1. `.content-placeholder` 스타일 문제
```css
/* 기존 코드 */
.content-placeholder {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```
- `display: flex`가 마크다운 블록 콘텐츠(테이블, 코드 블록 등) 레이아웃을 깨뜨림
- 오버플로우 처리 속성 없음

### 2. 테이블 오버플로우
- 넓은 테이블이 컨테이너를 넘어감
- 가로 스크롤 처리 없음

### 3. 긴 텍스트/코드 줄바꿈 없음
- 긴 URL, 인라인 코드 등이 줄바꿈 없이 영역을 넘어감

## 수정 내용

### styles.css 변경사항

#### 1. `.content-placeholder` 수정
```css
.content-placeholder {
  min-height: 200px;
  overflow-x: auto;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.content-placeholder:empty,
.content-placeholder:has(> p:only-child) {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### 2. 테이블 가로 스크롤 추가
```css
.content-placeholder table {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
  max-width: 100%;
}

.content-placeholder table th,
.content-placeholder table td {
  white-space: normal;
  min-width: 100px;
}
```

#### 3. 인라인 코드 스타일 추가
```css
:not(pre) > code {
  background-color: #e2e8f0;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
  word-break: break-all;
}
```

## 수정 결과
- 넓은 테이블: 가로 스크롤로 표시
- 긴 코드/URL: 자동 줄바꿈
- 마크다운 블록 요소: 정상 렌더링

## 수정일
2026-02-02
