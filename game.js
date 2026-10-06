/**
 * game.js - Core Game Logic & State Management
 * ទាញព្រ័ត្រ គណិតវិទ្យា (Tug of War Mathematics)
 * Pure Vanilla JavaScript
 */

(function () {
  'use strict';

  // =========================================================================
  // BILINGUAL TRANSLATIONS (Khmer & English)
  // =========================================================================
  const i18n = {
    km: {
      title: 'ទាញព្រ័ត្រ គណិតវិទ្យា',
      subtitle: 'ល្បែងប្រកួតប្រជែងគណិតវិទ្យាជាក្រុម',
      home: 'ដើម',
      settings: 'ការកំណត់',
      sound: 'សំឡេង',
      soundMuted: 'បិទសំឡេង',
      fullscreen: 'ពេញអេក្រង់',
      exitFullscreen: 'ចាកចេញ',
      team1: 'ក្រុមទី ១',
      team2: 'ក្រុមទី ២',
      schoolName: 'សាលាបឋមសិក្សា ស្រែរាជ',
      authorName: 'បង្កើតដោយ៖ លោកគ្រូ ឌឹម សារ៉ា',
      settingsTitle: 'ការកំណត់ល្បែង',
      operationLabel: 'ប្រមាណវិធីគណិតវិទ្យា',
      opMixed: 'ចម្រុះ (+, -, ×, ÷)',
      opAdd: 'បូក (+)',
      opSub: 'ដក (-)',
      opMul: 'គុណ (×)',
      opDiv: 'ចែក (÷)',
      digitsLabel1: 'ចំនួនខ្ទង់សម្រាប់តួលេខទី ១',
      digitsLabel2: 'ចំនួនខ្ទង់សម្រាប់តួលេខទី ២',
      digit1: '១ ខ្ទង់',
      digit2: '២ ខ្ទង់',
      digit3: '៣ ខ្ទង់',
      modeLabel: 'របៀបលេង',
      modeTimer: '១. កំណត់ពេល (Timer)',
      modeTarget: '២. ទាញដាច់ខ្សែ (Target)',
      durationLabel: 'រយៈពេលលេង',
      customTime: 'ឬកំណត់ផ្ទាល់៖',
      min: 'នាទី',
      sec: 'វិនាទី',
      targetPullsLabel: 'ចំនួនដងទាញដើម្បីឈ្នះ',
      cancel: 'បោះបង់',
      save: 'រក្សាទុក',
      congrats: 'អបអរសាទរ!',
      team1Wins: 'ក្រុមទី ១ ទទួលបានជ័យជម្នះ! 🎉',
      team2Wins: 'ក្រុមទី ២ ទទួលបានជ័យជម្នះ! 🎉',
      drawGame: 'លទ្ធផលស្មើគ្នា! 🤝',
      playAgain: '🔄 លេងម្តងទៀត'
    },
    en: {
      title: 'Tug of War Mathematics',
      subtitle: 'Team Math Battle Competition',
      home: 'Home',
      settings: 'Settings',
      sound: 'Sound',
      soundMuted: 'Muted',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit Full',
      team1: 'Team 1',
      team2: 'Team 2',
      schoolName: 'Sre Reach Primary School',
      authorName: 'Created by: Teacher Dim Sara',
      settingsTitle: 'Game Settings',
      operationLabel: 'Math Operations',
      opMixed: 'Mixed (+, -, ×, ÷)',
      opAdd: 'Addition (+)',
      opSub: 'Subtraction (-)',
      opMul: 'Multiplication (×)',
      opDiv: 'Division (÷)',
      digitsLabel1: 'Digits for 1st Number',
      digitsLabel2: 'Digits for 2nd Number',
      digit1: '1 Digit',
      digit2: '2 Digits',
      digit3: '3 Digits',
      modeLabel: 'Game Mode',
      modeTimer: '1. Timer Mode',
      modeTarget: '2. Tug Out (Target)',
      durationLabel: 'Round Duration',
      customTime: 'Or Custom Time:',
      min: 'min',
      sec: 'sec',
      targetPullsLabel: 'Target Pulls to Win',
      cancel: 'Cancel',
      save: 'Save & Apply',
      congrats: 'Congratulations!',
      team1Wins: 'Team 1 is Victorious! 🎉',
      team2Wins: 'Team 2 is Victorious! 🎉',
      drawGame: "It's a Draw! 🤝",
      playAgain: '🔄 Play Again'
    }
  };

  // =========================================================================
  // GAME CONFIGURATION & STATE
  // =========================================================================
  const state = {
    lang: localStorage.getItem('tug_math_lang') || 'km',
    settings: {
      operation: 'mixed', // mixed, add, sub, mul, div
      digits1: 1, // 1, 2, 3
      digits2: 1, // 1, 2, 3
      mode: 'timer', // timer or target
      durationSec: 49, // seconds
      targetPulls: 5 // pulls advantage to win in target mode
    },
    timerInterval: null,
    timeRemaining: 49,
    isGameOver: false,
    ropePosition: 0, // -targetPulls to +targetPulls (negative = Team 1 advantage, positive = Team 2 advantage)
    team1: {
      score: 0,
      input: '',
      currentQuestion: null
    },
    team2: {
      score: 0,
      input: '',
      currentQuestion: null
    }
  };

  // Load saved settings if any
  try {
    const saved = localStorage.getItem('tug_math_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      state.settings = { ...state.settings, ...parsed };
      state.timeRemaining = state.settings.durationSec;
    }
  } catch (e) {
    console.warn('Could not parse saved settings', e);
  }

  // =========================================================================
  // DOM REFERENCES
  // =========================================================================
  const dom = {
    // Buttons in header
    btnHome: document.getElementById('btn-home'),
    btnSettings: document.getElementById('btn-settings'),
    btnSound: document.getElementById('btn-sound'),
    soundIcon: document.getElementById('sound-icon'),
    soundText: document.getElementById('sound-text'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    fsIcon: document.getElementById('fs-icon'),
    fsText: document.getElementById('fs-text'),
    langBtns: document.querySelectorAll('.lang-btn'),

    // Arena elements
    timerCapsule: document.getElementById('timer-capsule'),
    timerVal: document.getElementById('timer-val'),
    arenaScore1: document.getElementById('arena-score-1'),
    arenaScore2: document.getElementById('arena-score-2'),
    team1BadgeScore: document.getElementById('team1-badge-score'),
    team2BadgeScore: document.getElementById('team2-badge-score'),
    ropeAndTeams: document.getElementById('rope-and-teams'),
    gaugeThumb: document.getElementById('gauge-thumb'),

    // Team 1 elements
    team1QBox: document.getElementById('team1-q-box'),
    team1Question: document.getElementById('team1-question'),
    team1InputDisplay: document.getElementById('team1-input-display'),

    // Team 2 elements
    team2QBox: document.getElementById('team2-q-box'),
    team2Question: document.getElementById('team2-question'),
    team2InputDisplay: document.getElementById('team2-input-display'),

    // Settings Modal elements
    settingsModal: document.getElementById('settings-modal'),
    btnCloseSettings: document.getElementById('btn-close-settings'),
    btnCancelSettings: document.getElementById('btn-cancel-settings'),
    btnSaveSettings: document.getElementById('btn-save-settings'),
    opChips: document.querySelectorAll('#op-options .option-chip'),
    digits1Chips: document.querySelectorAll('#digits1-options .option-chip'),
    digits2Chips: document.querySelectorAll('#digits2-options .option-chip'),
    modeChips: document.querySelectorAll('#mode-options .option-chip'),
    timerSettingsGroup: document.getElementById('timer-settings-group'),
    targetSettingsGroup: document.getElementById('target-settings-group'),
    durationChips: document.querySelectorAll('#duration-presets .option-chip'),
    customMinInput: document.getElementById('custom-min'),
    customSecInput: document.getElementById('custom-sec'),
    targetChips: document.querySelectorAll('#target-options .option-chip'),

    // Winner Modal elements
    winnerModal: document.getElementById('winner-modal'),
    btnCloseWinner: document.getElementById('btn-close-winner'),
    winnerTeamDisplay: document.getElementById('winner-team-display'),
    winnerSummary1: document.getElementById('winner-summary-1'),
    winnerSummary2: document.getElementById('winner-summary-2'),
    btnPlayAgain: document.getElementById('btn-play-again')
  };

  // =========================================================================
  // LOCALIZATION SYSTEM
  // =========================================================================
  function setLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('tug_math_lang', lang);

    // Update active class on header lang buttons
    dom.langBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const dict = i18n[lang] || i18n.km;

    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Update dynamic Sound button text
    if (window.soundEngine && window.soundEngine.isMuted()) {
      dom.soundText.textContent = dict.soundMuted;
    } else {
      dom.soundText.textContent = dict.sound;
    }
  }

  // =========================================================================
  // MATH QUESTION GENERATOR
  // =========================================================================
  function getRandomInRange(digits) {
    if (digits === 1) {
      // 1 to 9 (or 1 to 10)
      return Math.floor(Math.random() * 9) + 1;
    } else if (digits === 2) {
      // 10 to 99
      return Math.floor(Math.random() * 90) + 10;
    } else {
      // 100 to 999
      return Math.floor(Math.random() * 900) + 100;
    }
  }

  function generateMathProblem() {
    let op = state.settings.operation;
    if (op === 'mixed') {
      const ops = ['add', 'sub', 'mul', 'div'];
      op = ops[Math.floor(Math.random() * ops.length)];
    }

    let num1, num2, answer, symbol;

    switch (op) {
      case 'add': {
        symbol = '+';
        num1 = getRandomInRange(state.settings.digits1);
        num2 = getRandomInRange(state.settings.digits2);
        answer = num1 + num2;
        break;
      }
      case 'sub': {
        symbol = '-';
        const a = getRandomInRange(state.settings.digits1);
        const b = getRandomInRange(state.settings.digits2);
        // Ensure non-negative answer (num1 >= num2)
        if (a >= b) {
          num1 = a;
          num2 = b;
        } else {
          num1 = b;
          num2 = a;
        }
        answer = num1 - num2;
        break;
      }
      case 'mul': {
        symbol = '×';
        num1 = getRandomInRange(state.settings.digits1);
        num2 = getRandomInRange(state.settings.digits2);
        answer = num1 * num2;
        break;
      }
      case 'div': {
        symbol = '÷';
        // Guaranteed clean integer division without remainder
        // Divisor (num2) matches digits2
        num2 = getRandomInRange(state.settings.digits2);
        // Avoid division by 1 for 1-digit mode if possible for better challenge
        if (num2 === 1 && state.settings.digits2 === 1) num2 = Math.floor(Math.random() * 8) + 2;

        // Quotient matches digits1
        const quotient = getRandomInRange(state.settings.digits1);
        num1 = num2 * quotient;
        answer = quotient;
        break;
      }
      default: {
        symbol = '+';
        num1 = getRandomInRange(1);
        num2 = getRandomInRange(1);
        answer = num1 + num2;
      }
    }

    return {
      text: `${num1} ${symbol} ${num2} = ?`,
      answer: answer
    };
  }

  // =========================================================================
  // INPUT & QUESTION REFRESH
  // =========================================================================
  function refreshQuestion(team) {
    const problem = generateMathProblem();
    if (team === 1) {
      state.team1.currentQuestion = problem;
      state.team1.input = '';
      dom.team1Question.textContent = problem.text;
      renderInput(1);
    } else {
      state.team2.currentQuestion = problem;
      state.team2.input = '';
      dom.team2Question.textContent = problem.text;
      renderInput(2);
    }
  }

  function renderInput(team) {
    if (team === 1) {
      if (state.team1.input === '') {
        dom.team1InputDisplay.innerHTML = '<span class="input-placeholder">0</span>';
        dom.team1InputDisplay.classList.remove('active-glow-1');
      } else {
        dom.team1InputDisplay.textContent = state.team1.input;
        dom.team1InputDisplay.classList.add('active-glow-1');
      }
    } else {
      if (state.team2.input === '') {
        dom.team2InputDisplay.innerHTML = '<span class="input-placeholder">0</span>';
        dom.team2InputDisplay.classList.remove('active-glow-2');
      } else {
        dom.team2InputDisplay.textContent = state.team2.input;
        dom.team2InputDisplay.classList.add('active-glow-2');
      }
    }
  }

  function handleKeypadInput(team, val) {
    if (state.isGameOver) return;
    if (window.soundEngine) window.soundEngine.playClick();

    const teamState = team === 1 ? state.team1 : state.team2;

    // Limit input length to 6 characters max
    if (teamState.input.length < 6) {
      // Prevent multiple leading zeroes
      if (teamState.input === '0') {
        teamState.input = val.toString();
      } else {
        teamState.input += val.toString();
      }
      renderInput(team);
    }
  }

  function handleClear(team) {
    if (state.isGameOver) return;
    if (window.soundEngine) window.soundEngine.playClick();
    const teamState = team === 1 ? state.team1 : state.team2;
    teamState.input = '';
    renderInput(team);
  }

  function handleSubmit(team) {
    if (state.isGameOver) return;
    const teamState = team === 1 ? state.team1 : state.team2;
    const inputDisplay = team === 1 ? dom.team1InputDisplay : dom.team2InputDisplay;
    const qBox = team === 1 ? dom.team1QBox : dom.team2QBox;

    if (teamState.input === '') return;

    const userAns = parseInt(teamState.input, 10);
    const correctAns = teamState.currentQuestion.answer;

    if (userAns === correctAns) {
      // CORRECT ANSWER!
      if (window.soundEngine) {
        window.soundEngine.playCorrect();
        setTimeout(() => window.soundEngine.playPull(), 120);
      }

      // Visual feedback
      inputDisplay.classList.add('pulse-success');
      setTimeout(() => inputDisplay.classList.remove('pulse-success'), 400);

      // Increase Score
      teamState.score += 1;
      updateScoreboard();

      // Pull the rope towards this team!
      pullRope(team);

      // Next Question
      setTimeout(() => {
        refreshQuestion(team);
      }, 150);

    } else {
      // WRONG ANSWER
      if (window.soundEngine) window.soundEngine.playWrong();

      // Shake animation
      inputDisplay.classList.add('shake-animation');
      setTimeout(() => {
        inputDisplay.classList.remove('shake-animation');
        teamState.input = '';
        renderInput(team);
      }, 400);
    }
  }

  // =========================================================================
  // ROPE PHYSICS & PULL ANIMATION
  // =========================================================================
  function pullRope(team) {
    const maxPulls = state.settings.targetPulls;

    // Team 1 pulls Left (-), Team 2 pulls Right (+)
    if (team === 1) {
      state.ropePosition = Math.max(-maxPulls, state.ropePosition - 1);
      triggerPullAnimation('left');
    } else {
      state.ropePosition = Math.min(maxPulls, state.ropePosition + 1);
      triggerPullAnimation('right');
    }

    updateRopeVisual();

    // Check Win Condition for Target Mode or if Rope reaches border
    if (state.settings.mode === 'target') {
      if (state.ropePosition <= -maxPulls) {
        endGame(1);
      } else if (state.ropePosition >= maxPulls) {
        endGame(2);
      }
    }
  }

  function triggerPullAnimation(direction) {
    dom.ropeAndTeams.classList.remove('idle-struggle', 'pulling-left', 'pulling-right');

    const animClass = direction === 'left' ? 'pulling-left' : 'pulling-right';
    dom.ropeAndTeams.classList.add(animClass);

    setTimeout(() => {
      dom.ropeAndTeams.classList.remove(animClass);
      if (!state.isGameOver) {
        dom.ropeAndTeams.classList.add('idle-struggle');
      }
    }, 450);
  }

  function updateRopeVisual() {
    const maxPulls = state.settings.targetPulls;
    // Each pull step moves SVG group by ~28px horizontally
    const pxShift = state.ropePosition * 28;
    dom.ropeAndTeams.style.transform = `translateX(${pxShift}px)`;

    // Update bottom gauge thumb
    // Position maps from 50% down to 8% (Team 1) or up to 92% (Team 2)
    const ratio = state.ropePosition / maxPulls; // -1 to +1
    const thumbPercent = 50 + ratio * 42;
    dom.gaugeThumb.style.left = `${thumbPercent}%`;
  }

  function updateScoreboard() {
    dom.arenaScore1.textContent = state.team1.score;
    dom.arenaScore2.textContent = state.team2.score;
    dom.team1BadgeScore.textContent = state.team1.score;
    dom.team2BadgeScore.textContent = state.team2.score;
  }

  // =========================================================================
  // TIMER & GAME LIFECYCLE
  // =========================================================================
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const mm = m < 10 ? '0' + m : m;
    const ss = s < 10 ? '0' + s : s;
    return `${mm}:${ss}`;
  }

  function startTimer() {
    clearInterval(state.timerInterval);
    state.timeRemaining = state.settings.durationSec;
    dom.timerVal.textContent = formatTime(state.timeRemaining);
    dom.timerCapsule.classList.remove('timer-warning');

    if (state.settings.mode === 'target') {
      dom.timerVal.textContent = '∞';
      return;
    }

    state.timerInterval = setInterval(() => {
      if (state.isGameOver) {
        clearInterval(state.timerInterval);
        return;
      }

      state.timeRemaining--;
      dom.timerVal.textContent = formatTime(state.timeRemaining);

      if (state.timeRemaining <= 10 && state.timeRemaining > 0) {
        dom.timerCapsule.classList.add('timer-warning');
      }

      if (state.timeRemaining <= 0) {
        clearInterval(state.timerInterval);
        handleTimerExpiry();
      }
    }, 1000);
  }

  function handleTimerExpiry() {
    // Determine winner based on rope position or higher score
    if (state.ropePosition < 0) {
      endGame(1);
    } else if (state.ropePosition > 0) {
      endGame(2);
    } else {
      // Tied rope, check score
      if (state.team1.score > state.team2.score) {
        endGame(1);
      } else if (state.team2.score > state.team1.score) {
        endGame(2);
      } else {
        endGame(0); // Draw
      }
    }
  }

  function endGame(winner) {
    state.isGameOver = true;
    clearInterval(state.timerInterval);
    dom.ropeAndTeams.classList.remove('idle-struggle');

    const dict = i18n[state.lang] || i18n.km;

    if (winner === 1) {
      dom.winnerTeamDisplay.textContent = dict.team1Wins;
      dom.winnerTeamDisplay.className = 'winner-team-name winner-team-1';
    } else if (winner === 2) {
      dom.winnerTeamDisplay.textContent = dict.team2Wins;
      dom.winnerTeamDisplay.className = 'winner-team-name winner-team-2';
    } else {
      dom.winnerTeamDisplay.textContent = dict.drawGame;
      dom.winnerTeamDisplay.className = 'winner-team-name';
    }

    dom.winnerSummary1.textContent = state.team1.score;
    dom.winnerSummary2.textContent = state.team2.score;

    // Victory fanfare & Confetti explosion
    if (window.soundEngine) window.soundEngine.playVictory();
    if (window.confettiEngine) window.confettiEngine.burst(160);

    dom.winnerModal.classList.add('active');
  }

  function resetGame() {
    state.isGameOver = false;
    state.team1.score = 0;
    state.team2.score = 0;
    state.ropePosition = 0;

    updateScoreboard();
    updateRopeVisual();
    dom.ropeAndTeams.classList.add('idle-struggle');

    refreshQuestion(1);
    refreshQuestion(2);

    startTimer();

    dom.winnerModal.classList.remove('active');
    if (window.confettiEngine) window.confettiEngine.stop();
  }

  // =========================================================================
  // HARDWARE KEYBOARD LISTENERS
  // =========================================================================
  window.addEventListener('keydown', (e) => {
    if (state.isGameOver) return;

    // Don't intercept if an input field inside modal is focused
    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
      return;
    }

    // 1. PHYSICAL NUMPAD (Assigned to Team 2)
    if (e.code.startsWith('Numpad')) {
      if (e.code >= 'Numpad0' && e.code <= 'Numpad9') {
        e.preventDefault();
        const digit = e.code.replace('Numpad', '');
        handleKeypadInput(2, digit);
        return;
      }
      if (e.code === 'NumpadEnter') {
        e.preventDefault();
        handleSubmit(2);
        return;
      }
      if (e.code === 'NumpadDecimal') {
        e.preventDefault();
        handleClear(2);
        return;
      }
    }

    // 2. STANDARD DIGIT KEYS (1-9, 0)
    if (e.code.startsWith('Digit')) {
      const digit = e.code.replace('Digit', '');
      // Route top-row keys to Team 1
      handleKeypadInput(1, digit);
      return;
    }

    // Enter Key on main keyboard -> Submit Team 1
    if (e.code === 'Enter') {
      e.preventDefault();
      handleSubmit(1);
      return;
    }

    // Backspace on main keyboard -> Clear Team 1
    if (e.code === 'Backspace' || e.code === 'Delete') {
      handleClear(1);
      return;
    }
  });

  // =========================================================================
  // MODAL & SETTINGS LOGIC
  // =========================================================================
  function openSettings() {
    if (window.soundEngine) window.soundEngine.playClick();
    
    // Sync current settings to Modal UI
    // Operation
    dom.opChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.op === state.settings.operation);
    });

    // Digits
    dom.digits1Chips.forEach(chip => {
      chip.classList.toggle('active', parseInt(chip.dataset.digits) === state.settings.digits1);
    });
    dom.digits2Chips.forEach(chip => {
      chip.classList.toggle('active', parseInt(chip.dataset.digits) === state.settings.digits2);
    });

    // Mode
    dom.modeChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.mode === state.settings.mode);
    });
    toggleModeGroups(state.settings.mode);

    // Duration chips
    dom.durationChips.forEach(chip => {
      chip.classList.toggle('active', parseInt(chip.dataset.sec) === state.settings.durationSec);
    });

    // Custom time inputs
    dom.customMinInput.value = Math.floor(state.settings.durationSec / 60);
    dom.customSecInput.value = state.settings.durationSec % 60;

    // Target pulls
    dom.targetChips.forEach(chip => {
      chip.classList.toggle('active', parseInt(chip.dataset.target) === state.settings.targetPulls);
    });

    dom.settingsModal.classList.add('active');
  }

  function closeSettings() {
    if (window.soundEngine) window.soundEngine.playClick();
    dom.settingsModal.classList.remove('active');
  }

  function toggleModeGroups(mode) {
    if (mode === 'timer') {
      dom.timerSettingsGroup.style.display = 'block';
      dom.targetSettingsGroup.style.display = 'none';
    } else {
      dom.timerSettingsGroup.style.display = 'none';
      dom.targetSettingsGroup.style.display = 'block';
    }
  }

  function saveSettings() {
    if (window.soundEngine) window.soundEngine.playClick();

    // Read selected operation
    const activeOp = document.querySelector('#op-options .option-chip.active');
    if (activeOp) state.settings.operation = activeOp.dataset.op;

    // Read digits
    const activeDig1 = document.querySelector('#digits1-options .option-chip.active');
    if (activeDig1) state.settings.digits1 = parseInt(activeDig1.dataset.digits);

    const activeDig2 = document.querySelector('#digits2-options .option-chip.active');
    if (activeDig2) state.settings.digits2 = parseInt(activeDig2.dataset.digits);

    // Read mode
    const activeMode = document.querySelector('#mode-options .option-chip.active');
    if (activeMode) state.settings.mode = activeMode.dataset.mode;

    // Read duration
    const minVal = parseInt(dom.customMinInput.value) || 0;
    const secVal = parseInt(dom.customSecInput.value) || 0;
    const totalCustom = minVal * 60 + secVal;
    if (totalCustom > 5) {
      state.settings.durationSec = totalCustom;
    }

    // Read target pulls
    const activeTarget = document.querySelector('#target-options .option-chip.active');
    if (activeTarget) state.settings.targetPulls = parseInt(activeTarget.dataset.target);

    // Save to localStorage
    localStorage.setItem('tug_math_settings', JSON.stringify(state.settings));

    closeSettings();
    resetGame();
  }

  // =========================================================================
  // EVENT LISTENERS INITIALIZATION
  // =========================================================================
  function initEventListeners() {
    // Header Buttons
    dom.btnHome.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      resetGame();
    });

    dom.btnSettings.addEventListener('click', openSettings);
    dom.btnCloseSettings.addEventListener('click', closeSettings);
    dom.btnCancelSettings.addEventListener('click', closeSettings);
    dom.btnSaveSettings.addEventListener('click', saveSettings);

    dom.btnCloseWinner.addEventListener('click', () => {
      dom.winnerModal.classList.remove('active');
      if (window.confettiEngine) window.confettiEngine.stop();
    });
    dom.btnPlayAgain.addEventListener('click', resetGame);

    // Sound Toggle
    dom.btnSound.addEventListener('click', () => {
      if (window.soundEngine) {
        const isMuted = window.soundEngine.toggleMute();
        dom.soundIcon.textContent = isMuted ? '🔇' : '🔊';
        const dict = i18n[state.lang] || i18n.km;
        dom.soundText.textContent = isMuted ? dict.soundMuted : dict.sound;
      }
    });

    // Fullscreen Toggle
    dom.btnFullscreen.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          dom.fsIcon.textContent = '🗗';
          const dict = i18n[state.lang] || i18n.km;
          dom.fsText.textContent = dict.exitFullscreen;
        }).catch(err => console.warn(err));
      } else {
        document.exitFullscreen().then(() => {
          dom.fsIcon.textContent = '⛶';
          const dict = i18n[state.lang] || i18n.km;
          dom.fsText.textContent = dict.fullscreen;
        }).catch(err => console.warn(err));
      }
    });

    // Language switcher
    dom.langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        setLanguage(btn.dataset.lang);
      });
    });

    // Team Numpad Button Clicks
    document.querySelectorAll('.pad-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const team = parseInt(btn.dataset.team, 10);
        const action = btn.dataset.action;
        const val = btn.dataset.val;

        if (action === 'clear') {
          handleClear(team);
        } else if (action === 'submit') {
          handleSubmit(team);
        } else if (val !== undefined) {
          handleKeypadInput(team, val);
        }
      });
    });

    // Settings Option Chips
    dom.opChips.forEach(chip => {
      chip.addEventListener('click', () => {
        dom.opChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    dom.digits1Chips.forEach(chip => {
      chip.addEventListener('click', () => {
        dom.digits1Chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    dom.digits2Chips.forEach(chip => {
      chip.addEventListener('click', () => {
        dom.digits2Chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    dom.modeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        dom.modeChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        toggleModeGroups(chip.dataset.mode);
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    dom.durationChips.forEach(chip => {
      chip.addEventListener('click', () => {
        dom.durationChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const sec = parseInt(chip.dataset.sec, 10);
        dom.customMinInput.value = Math.floor(sec / 60);
        dom.customSecInput.value = sec % 60;
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    dom.targetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        dom.targetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });
  }

  // =========================================================================
  // BOOTSTRAP
  // =========================================================================
  function init() {
    setLanguage(state.lang);
    initEventListeners();

    // Check mute status
    if (window.soundEngine && window.soundEngine.isMuted()) {
      dom.soundIcon.textContent = '🔇';
      const dict = i18n[state.lang] || i18n.km;
      dom.soundText.textContent = dict.soundMuted;
    }

    resetGame();
  }

  // Run on DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
