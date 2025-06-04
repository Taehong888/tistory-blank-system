document.addEventListener('DOMContentLoaded', () => {
  const fillToggleButton = document.getElementById('fill-toggle');
  const wrongNoteButton = document.getElementById('wrong-note');
  const blanks = document.querySelectorAll('.blank');

  let isFillMode = false;
  let isWrongNoteMode = false;

  // 빈칸에 마우스를 올리면 답 보이기
  blanks.forEach(blank => {
    blank.addEventListener('mouseover', () => {
      if (!isFillMode && !isWrongNoteMode) {
        blank.textContent = blank.dataset.answer;  // 답 보이기
      }
    });

    blank.addEventListener('mouseout', () => {
      if (!isFillMode && !isWrongNoteMode) {
        blank.textContent = '_____';  // 빈칸으로 되돌리기
      }
    });
  });

  // 빈칸 채우기 모드 전환
  fillToggleButton.addEventListener('click', () => {
    isFillMode = !isFillMode;
    if (isFillMode) {
      document.body.classList.remove('view-mode');
      fillToggleButton.textContent = '보기 모드';
      blanks.forEach(blank => blank.classList.add('active')); // 빈칸 활성화
    } else {
      document.body.classList.add('view-mode');
      fillToggleButton.textContent = '빈칸 채우기 모드';
      blanks.forEach(blank => blank.classList.remove('active')); // 빈칸 비활성화
    }
  });

  // 오답 노트 모드 전환
  wrongNoteButton.addEventListener('click', () => {
    isWrongNoteMode = !isWrongNoteMode;
    if (isWrongNoteMode) {
      wrongNoteButton.disabled = true;
      blanks.forEach(blank => {
        if (blank.classList.contains('incorrect')) {
          blank.classList.add('active');
        }
      });
    } else {
      wrongNoteButton.disabled = false;
      blanks.forEach(blank => {
        blank.classList.remove('active');
      });
    }
  });

  // 빈칸에 답 입력 후 정답/오답 확인
  blanks.forEach(blank => {
    blank.addEventListener('input', () => {
      const answer = blank.dataset.answer.trim();
      if (blank.textContent.trim() === answer) {
        blank.classList.add('correct');
        blank.classList.remove('incorrect');
      } else {
        blank.classList.add('incorrect');
        blank.classList.remove('correct');
      }
    });
  });
});
