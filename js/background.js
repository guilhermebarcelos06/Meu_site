/**
 * Liquid Glass Weather Engine - Canvas 2D
 * Desenvolvido para Guilherme Silvestre Barcelos
 * Integração de clima real via Open-Meteo API e física de partículas interativa
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
      this.y = Math.random() * (height * 0.25) + 30;
      this.size = Math.random() * 80 + 60;
      this.speed = Math.random() * 0.15 + 0.05;
      this.opacity = Math.random() * 0.15 + 0.05;
    }

    update() {
      this.x += this.speed;
      if (this.x - this.size * 2 > width) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.fillStyle = isLightTheme ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      // Desenha nuvem puff
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.arc(this.x + this.size * 0.6, this.y - this.size * 0.2, this.size * 0.8, 0, Math.PI * 2);
      ctx.arc(this.x - this.size * 0.6, this.y - this.size * 0.1, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Classe para Ondulações (Ripples) na Base para Chuva
  class Ripple {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 1;
      this.maxRadius = Math.random() * 20 + 10;
      this.opacity = 0.6;
      this.speed = Math.random() * 0.8 + 0.4;
    }

    update() {
      this.radius += this.speed;
      this.opacity -= 0.015;
    }

    draw() {
      ctx.strokeStyle = isLightTheme ? `rgba(14, 165, 233, ${this.opacity})` : `rgba(0, 242, 254, ${this.opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Desenha elipse simulando perspectiva
      ctx.ellipse(this.x, this.y, this.radius, this.radius * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Sistema de Partículas (Estrelas, Folhas, Chuva)
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
        this.y = Math.random() * (height * 0.8);
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
        this.size = Math.random() * 2 + 1; // Espessura
        this.length = Math.random() * 20 + 15; // Altura do traço
        this.speedY = Math.random() * 8 + 12; // Muito rápido
        this.speedX = -2; // Caindo na diagonal
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

        // Ripple no chão (base da tela) ao bater
        if (this.y >= height - 5 - Math.random() * 20) {
          if (ripples.length < 50) {
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
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
      } 
      else if (this.type === 'rain') {
        ctx.strokeStyle = isLightTheme ? 'rgba(14, 165, 233, 0.35)' : 'rgba(0, 242, 254, 0.25)';
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

    // Cria as partículas primárias
    const count = currentWeather === 'rain' ? maxParticles * 1.5 : maxParticles;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(type));
    }
  }

  // Desenha Elementos Celestes Fixos
  function drawSkyDecorations() {
    if (currentWeather === 'rain') return;

    ctx.save();
    if (isLightTheme) {
      // Desenha Sol no Modo Claro
      const solX = width * 0.85;
      const solY = 120;
      const gradient = ctx.createRadialGradient(solX, solY, 10, solX, solY, 90);
      gradient.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
      gradient.addColorStop(0.3, 'rgba(253, 224, 71, 0.5)');
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

  // Loop de Animação Principal (60 FPS)
  function animate() {
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

    // Desenha sol ou lua
    drawSkyDecorations();

    // Desenha nuvens de fundo
    clouds.forEach(c => {
      c.update();
      c.draw();
    });

    // Atualiza e desenha partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const alive = p.update();
      if (!alive) {
        particles.splice(i, 1);
        continue;
      }
      p.draw();
    }

    // Mantém quantidade constante de partículas se não forem temporárias
    let targetCount = currentWeather === 'rain' ? maxParticles * 1.5 : maxParticles;
    let currentPrimary = particles.filter(p => p.type !== 'stardust').length;
    
    if (currentPrimary < targetCount) {
      let type = 'star';
      if (currentWeather === 'rain') type = 'rain';
      else if (isLightTheme) type = 'leaf';
      particles.push(new Particle(type));
    }

    // Atualiza e desenha ripples
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

  // Conectar à API Open-Meteo
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
        // Fallback rápido se falhar totalmente
        currentWeather = 'clear';
        initElements();
      }
    }
  }

  // Inicia carregando clima e dando partida no loop
  fetchWeather();
  animate();
})();
