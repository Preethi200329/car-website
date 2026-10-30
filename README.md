# NOCTIS — Electric Automotive Scrollytelling

> A minimal, single-page scrollytelling experience for NOCTIS, a fictional electric car brand.  
> **Mood**: A city in total blackout at night where the car's light is the only light in the world. Quiet, expensive, precise.

---

## ⚡ Tech Stack & Architecture

- **Vanilla HTML5, CSS3, & JavaScript (ES6+)**: Zero dependencies, zero frameworks, no build step.
- **Hardware-Accelerated `<canvas>` Scrollytelling**: High-performance scroll-driven scrubbing (Hero & Dismantle sequences).
- **Adaptive Frame Preloader**: Multi-tier parallel preloading with `Image.decoding = 'async'` and nearest-frame interpolation.
- **Typography**: Google Fonts (Archivo with width-axis `125`, Inter, JetBrains Mono).
- **Custom Cursor ("The Headlight")**: Smooth lerp cursor tracking that morphs into a 44×2px light signature with contextual HUD labels.
- **Interactive Lineup**: Accessible 5-model horizontal accordion with debounced hover and keyboard navigation.

---

## 🏎️ Vehicle Lineup

1. **GT-E** — Matte graphite grand tourer coupe *(Hero Vehicle)*
2. **S** — Satin bone white four-door electric sport sedan
3. **X** — Midnight blue coupe-silhouette electric SUV
4. **R** — Track coupe with carbon swan-neck wing and crimson accents
5. **ONE** — Liquid silver aerodynamic concept hypercar

---

## 🚀 How to Run Locally

You can run NOCTIS with any static file server:

### Option 1: VS Code Live Server
Right-click `index.html` in VS Code and select **Open with Live Server**.

### Option 2: Node.js (Built-in)
```bash
npx serve .
# Or run with Node directly:
node -e "const http=require('http'),fs=require('fs'),p=require('path');http.createServer((q,s)=>{let u=q.url.split('?')[0];if(u==='/')u='/index.html';let f=p.join(process.cwd(),u);if(fs.existsSync(f)&&fs.statSync(f).isFile()){s.writeHead(200);fs.createReadStream(f).pipe(s)}else{s.writeHead(404);s.end('Not found')}}).listen(3000,()=>console.log('Running at http://localhost:3000/'))"
```

---

## 🎨 Design Tokens

- `--asphalt`: `#07080A` (Background)
- `--graphite`: `#121418`
- `--fog`: `#8A8F98`
- `--bone`: `#EDEAE4` (Text)
- `--xenon`: `#CFE3FF` (Light accent)
- `--taillight`: `#E1251B` (Subtle indicators)
- `--hairline`: `rgba(237, 234, 228, 0.12)`
