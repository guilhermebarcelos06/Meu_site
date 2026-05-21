/**
 * Liquid Glass Weather & Landscape Engine - Canvas 2D
 * Desenvolvido para Guilherme Silvestre Barcelos
 * Integração de clima real via Open-Meteo API, física de partículas e paisagem interativa
 */

(function () {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Parâmetros de Performance e Configurações
  let isMobile = width < 768;
  const maxParticles = isMobile ? 40 : 100;
  
  // Estados do motor
  let isLightTheme = document.body.classList.contains('light-theme');
  let currentWeather = 'clear'; // 'clear', 'cloudy', 'rain'
  let weatherFetched = false;
  let animTime = 0;
  
  // Coordenadas padrão (Brasília - BSB)
  let lat = -15.7801;
  let lon = -47.9292;

  // Interação do Mouse
  const mouse = {
    x: null,
    y: null,
    radius: 120,
    vx: 0,
    vy: 0,
    lastX: null,
    lastY: null
  };

  // Listas de Elementos
  let particles = [];
  let ripples = [];
  let clouds = [];
  let birds = [];
  let lightningFlash = 0;
  let windForce = 0; // Vento dinâmico criado pelo mouse

  // Inicialização e Redimensionamento
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    isMobile = width < 768;
    initElements();
  });

  // Track do Mouse
  window.addEventListener('mousemove', (e) => {
    if (mouse.lastX !== null) {
      mouse.vx = e.clientX - mouse.lastX;
      mouse.vy = e.clientY - mouse.lastY;
    }
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;

    // Gerar vento ou poeira estelar
    windForce = mouse.vx * 0.1;
    if (currentWeather === 'clear' && !isLightTheme) {
      generateStardust(mouse.x, mouse.y, Math.abs(mouse.vx) + Math.abs(mouse.vy));
    }

    // Gerar ripples de brisa no lago com movimento do mouse
    const horizonY = height * 0.7;
    if (mouse.y >= horizonY && (Math.abs(mouse.vx) > 2 || Math.abs(mouse.vy) > 2)) {
      if (Math.random() < 0.15 && ripples.length < 60) {
        ripples.push(new Ripple(mouse.x, mouse.y));
      }
    }
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
    windForce = 0;
  });

  // Sincronização de Tema
  window.addEventListener('themeChanged', (e) => {
    isLightTheme = e.detail.isLight;
    initElements();
  });

  // Classe Nuvens Tridimensionais Estilizadas
  class Cloud {
    constructor() {
      this.reset();
      this.x = Math.random() * width;
    }

    reset() {
      this.x = -200;
      this.y = Math.random() * (height * 0.22) + 20;
      this.size = Math.random() * 80 + 60;
      this.speed = Math.random() * 0.15 + 0.05;
      this.opacity = Math.random() * 0.15 + 0.05;
    }

    update() {
      this.x += this.speed + windForce * 0.05;
      if (this.x - this.size * 2 > width) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.fillStyle = isLightTheme ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.arc(this.x + this.size * 0.6, this.y - this.size * 0.2, this.size * 0.8, 0, Math.PI * 2);
      ctx.arc(this.x - this.size * 0.6, this.y - this.size * 0.1, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Classe Pássaros Voando no Tema Claro
  class Bird {
    constructor() {
      this.reset();
      this.x = Math.random() * width;
    }

    reset() {
      this.x = -50;
      this.y = Math.random() * (height * 0.35) + 40;
      this.size = Math.random() * 8 + 6;
      this.speedX = Math.random() * 1.2 + 0.8;
      this.speedY = Math.random() * 0.4 - 0.2;
      this.wingPhase = Math.random() * Math.PI * 2;
      this.wingSpeed = Math.random() * 0.15 + 0.1;
    }

    update() {
      this.x += this.speedX + windForce * 0.2;
      this.y += this.speedY;
      this.wingPhase += this.wingSpeed;

      if (this.x - 50 > width) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.strokeStyle = isLightTheme ? 'rgba(71, 85, 105, 0.65)' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      
      // Desenha pássaro estilo gaivota (V simples que bate asas)
      const wingHeight = Math.sin(this.wingPhase) * this.size * 0.5;
      
      ctx.moveTo(this.x - this.size, this.y + wingHeight);
      ctx.quadraticCurveTo(this.x - this.size * 0.3, this.y - this.size * 0.1, this.x, this.y);
      ctx.quadraticCurveTo(this.x + this.size * 0.3, this.y - this.size * 0.1, this.x + this.size, this.y + wingHeight);
      
      ctx.stroke();
      ctx.restore();
    }
  }

  // Classe para Ondulações (Ripples) no Lago
  class Ripple {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 1;
      this.maxRadius = Math.random() * 18 + 8;
      this.opacity = 0.65;
      this.speed = Math.random() * 0.6 + 0.3;
    }

    update() {
      this.radius += this.speed;
      this.opacity -= 0.012;
    }

    draw() {
      ctx.save();
      ctx.strokeStyle = isLightTheme 
        ? `rgba(14, 165, 233, ${this.opacity})` 
        : `rgba(0, 242, 254, ${this.opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Desenha elipse simulando perspectiva da água do lago
      ctx.ellipse(this.x, this.y, this.radius, this.radius * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Sistema de Partículas (Estrelas, Folhas, Chuva, Stardust)
  class Particle {
    constructor(type) {
      this.type = type;
      this.reset();
      // Espalha aleatoriamente no início
      if (type === 'star') {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      } else {
        this.y = Math.random() * height;
      }
    }

    reset() {
      this.opacity = Math.random() * 0.8 + 0.2;
      this.color = '';

      if (this.type === 'star') {
        this.x = Math.random() * width;
        this.y = Math.random() * (height * 0.7); // Ficam no céu
        this.size = Math.random() * 1.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.phase = Math.random() * Math.PI;
      } 
      else if (this.type === 'leaf') {
        this.x = Math.random() * (width + 100) - 50;
        this.y = -30;
        this.size = Math.random() * 10 + 8;
        this.speedY = Math.random() * 0.8 + 0.6;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.angle = Math.random() * Math.PI * 2;
        this.angularSpeed = Math.random() * 0.02 - 0.01;
        this.swingRange = Math.random() * 1.5 + 0.5;
        this.swingSpeed = Math.random() * 0.015 + 0.005;
        this.swingPhase = Math.random() * Math.PI;
        // Folhas com cores quentes e verdes no modo claro
        const colors = ['#22c55e', '#16a34a', '#eab308', '#f97316', '#84cc16'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      } 
      else if (this.type === 'rain') {
        this.x = Math.random() * (width + 100) - 50;
        this.y = Math.random() * -100;
        this.size = Math.random() * 1.5 + 0.8; // Espessura
        this.length = Math.random() * 18 + 12; // Altura do traço
        this.speedY = Math.random() * 8 + 12; // Muito rápido
        this.speedX = -2; // Caindo na diagonal
        
        // Destino de impacto na água do lago (entre 70% e 100% da altura da tela)
        const horizonY = height * 0.7;
        this.impactY = horizonY + Math.random() * (height - horizonY);
      }
      else if (this.type === 'stardust') {
        this.x = 0;
        this.y = 0;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = (Math.random() - 0.5) * 1.5 - 0.5;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.color = `hsla(${Math.random() * 60 + 180}, 100%, 75%, `;
      }
    }

    update() {
      // Estrelas
      if (this.type === 'star') {
        this.phase += this.twinkleSpeed;
        this.opacity = Math.sin(this.phase) * 0.6 + 0.4;
        
        // Efeito mouse: estrela foge sutilmente do mouse
        if (mouse.x !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 1.5;
            this.y += (dy / dist) * force * 1.5;
          }
        }
      } 
      // Folhas caindo
      else if (this.type === 'leaf') {
        this.swingPhase += this.swingSpeed;
        this.x += Math.sin(this.swingPhase) * this.swingRange + this.speedX + windForce;
        this.y += this.speedY;
        this.angle += this.angularSpeed;

        // Efeito do mouse sobre as folhas
        if (mouse.x !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 3 + windForce * 2;
            this.y += (dy / dist) * force * 1.5;
            this.angle += force * 0.1;
          }
        }

        if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
          this.reset();
        }
      } 
      // Gotas de Chuva
      else if (this.type === 'rain') {
        this.x += this.speedX + windForce * 0.8;
        this.y += this.speedY;

        // Se passar pela posição do mouse, gera leve curvatura
        if (mouse.x !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 4;
          }
        }

        // Ripple no lago ao bater
        if (this.y >= this.impactY) {
          if (ripples.length < 60) {
            ripples.push(new Ripple(this.x, this.y));
          }
          this.reset();
        }
      }
      // Poeira estelar (rastro do mouse)
      else if (this.type === 'stardust') {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        if (this.life <= 0) {
          return false;
        }
      }
      return true;
    }

    draw() {
      ctx.save();
      if (this.type === 'star') {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Brilho estrela proeminente
        if (this.size > 1.2 && this.opacity > 0.8) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(this.x - 4, this.y);
          ctx.lineTo(this.x + 4, this.y);
          ctx.moveTo(this.x, this.y - 4);
          ctx.lineTo(this.x, this.y + 4);
          ctx.stroke();
        }
      } 
      else if (this.type === 'leaf') {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Desenha folha orgânica
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Desenha cabinho da folha
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
      } 
      else if (this.type === 'rain') {
        ctx.strokeStyle = isLightTheme ? 'rgba(14, 165, 233, 0.35)' : 'rgba(0, 242, 254, 0.22)';
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.speedX + windForce * 0.4, this.y + this.length);
        ctx.stroke();
      }
      else if (this.type === 'stardust') {
        ctx.fillStyle = this.color + this.life + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Poeira Estelar interativa
  function generateStardust(x, y, velocity) {
    const count = Math.min(Math.floor(velocity * 0.6), 6);
    for (let i = 0; i < count; i++) {
      const p = new Particle('stardust');
      p.x = x + (Math.random() - 0.5) * 10;
      p.y = y + (Math.random() - 0.5) * 10;
      particles.push(p);
    }
  }

  // Preencher elementos conforme Clima e Tema
  function initElements() {
    particles = [];
    ripples = [];
    clouds = [];
    birds = [];
    
    // Define o tipo primário de partículas do clima
    let type = 'star';
    if (currentWeather === 'rain') {
      type = 'rain';
    } else if (isLightTheme) {
      type = 'leaf';
    }

    // Inicializa nuvens se estiver nublado ou chuvoso
    if (currentWeather === 'cloudy' || currentWeather === 'rain') {
      const cloudCount = isMobile ? 3 : 6;
      for (let i = 0; i < cloudCount; i++) {
        clouds.push(new Cloud());
      }
    }

    // Inicializa pássaros no tema claro diurno sem chuva
    if (isLightTheme && currentWeather !== 'rain') {
      const birdCount = isMobile ? 2 : 4;
      for (let i = 0; i < birdCount; i++) {
        birds.push(new Bird());
      }
    }

    // Cria as partículas primárias
    const count = currentWeather === 'rain' ? maxParticles * 1.5 : maxParticles;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(type));
    }
  }

  // Desenha o degradê de fundo do Céu com alta fidelidade no Canvas
  function drawSkyBackground() {
    const horizonY = height * 0.7;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    
    if (isLightTheme) {
      if (currentWeather === 'rain' || currentWeather === 'cloudy') {
        skyGrad.addColorStop(0, '#94a3b8');
        skyGrad.addColorStop(1, '#cbd5e1');
      } else {
        skyGrad.addColorStop(0, '#bae6fd'); // Celeste lindo
        skyGrad.addColorStop(0.6, '#e0f2fe');
        skyGrad.addColorStop(1, '#ffedd5'); // Sutil pôr do sol dourado no horizonte
      }
    } else {
      if (currentWeather === 'rain' || currentWeather === 'cloudy') {
        skyGrad.addColorStop(0, '#040714');
        skyGrad.addColorStop(1, '#0e172a');
      } else {
        skyGrad.addColorStop(0, '#040612'); // Azul marinho escuro estrelado
        skyGrad.addColorStop(0.6, '#090d1e');
        skyGrad.addColorStop(1, '#1b132e'); // Toque sutil roxo/violeta no horizonte
      }
    }
    
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);
  }

  // Desenha Elementos Celestes Fixos
  function drawSkyDecorations() {
    if (currentWeather === 'rain' && isLightTheme) return; // Oculta sob tempestade diurna

    ctx.save();
    if (isLightTheme) {
      // Desenha Sol no Modo Claro
      const solX = width * 0.85;
      const solY = 120;
      const gradient = ctx.createRadialGradient(solX, solY, 10, solX, solY, 90);
      gradient.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
      gradient.addColorStop(0.3, 'rgba(253, 224, 71, 0.45)');
      gradient.addColorStop(1, 'rgba(253, 224, 71, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(solX, solY, 90, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Desenha Lua Crescente no Modo Escuro
      const luaX = width * 0.85;
      const luaY = 120;
      
      // Brilho externo da lua
      const glowGrad = ctx.createRadialGradient(luaX, luaY, 5, luaX, luaY, 40);
      glowGrad.addColorStop(0, 'rgba(0, 242, 254, 0.25)');
      glowGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(luaX, luaY, 40, 0, Math.PI * 2);
      ctx.fill();

      // Corpo da lua
      ctx.fillStyle = 'rgba(248, 250, 252, 0.95)';
      ctx.shadowColor = 'rgba(0, 242, 254, 0.8)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(luaX, luaY, 22, 0.15 * Math.PI, 1.85 * Math.PI, false);
      // Recorta para fazer crescente
      ctx.arc(luaX - 8, luaY - 2, 21, 1.8 * Math.PI, 0.2 * Math.PI, true);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Desenha montanhas de fundo com curvas Bézier (efeito profundidade paralaxe)
  function drawMountains() {
    ctx.save();
    const horizonY = height * 0.7;

    // Camada 1: Montanhas distantes (mais altas e claras)
    ctx.fillStyle = isLightTheme 
      ? 'rgba(186, 215, 233, 0.45)' 
      : 'rgba(15, 23, 42, 0.45)';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.quadraticCurveTo(width * 0.25, horizonY - 140, width * 0.5, horizonY - 40);
    ctx.quadraticCurveTo(width * 0.75, horizonY - 180, width, horizonY);
    ctx.closePath();
    ctx.fill();

    // Camada 2: Montanhas médias
    ctx.fillStyle = isLightTheme 
      ? 'rgba(156, 190, 212, 0.6)' 
      : 'rgba(23, 37, 65, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.quadraticCurveTo(width * 0.3, horizonY - 80, width * 0.65, horizonY - 120);
    ctx.quadraticCurveTo(width * 0.85, horizonY - 40, width, horizonY);
    ctx.closePath();
    ctx.fill();

    // Camada 3: Colinas próximas no horizonte
    ctx.fillStyle = isLightTheme 
      ? 'rgba(125, 160, 185, 0.75)' 
      : 'rgba(30, 41, 79, 0.75)';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.quadraticCurveTo(width * 0.15, horizonY - 40, width * 0.4, horizonY - 60);
    ctx.quadraticCurveTo(width * 0.7, horizonY - 20, width, horizonY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Desenha Lago e os Reflexos Dinâmicos da Lua/Sol com oscilações 3D a 60 FPS
  function drawLake() {
    const horizonY = height * 0.7;
    ctx.save();

    // 1. Desenhar a água do lago (gradiente base)
    const lakeGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    if (isLightTheme) {
      lakeGrad.addColorStop(0, 'rgba(182, 217, 237, 0.85)');
      lakeGrad.addColorStop(1, 'rgba(128, 172, 203, 0.95)');
    } else {
      lakeGrad.addColorStop(0, 'rgba(9, 15, 33, 0.92)');
      lakeGrad.addColorStop(1, 'rgba(2, 4, 10, 0.99)');
    }
    ctx.fillStyle = lakeGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // 2. Desenhar o reflexo do astro na água (Sol ou Lua)
    const solX = width * 0.85;
    
    // Fatias para efeito senoidal
    const sliceCount = isMobile ? 30 : 60;
    const sliceHeight = (height - horizonY) / sliceCount;
    
    ctx.globalCompositeOperation = 'screen'; // Efeito de brilho translúcido
    
    for (let i = 0; i < sliceCount; i++) {
      const sliceY = horizonY + i * sliceHeight;
      const progress = i / sliceCount; // 0 no horizonte, 1 na base
      
      // A amplitude de oscilação cresce sutilmente na base
      const waveOffset = Math.sin(animTime * 0.04 + sliceY * 0.07) * (3.5 + progress * 5.5) * (1 + Math.abs(windForce) * 0.4);
      
      // Largura do reflexo
      const baseWidth = isLightTheme ? 52 : 36;
      const sliceWidth = baseWidth * (1.6 - progress * 0.75) * (1 + Math.sin(animTime * 0.08 + sliceY * 0.02) * 0.08);
      const reflexX = solX + waveOffset;
      
      // Opacidade decai e oscila
      const opacity = (isLightTheme ? 0.42 : 0.58) * (1.15 - progress * 0.85) * (0.8 + Math.sin(animTime * 0.05 + sliceY * 0.09) * 0.2);
      
      const reflexGrad = ctx.createRadialGradient(reflexX, sliceY + sliceHeight/2, 0, reflexX, sliceY + sliceHeight/2, sliceWidth);
      if (isLightTheme) {
        reflexGrad.addColorStop(0, `rgba(253, 224, 71, ${opacity})`);
        reflexGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      } else {
        reflexGrad.addColorStop(0, `rgba(0, 242, 254, ${opacity})`);
        reflexGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');
      }
      
      ctx.fillStyle = reflexGrad;
      ctx.fillRect(reflexX - sliceWidth, sliceY, sliceWidth * 2, sliceHeight);
    }

    ctx.restore();
  }

  // Loop de Animação Principal (60 FPS)
  function animate() {
    animTime++;
    ctx.clearRect(0, 0, width, height);

    // Relâmpagos em caso de tempestade escura
    if (currentWeather === 'rain' && !isLightTheme) {
      if (Math.random() < 0.003) {
        lightningFlash = 30; // Duração do flash em frames
      }
      if (lightningFlash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${lightningFlash / 80})`;
        ctx.fillRect(0, 0, width, height);
        lightningFlash--;
      }
    }

    // 1. Desenha Céu e Astros
    drawSkyBackground();
    drawSkyDecorations();

    // 2. Desenha nuvens de fundo
    clouds.forEach(c => {
      c.update();
      c.draw();
    });

    // 3. Desenha Pássaros no tema claro diurno
    if (isLightTheme && currentWeather !== 'rain') {
      birds.forEach(b => {
        b.update();
        b.draw();
      });
    }

    // 4. Desenha as Montanhas no Horizonte
    drawMountains();

    // 5. Desenha o Lago e seus Reflexos
    drawLake();

    // 6. Atualiza e desenha partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const alive = p.update();
      if (!alive) {
        particles.splice(i, 1);
        continue;
      }
      p.draw();
    }

    // Mantém quantidade constante de partículas primárias se não forem temporárias
    let targetCount = currentWeather === 'rain' ? maxParticles * 1.5 : maxParticles;
    let currentPrimary = particles.filter(p => p.type !== 'stardust').length;
    
    if (currentPrimary < targetCount) {
      let type = 'star';
      if (currentWeather === 'rain') type = 'rain';
      else if (isLightTheme) type = 'leaf';
      particles.push(new Particle(type));
    }

    // 7. Atualiza e desenha ripples (ondulações) na superfície da água do lago
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.update();
      if (r.opacity <= 0) {
        ripples.splice(i, 1);
        continue;
      }
      r.draw();
    }

    requestAnimationFrame(animate);
  }

  // Conectar à API Open-Meteo para Clima em Tempo Real
  async function fetchWeather() {
    try {
      // Geolocalização do Usuário
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
            await queryOpenMeteo();
          },
          async (err) => {
            console.log('Geolocalização recusada/falhou. Usando BSB (padrão).', err);
            await queryOpenMeteo();
          },
          { timeout: 5000 }
        );
      } else {
        await queryOpenMeteo();
      }
    } catch (e) {
      console.error('Falha geral ao carregar clima:', e);
      initElements();
      animate();
    }
  }

  async function queryOpenMeteo() {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code`);
      const data = await res.json();
      if (data && data.current) {
        const code = data.current.weather_code;
        
        // Mapeamento de Códigos Open-Meteo:
        // 0, 1: Clear/Sunny
        // 2, 3: Partly Cloudy / Cloudy
        // 51-67, 80-82, 95-99: Rain/Thunderstorm
        if (code === 0 || code === 1) {
          currentWeather = 'clear';
        } else if (code === 2 || code === 3) {
          currentWeather = 'cloudy';
        } else if (code >= 51 && code <= 99) {
          currentWeather = 'rain';
        } else {
          currentWeather = 'cloudy';
        }
        weatherFetched = true;
        console.log(`Clima carregado de Open-Meteo: ${currentWeather} (código ${code})`);
      }
    } catch (error) {
      console.warn('Erro ao consultar Open-Meteo API. Caindo no clima padrão (clear).', error);
    } finally {
      initElements();
      if (!weatherFetched) {
        currentWeather = 'clear';
        initElements();
      }
    }
  }

  // Inicia carregando clima e dando partida no loop principal
  fetchWeather();
  animate();
})();
