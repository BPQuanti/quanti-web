const fs = require('fs');
const path = require('path');

const resvgPath = path.join(
  process.env.TEMP || '/tmp',
  'quanti-resvg',
  'node_modules',
  '@resvg',
  'resvg-js'
);
const { Resvg } = require(resvgPath);

const root = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(root, 'assets', 'brand', 'logo-mark.svg'), 'utf8');
const inner = raw
  .replace(/<\?xml[^>]*>/, '')
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '');

function placed(size, scale, background) {
  const markW = 350 * scale;
  const markH = 320 * scale;
  const x = (size - markW) / 2;
  const y = (size - markH) / 2;
  const rect = background
    ? `<rect width="${size}" height="${size}" fill="${background}"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${rect}<g transform="translate(${x} ${y}) scale(${scale})"><g transform="translate(-330 -420)">${inner}</g></g></svg>`;
}

function render(svg, file, width) {
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    background: 'rgba(0,0,0,0)',
  }).render();
  fs.writeFileSync(file, png.asPng());
  console.log(path.basename(file), png.width, png.height);
}

const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="640" viewBox="0 0 700 640"><g transform="translate(175 160)"><g transform="translate(-330 -420)">${inner}</g></g></svg>`;

render(splash, path.join(root, 'assets', 'splash-icon.png'), 700);
render(placed(1024, 1.55, '#09090B'), path.join(root, 'assets', 'icon.png'), 1024);
render(placed(1024, 1.05, null), path.join(root, 'assets', 'android-icon-foreground.png'), 1024);
render(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="#09090B"/></svg>`,
  path.join(root, 'assets', 'android-icon-background.png'),
  1024
);

const mono = inner
  .replace(/#DDD6FE/gi, '#FFFFFF')
  .replace(/#7C3AED/gi, '#FFFFFF')
  .replace(/#C084FC/gi, '#FFFFFF');
const monoSvg = placed(1024, 1.05, null).replace(inner, mono);
render(monoSvg, path.join(root, 'assets', 'android-icon-monochrome.png'), 1024);
render(
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#09090B"/><g transform="translate(10 12) scale(0.125)"><g transform="translate(-330 -420)">${inner}</g></g></svg>`,
  path.join(root, 'assets', 'favicon.png'),
  64
);
