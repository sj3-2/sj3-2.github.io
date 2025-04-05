/**
 * 과제 상세 내용을 HTML로 변환하는 모듈
 */

/**
 * 텍스트 콘텐츠를 HTML로 변환하는 함수
 * @param {string} content - 변환할 콘텐츠
 * @returns {string} HTML로 변환된 콘텐츠
 */
function processDetailedContent(content) {
    // 상세 내용이 없을 때의 텍스트
    if (!content) return '<p class="no-content">상세 내용이 없습니다.</p>';
    
    // 결과 HTML을 저장할 배열
    const resultHtml = [];
    
    // 리스트 아이템을 임시 저장할 배열
    const listItems = [];
    let inList = false;
    
    // 줄 단위로 분리
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // 빈 줄 처리
        if (!line) {
            // 현재 리스트 중이라면 리스트 완료 처리
            if (inList) {
                resultHtml.push(`<ul class="detailed-content-list">${listItems.join('')}</ul>`);
                listItems.length = 0;
                inList = false;
            }
            resultHtml.push('<div class="content-spacer"></div>');
            continue;
        }
        
        // 대괄호로 시작하는 섹션 제목 ([제목])
        if (line.startsWith('[') && line.includes(']')) {
            // 진행 중인 리스트가 있으면 마무리
            if (inList) {
                resultHtml.push(`<ul class="detailed-content-list">${listItems.join('')}</ul>`);
                listItems.length = 0;
                inList = false;
            }
            
            resultHtml.push(`<strong class="detailed-content-section">${line}</strong>`);
            continue;
        }
        
        // 숫자로 시작하는 섹션 제목 (1. 제목)
        if (/^\d+\.\s+/.test(line)) {
            // 진행 중인 리스트가 있으면 마무리
            if (inList) {
                resultHtml.push(`<ul class="detailed-content-list">${listItems.join('')}</ul>`);
                listItems.length = 0;
                inList = false;
            }
            
            resultHtml.push(`<div class="detailed-content-section">${line}</div>`);
            continue;
        }
        
        // 하이픈으로 시작하는 리스트 항목 (- 항목)
        if (line.startsWith('-')) {
            // 리스트 아이템으로 처리
            inList = true;
            const itemContent = line.substring(1).trim();
            
            // 링크 처리
            const processedItem = itemContent.replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
            );
            
            listItems.push(`<li class="detailed-content-item">${processedItem}</li>`);
            continue;
        }
        
        // 일반 텍스트 줄
        // 이전에 리스트가 있었다면 마무리
        if (inList) {
            resultHtml.push(`<ul class="detailed-content-list">${listItems.join('')}</ul>`);
            listItems.length = 0;
            inList = false;
        }
        
        // 링크 처리
        const processedLine = line.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        resultHtml.push(`<p>${processedLine}</p>`);
    }
    
    // 마지막에 처리되지 않은 리스트가 있다면 처리
    if (inList && listItems.length > 0) {
        resultHtml.push(`<ul class="detailed-content-list">${listItems.join('')}</ul>`);
    }
    
    return resultHtml.join('');
}

// 전역 객체에 함수 추가
window.ContentFormatter = {
    processDetailedContent
};
