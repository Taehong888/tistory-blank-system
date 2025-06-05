// ==========================
// blank-script.js (개선된 버전)
// 자동 포커스 제거, 툴팁 위치 변경, 다음 칸 포커스 로직 제거
// ==========================

let blanks = [];

const blankArray = document.querySelectorAll('.blank');
if (blankArray.length >= 1) {
  createLabelAndCheckbox();
}

if (document.getElementsByClassName("blankTranslation").length !== 0) {
  blanks = document.querySelectorAll('.blankTranslation');
  enableScript(blanks);
}

function enableScript(blanks) {
  let solvedProblems = 0;

  blanks.forEach((blank) => {
    const originalAnswer = blank.getAttribute('data-answer') || blank.textContent;
    const answer = normalizeText(originalAnswer);

    // 실제 렌더된 .blank 너비(px) 측정
    const rect = blank.getBoundingClientRect();
    const targetWidthPx = rect.width;

    const input = document.createElement('input');
    input.classList.add('fillNode', 'quizQuestion');
    input.type = 'text';

    input.style.boxSizing = 'border-box';
    input.style.width = `${targetWidthPx}px`;

    input.dataset.answer = answer;
    input.dataset.originalAnswer = originalAnswer;

    input.addEventListener('click', function () {
      // 클릭 시 별도 동작 없음 (자동 포커스 로직 제거)
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const userAnswer = normalizeText(input.value.trim());
        const span = document.createElement('span');

        if (userAnswer === input.dataset.answer) {
          span.classList.add('fillNode', 'correct');
        } else {
          span.classList.add('fillNode', 'incorrect');
          span.dataset.wrong = input.value.trim();
        }

        span.textContent = input.dataset.originalAnswer;
        span.dataset.originalAnswer = input.dataset.originalAnswer;

        // 정오 span에도 같은 픽셀 너비를 적용
        span.style.boxSizing = 'border-box';
        span.style.width = `${targetWidthPx}px`;

        solvedProblems += 1;
        input.replaceWith(span);

        // 다음 칸 자동 포커스 로직 제거
        // (사용자가 직접 클릭하여 입력창을 활성화함)
      }
    });

    blank.replaceWith(input);
    // 초기 자동 포커스 제거
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

    const measuredWidth = node.getBoundingClientRect().width;
    span.style.boxSizing = 'border-box';
    span.style.width = `${measuredWidth}px`;

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
      * 마스킹한 내용이 빈칸 문제로 변환됩니다. 입력 후 Enter키를 누르면 정오를 확인할 수 있습니다. PC에서만 적용됩니다.
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
