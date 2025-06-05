// 정답 보기 상태 추적 변수
let isAnswerShown = false;

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
    return text.replace(/[\/\u22C5.,]/g, '')
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
  isAnswerShown = true;
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
  isAnswerShown = false;
}

function clearBlank() {
  disableScript();
  blanks = document.querySelectorAll('.blank');
  enableScript(blanks);
}

function createLabelAndCheckbox() {
  const label = document.createElement('label');
  label.innerHTML = "<span style='font-weight: 800; color: #0c3b18;'> 빈칸 채우기 모드</span>" +
    "<p style='font-size: 0.875em; color: #07611f;'>* 마스킹한 내용이 빈칸 문제로 변환되며, 정답을 입력하고 enter키를 누르시면 정오를 확인하실 수 있습니다. PC에서만 적용됩니다.</p>";

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'toggleScript';

  const resultDiv = document.createElement('div');
  resultDiv.append(label);
  resultDiv.prepend(label);
  resultDiv.style.backgroundColor = '#b8fcb8';
  resultDiv.style.padding = '10px';
  resultDiv.style.borderRadius = '5px';
  resultDiv.style.marginBottom = '20px';
  resultDiv.prepend(checkbox);

  boxChecked = false;
  const entryContent = document.getElementsByClassName("entry-content")[0];
  entryContent.prepend(resultDiv);

  checkbox.addEventListener('change', function () {
    if (this.checked) {
      if (!boxChecked) {
        boxChecked = true;
        label.innerHTML += "<p style='font-size: 0.875em; line-height: 0.8em; color: #07611f;'>" +
          "* <span class='blackButton' onclick='clearBlank();'>빈칸 초기화</span>: 빈칸을 모두 제거하고 다시 모두 빈칸으로 만듭니다." +
          "</p>" +
          "<p style='font-size: 0.875em; line-height: 0.8em; color: #07611f;'>" +
          "* <span class='blackButton' onclick='findAnswer();'>정답 보기</span>: 빈칸의 정답을 모두 보여줍니다." +
          "</p>";
      }
      blanks = document.querySelectorAll('.blank');
      enableScript(blanks);
    } else {
      if (isAnswerShown) {
        findAnswer();
      } else {
        disableScript();
      }
    }
  });
}
