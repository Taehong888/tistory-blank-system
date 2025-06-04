// ======================== 수정된 blank-script.js ========================
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn  = document.getElementById('fill-toggle');
  const wrongBtn   = document.getElementById('wrong-note');
  const bodyEl     = document.body;
  
  // IME 충돌 방지 변수
  let isComposing = false;

  // IME 시작/끝 이벤트 등록
  document.addEventListener('compositionstart', () => { isComposing = true; });
  document.addEventListener('compositionend', () => { isComposing = false; });
  
  // .blank 요소들을 찾아서 배열로 저장
  const blanks   = document.querySelectorAll('.blank');
  const inputs   = [];
  const answers  = [];

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
    spanEl.style.display = 'none';  // 초기 숨김

    // (3) 바로 뒤에 삽입
    blank.insertAdjacentElement('afterend', spanEl);
    spanEl.insertAdjacentElement('afterend', inputEl);

    inputs.push(inputEl);
    answers.push(spanEl);
  });

  // (2-1) Input 크기 기존 .blank와 동일하게 설정
  inputs.forEach(function(input, idx) {
    const blankEl = blanks[idx];
    if (blankEl) {
      const bw = blankEl.offsetWidth;
      const bh = blankEl.offsetHeight;
      input.style.width  = bw + 'px';
      input.style.height = bh + 'px';
    }
  });

  // (3) “빈칸 채우기 모드” 버튼 클릭
  toggleBtn.addEventListener('click', function() {
    if (bodyEl.classList.contains('fill-mode')) {
      // 전환: 채우기모드 → 보기모드
      bodyEl.classList.remove('fill-mode');
      toggleBtn.textContent = '빈칸 채우기 모드';
      // 숨기기
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
    } else {
      // 전환: 보기모드 → 채우기모드
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';
      // 정답 span 숨기기
      answers.forEach(span => {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });
      // input 표시
      inputs.forEach(input => {
        input.style.removeProperty('display');
      });
      // 첫 input 포커스
      if (inputs.length > 0) {
        inputs[0].style.setProperty('display', 'inline-block', 'important');
        inputs[0].focus();
      }
    }
  });

  // (4) 오답노트 버튼 클릭
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

  // (5) 입력란 엔터키 이벤트 + IME 상태 체크
  inputs.forEach(function(input) {
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        if (isComposing) return; // IME 중단시 무시
        event.preventDefault();
        setTimeout(function() {
          const userRaw    = input.value.trim();
          const userNorm   = userRaw.replace(/\s+/g, '');
          const correctRaw = input.dataset.answer.trim();
          const correctNorm= correctRaw.replace(/\s+/g, '');
          const idx        = Array.from(inputs).indexOf(input);
          const answerSpan = answers[idx];

          // 채점 상태 변경
          answerSpan.classList.remove('correct', 'wrong');
          answerSpan.removeAttribute('data-wrong');

          if (userNorm === correctNorm) {
            // 정답
            answerSpan.textContent   = correctRaw;
            answerSpan.classList.add('correct');
            answerSpan.style.setProperty('display', 'inline-block', 'important');
          } else {
            // 오답
            answerSpan.textContent   = correctRaw;
            answerSpan.classList.add('wrong');
            answerSpan.setAttribute('data-wrong', userRaw);
            answerSpan.style.setProperty('display', 'inline-block', 'important');
          }

          // 입력창 숨김
          input.style.setProperty('display', 'none', 'important');
          // 다음 입력창 보이기 및 포커스
          const nextInput = inputs[idx + 1];
          if (nextInput) {
            nextInput.style.setProperty('display', 'inline-block', 'important');
            nextInput.focus();
          }
        }, 50);
      }
    });
    
    // 입력 내용 변경 시 상태 초기화
    input.addEventListener('input', function() {
      const idx        = Array.from(inputs).indexOf(input);
      const answerSpan = answers[idx];
      answerSpan.classList.remove('correct', 'wrong');
      answerSpan.removeAttribute('data-wrong');
    });
  });
});
// ================================================================================
