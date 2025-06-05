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
    // 1) 원래 정답 문자열
    const originalAnswer = blank.getAttribute('data-answer') || blank.textContent;
    const answer = normalizeText(originalAnswer);

    // 2) 보기 모드(.blank)의 현재 “픽셀 너비”를 측정
    //    getBoundingClientRect()는 화면에 렌더된 상태에서 exact width(px)를 반환한다.
    const blankRect = blank.getBoundingClientRect();
    const targetWidthPx = blankRect.width;

    // 3) input 요소 생성
    const input = document.createElement('input');
    input.classList.add('fillNode', 'quizQuestion');
    input.type = 'text';

    // ‼️ 여기서는 input.size 대신 “픽셀 단위 width”를 직접 지정한다. ‼️
    // box-sizing: border-box; 상태이므로 ‘width = targetWidthPx’면
    // border + padding을 포함한 전체 박스 너비가 동일해진다.
    input.style.boxSizing = 'border-box';
    input.style.width = `${targetWidthPx}px`;

    // 정답 데이터 속성 기록
    input.dataset.answer = answer;
    input.dataset.originalAnswer = originalAnswer;

    // 클릭 시 currentInput 인덱스 업데이트
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
          // 틀린 값을 data-wrong에 저장해야 ::after 툴팁이 뜬다
          span.dataset.wrong = input.value.trim();
        }

        // span에도 동일한 픽셀 너비를 지정하여 “정답 보기” 시에도 크기가 그대로 유지되게 함
        span.style.boxSizing = 'border-box';
        span.style.width = `${targetWidthPx}px`;

        // span 안에는 원래 정답 문자열만 텍스트로 넣는다
        span.textContent = input.dataset.originalAnswer;
        span.dataset.originalAnswer = input.dataset.originalAnswer;

        solvedProblems += 1;
        input.replaceWith(span);

        // 남은 input에 포커스 이동
        const inputs = document.querySelectorAll('input.quizQuestion');
        if (inputs.length > 0) {
          currentInput = Math.min(currentInput, inputs.length - 1);
          inputs[currentInput].focus();
        } else {
          // 모든 문제를 풀었을 때 정답률 출력
          const correctProblems = document.getElementsByClassName("correct").length;
          const prob = Math.floor((correctProblems * 100) / solvedProblems);
          alert(`문제를 다 풀었어요!\n문제 수: ${solvedProblems}, 정답 수: ${correctProblems}, 정답률: ${prob}%`);
        }
      }
    });

    // 4) 실제 교체: blank(span) → input
    blank.replaceWith(input);

    // 페이지 로드 직후 첫 번째 input만 자동으로 포커스
    if (index === 0) {
      input.focus();
    }
  });
}

function findAnswer() {
  // 모든 .fillNode 요소(입력창 또는 정오·오답 표시 span)를 찾아서
  const nodes = document.querySelectorAll('.fillNode');
  nodes.forEach(node => {
    // 각 노드의 data-originalAnswer가 바로 정답 문자열
    const original = node.dataset.originalAnswer;
    const span = document.createElement('span');
    span.classList.add('fillNode', 'correct');

    // 이 span도 같은 픽셀 너비를 유지해야 하므로, 
    // node.getBoundingClientRect().width 로 측정해서 지정
    const measuredWidth = node.getBoundingClientRect().width;
    span.style.boxSizing = 'border-box';
    span.style.width = `${measuredWidth}px`;

    span.dataset.originalAnswer = original;
    span.textContent = original;
    node.replaceWith(span);
  });
}

function disableScript() {
  // 모든 .fillNode 요소(input 또는 정오/오답 표시 span)→ .blank(span)으로 복원
  const nodes = document.querySelectorAll('.fillNode');
  nodes.forEach(node => {
    // 원래 정답 문자열
    const original = node.dataset.originalAnswer;
    const blankSpan = document.createElement('span');
    blankSpan.classList.add('blank');
    blankSpan.setAttribute('data-answer', original);

    // 보기 모드에서는 텍스트가 보이지 않도록 빈 문자열만 넣는다
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
