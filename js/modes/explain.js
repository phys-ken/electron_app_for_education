/* ---------- Explain Mode ---------- */
const renderExplain = () => {
  const appRoot = document.getElementById('app');
  appRoot.innerHTML = '';
  let z = 1;
  
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
  
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement('div');
      cell.className = 'pt-cell';
      const key = `${r}-${c}`;
      
      if (gridArea[key]) {
        const el = ELEMENTS[gridArea[key]-1];
        cell.textContent = el[1];
        cell.dataset.z = gridArea[key];
        cell.onclick = () => {
          z = gridArea[key];
          num.value = z;
          drawAtom(canvas, z);
          highlight(pt, z);
        };
      } else {
        cell.classList.add('bg-transparent', 'border-0');
      }
      
      pt.appendChild(cell);
    }
  }
  
  const controls = document.createElement('div');
  controls.className = 'flex justify-center items-center gap-2 mb-2';
  
  const btnM = document.createElement('button');
  btnM.textContent = '-';
  btnM.className = 'px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300';
  
  const btnP = document.createElement('button');
  btnP.textContent = '+';
  btnP.className = 'px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300';
  
  const num = document.createElement('input');
  num.type = 'number';
  num.min = 1;
  num.max = 20;
  num.value = z;
  num.className = 'w-16 text-center border px-1 py-0.5';
  
  btnM.onclick = () => {
    z = Math.max(1, z-1);
    num.value = z;
    drawAtom(canvas, z);
    highlight(pt, z);
  };
  
  btnP.onclick = () => {
    z = Math.min(20, z+1);
    num.value = z;
    drawAtom(canvas, z);
    highlight(pt, z);
  };
  
  num.onchange = () => {
    z = Math.max(1, Math.min(20, parseInt(num.value)));
    drawAtom(canvas, z);
    highlight(pt, z);
  };
  
  controls.append(btnM, num, btnP);
  const canvas = makeCanvas();
  appRoot.append(pt, controls, canvas);
  drawAtom(canvas, z);
  highlight(pt, z);
};
