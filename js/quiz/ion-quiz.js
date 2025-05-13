/**
 * イオンクイズ - 模範解答リストによる判定版
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
    currentIon: null, // 現在の問題のイオン
    userElectrons: [0, 0, 0, 0],  // ユーザーの回答（K, L, M, N殻）
  };
  
  // シェル名のリスト
  const shellNames = ['K殻', 'L殻', 'M殻', 'N殻'];
  
  // イオンリスト
  const IONS = [
    { z: 3, element: "Li", charge: 1, name: "リチウムイオン" },
    { z: 9, element: "F", charge: -1, name: "フッ化物イオン" },
    { z: 11, element: "Na", charge: 1, name: "ナトリウムイオン" },
    { z: 12, element: "Mg", charge: 2, name: "マグネシウムイオン" },
    { z: 13, element: "Al", charge: 3, name: "アルミニウムイオン" },
    { z: 16, element: "S", charge: -2, name: "硫化物イオン" },
    { z: 17, element: "Cl", charge: -1, name: "塩化物イオン" },
    { z: 19, element: "K", charge: 1, name: "カリウムイオン" },
    { z: 20, element: "Ca", charge: 2, name: "カルシウムイオン" },
    { z: 8, element: "O", charge: -2, name: "酸化物イオン" }
  ];
  
  // 各イオンの正しい電子配置の明示的な定義
  const IONS_ELECTRON_CONFIG = {
    // Li+: 電子数2
    "Li/1": [2, 0, 0, 0],
    
    // F-: 電子数10
    "F/-1": [2, 8, 0, 0],
    
    // Na+: 電子数10
    "Na/1": [2, 8, 0, 0],
    
    // Mg2+: 電子数10
    "Mg/2": [2, 8, 0, 0],
    
    // Al3+: 電子数10
    "Al/3": [2, 8, 0, 0],
    
    // S2-: 電子数18
    "S/-2": [2, 8, 8, 0],
    
    // Cl-: 電子数18
    "Cl/-1": [2, 8, 8, 0],
    
    // K+: 電子数18
    "K/1": [2, 8, 8, 0],
    
    // Ca2+: 電子数18
    "Ca/2": [2, 8, 8, 0],
    
    // O2-: 電子数10
    "O/-2": [2, 8, 0, 0]
  };
  
  /**
   * 指定されたイオンの正しい電子配置を取得
   */
  function getCorrectIonConfig(ion) {
    const key = `${ion.element}/${ion.charge}`;
    return IONS_ELECTRON_CONFIG[key];
  }
  
  /**
   * クイズの開始画面をレンダリング
   */
  function renderStartScreen() {
    appRoot.innerHTML = '';
    
    const startScreen = document.createElement('div');
    startScreen.className = 'text-center py-6 max-w-md mx-auto';
    
    startScreen.innerHTML = `
      <p class="text-lg mb-8">イオン式に対応する正しい電子配置を作成してください</p>
      
      <div class="mb-8">
        <p class="mb-3 font-medium">問題数</p>
        <div class="flex justify-center gap-4">
          <button class="quiz-count-btn px-6 py-2 border rounded-lg bg-white hover:bg-blue-100 transition" data-count="3">3問</button>
          <button class="quiz-count-btn px-6 py-2 border rounded-lg bg-white hover:bg-blue-100 transition" data-count="5">5問</button>
          <button class="quiz-count-btn px-6 py-2 border rounded-lg bg-white hover:bg-blue-100 transition" data-count="10">10問</button>
        </div>
      </div>
      
      <div class="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-6">
        <p class="font-medium mb-2">操作方法</p>
        <ul class="list-disc list-inside text-left space-y-1">
          <li>各殻（K, L, M, N）の＋/−ボタンで電子数を調整</li>
          <li>表示されるイオン式（Na<sup>+</sup>など）に合わせて電子配置を作成</li>
          <li>「チェック」ボタンで正誤を判定</li>
        </ul>
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
   * イオンリストからランダムに問題を生成
   */
  function generateQuestions() {
    quizState.questions = [];
    
    // 利用可能なイオンをコピー
    const availableIons = [...IONS];
    
    // 必要な数だけランダムに選択
    for (let i = 0; i < quizState.total; i++) {
      if (availableIons.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * availableIons.length);
      const ion = availableIons.splice(randomIndex, 1)[0];
      quizState.questions.push(ion);
    }
    
    // イオン数が足りなければ、再度選択してリストを埋める
    while (quizState.questions.length < quizState.total) {
      const randomIndex = Math.floor(Math.random() * IONS.length);
      quizState.questions.push(IONS[randomIndex]);
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
    
    // 現在の問題のイオン情報を取得
    quizState.currentIon = quizState.questions[quizState.current - 1];
    
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
    
    // イオン情報表示
    const ionInfo = document.createElement('div');
    ionInfo.className = 'text-center mb-4';
    
    const chargeText = quizState.currentIon.charge > 0 ? 
      `<sup>${quizState.currentIon.charge > 1 ? quizState.currentIon.charge : ''}+</sup>` : 
      `<sup>${Math.abs(quizState.currentIon.charge) > 1 ? Math.abs(quizState.currentIon.charge) : ''}−</sup>`;
    
    ionInfo.innerHTML = `
      <div class="text-xl font-bold">${quizState.currentIon.element}${chargeText}</div>
      <div class="text-sm text-gray-600">${quizState.currentIon.name}</div>
    `;
    
    // キャンバスエリア
    const canvasArea = document.createElement('div');
    canvasArea.className = 'relative';
    
    const canvas = makeCanvas();
    
    // 電子数操作UI
    const electronControls = document.createElement('div');
    electronControls.className = 'grid grid-cols-4 gap-2 mt-4 mb-4 max-w-md mx-auto';
    
    // 各殻ごとの+/-コントロールを作成
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
      
      // イベントリスナーを追加
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
      ctx.fillText(`+${quizState.currentIon.z}`, centerX, centerY);
      
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
    
    // リセットボタンのイベントリスナー
    resetBtn.addEventListener('click', resetElectrons);
    
    // チェックボタンのイベントリスナー
    checkBtn.addEventListener('click', checkAnswer);
    
    buttonContainer.appendChild(resetBtn);
    buttonContainer.appendChild(checkBtn);
    
    // 要素を配置
    appRoot.appendChild(instructions);
    appRoot.appendChild(scoreDisplay);
    appRoot.appendChild(ionInfo);
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
    const correctConfig = getCorrectIonConfig(quizState.currentIon);
    
    // ユーザー入力と正解を明確に比較するために出力
    console.log('イオン:', quizState.currentIon.element, quizState.currentIon.charge);
    console.log('正解の配置:', correctConfig);
    console.log('ユーザーの回答:', quizState.userElectrons);
    
    // 正規化された配列で比較
    let isCorrect = true;
    let feedback = '';
    
    // 各殻の電子数を比較
    for (let i = 0; i < correctConfig.length; i++) {
      if (correctConfig[i] !== quizState.userElectrons[i]) {
        isCorrect = false;
        const diff = quizState.userElectrons[i] - correctConfig[i];
        
        // シェル名の配列の範囲をチェック
        const shellName = i < shellNames.length ? shellNames[i] : `殻${i+1}`;
        
        if (diff > 0) {
          feedback += `${shellName}が${diff}個多い `;
        } else {
          feedback += `${shellName}が${Math.abs(diff)}個少ない `;
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
      <div class="flex flex-wrap gap-4 justify-center">
        <button id="restart-quiz" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md">もう一度プレイ</button>
        <a href="index.html" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          解説に戻る
        </a>
      </div>
    `;
    
    appRoot.appendChild(resultScreen);
    
    document.getElementById('restart-quiz').addEventListener('click', renderStartScreen);
  }
  
  // クイズを開始
  renderStartScreen();
});
