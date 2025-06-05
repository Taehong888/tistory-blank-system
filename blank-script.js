// ==========================
// blank-script.js
// (Enter 후 포커스 이동 시 iPad 키버퍼 초기화까지 포함)
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
    // 화면에 보이는 “연두박스”(.blank)에서 실질 텍스트(placeholder)와 정답(answer) 가져오기
    const placeholder = blank.textContent;
    const rawAnswer   = blank.getAttribute('data-answer') || blank.textContent;
    const answer      = normalizeText(rawAnswer);
    const normalizedAnswer = normalizeText(answer);

    // ───────────────────────────────────────────────────
    // (A) 보기 모드 연두박스 실제 픽셀 너비 계산
    // ───────────────────────────────────────────────────
    const rawWidth  = blank.getBoundingClientRect().width;
    const blankWidth = Math.ceil(rawWidth);

    const input = document.createElement('input');
    input.classList.add('fillNode');
    input.type = 'text';
    input.dataset.answer         = normalizedAnswer;
    input.dataset.originalAnswer = rawAnswer;
    input.size                   = answer.length;

    if (isPlaceholder) {
      input.placeholder = placeholder;
      input.size = placeholder.length;
    }

    input.classList.add('quizQuestion');
    // “화면에 보이던 연두박스 너비 + 0.3em 여백” 을 흰색 입력창 너비로 지정
    input.style.width = `calc(${blankWidth}px + 0.3em)`;

    input.addEventListener('click', function (e) {
      currentInput = Array.from(document.querySelectorAll("input.quizQuestion"))
                          .indexOf(e.target);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();

        const userAnswer = normalizeText(input.value.trim());
        const span = document.createElement('span');

        if (userAnswer === input.dataset.answer) {
          span.classList.add('correct');
        } else {
          span.classList.add('incorrect');
          span.dataset.wrong = input.value.trim();  // hover tooltip용
        }

        span.textContent = input.dataset.originalAnswer;
        span.dataset.originalAnswer = input.dataset.originalAnswer;
        // replace 후 “박스 너비” 그대로 유지
        span.style.width = `${blankWidth}px`;

        solvedProblems += 1;
        input.replaceWith(span);

        // ───────────────────────────────────────────────────
        // (B) 다음 입력창으로 포커스 이동 후 즉시 value='' 초기화 (iPad 키버퍼 초기화)
        // ───────────────────────────────────────────────────
        const inputs = document.querySelectorAll('input.quizQuestion');
        if (inputs.length > 0) {
          currentInput = Math.min(currentInput, inputs.length - 1);
          const nextInput = inputs[currentInput];
          nextInput.focus();
          nextInput.value = ''; // iPad 환경에서 “엔터 버퍼” 제거
        } else {
          // 모든 문제 풀이가 끝났으면 정답률 알림
          const correctProblems = document.getElementsByClassName("correct").length;
          const prob = Math.floor((correctProblems * 100) / solvedProblems);
          alert(
            `문제를 다 풀었어요!\n문제 수: ${solvedProblems}, 정답 수: ${correctProblems}, 정답률: ${prob}%`
          );
        }
      }
      else if (e.key === 'Tab') {
        // Tab 키로 다음 입력창 이동 시에도 value 버퍼 초기화
        e.preventDefault();
        const inputs = Array.from(document.querySelectorAll('input.quizQuestion'));
        const idx    = inputs.indexOf(input);
        const next   = inputs[idx + 1];
        if (next) {
          next.focus();
          next.value = '';
        }
      }
    });

    // 기존 빈칸(.blank)을 생성한 input으로 교체
    blank.replaceWith(input);
  });

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

  function findNextInput() {
    const inputs = document.querySelectorAll('input.quizQuestion');
    const correctProblems = document.getElementsByClassName("correct").length;
    const prob = Math.floor(correctProblems * 100 / solvedProblems);

    if (inputs.length === 0) {
      alert(
        `문제를 다 풀었어요!\n문제 수: ${solvedProblems}, 정답 수: ${correctProblems}, 정답률: ${prob}%`
      );
    }
    return inputs[currentInput];
  }
}

function findAnswer() {
  const nodes = document.querySelectorAll('.fillNode');
  nodes.forEach(node => {
    const span = document.createElement('span');
    span.classList.add('correct');
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
    <p style='margin:0; font-size:0.875em; color:#07611f;'>
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
  resultDiv.style.padding = '10px';      // 필요 시 '6px 20px' 같은 형태로 조정 가능
  resultDiv.style.borderRadius = '5px';
  resultDiv.style.marginBottom = '0px';  // 바로 아래 여백 제거
  resultDiv.append(checkbox, label, controlArea);

  const entryContent = document.getElementsByClassName("entry-content")[0];
  entryContent.prepend(resultDiv);

  // 연두색 박스 바로 다음 요소(<p>나 <h2> 등)의 margin-top을 0으로 강제
  const nextElem = resultDiv.nextElementSibling;
  if (nextElem) {
    nextElem.style.marginTop = '0px';
  }

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
