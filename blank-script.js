// ======================== 배포용 blank-script.min.js ========================
document.addEventListener("DOMContentLoaded", function() {
  const toggleBtn = document.getElementById("fill-toggle");
  const wrongBtn = document.getElementById("wrong-note");
  const bodyEl = document.body;
  let isComposing = false;

  document.addEventListener("compositionstart", () => { isComposing = true; });
  document.addEventListener("compositionend", () => { isComposing = false; });

  const blanks = document.querySelectorAll(".blank");
  const inputs = [], answers = [];

  blanks.forEach(function(blank) {
    const inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.className = "blank-input";
    inputEl.setAttribute("data-answer", blank.getAttribute("data-answer"));
    inputEl.placeholder = "";
    inputEl.autocomplete = "off";

    const spanEl = document.createElement("span");
    spanEl.className = "answered";
    spanEl.style.display = "none";

    blank.insertAdjacentElement("afterend", spanEl);
    spanEl.insertAdjacentElement("afterend", inputEl);
    inputs.push(inputEl);
    answers.push(spanEl);
  });

  // input 크기조절
  inputs.forEach(function(input, idx) {
    const blankEl = blanks[idx];
    if (blankEl) {
      input.style.width = blankEl.offsetWidth + "px";
      input.style.height = blankEl.offsetHeight + "px";
    }
  });

  // 모드 전환
  toggleBtn.addEventListener("click", function() {
    if (bodyEl.classList.contains("fill-mode")) {
      bodyEl.classList.remove("fill-mode");
      toggleBtn.textContent = "빈칸 채우기 모드";
      inputs.forEach(input => {
        input.value = "";
        input.style.setProperty("display", "none", "important");
      });
      answers.forEach(span => {
        span.textContent = "";
        span.style.setProperty("display", "none", "important");
        span.classList.remove("correct", "wrong");
        span.removeAttribute("data-wrong");
      });
    } else {
      bodyEl.classList.add("fill-mode");
      toggleBtn.textContent = "보기 모드";
      answers.forEach(span => {
        span.textContent = "";
        span.style.setProperty("display", "none", "important");
        span.classList.remove("correct", "wrong");
        span.removeAttribute("data-wrong");
      });
      inputs.forEach(input => {
        input.style.removeProperty("display");
      });
      if (inputs.length > 0) {
        inputs[0].style.setProperty("display", "inline-block", "important");
        inputs[0].focus();
      }
    }
  });

  // 오답 노트
  wrongBtn.addEventListener("click", function() {
    if (!bodyEl.classList.contains("fill-mode")) {
      bodyEl.classList.add("fill-mode");
      toggleBtn.textContent = "보기 모드";
    }
    answers.forEach(function(span, idx) {
      if (span.classList.contains("wrong")) {
        span.style.setProperty("display", "none", "important");
        span.classList.remove("wrong");
        span.removeAttribute("data-wrong");
        const input = inputs[idx];
        input.value = "";
        input.style.setProperty("display", "inline-block", "important");
        input.focus();
      }
    });
  });

  // 입력 이벤트
  inputs.forEach(function(input) {
    input.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        if (isComposing) return;
        event.preventDefault();
        setTimeout(function() {
          const userRaw = input.value.trim();
          const userNorm = userRaw.replace(/\s+/g, "");
          const correctRaw = input.dataset.answer.trim();
          const correctNorm = correctRaw.replace(/\s+/g, "");
          const idx = Array.from(inputs).indexOf(input);
          const answerSpan = answers[idx];

          answerSpan.classList.remove("correct", "wrong");
          answerSpan.removeAttribute("data-wrong");

          if (userNorm === correctNorm) {
            answerSpan.textContent = correctRaw;
            answerSpan.classList.add("correct");
            answerSpan.style.setProperty("display", "inline-block", "important");
          } else {
            answerSpan.textContent = correctRaw;
            answerSpan.classList.add("wrong");
            answerSpan.setAttribute("data-wrong", userRaw);
            answerSpan.style.setProperty("display", "inline-block", "important");
          }
          input.style.setProperty("display", "none", "important");
          const nextInput = inputs[idx + 1];
          if (nextInput) {
            nextInput.style.setProperty("display", "inline-block", "important");
            nextInput.focus();
          }
        }, 50);
      }
    });
    input.addEventListener("input", function() {
      const idx = Array.from(inputs).indexOf(input);
      const answerSpan = answers[idx];
      answerSpan.classList.remove("correct", "wrong");
      answerSpan.removeAttribute("data-wrong");
    });
  });
});
