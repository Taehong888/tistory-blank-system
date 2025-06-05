// ===========================================
// blank-script.js
// - 티스토리 빈칸 채우기 기능 구현 스크립트
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
  const blankArray = document.querySelectorAll('.blank');

  if (blankArray.length >= 1) {
    createLabelAndCheckbox();
  }

  if (document.getElementsByClassName('blankTranslation').length != 0) {
    const blanks = document.querySelectorAll('.blankTranslation');
    enableScript(blanks);
  }

  function enableScript(blanks) {
    let currentInput = 0;
    let solvedProblems = 0;
    const isPlaceholder = document.getElementsByClassName('blankTranslation').length != 0;

    blanks.forEach(blank => {
      const placeholder = blank.textContent;
      const answer = normalizeText(blank.textContent);
      const normalizedAnswer = normalizeText(answer);

      const input = document.createElement('input');
      input.classList.add('fillNode');
      input.type = 'text';
      input.dataset.answer = normalizedAnswer;
      input.dataset.originalAnswer = blank.textContent;
      input.size = Math.floor(answer.length * 1.2);

      if (isPlaceholder) {
        input.placeholder = placeholder;
        input.size = Math.floor(blank.textContent.length * 1.35);
      }

      input.classList.add('quizQuestion');

      input.addEventListener('click', function(e) {
        currentInput = Array.from(document.querySelectorAll('.quizQuestion')).indexOf(e.target);
      });

      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          const userAnswer = normalizeText(input.value.trim());
          const span = document.createElement('span');

          if (userAnswer === input.dataset.answer) {
            span.classList.add('fillNode', 'correct');
            span.textContent = input.dataset.originalAnswer;
            span.dataset.originalAnswer = input.dataset.originalAnswer;
          } else {
            span.classList.add('fillNode', 'incorrect');
            span.textContent = input.dataset.originalAnswer;
            span.dataset.originalAnswer = input.dataset.originalAnswer;
          }

          solvedProblems += 1;
          input.replaceWith(span);

          const nextInput = findNextInput();
          if (nextInput) {
            nextInput.focus();
          }
        }
      });

      blank.replaceWith(input);
    });

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

    function findNextInput() {
      const inputs = document.querySelectorAll('input.quizQuestion');
      const correctProblems = document.getElementsByClassName('correct').length;
      const prob = Math.floor((correctProblems * 100) / solvedProblems);

      if (document.getElementsByClassName('quizQuestion').length === 0) {
        alert(
          `문제를 다 풀었어요!\n문제 수: ${solvedProblems}, 정답 수: ${correctProblems}, 정답률: ${prob}%`
        );
        return null;
      }
      return inputs[currentInput];
    }
  }

  function findAnswer() {
    const inputs = document.querySelectorAll('.fillNode');
    inputs.forEach(input => {
      const span = document.createElement('span');
      span.classList.remove('incorrect');
      span.classList.add('correct', 'fillNode');
      span.dataset.originalAnswer = input.dataset.originalAnswer;
      span.textContent = input.dataset.originalAnswer;
      input.replaceWith(span);
    });
  }

  function disableScript() {
    const inputs = document.querySelectorAll('.fillNode');
    inputs.forEach(input => {
      const span = document.createElement('span');
      span.classList.remove('correct', 'incorrect');
      span.classList.add('blank', 'fillNode');
      span.textContent = input.dataset.originalAnswer;
      input.replaceWith(span);
    });
  }

  function clearBlank() {
    disableScript();
    const blanks = document.querySelectorAll('.blank');
    enableScript(blanks);
  }

  function createLabelAndCheckbox() {
    const container = document.createElement('div');
    container.id = 'blankToggleContainer';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'toggleScript';

    const label = document.createElement('label');
    label.htmlFor = 'toggleScript';
    label.innerHTML =
      '<span>빈칸 채우기 모드</span><p>* 마스킹한 내용이 빈칸 문제로 변환되며, 정답을 입력하고 Enter키를 누르시면 정오를 확인하실 수 있습니다. PC에서만 적용됩니다.</p>';

    container.appendChild(checkbox);
    container.appendChild(label);

    // 초기 안내문(모바일 사용자 안내문 추가)
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile') && !userAgent.includes('ipad') && !userAgent.includes('tablet')) {
      const mobileNotice = document.createElement('p');
      mobileNotice.classList.add('mobileNotice');
      mobileNotice.textContent = '* 모바일 환경에서는 기능이 제한될 수 있습니다.';
      container.appendChild(mobileNotice);
    }

    document.querySelector('.entry-content').prepend(container);

    let boxChecked = false;
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        if (!boxChecked) {
          boxChecked = true;
          const extraInfo = document.createElement('div');
          extraInfo.innerHTML =
            "<p>* <span class='blackButton' onclick='clearBlank();'>빈칸 초기화</span>: 빈칸을 모두 제거하고 다시 생성합니다.</p>" +
            "<p>* <span class='blackButton' onclick='findAnswer();'>정답 보기</span>: 빈칸의 정답을 모두 보여줍니다.</p>";
          container.appendChild(extraInfo);
        }
        const blanks = document.querySelectorAll('.blank');
        enableScript(blanks);
      } else {
        disableScript();
      }
    });
  }
});
