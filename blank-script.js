// ======================== blank-script.js (전체 교체) ========================
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn  = document.getElementById('fill-toggle');
  const wrongBtn   = document.getElementById('wrong-note');
  const bodyEl     = document.body;
  const blanks     = document.querySelectorAll('.blank');
  const inputs     = [];
  const answers    = [];

  // IME 조작 상태를 추적할 Map
  const composingMap = new WeakMap();

  // ▶ 임시 입력칸을 만들어 IME 조합 상태를 강제로 종료시키는 헬퍼
  function forceIMECommit() {
    const tempInput = document.createElement('input');
    tempInput.style.position = 'absolute';
    tempInput.style.opacity  = '0';
    tempInput.autocorrect     = 'off';
    tempInput.autocomplete    = 'off';
    tempInput.autocapitalize  = 'none';
    tempInput.spellcheck      = false;
    bodyEl.appendChild(tempInput);
    tempInput.focus();
    tempInput.blur();
    bodyEl.removeChild(tempInput);
  }

  blanks.forEach(function(blank) {
    // (1) 입력란(input) 생성
    const inputEl = document.createElement('input');
    inputEl.type         = 'text';
    inputEl.className    = 'blank-input';
    inputEl.setAttribute('data-answer', blank.getAttribute('data-answer'));
    inputEl.placeholder  = '';

    // ↓ IME 관련 속성 추가 ↓
    inputEl.setAttribute('autocomplete', 'off');      // 자동완성 끄기
    inputEl.setAttribute('autocorrect', 'off');       // iOS 자동수정 끄기
    inputEl.setAttribute('autocapitalize', 'none');   // 자동 대문자화 끄기 (iOS에서는 "none")
    inputEl.setAttribute('spellcheck', 'false');      // 맞춤법 검사 끄기
    inputEl.style.webkitTextAutocorrect = 'off';      // iOS WebKit 자동 수정 끄기
    inputEl.style.webkitTextTransform  = 'none';      // iOS WebKit 텍스트 변환 없음

    // IME 조합 시작/종료 이벤트 리스너
    inputEl.addEventListener('compositionstart', function() {
      composingMap.set(inputEl, true);
    });
    inputEl.addEventListener('compositionend', function() {
      composingMap.set(inputEl, false);
    });

    // (2) 정답 표시용 span 생성
    const spanEl = document.createElement('span');
    spanEl.className     = 'answered';
    spanEl.style.display = 'none';  // 초기에는 숨김

    // (3) 빈칸 요소 바로 뒤에 삽입 (순서: span → input)
    blank.insertAdjacentElement('afterend', spanEl);
    spanEl.insertAdjacentElement('afterend', inputEl);

    inputs.push(inputEl);
    answers.push(spanEl);

    // 기본 composing 상태를 false로 설정
    composingMap.set(inputEl, false);
  });

  // (2-1) 페이지 로드 후, 각 input 크기를 기존 .blank와 동일하게 설정
  inputs.forEach(function(input, idx) {
    const blankEl = blanks[idx];
    if (blankEl) {
      const bw = blankEl.offsetWidth;
      const bh = blankEl.offsetHeight;
      input.style.width  = bw + 'px';
      input.style.height = bh + 'px';
      // input 초기 상태 숨김 (fill-mode가 아닐 때)
      input.style.setProperty('display', 'none', 'important');
    }
  });

  // (3) “빈칸 채우기 모드” 버튼 클릭 토글
  toggleBtn.addEventListener('click', function() {
    if (bodyEl.classList.contains('fill-mode')) {
      // ─── 채우기 모드 → 보기 모드 전환 ───
      bodyEl.classList.remove('fill-mode');
      toggleBtn.textContent = '빈칸 채우기 모드';

      // (3-1) 모든 입력란 숨김, 값 초기화
      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'none', 'important');
      });

      // (3-2) 모든 정답 span 초기화 및 숨김
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

      // (3-3) 기존 정답 span 초기화 후 숨김
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });

      // (3-4) 각 input 보이고 값 비우기
      inputs.forEach(function(input) {
        input.value = '';
        input.style.removeProperty('display'); // 인라인 스타일에서 display:none!important 제거
      });

      // (3-5) 첫 번째 입력란만 보이게 → 포커스
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
        // 오답 표시 숨기기
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('wrong');
        span.removeAttribute('data-wrong');

        // 해당 입력란 보이기 & 값 비우고 포커스
        const input = inputs[idx];
        input.value = '';
        inputs.forEach((inp, i) => {
          if (i === idx) {
            inp.style.setProperty('display', 'inline-block', 'important');
            inp.focus();
          } else {
            inp.style.setProperty('display', 'none', 'important');
          }
        });
      }
    });
  });

  // (5) 입력란 이벤트 처리: Enter, input
  inputs.forEach(function(input) {
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        // IME 조합 중엔 처리하지 않음
        if (composingMap.get(input)) {
          return;
        }
        event.preventDefault();

        // ▶ IME 조합 상태 강제 종료
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

        // (5-3) 다음 입력란 보이기 + 포커스
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
          }, 50); // 50ms 딜레이를 줘서 IME가 완전히 종료될 시간을 확보
        }
      }
    });

    // (5-4) 입력 도중 이전 채점 상태 초기화
    input.addEventListener('input', function() {
      const idx        = Array.from(inputs).indexOf(input);
      const answerSpan = answers[idx];
      answerSpan.classList.remove('correct', 'wrong');
      answerSpan.removeAttribute('data-wrong');
    });
  });
});
// ================================================================================
