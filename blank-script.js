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
        nextInput.focus();
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


// ======================================
// ▶ createLabelAndCheckbox 함수만 수정됨
// ======================================
function createLabelAndCheckbox() {
  const entryContent = document.getElementsByClassName("entry-content")[0];
  let boxChecked = false;

  // 1) “빈칸 채우기 모드” 토글용 박스
  const toggleDiv = document.createElement('div');
  toggleDiv.style.backgroundColor = '#b8fcb8';
  toggleDiv.style.padding = '10px';
  toggleDiv.style.borderRadius = '5px';
  toggleDiv.style.marginBottom = '10px';
  toggleDiv.style.display = 'flex';
  toggleDiv.style.alignItems = 'center';

  const toggleCheckbox = document.createElement('input');
  toggleCheckbox.type = 'checkbox';
  toggleCheckbox.id = 'toggleScript';
  const toggleLabel = document.createElement('span');
  toggleLabel.style.marginLeft = '8px';
  toggleLabel.style.fontWeight = '800';
  toggleLabel.style.color = '#0c3b18';
  toggleLabel.textContent = '빈칸 채우기 모드';

  toggleDiv.append(toggleCheckbox);
  toggleDiv.append(toggleLabel);


  // 2) “빈칸 초기화” 전용 박스 (기본 숨김)
  const clearDiv = document.createElement('div');
  clearDiv.style.backgroundColor = '#f0f0f0';
  clearDiv.style.padding = '10px';
  clearDiv.style.borderRadius = '5px';
  clearDiv.style.marginBottom = '10px';
  clearDiv.style.display = 'none';       // 처음엔 숨김 처리
  clearDiv.style.cursor = 'pointer';

  const clearButton = document.createElement('span');
  clearButton.classList.add('blackButton');
  clearButton.textContent = '빈칸 초기화';
  clearButton.addEventListener('click', clearBlank);

  clearDiv.append(clearButton);


  // 3) “정답 보기” 전용 박스 (기본 숨김)
  const answerDiv = document.createElement('div');
  answerDiv.style.backgroundColor = '#f0f0f0';
  answerDiv.style.padding = '10px';
  answerDiv.style.borderRadius = '5px';
  answerDiv.style.marginBottom = '20px';
  answerDiv.style.display = 'none';      // 처음엔 숨김 처리
  answerDiv.style.cursor = 'pointer';

  const answerButton = document.createElement('span');
  answerButton.classList.add('blackButton');
  answerButton.textContent = '정답 보기';
  answerButton.addEventListener('click', findAnswer);

  answerDiv.append(answerButton);


  // 4) entry-content 맨 위에 “토글 박스 → 초기화 박스 → 정답보기 박스” 순으로 추가
  entryContent.prepend(answerDiv);
  entryContent.prepend(clearDiv);
  entryContent.prepend(toggleDiv);


  // 5) 토글 체크박스 change 이벤트
  toggleCheckbox.addEventListener('change', function () {
    if (this.checked) {
      // 최초 체크 시에만 화면에 “초기화/정답보기” 박스를 나타내기
      if (!boxChecked) {
        boxChecked = true;
        clearDiv.style.display = 'block';
        answerDiv.style.display = 'block';
      }
      const blanks = document.querySelectorAll('.blank');
      enableScript(blanks);
    } else {
      // 체크 해제 시에 “초기화/정답보기” 박스 숨기고, 채우기 모드 비활성화
      clearDiv.style.display = 'none';
      answerDiv.style.display = 'none';
      disableScript();
    }
  });
}
// ======================================
// createLabelAndCheckbox 끝
// ======================================
