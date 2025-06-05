// ==========================
// blank-script.js (PC + iPad 일관 UX 개선 포함)
//  - Tab 키로 다음 입력창 이동
//  - 화면 회전 / 윈도우 리사이즈 시 ch 단위 재계산
//  - 자동 포커스 제거
// ==========================

let blanks = [];

// 페이지 로드 후 .blank가 있으면 레이블/체크박스 생성
document.addEventListener('DOMContentLoaded', () => {
  const blankArray = document.querySelectorAll('.blank');
  if (blankArray.length >= 1) {
    createLabelAndCheckbox();
  }
  // OR blankTranslation 있으면 즉시 enable
  if (document.getElementsByClassName("blankTranslation").length !== 0) {
    blanks = document.querySelectorAll('.blankTranslation');
    enableScript(blanks);
  }
});

// 윈도우 리사이즈 및 화면 회전 시 입력 너비 재계산
window.addEventListener('resize', recalcAllWidths);
window.addEventListener('orientationchange', recalcAllWidths);

function recalcAllWidths() {
  // 모든 .fillNode(input)와 .correct/.incorrect(span)에 대해
  // data-original-answer 길이를 다시 ch 단위로 지정
  document.querySelectorAll('.fillNode').forEach(node => {
    const original = node.dataset.originalAnswer;
    if (original) {
      node.style.width = `${original.length}ch`;
    }
  });
  document.querySelectorAll('.correct, .incorrect').forEach(span => {
    const original = span.dataset.originalAnswer;
    if (original) {
      span.style.width = `${original.length}ch`;
    }
  });
}

function enableScript(blanks) {
  blanks.forEach((blank, index) => {
    const originalAnswer = blank.getAttribute('data-answer') || blank.textContent;
    const answer = normalizeText(originalAnswer);

    // input 생성
    const input = document.createElement('input');
    input.classList.add('fillNode', 'quizQuestion');
    input.type = 'text';

    // 입력 너비를 원본 글자 수 ch 단위로 지정
    input.style.boxSizing = 'border-box';
    input.style.width = `${originalAnswer.length}ch`;

    input.dataset.answer = answer;
    input.dataset.originalAnswer = originalAnswer;

    // 클릭 시 별도 처리 없음 (자동 포커스 제거)

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        processAnswer(input, originalAnswer);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Tab 누르면 다음 입력창으로 포커스
        const inputs = Array.from(document.querySelectorAll('input.quizQuestion'));
        const idx = inputs.indexOf(input);
        const next = inputs[idx + 1];
        if (next) next.focus();
      }
    });

    blank.replaceWith(input);
    // 자동 포커스 제거: 사용자가 탭/클릭하여 이동
  });
}

function processAnswer(input, originalAnswer) {
  const userAnswer = normalizeText(input.value.trim());
  const span = document.createElement('span');
  const answer = input.dataset.answer;

  if (userAnswer === answer) {
    span.classList.add('fillNode', 'correct');
  } else {
    span.classList.add('fillNode', 'incorrect');
    span.dataset.wrong = input.value.trim();
  }

  span.textContent = input.dataset.originalAnswer;
  span.dataset.originalAnswer = input.dataset.originalAnswer;
  span.style.boxSizing = 'border-box';
  span.style.width = `${originalAnswer.length}ch`;

  input.replaceWith(span);
}

function findAnswer() {
  document.querySelectorAll('.fillNode').forEach(node => {
    const original = node.dataset.originalAnswer;
    if (!original) return;
    const span = document.createElement('span');
    span.classList.add('fillNode', 'correct');
    span.dataset.originalAnswer = original;
    span.textContent = original;
    span.style.boxSizing = 'border-box';
    span.style.width = `${original.length}ch`;
    node.replaceWith(span);
  });
}

function disableScript() {
  document.querySelectorAll('.fillNode').forEach(node => {
    const original = node.dataset.originalAnswer;
    if (!original) return;
    const blankSpan = document.createElement('span');
    blankSpan.classList.add('blank');
    blankSpan.setAttribute('data-answer', original);
    blankSpan.textContent = '';
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
    <p style="font-size:0.875em; color:#07611f;">
      * 마스킹한 내용이 빈칸 문제로 변환됩니다. 입력 후 Enter키를 누르면 정오를 확인할 수 있습니다. PC 및 터치 기기에서 모두 동작합니다.
    </p>
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

// 텍스트 비교용 정규화 함수
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
