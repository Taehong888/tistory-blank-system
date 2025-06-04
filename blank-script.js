// ======================== blank-script.js (전체 새로 작성) ========================
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn  = document.getElementById('fill-toggle');
  const wrongBtn   = document.getElementById('wrong-note');
  const bodyEl     = document.body;
  const blanks     = document.querySelectorAll('.blank');
  const inputs     = [];
  const answers    = [];

  // ▶ IME 조합 상태 추적용 WeakMap
  const composingMap = new WeakMap();

  // ▶ IME 버퍼(미완성 한글) 강제 커밋(해제) 함수
  function forceIMECommit() {
    const tempInput = document.createElement('input');
    tempInput.style.position   = 'absolute';
    tempInput.style.opacity    = '0';
    tempInput.setAttribute('autocomplete', 'off');
    tempInput.setAttribute('autocorrect', 'off');
    tempInput.setAttribute('autocapitalize', 'none');
    tempInput.setAttribute('spellcheck', 'false');
    bodyEl.appendChild(tempInput);
    tempInput.focus();
    tempInput.blur();
    bodyEl.removeChild(tempInput);
  }

  // 1) 각 .blank마다 <input> + <span> 생성
  blanks.forEach(function(blank, idx) {
    // (1) <input>
    const inputEl = document.createElement('input');
    inputEl.type         = 'text';
    inputEl.className    = 'blank-input';
    inputEl.setAttribute('data-answer', blank.getAttribute('data-answer'));
    inputEl.placeholder  = '';
    inputEl.autocomplete = 'off';

    // IME 조합 상태 추적
    inputEl.addEventListener('compositionstart', () => composingMap.set(inputEl, true));
    inputEl.addEventListener('compositionend',   () => composingMap.set(inputEl, false));
    composingMap.set(inputEl, false);

    // (2) <span class="answered"> (채점 후 정답/오답 표시용)
    const spanEl = document.createElement('span');
    spanEl.className     = 'answered';
    spanEl.style.display = 'none'; // 초기에는 숨김

    // (3) 빈칸(<span class="blank">) 바로 뒤에 insert: span → input 순서로
    blank.insertAdjacentElement('afterend', spanEl);
    spanEl.insertAdjacentElement('afterend', inputEl);

    inputs.push(inputEl);
    answers.push(spanEl);
  });

  // 2) 로드 직후: 각 input의 크기를 대응 blank와 똑같이 맞추고, 초기에는 숨김
  inputs.forEach(function(input, idx) {
    const blankEl = blanks[idx];
    if (blankEl) {
      input.style.width  = blankEl.offsetWidth + 'px';
      input.style.height = blankEl.offsetHeight + 'px';
    }
    input.style.setProperty('display', 'none', 'important');
  });

  // 3) “빈칸 채우기 모드” 버튼 클릭 → 토글
  toggleBtn.addEventListener('click', function() {
    if (bodyEl.classList.contains('fill-mode')) {
      // ─── 채우기 모드 → 보기 모드 전환 ───
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
      // ─── 보기 모드 → 채우기 모드 전환 ───
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';

      // (3-3) 모든 정답 span 초기화 + 숨김
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });

      // (3-4) 모든 입력란을 한꺼번에 보이도록 + 값도 비우기
      inputs.forEach(function(input) {
        input.value = ''; // 혹시 남아 있을 수 있는 값을 미리 비움
        input.style.setProperty('display', 'inline-block', 'important');
      });

      // (3-5) 첫 번째 입력란만 포커스
      if (inputs.length > 0) {
        // 첫 칸에 IME 버퍼를 깨끗이 비우고 값도 빈 상태에서 포커스
        forceIMECommit();
        inputs[0].value = '';
        inputs[0].focus();
      }
    }
  });

  // 4) “오답노트” 버튼 클릭 → 틀렸던 칸만 재입력 모드
  wrongBtn.addEventListener('click', function() {
    if (!bodyEl.classList.contains('fill-mode')) {
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';

      // (4-1) 모든 입력란 보이기 + 값 초기화
      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
      });
    }

    answers.forEach(function(span, idx) {
      if (span.classList.contains('wrong')) {
        // 틀린 칸만 보이기 + 값 초기화 + 포커스
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('wrong');
        span.removeAttribute('data-wrong');

        const input = inputs[idx];
        forceIMECommit();
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
        input.focus();
      } else {
        // 맞은 칸은 숨김
        inputs[idx].style.setProperty('display', 'none', 'important');
      }
    });
  });

  // 5) 입력란마다: 엔터키 누르면 “채점 → 다음 칸으로 포커스” 흐름
  inputs.forEach(function(input) {
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        // IME 조합 중엔 Enter 무시(커밋되지 않은 조합 막기)
        if (composingMap.get(input)) {
          return;
        }
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

        // (5-2) 현재 입력란 숨김(채점 결과를 span으로 보여주기 위함)
        input.style.setProperty('display', 'none', 'important');

        // (5-3) 다음 입력란만 “값을 빈 문자열로 초기화” + 보여준 뒤 포커스
        const nextInput = inputs[idx + 1];
        if (nextInput) {
          forceIMECommit();
          nextInput.value = '';  // ▶ **여기서만** 다음 칸의 값을 비웁니다.
          nextInput.style.setProperty('display', 'inline-block', 'important');
          nextInput.focus();
        }
      }
    });

    // (5-4) 입력 중에는 기존 채점 표시를 초기화
    input.addEventListener('input', function() {
      const idx        = Array.from(inputs).indexOf(input);
      const answerSpan = answers[idx];
      answerSpan.classList.remove('correct', 'wrong');
      answerSpan.removeAttribute('data-wrong');
    });
  });
});
// ================================================================================  
