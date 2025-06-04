// ======================== blank-script.js (전체 교체) ========================
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn  = document.getElementById('fill-toggle');
  const wrongBtn   = document.getElementById('wrong-note');
  const bodyEl     = document.body;
  const blanks     = document.querySelectorAll('.blank');
  const inputs     = Array.from(document.querySelectorAll('.blank-input'));
  const answers    = Array.from(document.querySelectorAll('.answered'));

  blanks.forEach(function(blank, idx) {
    const inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.className = 'blank-input';
    inputEl.setAttribute('data-answer', blank.getAttribute('data-answer'));
    inputEl.placeholder = '';
    inputEl.autocomplete = 'off';

    const spanEl = document.createElement('span');
    spanEl.className = 'answered';
    spanEl.style.display = 'none';  // 초기에는 숨김

    blank.insertAdjacentElement('afterend', spanEl);
    spanEl.insertAdjacentElement('afterend', inputEl);
  });

  inputs.forEach(function(input, idx) {
    const blankEl = blanks[idx];
    if (blankEl) {
      const bw = blankEl.offsetWidth;
      const bh = blankEl.offsetHeight;
      input.style.width  = bw + 'px';
      input.style.height = bh + 'px';
    }
  });

  toggleBtn.addEventListener('click', function() {
    if (bodyEl.classList.contains('fill-mode')) {
      bodyEl.classList.remove('fill-mode');
      toggleBtn.textContent = '빈칸 채우기 모드';
      inputs.forEach(function(input) {
        input.value = '';  // 모든 입력값 초기화
        input.style.setProperty('display', 'none', 'important');
      });

      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });
    } else {
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });

      inputs.forEach(function(input) {
        input.style.removeProperty('display');
      });

      if (inputs.length > 0) {
        inputs[0].style.setProperty('display', 'inline-block', 'important');
        inputs[0].focus();  // 첫 번째 입력란에 포커스 설정
      }
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
        input.value = '';  // 오답일 경우 값 초기화
        input.style.setProperty('display', 'inline-block', 'important');
        input.focus();  // 해당 입력란에 포커스 설정
      }
    });
  });

  inputs.forEach(function(input) {
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const userRaw = input.value.trim();
        const userNorm = userRaw.replace(/\s+/g, '');
        const correctRaw = input.dataset.answer.trim();
        const correctNorm = correctRaw.replace(/\s+/g, '');
        const idx = inputs.indexOf(input);
        const answerSpan = answers[idx];

        answerSpan.classList.remove('correct', 'wrong');
        answerSpan.removeAttribute('data-wrong');

        if (userNorm === correctNorm) {
          answerSpan.textContent = correctRaw;
          answerSpan.classList.add('correct');
          answerSpan.style.setProperty('display', 'inline-block', 'important');
        } else {
          answerSpan.textContent = correctRaw;
          answerSpan.classList.add('wrong');
          answerSpan.setAttribute('data-wrong', userRaw);
          answerSpan.style.setProperty('display', 'inline-block', 'important');
        }

        input.value = '';  // 입력란 값 초기화
        input.style.setProperty('display', 'none', 'important');  // 입력란 숨기기

        // 다음 입력란에 포커스를 이동
        const nextInput = inputs[idx + 1];
        if (nextInput) {
          nextInput.style.setProperty('display', 'inline-block', 'important');
          nextInput.focus();
        }
      }
    });

    input.addEventListener('input', function() {
      const idx = inputs.indexOf(input);
      const answerSpan = answers[idx];
      answerSpan.classList.remove('correct', 'wrong');
      answerSpan.removeAttribute('data-wrong');
    });
  });
});
// ================================================================================
