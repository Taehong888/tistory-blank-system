// ======================== blank-script.js ========================
const blankArray = document.querySelectorAll('.blank');

if (blankArray.length >= 1) {
  createToggleButton();
}

if (document.getElementsByClassName("blankTranslation").length != 0) {
  blanks = document.querySelectorAll('.blankTranslation');
  enableScript(blanks);
}

function enableScript(blanks) {
  let currentInput = 0;
  let solvedProblems = 0;
  let isPlaceholder = false;

  if (document.getElementsByClassName("blankTranslation").length != 0) {
    isPlaceholder = true;
  }

  blanks.forEach(blank => {
    const placeholder = blank.textContent;
    const answer = normalizeText(blank.textContent);
    const normalizedAnswer = normalizeText(answer);
    const input = document.createElement('input');

    input.classList.add('fillNode');
    input.type = 'text';
    input.dataset.answer = normalizedAnswer;
    input.dataset.originalAnswer = blank.textContent;
    input.size = Math.ceil(answer.length * 1.2);

    // 본문 입력란 폰트 크기 본문과 동일 (inherit)
    input.style.fontSize = 'inherit';

    if (isPlaceholder) {
      input.placeholder = placeholder;
      input.size = Math.ceil(blank.textContent.length * 1.35);
    }
    input.classList.add('quizQuestion');

    input.addEventListener('click', function (e) {
      currentInput = Array.from(document.querySelectorAll(".quizQuestion")).indexOf(e.target);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const userAnswer = normalizeText(input.value.trim());
        const span = document.createElement('span');

        // 정답/오답 텍스트 폰트 크기 본문과 동일
        span.style.fontSize = 'inherit';

        if (userAnswer === input.dataset.answer) {
          span.classList.add('fillNode', 'correct');
          // 빈칸 채우기 모드 정답 색과 동일
          span.style.color = '#5DCB5F';
          span.textContent = input.dataset.originalAnswer;
        } else {
          span.classList.add('fillNode', 'incorrect');
          // 오답 색은 빨간(#DD0031)
          span.style.color = '#DD0031';
          span.textContent = input.dataset.originalAnswer;
        }

        solvedProblems += 1;
        input.replaceWith(span);

        const nextInput = findNextInput();
        nextInput && nextInput.focus();
      }
    });

    blank.replaceWith(input);
  });

  function normalizeText(text) {
    return text
      .replace(/[\/⋅.,]/g, '')
      .replace(/이요/g, '이고')
      .replace(/은 /g, '')
      .replace(/는 /g, '')
      .replace(/이/g, '')
      .replace(/가/g, '')
      .replace(/을/g, '')
      .replace(/를/g, '')
      .replace(/및/g, '')
      .replace(/와/g, '')
      .replace(/과/g, '')
      .replace(/에게/g, '')
      .replace(/\s+/g, '');
  }

  function findNextInput() {
    const inputs = document.querySelectorAll('input.quizQuestion');
    const correctProblems = document.getElementsByClassName("correct").length;
    const prob = Math.floor((correctProblems * 100) / solvedProblems);

    if (inputs.length === 0) {
      alert(`문제를 다 풀었어요!\n문제 수: ${solvedProblems}, 정답 수: ${correctProblems}, 정답률: ${prob}%`);
    }
    return inputs[currentInput];
  }
}

function disableScript() {
  // “보기 모드”로 돌아갈 때, 모든 fillNode → .blank 형태로 복원
  const fillNodes = document.querySelectorAll('.fillNode');
  fillNodes.forEach(node => {
    const original = node.dataset.originalAnswer;
    const blankSpan = document.createElement('span');
    blankSpan.classList.add('blank');
    blankSpan.setAttribute('data-answer', original);
    blankSpan.style.fontSize = 'inherit';
    blankSpan.textContent = ''; // CSS hover로 툴팁 처리
    node.replaceWith(blankSpan);
  });
}

// ====================================================================
// ◀ createToggleButton 함수 ▶
// ====================================================================
function createToggleButton() {
  const entryContent = document.getElementsByClassName("entry-content")[0];
  let fillMode = false; // false=보기모드, true=빈칸 채우기 모드

  // “토글 버튼” 생성
  const toggleBtn = document.createElement('div');
  toggleBtn.id = 'blank-toggle-btn';
  toggleBtn.style.display = 'inline-block';
  toggleBtn.style.backgroundColor = '#557a3b'; // 짙은 초록
  toggleBtn.style.color = '#ffffff';
  toggleBtn.style.fontWeight = 'bold';
  toggleBtn.style.fontSize = 'inherit'; // 본문과 동일
  toggleBtn.style.padding = '10px 20px';
  toggleBtn.style.borderRadius = '6px';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.userSelect = 'none';
  toggleBtn.style.marginBottom = '20px';
  toggleBtn.textContent = '빈칸 채우기 모드';

  // 포스트 맨 위에 추가
  entryContent.prepend(toggleBtn);

  // 클릭 시 모드 전환
  toggleBtn.addEventListener('click', function () {
    if (!fillMode) {
      // → 빈칸 채우기 모드 진입
      fillMode = true;
      toggleBtn.textContent = '보기 모드';
      const blanks = document.querySelectorAll('.blank');
      enableScript(blanks);
    } else {
      // → 보기 모드로 복귀
      fillMode = false;
      toggleBtn.textContent = '빈칸 채우기 모드';
      disableScript();
    }
  });
}
// ====================================================================
// createToggleButton 끝
// ====================================================================
