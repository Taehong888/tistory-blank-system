// 1. 전역 변수 선언 추가
let blanks = [];

// 2. 페이지 로드 직후 .blank 요소 존재 시 레이블/체크박스 생성
const blankArray = document.querySelectorAll('.blank');
if (blankArray.length >= 1) {
  createLabelAndCheckbox();
}

// 3. .blankTranslation 요소가 있으면 스크립트 활성화
if (document.getElementsByClassName("blankTranslation").length !== 0) {
  blanks = document.querySelectorAll('.blankTranslation');
  enableScript(blanks);
}

function enableScript(blanks) {
  let currentInput = 0;
  let solvedProblems = 0;

  // blanks 매개변수가 빈 상태가 아니어야 함
  blanks.forEach((blank, index) => {
    const placeholder = blank.textContent;
    const originalAnswer = blank.getAttribute('data-answer') || blank.textContent;
    const answer = normalizeText(originalAnswer);
    const input = document.createElement('input');

    input.classList.add('fillNode', 'quizQuestion');
    input.type = 'text';
    input.dataset.answer = answer;
    input.dataset.originalAnswer = originalAnswer;
    input.size = originalAnswer.length;
    input.placeholder = placeholder;
    input.style.width = `${placeholder.length}ch`;

    // 클릭할 때마다 currentInput 업데이트
    input.addEventListener('click', function (e) {
      currentInput = Array.from(document.querySelectorAll("input.quizQuestion")).indexOf(e.target);
    });

    // Enter 키 처리
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const userAnswer = normalizeText(input.value.trim());
        const span = document.createElement('span');

        if (userAnswer === input.dataset.answer) {
          span.classList.add('fillNode', 'correct');
        } else {
          span.classList.add('fillNode', 'incorrect');
          // 틀린 답일 경우 실제 입력값을 data-wrong으로 저장
          span.dataset.wrong = input.value.trim();
        }

        span.textContent = input.dataset.originalAnswer;
        span.dataset.originalAnswer = input.dataset.originalAnswer;
        span.style.width = `${input.dataset.originalAnswer.length}ch`;

        solvedProblems += 1;
        input.replaceWith(span);

        const inputs = document.querySelectorAll('input.quizQuestion');
        // Enter 누른 칸의 인덱스를 다시 계산하여 다음 칸으로 이동
        if (inputs.length > 0) {
          currentInput = Math.min(currentInput, inputs.length - 1);
          inputs[currentInput].focus();
        } else {
          // 모든 문제 풀이 완료 시 정답률 얼럿
          const correctProblems = document.getElementsByClassName("correct").length;
          const prob = Math.floor((correctProblems * 100) / solvedProblems);
          alert(`문제를 다 풀었어요!\n문제 수: ${solvedProblems}, 정답 수: ${correctProblems}, 정답률: ${prob}%`);
        }
      }
    });

    blank.replaceWith(input);
    // 초기 로드 시 첫 번째 input에 포커스 주기
    if (index === 0) input.focus();
  });
}

function findAnswer() {
  const nodes = document.querySelectorAll('.fillNode');
  nodes.forEach(node => {
    const original = node.dataset.originalAnswer;
    const span = document.createElement('span');
    span.classList.add('fillNode', 'correct');
    span.dataset.originalAnswer = original;
    span.textContent = original;
    span.style.width = `${original.length}ch`;
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
    blankSpan.textContent = ''; // 보기를 위해 텍스트는 숨김
    blankSpan.style.width = `${original.length}ch`;
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
  label.innerHTML = `
    <span style="font-weight:800; color:#0c3b18;"> 빈칸 채우기 모드</span>
    <p style="font-size:0.875em; color:#07611f;">* 마스킹한 내용이 빈칸 문제로 변환됩니다. 입력 후 Enter키를 누르면 정오를 확인할 수 있습니다. PC에서만 적용됩니다.</p>
  `;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'toggleScript';
  checkbox.style.marginRight = '8px';

  const controlArea = document.createElement('div');
  controlArea.style.display = 'none';

  const clearBtn = document.createElement('span');
  clearBtn.textContent = '빈칸 초기화';
  clearBtn.className = 'blackButton';
  clearBtn.style.cursor = 'pointer';
  clearBtn.onclick = clearBlank;

  const answerBtn = document.createElement('span');
  answerBtn.textContent = '정답 보기';
  answerBtn.className = 'blackButton';
  answerBtn.style.cursor = 'pointer';
  answerBtn.style.marginLeft = '15px';
  answerBtn.onclick = findAnswer;

  controlArea.append(clearBtn, answerBtn);

  const resultDiv = document.createElement('div');
  resultDiv.style.backgroundColor = '#b8fcb8';
  resultDiv.style.padding = '10px';
  resultDiv.style.borderRadius = '5px';
  resultDiv.style.marginBottom = '20px';
  resultDiv.append(checkbox, label, controlArea);

  const entryContent = document.getElementsByClassName("entry-content")[0];
  entryContent.prepend(resultDiv);

  checkbox.addEventListener('change', function () {
    if (this.checked) {
      controlArea.style.display = 'block';
      disableScript();
      blanks = document.querySelectorAll('.blank');
      enableScript(blanks);
    } else {
      controlArea.style.display = 'none';
      disableScript();
    }
  });
}

function normalizeText(text) {
  return text.replace(/[\/⋅.,]/g, '')
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
