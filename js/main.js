// Dicionário de Traduções Completas
const translations = {
  pt: {
    nav_about: "Sobre Mim",
    nav_areas: "Áreas de Foco",
    nav_projects: "Projetos",
    hero_badge: "🟢 Buscando Estágio em Desenvolvimento de Software",
    hero_title: "Transformando lógica em soluções de impacto",
    hero_subtitle: "Estudante de Engenharia de Software na UCB focado em construir aplicações de alta performance e bases computacionais sólidas em qualquer área.",
    hero_cta: "Entre em contato",
    hero_cv: "📄 Visualização de Currículo",
    modal_title: "Visualização de Currículo",
    modal_print_btn: "Imprimir / Salvar PDF",
    about_title: "Sobre Mim",
    about_text_1: "Minha jornada em Engenharia de Software na Universidade Católica de Brasília (UCB) é focada em dominar os fundamentos computacionais primários e a capacidade de resolver problemas reais de ponta a ponta.",
    about_text_2: "Acredito na polivalência e na flexibilidade técnica. Estudo desde o baixo nível com C/C++ (para compreender alocação dinâmica e gerenciamento manual de recursos) até a arquitetura backend moderna baseada em microsserviços e APIs com Java e Spring Boot, além do desenvolvimento de interfaces ricas com React, TypeScript e Tailwind CSS. Estou 100% preparado e motivado para atuar em qualquer área de programação.",
    quick_univ: "Universidade",
    quick_course: "Engenharia de Software • Bacharelado",
    quick_objective: "Objetivo",
    quick_objective_title: "Estágio em Programação",
    quick_objective_desc: "Disponibilidade imediata para Front-End, Back-End, DevOps ou Sistemas.",
    quick_location: "Localização",
    quick_location_desc: "Oportunidades presenciais, híbridas ou remotas.",
    areas_section_title: "Áreas de Foco para Estágio",
    areas_section_subtitle: "Domínio e flexibilidade para atuar com excelência em todo o ciclo de desenvolvimento de software.",
    area_backend_title: "Desenvolvimento Back-End",
    area_backend_desc: "Construção de APIs escaláveis, arquitetura em camadas e integração resiliente com bancos de dados relacionais.",
    area_frontend_title: "Desenvolvimento Front-End",
    area_frontend_desc: "Criação de interfaces web pixel-perfect, design responsivo e gerenciamento de estado de alto desempenho.",
    area_systems_title: "Sistemas & Baixo Nível",
    area_systems_desc: "Otimização de algoritmos complexos, estruturas de dados e controle estrito de memória física com C++.",
    area_devops_title: "DevOps & Containers",
    area_devops_desc: "Conteinerização total de ecossistemas locais, automação de setups e orquestração ágil com Docker.",
    area_ai_title: "Integração de IA",
    area_ai_desc: "Implementação de assistentes de voz inteligentes, Speech APIs e automações orientadas a inteligência artificial.",
    areas_section_subtitle: "Domínio e flexibilidade para atuar com excelência em todo o ciclo de desenvolvimento de software.",
    projects_title: "Projetos em Destaque",
    project_view_github: "Ver no GitHub",
    project1_badge: "TypeScript + AI",
    project1_desc: "Assistente inteligente com comandos vocais dinâmicos e controle de mídias integrado.",
    project1_bullet1: "Desenvolveu SPA responsiva em React, TypeScript e Tailwind CSS.",
    project1_bullet2: "Integrou Web Speech API para controle de voz hands-free com 98% de precisão.",
    project1_bullet3: "Tipagem estrita com TypeScript que reduziu bugs em runtime em 95%.",
    project2_badge: "Java + DevOps",
    project2_desc: "Backend de controle acadêmico e matrículas conteinerizado de alta escalabilidade.",
    project2_bullet1: "Modelagem de APIs RESTful usando Java e Spring Boot (Data JPA, Hibernate).",
    project2_bullet2: "Conteinerização completa com Docker e Docker Compose, otimizando o setup em 90%.",
    project2_bullet3: "Integração segura com banco de dados PostgreSQL e consultas otimizadas.",
    project3_badge: "C++ + Algoritmos",
    project3_desc: "Simulador financeiro estruturado offline de alta velocidade.",
    project3_bullet1: "Desenvolvimento estruturado em C++ aplicando conceitos sólidos de POO.",
    project3_bullet2: "Alocação dinâmica de memória e manipulação de ponteiros para otimizar a latência.",
    project3_bullet3: "Persistência local de registros usando manipulação de arquivos físicos binários.",
    contact_title: "Vamos construir algo juntos?",
    contact_subtitle: "Aberto a oportunidades de estágio e colaborações em qualquer área de desenvolvimento de software.",
    nav_certs: "Certificações",
    certs_title: "Cursos & Certificações Recentes",
    certs_subtitle: "Aprimoramento técnico contínuo em IA, Engenharia de Prompts, UI Design e Testes de Software de alta qualidade.",
    cert1_title: "IA Generativa (UCB)",
    cert1_desc: "Trilha acadêmica na Universidade Católica de Brasília focada na aplicação prática de modelos fundacionais de IA, LLMs e orquestração de agentes autônos.",
    cert2_title: "UI Design (Design de Interface) (UCB)",
    cert2_desc: "Trilha acadêmica estudando fundamentos de design visual, layouts fluidos, contraste, tipografia e acessibilidade (WCAG) para interfaces digitais modernas.",
    cert3_title: "Figma Acadêmico (UCB)",
    cert3_desc: "Criação de wireframes, componentização dinâmica com auto-layout, variáveis de design-system e desenvolvimento de protótipos navegáveis de alta fidelidade.",
    cert4_title: "Git e GitHub Colaborativo (UCB)",
    cert4_desc: "Práticas profissionais de versionamento utilizando Git/GitHub em equipe: branch management, Git Flow, Code Review via Pull Requests e CI/CD.",
    cert5_title: "IA Generativa, LLMs & Agentes (DIO)",
    cert5_desc: "Bootcamp extensivo Bradesco na DIO cobrindo engenharia de prompts avançada, fundamentos de LLMs e desenvolvimento de assistentes de IA.",
    cert6_title: "Testes Automatizados com Java & JUnit (DIO)",
    cert6_desc: "Automação rigorosa de testes unitários e de integração utilizando JUnit, Mockito sob TDD e suporte de inteligência artificial.",
    lang_btn: "EN",
  },
  en: {
    nav_about: "About Me",
    nav_areas: "Focus Areas",
    nav_projects: "Projects",
    hero_badge: "🟢 Seeking Software Development Internship",
    hero_title: "Turning logic into high-impact digital solutions",
    hero_subtitle: "Software Engineering student at UCB focused on building high-performance applications and mastering computational foundations in any area.",
    hero_cta: "Get in touch",
    hero_cv: "📄 Resume Preview",
    modal_title: "Resume Preview",
    modal_print_btn: "Print / Save PDF",
    about_title: "About Me",
    about_text_1: "My journey in Software Engineering at the Catholic University of Brasília (UCB) is centered on mastering computer science fundamentals and the ability to solve real-world problems end-to-end.",
    about_text_2: "I believe in polyvalence and technical flexibility. I study from low-level systems with C/C++ (to understand dynamic allocation and manual resource management) to modern backend architecture based on microservices and APIs with Java and Spring Boot, alongside developing rich interfaces with React, TypeScript, and Tailwind CSS. I am 100% prepared and motivated to work in any programming area.",
    quick_univ: "University",
    quick_course: "Software Engineering • Bachelor's",
    quick_objective: "Objective",
    quick_objective_title: "Programming Internship",
    quick_objective_desc: "Immediate availability for Front-End, Back-End, DevOps, or Systems.",
    quick_location: "Location",
    quick_location_desc: "On-site, hybrid, or remote opportunities.",
    areas_section_title: "Internship Focus Areas",
    areas_section_subtitle: "Technical mastery and flexibility to deliver excellence across the entire software development lifecycle.",
    area_backend_title: "Back-End Development",
    area_backend_desc: "Building scalable RESTful APIs, layered architectures, and resilient relational database integrations.",
    area_frontend_title: "Front-End Development",
    area_frontend_desc: "Creating pixel-perfect web interfaces, responsive layouts, and highly performant state management.",
    area_systems_title: "Systems & Low-Level",
    area_systems_desc: "Optimizing complex algorithms, data structures, and strict physical memory control with C++.",
    area_devops_title: "DevOps & Containers",
    area_devops_desc: "Complete containerization of local ecosystems, automated setup provisioning, and orchestration with Docker.",
    area_ai_title: "AI Integration",
    area_ai_desc: "Implementing smart voice assistants, Speech recognition APIs, and artificial intelligence-driven automations.",
    projects_title: "Featured Projects",
    project_view_github: "View on GitHub",
    project1_badge: "TypeScript + AI",
    project1_desc: "AI-integrated assistant with dynamic voice recognition and media controls.",
    project1_bullet1: "Developed a responsive SPA using React, TypeScript, and Tailwind CSS.",
    project1_bullet2: "Integrated Web Speech API for hands-free voice control with 98% accuracy.",
    project1_bullet3: "Strict TypeScript typing that reduced runtime errors by 95%.",
    project2_badge: "Java + DevOps",
    project2_desc: "Containerized and highly scalable academic control and enrollment backend.",
    project2_bullet1: "Modeled RESTful APIs using Java and Spring Boot (Data JPA, Hibernate).",
    project2_bullet2: "Complete containerization with Docker and Compose, optimizing setup time by 90%.",
    project2_bullet3: "Secure integration with PostgreSQL database and query execution planning.",
    project3_badge: "C++ + Algoritmos",
    project3_desc: "High-performance offline terminal banking simulator.",
    project3_bullet1: "Structured C++ development applying robust OOP architecture.",
    project3_bullet2: "Dynamic memory allocation and pointer manipulation to optimize performance.",
    project3_bullet3: "Local data persistence utilizing binary and plain text physical file handling.",
    contact_title: "Let's build something together!",
    contact_subtitle: "Open to internship opportunities and collaborations in any software development field.",
    nav_certs: "Certifications",
    certs_title: "Recent Courses & Certifications",
    certs_subtitle: "Continuous technical advancement in AI, Prompt Engineering, UI Design, and high-quality Software Testing.",
    cert1_title: "Generative AI (UCB)",
    cert1_desc: "Academic track at the Catholic University of Brasília focused on the practical application of foundational AI models, LLMs, and agent orchestration.",
    cert2_title: "UI Design (User Interface) (UCB)",
    cert2_desc: "Academic track studying visual design foundations, responsive layouts, contrast, typography, and web accessibility standards (WCAG) for modern interfaces.",
    cert3_title: "Academic Figma & Prototyping (UCB)",
    cert3_desc: "Creating wireframes, dynamic components with auto-layout, design system variables, and high-fidelity interactive user journey prototypes.",
    cert4_title: "Collaborative Git/GitHub Development (UCB)",
    cert4_desc: "Professional version control practices using Git/GitHub: branch management, Git Flow, team Code Reviews via Pull Requests, and CI/CD.",
    cert5_title: "Generative AI, LLMs & Agents (DIO)",
    cert5_desc: "Bradesco bootcamp at DIO covering advanced prompt engineering, LLM foundations, and AI-driven assistant development.",
    cert6_title: "Automated Testing with Java & JUnit (DIO)",
    cert6_desc: "Rigorous unit and integration test automation utilizing Java, JUnit, Mockito under TDD workflows, supported by artificial intelligence.",
    lang_btn: "PT",
  }
};

let currentLang = 'pt';

// Função de Alternância de Idioma
function toggleLanguage() {
  currentLang = currentLang === 'pt' ? 'en' : 'pt';
  document.documentElement.lang = currentLang === 'pt' ? 'pt-BR' : 'en';
  
  // Traduz os textos marcados com data-i18n
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      elem.innerHTML = translations[currentLang][key];
    }
  });

  // Atualiza o texto do botão de idioma
  document.getElementById('langBtn').textContent = translations[currentLang]['lang_btn'];
}

// Controle de Tema (Modo Escuro / Claro com Ciclo Dia/Noite Automático)
function toggleTheme() {
  const html = document.documentElement;
  const body = document.body;
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');

  const willBeLight = !body.classList.contains('light-theme');

  if (willBeLight) {
    body.classList.add('light-theme');
    html.classList.add('light-theme');
    html.classList.remove('dark');
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light-theme');
    html.classList.remove('light-theme');
    html.classList.add('dark');
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');
    localStorage.setItem('theme', 'dark');
  }

  // Dispara evento global para sincronizar o motor de clima Canvas
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isLight: willBeLight } }));
  
  // Sincroniza o tema com o iframe
  syncIframeTheme();
}

// Sincroniza o tema do modal iframe com o da página principal
function syncIframeTheme() {
  const iframe = document.getElementById('cvIframe');
  if (iframe && iframe.contentDocument) {
    const isLight = document.body.classList.contains('light-theme');
    const iframeBody = iframe.contentDocument.body;
    const iframeHtml = iframe.contentDocument.documentElement;
    if (iframeBody && iframeHtml) {
      if (isLight) {
        iframeBody.classList.add('light-theme');
        iframeHtml.classList.add('light-theme');
        iframeHtml.classList.remove('dark');
      } else {
        iframeBody.classList.remove('light-theme');
        iframeHtml.classList.remove('light-theme');
        iframeHtml.classList.add('dark');
      }
      // Dispara o evento de tema dentro do iframe para o canvas dele atualizar
      iframe.contentWindow.dispatchEvent(new CustomEvent('themeChanged', { detail: { isLight } }));
    }
  }
}

function initTheme() {
  const html = document.documentElement;
  const body = document.body;
  
  let savedTheme = localStorage.getItem('theme');
  
  // Se não houver preferência salva, determina pelo horário local do usuário
  if (!savedTheme) {
    const currentHour = new Date().getHours();
    // Dia: das 6h às 18h
    if (currentHour >= 6 && currentHour < 18) {
      savedTheme = 'light';
    } else {
      savedTheme = 'dark';
    }
  }
  
  const isLight = savedTheme === 'light';
  if (isLight) {
    body.classList.add('light-theme');
    html.classList.add('light-theme');
    html.classList.remove('dark');
  } else {
    body.classList.remove('light-theme');
    html.classList.remove('light-theme');
    html.classList.add('dark');
  }
  
  // Sincroniza os ícones do menu assim que o DOM carregar
  document.addEventListener('DOMContentLoaded', () => {
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    if (isLight) {
      if (sunIcon) sunIcon.classList.remove('hidden');
      if (moonIcon) moonIcon.classList.add('hidden');
    } else {
      if (sunIcon) sunIcon.classList.add('hidden');
      if (moonIcon) moonIcon.classList.remove('hidden');
    }
  });

  // Notifica o Canvas sobre a mudança com um pequeno delay para garantir que ele já registrou os eventos
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isLight } }));
    syncIframeTheme();
  }, 100);
}

// Executa imediatamente para evitar flash visual de tema incorreto
initTheme();

// Funções de Controle do Modal de Currículo
function openCVPreview() {
  const modal = document.getElementById('cvModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Impede scroll de fundo
  }
}

function closeCVPreview() {
  const modal = document.getElementById('cvModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restaura scroll de fundo
  }
}

function printIframeCV() {
  const iframe = document.getElementById('cvIframe');
  if (iframe) {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }
}

// Fechar modal ao clicar fora do container principal
window.addEventListener('click', (e) => {
  const modal = document.getElementById('cvModal');
  if (e.target === modal) {
    closeCVPreview();
  }
});

// Fechar modal com a tecla ESC
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCVPreview();
  }
});

