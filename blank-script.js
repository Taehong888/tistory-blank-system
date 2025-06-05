// ==========================
// blank-script.js (박스 없이 텍스트만 표시하도록 수정된 버전)
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
  let isPlaceholder = document.getElementsByClassName("blankTranslation").length !== 0;

  blanks.forEach(blank => {
    const placeholder = blank.textContent;
    const rawAnswer   = blank.getAttribute('data-answer') || blank.textContent;
    const answer      = normalizeText(rawAnswer);
    const normalizedAnswer = normalizeText(answer);

    // 보기 모드 녹색 박스에서 폭을 가져와서 저장
    const blankWidth = blank.getBoundingClientRect().width;

    const input = document.createElement('input');
    input.classList.add('fillNode');
    input.type = 'text';
    input.dataset.answer = normalizedAnswer;
    input.dataset.originalAnswer = rawAnswer;
    input.size = answer.length;

    if (isPlaceholder) {
      input.placeholder = placeholder;
      input.size = placeholder.length;
    }

    input.classList.add('quizQuestion');
    input.style.width = `${blankWidth}px`;

    input.addEventListener('click', function (e) {
      currentInput = Array.from(
        document.querySelectorAll("input.quizQuestion")
      ).indexOf(e.target);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const userAnswer = normalizeText(input.value.trim());
        const span = document.createElement('span');

        if (userAnswer === input.dataset.answer) {
          // ─────────────────────────────────────────────────────────
          // ★ 수정: 'fillNode' 클래스를 제거하고, 'correct'만 남깁니다.
          //     이렇게 하면 흰색 배경과 테두리가 사라지고
          //     초록색 텍스트만 보이게 됩니다.
          // ─────────────────────────────────────────────────────────
          span.classList.add('correct');
        } else {
          // ─────────────────────────────────────────────────────────
          // ★ 수정: 'fillNode' 클래스를 제거하고, 'incorrect'만 남깁니다.
          //     이렇게 하면 흰색 배경과 테두리가 사라지고
          //     빨간색 텍스트(틀린 정답)만 보이게 됩니다.
          // ─────────────────────────────────────────────────────────
          span.classList.add('incorrect');
          span.dataset.wrong = input.value.trim();
        }

        span.textContent = input.dataset.originalAnswer;
        span.dataset.originalAnswer = input.dataset.originalAnswer;

        // ─────────────────────────────────────────────────────────
        // ★ 수정: 이제 span 폭도 제거해 둡니다. 
        //     (텍스트만 나오게 하려면 width를 고정할 필요가 없습니다.)
        // ─────────────────────────────────────────────────────────
        // span.style.width = `${blankWidth}px`;  <-- 이 줄 삭제

        solvedProblems += 1;
        input.replaceWith(span);

        const nextInput = findNextInput();
        if (nextInput) nextInput.focus();
      }
    });

    blank.replaceWith(input);
  });

  function normalizeText(text) {
    return text.replace(/[\/⋅.,]/g, '')
               .replace(/이요/g, '이고').replace(/은 /g, '')
               .replace(/는 /g, '').replace(/이/g, '')
               .replace(/가/g, '').replace(/을/g, '')
               .replace(/를/g, '').replace(/및/g, '')
               .replace(/와/g, '').replace(/과/g, '')
               .replace(/에게/g, '').replace(/\s+/g, '');
  }

  function findNextInput() {
    const inputs = document.querySelectorAll('input.quizQuestion');
    const correctProblems = document.getElementsByClassName("correct").length;
    const prob = Math.floor(correctProblems * 100 / solvedProblems);

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
    // ─────────────────────────────────────────────────────────
    // ★ 수정: fillNode 클래스를 제거하고, correct 클래스만 추가
    //     → 정답 모드일 때도 텍스트만 보여 줍니다.
    // ─────────────────────────────────────────────────────────
    span.classList.add('correct');
    span.dataset.originalAnswer = node.dataset.originalAnswer;
    span.textContent = node.dataset.originalAnswer;
    // 폭을 지정할 필요가 없으므로 아래 줄 삭제
    // span.style.width = `${node.dataset.originalAnswer.length}ch`;
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
    // ─────────────────────────────────────────────────────────
    // ★ 수정: 새로 생성하는 빈칸(span)에 width 할당을 하지 않습니다.
    //     → CSS의 자동 폭 계산(.blank::before)으로 되돌아갑니다.
    // ─────────────────────────────────────────────────────────
    // blankSpan.style.width = `${original.length}ch`;  <-- 삭제
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
    <span style='font-weight:800; color:#0c3b18;'> 빈칸 채우기 모드</span>
    <p style='font-size:0.875em; color:#07611f;'>* 마스킹한 내용이 빈칸 문제로 변환됩니다. 입력 후 Enter키를 누르면 정오를 확인할 수 있습니다. PC에서만 적용됩니다.</p>
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

// 입력 및 정답 판정 시 사용할 정규화 함수(여러 상황에 맞춰 가장 간단히 유지)
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
