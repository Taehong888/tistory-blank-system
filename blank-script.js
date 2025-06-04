// ======================== blank-script.js (eduproject 방식으로 새로 구현) ========================

document.addEventListener('DOMContentLoaded', function() {
  // ----------------------------------------------------------------------------------------------------
  // [1] 전역 변수 및 헬퍼 함수
  // ----------------------------------------------------------------------------------------------------
  const toggleBtn = document.getElementById('fill-toggle');
  const wrongBtn  = document.getElementById('wrong-note');
  const bodyEl    = document.body;

  // 빈칸(<span class="blank">) 원본 노드 목록
  const blanks  = Array.from(document.querySelectorAll('.blank'));

  // 생성할 <input> 요소들 및 채점용 <span class="answered"> 요소를 저장할 배열
  const inputs  = [];
  const answers = [];

  // ▶ iPad/한글 IME 버퍼 강제 커밋 함수
  //    - 화면에 보이지 않는 임시 input을 만들어 포커스 → blur 시켜서
  //      IME 상에 남아 있는 미완성 한글을 모두 마무리(commit)시킵니다.
  function forceIMECommit() {
    const temp = document.createElement('input');
    temp.style.position   = 'absolute';
    temp.style.opacity    = '0';
    temp.setAttribute('autocomplete', 'off');
    temp.setAttribute('autocorrect', 'off');
    temp.setAttribute('autocapitalize','none');
    temp.setAttribute('spellcheck',   'false');
    bodyEl.appendChild(temp);
    temp.focus();
    temp.blur();
    bodyEl.removeChild(temp);
  }

  // ▶ IME 조합(composition) 상태를 추적하기 위한 WeakMap
  //    - 입력 중에 Enter를 눌러도 “조합 중” 상태라면 무시하여 미완성 자모가 남지 않도록 합니다.
  const composingMap = new WeakMap();


  // ----------------------------------------------------------------------------------------------------
  // [2] 모든 <span class="blank">를 <input>으로 교체하고, 채점용 <span>을 생성하는 초기화 로직
  // ----------------------------------------------------------------------------------------------------
  blanks.forEach(function(blankEl, idx) {
    // 1) 정답을 담고 있는 data-answer 속성
    const correctAnswer = blankEl.getAttribute('data-answer').trim();

    // 2) input(빈칸 채우기용) 생성
    const inputEl = document.createElement('input');
    inputEl.type         = 'text';
    inputEl.className    = 'blank-input';
    inputEl.setAttribute('data-answer', correctAnswer);
    inputEl.placeholder  = '';
    inputEl.autocomplete = 'off';

    //    └ IME 조합 상태 추적
    inputEl.addEventListener('compositionstart', () => composingMap.set(inputEl, true));
    inputEl.addEventListener('compositionend',   () => composingMap.set(inputEl, false));
    composingMap.set(inputEl, false);

    // 3) 채점 후 “정답/오답 결과”를 보여줄 span. 초기에는 숨김
    const spanEl = document.createElement('span');
    spanEl.className     = 'answered';
    spanEl.style.display = 'none';

    // 4) 실제 DOM 삽입: 기존 blankEl 바로 뒤에 “span → input” 순서로 붙입니다.
    blankEl.insertAdjacentElement('afterend', spanEl);
    spanEl.insertAdjacentElement('afterend', inputEl);

    // 5) 배열에 저장
    inputs.push(inputEl);
    answers.push(spanEl);

    // 6) 만약 원래 <span class="blank">가 CSS로 너비/높이를 가졌다 하면,
    //    그 크기만큼 input 크기를 맞추면 레이아웃이 흔들리지 않습니다.
    //    (예: .blank { display:inline-block; padding:0.2em; border:1px solid… })
    const rect = blankEl.getBoundingClientRect();
    inputEl.style.width  = rect.width + 'px';
    inputEl.style.height = rect.height + 'px';

    // 7) 초기엔 모두 숨김. toggle을 누를 때 한꺼번에 보이도록 처리합니다.
    inputEl.style.setProperty('display', 'none', 'important');
  });


  // ----------------------------------------------------------------------------------------------------
  // [3] “빈칸 채우기 모드” 토글 버튼 기능
  // ----------------------------------------------------------------------------------------------------
  toggleBtn.addEventListener('click', function() {
    if (bodyEl.classList.contains('fill-mode')) {
      // ─── (A) 채우기 모드 → 보기 모드 전환 ───
      bodyEl.classList.remove('fill-mode');
      toggleBtn.textContent = '빈칸 채우기 모드';

      // (A-1) 모든 입력칸 숨기고 값 초기화
      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'none', 'important');
      });
      // (A-2) 모든 채점용 span(정답/오답) 초기화 및 숨김
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });
    } else {
      // ─── (B) 보기 모드 → 채우기 모드 전환 ───
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';

      // (B-1) 모든 채점용 span 초기화 및 숨김
      answers.forEach(function(span) {
        span.textContent = '';
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('correct', 'wrong');
        span.removeAttribute('data-wrong');
      });

      // (B-2) 모든 입력칸을 **한번에** 보이도록, 값은 빈 문자열로 초기화
      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
      });

      // (B-3) 첫 번째 입력칸만 IME 버퍼 커밋 후, 포커스
      if (inputs.length > 0) {
        forceIMECommit();
        inputs[0].value = '';
        inputs[0].focus();
      }
    }
  });


  // ----------------------------------------------------------------------------------------------------
  // [4] “오답노트” 버튼 기능 (틀렸던 칸만 다시 풀기)
  // ----------------------------------------------------------------------------------------------------
  wrongBtn.addEventListener('click', function() {
    if (!bodyEl.classList.contains('fill-mode')) {
      // (D-1) 채우기 모드가 아니면, 채우기 모드로 전환하고 모든 칸 보이기
      bodyEl.classList.add('fill-mode');
      toggleBtn.textContent = '보기 모드';

      inputs.forEach(function(input) {
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
      });
    }

    // (D-2) 지금까지 “.wrong”이 붙은 채점 span(틀린 칸)만 해당 input을 다시 보이게 함
    answers.forEach(function(span, idx) {
      if (span.classList.contains('wrong')) {
        // 틀린 칸만 input 보이기 + 값 초기화 + 포커스
        span.style.setProperty('display', 'none', 'important');
        span.classList.remove('wrong');
        span.removeAttribute('data-wrong');

        const input = inputs[idx];
        forceIMECommit();
        input.value = '';
        input.style.setProperty('display', 'inline-block', 'important');
        input.focus();
      } else {
        // 맞은 칸 또는 아직 풀지 않은 칸은 숨김
        inputs[idx].style.setProperty('display', 'none', 'important');
      }
    });
  });


  // ----------------------------------------------------------------------------------------------------
  // [5] 각 입력칸(input)에 “엔터키 → 채점 → 다음 칸 이동” 이벤트 연결
  // ----------------------------------------------------------------------------------------------------
  inputs.forEach(function(input, idx) {
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        // ▶ IME 조합(composition) 상태라면 Enter 무시
        if (composingMap.get(input)) {
          return;
        }
        event.preventDefault();

        // (5-1) 채점 로직: userRaw, userNorm, correctRaw, correctNorm 계산
        const userRaw    = input.value.trim();
        const userNorm   = userRaw.replace(/\s+/g, '');
        const correctRaw = input.dataset.answer.trim();
        const correctNorm= correctRaw.replace(/\s+/g, '');
        const answerSpan = answers[idx];

        // (5-2) 이전 채점 상태 초기화
        answerSpan.classList.remove('correct', 'wrong');
        answerSpan.removeAttribute('data-wrong');

        // (5-3) 정답/오답 판정
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

        // (5-4) 현재 입력칸 숨김 (채점 결과만 남음)
        input.style.setProperty('display', 'none', 'important');

        // (5-5) 다음 입력칸만 “IME 강제 커밋 + 값 비우기 → 보여주기 → 포커스”
        const nextInput = inputs[idx + 1];
        if (nextInput) {
          forceIMECommit();
          nextInput.value = '';
          nextInput.style.setProperty('display', 'inline-block', 'important');
          nextInput.focus();
        }
      }
    });

    // (5-6) 입력 중에 문자 하나라도 바뀌면(철자 수정) 기존 채점 결과(정답/오답)를 제거
    input.addEventListener('input', function() {
      const answerSpan = answers[idx];
      answerSpan.classList.remove('correct', 'wrong');
      answerSpan.removeAttribute('data-wrong');
    });
  });
});
// ================================================================================  
