/* ---------- Main Application for Index Page ---------- */
(function() {
  const appRoot = document.getElementById('app');

  // メインモードマッピング（解説モードのみ）
  const modes = {
    explain: renderExplain,
    ion: renderIon
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
