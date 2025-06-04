// ======================== blank-script.js (최소 수정: 첫 빈칸에 IME 버퍼 강제 해제 + 초기화) ========================
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn  = document.getElementById('fill-toggle');
  const wrongBtn   = document.getElementById('wrong-note');
  const bodyEl     = document.body;
  const blanks     = document.querySelectorAll('.blank');
  const inputs     = [];
  const answers    = [];

  // ▶ IME 조합 상태를 추적하기 위한 WeakMap
  const composingMap = new WeakMap();

  // ▶ IME 버퍼를 강제로 커밋(해제)하는 헬퍼 함수 (iPad IME 잔여 글자 제거용)
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

  blanks.forEach(function(blank, idx) {
    // (1) 빈칸(<span class="blank">) 바로 뒤에 대응되는 <input> 생성
    const inputEl = document.createElement('input');
    inputEl.type         = 'text';
    inputEl.className    = 'blank-input';
    inputEl.setAttribute('data-answer', blank.getAttribute('data-answer'));
    inputEl.placeholder  = '';
    inputEl.autocomplete = 'off';

    // IME 조합 시작/종료 상태 추적
    inputEl.addEventListener('compositionstart', () => composingMap.set(inputEl, true));
    inputEl.addEventListener('compositionend', () => composingMap.set(inputEl, false));
    composingMap.set(inputEl, false);

    // ▶ 포커스될 때 IME 버퍼 강제 해제 + 값 초기화
    inputEl.addEventListener('focus', function() {
      forceIMECommit();
      this.value = '';
    });

    // (2) 정답 표시용 <span>
    const spanEl = document.createElement('span');
    spanEl.className     = 'answered';
    spanEl.style.display = 'none'; // 숨김

    // (3) .blank 바로 뒤에 'span → input' 삽입
    blank.insertAdjacentElement('afterend', spanEl);
    spanEl.insertAdjacentElement('afterend', inputEl);

    inputs.push(inputEl);
    answers.push(spanEl);
  });

  // (2-1) 로드 후, 각 input 크기를 빈칸과 동일하게 맞추고 숨김
  inputs.forEach(function(input, idx) {
    const blankEl = blanks[idx];
    if (blankEl) {
      input.style.width  = blankEl.offsetWidth + 'px';
      input.style.height = blankEl.offsetHeight + 'px';
    }
    input.style.setProperty('display', 'none', 'important');
  });

  // (3) “빈칸 채우기 모드” 버튼 클릭 → 토글
  toggleBtn.addEventListener('click', function() {
    if (bodyEl.classList.contains('fill-mode')) {
      // ─── 채우기 모드 → 보기 모드 ───
      bodyEl.classList.remove('fill-mode');
      toggleBtn.textContent = '빈칸 채우기 모드';

      // (3-1) 모든 입력란 숨김 + 값 초기화
      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'none', 'important');
      });
      // (3-2) 모든 정답 span 초기화 + 숨김
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });

    } else {
      // ─── 보기 모드 → 채우기 모드 ───
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';

      // (3-3) 모든 정답 span 초기화 + 숨김
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });

      // (3-4) 첫 번째 입력란만 보이도록 (나머지는 숨김)
      inputs.forEach(function(input, i) {
        input.value = ''; // 토글 전 남아 있을 수 있는 값을 지웁니다.
        if (i === 0) {
          // ▶ 첫 칸을 보여주기 전, IME 버퍼 강제 해제 + 값 초기화
          forceIMECommit();
          input.value = '';
          input.style.setProperty('display', 'inline-block', 'important');
          input.focus();
        } else {
          input.style.setProperty('display', 'none', 'important');
        }
      });
    }
  });

  // (4) “오답노트” 버튼 클릭 → 틀린 칸만 재입력 모드
  wrongBtn.addEventListener('click', function() {
    if (!bodyEl.classList.contains('fill-mode')) {
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';
    }
    answers.forEach(function(span, idx) {
      if (span.classList.contains('wrong')) {
        // 오답인 칸만 input 보이기
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('wrong');
        span.removeAttribute('data-wrong');

        const input = inputs[idx];
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
        input.focus();
      } else {
        // 맞은 칸은 숨기기
        inputs[idx].style.setProperty('display', 'none', 'important');
      }
    });
  });

  // (5) 입력란 엔터키 이벤트 (채점 → 다음 칸 이동)
  inputs.forEach(function(input) {
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        // IME 조합 중에는 Enter 무시 (아직 조합 중이면 커밋되지 않은 상태)
        if (composingMap.get(input)) return;
        event.preventDefault();

        const userRaw    = input.value.trim();
        const userNorm   = userRaw.replace(/\s+/g, '');
        const correctRaw = input.dataset.answer.trim();
        const correctNorm= correctRaw.replace(/\s+/g, '');
        const idx        = Array.from(inputs).indexOf(input);
        const answerSpan = answers[idx];

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

        // (5-2) 현재 input 숨김
        input.style.setProperty('display', 'none', 'important');

        // (5-3) 다음 빈칸(input) 보여주기 전에 IME 버퍼 강제 해제 + 값 초기화
        const nextInput = inputs[idx + 1];
        if (nextInput) {
          forceIMECommit();
          nextInput.value = '';
          nextInput.style.setProperty('display', 'inline-block', 'important');
          nextInput.focus();
        }
      }
    });

    // (5-4) 입력 중이면 이전 채점 상태 초기화
    input.addEventListener('input', function() {
      const idx        = Array.from(inputs).indexOf(input);
      const answerSpan = answers[idx];
      answerSpan.classList.remove('correct', 'wrong');
      answerSpan.removeAttribute('data-wrong');
    });
  });
});
// ================================================================================  
