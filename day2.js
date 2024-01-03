function frame(now, offscreenCtx, ctx) {
  const w = offscreenCtx.canvas.width;
  const h = offscreenCtx.canvas.height;
  //offscreenCtx.clearRect(0, 0, w, h);
  offscreenCtx.fillStyle = '#fff';
  offscreenCtx.fillRect(0, 0, w, h);
  const numLines = 400;
  for (let j = 0; j < 3; j++) {
    const x0 = w / 2 + 100 * Math.sin(1e-3 * now + 2 * Math.PI * j / 5) * Math.cos(1e-4 * now + 2 * Math.PI * j / 3);
    const y0 = h / 2 + 100 * Math.sin(1e-3 * now + 2 * Math.PI * j / 5) * Math.sin(1e-4 * now + 2 * Math.PI * j / 3);
    offscreenCtx.lineWidth = 1;
    offscreenCtx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
    for (let i = 0; i < numLines; i++) {
      const x = w * Math.cos(1e-5 * now + 2 * Math.PI * i / numLines);
      const y = h * Math.sin(1e-5 * now + 2 * Math.PI * i / numLines);
      offscreenCtx.beginPath();
      offscreenCtx.moveTo(x0, y0);
      offscreenCtx.lineTo(x0 + x, y0 + y);
      offscreenCtx.stroke();
    }
  }
  const moire = offscreenCtx.getImageData(0, 0, w, h);
  const numSamples = 4;
  const ntsc = ctx.createImageData(moire);
  let offset = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let y = 0;
      let i = 0;
      let q = 0;
      for (let n = -numSamples / 2; n < numSamples / 2; n++) {
        const phase = (x + n) * Math.PI / 2;
        const sample = moire.data[offset + 4 * n] / 255.0;
        y += sample / numSamples + Math.random() * 0.1;
        i += sample * Math.cos(phase) / numSamples;
        q += sample * Math.sin(phase) / numSamples;
      }
      const r = y + 0.956 * i + 0.619 * q;
      const g = y - 0.272 * i - 0.647 * q;
      const b = y - 1.106 * i + 1.703 * q;
      ntsc.data[offset + 0] = r * 255;
      ntsc.data[offset + 1] = g * 255;
      ntsc.data[offset + 2] = b * 255;
      ntsc.data[offset + 3] = 255;
      offset += 4;
    }
  }
  ctx.putImageData(ntsc, 0, 0);
  requestAnimationFrame((now) => frame(now, offscreenCtx, ctx));
}

window.addEventListener('DOMContentLoaded', () => {
  const offscreenCanvas = document.querySelector('#moire');
  const offscreenCtx = offscreenCanvas.getContext('2d', {willReadFrequently: true});
  const canvas = document.querySelector('#screen');
  const ctx = canvas.getContext('2d');
  requestAnimationFrame((now) => frame(now, offscreenCtx, ctx));
});
