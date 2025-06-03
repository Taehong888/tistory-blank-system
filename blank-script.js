// ======================== blank-script.js (전체 교체) ========================
document.addEventListener('DOMContentLoaded', function() {
  // 1) blanks 변수 제일 먼저 선언 및 초기화
  const blanks   = document.querySelectorAll('.blank');

  const toggleBtn  = document.getElementById('fill-toggle');
  const wrongBtn   = document.getElementById('wrong-note');
  const bodyEl     = document.body;
  const showAllBtn = document.getElementById('show-all-btn');

  let showAllOn = false;

  // 2) 전체 보기 버튼 클릭 이벤트 (토글)
  showAllBtn.addEventListener('click', () => {
    if (!showAllOn) {
      blanks.forEach(blank => {
        blank.textContent = blank.getAttribute('data-answer');
        blank.style.color = '#333';  // 정답 보이게
      });
      showAllBtn.textContent = '전체 숨기기';
      showAllOn = true;
    } else {
      blanks.forEach(blank => {
        blank.textContent = '';
        blank.style.color = 'transparent';  // 정답 숨기기
      });
      showAllBtn.textContent = '전체 보기';
      showAllOn = false;
    }
  });

  // 3) .blank 요소별 input 및 정답 표시 span 생성
  const inputs   = [];
  const answers  = [];

  blanks.forEach(function(blank) {
    // 입력란(input) 생성
    const inputEl = document.createElement('input');
    inputEl.type         = 'text';
    inputEl.className    = 'blank-input';
    inputEl.setAttribute('data-answer', blank.getAttribute('data-answer'));
    inputEl.placeholder  = '';
    inputEl.autocomplete = 'off';

    // 정답 표시용 span 생성
    const spanEl = document.createElement('span');
    spanEl.className     = 'answered';
    spanEl.style.display = 'none';  // 초기 숨김

    // 빈칸 바로 뒤에 삽입 (순서: span → input)
    blank.insertAdjacentElement('afterend', spanEl);
    spanEl.insertAdjacentElement('afterend', inputEl);

    inputs.push(inputEl);
    answers.push(spanEl);
  });

  // 4) 각 input 크기를 blanks와 동일하게 설정
  inputs.forEach(function(input, idx) {
    const blankEl = blanks[idx];
    if (blankEl) {
      input.style.width  = blankEl.offsetWidth + 'px';
      input.style.height = blankEl.offsetHeight + 'px';
    }
  });

  // 5) 빈칸 채우기 모드 버튼 클릭 토글
  toggleBtn.addEventListener('click', function() {
    if (bodyEl.classList.contains('fill-mode')) {
      // 채우기 모드 → 보기 모드 전환
      bodyEl.classList.remove('fill-mode');
      toggleBtn.textContent = '빈칸 채우기 모드';

      // 입력란 숨김, 값 초기화
      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'none', 'important');
      });

      // 정답 span 초기화 및 숨김
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });

      // 전체 보기 상태 초기화
      blanks.forEach(blank => {
        blank.textContent = '';
        blank.style.color = 'transparent';
      });
      showAllBtn.textContent = '전체 보기';
      showAllOn = false;

    } else {
      // 보기 모드 → 채우기 모드 전환
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';

      // 정답 span 초기화 및 숨김
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });

      // 입력란 보이기 (첫 번째만 포커스)
      inputs.forEach(function(input) {
        input.style.removeProperty('display');
      });
      if (inputs.length > 0) {
        inputs[0].style.setProperty('display', 'inline-block', 'important');
        inputs[0].focus();
      }

      // 전체 보기 상태 초기화
      blanks.forEach(blank => {
        blank.textContent = '';
        blank.style.color = 'transparent';
      });
      showAllBtn.textContent = '전체 보기';
      showAllOn = false;
    }
  });

  // 6) 오답노트 버튼 클릭: 틀린 항목만 재입력 모드
  wrongBtn.addEventListener('click', function() {
    if (!bodyEl.classList.contains('fill-mode')) {
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';
    }
    answers.forEach(function(span, idx) {
      if (span.classList.contains('wrong')) {
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('wrong');
        span.removeAttribute('data-wrong');

        const input = inputs[idx];
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
        input.focus();
      }
    });
  });

  // 7) 입력란 엔터키 이벤트: 채점 + 다음 입력란 포커스 이동
  inputs.forEach(function(input) {
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();

        const userRaw    = input.value.trim();
        const userNorm   = userRaw.replace(/\s+/g, '');
        const correctRaw = input.dataset.answer.trim();
        const correctNorm= correctRaw.replace(/\s+/g, '');
        const idx        = Array.from(inputs).indexOf(input);
        const answerSpan = answers[idx];

        answerSpan.classList.remove('correct', 'wrong');
        answerSpan.removeAttribute('data-wrong');

        if (userNorm === correctNorm) {
          answerSpan.textContent   = correctRaw;
          answerSpan.classList.add('correct');
          answerSpan.style.setProperty('display', 'inline-block', 'important');
        } else {
          answerSpan.textContent   = correctRaw;
          answerSpan.classList.add('wrong');
          answerSpan.setAttribute('data-wrong', userRaw);
          answerSpan.style.setProperty('display', 'inline-block', 'important');
        }

        input.style.setProperty('display', 'none', 'important');

        const nextInput = inputs[idx + 1];
        if (nextInput) {
          nextInput.style.setProperty('display', 'inline-block', 'important');
          nextInput.focus();
        }
      }
    });

    input.addEventListener('input', function() {
      const idx        = Array.from(inputs).indexOf(input);
      const answerSpan = answers[idx];
      answerSpan.classList.remove('correct', 'wrong');
      answerSpan.removeAttribute('data-wrong');
    });
  });
});
// ================================================================================
