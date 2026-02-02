# UI 개선 및 테이블 렌더링 수정

## 개선 날짜
2026-02-02

---

## 1. 헤더/메뉴 영역 축소

### 문제점
- 타이틀바와 메뉴 영역이 너무 두꺼워 콘텐츠 영역이 부족
- 가로 나열 메뉴로 인해 메뉴 항목이 많아지면 여러 줄 차지

### 해결책
- 헤더 높이 축소: 50px 고정
- 좌측 사이드바 네비게이션으로 변경 (220px 너비)

### 변경된 CSS
```css
:root {
  --sidebar-width: 220px;
  --header-height: 50px;
}

header {
  height: var(--header-height);
  padding: 0.75rem 1rem;
  position: fixed;
}

header h1 {
  font-size: 1.25rem;
}
```

---

## 2. 그룹 메뉴 구조 도입

### 문제점
- 단일 목록으로 나열된 메뉴가 많아 찾기 어려움
- 메뉴 간 논리적 구분 없음

### 해결책
6개의 그룹으로 메뉴 재구성:

| 그룹명 | 포함 메뉴 |
|--------|-----------|
| Overview | Introduction, Tool Comparison |
| Setup & Installation | Installation, Folder Structure, Environment Setup |
| Configuration | Thread Group Guide, EC2 Recommendations, T3 Medium Setup |
| Test Planning | Block Coding, Test Plan Components, Cart Scenario, Full Shopping Cart |
| Execution | Testing Process, Recording Feature, JMX Files, Templates, Proxy Setting, Firefox Recording, JMeter-Firefox Practice, Recording Template Components, Transaction Control |
| Advanced Features | Thread Group Enable/Disable, Test Fragment, Test Fragment Structuring, View Results Tree, Summary Report |

### HTML 구조
```html
<div class="menu-group">
    <div class="menu-group-title" data-group="overview">
        <span>Overview</span>
        <span class="arrow">▼</span>
    </div>
    <ul class="submenu active">
        <li><a href="#" data-section="introduction">Introduction</a></li>
        ...
    </ul>
</div>
```

### JavaScript - 그룹 토글 기능
```javascript
function setupMenuGroups() {
    document.querySelectorAll('.menu-group-title').forEach(title => {
        title.addEventListener('click', function() {
            const submenu = this.nextElementSibling;
            this.classList.toggle('collapsed');
            submenu.classList.toggle('collapsed');
        });
    });
}
```

---

## 3. 콘텐츠 로딩 방식 변경

### 문제점
- 메뉴 클릭 시 해당 섹션으로 스크롤하는 방식
- 모든 섹션이 한 페이지에 존재

### 해결책
- 단일 콘텐츠 영역에 마크다운 파일 동적 로딩
- 스크롤 없이 콘텐츠 교체

### 변경된 구조
```html
<!-- 기존: 여러 섹션 -->
<section id="introduction">...</section>
<section id="tool-comparison">...</section>
...

<!-- 변경: 단일 콘텐츠 영역 -->
<main class="content-area">
    <section id="content-section">
        <h2 id="section-title">제목</h2>
        <div class="content-placeholder">콘텐츠</div>
    </section>
</main>
```

---

## 4. 마크다운 테이블 렌더링 지원

### 문제점
- 마크다운 테이블 문법이 HTML로 변환되지 않음
- 테이블이 `| 항목 | 내용 |` 형태로 그대로 표시됨

### 해결책
테이블 파싱 함수 추가:

```javascript
function convertTables(text) {
    const lines = text.split('\n');
    let result = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i].trim();

        // 테이블 시작 감지 (| 로 시작하고 끝나는 행)
        if (line.startsWith('|') && line.endsWith('|')) {
            // 다음 행이 구분선인지 확인 (|---|---|)
            if (i + 1 < lines.length && /^\|[\s\-:|]+\|$/.test(lines[i + 1].trim())) {
                // 테이블 파싱
                let tableHtml = '<div class="table-wrapper"><table>';

                // 헤더 행
                const headerCells = parseTableRow(line);
                tableHtml += '<thead><tr>';
                headerCells.forEach(cell => {
                    tableHtml += `<th>${cell}</th>`;
                });
                tableHtml += '</tr></thead>';

                // 구분선 건너뛰기
                i += 2;

                // 본문 행
                tableHtml += '<tbody>';
                while (i < lines.length) {
                    const rowLine = lines[i].trim();
                    if (rowLine.startsWith('|') && rowLine.endsWith('|')) {
                        const cells = parseTableRow(rowLine);
                        tableHtml += '<tr>';
                        cells.forEach(cell => {
                            tableHtml += `<td>${cell}</td>`;
                        });
                        tableHtml += '</tr>';
                        i++;
                    } else {
                        break;
                    }
                }
                tableHtml += '</tbody></table></div>';

                result.push(tableHtml);
                continue;
            }
        }

        result.push(lines[i]);
        i++;
    }

    return result.join('\n');
}

function parseTableRow(row) {
    return row
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim());
}
```

---

## 5. 테이블 오버플로우 해결

### 문제점
- 넓은 테이블이 컨테이너 영역을 넘어감
- 가로 스크롤 없음

### 해결책
테이블을 wrapper로 감싸고 가로 스크롤 적용:

```css
.table-wrapper {
  overflow-x: auto;
  margin: 1rem 0;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.table-wrapper table {
  width: 100%;
  min-width: 500px;
  border-collapse: collapse;
}

th {
  white-space: nowrap;
}

tr:hover {
  background-color: #e8f4fc;
}
```

---

## 수정된 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `index.html` | 사이드바 레이아웃, 그룹 메뉴 구조 |
| `script.js` | 그룹 토글, 테이블 파싱 함수 추가 |
| `styles.css` | 헤더/사이드바 스타일, 테이블 래퍼 스타일 |

---

## 결과

- 콘텐츠 영역 확대 (헤더/메뉴 축소)
- 논리적 그룹 메뉴로 탐색 편의성 향상
- 마크다운 테이블 정상 렌더링
- 넓은 테이블 가로 스크롤 지원
