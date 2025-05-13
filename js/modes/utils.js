/* ---------- Utilities ---------- */
const configForZ = z => {
  const conf = [];
  let left = z;
  for (const cap of SHELL_CAP) {
    conf.push(Math.min(cap, left));
    left -= cap;
  }
  return conf;
};

const drawAtom = (canvas, z) => {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const c = {x: canvas.width/2, y: canvas.height/2};
  const conf = configForZ(z);
  
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  conf.forEach((_, i) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, SHELL_RADII[i], 0, 2*Math.PI);
    ctx.stroke();
  });
  
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.fillStyle = '#dc2626';
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 2;
  ctx.arc(c.x, c.y, 20, 0, 2*Math.PI);
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`+${z}`, c.x, c.y);
  
  ctx.fillStyle = '#2563eb';
  conf.forEach((n, i) => {
    const r = SHELL_RADII[i];
    for (let k = 0; k < n; k++) {
      const a = 2*Math.PI*k/n;
      ctx.beginPath();
      ctx.arc(c.x + r*Math.cos(a), c.y + r*Math.sin(a), 6, 0, 2*Math.PI);
      ctx.fill();
    }
  });
};

const makeCanvas = () => {
  const cv = document.createElement('canvas');
  cv.width = 320;
  cv.height = 320;
  cv.className = 'mx-auto mb-4';
  return cv;
};

const highlight = (tbl, z) => {
  tbl.querySelectorAll('.pt-cell').forEach(td => td.classList.remove('pt-selected'));
  const t = tbl.querySelector(`.pt-cell[data-z="${z}"]`);
  t && t.classList.add('pt-selected');
};
