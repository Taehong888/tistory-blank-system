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
    const answer = normalizeText(blank.getAttribute('data-answer') || blank.textContent);
    const normalizedAnswer = normalizeText(answer);
    const input = document.createElement('input');

    input.classList.add('fillNode');
    input.type = 'text';
    input.dataset.answer = normalizedAnswer;
    input.dataset.originalAnswer = blank.getAttribute('data-answer') || blank.textContent;

    // ✅ 너비 유동 조정
    if (isPlaceholder) {
      input.placeholder = placeholder;
      input.style.width = `${blank.textContent.length * 1.35}em`;
    } else {
      input.style.width = `${normalizedAnswer.length * 1.2}em`;
    }

    input.classList.add('quizQuestion');

    input.addEventListener('click', function (e) {
      currentInput = Array.from(document.querySelectorAll("input.quizQuestion")).indexOf(e.target);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const userAnswer = normalizeText(input.value.trim());
        const span = document.createElement('span');

        if (userAnswer === input.dataset.answer) {
          span.classList.add('fillNode', 'correct');
          span.textContent = input.dataset.originalAnswer;
          span.dataset.originalAnswer = input.dataset.originalAnswer;
        } else {
          span.classList.add('fillNode', 'incorrect');
          span.textContent = input.dataset.originalAnswer;
          span.dataset.originalAnswer = input.dataset.originalAnswer;
        }

        solvedProblems += 1;
        input.replaceWith(span);

        const nextInput = findNextInput();
        if (nextInput) nextInput.focus();
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

    if (inputs.length === 0) {
      alert(`문제를 다 풀었어요!\n문제 수: ${solvedProblems}, 정답 수: ${correctProblems}, 정답률: ${prob}%`);
    }
    return inputs[currentInput];
  }
}

function findAnswer() {
  const nodes = document.querySelectorAll('.fillNode');
  nodes.forEach(node => {
    const span = document.createElement('span');
    span.classList.remove('incorrect');
    span.classList.add('correct', 'fillNode');
    span.dataset.originalAnswer = node.dataset.originalAnswer;
    span.textContent = node.dataset.originalAnswer;
    node.replaceWith(span);
  });
}

function disableScript() {
  const nodes = document.querySelectorAll('.fillNode');
  nodes.forEach(node => {
    const original = node.dataset.originalAnswer;
    const blankSpan = document.createElement('span');
    blankSpan.classList.add('blank');
    blankSpan.setAttribute('data-answer', original);
    blankSpan.textContent = '';
    
    // ✅ 보기모드 박스도 유동 크기로
    blankSpan.style.display = 'inline-block';
    blankSpan.style.minWidth = `${original.length * 1.2}em`;

    node.replaceWith(blankSpan);
  });
}

function clearBlank() {
  disableScript();
  blanks = document.querySelectorAll('.blank');
  enableScript(blanks);
}

function createLabelAndCheckbox() {
  const label = document.createElement('label');
  label.innerHTML =
    "<span style='font-weight:800; color:#0c3b18;'> 빈칸 채우기 모드</span>" +
    "<p style='font-size:0.875em; color:#07611f; margin:0.5em 0 0.5em 0;'>" +
      "* 마스킹한 내용이 빈칸 문제로 변환됩니다. 입력 후 Enter키를 누르면 정오를 확인할 수 있습니다. PC에서만 적용됩니다." +
    "</p>" +
    "<p style='font-size:0.875em; color:#07611f; margin:0.3em 0; display:none;' id='clearBtnWrap'>" +
      "<span class='blackButton' onclick='clearBlank();' style='cursor:pointer; color:#333; text-decoration:underline;'>빈칸 초기화</span>: 빈칸을 모두 제거하고 재실행" +
    "</p>" +
    "<p style='font-size:0.875em; color:#07611f; margin:0.3em 0; display:none;' id='answerBtnWrap'>" +
      "<span class='blackButton' onclick='findAnswer();' style='cursor:pointer; color:#333; text-decoration:underline;'>정답 보기</span>: 빈칸의 정답을 모두 표시" +
    "</p>";

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'toggleScript';
  checkbox.style.marginRight = '8px';

  const resultDiv = document.createElement('div');
  resultDiv.style.backgroundColor = '#b8fcb8';
  resultDiv.style.padding = '10px';
  resultDiv.style.borderRadius = '5px';
  resultDiv.style.marginBottom = '20px';
  resultDiv.append(checkbox, label);

  const entryContent = document.getElementsByClassName("entry-content")[0];
  entryContent.prepend(resultDiv);

  checkbox.addEventListener('change', function () {
    const clearBtnWrap = document.getElementById('clearBtnWrap');
    const answerBtnWrap = document.getElementById('answerBtnWrap');

    if (this.checked) {
      disableScript();
      blanks = document.querySelectorAll('.blank');
      enableScript(blanks);
      clearBtnWrap.style.display = 'block';
      answerBtnWrap.style.display = 'block';
    } else {
      disableScript();
      clearBtnWrap.style.display = 'none';
      answerBtnWrap.style.display = 'none';
    }
  });
}
