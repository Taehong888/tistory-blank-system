document.addEventListener('DOMContentLoaded', function() {
  const blanks   = document.querySelectorAll('.blank');
  const toggleBtn  = document.getElementById('fill-toggle');
  const wrongBtn   = document.getElementById('wrong-note');
  const showAllBtn = document.getElementById('show-all-btn');
  const bodyEl     = document.body;

  let showAllOn = false;
  let answerSpans = []; // 전체 보기용 정답 텍스트 요소 저장

  // 전체 보기 버튼 클릭 이벤트
  showAllBtn.addEventListener('click', () => {
    if (!showAllOn) {
      // 전체 보기 ON
      blanks.forEach(blank => {
        blank.style.display = 'none'; // 박스 숨김

        // 정답 텍스트 표시 span 생성
        const ansSpan = document.createElement('span');
        ansSpan.textContent = blank.getAttribute('data-answer');
        ansSpan.className = 'answered correct full-show';
        ansSpan.style.margin = '0 3px';

        blank.parentNode.insertBefore(ansSpan, blank.nextSibling);
        answerSpans.push(ansSpan);
      });
      showAllBtn.textContent = '전체 숨기기';
      showAllOn = true;
    } else {
      // 전체 보기 OFF
      blanks.forEach(blank => {
        blank.style.display = ''; // 박스 복원
      });
      answerSpans.forEach(span => {
        span.remove();
      });
      answerSpans = [];
      showAllBtn.textContent = '전체 보기';
      showAllOn = false;
    }
  });

  // .blank 요소별 input, 정답 span 생성
  const inputs   = [];
  const answers  = [];

  blanks.forEach(function(blank) {
    const inputEl = document.createElement('input');
    inputEl.type         = 'text';
    inputEl.className    = 'blank-input';
    inputEl.setAttribute('data-answer', blank.getAttribute('data-answer'));
    inputEl.placeholder  = '';
    inputEl.autocomplete = 'off';

    const spanEl = document.createElement('span');
    spanEl.className     = 'answered';
    spanEl.style.display = 'none';

    blank.insertAdjacentElement('afterend', spanEl);
    spanEl.insertAdjacentElement('afterend', inputEl);

    inputs.push(inputEl);
    answers.push(spanEl);
  });

  // 입력창 크기 맞춤
  inputs.forEach(function(input, idx) {
    const blankEl = blanks[idx];
    if (blankEl) {
      input.style.width  = blankEl.offsetWidth + 'px';
      input.style.height = blankEl.offsetHeight + 'px';
    }
  });

  // 빈칸 채우기 모드 버튼 토글
  toggleBtn.addEventListener('click', function() {
    if (bodyEl.classList.contains('fill-mode')) {
      bodyEl.classList.remove('fill-mode');
      toggleBtn.textContent = '빈칸 채우기 모드';

      inputs.forEach(input => {
        input.value = '';
        input.style.setProperty('display', 'none', 'important');
      });

      answers.forEach(span => {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });

      // 전체 보기 상태 초기화
      blanks.forEach(blank => {
        blank.style.display = '';
      });
      answerSpans.forEach(span => {
        span.remove();
      });
      answerSpans = [];
      showAllBtn.textContent = '전체 보기';
      showAllOn = false;

    } else {
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';

      answers.forEach(span => {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });

      inputs.forEach(input => {
        input.style.removeProperty('display');
      });

      if (inputs.length > 0) {
        inputs[0].style.setProperty('display', 'inline-block', 'important');
        inputs[0].focus();
      }

      blanks.forEach(blank => {
        blank.style.display = 'none';
      });

      // 전체 보기 상태 초기화
      answerSpans.forEach(span => {
        span.remove();
      });
      answerSpans = [];
      showAllBtn.textContent = '전체 보기';
      showAllOn = false;
    }
  });

  // 오답노트 버튼 클릭
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

  // 입력란 엔터 이벤트 (채점 + 다음 입력란 포커스)
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
