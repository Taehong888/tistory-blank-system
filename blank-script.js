document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn  = document.getElementById('fill-toggle');
  const wrongBtn   = document.getElementById('wrong-note');
  const showAllBtn = document.getElementById('show-all-btn');
  const bodyEl     = document.body;

  const blanks   = document.querySelectorAll('.blank');
  const inputs   = [];
  const answers  = [];

  let fullShown = false;

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

  function resetInputSizes() {
    inputs.forEach(function(input, idx) {
      const blankEl = blanks[idx];
      if (blankEl) {
        let bw = blankEl.offsetWidth;
        let bh = blankEl.offsetHeight;
        if (bw === 0) bw = 50;
        if (bh === 0) bh = 20;
        input.style.width  = bw + 'px';
        input.style.height = bh + 'px';
      }
    });
  }
  resetInputSizes();

  showAllBtn.addEventListener('click', function() {
    if (!fullShown) {
      blanks.forEach(function(blank, idx) {
        blank.style.setProperty('display', 'none', 'important');
        answers[idx].textContent = blank.getAttribute('data-answer');
        answers[idx].classList.add('full-answer');
        answers[idx].style.setProperty('display', 'inline-block', 'important');
      });
      inputs.forEach(input => input.style.setProperty('display', 'none', 'important'));
      showAllBtn.textContent = '전체 숨기기';
      fullShown = true;
    } else {
      blanks.forEach(function(blank, idx) {
        blank.style.setProperty('display', 'inline-block', 'important');
        answers[idx].textContent = '';
        answers[idx].classList.remove('full-answer');
        answers[idx].style.setProperty('display', 'none', 'important');
      });
      showAllBtn.textContent = '전체 보기';
      fullShown = false;
    }
  });

  toggleBtn.addEventListener('click', function() {
    if (bodyEl.classList.contains('fill-mode')) {
      // 채우기 모드 → 보기 모드
      bodyEl.classList.remove('fill-mode');
      toggleBtn.textContent = '빈칸 채우기 모드';

      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'none', 'important');
      });
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong', 'full-answer');
        span.removeAttribute('data-wrong');
      });
      blanks.forEach(blank => blank.style.setProperty('display', 'inline-block', 'important'));

      fullShown = false;
      showAllBtn.textContent = '전체 보기';

    } else {
      // 보기 모드 → 채우기 모드
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';

      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong', 'full-answer');
        span.removeAttribute('data-wrong');
      });
      inputs.forEach(function(input) {
        input.style.removeProperty('display');
      });
      if (inputs.length > 0) {
        inputs[0].style.setProperty('display', 'inline-block', 'important');
        inputs[0].focus();
      }
      blanks.forEach(blank => blank.style.setProperty('display', 'none', 'important'));

      fullShown = false;
      showAllBtn.textContent = '전체 보기';
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

  // 초기 버튼 상태 세팅
  if (!bodyEl.classList.contains('fill-mode')) {
    showAllBtn.style.display = 'inline-block';
    wrongBtn.style.display = 'none';
  } else {
    showAllBtn.style.display = 'none';
    wrongBtn.style.display = 'inline-block';
  }
});
