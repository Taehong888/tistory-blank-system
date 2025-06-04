// ======================== blank-script.js (처음부터 새롭게 구현) ========================
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('fill-toggle');
  const wrongBtn = document.getElementById('wrong-note');
  const bodyEl = document.body;
  const blanks = document.querySelectorAll('.blank');
  const inputs = [];
  const answers = [];

  // IME 조합 상태 추적용 WeakMap
  const composingMap = new WeakMap();

  // IME 버퍼를 강제로 커밋(해제)하는 함수
  function forceIMECommit() {
    const tempInput = document.createElement('input');
    tempInput.style.position = 'absolute';
    tempInput.style.opacity = '0';
    tempInput.setAttribute('autocomplete', 'off');
    tempInput.setAttribute('autocorrect', 'off');
    tempInput.setAttribute('autocapitalize', 'none');
    tempInput.setAttribute('spellcheck', 'false');
    bodyEl.appendChild(tempInput);
    tempInput.focus();
    tempInput.blur();
    bodyEl.removeChild(tempInput);
  }

  // .blank마다 대응되는 <input>과 <span> 생성
  blanks.forEach(function(blank) {
    const inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.className = 'blank-input';
    inputEl.setAttribute('data-answer', blank.getAttribute('data-answer'));
    inputEl.placeholder = '';
    inputEl.autocomplete = 'off';

    // IME 조합 이벤트
    inputEl.addEventListener('compositionstart', () => composingMap.set(inputEl, true));
    inputEl.addEventListener('compositionend', () => composingMap.set(inputEl, false));
    composingMap.set(inputEl, false);

    const spanEl = document.createElement('span');
    spanEl.className = 'answered';
    spanEl.style.display = 'none';

    blank.insertAdjacentElement('afterend', spanEl);
    spanEl.insertAdjacentElement('afterend', inputEl);

    inputs.push(inputEl);
    answers.push(spanEl);
  });

  // 페이지 로드 후, <input> 크기 조정 및 숨김
  inputs.forEach(function(input, idx) {
    const blankEl = blanks[idx];
    if (blankEl) {
      input.style.width = blankEl.offsetWidth + 'px';
      input.style.height = blankEl.offsetHeight + 'px';
    }
    input.style.setProperty('display', 'none', 'important');
  });

  // “빈칸 채우기 모드” 버튼 클릭 토글
  toggleBtn.addEventListener('click', function() {
    if (bodyEl.classList.contains('fill-mode')) {
      // 채우기 모드 → 보기 모드
      bodyEl.classList.remove('fill-mode');
      toggleBtn.textContent = '빈칸 채우기 모드';

      // 모든 입력란 숨김 + 값 초기화
      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'none', 'important');
      });

      // 모든 정답 span 초기화 + 숨김
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });
    } else {
      // 보기 모드 → 채우기 모드
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';

      // 모든 정답 span 초기화 + 숨김
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });

      // 모든 입력란 한꺼번에 보이기 + 값 초기화
      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
      });

      // 첫 번째 입력란에만 포커스 (IME 버퍼 강제 해제 후)
      if (inputs.length > 0) {
        forceIMECommit();
        inputs[0].value = '';
        inputs[0].focus();
      }
    }
  });

  // “오답노트” 버튼 클릭: 틀린 칸만 재입력 모드
  wrongBtn.addEventListener('click', function() {
    if (!bodyEl.classList.contains('fill-mode')) {
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';

      // 모든 입력란 보이기 + 값 초기화
      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
      });
    }

    answers.forEach(function(span, idx) {
      if (span.classList.contains('wrong')) {
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('wrong');
        span.removeAttribute('data-wrong');

        const input = inputs[idx];
        forceIMECommit();
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
        input.focus();
      } else {
        inputs[idx].style.setProperty('display', 'none', 'important');
      }
    });
  });

  // 입력란 엔터키 이벤트: 공백 무시 채점 + 다음 칸 포커스
  inputs.forEach(function(input) {
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        if (composingMap.get(input)) return;
        event.preventDefault();

        const userRaw = input.value.trim();
        const userNorm = userRaw.replace(/\s+/g, '');
        const correctRaw = input.dataset.answer.trim();
        const correctNorm = correctRaw.replace(/\s+/g, '');
        const idx = Array.from(inputs).indexOf(input);
        const answerSpan = answers[idx];

        // 이전 채점 상태 초기화
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

        // 현재 입력란 숨김
        input.style.setProperty('display', 'none', 'important');

        // 다음 입력란 값 초기화 + 포커스 (IME 버퍼 해제 포함)
        const nextInput = inputs[idx + 1];
        if (nextInput) {
          forceIMECommit();
          nextInput.value = '';
          nextInput.style.setProperty('display', 'inline-block', 'important');
          nextInput.focus();
        }
      }
    });

    // 입력 중이면 이전 채점 상태 초기화
    input.addEventListener('input', function() {
      const idx = Array.from(inputs).indexOf(input);
      const answerSpan = answers[idx];
      answerSpan.classList.remove('correct', 'wrong');
      answerSpan.removeAttribute('data-wrong');
    });
  });
});
// ================================================================================  
