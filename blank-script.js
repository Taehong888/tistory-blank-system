// ==========================
// blank-script.js (전체 수정된 버전: 다음 빈칸 자동 포커스 복원 포함)
//  • .blank의 실제 픽셀 너비를 읽어와 <input>과 <span>에 그대로 적용
//  • Enter 누르면 다음 빈칸으로 자동 이동
//  • Tab 키 이동 지원
//  • 화면 리사이즈/회전 시 너비 재계산 지원
// ==========================

let blanks = [];

// 페이지 로드 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  const blankArray = document.querySelectorAll(".blank");
  if (blankArray.length >= 1) {
    createLabelAndCheckbox();
  }
  // blankTranslation 요소가 있으면 즉시 enableScript 호출
  if (document.getElementsByClassName("blankTranslation").length !== 0) {
    blanks = document.querySelectorAll(".blankTranslation");
    enableScript(blanks);
  }
});

// 윈도우 리사이즈 및 화면 회전 이벤트: ch 단위 대신 픽셀 너비 재계산
window.addEventListener("resize", recalcAllWidths);
window.addEventListener("orientationchange", recalcAllWidths);

function recalcAllWidths() {
  // 화면에 보이는 모든 .fillNode(input)과 .correct/.incorrect(span)에 대해
  // data-original-answer 글자 수 × ch 단위로 너비 재설정
  document.querySelectorAll(".fillNode").forEach((node) => {
    const original = node.dataset.originalAnswer;
    if (!original) return;
    node.style.width = `${original.length}ch`;
  });
  document.querySelectorAll(".correct, .incorrect").forEach((span) => {
    const original = span.dataset.originalAnswer;
    if (!original) return;
    span.style.width = `${original.length}ch`;
  });
}

function enableScript(blanks) {
  let currentInput = 0;
  let solvedProblems = 0;

  blanks.forEach((blank, index) => {
    const originalAnswer = blank.getAttribute("data-answer") || blank.textContent;
    const answer = normalizeText(originalAnswer);

    // (1) .blank가 렌더된 후 실제 픽셀 너비와 padding 값을 측정
    setTimeout(() => {
      const rect = blank.getBoundingClientRect();
      const blankWidthPx = rect.width;

      // 현재 문서에서 1em이 몇 px인지 구하기
      const computed = window.getComputedStyle(blank);
      const emInPx = parseFloat(computed.fontSize); // 예: "16px" → 16
      // .fillNode는 padding-left/right: 0.3em 이므로, 총 0.3em * 2 만큼의 px를 더해줌
      const paddingTotalPx = emInPx * 0.3 * 2;

      // 최종 입력창 폭 = .blank 폭 + (좌우 padding 합)
      const targetWidthPx = blankWidthPx + paddingTotalPx;

      // (2) input 요소 생성
      const input = document.createElement("input");
      input.classList.add("fillNode", "quizQuestion");
      input.type = "text";

      // (3) box-sizing:border-box 이므로 width에 padding과 border가 포함됨
      input.style.boxSizing = "border-box";
      input.style.width = `${targetWidthPx}px`;

      input.dataset.answer = answer;
      input.dataset.originalAnswer = originalAnswer;

      // (4) 클릭 시 currentInput 업데이트 (자동 포커스 복원용)
      input.addEventListener("click", function (e) {
        currentInput = Array.from(
          document.querySelectorAll("input.quizQuestion")
        ).indexOf(e.target);
      });

      // (5) 키다운 이벤트: Enter로 정답 처리 및 다음 빈칸 자동 포커스, Tab으로 다음 입력창 이동
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();

          // (5-1) 정오 판정
          const userAnswer = normalizeText(input.value.trim());
          const span = document.createElement("span");

          if (userAnswer === input.dataset.answer) {
            span.classList.add("fillNode", "correct");
          } else {
            span.classList.add("fillNode", "incorrect");
            span.dataset.wrong = input.value.trim();
          }

          span.textContent = input.dataset.originalAnswer;
          span.dataset.originalAnswer = input.dataset.originalAnswer;
          span.style.boxSizing = "border-box";
          span.style.width = `${targetWidthPx}px`;

          solvedProblems += 1;
          input.replaceWith(span);

          // (5-2) 다음 빈칸 자동 포커스
          const inputs = document.querySelectorAll("input.quizQuestion");
          if (inputs.length > 0) {
            currentInput = Math.min(currentInput, inputs.length - 1);
            inputs[currentInput].focus();
          } else {
            // 모든 칸을 풀었을 때
            const correctProblems =
              document.getElementsByClassName("correct").length;
            const prob = Math.floor((correctProblems * 100) / solvedProblems);
            alert(
              `문제를 다 풀었어요!\n문제 수: ${solvedProblems}, 정답 수: ${correctProblems}, 정답률: ${prob}%`
            );
          }
        } else if (e.key === "Tab") {
          e.preventDefault();
          const inputs = Array.from(
            document.querySelectorAll("input.quizQuestion")
          );
          const idx = inputs.indexOf(input);
          const next = inputs[idx + 1];
          if (next) next.focus();
        }
      });

      // (6) .blank → <input> 교체
      blank.replaceWith(input);
      // 첫 번째 칸은 index === 0일 때만 자동 포커스
      if (index === 0) {
        input.focus();
      }
    }, 0);
  });
}

function processAnswer(input, originalAnswer, widthPx, moveNext) {
  // (이 함수는 예전 방식이 아니라 enableScript 내부에서 바로 처리하므로 사용되지 않습니다.)
}

function findAnswer() {
  document.querySelectorAll(".fillNode").forEach((node) => {
    const original = node.dataset.originalAnswer;
    if (!original) return;

    const span = document.createElement("span");
    span.classList.add("fillNode", "correct");
    span.dataset.originalAnswer = original;
    span.textContent = original;

    // (B) 현재 노드의 렌더된 픽셀 너비를 가져와 동일하게 적용
    const measuredWidth = node.getBoundingClientRect().width;
    span.style.boxSizing = "border-box";
    span.style.width = `${measuredWidth}px`;

    node.replaceWith(span);
  });
}

function disableScript() {
  document.querySelectorAll(".fillNode").forEach((node) => {
    const original = node.dataset.originalAnswer;
    if (!original) return;
    const blankSpan = document.createElement("span");
    blankSpan.classList.add("blank");
    blankSpan.setAttribute("data-answer", original);
    blankSpan.textContent = "";
    node.replaceWith(blankSpan);
  });
}

function clearBlank() {
  disableScript();
  blanks = document.querySelectorAll(".blank");
  enableScript(blanks);
}

function createLabelAndCheckbox() {
  const label = document.createElement("label");
  label.innerHTML = `
    <span style="font-weight:800; color:#0c3b18;"> 빈칸 채우기 모드</span>
    <p style="font-size:0.875em; color:#07611f;">
      * 마스킹한 내용이 빈칸 문제로 변환됩니다. 입력 후 Enter키를 누르면 정오를 확인할 수 있습니다. PC 및 터치 기기에서 모두 동작합니다.
    </p>
  `;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "toggleScript";
  checkbox.style.marginRight = "8px";

  const controlArea = document.createElement("div");
  controlArea.style.display = "none";

  const clearBtn = document.createElement("span");
  clearBtn.textContent = "빈칸 초기화";
  clearBtn.className = "blackButton";
  clearBtn.style.cursor = "pointer";
  clearBtn.onclick = clearBlank;

  const answerBtn = document.createElement("span");
  answerBtn.textContent = "정답 보기";
  answerBtn.className = "blackButton";
  answerBtn.style.cursor = "pointer";
  answerBtn.style.marginLeft = "15px";
  answerBtn.onclick = findAnswer;

  controlArea.append(clearBtn, answerBtn);

  const resultDiv = document.createElement("div");
  resultDiv.style.backgroundColor = "#b8fcb8";
  resultDiv.style.padding = "10px";
  resultDiv.style.borderRadius = "5px";
  resultDiv.style.marginBottom = "20px";
  resultDiv.append(checkbox, label, controlArea);

  const entryContent = document.getElementsByClassName("entry-content")[0];
  entryContent.prepend(resultDiv);

  checkbox.addEventListener("change", function () {
    if (this.checked) {
      controlArea.style.display = "block";
      disableScript();
      blanks = document.querySelectorAll(".blank");
      enableScript(blanks);
    } else {
      controlArea.style.display = "none";
      disableScript();
    }
  });
}

// 정답 비교용 텍스트 정규화 함수
function normalizeText(text) {
  return text
    .replace(/[\/⋅.,]/g, "")
    .replace(/이요/g, "이고")
    .replace(/은 /g, "")
    .replace(/는 /g, "")
    .replace(/이/g, "")
    .replace(/가/g, "")
    .replace(/을/g, "")
    .replace(/를/g, "")
    .replace(/및/g, "")
    .replace(/와/g, "")
    .replace(/과/g, "")
    .replace(/에게/g, "")
    .replace(/\s+/g, "");
}
