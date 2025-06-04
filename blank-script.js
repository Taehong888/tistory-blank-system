// ======================== blank-script.js (모든 빈칸 동시 표시 + 다음 칸 초기화 로직) ========================
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn  = document.getElementById('fill-toggle');
  const wrongBtn   = document.getElementById('wrong-note');
  const bodyEl     = document.body;
  const blanks     = document.querySelectorAll('.blank');
  const inputs     = [];
  const answers    = [];

  blanks.forEach(function(blank) {
    // (1) 입력란(input) 생성
    const inputEl = document.createElement('input');
    inputEl.type         = 'text';
    inputEl.className    = 'blank-input';
    inputEl.setAttribute('data-answer', blank.getAttribute('data-answer'));
    inputEl.placeholder  = '';
    inputEl.autocomplete = 'off';

    // (2) 정답 표시용 span 생성
    const spanEl = document.createElement('span');
    spanEl.className     = 'answered';
    spanEl.style.display = 'none';  // 초기에는 숨김

    // (3) 빈칸 요소 바로 뒤에 삽입 (순서: span → input)
    blank.insertAdjacentElement('afterend', spanEl);
    spanEl.insertAdjacentElement('afterend', inputEl);

    inputs.push(inputEl);
    answers.push(spanEl);
  });

  // (2-1) 페이지 로드 후, 각 input 크기를 기존 .blank와 동일하게 설정 및 숨김
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
      // ─── 채우기 모드 → 보기 모드 전환 ───
      bodyEl.classList.remove('fill-mode');
      toggleBtn.textContent = '빈칸 채우기 모드';

      // (3-1) 모든 입력란 숨김 및 값 초기화
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

      // (3-3) 모든 정답 span 초기화 및 숨김
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });

      // (3-4) 모든 입력란 보이게 & 값 초기화
      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
      });

      // (3-5) 첫 번째 입력란에만 포커스
      if (inputs.length > 0) {
        inputs[0].focus();
      }
    }
  });

  // (4) “오답노트” 버튼 클릭: 틀린 항목만 재입력 모드
  wrongBtn.addEventListener('click', function() {
    if (!bodyEl.classList.contains('fill-mode')) {
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';
      // (4-1) 모든 입력란 보이게 & 값 초기화
      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
      });
    }
    answers.forEach(function(span, idx) {
      if (span.classList.contains('wrong')) {
        // 오답 표시 숨김
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('wrong');
        span.removeAttribute('data-wrong');
        // 해당 인덱스 input 보이게 & 값 초기화 후 포커스
        const input = inputs[idx];
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
        input.focus();
      } else {
        // 맞은 칸은 숨김
        inputs[idx].style.setProperty('display', 'none', 'important');
      }
    });
  });

  // (5) 입력란 엔터키 이벤트: 공백 무시 채점 + 다음 입력란 포커스 이동
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

        // (5-2) 현재 입력란은 숨김 (정답/오답 표시 후)
        input.style.setProperty('display', 'none', 'important');

        // (5-3) 다음 입력란 보이기 + 포커스 & 값 초기화
        const nextInput = inputs[idx + 1];
        if (nextInput) {
          nextInput.value = '';  // ▶ 다음 칸 초기화
          nextInput.style.setProperty('display', 'inline-block', 'important');
          nextInput.focus();
        }
      }
    });

    // (5-4) 입력 중 이전 채점 상태 초기화
    input.addEventListener('input', function() {
      const idx        = Array.from(inputs).indexOf(input);
      const answerSpan = answers[idx];
      answerSpan.classList.remove('correct', 'wrong');
      answerSpan.removeAttribute('data-wrong');
    });
  });
});
// ================================================================================  
