// ==========================
// blank-script.js (수정된 버전)
// “표(table-layout: fixed) 환경에서 .blank의 픽셀 너비를 측정하여
//  그만큼 <input>에 적용하는 버전”
// ==========================

// 전역 변수 선언
let blanks = [];

// 페이지 로드 직후 .blank 요소가 하나라도 있으면 레이블/체크박스 생성
const blankArray = document.querySelectorAll('.blank');
if (blankArray.length >= 1) {
  createLabelAndCheckbox();
}

// .blankTranslation 요소가 있으면 스크립트 바로 활성화
if (document.getElementsByClassName("blankTranslation").length !== 0) {
  blanks = document.querySelectorAll('.blankTranslation');
  enableScript(blanks);
}

function enableScript(blanks) {
  let currentInput = 0;
  let solvedProblems = 0;

  blanks.forEach((blank, index) => {
    // (A) 원래 정답 문자열
    const originalAnswer = blank.getAttribute('data-answer') || blank.textContent;
    const answer = normalizeText(originalAnswer);

    // (B) “보기 모드(.blank)”가 화면에 렌더된 후의 실제 픽셀 너비를 측정
    //     → table-layout: fixed 환경에서도 cell 폭에 맞추어 계산된 연두 박스 폭을 분명하게 얻어 올 수 있음
    const rect = blank.getBoundingClientRect();
    const targetWidthPx = rect.width;

    // (C) input 요소 생성
    const input = document.createElement('input');
    input.classList.add('fillNode', 'quizQuestion');
    input.type = 'text';

    // ─────────────────────────────────────────────────
    // (수정 전) input.size = originalAnswer.length;
    //
    // (수정 후) blank.getBoundingClientRect().width 만큼 픽셀 너비를 직접 지정
    input.style.boxSizing = 'border-box';
    input.style.width = `${targetWidthPx}px`;
    // ─────────────────────────────────────────────────

    // (D) 정답 정보 dataset에 저장
    input.dataset.answer = answer;
    input.dataset.originalAnswer = originalAnswer;

    // (E) 클릭했을 때 currentInput 업데이트
    input.addEventListener('click', function (e) {
      currentInput = Array.from(document.querySelectorAll("input.quizQuestion")).indexOf(e.target);
    });

    // (F) Enter 키 입력 시 정오 판정
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const userAnswer = normalizeText(input.value.trim());
        const span = document.createElement('span');

        if (userAnswer === input.dataset.answer) {
          // 정답 모드(.correct)
          span.classList.add('fillNode', 'correct');
        } else {
          // 오답 모드(.incorrect)
          span.classList.add('fillNode', 'incorrect');
          // 틀린 원본 값을 data-wrong에 저장해야 tooltip이 동작
          span.dataset.wrong = input.value.trim();
        }

        // (G) 새로 생성된 span에도 “원래 정답” 텍스트만 표시
        span.textContent = input.dataset.originalAnswer;
        span.dataset.originalAnswer = input.dataset.originalAnswer;

        // (H) span에도 같은 픽셀 너비를 적용
        span.style.boxSizing = 'border-box';
        span.style.width = `${targetWidthPx}px`;

        solvedProblems += 1;
        input.replaceWith(span);

        // (I) 남아 있는 input이 있으면 다음 input에 포커스 이동
        const inputs = document.querySelectorAll('input.quizQuestion');
        if (inputs.length > 0) {
          currentInput = Math.min(currentInput, inputs.length - 1);
          inputs[currentInput].focus();
        } else {
          // 모두 풀었으면 정답률 알림
          const correctProblems = document.getElementsByClassName("correct").length;
          const prob = Math.floor((correctProblems * 100) / solvedProblems);
          alert(`문제를 다 풀었어요!\n문제 수: ${solvedProblems}, 정답 수: ${correctProblems}, 정답률: ${prob}%`);
        }
      }
    });

    // (J) 실제로 “<span class='blank'>” → “<input>”으로 교체
    blank.replaceWith(input);

    // (K) 첫 번째 input에는 초기 포커스
    if (index === 0) {
      input.focus();
    }
  });
}

function findAnswer() {
  // 모든 .fillNode 요소(input 또는 채점 후 span)을 찾아서
  const nodes = document.querySelectorAll('.fillNode');
  nodes.forEach(node => {
    // dataset.originalAnswer가 원래 정답 문자열
    const original = node.dataset.originalAnswer;
    const span = document.createElement('span');
    span.classList.add('fillNode', 'correct');
    span.dataset.originalAnswer = original;
    span.textContent = original;

    // (A) span에도 “이전 input이나 span”의 픽셀 너비를 그대로 적용
    const measuredWidth = node.getBoundingClientRect().width;
    span.style.boxSizing = 'border-box';
    span.style.width = `${measuredWidth}px`;

    node.replaceWith(span);
  });
}

function disableScript() {
  // .fillNode(input 또는 정오/오답 표시 span)을 모두 찾아서
  const nodes = document.querySelectorAll('.fillNode');
  nodes.forEach(node => {
    const original = node.dataset.originalAnswer;
    const blankSpan = document.createElement('span');
    blankSpan.classList.add('blank');
    blankSpan.setAttribute('data-answer', original);
    // 빈칸(span)에는 텍스트를 보이지 않도록 빈 문자열만 둠
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

// 정규화 함수: 입력값과 정답 비교 시 사용할 간단한 텍스트 전처리
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
