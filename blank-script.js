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
    // 원래 정답 문자열
    const originalAnswer = blank.getAttribute('data-answer') || blank.textContent;
    const answer = normalizeText(originalAnswer);

    // 1) input 요소 생성
    const input = document.createElement('input');
    input.classList.add('fillNode', 'quizQuestion');
    input.type = 'text';

    // “size” 속성에 정답 길이 설정 → 글자 수 만큼 너비 자동 조절
    input.style.boxSizing = 'border-box';
    input.style.width = `${originalAnswer.length}ch`;

    // 정답 정보는 dataset에 저장
    input.dataset.answer = answer;
    input.dataset.originalAnswer = originalAnswer;

    // 클릭했을 때 currentInput 업데이트
    input.addEventListener('click', function (e) {
      currentInput = Array.from(document.querySelectorAll("input.quizQuestion")).indexOf(e.target);
    });

    // Enter 키 입력 시 정오 판정
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const userAnswer = normalizeText(input.value.trim());
        const span = document.createElement('span');

        if (userAnswer === input.dataset.answer) {
          // 정답
          span.classList.add('fillNode', 'correct');
        } else {
          // 오답
          span.classList.add('fillNode', 'incorrect');
          // 틀린 값을 data-wrong에 저장해야 ::after로 툴팁이 나온다
          span.dataset.wrong = input.value.trim();
        }

        // span 안에 원래 정답 문자열만 표시
        span.textContent = input.dataset.originalAnswer;
        span.dataset.originalAnswer = input.dataset.originalAnswer;
        // size 속성을 제거하거나, width:auto를 적용하기 위해 size 속성도 함께 제거
        span.removeAttribute('data-size');

        solvedProblems += 1;
        input.replaceWith(span);

        // 나머지 input들 다시 확인 후 포커스 이동
        const inputs = document.querySelectorAll('input.quizQuestion');
        if (inputs.length > 0) {
          // currentInput이 넘치지 않도록 조정
          currentInput = Math.min(currentInput, inputs.length - 1);
          inputs[currentInput].focus();
        } else {
          // 전부 풀었으면 정답률 표시
          const correctProblems = document.getElementsByClassName("correct").length;
          const prob = Math.floor((correctProblems * 100) / solvedProblems);
          alert(`문제를 다 풀었어요!\n문제 수: ${solvedProblems}, 정답 수: ${correctProblems}, 정답률: ${prob}%`);
        }
      }
    });

    // 기존 빈칸(span)을 생성한 input으로 교체
    blank.replaceWith(input);

    // 첫 번째 input에 초기 포커스
    if (index === 0) {
      input.focus();
    }
  });
}

function findAnswer() {
  // 모든 .fillNode 요소(입력창 또는 정오 판정 후 span)를 찾아서
  const nodes = document.querySelectorAll('.fillNode');
  nodes.forEach(node => {
    // dataset.originalAnswer가 정답 문자열
    const original = node.dataset.originalAnswer;
    const span = document.createElement('span');
    span.classList.add('fillNode', 'correct');
    span.dataset.originalAnswer = original;
    span.textContent = original;
    // size 속성이 아니라, CSS의 auto 너비를 사용함
    span.removeAttribute('data-size');
    node.replaceWith(span);
  });
}

function disableScript() {
  // .fillNode (input 또는 정오/오답 표시 span)을 모두 찾아서
  const nodes = document.querySelectorAll('.fillNode');
  nodes.forEach(node => {
    const original = node.dataset.originalAnswer;
    const blankSpan = document.createElement('span');
    blankSpan.classList.add('blank');
    blankSpan.setAttribute('data-answer', original);
    // 박스 안에 기존 텍스트가 보이지 않도록 빈 문자열만 둠
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
