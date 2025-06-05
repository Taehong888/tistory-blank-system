// ==========================
// blank-script.js
// 에듀프로젝트 사이트 “빈칸연습”과 똑같은 기능 재현
// ==========================

// 전역 변수: blank 요소 모아두기
let blanks = [];

// 문서 로드 직후(DOMContentLoaded 이전이어도 무방), 
// .blank가 하나라도 있으면 토글 UI 생성
const blankArray = document.querySelectorAll('.blank');
if (blankArray.length >= 1) {
  createLabelAndCheckbox();
}

// 만약 .blankTranslation 클래스를 쓴 요소가 이미 있으면 바로 스크립트 동작
if (document.getElementsByClassName("blankTranslation").length !== 0) {
  blanks = document.querySelectorAll('.blankTranslation');
  enableScript(blanks);
}

/**
 * enableScript: 실제로 “보기 모드 → 입력 모드”로 변환시키는 함수
 * blanks: NodeList of <span class="blankTranslation" data-answer="...">
 */
function enableScript(blanks) {
  let currentInput = 0;
  let solvedProblems = 0;

  blanks.forEach((blank, index) => {
    // 1) 원래 정답 문자열과 정규화된 답 생성
    const originalAnswer = blank.getAttribute('data-answer') || blank.textContent;
    const answer = normalizeText(originalAnswer);

    // 2) “보기 모드(.blank)”가 렌더된 픽셀 너비(width)를 측정
    //    반드시 blank 요소가 화면에 렌더링된 직후에 측정해야 함
    const blankRect = blank.getBoundingClientRect();
    const targetWidthPx = blankRect.width;

    // 3) input(element) 생성
    const input = document.createElement('input');
    input.classList.add('fillNode', 'quizQuestion');
    input.type = 'text';

    // 4) box-sizing: border-box; 상태이므로 “width = blank가 가진 전체 px(width)”를 지정
    input.style.boxSizing = 'border-box';
    input.style.width = `${targetWidthPx}px`;

    // 데이터 속성으로 정답 정보 저장
    input.dataset.answer = answer;
    input.dataset.originalAnswer = originalAnswer;

    // 5) 사용자가 클릭(포커스) 하면 currentInput 인덱스 업데이트
    input.addEventListener('click', function (e) {
      currentInput = Array.from(document.querySelectorAll("input.quizQuestion")).indexOf(e.target);
    });

    // 6) “Enter 키” 입력 이벤트 바인딩
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const userAnswer = normalizeText(input.value.trim());
        const span = document.createElement('span');

        if (userAnswer === input.dataset.answer) {
          // 정답 모드(.correct)
          span.classList.add('fillNode', 'correct');
        } else {
          // 오답 모드(.incorrect)
          span.classList.add('fillNode', 'incorrect');
          // 실제 틀린 값을 data-wrong에 저장하여 ::after 툴팁으로 표시
          span.dataset.wrong = input.value.trim();
        }

        // 7) .correct/.incorrect에서도 “같은 폭(width)” 유지
        span.style.boxSizing = 'border-box';
        span.style.width = `${targetWidthPx}px`;

        // 텍스트로는 항상 “원래 정답”만 보여 준다
        span.textContent = input.dataset.originalAnswer;
        span.dataset.originalAnswer = input.dataset.originalAnswer;

        solvedProblems += 1;
        input.replaceWith(span);

        // 8) 남아 있는 input이 있으면 다음 input에 포커스 이동
        const inputs = document.querySelectorAll('input.quizQuestion');
        if (inputs.length > 0) {
          currentInput = Math.min(currentInput, inputs.length - 1);
          inputs[currentInput].focus();
        } else {
          // 모든 문제 풀이가 끝나면 “정답률” 알림
          const correctProblems = document.getElementsByClassName("correct").length;
          const prob = Math.floor((correctProblems * 100) / solvedProblems);
          alert(`문제를 다 풀었어요!\n문제 수: ${solvedProblems}, 정답 수: ${correctProblems}, 정답률: ${prob}%`);
        }
      }
    });

    // 9) 실제로 “<span class="blankTranslation">” 요소를 “<input>”으로 교체
    blank.replaceWith(input);

    // 10) 첫 번째 input만 자동 포커스
    if (index === 0) {
      input.focus();
    }
  });
}

/**
 * findAnswer: “정답 보기” 버튼을 눌렀을 때 전체 .fillNode를 .correct로 바꿔 버린다.
 *             이때도 항상 “(교체 전)node.getBoundingClientRect().width”만큼 너비를 유지함
 */
function findAnswer() {
  const nodes = document.querySelectorAll('.fillNode');
  nodes.forEach(node => {
    const original = node.dataset.originalAnswer;
    const span = document.createElement('span');
    span.classList.add('fillNode', 'correct');

    // “교체 전” 노드의 렌더된 너비를 그대로 span에 지정
    const measuredWidth = node.getBoundingClientRect().width;
    span.style.boxSizing = 'border-box';
    span.style.width = `${measuredWidth}px`;

    span.dataset.originalAnswer = original;
    span.textContent = original;
    node.replaceWith(span);
  });
}

/**
 * disableScript: “입력 모드”에서 다시 “보기 모드(.blank)”로 되돌린다.
 *               이때 .fillNode(input 혹은 .correct/.incorrect)을 <span class="blank">로 교체
 */
function disableScript() {
  const nodes = document.querySelectorAll('.fillNode');
  nodes.forEach(node => {
    const original = node.dataset.originalAnswer;
    const blankSpan = document.createElement('span');
    blankSpan.classList.add('blank');
    blankSpan.setAttribute('data-answer', original);
    // .blank로 돌아갈 때는 텍스트를 숨겨야 하므로 빈 문자열만 남긴다
    blankSpan.textContent = '';
    node.replaceWith(blankSpan);
  });
}

/**
 * clearBlank: “빈칸 초기화” 버튼을 눌렀을 때
 *             1) disableScript() → 모든 .fillNode → .blank로 되돌린 뒤
 *             2) enableScript() → .blank → .fillNode(input) 다시 세팅
 */
function clearBlank() {
  disableScript();
  blanks = document.querySelectorAll('.blank');
  enableScript(blanks);
}

/**
 * createLabelAndCheckbox: 페이지 최상단에 “빈칸 채우기 모드” 토글 UI 생성
 */
function createLabelAndCheckbox() {
  const label = document.createElement('label');
  label.innerHTML = `
    <span style="font-weight:800; color:#0C3B18;"> 빈칸 채우기 모드</span>
    <p style="font-size:0.875em; color:#0A5A1D;">
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
  resultDiv.style.backgroundColor = '#E2FFEB';   /* 에듀프로젝트보다 살짝 연한 연두 */
  resultDiv.style.padding = '12px';
  resultDiv.style.borderRadius = '6px';
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

/**
 * normalizeText: 한글 조사 및 불필요 문장부호를 제거하여,
 *               정답 비교를 좀 더 유연하게 해 주는 함수
 */
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
