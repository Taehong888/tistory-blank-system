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
  const toggleBtn = document.createElement('div');
  toggleBtn.id = 'blank-toggle-btn';
  toggleBtn.style.display = 'inline-block';
  toggleBtn.style.backgroundColor = '#557a3b';   // 짙은 초록
  toggleBtn.style.color = '#ffffff';
  toggleBtn.style.fontWeight = 'bold';
  toggleBtn.style.fontSize = '0.9em';
  toggleBtn.style.padding = '10px 20px';
  toggleBtn.style.borderRadius = '6px';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.userSelect = 'none';
  toggleBtn.style.marginRight = '10px';          // 옆 버튼과 간격
  toggleBtn.textContent = '빈칸 채우기 모드';

  // 2) “정답 보기 버튼” (초기: 보이도록, 버튼 스타일)
  const answerBtn = document.createElement('div');
  answerBtn.id = 'blank-answer-btn';
  answerBtn.style.display = 'inline-block';      // 처음부터 보이기
  answerBtn.style.backgroundColor = '#d35400';    // 주황색
  answerBtn.style.color = '#ffffff';
  answerBtn.style.fontWeight = 'bold';
  answerBtn.style.fontSize = '0.9em';
  answerBtn.style.padding = '10px 20px';
  answerBtn.style.borderRadius = '6px';
  answerBtn.style.cursor = 'pointer';
  answerBtn.style.userSelect = 'none';
  answerBtn.style.marginRight = '10px';
  answerBtn.textContent = '정답 보기';
  answerBtn.addEventListener('click', findAnswer);

  // 3) “빈칸 초기화 버튼” (초기: 숨김, 버튼 스타일)
  const clearBtn = document.createElement('div');
  clearBtn.id = 'blank-clear-btn';
  clearBtn.style.display = 'none';               // 초기에는 숨김
  clearBtn.style.backgroundColor = '#4a90e2';     // 파란색
  clearBtn.style.color = '#ffffff';
  clearBtn.style.fontWeight = 'bold';
  clearBtn.style.fontSize = '0.9em';
  clearBtn.style.padding = '10px 20px';
  clearBtn.style.borderRadius = '6px';
  clearBtn.style.cursor = 'pointer';
  clearBtn.style.userSelect = 'none';
  clearBtn.style.marginRight = '10px';
  clearBtn.textContent = '빈칸 초기화';
  clearBtn.addEventListener('click', clearBlank);

  // 4) 토글 버튼 및 부가 버튼들을 담을 컨테이너 (한 줄에 나란히)
  const buttonContainer = document.createElement('div');
  buttonContainer.style.marginBottom = '20px';
  buttonContainer.appendChild(toggleBtn);
  buttonContainer.appendChild(answerBtn);
  buttonContainer.appendChild(clearBtn);

  // 5) 포스트 맨 위에 container 추가
  entryContent.prepend(buttonContainer);

  // 6) 토글 버튼 클릭 이벤트: “보기 모드 ↔ 빈칸 채우기 모드” 전환
  toggleBtn.addEventListener('click', function () {
    if (!boxChecked) {
      // → “채우기 모드” 활성화
      boxChecked = true;
      toggleBtn.textContent = '보기 모드';
      answerBtn.style.display = 'none';
      clearBtn.style.display = 'inline-block';
      const blanks = document.querySelectorAll('.blank');
      enableScript(blanks);
    } else {
      // → “보기 모드” (채우기 모드 비활성화)
      boxChecked = false;
      toggleBtn.textContent = '빈칸 채우기 모드';
      answerBtn.style.display = 'inline-block';
      clearBtn.style.display = 'none';
      disableScript();
    }
  });
}
// ====================================================================
// createLabelAndCheckbox 끝
// ====================================================================
