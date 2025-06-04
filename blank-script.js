// ======================== blank-script.js (전체 교체) ========================
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('fill-toggle');
  const wrongBtn  = document.getElementById('wrong-note');
  const bodyEl    = document.body;
  const blanks    = document.querySelectorAll('.blank');
  const inputs    = [];
  const answers   = [];

  // IME 조합 상태를 추적하는 Map
  const composingMap = new WeakMap();

  // ▶ IME 조합 버퍼를 강제로 해제하는 헬퍼 함수
  function forceIMECommit() {
    const tempInput = document.createElement('input');
    tempInput.style.position = 'absolute';
    tempInput.style.opacity  = '0';
    tempInput.setAttribute('autocomplete', 'off');
    tempInput.setAttribute('autocorrect', 'off');
    tempInput.setAttribute('autocapitalize', 'none');
    tempInput.setAttribute('spellcheck', 'false');
    bodyEl.appendChild(tempInput);
    tempInput.focus();
    tempInput.blur();
    bodyEl.removeChild(tempInput);
  }

  blanks.forEach(function(blank) {
    // (1) 빈칸(<span class="blank" data-answer="…">) 뒤에 입력란 생성
    const inputEl = document.createElement('input');
    inputEl.type      = 'text';
    inputEl.className = 'blank-input';
    inputEl.setAttribute('data-answer', blank.getAttribute('data-answer'));
    inputEl.placeholder = '';

    // ↓ IME(한글 조합) 관련 속성 추가 ↓
    inputEl.setAttribute('autocomplete', 'off');
    inputEl.setAttribute('autocorrect', 'off');
    inputEl.setAttribute('autocapitalize', 'none');
    inputEl.setAttribute('spellcheck', 'false');
    inputEl.style.webkitTextAutocorrect = 'off';
    inputEl.style.webkitTextTransform  = 'none';

    // 조합 시작/종료 이벤트로 IME 상태 추적
    inputEl.addEventListener('compositionstart', function() {
      composingMap.set(inputEl, true);
    });
    inputEl.addEventListener('compositionend', function() {
      composingMap.set(inputEl, false);
    });
    composingMap.set(inputEl, false);

    // ▶ 포커스될 때 이전 조합 상태 해제&값 초기화
    inputEl.addEventListener('focus', function() {
      forceIMECommit();
      this.value = '';
    });

    // (2) 정답 표시용 <span> 생성
    const spanEl = document.createElement('span');
    spanEl.className     = 'answered';
    spanEl.style.display = 'none';

    // (3) .blank 바로 뒤에 'span → input' 순서로 삽입
    blank.insertAdjacentElement('afterend', spanEl);
    spanEl.insertAdjacentElement('afterend', inputEl);

    inputs.push(inputEl);
    answers.push(spanEl);
  });

  // (2-1) 로드 후, 각 input 크기를 기존 .blank와 동일하게 맞추고 숨김
  inputs.forEach(function(input, idx) {
    const blankEl = blanks[idx];
    if (blankEl) {
      const bw = blankEl.offsetWidth;
      const bh = blankEl.offsetHeight;
      input.style.width  = bw + 'px';
      input.style.height = bh + 'px';
    }
    input.style.setProperty('display', 'none', 'important');
  });

  // (3) “빈칸 채우기 모드” 버튼 클릭 토글
  toggleBtn.addEventListener('click', function() {
    if (bodyEl.classList.contains('fill-mode')) {
      // ▼ 채우기 모드 → 보기 모드
      bodyEl.classList.remove('fill-mode');
      toggleBtn.textContent = '빈칸 채우기 모드';

      // (3-1) 모든 입력란 숨김 & 값 초기화
      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'none', 'important');
      });
      // (3-2) 모든 정답 <span> 초기화 & 숨김
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });
    } else {
      // ▼ 보기 모드 → 채우기 모드
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';

      // (3-3) 모든 정답 <span> 초기화 & 숨김
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });

      // (3-4) 모든 입력란 보이고 값 초기화
      inputs.forEach(function(input) {
        input.value = '';
        input.style.removeProperty('display');
      });
      // (3-5) 첫 번째 입력란만 표시 & 포커스
      if (inputs.length > 0) {
        inputs.forEach((inp, i) => {
          if (i === 0) {
            inp.style.setProperty('display', 'inline-block', 'important');
            inp.focus();
          } else {
            inp.style.setProperty('display', 'none', 'important');
          }
        });
      }
    }
  });

  // (4) “오답노트” 버튼 클릭: 틀린 항목만 재입력 모드
  wrongBtn.addEventListener('click', function() {
    if (!bodyEl.classList.contains('fill-mode')) {
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';
    }
    answers.forEach(function(span, idx) {
      if (span.classList.contains('wrong')) {
        // 오답 표시 숨김
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('wrong');
        span.removeAttribute('data-wrong');

        // 해당 입력란만 보이게 & 값 초기화 후 포커스
        inputs.forEach((inp, i) => {
          if (i === idx) {
            inp.value = '';
            inp.style.setProperty('display', 'inline-block', 'important');
            inp.focus();
          } else {
            inp.style.setProperty('display', 'none', 'important');
          }
        });
      }
    });
  });

  // (5) 입력란 이벤트 처리: Enter키 + 입력 중 채점 초기화
  inputs.forEach(function(input) {
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        // IME 조합 중엔 무시
        if (composingMap.get(input)) {
          return;
        }
        event.preventDefault();

        // ▶ IME 조합 버퍼 강제 해제
        input.blur();
        forceIMECommit();

        const userRaw     = input.value.trim();
        const userNorm    = userRaw.replace(/\s+/g, '');
        const correctRaw  = input.dataset.answer.trim();
        const correctNorm = correctRaw.replace(/\s+/g, '');
        const idx         = Array.from(inputs).indexOf(input);
        const answerSpan  = answers[idx];

        // (5-1) 이전 채점 상태 초기화
        answerSpan.classList.remove('correct', 'wrong');
        answerSpan.removeAttribute('data-wrong');

        if (userNorm === correctNorm) {
          // 정답 처리
          answerSpan.textContent   = correctRaw;
          answerSpan.classList.add('correct');
          answerSpan.style.setProperty('display', 'inline-block', 'important');
        } else {
          // 오답 처리
          answerSpan.textContent   = correctRaw;
          answerSpan.classList.add('wrong');
          answerSpan.setAttribute('data-wrong', userRaw);
          answerSpan.style.setProperty('display', 'inline-block', 'important');
        }

        // (5-2) 현재 입력란 숨김
        input.style.setProperty('display', 'none', 'important');

        // (5-3) 다음 입력란 보이기 + 포커스 (50ms 딜레이)
        const nextInput = inputs[idx + 1];
        if (nextInput) {
          setTimeout(function() {
            inputs.forEach((inp, i) => {
              if (i === idx + 1) {
                inp.value = '';
                inp.style.setProperty('display', 'inline-block', 'important');
                inp.focus();
              } else {
                inp.style.setProperty('display', 'none', 'important');
              }
            });
          }, 50);
        }
      }
    });

    // (5-4) 입력 중 이전 채점 상태 초기화
    input.addEventListener('input', function() {
      const idx       = Array.from(inputs).indexOf(input);
      const answerSpan = answers[idx];
      answerSpan.classList.remove('correct', 'wrong');
      answerSpan.removeAttribute('data-wrong');
    });
  });
});
// ================================================================================
