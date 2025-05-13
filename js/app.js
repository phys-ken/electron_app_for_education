(function() {
  const appRoot = document.getElementById('app');

  /* ---------- Placeholder Modes ---------- */
  const renderPlace = msg => () => appRoot.innerHTML = `<p class='text-center'>${msg}</p>`;
  
  const modes = {
    explain: renderExplain,
    quiz: renderPlace('電子配置クイズ：近日実装'),
    ion: renderPlace('イオン解説：近日実装'),
    ionquiz: renderPlace('イオンクイズ：近日実装')
  };
  
  const switchMode = m => {
    (modes[m] || renderExplain)();
  };
  
  document.querySelectorAll('.mode-btn').forEach(b => 
    b.addEventListener('click', () => switchMode(b.dataset.mode))
  );
  
  // 初期化時に解説モードを表示
  switchMode('explain');
})();
