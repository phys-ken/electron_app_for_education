/* ---------- Quiz Mode ---------- */
const renderQuiz = () => {
  const appRoot = document.getElementById('app');
  appRoot.innerHTML = '';
  
  // 初期設定
  let questionCount = 0;
  let correctAnswers = 0;
  let currentElement = null;
  let userConfig = [0, 0, 0, 0];
  let gameActive = false;
  let questionTotal = 5; // デフォルト

  // クイズ開始画面
  const renderStartScreen = () => {
    const startScreen = document.createElement('div');
    startScreen.className = 'text-center py-4 max-w-md mx-auto';
    
    startScreen.innerHTML = `
      <h2 class="text-xl font-bold mb-6">電子配置クイズ</h2>
      <p class="mb-4">正しい電子配置を作ってください！</p>
      <div class="mb-6">
        <p class="mb-2 font-medium">問題数を選んでください：</p>
        <div class="flex justify-center gap-4">
          <button class="quiz-count-btn px-6 py-2 border rounded-lg bg-white hover:bg-blue-100" data-count="3">3問</button>
          <button class="quiz-count-btn px-6 py-2 border rounded-lg bg-white hover:bg-blue-100" data-count="5">5問</button>
          <button class="quiz-count-btn px-6 py-2 border rounded-lg bg-white hover:bg-blue-100" data-count="10">10問</button>
        </div>
      </div>
    `;
    
    appRoot.appendChild(startScreen);
    
    // イベントリスナー - 問題数を選んだら即スタート
    document.querySelectorAll('.quiz-count-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        questionTotal = parseInt(btn.dataset.count);
        startQuiz();
      });
    });
  };

  // クイズゲーム開始
  const startQuiz = () => {
    gameActive = true;
    questionCount = 0;
    correctAnswers = 0;
    nextQuestion();
  };
  
  // 次の問題へ
  const nextQuestion = () => {
    if (questionCount >= questionTotal) {
      showResults();
      return;
    }
    
    questionCount++;
    userConfig = [0, 0, 0, 0]; // リセット
    
    // ランダムに元素を選択（1〜20）
    const randomZ = Math.floor(Math.random() * 20) + 1;
    currentElement = randomZ;
    
    renderQuestion();
  };
  
  // 問題の描画
  const renderQuestion = () => {
    appRoot.innerHTML = '';
    
    // 固定説明部分
    const instructions = document.createElement('div');
    instructions.className = 'bg-blue-50 p-3 rounded-lg mb-4 shadow-sm border border-blue-200 sticky top-0 z-10';
    instructions.innerHTML = `
      <h3 class="font-medium text-blue-800 mb-1">操作方法</h3>
      <p class="text-sm text-blue-700">各殻の＋/−ボタンで電子数を調整してください。</p>
      <p class="text-sm text-blue-700">正しい電子配置ができたら「チェック」ボタンを押してください。</p>
    `;
    
    // スコア表示
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'flex justify-between items-center mb-4 px-2';
    scoreDisplay.innerHTML = `
      <div>問題: ${questionCount}/${questionTotal}</div>
      <div>正解: ${correctAnswers}</div>
    `;
    
    const atomInfo = document.createElement('div');
    atomInfo.className = 'text-center mb-2';
    atomInfo.innerHTML = `<span class="font-medium">原子番号: ${currentElement}</span>`;
    
    // キャンバスエリア
    const canvasArea = document.createElement('div');
    canvasArea.className = 'relative';
    
    const canvas = makeCanvas();
    
    // 電子数操作UI
    const electronControls = document.createElement('div');
    electronControls.className = 'grid grid-cols-4 gap-2 mt-4 mb-4 max-w-md mx-auto';
    
    const shellNames = ['K殻', 'L殻', 'M殻', 'N殻'];
    
    // 各殻ごとの+/-コントロールを作成
    shellNames.forEach((name, index) => {
      const shellControl = document.createElement('div');
      shellControl.className = 'bg-gray-50 rounded-lg p-2 text-center border';
      
      shellControl.innerHTML = `
        <div class="font-medium">${name}</div>
        <div class="flex items-center justify-center mt-1">
          <button class="minus-btn w-8 h-8 bg-red-100 rounded-l-md hover:bg-red-200">−</button>
          <span class="shell-count inline-block w-8 h-8 leading-8 bg-white border-t border-b">${userConfig[index]}</span>
          <button class="plus-btn w-8 h-8 bg-green-100 rounded-r-md hover:bg-green-200">＋</button>
        </div>
      `;
      
      electronControls.appendChild(shellControl);
      
      // イベントリスナー
      const minusBtn = shellControl.querySelector('.minus-btn');
      const plusBtn = shellControl.querySelector('.plus-btn');
      const countDisplay = shellControl.querySelector('.shell-count');
      
      minusBtn.addEventListener('click', () => {
        if (userConfig[index] > 0) {
          userConfig[index]--;
          countDisplay.textContent = userConfig[index];
          drawAtom();
        }
      });
      
      plusBtn.addEventListener('click', () => {
        userConfig[index]++;
        countDisplay.textContent = userConfig[index];
        drawAtom();
      });
    });
    
    // ボタンコンテナ
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-center gap-4 mt-4';
    
    // リセットボタン
    const resetBtn = document.createElement('button');
    resetBtn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center';
    resetBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      リセット
    `;
    
    // チェックボタン
    const checkBtn = document.createElement('button');
    checkBtn.className = 'px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center font-medium shadow-md';
    checkBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      チェック
    `;
    
    const drawAtom = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // 原子核の描画
      ctx.beginPath();
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      ctx.arc(centerX, centerY, 20, 0, 2*Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // 原子番号表示
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`+${currentElement}`, centerX, centerY);
      
      // 殻の描画（点線円）
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < SHELL_RADII.length; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, SHELL_RADII[i], 0, 2*Math.PI);
        ctx.stroke();
      }
      
      // 電子の描画 - バグ修正
      ctx.setLineDash([]);
      ctx.fillStyle = '#2563eb';
      
      for (let i = 0; i < userConfig.length; i++) {
        const electrons = userConfig[i];
        if (electrons <= 0) continue; // 電子がない場合はスキップ
        
        const radius = SHELL_RADII[i];
        
        for (let e = 0; e < electrons; e++) {
          const angle = (2 * Math.PI * e) / electrons;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle); // 変数名のタイプミスを修正
          
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2*Math.PI);
          ctx.fill();
        }
      }
    };
    
    // 電子配置をリセットする関数
    const resetElectrons = () => {
      userConfig = [0, 0, 0, 0];
      electronControls.querySelectorAll('.shell-count').forEach(elem => {
        elem.textContent = '0';
      });
      drawAtom();
    };
    
    // リセットボタンのイベントリスナー
    resetBtn.addEventListener('click', resetElectrons);
    
    // チェックボタンクリック時の動作
    checkBtn.addEventListener('click', () => {
      if (!gameActive) return;
      gameActive = false;
      
      const correctConfig = configForZ(currentElement);
      let isCorrect = true;
      let feedback = '';
      
      // 各殻の過不足をチェック
      for (let i = 0; i < correctConfig.length; i++) {
        const diff = userConfig[i] - correctConfig[i];
        if (diff !== 0) {
          isCorrect = false;
          feedback += `${shellNames[i]}が${Math.abs(diff)}個${diff > 0 ? '多い' : '少ない'} `;
        }
      }
      
      const resultBox = document.createElement('div');
      resultBox.className = `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                            p-4 rounded-lg shadow-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'} 
                            border ${isCorrect ? 'border-green-500' : 'border-red-500'} z-10`;
      
      resultBox.innerHTML = `
        <div class="text-center font-bold text-lg mb-2">
          ${isCorrect ? '正解！' : '不正解'}
        </div>
        ${!isCorrect ? `<div class="text-sm">${feedback}</div>` : ''}
      `;
      
      appRoot.appendChild(resultBox);
      
      if (isCorrect) correctAnswers++;
      
      // 1.2秒後に次の問題へ
      setTimeout(() => {
        resultBox.remove();
        nextQuestion();
      }, 1200);
    });
    
    buttonContainer.appendChild(resetBtn);
    buttonContainer.appendChild(checkBtn);
    
    // 要素を配置
    appRoot.appendChild(instructions);
    appRoot.appendChild(scoreDisplay);
    appRoot.appendChild(atomInfo);
    canvasArea.appendChild(canvas);
    appRoot.appendChild(canvasArea);
    appRoot.appendChild(electronControls);
    appRoot.appendChild(buttonContainer);
    
    // 初期描画
    drawAtom();
  };
  
  // 結果表示
  const showResults = () => {
    appRoot.innerHTML = '';
    
    const resultScreen = document.createElement('div');
    resultScreen.className = 'text-center py-6';
    
    resultScreen.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">結果</h2>
      <p class="text-xl mb-6">${questionTotal}問中 ${correctAnswers}問 正解！</p>
      <div class="text-lg mb-6">
        正答率: ${Math.round((correctAnswers / questionTotal) * 100)}%
      </div>
      <button id="restart-quiz" class="app-btn mx-auto">もう一度</button>
    `;
    
    appRoot.appendChild(resultScreen);
    
    document.getElementById('restart-quiz').addEventListener('click', renderStartScreen);
  };
  
  // 最初に開始画面を表示
  renderStartScreen();
};
