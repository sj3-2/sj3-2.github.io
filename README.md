# 3학년 2반 과제 알리미 (Class 3-2 Assignment Tracker)

![웹사이트 미리보기](https://sj3-2.github.io/images/preview.png)

## 소개 (Introduction)

3학년 2반 과제 알리미는 학급 학생들이 다가오는 수행평가와 과제를 쉽게 확인할 수 있도록 설계된 웹 기반 시스템입니다. 이 웹사이트는 다음과 같은 기능을 제공합니다:

- **목록 보기**: 모든 과제를 마감일 순으로 정렬된 카드 형태로 확인
- **캘린더 보기**: 월별 캘린더에서 과제 마감일 시각적으로 확인
- **과목별 필터링**: 특정 과목의 과제만 볼 수 있는 드롭다운 필터
- **키워드 검색**: 과제 제목, 설명, 내용에서 키워드 검색 기능
- **상세 정보 확인**: 과제별 상세 설명과 요구사항을 모달 창에서 확인
- **남은 기간 표시**: 마감일까지 남은 일수 자동 계산 및 표시

이 사이트는 GitHub Pages를 통해 호스팅되며, 새로운 과제는 JavaScript 파일을 통해 등록됩니다. 
과제 추가 시 `build.js` 스크립트를 실행하여 시스템을 업데이트하거나, `update.bat` 스크립트를 통해 
빌드-커밋-푸시 과정을 자동화할 수 있습니다.