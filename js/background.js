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
  const maxParticles = isMobile ? 35 : 85;
  
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
  let ants = [];
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
      if (Math.random() < 0.15 && ripples.length < 50) {
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
      this.speed = Math.random() * 0.12 + 0.04;
      this.opacity = Math.random() * 0.12 + 0.04;
    }

    update() {
      this.x += this.speed + windForce * 0.03;
      if (this.x - this.size * 2 > width) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.fillStyle = isLightTheme ? 'rgba(255, 255, 255, 0.42)' : 'rgba(255, 255, 255, 0.04)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.arc(this.x + this.size * 0.6, this.y - this.size * 0.2, this.size * 0.8, 0, Math.PI * 2);
      ctx.arc(this.x - this.size * 0.6, this.y - this.size * 0.1, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Classe Pássaros Voando e Planando no Canto Superior Direito (Modo Dia)
  class Bird {
    constructor(index) {
      this.index = index;
      this.reset();
      // Órbita inicial espalhada
      this.angle = Math.random() * Math.PI * 2;
    }

    reset() {
      // Centro da órbita no canto superior direito
      this.centerX = width * 0.84;
      this.centerY = height * 0.16;
      
      // Raio de órbita elíptica
      this.radiusX = Math.random() * 60 + 70;
      this.radiusY = Math.random() * 25 + 30;
      
      this.speed = Math.random() * 0.005 + 0.003; // Movimento de voo lento e gracioso
      this.angle = 0;
      this.size = Math.random() * 4.5 + 3.5; // Menores para parecerem distantes e delicados
      this.wingPhase = Math.random() * Math.PI * 2;
      this.wingSpeed = Math.random() * 0.08 + 0.04;
      
      this.x = this.centerX + Math.cos(this.angle) * this.radiusX;
      this.y = this.centerY + Math.sin(this.angle) * this.radiusY;
    }

    update() {
      this.centerX = width * 0.84;
      this.centerY = height * 0.16;

      this.angle -= this.speed + windForce * 0.0008; // Voando em círculos elegantes
      this.wingPhase += this.wingSpeed;

      // Posição final interpolada para leve flutuação orgânica
      const targetX = this.centerX + Math.cos(this.angle) * this.radiusX;
      const targetY = this.centerY + Math.sin(this.angle) * this.radiusY + Math.sin(animTime * 0.015 + this.index) * 6;

      this.x += (targetX - this.x) * 0.08;
      this.y += (targetY - this.y) * 0.08;
    }

    draw() {
      ctx.save();
      // Silhueta cinza-azulada suave
      ctx.strokeStyle = isLightTheme ? 'rgba(71, 85, 105, 0.45)' : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      
      // Bate asas periodicamente
      const isGliding = Math.sin(this.wingPhase) > 0.45;
      const wingHeight = isGliding ? 0 : Math.sin(this.wingPhase) * this.size * 0.45;
      
      ctx.moveTo(this.x - this.size, this.y + wingHeight);
      ctx.quadraticCurveTo(this.x - this.size * 0.3, this.y - this.size * 0.15, this.x, this.y);
      ctx.quadraticCurveTo(this.x + this.size * 0.3, this.y - this.size * 0.15, this.x + this.size, this.y + wingHeight);
      
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
      this.maxRadius = Math.random() * 16 + 6;
      this.opacity = 0.6;
      this.speed = Math.random() * 0.5 + 0.25;
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
      // Elipse achatada simulando perspectiva 3D
      ctx.ellipse(this.x, this.y, this.radius, this.radius * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Classe Formigas Microscópicas no Canto (Easter Egg do Modo Escuro)
  class Ant {
    constructor() {
      this.reset();
      this.x = Math.random() * (width * 0.15); // Começa em algum ponto no canto esquerdo
    }

    reset() {
      this.x = -5;
      this.speed = Math.random() * 0.2 + 0.12; // Marcha bem lenta e detalhada
      this.legPhase = Math.random() * Math.PI * 2;
      this.legSpeed = Math.random() * 0.15 + 0.08;
      this.size = 2; // Tamanho super sutil (2px)
    }

    update() {
      this.x += this.speed;
      this.legPhase += this.legSpeed;

      // Retorna para o início ao sair da zona da colina esquerda (mantendo-as no canto)
      if (this.x > width * 0.16) {
        this.reset();
      }
    }

    draw() {
      // Calcula a altura da colina (margem) onde a formiga está andando
      // A colina é definida via quadraticCurveTo(width * 0.1, height * 0.82, width * 0.22, height * 0.88)
      const t = this.x / (width * 0.22);
      let antY = height;
      
      if (this.x < width * 0.22) {
        const y0 = height;
        const y1 = height * 0.82;
        const y2 = height * 0.88;
        antY = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
      }

      ctx.save();
      ctx.fillStyle = '#0f172a'; // Cor de formiga (carvão)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.5;

      // Desenha corpo segmentado (abdômen, tórax e cabeça)
      ctx.beginPath();
      ctx.arc(this.x, antY - 2, this.size * 0.75, 0, Math.PI * 2); // Abdômen
      ctx.arc(this.x + 1.6, antY - 2, this.size * 0.5, 0, Math.PI * 2); // Tórax
      ctx.arc(this.x + 3.0, antY - 2, this.size * 0.45, 0, Math.PI * 2); // Cabeça
      ctx.fill();

      // Perninhas em movimento
      const legOffset = Math.sin(this.legPhase) * 1.0;
      ctx.beginPath();
      // Perna 1
      ctx.moveTo(this.x + 2, antY - 2);
      ctx.lineTo(this.x + 2.5, antY - 2 + legOffset);
      // Perna 2
      ctx.moveTo(this.x + 1, antY - 2);
      ctx.lineTo(this.x + 1, antY - 2 - legOffset);
      // Perna 3
      ctx.moveTo(this.x - 0.5, antY - 2);
      ctx.lineTo(this.x - 1, antY - 2 + legOffset);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Sistema de Partículas (Estrelas, Folhas da Árvore, Chuva, Stardust)
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
        this.twinkleSpeed = Math.random() * 0.015 + 0.005;
        this.phase = Math.random() * Math.PI;
      } 
      else if (this.type === 'leaf') {
        // As folhas nascem exatamente da copa da árvore na esquerda!
        this.x = Math.random() * (width * 0.25);
        this.y = Math.random() * (height * 0.4) + height * 0.35; // Posição dos galhos
        this.size = Math.random() * 8 + 6;
        this.speedY = Math.random() * 0.38 + 0.28; // CAEM BEM LENTO, flutuando suavemente
        this.speedX = Math.random() * 0.48 + 0.28; // Derivam para a direita devido à brisa
        this.angle = Math.random() * Math.PI * 2;
        this.angularSpeed = Math.random() * 0.012 - 0.006;
        this.swingRange = Math.random() * 1.6 + 0.6;
        this.swingSpeed = Math.random() * 0.01 + 0.004;
        this.swingPhase = Math.random() * Math.PI;
        
        // Cores quentes de outono e verde folha
        const colors = ['#22c55e', '#16a34a', '#eab308', '#f97316', '#84cc16', '#4ade80', '#a3e635'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      } 
      else if (this.type === 'rain') {
        this.x = Math.random() * (width + 100) - 50;
        this.y = Math.random() * -100;
        this.size = Math.random() * 1.2 + 0.8; 
        this.length = Math.random() * 16 + 10;
        this.speedY = Math.random() * 8 + 12; // Queda rápida
        this.speedX = -2; // Caindo na diagonal
        
        // Destino de impacto na água do lago (entre 70% e 100% da tela)
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
        this.decay = Math.random() * 0.02 + 0.015;
        this.color = `hsla(${Math.random() * 60 + 180}, 100%, 75%, `;
      }
    }

    update() {
      if (this.type === 'star') {
        this.phase += this.twinkleSpeed;
        this.opacity = Math.sin(this.phase) * 0.6 + 0.4;
        
        // Repulsão suave do mouse
        if (mouse.x !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 1.2;
            this.y += (dy / dist) * force * 1.2;
          }
        }
      } 
      else if (this.type === 'leaf') {
        this.swingPhase += this.swingSpeed;
        this.x += Math.sin(this.swingPhase) * this.swingRange + this.speedX + windForce * 0.6;
        this.y += this.speedY;
        this.angle += this.angularSpeed;

        // Repulsão do mouse nas folhas flutuantes
        if (mouse.x !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 2.8 + windForce;
            this.y += (dy / dist) * force * 1.2;
            this.angle += force * 0.08;
          }
        }

        // Se passar da borda inferior ou lateral, reinicia nos galhos
        if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
          this.reset();
        }
      } 
      else if (this.type === 'rain') {
        this.x += this.speedX + windForce * 0.7;
        this.y += this.speedY;

        // Desvio suave pelo mouse
        if (mouse.x !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 3.5;
          }
        }

        // Impacto e ondulação no lago
        if (this.y >= this.impactY) {
          if (ripples.length < 50) {
            ripples.push(new Ripple(this.x, this.y));
          }
          this.reset();
        }
      }
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
        if (this.size > 1.2 && this.opacity > 0.82) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.25})`;
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
        
        // Desenha folha oval e delicada
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Nervura sutil
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
      } 
      else if (this.type === 'rain') {
        ctx.strokeStyle = isLightTheme ? 'rgba(14, 165, 233, 0.32)' : 'rgba(0, 242, 254, 0.2)';
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.speedX + windForce * 0.35, this.y + this.length);
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
    const count = Math.min(Math.floor(velocity * 0.5), 5);
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
    ants = [];
    
    let type = 'star';
    if (currentWeather === 'rain') {
      type = 'rain';
    } else if (isLightTheme) {
      type = 'leaf'; // CAEM LENTO DA ÁRVORE APENAS NO MODO CLARO
    }

    // Inicializa nuvens
    if (currentWeather === 'cloudy' || currentWeather === 'rain') {
      const cloudCount = isMobile ? 3 : 5;
      for (let i = 0; i < cloudCount; i++) {
        clouds.push(new Cloud());
      }
    }

    // Inicializa pássaros orbitando no canto superior direito no Modo Dia (Claro)
    if (isLightTheme && currentWeather !== 'rain') {
      const birdCount = isMobile ? 2 : 4;
      for (let i = 0; i < birdCount; i++) {
        birds.push(new Bird(i));
      }
    }

    // Inicializa formigas no canto inferior esquerdo no Modo Noite (Escuro)
    if (!isLightTheme) {
      const antCount = isMobile ? 3 : 6;
      for (let i = 0; i < antCount; i++) {
        ants.push(new Ant());
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
        skyGrad.addColorStop(0, '#bae6fd'); // Celeste
        skyGrad.addColorStop(0.6, '#e0f2fe');
        skyGrad.addColorStop(1, '#ffedd5'); // Pôr do sol sutil dourado no horizonte
      }
    } else {
      if (currentWeather === 'rain' || currentWeather === 'cloudy') {
        skyGrad.addColorStop(0, '#040714');
        skyGrad.addColorStop(1, '#0e172a');
      } else {
        skyGrad.addColorStop(0, '#040612'); // Azul estrelado profundo
        skyGrad.addColorStop(0.6, '#090d1e');
        skyGrad.addColorStop(1, '#1b132e'); // Toque sutil roxo/violeta no horizonte
      }
    }
    
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);
  }

  // Desenha Elementos Celestes Fixos
  function drawSkyDecorations() {
    if (currentWeather === 'rain' && isLightTheme) return; 

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
      // Desenha Lua Crescente Ajustada de Alta Fidelidade no Modo Escuro
      const luaX = width * 0.85;
      const luaY = 120;
      const radius = 24;
      
      // 1. Brilho externo da lua (Halo de Névoa Cósmica expandido e suave)
      const glowGrad = ctx.createRadialGradient(luaX, luaY, 0, luaX, luaY, 65);
      glowGrad.addColorStop(0, 'rgba(186, 230, 253, 0.42)'); // Azul-celeste suave
      glowGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.18)');
      glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(luaX, luaY, 65, 0, Math.PI * 2);
      ctx.fill();
 
      // 2. Brilho da Luz Cinérea (a face da lua fracamente iluminada)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.arc(luaX, luaY, radius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Crescente de Alta Fidelidade (Curvatura Ajustada Elegante com Degradê)
      ctx.beginPath();
      // Desenha arco externo de -90 a 90 graus
      ctx.arc(luaX, luaY, radius, -Math.PI * 0.5, Math.PI * 0.5, false);
      // Desenha curva interna com recorte 0.62 para crescentes finos e afiados
      ctx.quadraticCurveTo(luaX + radius * 0.62, luaY, luaX, luaY - radius);
      ctx.closePath();

      const moonGrad = ctx.createLinearGradient(luaX, luaY - radius, luaX, luaY + radius);
      moonGrad.addColorStop(0, '#ffffff');
      moonGrad.addColorStop(0.5, '#fef08a'); // Tom quente dourado lunar sutil
      moonGrad.addColorStop(1, '#e2e8f0'); // Prata
      ctx.fillStyle = moonGrad;

      ctx.shadowColor = 'rgba(254, 240, 138, 0.75)';
      ctx.shadowBlur = 18;
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

  // Desenha a faixa de terra no horizonte (Margem separadora de montanhas e água)
  function drawHorizonShore() {
    ctx.save();
    const horizonY = height * 0.7;
    
    if (isLightTheme) {
      ctx.fillStyle = '#64748b'; // Slate médio
    } else {
      ctx.fillStyle = '#080c16'; // Margem noturna escura
    }
    
    ctx.beginPath();
    ctx.moveTo(0, horizonY - 4);
    // Pequena ondulação orgânica de relevo
    for (let x = 0; x <= width; x += 40) {
      const yOffset = Math.sin(x * 0.01) * 1.5;
      ctx.lineTo(x, horizonY + yOffset);
    }
    ctx.lineTo(width, horizonY + 6);
    ctx.lineTo(0, horizonY + 6);
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
      lakeGrad.addColorStop(0, 'rgba(173, 216, 230, 0.86)'); // Azul claro suave
      lakeGrad.addColorStop(0.5, 'rgba(135, 206, 250, 0.92)');
      lakeGrad.addColorStop(1, 'rgba(70, 130, 180, 0.98)');  // Azul aço profundo
    } else {
      lakeGrad.addColorStop(0, 'rgba(6, 10, 24, 0.95)');    // Azul noite profundo
      lakeGrad.addColorStop(0.4, 'rgba(3, 5, 14, 0.98)');
      lakeGrad.addColorStop(1, 'rgba(1, 2, 6, 1.0)');
    }
    ctx.fillStyle = lakeGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // 2. Ondas horizontais em Perspectiva 3D (Refinamento do lago com ondulações curtas e arqueadas)
    ctx.strokeStyle = isLightTheme ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1.0;
    const rows = isMobile ? 7 : 13;
    for (let r = 0; r < rows; r++) {
      const waveY = horizonY + (r + 1) * ((height - horizonY) / (rows + 1));
      const perspectiveScale = (waveY - horizonY) / (height - horizonY); // Fator de perspectiva 0 -> 1
      
      // Número de segmentos arqueados por linha
      const segs = isMobile ? 2 : 4;
      const spacing = width / segs;
      
      for (let s = 0; s < segs; s++) {
        // Deslocamento de tempo horizontal senoidal para simular movimento de brisa
        const baseX = s * spacing + (animTime * 0.35 * (1 + perspectiveScale * 0.6) + r * 95) % spacing;
        const waveLength = (isMobile ? 55 : 130) * (0.35 + perspectiveScale * 0.8);
        const waveHeight = 2.2 * perspectiveScale;
        
        const xStart = baseX - waveLength / 2;
        const xEnd = xStart + waveLength;
        
        // Desenha uma onda arqueada suave usando curvas quadráticas
        ctx.beginPath();
        ctx.moveTo(xStart, waveY);
        ctx.quadraticCurveTo(
          xStart + waveLength * 0.5, 
          waveY + Math.sin(animTime * 0.035 + s + r) * waveHeight, 
          xEnd, 
          waveY
        );
        ctx.stroke();
      }
    }

    // 3. Desenhar o reflexo do astro na água (Sol ou Lua)
    const solX = width * 0.85;
    
    // Fatias horizontais de reflexão
    const sliceCount = isMobile ? 25 : 45;
    const sliceHeight = (height - horizonY) / sliceCount;
    
    ctx.globalCompositeOperation = 'screen'; 
    
    for (let i = 0; i < sliceCount; i++) {
      const sliceY = horizonY + i * sliceHeight;
      const progress = i / sliceCount; // 0 no horizonte, 1 na base
      
      // A amplitude de oscilação cresce sutilmente na base
      const waveOffset = Math.sin(animTime * 0.045 + sliceY * 0.08) * (2.2 + progress * 6.0) * (1 + Math.abs(windForce) * 0.4);
      
      // Largura da fatia de reflexo
      const baseWidth = isLightTheme ? 45 : 28;
      const sliceWidth = baseWidth * (1.3 - progress * 0.6) * (0.95 + Math.sin(animTime * 0.08 + sliceY * 0.03) * 0.08);
      const reflexX = solX + waveOffset;
      
      // Opacidade decai e oscila
      const opacity = (isLightTheme ? 0.38 : 0.48) * (1.1 - progress * 0.8) * (0.85 + Math.sin(animTime * 0.06 + sliceY * 0.1) * 0.15);
      
      const reflexGrad = ctx.createLinearGradient(reflexX - sliceWidth, 0, reflexX + sliceWidth, 0);
      if (isLightTheme) {
        reflexGrad.addColorStop(0, 'rgba(253, 224, 71, 0)');
        reflexGrad.addColorStop(0.5, `rgba(253, 224, 71, ${opacity})`);
        reflexGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      } else {
        reflexGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        reflexGrad.addColorStop(0.5, `rgba(56, 189, 248, ${opacity})`);
        reflexGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      }
      
      ctx.fillStyle = reflexGrad;
      // Desenha em formato de elipse horizontal achatada (shimmering glimmers)
      ctx.beginPath();
      ctx.ellipse(reflexX, sliceY + sliceHeight/2, sliceWidth, sliceHeight * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Desenha a terra/margem no primeiro plano (Canto Inferior Esquerdo)
  function drawForegroundShore() {
    ctx.save();
    
    // Degradê adaptativo para a terra
    const shoreGrad = ctx.createLinearGradient(0, height * 0.8, 0, height);
    if (isLightTheme) {
      shoreGrad.addColorStop(0, '#334155'); // Slate escuro
      shoreGrad.addColorStop(1, '#1e293b');
    } else {
      shoreGrad.addColorStop(0, '#090d16'); // Quase preto noturno
      shoreGrad.addColorStop(1, '#020306');
    }
    
    ctx.fillStyle = shoreGrad;
    ctx.beginPath();
    // Colina suave que se estende do canto inferior esquerdo
    ctx.moveTo(0, height);
    ctx.quadraticCurveTo(width * 0.1, height * 0.82, width * 0.22, height * 0.88);
    ctx.quadraticCurveTo(width * 0.35, height * 0.94, width * 0.45, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Desenha a Tessa (Cachorrinha Easter Egg) sentada na colina antes do lago
  function drawTessa() {
    ctx.save();
    
    // Posição base na colina do primeiro plano
    const tessaX = width * 0.11;
    // Calcula o Y exato da colina em tessaX para garantir que ela esteja sentada em cima dela
    const t = tessaX / (width * 0.22);
    const y0 = height;
    const y1 = height * 0.82;
    const y2 = height * 0.88;
    const tessaY = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;

    // A cor acompanha a silhueta da terra (Slate escuro no claro, Preto noturno no escuro)
    ctx.fillStyle = isLightTheme ? '#283548' : '#020306';
    ctx.strokeStyle = isLightTheme ? '#283548' : '#020306';
    ctx.lineWidth = 1.0;

    // 1. Abdômen/Corpo (Elipse inclinada para trás)
    ctx.beginPath();
    ctx.ellipse(tessaX - 4, tessaY - 14, 7, 12, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // 2. Peito/Pescoço (Curva subindo)
    ctx.beginPath();
    ctx.ellipse(tessaX + 1, tessaY - 18, 6, 8, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 3. Cabeça (Círculo no topo)
    ctx.beginPath();
    ctx.arc(tessaX + 2, tessaY - 26, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Focinho (Muzzle) apontando para a direita/lago
    ctx.beginPath();
    ctx.ellipse(tessaX + 6.5, tessaY - 26, 3.5, 2.2, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // 5. Orelhas (Orelhas caídas charmosas de Golden/Labrador)
    ctx.beginPath();
    ctx.ellipse(tessaX - 1, tessaY - 25, 2.2, 5.0, 0.18, 0, Math.PI * 2);
    ctx.fill();

    // 6. Patas Dianteiras (Retas tocando o chão)
    ctx.beginPath();
    ctx.ellipse(tessaX + 3, tessaY - 7, 2.0, 7.0, 0, 0, Math.PI * 2);
    ctx.fill();

    // 7. Pata Traseira Dobrada (Sentada)
    ctx.beginPath();
    ctx.arc(tessaX - 5, tessaY - 5, 5.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(tessaX - 3, tessaY - 2.5, 6.0, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 8. Rabo (Curva estilizada e peluda, erguida feliz e oscilando de leve)
    const tailWiggle = Math.sin(animTime * 0.08) * 1.5;
    ctx.beginPath();
    ctx.moveTo(tessaX - 9, tessaY - 6);
    ctx.quadraticCurveTo(tessaX - 15 + tailWiggle, tessaY - 10, tessaX - 12 + tailWiggle, tessaY - 17);
    ctx.quadraticCurveTo(tessaX - 10 + tailWiggle, tessaY - 13, tessaX - 8, tessaY - 8);
    ctx.closePath();
    ctx.fill();

    // 9. Pequena coleira brilhante para detalhe de alta fidelidade
    ctx.strokeStyle = isLightTheme ? '#f59e0b' : '#00f2fe'; // Ouro no claro, ciano neon no escuro
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(tessaX - 1, tessaY - 22);
    ctx.lineTo(tessaX + 5, tessaY - 20);
    ctx.stroke();

    ctx.restore();
  }

  // Desenha a Árvore no canto esquerdo da tela (silhueta que serve de moldura com folhagem abundante)
  function drawLeftTree() {
    ctx.save();
    
    // Cor da silhueta da árvore
    if (isLightTheme) {
      ctx.fillStyle = '#1e293b'; 
      ctx.strokeStyle = '#1e293b';
    } else {
      ctx.fillStyle = '#03050a'; 
      ctx.strokeStyle = '#03050a';
    }
    
    ctx.lineWidth = 1.5;
    
    // 1. Desenha o Tronco Principal emergindo da colina
    ctx.beginPath();
    ctx.moveTo(0, height * 0.95);
    ctx.bezierCurveTo(width * 0.05, height * 0.88, width * 0.04, height * 0.72, 0, height * 0.58);
    ctx.lineTo(0, height * 0.52);
    ctx.bezierCurveTo(width * 0.06, height * 0.7, width * 0.08, height * 0.86, 0, height * 1.0);
    ctx.closePath();
    ctx.fill();
    
    // 2. Galhos principais se estendendo sobre o lago
    // Galho 1 (Inferior)
    ctx.beginPath();
    ctx.moveTo(0, height * 0.83);
    ctx.bezierCurveTo(width * 0.06, height * 0.79, width * 0.12, height * 0.75, width * 0.16, height * 0.76);
    ctx.bezierCurveTo(width * 0.12, height * 0.77, width * 0.06, height * 0.82, 0, height * 0.86);
    ctx.closePath();
    ctx.fill();
    
    // Galho 2 (Médio)
    ctx.beginPath();
    ctx.moveTo(0, height * 0.72);
    ctx.bezierCurveTo(width * 0.08, height * 0.66, width * 0.15, height * 0.59, width * 0.22, height * 0.62);
    ctx.bezierCurveTo(width * 0.15, height * 0.63, width * 0.07, height * 0.73, 0, height * 0.76);
    ctx.closePath();
    ctx.fill();

    // Galho 3 (Superior)
    ctx.beginPath();
    ctx.moveTo(0, height * 0.59);
    ctx.bezierCurveTo(width * 0.06, height * 0.53, width * 0.15, height * 0.45, width * 0.25, height * 0.49);
    ctx.bezierCurveTo(width * 0.16, height * 0.5, width * 0.07, height * 0.59, 0, height * 0.63);
    ctx.closePath();
    ctx.fill();
    
    // 3. Desenha a folhagem (Nuvens de folhas extremamente densas e 3D)
    if (isLightTheme) {
      // No Modo Claro, desenhamos várias camadas de cores (verdes e outonais com opacidades)
      // para criar um efeito tridimensional e rico, cobrindo os galhos
      
      const drawLeafCluster = (cx, cy, baseRadius) => {
        // Camada 1: Verde floresta profundo no centro (alta opacidade para tapar os galhos)
        ctx.fillStyle = 'rgba(22, 163, 74, 0.82)';
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
        ctx.arc(cx - baseRadius * 0.4, cy + baseRadius * 0.3, baseRadius * 0.8, 0, Math.PI * 2);
        ctx.arc(cx + baseRadius * 0.4, cy - baseRadius * 0.2, baseRadius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Camada 2: Verde esmeralda vibrante intermediário
        ctx.fillStyle = 'rgba(34, 197, 94, 0.88)';
        ctx.beginPath();
        ctx.arc(cx - baseRadius * 0.2, cy - baseRadius * 0.3, baseRadius * 0.75, 0, Math.PI * 2);
        ctx.arc(cx + baseRadius * 0.3, cy + baseRadius * 0.2, baseRadius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Camada 3: Verde claro translúcido nas bordas para iluminar
        ctx.fillStyle = 'rgba(74, 222, 128, 0.85)';
        ctx.beginPath();
        ctx.arc(cx + baseRadius * 0.5, cy - baseRadius * 0.4, baseRadius * 0.5, 0, Math.PI * 2);
        ctx.arc(cx - baseRadius * 0.5, cy - baseRadius * 0.2, baseRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Camada 4: Pequenos destaques dourados/outonais na copa para dar calor e textura
        ctx.fillStyle = 'rgba(234, 179, 8, 0.70)';
        ctx.beginPath();
        ctx.arc(cx + baseRadius * 0.2, cy - baseRadius * 0.5, baseRadius * 0.35, 0, Math.PI * 2);
        ctx.arc(cx - baseRadius * 0.1, cy + baseRadius * 0.4, baseRadius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      };

      // Desenhamos folhagem densa e espessa ao longo de toda a estrutura (com mais clusters e tamanhos maiores!)
      // Junção do Tronco e base dos galhos (para tapar completamente o visual "seco")
      drawLeafCluster(width * 0.02, height * 0.82, 45);
      drawLeafCluster(width * 0.04, height * 0.76, 48);
      drawLeafCluster(width * 0.06, height * 0.64, 52);
      drawLeafCluster(width * 0.05, height * 0.54, 55);
      drawLeafCluster(width * 0.03, height * 0.45, 48);

      // Ao longo do Galho 1 (Inferior)
      drawLeafCluster(width * 0.08, height * 0.81, 40);
      drawLeafCluster(width * 0.12, height * 0.78, 38);
      drawLeafCluster(width * 0.16, height * 0.76, 34);
      drawLeafCluster(width * 0.20, height * 0.74, 28);

      // Ao longo do Galho 2 (Médio)
      drawLeafCluster(width * 0.09, height * 0.69, 48);
      drawLeafCluster(width * 0.14, height * 0.65, 45);
      drawLeafCluster(width * 0.19, height * 0.62, 42);
      drawLeafCluster(width * 0.24, height * 0.60, 36);
      drawLeafCluster(width * 0.28, height * 0.58, 28);

      // Ao longo do Galho 3 (Superior)
      drawLeafCluster(width * 0.08, height * 0.56, 52);
      drawLeafCluster(width * 0.13, height * 0.52, 48);
      drawLeafCluster(width * 0.18, height * 0.49, 45);
      drawLeafCluster(width * 0.23, height * 0.47, 40);
      drawLeafCluster(width * 0.28, height * 0.44, 34);
      drawLeafCluster(width * 0.32, height * 0.42, 28);

      // Clusters de enchimento (entre os galhos para dar um canopy gordo e contínuo)
      drawLeafCluster(width * 0.08, height * 0.73, 44);
      drawLeafCluster(width * 0.13, height * 0.70, 42);
      drawLeafCluster(width * 0.10, height * 0.60, 44);
      drawLeafCluster(width * 0.16, height * 0.56, 40);
      drawLeafCluster(width * 0.08, height * 0.44, 48);
      drawLeafCluster(width * 0.15, height * 0.41, 42);

    } else {
      // No Modo Escuro, desenhamos uma silhueta densa, pesada e preenchida de alta fidelidade
      // com sobreposições em tons escuros frios de Slate para dar volume realista
      const drawDarkCluster = (cx, cy, baseRadius) => {
        // Base escura principal (quase totalmente opaca para cobrir os galhos)
        ctx.fillStyle = 'rgba(3, 5, 10, 0.98)';
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
        ctx.arc(cx - baseRadius * 0.4, cy + baseRadius * 0.3, baseRadius * 0.8, 0, Math.PI * 2);
        ctx.arc(cx + baseRadius * 0.4, cy - baseRadius * 0.2, baseRadius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Destaque de relevo em Slate escuro para volumetria sob a luz da lua (com mais brilho/contraste lunar)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.arc(cx - baseRadius * 0.1, cy - baseRadius * 0.2, baseRadius * 0.7, 0, Math.PI * 2);
        ctx.arc(cx + baseRadius * 0.2, cy + baseRadius * 0.1, baseRadius * 0.65, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(30, 41, 59, 0.65)';
        ctx.beginPath();
        ctx.arc(cx + baseRadius * 0.3, cy - baseRadius * 0.3, baseRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      };

      // Desenha folhagem abundante e preenchida no modo escuro
      // Junção do Tronco e base
      drawDarkCluster(width * 0.02, height * 0.82, 45);
      drawDarkCluster(width * 0.04, height * 0.76, 48);
      drawDarkCluster(width * 0.06, height * 0.64, 52);
      drawDarkCluster(width * 0.05, height * 0.54, 55);
      drawDarkCluster(width * 0.03, height * 0.45, 48);

      // Ao longo do Galho 1 (Inferior)
      drawDarkCluster(width * 0.08, height * 0.81, 40);
      drawDarkCluster(width * 0.12, height * 0.78, 38);
      drawDarkCluster(width * 0.16, height * 0.76, 34);
      drawDarkCluster(width * 0.20, height * 0.74, 28);

      // Ao longo do Galho 2 (Médio)
      drawDarkCluster(width * 0.09, height * 0.69, 48);
      drawDarkCluster(width * 0.14, height * 0.65, 45);
      drawDarkCluster(width * 0.19, height * 0.62, 42);
      drawDarkCluster(width * 0.24, height * 0.60, 36);
      drawDarkCluster(width * 0.28, height * 0.58, 28);

      // Ao longo do Galho 3 (Superior)
      drawDarkCluster(width * 0.08, height * 0.56, 52);
      drawDarkCluster(width * 0.13, height * 0.52, 48);
      drawDarkCluster(width * 0.18, height * 0.49, 45);
      drawDarkCluster(width * 0.23, height * 0.47, 40);
      drawDarkCluster(width * 0.28, height * 0.44, 34);
      drawDarkCluster(width * 0.32, height * 0.42, 28);

      // Clusters de enchimento (Modo Escuro)
      drawDarkCluster(width * 0.08, height * 0.73, 44);
      drawDarkCluster(width * 0.13, height * 0.70, 42);
      drawDarkCluster(width * 0.10, height * 0.60, 44);
      drawDarkCluster(width * 0.16, height * 0.56, 40);
      drawDarkCluster(width * 0.08, height * 0.44, 48);
      drawDarkCluster(width * 0.15, height * 0.41, 42);
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
        lightningFlash = 30; // Duração em frames
      }
      if (lightningFlash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${lightningFlash / 85})`;
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

    // 3. Desenha Pássaros orbitando no canto (Modo Dia apenas)
    if (isLightTheme && currentWeather !== 'rain') {
      birds.forEach(b => {
        b.update();
        b.draw();
      });
    }

    // 4. Desenha as Montanhas no Horizonte
    drawMountains();

    // 4.5 Desenha a Margem de Terra do Horizonte (antes do lago)
    drawHorizonShore();

    // 5. Desenha o Lago e seus Reflexos Ajustados
    drawLake();

    // 5.5 Desenha a Margem de Terra no Primeiro Plano (canto inferior esquerdo)
    drawForegroundShore();

    // Desenha a Tessa sentada na colina do primeiro plano antes do lago
    drawTessa();

    // 5.6 Desenha formigas andando no canto da terra (Modo Noite apenas)
    if (!isLightTheme) {
      ants.forEach(a => {
        a.update();
        a.draw();
      });
    }

    // 5.7 Desenha a Moldura da Árvore na Esquerda (emergindo da terra)
    drawLeftTree();

    // 6. Atualiza e desenha partículas (Estrelas, Folhas caindo, Chuva)
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const alive = p.update();
      if (!alive) {
        particles.splice(i, 1);
        continue;
      }
      p.draw();
    }

    // Mantém quantidade constante de partículas de clima
    let targetCount = currentWeather === 'rain' ? maxParticles * 1.5 : maxParticles;
    let currentPrimary = particles.filter(p => p.type !== 'stardust').length;
    
    if (currentPrimary < targetCount) {
      let type = 'star';
      if (currentWeather === 'rain') type = 'rain';
      else if (isLightTheme) type = 'leaf'; // Folhas caindo
      particles.push(new Particle(type));
    }

    // 7. Ondulações (ripples) na superfície da água
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
