const STORAGE_KEY = 'study-shuffle-app-json';

const state = {
  data: null,
  selectedTopicId: null,
  shuffledQuestions: [],
  currentIndex: 0,
  totalCorrect: 0,
  answered: [],
  isQuizStarted: false,
};

const topicListEl = document.getElementById('topicList');
const quizStateEl = document.getElementById('quizState');
const quizCardEl = document.getElementById('quizCard');
const resultSummaryEl = document.getElementById('resultSummary');
const appTitleEl = document.getElementById('appTitle');
const jsonFileInputEl = document.getElementById('jsonFileInput');

function loadDataFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return null;
    }
    return JSON.parse(saved);
  } catch (error) {
    console.warn('保存済みJSONの読み込みに失敗:', error);
    return null;
  }
}

function saveDataToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('JSONの保存に失敗:', error);
  }
}

function initApp() {
  const storedData = loadDataFromStorage();

  if (storedData) {
    try {
      applyData(storedData);
      return;
    } catch (error) {
      console.warn('保存済みJSONの形式が不正:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  showEmptyMessage('JSONファイルを選択してください。選んだファイルはこの端末に保存されます。');
}

function showEmptyMessage(message) {
  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.textContent = message;
  quizStateEl.textContent = 'JSONファイルを選択してください。';
  topicListEl.innerHTML = '';
  topicListEl.appendChild(empty);
  quizCardEl.classList.add('hidden');
  resultSummaryEl.classList.add('hidden');
}

function applyData(data) {
  if (!data || !Array.isArray(data.modules) || !Array.isArray(data.questions)) {
    throw new Error('JSONの形式が正しくありません。modules と questions が必要です。');
  }

  state.data = data;
  appTitleEl.textContent = data.title || '副教科暗記アプリ';

  if (data.modules.length > 0) {
    state.selectedTopicId = data.modules[0].id;
  }

  renderTopics();
  renderQuizState();
  hideQuizResults();
}

function renderTopics() {
  topicListEl.innerHTML = '';

  state.data.modules.forEach((module) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `topic-item ${state.selectedTopicId === module.id ? 'active' : ''}`;
    button.innerHTML = `<strong>${module.title}</strong>`;
    button.addEventListener('click', () => {
      state.selectedTopicId = module.id;
      state.isQuizStarted = false;
      state.shuffledQuestions = [];
      state.currentIndex = 0;
      state.totalCorrect = 0;
      state.answered = [];
      renderTopics();
      renderQuizState();
      hideQuizResults();
    });
    topicListEl.appendChild(button);
  });
}

function shuffleArray(items) {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function getSelectedModule() {
  return state.data.modules.find((module) => module.id === state.selectedTopicId) || null;
}

function getQuestionsForSelectedModule() {
  return (state.data.questions || []).filter((question) => question.moduleId === state.selectedTopicId);
}

function renderQuizState() {
  const selectedModule = getSelectedModule();

  if (!selectedModule) {
    quizStateEl.textContent = '問題を読み込めませんでした。';
    return;
  }

  if (!state.isQuizStarted) {
    const count = getQuestionsForSelectedModule().length;
    quizStateEl.textContent = `${selectedModule.title} の問題: ${count}問`;
  } else {
    quizStateEl.textContent = `進捗: ${state.currentIndex + 1}/${state.shuffledQuestions.length}問  正解数: ${state.totalCorrect}`;
  }
}

function hideQuizResults() {
  quizCardEl.classList.add('hidden');
  resultSummaryEl.classList.add('hidden');
}

function handleJsonFile(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      applyData(parsed);
      saveDataToStorage(parsed);
    } catch (error) {
      alert('JSONファイルの内容が正しくありません。');
      console.error(error);
    }
  };
  reader.readAsText(file);
}

function startQuiz() {
  const selectedModule = getSelectedModule();
  if (!selectedModule) {
    return;
  }

  const questions = getQuestionsForSelectedModule();
  if (questions.length === 0) {
    quizCardEl.classList.remove('hidden');
    quizCardEl.innerHTML = '<div class="empty-state">この章には問題がありません。JSONの questions を追加してください。</div>';
    resultSummaryEl.classList.add('hidden');
    return;
  }

  state.shuffledQuestions = shuffleArray(questions);
  state.currentIndex = 0;
  state.totalCorrect = 0;
  state.answered = [];
  state.isQuizStarted = true;
  renderQuizState();
  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const currentQuestion = state.shuffledQuestions[state.currentIndex];
  if (!currentQuestion) {
    showResultSummary();
    return;
  }

  const questionNumber = state.currentIndex + 1;
  const selectedAnswer = state.answered[state.currentIndex];

  quizCardEl.classList.remove('hidden');
  resultSummaryEl.classList.add('hidden');

  const optionsHtml = currentQuestion.options
    .map((option, index) => {
      const isSelected = selectedAnswer === index;
      const isCorrect = index === currentQuestion.answerIndex;

      let className = 'choice-item';
      if (isSelected) className += ' selected';
      if (selectedAnswer !== undefined && isCorrect) className += ' correct';
      if (selectedAnswer !== undefined && isSelected && !isCorrect) className += ' wrong';

      return `
        <label class="${className}">
          <input type="radio" name="answer" value="${index}" ${isSelected ? 'checked' : ''} />
          <span>${option}</span>
        </label>
      `;
    })
    .join('');

  quizCardEl.innerHTML = `
    <div class="question-box">
      <h3>Q${questionNumber}. ${currentQuestion.question}</h3>
      <div class="choice-list">${optionsHtml}</div>
      <button class="primary-btn answer-btn" type="button" data-action="check">答えを確認</button>
    </div>
  `;
}

function showResultSummary() {
  const total = state.shuffledQuestions.length;
  const scoreRatio = total > 0 ? Math.round((state.totalCorrect / total) * 100) : 0;

  quizCardEl.classList.add('hidden');
  resultSummaryEl.classList.remove('hidden');

  resultSummaryEl.innerHTML = `
    <h3>結果</h3>
    <ul>
      <li>問題数: ${total}問</li>
      <li>正解数: ${state.totalCorrect}問</li>
      <li>正答率: ${scoreRatio}%</li>
    </ul>
  `;
}

function checkAnswer() {
  const currentQuestion = state.shuffledQuestions[state.currentIndex];
  if (!currentQuestion) return;

  const selectedValue = document.querySelector('input[name="answer"]:checked');
  if (!selectedValue) {
    alert('答えを選択してください。');
    return;
  }

  const userChoice = Number(selectedValue.value);
  const isCorrect = userChoice === currentQuestion.answerIndex;
  state.answered[state.currentIndex] = userChoice;

  if (isCorrect) {
    state.totalCorrect += 1;
  }

  renderQuizState();
  showQuestionResult(currentQuestion, userChoice, isCorrect);
}

function showQuestionResult(currentQuestion, userChoice, isCorrect) {
  const optionsHtml = currentQuestion.options
    .map((option, index) => {
      const isSelected = userChoice === index;
      const isCorrectOption = index === currentQuestion.answerIndex;

      let className = 'choice-item';
      if (isCorrectOption) className += ' correct';
      if (isSelected && !isCorrectOption) className += ' wrong';

      return `
        <label class="${className}">
          <input type="radio" name="answer" value="${index}" ${isSelected ? 'checked' : ''} disabled />
          <span>${option}</span>
        </label>
      `;
    })
    .join('');

  const statusClass = isCorrect ? 'correct' : 'wrong';
  const statusText = isCorrect ? '正解です！' : '不正解です';

  quizCardEl.innerHTML = `
    <div class="question-box">
      <h3>Q${state.currentIndex + 1}. ${currentQuestion.question}</h3>
      <div class="choice-list">${optionsHtml}</div>
      <div class="answer-status ${statusClass}">${statusText}</div>
      <div class="explanation">解説: ${currentQuestion.explanation}</div>
      <button class="next-btn" type="button" data-action="next">次の問題へ</button>
    </div>
  `;
}

function nextQuestion() {
  state.currentIndex += 1;
  if (state.currentIndex >= state.shuffledQuestions.length) {
    showResultSummary();
    return;
  }

  renderQuizState();
  renderCurrentQuestion();
}

document.getElementById('shuffleQuestionsBtn').addEventListener('click', startQuiz);
jsonFileInputEl.addEventListener('change', handleJsonFile);

quizCardEl.addEventListener('click', (event) => {
  const actionTarget = event.target.closest('[data-action]');
  if (!actionTarget) return;

  const { action } = actionTarget.dataset;
  if (action === 'check') {
    checkAnswer();
  }

  if (action === 'next') {
    nextQuestion();
  }
});

initApp();
