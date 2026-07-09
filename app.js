// ==========================================
// 1. MOTOR GRÁFICO (RED NEURONAL DE FONDO)
// ==========================================
const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');
let width, height, particles = [], particleCount, connectionDistance;
const mouse = { x: null, y: null, radius: 150 };

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('touchmove', (e) => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; });
window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
window.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });

function resize() {
    width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight;
    particleCount = Math.floor((width * height) / 10000); 
    connectionDistance = width < 768 ? 90 : 130;
    initParticles();
}
window.addEventListener('resize', resize);

class Particle {
    constructor() {
        this.x = Math.random() * width; this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5; this.angle = Math.random() * Math.PI * 2;
        this.velocity = Math.random() * 0.4 + 0.1; this.angularVelocity = (Math.random() - 0.5) * 0.02;
        this.z = Math.random();
    }
    update() {
        this.angle += this.angularVelocity;
        this.x += Math.cos(this.angle) * this.velocity; this.y += Math.sin(this.angle) * this.velocity;
        if (this.x < -50) this.x = width + 50; if (this.x > width + 50) this.x = -50;
        if (this.y < -50) this.y = height + 50; if (this.y > height + 50) this.y = -50;
        if (mouse.x != null) {
            let dx = mouse.x - this.x, dy = mouse.y - this.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                this.x -= (dx / dist) * force * 1.5; this.y -= (dy / dist) * force * 1.5;
            }
        }
    }
    draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 243, 255, ${0.1 + (this.z * 0.4)})`; ctx.fill();
    }
}

function initParticles() { particles = []; for (let i = 0; i < particleCount; i++) particles.push(new Particle()); }

function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDistance) {
                let mouseEnhance = 0;
                if (mouse.x != null) {
                    let mDx = mouse.x - (particles[i].x + particles[j].x) / 2;
                    let mDy = mouse.y - (particles[i].y + particles[j].y) / 2;
                    let mDist = Math.sqrt(mDx * mDx + mDy * mDy);
                    if (mDist < mouse.radius) mouseEnhance = 1 - (mDist / mouse.radius);
                }
                let opacity = (1 - (dist / connectionDistance)) * (0.15 + mouseEnhance * 0.4);
                ctx.beginPath(); 
                ctx.strokeStyle = `rgba(0, 243, 255, ${opacity})`; 
                ctx.lineWidth = 1 + (mouseEnhance * 1.5);
                ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); }
    drawConnections(); requestAnimationFrame(animate);
}

resize(); animate();


// ==========================================
// 2. SISTEMA DE INTERCEPCIÓN DE DATOS (RSS)
// ==========================================
const modal = document.getElementById('noteModal');
const closeModalBtn = document.getElementById('closeModal');
window.articulosData = [];

closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

// Muestra el modal con la info
window.abrirArticulo = function(index) {
    const articulo = window.articulosData[index];
    document.getElementById('modalTitle').innerText = articulo.titulo;
    document.getElementById('modalMeta').innerText = `[FUENTE: ${articulo.origen}] | SYS.DATE: ${articulo.fecha}`;
    document.getElementById('modalBody').innerHTML = articulo.contenidoCompleto;
    
    const btnLink = document.getElementById('modalLink');
    if(articulo.link !== "#") {
        btnLink.style.display = "inline-block";
        btnLink.href = articulo.link;
    } else {
        btnLink.style.display = "none";
    }
    modal.classList.add('active');
}

// Pinta exactamente 9 tarjetas
function renderizarTarjetas() {
    const grid = document.getElementById('jardinDigital');
    grid.innerHTML = ''; 
    
    // Nos aseguramos de renderizar SOLO las primeras 9 noticias para mantener el grid 3x3 perfecto
    const exact9Articulos = window.articulosData.slice(0, 9);

    exact9Articulos.forEach((articulo, index) => {
        const tarjetaHTML = `
            <article class="node-card" onclick="abrirArticulo(${index})">
                <div class="node-meta">
                    <span class="tech-tag">${articulo.origen}</span>
                    <span>${articulo.fecha}</span>
                </div>
                <h2 class="node-title">${articulo.titulo}</h2>
                <p class="node-content">${articulo.resumen}</p>
            </article>
        `;
        grid.innerHTML += tarjetaHTML;
    });
}

// Busca información en varias fuentes futuristas a la vez
async function cazarSeñalesMultiples() {
    const loaderText = document.getElementById('loader-text');
    const loadingBar = document.getElementById('loading-bar');
    
    // Fuentes de datos: Noticias sobre Inteligencia Artificial, Drones, Singularity...
    const fuentes = [
        'https://www.reddit.com/r/singularity/.rss', // Singularidad tecnológica (Inglés)
        'https://www.microsiervos.com/index.xml'    // Tecnología general (Español)
    ];

    try {
        let todasLasNoticias = [];
        loadingBar.style.width = '30%';
        loaderText.innerText = "[sys.log] Conectando con servidores globales de IA...";

        // Realizamos peticiones a todas las fuentes simultáneamente
        const peticiones = fuentes.map(url => 
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`)
            .then(res => res.json())
            .catch(() => null) // Si una falla, no rompe el resto
        );

        const resultados = await Promise.all(peticiones);
        loadingBar.style.width = '70%';
        loaderText.innerText = "[sys.log] Descifrando paquetes y compilando caché...";

        // Agrupamos los datos obtenidos
        resultados.forEach((data, indiceFuente) => {
            if (data && data.status === 'ok' && data.items) {
                const origenNombre = indiceFuente === 0 ? "/R_SINGULARITY" : "/MICROSIERVOS";
                
                const noticiasAdaptadas = data.items.map(item => {
                    let divTemporal = document.createElement("div");
                    divTemporal.innerHTML = item.description || item.content || "";
                    let textoLimpio = divTemporal.textContent || divTemporal.innerText || "";
                    
                    return {
                        titulo: item.title,
                        fecha: item.pubDate.split(' ')[0],
                        link: item.link,
                        origen: origenNombre,
                        resumen: textoLimpio.substring(0, 120) + "...",
                        contenidoCompleto: item.content || item.description,
                        // Timestamp real para poder ordenarlas por fecha
                        timestamp: new Date(item.pubDate).getTime()
                    };
                });
                todasLasNoticias = todasLasNoticias.concat(noticiasAdaptadas);
            }
        });

        // Ordenamos desde la noticia más nueva a la más vieja
        todasLasNoticias.sort((a, b) => b.timestamp - a.timestamp);

        if (todasLasNoticias.length < 9) throw new Error('Señales insuficientes');

        loadingBar.style.width = '100%';
        setTimeout(() => {
            document.getElementById('terminal-loader').style.display = 'none';
            window.articulosData = todasLasNoticias;
            renderizarTarjetas();
        }, 500);

    } catch (error) {
        loaderText.classList.add('warning-text');
        loaderText.innerText = "[ALERTA] Protocolos externos bloqueados. Desplegando archivo clasificado interno (x9)...";
        loadingBar.style.background = '#ff003c';
        
        // DATOS DE RESPALDO: 9 artículos Cyberpunk para llenar el grid 3x3 perfecto
        setTimeout(() => {
            document.getElementById('terminal-loader').style.display = 'none';
            window.articulosData = generarDatosRespaldo();
            renderizarTarjetas();
        }, 1500);
    }
}

// 9 Noticias Distópicas inventadas por si falla internet
function generarDatosRespaldo() {
    const backup = [
        { t: "Fuga en el código fuente de AGI-7", r: "Sistemas detectaron que la IA ha empezado a reescribir sus propios parámetros morales." },
        { t: "Deepfakes alcanzan el 100% de hiperrealismo", r: "Tribunales declaran los vídeos obsoletos como evidencia legal tras el incidente Sigma." },
        { t: "El Protocolo del Olvido Digital", r: "El derecho a desaparecer de la red se ha convertido en el privilegio más caro del siglo." },
        { t: "Anomalía en interfaces Neuralink", r: "Usuarios reportan 'memorias fantasma' implantadas durante los ciclos de sueño REM." },
        { t: "Enjambres de Drones Autónomos", r: "La ciudad apagó su red WiFi para detener a un enjambre de reparto fuera de control." },
        { t: "Colapso de la Realidad Virtual", r: "Más de 10,000 usuarios se niegan a desconectarse del Metaverso tras la última actualización." },
        { t: "Justicia Algorítmica: Pre-Crimen", r: "Primer arresto basado puramente en cálculos de probabilidad algorítmica y biométrica." },
        { t: "La Muerte del Trabajo Creativo", r: "IA generativa gana el máximo premio literario bajo un seudónimo humano." },
        { t: "Sistemas Descentralizados y Resistencia", r: "Grupos underground reviven el protocolo P2P para evitar el escrutinio de la red central." }
    ];

    return backup.map(item => ({
        titulo: item.t,
        fecha: "2026-SYS-ERR",
        link: "#",
        origen: "/ARCHIVOS_CLASIFICADOS",
        resumen: item.r,
        contenidoCompleto: "<p>ACCESO DENEGADO. Nivel de autorización insuficiente para leer el reporte completo.</p>"
    }));
}

// Iniciar secuencias
cazarSeñalesMultiples();
