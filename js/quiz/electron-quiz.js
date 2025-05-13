/**
 * 電子配置クイズ（改良版）
 * 原子番号1〜20の中性原子の電子配置を学ぶためのクイズ
 */
document.addEventListener('DOMContentLoaded', function() {
  // DOM要素
  const appRoot = document.getElementById('app');
  
  // クイズのステート管理
  const quizState = {
    total: 5,         // 問題数（デフォルト）
    current: 0,       // 現在の問題番号
    correct: 0,       // 正解数
    isActive: false,  // クイズ実行中かどうか
    questions: [],    // 出題リスト
    currentAtomicNumber: 0,  // 現在の問題の原子番号
    userElectrons: [0, 0, 0, 0],  // ユーザーの回答（K, L, M, N殻）
  };
  
  // シェル名のリスト
  const shellNames = ['K殻', 'L殻', 'M殻', 'N殻'];
  
  // 原子番号1～20の正確な電子配置（明示的な定義）
  const CORRECT_ELECTRON_CONFIG = [
    /* 1.H  */ [1, 0, 0, 0],
    /* 2.He */ [2, 0, 0, 0],
    /* 3.Li */ [2, 1, 0, 0],
    /* 4.Be */ [2, 2, 0, 0],
    /* 5.B  */ [2, 3, 0, 0],
    /* 6.C  */ [2, 4, 0, 0],
    /* 7.N  */ [2, 5, 0, 0],
    /* 8.O  */ [2, 6, 0, 0],
    /* 9.F  */ [2, 7, 0, 0],
    /* 10.Ne */ [2, 8, 0, 0],
    /* 11.Na */ [2, 8, 1, 0],
    /* 12.Mg */ [2, 8, 2, 0],
    /* 13.Al */ [2, 8, 3, 0],
    /* 14.Si */ [2, 8, 4, 0],
    /* 15.P  */ [2, 8, 5, 0],
    /* 16.S  */ [2, 8, 6, 0],
    /* 17.Cl */ [2, 8, 7, 0],
    /* 18.Ar */ [2, 8, 8, 0],
    /* 19.K  */ [2, 8, 8, 1],
    /* 20.Ca */ [2, 8, 8, 2]
  ];
  
  /**
   * 原子番号に対応する正しい電子配置を取得
   */
  function getCorrectConfig(atomicNumber) {
    return CORRECT_ELECTRON_CONFIG[atomicNumber - 1];
  }
  
  /**
   * クイズの開始画面をレンダリング
   */
  function renderStartScreen() {
    appRoot.innerHTML = '';
    
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
      <div class="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-6 text-left">
        <p class="font-medium mb-1">操作方法</p>
        <p>・各殻（K, L, M, N）の数値を調整して電子配置を作ります</p>
        <p>・原子番号が表示されるのでその元素の電子配置を作ってください</p>
        <p>・準備ができたら「チェック」ボタンで採点します</p>
      </div>
    `;
    
    appRoot.appendChild(startScreen);
    
    // 問題数選択ボタンのイベントリスナー
    document.querySelectorAll('.quiz-count-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        quizState.total = parseInt(btn.dataset.count);
        startQuiz();
      });
    });
  }
  
  /**
   * クイズを開始する
   */
  function startQuiz() {
    // ステートをリセット
    quizState.current = 0;
    quizState.correct = 0;
    quizState.isActive = true;
    
    // 問題を生成
    generateQuestions();
    
    // 最初の問題を表示
    nextQuestion();
  }
  
  /**
   * 原子番号1-20からランダムに問題を生成
   */
  function generateQuestions() {
    quizState.questions = [];
    const availableElements = Array.from({length: 20}, (_, i) => i + 1); // 原子番号1-20
    
    // ランダムに問題を選択
    for (let i = 0; i < quizState.total; i++) {
      if (availableElements.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * availableElements.length);
      const element = availableElements.splice(randomIndex, 1)[0];
      quizState.questions.push(element);
    }
  }
  
  /**
   * 次の問題に進む
   */
  function nextQuestion() {
    // 全問終了したら結果表示
    if (quizState.current >= quizState.total) {
      renderResults();
      return;
    }
    
    // 問題番号を更新
    quizState.current++;
    
    // ユーザーの回答をリセット
    quizState.userElectrons = [0, 0, 0, 0];
    
    // 現在の問題の原子番号を取得
    quizState.currentAtomicNumber = quizState.questions[quizState.current - 1];
    
    // 問題画面を描画
    renderQuestionScreen();
  }
  
  /**
   * 問題画面を描画
   */
  function renderQuestionScreen() {
    appRoot.innerHTML = '';
    
    // 操作説明
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
      <div>問題: ${quizState.current}/${quizState.total}</div>
      <div>正解: ${quizState.correct}</div>
    `;
    
    // 原子情報
    const atomInfo = document.createElement('div');
    atomInfo.className = 'text-center mb-2';
    atomInfo.innerHTML = `<span class="font-medium">原子番号: ${quizState.currentAtomicNumber}</span>`;
    
    // キャンバスエリア
    const canvasArea = document.createElement('div');
    canvasArea.className = 'relative';
    
    const canvas = makeCanvas();
    
    // すべての電子数表示を確実にリセット
    quizState.userElectrons = [0, 0, 0, 0];
    
    // 電子数操作UI
    const electronControls = document.createElement('div');
    electronControls.className = 'grid grid-cols-4 gap-2 mt-4 mb-4 max-w-md mx-auto';
    
    // 状態を完全に初期化
    quizState.userElectrons = [0, 0, 0, 0]; // 重要: 確実にゼロで初期化
    
    // 各殻ごとの+/-コントロールを作成（全ての殻を有効に）
    shellNames.forEach((name, index) => {
      const shellControl = document.createElement('div');
      shellControl.className = 'bg-gray-50 rounded-lg p-2 text-center border';
      
      shellControl.innerHTML = `
        <div class="font-medium">${name}</div>
        <div class="flex items-center justify-center mt-1">
          <button class="minus-btn w-8 h-8 bg-red-100 rounded-l-md hover:bg-red-200">−</button>
          <span class="shell-count inline-block w-8 h-8 leading-8 bg-white border-t border-b">0</span>
          <button class="plus-btn w-8 h-8 bg-green-100 rounded-r-md hover:bg-green-200">＋</button>
        </div>
      `;
      
      electronControls.appendChild(shellControl);
      
      // イベントリスナーを追加（全ての殻）
      const minusBtn = shellControl.querySelector('.minus-btn');
      const plusBtn = shellControl.querySelector('.plus-btn');
      const countDisplay = shellControl.querySelector('.shell-count');
      
      minusBtn.addEventListener('click', () => {
        if (quizState.userElectrons[index] > 0) {
          quizState.userElectrons[index]--;
          countDisplay.textContent = quizState.userElectrons[index];
          drawAtom();
        }
      });
      
      plusBtn.addEventListener('click', () => {
        quizState.userElectrons[index]++;
        countDisplay.textContent = quizState.userElectrons[index];
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
    checkBtn.id = 'check-button';
    checkBtn.className = 'px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center font-medium shadow-md';
    checkBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      チェック
    `;
    
    // 原子の描画関数
    function drawAtom() {
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
      ctx.fillText(`+${quizState.currentAtomicNumber}`, centerX, centerY);
      
      // 殻の描画（点線円）
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < SHELL_RADII.length; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, SHELL_RADII[i], 0, 2*Math.PI);
        ctx.stroke();
      }
      
      // 電子の描画
      ctx.setLineDash([]);
      ctx.fillStyle = '#2563eb';
      
      for (let i = 0; i < quizState.userElectrons.length; i++) {
        const electrons = quizState.userElectrons[i];
        if (electrons <= 0) continue; // 電子がなければスキップ
        
        const radius = SHELL_RADII[i];
        
        for (let e = 0; e < electrons; e++) {
          const angle = (2 * Math.PI * e) / electrons;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2*Math.PI);
          ctx.fill();
        }
      }
    }
    
    // 電子配置をリセットする関数
    function resetElectrons() {
      quizState.userElectrons = [0, 0, 0, 0];
      electronControls.querySelectorAll('.shell-count').forEach(elem => {
        elem.textContent = '0';
      });
      drawAtom();
    }
    
    // リセットボタンのイベントリスナー（完全リセットを確保）
    resetBtn.addEventListener('click', () => {
      // 明示的に各値をゼロに設定
      quizState.userElectrons = [0, 0, 0, 0];
      
      // 全ての表示値も確実にゼロにリセット
      electronControls.querySelectorAll('.shell-count').forEach(elem => {
        elem.textContent = '0';
      });
      
      drawAtom();
    });
    
    // チェックボタンのイベントリスナー
    checkBtn.addEventListener('click', checkAnswer);
    
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
  }
  
  /**
   * 回答をチェックする
   */
  function checkAnswer() {
    if (!quizState.isActive) return;
    
    // クイズを一時停止
    quizState.isActive = false;
    
    // 正解の電子配置を取得
    const correctConfig = getCorrectConfig(quizState.currentAtomicNumber);
    
    // ユーザーの回答もディープコピー
    const userAnswer = [...quizState.userElectrons];
    
    // デバッグ情報
    console.log('問題の原子番号:', quizState.currentAtomicNumber);
    console.log('正解の電子配置:', correctConfig);
    console.log('ユーザーの回答:', userAnswer);
    console.log('DOM上の電子表示:', Array.from(document.querySelectorAll('.shell-count')).map(el => el.textContent));
    
    // 単純比較（各殻ごとに比較）
    let isCorrect = true;
    let feedback = '';
    
    for (let i = 0; i < 4; i++) {
      const correct = correctConfig[i] || 0;
      const user = userAnswer[i] || 0;
      
      if (correct !== user) {
        isCorrect = false;
        const diff = user - correct;
        
        // 原子番号14に対してN殻の判定が正しいか特に確認
        if (quizState.currentAtomicNumber === 14 && i === 3) {
          console.log('原子番号14のN殻 - 正解:', correct, 'ユーザー:', user);
        }
        
        if (diff > 0) {
          feedback += `${shellNames[i]}が${diff}個多い `;
        } else {
          feedback += `${shellNames[i]}が${Math.abs(diff)}個少ない `;
        }
      }
    }
    
    // 正解なら得点を加算
    if (isCorrect) {
      quizState.correct++;
    }
    
    // 結果を表示
    showResultModal(isCorrect, feedback);
  }
  
  /**
   * 結果モーダルを表示
   */
  function showResultModal(isCorrect, feedback) {
    const resultBox = document.createElement('div');
    resultBox.className = `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                         p-4 rounded-lg shadow-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'} 
                         border ${isCorrect ? 'border-green-500' : 'border-red-500'} z-10 w-80 max-w-[90%]`;
    
    resultBox.innerHTML = `
      <div class="text-center font-bold text-lg mb-2">
        ${isCorrect ? '正解！' : '不正解'}
      </div>
      ${!isCorrect ? `<div class="text-sm mb-3">${feedback}</div>` : ''}
      <div class="mt-4 text-center">
        <button id="next-question-btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          次の問題へ
        </button>
      </div>
    `;
    
    appRoot.appendChild(resultBox);
    
    // 次へボタンのイベントハンドラを設定
    document.getElementById('next-question-btn').addEventListener('click', () => {
      resultBox.remove();
      quizState.isActive = true; // クイズを再開
      nextQuestion();
    });
  }
  
  /**
   * 結果画面を表示
   */
  function renderResults() {
    appRoot.innerHTML = '';
    
    const resultScreen = document.createElement('div');
    resultScreen.className = 'text-center py-6 max-w-md mx-auto';
    
    resultScreen.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">結果</h2>
      <p class="text-xl mb-6">${quizState.total}問中 ${quizState.correct}問 正解！</p>
      <div class="text-lg mb-6">
        正答率: ${Math.round((quizState.correct / quizState.total) * 100)}%
      </div>
      <div class="flex justify-center">
        <button id="restart-quiz" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md">もう一度プレイ</button>
      </div>
    `;
    
    appRoot.appendChild(resultScreen);
    
    document.getElementById('restart-quiz').addEventListener('click', renderStartScreen);
  }
  
  // クイズを開始
  renderStartScreen();
});
