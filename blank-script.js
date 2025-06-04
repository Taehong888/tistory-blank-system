<!-- … (스킨의 다른 HTML 코드) … -->

<!-- ↓ 여기부터 “빈칸 채우기” 스크립트 삽입 ↓ -->
<script>
  // ======================== 빈칸 채우기 JS 코드 ========================
  document.addEventListener('DOMContentLoaded', function() {
    // ------------------------------------------------------------
    // [1] 전역 변수 & 헬퍼 함수
    // ------------------------------------------------------------
    const toggleBtn = document.getElementById('fill-toggle');
    const wrongBtn  = document.getElementById('wrong-note');
    const bodyEl    = document.body;

    // ① .blank 요소 전체를 배열로 가져옴
    const blanks = Array.from(document.querySelectorAll('.blank'));

    // ② <input> 요소와, 채점용 <span class="answered"> 요소들을 따로 보관할 배열
    const inputs  = [];
    const answers = [];

    // ③ iPad/한글 IME 버퍼를 강제로 커밋(commit)하는 함수
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

    // ④ IME(composition) 상태를 추적하기 위해 WeakMap 사용
    const composingMap = new WeakMap();

    // ------------------------------------------------------------
    // [2] .blank 내부에 <input>과 채점용 <span> 삽입 (초기화)
    // ------------------------------------------------------------
    blanks.forEach(function(blankEl, idx) {
      // 2-1) data-answer 속성에 적힌 “정답” 문자열
      const correctAnswer = blankEl.getAttribute('data-answer').trim();

      // 2-2) 입력용 <input> 생성
      const inputEl = document.createElement('input');
      inputEl.type         = 'text';
      inputEl.className    = 'blank-input';
      inputEl.setAttribute('data-answer', correctAnswer);
      inputEl.placeholder  = '';
      inputEl.autocomplete = 'off';

      //     └ IME composition 상태 추적 이벤트 연결
      inputEl.addEventListener('compositionstart', () => composingMap.set(inputEl, true));
      inputEl.addEventListener('compositionend',   () => composingMap.set(inputEl, false));
      composingMap.set(inputEl, false);

      // 2-3) 채점 결과(정답/오답)를 띄울 <span class="answered"> 생성
      const spanEl = document.createElement('span');
      spanEl.className     = 'answered';
      spanEl.style.display = 'none';  // 초기에는 숨김

      // 2-4) 실제 DOM에 삽입: 기존 <span class="blank"> 바로 뒤에 “span → input” 순서로 붙임
      blankEl.insertAdjacentElement('afterend', spanEl);
      spanEl.insertAdjacentElement('afterend', inputEl);

      // 2-5) 생성된 요소들을 배열에 저장
      inputs.push(inputEl);
      answers.push(spanEl);

      // 2-6) .blank와 동일한 크기로 input 크기 맞추기
      const rect = blankEl.getBoundingClientRect();
      inputEl.style.width  = rect.width + 'px';
      inputEl.style.height = rect.height + 'px';

      // 2-7) 초기엔 모두 숨김 처리
      inputEl.style.setProperty('display', 'none', 'important');
    });

    // ------------------------------------------------------------
    // [3] “빈칸 채우기 모드” 토글 버튼 기능
    // ------------------------------------------------------------
    toggleBtn.addEventListener('click', function() {
      if (bodyEl.classList.contains('fill-mode')) {
        // ─── (A) 채우기 모드 → 보기 모드 ───
        bodyEl.classList.remove('fill-mode');
        toggleBtn.textContent = '빈칸 채우기 모드';

        // (A-1) 모든 입력칸 숨기고, 값 초기화
        inputs.forEach(function(input) {
          input.value = '';
          input.style.setProperty('display', 'none', 'important');
        });

        // (A-2) 모든 채점용 span 초기화(+ 숨김)
        answers.forEach(function(span) {
          span.textContent = '';
          span.style.setProperty('display', 'none', 'important');
          span.classList.remove('correct', 'wrong');
          span.removeAttribute('data-wrong');
        });
      } else {
        // ─── (B) 보기 모드 → 채우기 모드 ───
        bodyEl.classList.add('fill-mode');
        toggleBtn.textContent = '보기 모드';

        // (B-1) 모든 채점용 span 초기화(+ 숨김)
        answers.forEach(function(span) {
          span.textContent = '';
          span.style.setProperty('display', 'none', 'important');
          span.classList.remove('correct', 'wrong');
          span.removeAttribute('data-wrong');
        });

        // (B-2) 모든 입력칸을 **한꺼번에** 보이도록 처리 + 값 초기화
        inputs.forEach(function(input) {
          input.value = '';
          input.style.setProperty('display', 'inline-block', 'important');
        });

        // (B-3) 첫 번째 입력칸만 IME 커밋(forceIMECommit) 후 포커스
        if (inputs.length > 0) {
          forceIMECommit();
          inputs[0].value = '';
          inputs[0].focus();
        }
      }
    });

    // ------------------------------------------------------------
    // [4] “오답노트” 버튼 기능 (틀린 칸만 다시 풀기)
    // ------------------------------------------------------------
    wrongBtn.addEventListener('click', function() {
      if (!bodyEl.classList.contains('fill-mode')) {
        // (D-1) 아직 채우기 모드가 아니면, 채우기 모드로 전환
        bodyEl.classList.add('fill-mode');
        toggleBtn.textContent = '보기 모드';

        //     → 모든 입력칸 보이기 + 값 초기화
        inputs.forEach(function(input) {
          input.value = '';
          input.style.setProperty('display', 'inline-block', 'important');
        });
      }

      // (D-2) 지금까지 “틀린 칸”(.answered.wrong)만 다시 보이게 함
      answers.forEach(function(span, idx) {
        if (span.classList.contains('wrong')) {
          // 틀린 칸만 input을 다시 보여 주고 포커스
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

    // ------------------------------------------------------------
    // [5] 각 입력칸(input)에 “엔터 → 채점 → 다음 칸 포커스” 이벤트 연결
    // ------------------------------------------------------------
    inputs.forEach(function(input, idx) {
      input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          // ▶ IME 조합 상태라면 Enter 무시
          if (composingMap.get(input)) {
            return;
          }
          event.preventDefault();

          // (5-1) 사용자 입력값 vs. 정답 비교
          const userRaw    = input.value.trim();
          const userNorm   = userRaw.replace(/\s+/g, '');
          const correctRaw = input.dataset.answer.trim();
          const correctNorm= correctRaw.replace(/\s+/g, '');
          const answerSpan = answers[idx];

          // (5-2) 이전 채점 상태 초기화
          answerSpan.classList.remove('correct', 'wrong');
          answerSpan.removeAttribute('data-wrong');

          // (5-3) 정답/오답 판정하여 span에 표시
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

          // (5-5) 다음 입력칸을 깨끗이 한 뒤 보여주고 포커스
          const nextInput = inputs[idx + 1];
          if (nextInput) {
            forceIMECommit();
            nextInput.value = '';
            nextInput.style.setProperty('display', 'inline-block', 'important');
            nextInput.focus();
          }
        }
      });

      // (5-6) 입력 중이면 기존 채점 결과(정답/오답)를 즉시 제거
      input.addEventListener('input', function() {
        const answerSpan = answers[idx];
        answerSpan.classList.remove('correct', 'wrong');
        answerSpan.removeAttribute('data-wrong');
      });
    });
  });
  // ================================================================================  
</script>
<!-- ↑↑ 여기에 붙여 넣으면 끝! ↑↑ -->
