document.addEventListener('DOMContentLoaded', function() {
  const blanks   = document.querySelectorAll('.blank');
  const toggleBtn  = document.getElementById('fill-toggle');
  const wrongBtn   = document.getElementById('wrong-note');
  const showAllBtn = document.getElementById('show-all-btn');
  const bodyEl     = document.body;

  let showAllOn = false;
  let answerSpans = [];

  showAllBtn.addEventListener('click', () => {
    if (!showAllOn) {
      blanks.forEach(blank => {
        blank.style.setProperty('display', 'none', 'important');

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
      blanks.forEach(blank => {
        blank.style.setProperty('display', 'inline-block', 'important');
      });
      answerSpans.forEach(span => {
        span.remove();
      });
      answerSpans = [];
      showAllBtn.textContent = '전체 보기';
      showAllOn = false;
    }
  });

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

  // 페이지 로드 시 한 번 input 크기 설정
  inputs.forEach(function(input, idx) {
    const blankEl = blanks[idx];
    if (blankEl) {
      const bw = blankEl.offsetWidth || 50;
      const bh = blankEl.offsetHeight || 20;
      input.style.width = bw + 'px';
      input.style.height = bh + 'px';
    }
  });

  toggleBtn.addEventListener('click', function() {
    if (bodyEl.classList.contains('fill-mode')) {
      // 채우기 모드 → 보기 모드 전환
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

      blanks.forEach(blank => {
        blank.style.setProperty('display', 'inline-block', 'important');
      });
      answerSpans.forEach(span => {
        span.remove();
      });
      answerSpans = [];
      showAllBtn.textContent = '전체 보기';
      showAllOn = false;

      // 버튼 표시 상태 업데이트
      showAllBtn.classList.add('visible');
      wrongBtn.classList.remove('visible');

    } else {
      // 보기 모드 → 채우기 모드 전환
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

      // 채우기 모드 진입 시 입력란 크기 재설정 (추가된 부분)
      inputs.forEach(function(input, idx) {
        const blankEl = blanks[idx];
        if (blankEl) {
          const bw = blankEl.offsetWidth || 50;
          const bh = blankEl.offsetHeight || 20;
          input.style.width = bw + 'px';
          input.style.height = bh + 'px';
        }
      });

      if (inputs.length > 0) {
        inputs[0].style.setProperty('display', 'inline-block', 'important');
        inputs[0].focus();
      }

      blanks.forEach(blank => {
        blank.style.setProperty('display', 'none', 'important');
      });

      answerSpans.forEach(span => {
        span.remove();
      });
      answerSpans = [];
      showAllBtn.textContent = '전체 보기';
      showAllOn = false;

      // 버튼 표시 상태 업데이트
      showAllBtn.classList.remove('visible');
      wrongBtn.classList.add('visible');
    }
  });

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

  // 초기 버튼 상태
  if (!bodyEl.classList.contains('fill-mode')) {
    showAllBtn.classList.add('visible');
    wrongBtn.classList.remove('visible');
  } else {
    showAllBtn.classList.remove('visible');
    wrongBtn.classList.add('visible');
  }
});
