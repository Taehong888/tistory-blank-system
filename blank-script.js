document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn  = document.getElementById('fill-toggle');
  const wrongBtn   = document.getElementById('wrong-note');
  const bodyEl     = document.body;

  // 1) 기존 .blank(span) 요소들을 찾아서, 대응되는
  //    <input class="blank-input"> / <span class="answered"> 요소 생성
  const blanks   = document.querySelectorAll('.blank');
  const inputs   = [];
  const answers  = [];

  blanks.forEach(function(blank) {
    // (1) 입력용 input 생성
    const inputEl = document.createElement('input');
    inputEl.type         = 'text';
    inputEl.className    = 'blank-input';
    // .blank에 있던 data-answer 속성을 input에도 붙임
    inputEl.setAttribute('data-answer', blank.getAttribute('data-answer'));
    inputEl.placeholder  = '';
    inputEl.autocomplete = 'off';

    // (2) 정답 표시용 span 생성
    const spanEl = document.createElement('span');
    spanEl.className     = 'answered';
    spanEl.style.display = 'none'; // 초기엔 숨김

    // (3) blank 뒤에 span → input 순으로 삽입
    blank.insertAdjacentElement('afterend', spanEl);
    spanEl.insertAdjacentElement('afterend', inputEl);

    inputs.push(inputEl);
    answers.push(spanEl);
  });

  // 2) 페이지 로드 직후, 각 input의 크기를 원래 .blank와 동일하게 설정
  inputs.forEach(function(input, idx) {
    const blankEl = blanks[idx];
    if (blankEl) {
      // offsetWidth/offsetHeight로 픽셀 단위 폭/높이를 가져옴
      const bw = blankEl.offsetWidth;
      const bh = blankEl.offsetHeight;

      // box-sizing:border-box 상태이므로, padding+border 포함한 전체 크기를 지정
      input.style.width  = bw + 'px';
      input.style.height = bh + 'px';
    }
  });

  // 3) “빈칸 채우기 모드” 버튼 클릭 시 토글 로직
  toggleBtn.addEventListener('click', function() {
    if (bodyEl.classList.contains('fill-mode')) {
      // ─── 채우기 모드 → 보기 모드 전환 ───
      bodyEl.classList.remove('fill-mode');
      toggleBtn.textContent = '빈칸 채우기 모드';

      // (3-1) 모든 입력란 숨김
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
      // (3-4) 각 input에서 display:none!important 제거 → 보이도록
      inputs.forEach(function(input) {
        input.style.removeProperty('display');
      });
      // (3-5) 첫 번째 input만 보이게 설정하고 포커스
      if (inputs.length > 0) {
        inputs[0].style.setProperty('display', 'inline-block', 'important');
        inputs[0].focus();
      }
    }
  });

  // 4) “오답노트” 버튼 클릭 시: 틀린 항목만 재입력 모드
  wrongBtn.addEventListener('click', function() {
    if (!bodyEl.classList.contains('fill-mode')) {
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';
    }
    answers.forEach(function(span, idx) {
      if (span.classList.contains('wrong')) {
        // (4-1) 오답 span 숨기고 클래스 제거
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('wrong');
        span.removeAttribute('data-wrong');

        // (4-2) 해당 인덱스 input 보이게 & 포커스
        const input = inputs[idx];
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
        input.focus();
      }
    });
  });

  // 5) 각 입력란 Enter키 처리, 다음 입력란 포커스
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

        // (5-2) 현재 input 숨김
        input.style.setProperty('display', 'none', 'important');

        // (5-3) 다음 input show + 포커스
        const nextInput = inputs[idx + 1];
        if (nextInput) {
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
