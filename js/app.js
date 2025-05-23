(function() {
  const appRoot = document.getElementById('app');

  // メインモードマッピング
  const modes = {
    explain: renderExplain,
    quiz: renderQuiz,
    ion: renderIon,
    ionquiz: renderIonQuiz
  };
  
  // モード切替関数
  const switchMode = m => {
    (modes[m] || renderExplain)();
  };
  
  // モードボタンにイベントリスナーを設定
  document.querySelectorAll('.mode-btn').forEach(b => 
    b.addEventListener('click', () => switchMode(b.dataset.mode))
  );
  
  // 初期化時に解説モードを表示
  switchMode('explain');
})();
