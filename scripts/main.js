document.addEventListener('DOMContentLoaded', () => {
    // 미리 정의된 색상 팔레트
    const colorPalette = [
        '#4ade80', // 녹색
        '#f472b6', // 핑크
        '#60a5fa', // 파랑
        '#fbbf24', // 노랑
        '#c084fc', // 보라
        '#34d399', // 민트
        '#fb923c', // 주황
        '#a78bfa', // 라일락
        '#f87171', // 연빨강
        '#38bdf8'  // 하늘색
    ];
    
    // 과목별 색상을 생성하고 CSS 변수로 설정하는 함수
    function generateSubjectColors(subjects) {
        const root = document.documentElement;
        const subjectColors = {};
        
        subjects.forEach((subject, index) => {
            // 색상 팔레트에서 색상 선택 (반복 사용)
            const color = colorPalette[index % colorPalette.length];
            // CSS 변수 설정
            const varName = `--subject-${subject}`;
            root.style.setProperty(varName, color);
            subjectColors[subject] = color;
        });
        
        return subjectColors;
    }
    const subjectFilter = document.getElementById('subjectFilter');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const assignmentContainer = document.getElementById('assignment-container');
    const calendarContainer = document.getElementById('calendar-container');
    const assignmentDetailModal = document.getElementById('assignment-detail-modal');
    const modalContentElement = document.getElementById('modal-content'); // Renamed variable to avoid conflict
    const closeModalButton = document.querySelector('#assignment-detail-modal .close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalSubject = document.getElementById('modal-subject');
    // modalPriority 변수 삭제됨 - 중요도 부분 제거
    const modalDate = document.getElementById('modal-date');
    const modalContentDisplay = document.getElementById('modal-content'); // Target the correct element for display
    const loadingOverlay = document.getElementById('loading-overlay');
    const notificationArea = document.getElementById('notification-area');
    const noAssignmentsMessage = document.querySelector('#upcoming-assignments .no-assignments'); // More specific selector

    const listViewBtn = document.getElementById('listViewBtn');
    const calendarViewBtn = document.getElementById('calendarViewBtn');
    const listViewSection = document.getElementById('upcoming-assignments');
    const calendarViewSection = document.getElementById('calendar-view');
    const calendarGridElement = document.getElementById('calendar-grid'); // Use different name
    const calendarMonthYearElement = document.getElementById('calendar-month-year'); // Use different name
    const prevMonthBtnElement = document.getElementById('prevMonthBtn'); // Use different name
    const nextMonthBtnElement = document.getElementById('nextMonthBtn'); // Use different name
    const currentMonthBtnElement = document.getElementById('currentMonthBtn'); // Use different name
    const calendarWeekdaysContainerElement = document.querySelector('#calendar-container .calendar-weekdays'); // Use different name and selector


    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let currentAssignments = [];

    function getAssignments() {
        return window.AssignmentRegistry ? window.AssignmentRegistry.getAll() : [];
    }

    function getAssignmentById(id) {
        const assignments = getAssignments();
        return assignments.find(a => a.id === id);
    }

    function getSubjectName(id) {
        if (!window.AssignmentRegistry || !window.AssignmentRegistry.getSubjects) return 'Unknown';
        const subjectsMap = (window.subjectRegistry || []).reduce((map, subj) => {
             map[subj.id] = subj.name;
             return map;
         }, {}); // Assuming subjectRegistry is available
         // Fallback if subjectRegistry is not directly available
         if (Object.keys(subjectsMap).length === 0 && window.SUBJECTS) {
             console.warn("Using fallback SUBJECTS array. Ensure subjectRegistry is populated or use IDs consistently.");
             const subjectsFromGlobal = window.SUBJECTS || [];
             // This part assumes subject ID *is* the subject name, which might be incorrect
             // A better approach would be to have a consistent Subject Registry
             const subjectObj = subjectsFromGlobal.find(s => typeof s === 'object' ? s.id === id : s === id);
             return typeof subjectObj === 'object' ? subjectObj.name : subjectObj || 'Unknown';
         }
        return subjectsMap[id] || 'Unknown';
    }


    function populateSubjects() {
         if (!subjectFilter || !window.AssignmentRegistry || !window.AssignmentRegistry.getSubjects) return;

         while (subjectFilter.options.length > 1) {
             subjectFilter.remove(1);
         }

         const subjects = window.AssignmentRegistry.getSubjects() || (window.SUBJECTS || []); // Use registry or fallback

         // Ensure subjects are consistently strings or objects with names
         const subjectNames = subjects.map(s => typeof s === 'object' ? s.name : s).filter(Boolean);
         const uniqueSubjectNames = [...new Set(subjectNames)].sort(); // Get unique names and sort
         
         // 과목별 색상 생성
         window.subjectColors = generateSubjectColors(uniqueSubjectNames);

         uniqueSubjectNames.forEach(name => {
             const option = document.createElement('option');
             // Find the corresponding ID if needed (assuming IDs are consistent)
             const subjectObj = subjects.find(s => (typeof s === 'object' ? s.name : s) === name);
             option.value = typeof subjectObj === 'object' ? subjectObj.id : name; // Use ID if object, else name as value
             option.textContent = name;
             subjectFilter.appendChild(option);
         });
     }


    function formatDate(dateString) {
        if (!dateString) return '마감일 없음';
        try {
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return '유효하지 않은 날짜';
        }
    }

    function daysLeft(dueDate) {
        if (!dueDate) return '?';
        try {
            const today = new Date();
            const due = new Date(dueDate);
            today.setHours(0, 0, 0, 0);
            due.setHours(0, 0, 0, 0);
            const diffTime = due - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 0) return 0; // Overdue is 0 days left
             if (diffDays === 0) return 0; // Due today is 0 days left in this context
             return diffDays;
        } catch (e) {
            console.error("Error calculating days left:", dueDate, e);
            return '?';
        }
    }

     function getDaysLeftText(dueDate) {
        if (!dueDate) return '';
        const days = daysLeft(dueDate);
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        if (due < today) {
             return '(마감됨)';
        } else if (days === 0) {
             return '(오늘 마감)';
        } else if (days === 1) {
             return '(1일 남음)';
        } else {
            return `(${days}일 남음)`;
        }
    }


    function renderAssignments(assignmentsToDisplay) {
        if (!assignmentContainer || !noAssignmentsMessage) return;
        assignmentContainer.innerHTML = '';

        // Filter out overdue assignments from the list view
        const filteredAssignments = assignmentsToDisplay.filter(assignment => {
            if (!assignment || !assignment.dueDate) return true; // Keep assignments without due date
            const today = new Date();
            const due = new Date(assignment.dueDate);
            today.setHours(0, 0, 0, 0);
            due.setHours(0, 0, 0, 0);
            return due >= today; // Only keep assignments that are not overdue
        });

        const sortedAssignments = [...filteredAssignments].sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate) : new Date(9999, 0, 1);
            const dateB = b.dueDate ? new Date(b.dueDate) : new Date(9999, 0, 1);
            return dateA - dateB;
        });

        if (sortedAssignments.length === 0) {
            noAssignmentsMessage.classList.remove('hidden');
            return;
        }
        noAssignmentsMessage.classList.add('hidden');

        sortedAssignments.forEach(assignment => {
            if (!assignment || !assignment.id || !assignment.title) {
                console.warn("Skipping invalid assignment object:", assignment);
                return; // Skip if essential data is missing
            }

            const card = document.createElement('div');
            card.className = 'assignment-card';
            // 과목에 따라 왼쪽 테두리 색상 적용
            if (assignment.subject) {
                card.style.borderLeftColor = `var(--subject-${assignment.subject})`;
            }
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `${assignment.title} - ${assignment.subject}`);
            card.dataset.id = assignment.id; // Use dataset for ID
            card.style.cursor = 'pointer';
            
            // 전체 카드에 클릭 이벤트 추가
            card.addEventListener('click', () => {
                openModal(assignment.id);
            });
            
            // 키보드 접근성 추가
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    openModal(assignment.id);
                    e.preventDefault();
                }
            });

            const header = document.createElement('div');
            header.className = 'assignment-header';

            const title = document.createElement('h3'); // Use h3 for card titles
            title.className = 'assignment-title';
            title.textContent = assignment.title;

            const dateContainer = document.createElement('div');
            dateContainer.className = 'date-container';
            
            const dateSpan = document.createElement('span');
            dateSpan.className = 'date-display';
            const daysLeftStr = getDaysLeftText(assignment.dueDate);
            dateSpan.innerHTML = `${formatDate(assignment.dueDate).slice(6, -4)} ${daysLeftStr ? `<strong>${daysLeftStr}</strong>` : ''}`; // Use innerHTML for bold
            
            dateContainer.appendChild(dateSpan);
            
            header.appendChild(title);
            header.appendChild(dateContainer);

            // 설명 텍스트를 깔끔하게 처리
            const description = document.createElement('p');
            description.className = 'assignment-description';
            const fullDesc = assignment.description || '';
            
            // 소개 부분 (첫 두 문장) 추출
            let previewText = '';
            
            if (fullDesc.includes('\n\n')) {
                // 첫 번째 빈 줄까지의 모든 텍스트를 가져옴 (소개 부분)
                previewText = fullDesc.split('\n\n')[0];
                
                // 첫 문장이 너무 길면 잘라서 표시
                if (previewText.length > 120) {
                    previewText = previewText.substring(0, 120) + '...';
                }
            } else if (fullDesc.match(/\[([^\]]+)\]/)) {
                // 빈 줄이 없지만 대괄호 형식이 있는 경우 (이전 포맷 지원)
                let titleMatch = fullDesc.match(/\[([^\]]+)\]|^([^\n]+)/);
                if (titleMatch) {
                    previewText = titleMatch[0];
                    if (previewText.length > 100) {
                        previewText = previewText.substring(0, 100) + '...';
                    }
                }
            } else {
                // 빈 줄이나 대괄호 형식이 없는 경우, 줄바꿈 문자를 공백으로 변환
                const plainText = fullDesc.replace(/\n+/g, ' ').trim();
                previewText = plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
            }
            
            description.innerHTML = previewText.replace(/\n/g, '<br>');
             if (!fullDesc) {
                 description.textContent = '상세 설명이 없습니다.';
                 description.style.fontStyle = 'italic';
                 description.style.opacity = '0.7';
             }

            card.appendChild(header);
            card.appendChild(description);
            
            // 좌측 하단에 클릭하여 자세히 보기 텍스트 추가
            const viewDetails = document.createElement('div');
            viewDetails.className = 'view-details-hint';
            viewDetails.textContent = '클릭하여 자세히 보기';
            card.appendChild(viewDetails);
            
            // 과목 태그를 우측 하단으로 이동
            const subjectTag = document.createElement('div');
            subjectTag.className = 'subject-tag-bottom';
            
            const subjectName = assignment.subject; // Simply use the subject name directly
            const subject = document.createElement('span');
            subject.className = 'subject-tag';
            subject.textContent = subjectName;
            // 과목에 따라 태그 색상 적용
            subject.style.backgroundColor = `var(--subject-${subjectName})`;
            subject.style.color = '#000';  // 가독성을 위해 어두운 텍스트 색상
            
            subjectTag.appendChild(subject);
            card.appendChild(subjectTag);
            
            assignmentContainer.appendChild(card);
        });
    }
    function createCalendar(year, month, assignmentsData) {
        if (!calendarContainer) {
            console.error("Calendar container not found!");
            return;
        }
        calendarContainer.innerHTML = '';

        const monthNames = ["수행평가 1월", "수행평가 2월", "수행평가 3월", "수행평가 4월", "수행평가 5월", "수행평가 6월", "수행평가 7월", "수행평가 8월", "수행평가 9월", "수행평가 10월", "수행평가 11월", "수행평가 12월"];

         const calendarHeader = document.createElement('div');
         calendarHeader.className = 'calendar-header';
         calendarHeader.innerHTML = `
             <h2 id="calendar-month-year">${monthNames[month]} ${year}</h2>
             <div class="calendar-nav">
                 <button id="prevMonthBtn" class="btn btn-secondary btn-icon" aria-label="Previous Month"><i class="fas fa-chevron-left"></i></button>
                 <button id="currentMonthBtn" class="btn btn-secondary" aria-label="Current Month">오늘</button>
                 <button id="nextMonthBtn" class="btn btn-secondary btn-icon" aria-label="Next Month"><i class="fas fa-chevron-right"></i></button>
             </div>
         `;
         calendarContainer.appendChild(calendarHeader);

         document.getElementById('prevMonthBtn').addEventListener('click', () => navigateMonth(-1));
         document.getElementById('nextMonthBtn').addEventListener('click', () => navigateMonth(1));
         document.getElementById('currentMonthBtn').addEventListener('click', () => {
             const today = new Date();
             currentMonth = today.getMonth();
             currentYear = today.getFullYear();
             filterAndRender(); // Use filter function
         });

         // 뷰포트 너비를 확인하여 모바일에서는 더 짧은 요일 이름 사용
         const isMobile = window.innerWidth <= 480;
         const daysOfWeek = isMobile ? ['일', '월', '화', '수', '목', '금', '토'] : ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
         const weekdayHeader = document.createElement('div');
         weekdayHeader.className = 'calendar-weekdays';
         daysOfWeek.forEach(day => {
             const dayHeader = document.createElement('div');
             dayHeader.className = 'calendar-weekday';
             dayHeader.textContent = day;
             weekdayHeader.appendChild(dayHeader);
         });
         calendarContainer.appendChild(weekdayHeader);

         const calendarGrid = document.createElement('div');
         calendarGrid.className = 'calendar-grid';
         calendarGrid.setAttribute('role', 'grid');
         calendarGrid.setAttribute('aria-label', `Calendar for ${monthNames[month]} ${year}`);

         const firstDayOfMonth = new Date(year, month, 1);
         const startingDayOfWeek = firstDayOfMonth.getDay();
         const daysInMonth = new Date(year, month + 1, 0).getDate();

         for (let i = 0; i < startingDayOfWeek; i++) {
             const emptyDay = document.createElement('div');
             emptyDay.className = 'calendar-day empty';
             emptyDay.setAttribute('role', 'gridcell');
             emptyDay.setAttribute('aria-hidden', 'true');
             calendarGrid.appendChild(emptyDay);
         }

         const today = new Date();
         today.setHours(0, 0, 0, 0);

         for (let day = 1; day <= daysInMonth; day++) {
             const dayCell = document.createElement('div');
             dayCell.className = 'calendar-day';
             dayCell.setAttribute('role', 'gridcell');

             const currentDate = new Date(year, month, day);
             currentDate.setHours(0,0,0,0); // Ensure comparison is date-only

             if (currentDate.getTime() === today.getTime()) {
                 dayCell.classList.add('today');
                 dayCell.setAttribute('aria-current', 'date');
             }

             const dateHeader = document.createElement('div');
             dateHeader.className = 'day-number';
             dateHeader.textContent = day;
             dayCell.appendChild(dateHeader);

             const dateStringForComparison = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
             const comparisonDate = new Date(dateStringForComparison);
             comparisonDate.setHours(0,0,0,0); // Date object for comparison

             const dayAssignments = assignmentsData.filter(assignment => {
                  if (!assignment || !assignment.dueDate) return false;
                  try {
                      const assignmentDueDate = new Date(assignment.dueDate);
                      assignmentDueDate.setHours(0, 0, 0, 0);
                      return assignmentDueDate.getTime() === comparisonDate.getTime();
                  } catch (e) {
                     // console.error("Invalid date format in comparison:", assignment.dueDate, e);
                      return false;
                  }
              });


             if (dayAssignments.length > 0) {
                 dayCell.classList.add('has-assignments');
                 // Create proper Korean aria label for accessibility
                 const assignmentCountText = `${dayAssignments.length}개의 수행평가`;
                 dayCell.setAttribute('aria-label', `${year}년 ${month+1}월 ${day}일. ${assignmentCountText} 있음.`);

                 const miniAssignmentsContainer = document.createElement('div');
                 miniAssignmentsContainer.className = 'mini-assignments-container';
                 
                 // Add scrollable class if multiple assignments exist
                 if (dayAssignments.length > 1) {
                     miniAssignmentsContainer.classList.add('scrollable');
                     
                     // Add counter badge for multiple assignments
                     const counter = document.createElement('span');
                     counter.className = 'assignment-counter';
                     counter.textContent = dayAssignments.length;
                     dayCell.appendChild(counter);
                 }

                 dayAssignments.forEach(assignment => {
                     if (!assignment || !assignment.id || !assignment.title) {
                          console.warn("Skipping incomplete assignment for mini view:", assignment);
                          return;
                      }
                     const miniAssignment = document.createElement('div');
                     miniAssignment.className = 'mini-assignment';
                     // 과목에 따라 미니 과제 테두리 색상 적용
                     if (assignment.subject) {
                         const subjectVar = `var(--subject-${assignment.subject})`;
                         miniAssignment.style.borderLeftColor = subjectVar;
                         // ::before 요소에 색상을 적용하기 위한 스타일 추가
                         miniAssignment.style.setProperty('--item-color', subjectVar);
                         // 배경색 투명도 낮춌
                         miniAssignment.style.backgroundColor = `rgba(0, 0, 0, 0.25)`;
                         // 글자색 밝게 조정
                         miniAssignment.style.color = `rgba(255, 255, 255, 0.9)`;
                     }
                     miniAssignment.textContent = assignment.title;
                     const subjectName = assignment.subject;
                     miniAssignment.title = `${subjectName}: ${assignment.description || ''}`;
                     miniAssignment.setAttribute('aria-label', `${assignment.title}, ${subjectName}`);
                     miniAssignment.dataset.assignmentId = assignment.id;
                     miniAssignment.style.cursor = 'pointer';
                     miniAssignment.setAttribute('role', 'button');
                     miniAssignment.setAttribute('tabindex', '0');

                     miniAssignment.addEventListener('click', (e) => {
                         e.stopPropagation();
                         openModal(assignment.id);
                     });
                     miniAssignment.addEventListener('keydown', (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                             openModal(assignment.id);
                         }
                     });

                     miniAssignmentsContainer.appendChild(miniAssignment);
                 });
                 dayCell.appendChild(miniAssignmentsContainer);
             } else {
                 dayCell.setAttribute('aria-label', `${year}년 ${month+1}월 ${day}일. 수행평가 없음.`);
             }

             calendarGrid.appendChild(dayCell);
         }

        const totalCells = startingDayOfWeek + daysInMonth;
        const remainingCells = (7 - (totalCells % 7)) % 7;
         for (let i = 0; i < remainingCells; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            emptyCell.setAttribute('role', 'gridcell');
            emptyCell.setAttribute('aria-hidden', 'true');
            calendarGrid.appendChild(emptyCell);
        }


         calendarContainer.appendChild(calendarGrid);
     }


    function navigateMonth(direction) {
        currentMonth += direction;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        filterAndRender(); // Use filter function
    }

    // 설명 텍스트 포맷팅 백업 함수 (contentFormatter.js가 로드되지 않은 경우 사용)
    function processDetailedContent(content) {
        if (!content) return '<p>상세 내용이 없습니다.</p>';
        let processed = content
            .replace(/\n{2,}/g, '</p><p>') // 여러 줄바꿈을 단락으로 변환
            .replace(/\n/g, '<br>') // 단일 줄바꿈을 <br>로 변환
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>') // URL을 링크로 변환
            .replace(/\[([^\]]+)\]/g, '<strong class="detailed-content-section">[$1]</strong>'); // 섹션 헤더 포맷팅
        return `<p>${processed}</p>`;
    }

    function openModal(assignmentId) {
         const assignment = getAssignmentById(assignmentId);
         if (!assignment || !assignmentDetailModal) return;

         modalTitle.textContent = assignment.title || '수행평가 상세';
         const subjectName = assignment.subject;
         modalSubject.textContent = subjectName;
         modalSubject.className = 'subject-tag';
         // 과목에 따라 태그 색상 적용
         modalSubject.style.backgroundColor = `var(--subject-${subjectName})`;
         modalSubject.style.color = '#000';  // 가독성을 위해 어두운 텍스트 색상

         const daysLeftStr = getDaysLeftText(assignment.dueDate);
         modalDate.innerHTML = `${formatDate(assignment.dueDate).slice(6, -4)} ${daysLeftStr ? `<strong>${daysLeftStr}</strong>` : ''}`;
         modalDate.className = 'date-display';

         // 중요도 관련 코드 제거됨

         // 새로운 포맷터 사용 - contentFormatter.js에서 정의된 함수
        const detailedHTML = window.ContentFormatter && window.ContentFormatter.processDetailedContent ? 
            window.ContentFormatter.processDetailedContent(assignment.description || assignment.detailedContent || '') :
            processDetailedContent(assignment.description || assignment.detailedContent || '상세 내용이 없습니다.');
         modalContentDisplay.innerHTML = detailedHTML;

         assignmentDetailModal.classList.remove('hidden');
         document.body.style.overflow = 'hidden';
         if (closeModalButton) closeModalButton.focus();
     }


    function closeModal() {
        if(assignmentDetailModal) assignmentDetailModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function setupModalListeners() {
        if (closeModalButton) {
            closeModalButton.addEventListener('click', closeModal);
        }
        if (assignmentDetailModal) {
            assignmentDetailModal.addEventListener('click', (e) => {
                if (e.target === assignmentDetailModal) {
                    closeModal();
                }
            });
            
            // Prevent touches on the modal content from closing the modal
            const modalContent = document.querySelector('.modal-content');
            if (modalContent) {
                modalContent.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                });
                
                // Improve scrolling on touch devices
                const modalBody = document.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.style.webkitOverflowScrolling = 'touch';
                }
            }
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && assignmentDetailModal && !assignmentDetailModal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }

    function switchToListView() {
        if (!listViewBtn || !calendarViewBtn || !listViewSection || !calendarViewSection) return;

        listViewBtn.classList.add('active');
        listViewBtn.setAttribute('aria-pressed', 'true');
        calendarViewBtn.classList.remove('active');
        calendarViewBtn.setAttribute('aria-pressed', 'false');

        listViewSection.classList.remove('hidden');
        calendarViewSection.classList.add('hidden');
    }

    function switchToCalendarView() {
        if (!listViewBtn || !calendarViewBtn || !listViewSection || !calendarViewSection) return;

        calendarViewBtn.classList.add('active');
        calendarViewBtn.setAttribute('aria-pressed', 'true');
        listViewBtn.classList.remove('active');
        listViewBtn.setAttribute('aria-pressed', 'false');

        calendarViewSection.classList.remove('hidden');
        listViewSection.classList.add('hidden');

        filterAndRender(); // Render calendar when switched
    }

     function filterAndRender() {
        const selectedSubjectIdOrName = subjectFilter.value; // Could be ID or Name depending on population
         const searchTerm = searchInput.value.toLowerCase().trim();
         currentAssignments = getAssignments(); // Get fresh list

         let filteredAssignments = currentAssignments.filter(assignment => {
             if (!assignment) return false; // Skip null/undefined assignments

            // Subject filtering (handle both ID and name in value)
             const subjectMatches = selectedSubjectIdOrName === 'all' ||
                                   assignment.subjectId === selectedSubjectIdOrName || // Check against ID
                                   assignment.subject === selectedSubjectIdOrName;    // Check against name

            // Search filtering
             const titleMatch = assignment.title && assignment.title.toLowerCase().includes(searchTerm);
             const descMatch = assignment.description && assignment.description.toLowerCase().includes(searchTerm);
             const detailMatch = assignment.detailedContent && assignment.detailedContent.toLowerCase().includes(searchTerm);
             const subjectName = getSubjectName(assignment.subjectId) || assignment.subject || '';
             const subjectNameMatch = subjectName.toLowerCase().includes(searchTerm);

             const searchMatch = !searchTerm || titleMatch || descMatch || detailMatch || subjectNameMatch;
             
             return subjectMatches && searchMatch;
         });


         if (listViewSection && !listViewSection.classList.contains('hidden')) {
             renderAssignments(filteredAssignments);
         } else if (calendarViewSection && !calendarViewSection.classList.contains('hidden')) {
             createCalendar(currentYear, currentMonth, filteredAssignments);
         }
     }

    function setupEventListeners() {
        if (subjectFilter) subjectFilter.addEventListener('change', filterAndRender);
        if (searchButton) searchButton.addEventListener('click', filterAndRender);
        if (searchInput) {
            searchInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    filterAndRender();
                }
                 // Optional: Add live search on timeout
                 // clearTimeout(searchTimeout);
                 // searchTimeout = setTimeout(filterAndRender, 300);
            });
        }
        
        if (listViewBtn) listViewBtn.addEventListener('click', switchToListView);
        if (calendarViewBtn) calendarViewBtn.addEventListener('click', switchToCalendarView);
        
        // 화면 재사이징 및 방향 변경 수지
        window.addEventListener('resize', handleResizeOrRotation);
        window.addEventListener('orientationchange', handleResizeOrRotation);
    }
    
    function handleResizeOrRotation() {
        // 캩8린더 모드에 있을 때만 리렌더링
        if (calendarViewSection && !calendarViewSection.classList.contains('hidden')) {
            // 재사이징/로테이션 동안 처리를 위해 약간 지연
            setTimeout(() => filterAndRender(), 300);
        }
        
        // 모바일인지 확인하여 추가 수정사항 적용
        const isMobile = window.innerWidth <= 480;
        if (isMobile) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }

    function initializeApp() {
        currentAssignments = getAssignments(); // Ensure assignments are loaded initially
         console.log(`App initializing with ${currentAssignments.length} assignments.`);
         populateSubjects();
         setupEventListeners();
         setupModalListeners();
         switchToListView(); // Default to list view
         filterAndRender(); // Initial render based on default filters
         
         // 초기화 시 모바일 여부 확인
         handleResizeOrRotation();
     }

    document.addEventListener('assignmentRegistered', initializeApp);

    initializeApp(); // Initial call

});