// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Mermaid
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
    });

    setupMenuGroups();
    setupContentLoading();
});

// Define the mapping of section IDs to content files and titles
const contentMap = {
    'introduction': {
        file: 'content/introduction.md',
        title: 'Introduction to JMeter and Scouter'
    },
    'tool-comparison': {
        file: 'content/tool-comparison.md',
        title: 'JMeter and Scouter Comparison'
    },
    'environment-setup': {
        file: 'content/environment-setup.md',
        title: 'Environment Setup'
    },
    'thread-guide': {
        file: 'content/thread-group-guide.md',
        title: 'Thread Group Guide'
    },
    'ec2-recommendations': {
        file: 'content/ec2-recommendations.md',
        title: 'EC2 Recommendations'
    },
    't3medium-setup': {
        file: 'content/t3medium-setup.md',
        title: 't3.medium Setup'
    },
    'folder-structure': {
        file: 'content/jmeter-folder-structure.md',
        title: 'Folder Structure'
    },
    'block-coding': {
        file: 'content/block-coding-concept.md',
        title: 'Block Coding Approach'
    },
    'test-plan': {
        file: 'content/test-plan-components.md',
        title: 'Test Plan Components'
    },
    'installation': {
        file: 'content/jmeter-installation.md',
        title: 'JMeter Installation'
    },
    'cart-scenario': {
        file: 'content/cart-scenario.md',
        title: 'Cart Scenario'
    },
    'full-scenario': {
        file: 'content/full-shopping-cart-scenario.md',
        title: 'Full Shopping Cart Scenario'
    },
    'testing-process': {
        file: 'content/standard-testing-process.md',
        title: 'Standard Testing Process'
    },
    'recording': {
        file: 'content/recording-feature.md',
        title: 'Recording Feature'
    },
    'jmx-files': {
        file: 'content/jmx-files.md',
        title: 'JMX Files Understanding'
    },
    'templates': {
        file: 'content/templates.md',
        title: 'Template Usage'
    },
    'proxy-setting': {
        file: 'content/proxy-setting.md',
        title: 'Proxy Setting Necessity'
    },
    'firefox-recording': {
        file: 'content/firefox-recording.md',
        title: 'Firefox Recording Setup'
    },
    'jmeter-firefox-practice': {
        file: 'content/jmeter-firefox-practice.md',
        title: 'JMeter-Firefox Recording Practice'
    },
    'recording-template-components': {
        file: 'content/recording-template-components.md',
        title: 'Recording Template Components'
    },
    'transaction-control': {
        file: 'content/transaction-control.md',
        title: 'Transaction Control'
    },
    'thread-group-enable-disable': {
        file: 'content/thread-group-enable-disable.md',
        title: 'Thread Group Enable/Disable'
    },
    'test-fragment': {
        file: 'content/test-fragment.md',
        title: 'Test Fragment'
    },
    'test-fragment-structuring': {
        file: 'content/test-fragment-structuring.md',
        title: 'Test Fragment Structuring'
    },
    'view-results-tree': {
        file: 'content/view-results-tree.md',
        title: 'View Results Tree'
    },
    'summary-report': {
        file: 'content/summary-report.md',
        title: 'Summary Report'
    },
    'data-parameterization': {
        file: 'content/data-parameterization.md',
        title: 'Data Parameterization'
    },
    'login-data-csv': {
        file: 'content/login-data-csv.md',
        title: 'Login Data CSV'
    },
    'csv-data-set-config': {
        file: 'content/csv-data-set-config.md',
        title: 'CSV Data Set Config'
    },
    'csv-sharing-mode': {
        file: 'content/csv-sharing-mode.md',
        title: 'CSV Sharing Mode'
    },
    'constant-timer': {
        file: 'content/constant-timer.md',
        title: 'Constant Timer'
    },
    'correlation': {
        file: 'content/correlation.md',
        title: 'Correlation'
    },
    'correlation-practice': {
        file: 'content/correlation-practice.md',
        title: 'Correlation Practice'
    },
    'regex-extractor': {
        file: 'content/regex-extractor.md',
        title: 'Regular Expression Extractor'
    },
    'response-assertion': {
        file: 'content/response-assertion.md',
        title: 'Response Assertion'
    },
    'response-time-graph': {
        file: 'content/response-time-graph.md',
        title: 'Response Time Graph'
    },
    'once-only-controller': {
        file: 'content/once-only-controller.md',
        title: 'Once Only Controller'
    },
    'jmeter-plugins': {
        file: 'content/jmeter-plugins.md',
        title: 'JMeter Plugins'
    },
    'jpgc-standard-set': {
        file: 'content/jpgc-standard-set.md',
        title: 'JPGC Standard Set'
    },
    'plugin-listeners-analysis': {
        file: 'content/plugin-listeners-analysis.md',
        title: 'Plugin Listeners Analysis'
    }
};

function setupMenuGroups() {
    // Set up click handlers for menu group titles
    document.querySelectorAll('.menu-group-title').forEach(title => {
        title.addEventListener('click', function() {
            const submenu = this.nextElementSibling;

            // Toggle collapsed state
            this.classList.toggle('collapsed');
            submenu.classList.toggle('collapsed');
        });
    });
}

function setupContentLoading() {
    // Set up click handlers for navigation links
    document.querySelectorAll('.submenu a[data-section]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all nav links
            document.querySelectorAll('.submenu a').forEach(link => {
                link.classList.remove('active');
            });

            // Add active class to clicked link
            this.classList.add('active');

            const sectionId = this.getAttribute('data-section');
            const sectionData = contentMap[sectionId];

            if (sectionData) {
                // Update section title
                document.getElementById('section-title').textContent = sectionData.title;

                // Load markdown content
                loadMarkdownContent(sectionData.file);
            }
        });
    });

    // Load the first section by default
    const firstNavLink = document.querySelector('.submenu a[data-section]');
    if (firstNavLink) {
        const firstSectionId = firstNavLink.getAttribute('data-section');
        const firstSectionData = contentMap[firstSectionId];
        if (firstSectionData) {
            loadMarkdownContent(firstSectionData.file);
        }
    }
}

function loadMarkdownContent(filePath) {
    const contentPlaceholder = document.querySelector('.content-placeholder');
    if (contentPlaceholder) {
        contentPlaceholder.innerHTML = '<p style="color:#888;">Loading...</p>';

        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${filePath}`);
                }
                return response.text();
            })
            .then(markdownText => {
                const htmlContent = convertMarkdownToHtml(markdownText);
                contentPlaceholder.innerHTML = htmlContent;

                // Render Mermaid diagrams
                renderMermaidDiagrams();
            })
            .catch(error => {
                console.error(`Error loading ${filePath}:`, error);
                contentPlaceholder.innerHTML = `<p style="color:#e74c3c;">Error: ${error.message}</p>`;
            });
    }
}

function convertMarkdownToHtml(markdown) {
    let html = markdown.replace(/\r\n/g, '\n');

    // Convert tables first (before other conversions)
    html = convertTables(html);

    // Convert headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Convert mermaid code blocks
    html = html.replace(/```mermaid\n([\s\S]*?)```/g, '<div class="mermaid">$1</div>');

    // Convert code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Convert inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Convert blockquotes
    html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

    // Convert lists
    html = html.replace(/^\- (.*$)/gm, '<li>$1</li>');

    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li>.*<\/li>)+/g, function(match) {
        return '<ul>' + match + '</ul>';
    });

    // Convert paragraphs
    html = html.replace(/\n\s*\n/g, '</p><p>');

    // Add paragraph tags
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');

    // Clean up extra paragraph tags
    html = html.replace(/<\/p>\s*<h([1-6])>/g, '</h$1><p>');
    html = html.replace(/<\/h([1-6])>\s*<p>/g, '</h$1>');
    html = html.replace(/<\/p>\s*<ul>/g, '<ul>');
    html = html.replace(/<\/ul>\s*<p>/g, '</ul>');
    html = html.replace(/<\/p>\s*<pre>/g, '<pre>');
    html = html.replace(/<\/pre>\s*<p>/g, '</pre>');
    html = html.replace(/<\/p>\s*<blockquote>/g, '<blockquote>');
    html = html.replace(/<\/blockquote>\s*<p>/g, '</blockquote>');
    html = html.replace(/<\/p>\s*<div class="table-wrapper">/g, '<div class="table-wrapper">');
    html = html.replace(/<\/table>\s*<\/div>\s*<p>/g, '</table></div>');

    // Handle special cases
    html = html.replace(/<p><h([1-6])/g, '<h$1');
    html = html.replace(/<\/h([1-6])><\/p>/g, '</h$1>');
    html = html.replace(/<p><div class="table-wrapper">/g, '<div class="table-wrapper">');

    return html;
}

function convertTables(text) {
    const lines = text.split('\n');
    let result = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i].trim();

        // Check if this line starts a table (starts with |)
        if (line.startsWith('|') && line.endsWith('|')) {
            // Check if next line is a separator (|---|---|)
            if (i + 1 < lines.length && /^\|[\s\-:|]+\|$/.test(lines[i + 1].trim())) {
                // Parse table
                let tableHtml = '<div class="table-wrapper"><table>';

                // Header row
                const headerCells = parseTableRow(line);
                tableHtml += '<thead><tr>';
                headerCells.forEach(cell => {
                    tableHtml += `<th>${cell}</th>`;
                });
                tableHtml += '</tr></thead>';

                // Skip separator line
                i += 2;

                // Body rows
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
    // Remove leading and trailing |, then split by |
    return row
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim());
}

function renderMermaidDiagrams() {
    const mermaidDivs = document.querySelectorAll('.mermaid');
    if (mermaidDivs.length > 0) {
        mermaid.run({
            nodes: mermaidDivs
        });
    }
}
