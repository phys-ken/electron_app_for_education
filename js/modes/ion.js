/* ---------- Ion Explain Mode ---------- */
const renderIon = () => {
  const appRoot = document.getElementById('app');
  appRoot.innerHTML = '';
  let z = 1;
  let charge = 0; // イオンの電荷
  
  // 選択不可能な元素のリスト (C, Si, N, P)
  const disabledElements = [6, 14, 7, 15];
  
  // 周期表の作成
  const pt = document.createElement('div');
  pt.className = 'periodic-table bg-amber-50 p-2 border mb-4 shadow-inner';
  
  const map = {
    1:[0,0], 2:[7,0],
    3:[0,1], 4:[1,1], 5:[2,1], 6:[3,1], 7:[4,1], 8:[5,1], 9:[6,1], 10:[7,1],
    11:[0,2], 12:[1,2], 13:[2,2], 14:[3,2], 15:[4,2], 16:[5,2], 17:[6,2], 18:[7,2],
    19:[0,3], 20:[1,3]
  };
  
  const gridArea = {};
  Object.entries(map).forEach(([Z, [col, row]]) => {
    gridArea[`${row}-${col}`] = parseInt(Z);
  });
  
  // 周期表のセル作成
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement('div');
      cell.className = 'pt-cell';
      const key = `${r}-${c}`;
      
      if (gridArea[key]) {
        const el = ELEMENTS[gridArea[key]-1];
        cell.textContent = el[1];
        cell.dataset.z = gridArea[key];
        
        // C, Si, N, P (6, 14, 7, 15) は選択できないようにする
        if (disabledElements.includes(parseInt(gridArea[key]))) {
          cell.classList.add('opacity-50', 'cursor-not-allowed');
          cell.title = "このアプリではイオン化できません";
        } else {
          cell.onclick = () => {
            z = gridArea[key];
            charge = 0; // 元素を変更したら電荷をリセット
            updateAtomDisplay();
            highlight(pt, z);
          };
        }
      } else {
        cell.classList.add('bg-transparent', 'border-0');
      }
      
      pt.appendChild(cell);
    }
  }
  
  // 電子操作UI
  const ionControls = document.createElement('div');
  ionControls.className = 'flex justify-center items-center gap-2 mt-2 mb-4';
  
  const eMinusBtn = document.createElement('button');
  eMinusBtn.textContent = '- 電子';
  eMinusBtn.className = 'px-3 py-1 border rounded bg-blue-200 hover:bg-blue-300';
  
  const ionSymbolDisplay = document.createElement('div');
  ionSymbolDisplay.className = 'w-24 text-center font-bold text-lg';
  
  const ePlusBtn = document.createElement('button');
  ePlusBtn.textContent = '+ 電子';
  ePlusBtn.className = 'px-3 py-1 border rounded bg-blue-200 hover:bg-blue-300';
  
  eMinusBtn.onclick = () => {
    // 電子を減らす（電荷を増やす）- 電子数0の下限を設定
    const electronCount = z - charge - 1; // 電子削除後の数
    if (electronCount >= 0) {
      charge++;
      updateAtomDisplay();
    } else {
      // 電子数が0未満になる場合の表示
      const limitMsg = document.createElement('div');
      limitMsg.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-3 bg-red-100 rounded shadow-lg border border-red-300 z-10';
      limitMsg.textContent = '電子数は0個以上にしてください';
      appRoot.appendChild(limitMsg);
      setTimeout(() => limitMsg.remove(), 1000);
    }
  };
  
  ePlusBtn.onclick = () => {
    // 電子を増やす（電荷を減らす）- 合計20個以上配置できないよう制限
    const electronCount = z - charge; // 現在の電子数
    if (electronCount < 20) { // 20個が上限（21個ではない）
      charge--;
      updateAtomDisplay();
    } else {
      // 電子数上限に達した場合の表示
      const limitMsg = document.createElement('div');
      limitMsg.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-3 bg-red-100 rounded shadow-lg border border-red-300 z-10';
      limitMsg.textContent = '電子は20個までです';
      appRoot.appendChild(limitMsg);
      setTimeout(() => limitMsg.remove(), 1000);
    }
  };
  
  ionControls.append(eMinusBtn, ionSymbolDisplay, ePlusBtn);
  
  // 殻情報表示
  const shellInfo = document.createElement('div');
  shellInfo.id = 'shell-info';
  shellInfo.className = 'text-center my-2 text-sm';
  
  // 希ガス型表示
  const nobleGasInfo = document.createElement('div');
  nobleGasInfo.id = 'noble-gas-info';
  nobleGasInfo.className = 'text-center mt-2 mb-4 text-blue-600 font-semibold';
  
  // キャンバス
  const canvas = makeCanvas();
  
  // 表示を更新する関数
  const updateAtomDisplay = () => {
    // 電子数 = 原子番号 - 電荷
    const electronCount = z - charge;
    
    // 元素を取得
    const el = ELEMENTS.find(e => e[0] === z);
    
    // イオン式の表示更新
    if (charge === 0) {
      // 「中性」ではなく元素記号を表示
      ionSymbolDisplay.innerHTML = `${el[1]}`;
    } else if (charge > 0) {
      // 陽イオン (Na+, Mg2+ 等)
      ionSymbolDisplay.innerHTML = `${el[1]}<sup>${charge > 1 ? charge : ''}+</sup>`;
    } else {
      // 陰イオン (F-, O2- 等)
      ionSymbolDisplay.innerHTML = `${el[1]}<sup>${Math.abs(charge) > 1 ? Math.abs(charge) : ''}−</sup>`;
    }
    
    // 電子配置の計算
    const electronConfig = calculateElectronConfig(electronCount);
    
    // 殻ごとの電子数表示
    const shellNames = ['K殻', 'L殻', 'M殻', 'N殻'];
    const shellTexts = electronConfig
      .map((electrons, i) => electrons > 0 ? `${shellNames[i]}:${electrons}個` : null)
      .filter(text => text !== null);
    
    shellInfo.innerHTML = shellTexts.join('、 ');
    
    // 希ガス型チェック
    checkNobleGasConfig(electronConfig);
    
    // 原子の描画
    drawIonAtom(canvas, z, electronCount);
  };
  
  // 電子配置を計算する関数（電子数に基づいて）
  const calculateElectronConfig = (electronCount) => {
    const conf = [];
    let left = electronCount;
    
    for (const cap of SHELL_CAP) {
      conf.push(Math.min(cap, left));
      left -= cap;
      if (left <= 0) break;
    }
    
    while (conf.length < SHELL_CAP.length) {
      conf.push(0);
    }
    
    return conf;
  };
  
  // 希ガス型配置かチェックする関数
  const checkNobleGasConfig = (config) => {
    const nobleGases = [
      { element: "He", config: [2, 0, 0, 0] },
      { element: "Ne", config: [2, 8, 0, 0] },
      { element: "Ar", config: [2, 8, 8, 0] }
    ];
    
    for (const gas of nobleGases) {
      let match = true;
      for (let i = 0; i < gas.config.length; i++) {
        if (config[i] !== gas.config[i]) {
          match = false;
          break;
        }
      }
      
      if (match) {
        nobleGasInfo.textContent = `${gas.element}型電子配置`;
        return;
      }
    }
    
    nobleGasInfo.textContent = '';
  };
  
  // イオンの原子を描画する関数
  const drawIonAtom = (canvas, atomicNumber, electronCount) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const c = {x: canvas.width/2, y: canvas.height/2};
    const conf = calculateElectronConfig(electronCount);
    
    // 殻を描画
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    conf.forEach((_, i) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, SHELL_RADII[i], 0, 2*Math.PI);
      ctx.stroke();
    });
    
    // 原子核を描画
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    ctx.arc(c.x, c.y, 20, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // 原子番号を表示
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+${atomicNumber}`, c.x, c.y);
    
    // 電子を描画
    ctx.fillStyle = '#2563eb';
    
    conf.forEach((n, i) => {
      const r = SHELL_RADII[i];
      for (let k = 0; k < n; k++) {
        const a = 2*Math.PI*k/Math.max(1, n);
        ctx.beginPath();
        ctx.arc(c.x + r*Math.cos(a), c.y + r*Math.sin(a), 6, 0, 2*Math.PI);
        ctx.fill();
      }
    });
  };
  
  // 要素を追加 - 原子番号入力コントロールを削除
  appRoot.append(pt, ionControls, shellInfo, nobleGasInfo, canvas);
  
  // 初期表示 - 選択不可能な元素をスキップするため、リストにない元素で開始
  if (disabledElements.includes(z)) {
    z = 8; // 酸素で初期化（選択可能な元素）
  }
  updateAtomDisplay();
  highlight(pt, z);
};
