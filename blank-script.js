// ======================== blank-script.js ========================
const blankArray = document.querySelectorAll('.blank');

if (blankArray.length >= 1) {
  createLabelAndCheckbox();
}

if (document.getElementsByClassName("blankTranslation").length != 0) {
  blanks = document.querySelectorAll('.blankTranslation');
  enableScript(blanks);
}

function enableScript(blanks) {
  var currentInput = 0;
  var solvedProblems = 0;
  var isPlaceholder = false;

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
    input.size = answer.length * 1.2;

    // 본문 입력란 폰트 크기 0.9em으로 고정
    input.style.fontSize = '0.9em';

    if (isPlaceholder) {
      input.placeholder = placeholder;
      input.size = blank.textContent.length * 1.35;
    }
    input.classList.add('quizQuestion');

    input.addEventListener('click', function (e) {
      currentInput = Array.from(document.querySelectorAll(".quizQuestion")).indexOf(e.target);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const userAnswer = normalizeText(input.value.trim());
        const span = document.createElement('span');

        // 정답/오답 텍스트 폰트 크기 0.9em으로 고정
        span.style.fontSize = '0.9em';

        if (userAnswer === input.dataset.answer) {
          span.classList.add('fillNode');
          span.classList.add('correct');
          span.textContent = input.dataset.originalAnswer;
          span.dataset.originalAnswer = input.dataset.originalAnswer;
        } else {
          span.classList.add('fillNode');
          span.classList.add('incorrect');
          span.textContent = input.dataset.originalAnswer;
          span.dataset.originalAnswer = input.dataset.originalAnswer;
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
    var correctProblems = document.getElementsByClassName("correct").length;
    var prob = Math.floor(correctProblems * 100 / solvedProblems);

    if (document.getElementsByClassName("quizQuestion").length == 0) {
      alert(`문제를 다 풀었어요!\n문제 수: ${solvedProblems}, 정답 수: ${correctProblems}, 정답률: ${prob}%`);
    }
    return inputs[currentInput];
  }
}

function findAnswer() {
  const inputs = document.querySelectorAll('.fillNode');
  inputs.forEach(input => {
    const span = document.createElement('span');

    // 정답 보기 텍스트 폰트 크기 0.9em으로 고정
    span.style.fontSize = '0.9em';

    span.classList.remove('incorrect');
    span.classList.add('correct');
    span.classList.add('fillNode');
    span.dataset.originalAnswer = input.dataset.originalAnswer;
    span.textContent = input.dataset.originalAnswer;
    input.replaceWith(span);
  });
}

function disableScript() {
  const inputs = document.querySelectorAll('.fillNode');

  inputs.forEach(input => {
    const span = document.createElement('span');

    // 보기 모드 텍스트 폰트 크기 0.9em으로 고정
    span.style.fontSize = '0.9em';

    span.classList.remove('correct');
    span.classList.remove('incorrect');
    span.classList.add('blank');
    span.classList.add('fillNode');
    span.textContent = input.dataset.originalAnswer;
    input.replaceWith(span);
  });
}

function clearBlank() {
  disableScript();
  blanks = document.querySelectorAll('.blank');
  enableScript(blanks);
}

// ====================================================================
// ◀ 수정된 createLabelAndCheckbox() ▶
// ====================================================================
function createLabelAndCheckbox() {
  const entryContent = document.getElementsByClassName("entry-content")[0];
  let boxChecked = false;  // “채우기 모드 활성화 여부” 상태 저장

  // 1) “토글 박스” (초기: 빈칸 채우기 모드 상태)
  const toggleDiv = document.createElement('div');
  toggleDiv.id = 'blank-toggle-box';
  toggleDiv.style.display = 'inline-block';
  toggleDiv.style.backgroundColor = '#557a3b';   // 짙은 초록
  toggleDiv.style.color = '#ffffff';
  toggleDiv.style.fontWeight = 'bold';
  toggleDiv.style.fontSize = '0.9em';
  toggleDiv.style.padding = '10px 20px';
  toggleDiv.style.borderRadius = '6px';
  toggleDiv.style.cursor = 'pointer';
  toggleDiv.style.userSelect = 'none';
  toggleDiv.style.marginBottom = '10px';
  toggleDiv.textContent = '빈칸 채우기 모드';

  // 2) “빈칸 초기화 박스” (초기 숨김, 버튼 스타일)
  const clearDiv = document.createElement('div');
  clearDiv.id = 'blank-clear-box';
  clearDiv.style.display = 'none';               // 초기에는 숨김
  clearDiv.style.backgroundColor = '#4a90e2';     // 파란색
  clearDiv.style.color = '#ffffff';
  clearDiv.style.fontSize = '0.9em';
  clearDiv.style.padding = '10px 16px';
  clearDiv.style.borderRadius = '6px';
  clearDiv.style.cursor = 'pointer';
  clearDiv.style.userSelect = 'none';
  clearDiv.style.marginBottom = '10px';
  clearDiv.textContent = '빈칸 초기화';
  clearDiv.addEventListener('click', clearBlank);

  // 3) “정답 보기 박스” (초기: 보이도록, 버튼 스타일)
  const answerDiv = document.createElement('div');
  answerDiv.id = 'blank-answer-box';
  answerDiv.style.display = 'block';              // 처음부터 보이기
  answerDiv.style.backgroundColor = '#d35400';    // 주황색
  answerDiv.style.color = '#ffffff';
  answerDiv.style.fontSize = '0.9em';
  answerDiv.style.padding = '10px 16px';
  answerDiv.style.borderRadius = '6px';
  answerDiv.style.cursor = 'pointer';
  answerDiv.style.userSelect = 'none';
  answerDiv.style.marginBottom = '20px';
  answerDiv.textContent = '정답 보기';
  answerDiv.addEventListener('click', findAnswer);

  // 4) 순서대로 포스트 맨 위에 추가: [토글 박스] → [빈칸 초기화 박스] → [정답 보기 박스]
  entryContent.prepend(answerDiv);
  entryContent.prepend(clearDiv);
  entryContent.prepend(toggleDiv);

  // 5) 토글 박스 클릭 이벤트: “보기 모드 ↔ 빈칸 채우기 모드” 전환
  toggleDiv.addEventListener('click', function () {
    if (!boxChecked) {
      // → “채우기 모드” 활성화
      boxChecked = true;
      toggleDiv.textContent = '보기 모드';
      clearDiv.style.display = 'block';
      answerDiv.style.display = 'block';
      const blanks = document.querySelectorAll('.blank');
      enableScript(blanks);
    } else {
      // → “보기 모드” (채우기 모드 비활성화)
      boxChecked = false;
      toggleDiv.textContent = '빈칸 채우기 모드';
      clearDiv.style.display = 'none';
      answerDiv.style.display = 'none';
      disableScript();
    }
  });
}
// ====================================================================
// createLabelAndCheckbox 끝
// ====================================================================
