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
// 2. SISTEMA DE INTERCEPCIÓN DE DATOS MASIVO
// ==========================================
const modal = document.getElementById('noteModal');
const closeModalBtn = document.getElementById('closeModal');
window.articulosData = [];

closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

window.abrirArticulo = function(index) {
    const articulo = window.articulosData[index];
    document.getElementById('modalTitle').innerText = articulo.titulo;
    document.getElementById('modalMeta').innerText = `[NODO: ${articulo.origen}] | SYS.DATE: ${articulo.fecha}`;
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

// Pinta el enjambre de tarjetas (Hasta 24)
function renderizarTarjetas() {
    const grid = document.getElementById('jardinDigital');
    grid.innerHTML = ''; 
    
    // Mostramos las primeras 24 para llenar bien la pantalla
    const enjambre = window.articulosData.slice(0, 24);

    enjambre.forEach((articulo, index) => {
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

// Intercepta señales de Múltiples Fuentes Globales
async function cazarSeñalesMultiples() {
    const loaderText = document.getElementById('loader-text');
    const loadingBar = document.getElementById('loading-bar');
    
    // Lista expandida de fuentes futuristas/tecnológicas
    const fuentes = [
        { url: 'https://www.reddit.com/r/singularity/.rss', id: '/SINGULARITY' },
        { url: 'https://www.reddit.com/r/Cyberpunk/.rss', id: '/CYBERPUNK' },
        { url: 'https://hnrss.org/frontpage', id: '/HACKER_NEWS' },
        { url: 'https://futurism.com/feed', id: '/FUTURISM' },
        { url: 'https://www.microsiervos.com/index.xml', id: '/MICROSIERVOS' }
    ];

    try {
        let todasLasNoticias = [];
        loadingBar.style.width = '20%';
        loaderText.innerText = "[sys.log] Hackeando nodos de información globales...";

        // Realizamos peticiones masivas
        const peticiones = fuentes.map(fuente => 
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(fuente.url)}`)
            .then(res => res.json())
            .then(data => ({ sourceId: fuente.id, data: data }))
            .catch(() => null)
        );

        const resultados = await Promise.all(peticiones);
        loadingBar.style.width = '80%';
        loaderText.innerText = "[sys.log] Procesando enjambre de datos...";

        // Agrupamos y limpiamos los datos obtenidos
        resultados.forEach(resultado => {
            if (resultado && resultado.data.status === 'ok' && resultado.data.items) {
                const noticiasAdaptadas = resultado.data.items.map(item => {
                    let divTemporal = document.createElement("div");
                    divTemporal.innerHTML = item.description || item.content || "";
                    let textoLimpio = divTemporal.textContent || divTemporal.innerText || "";
                    
                    return {
                        titulo: item.title,
                        fecha: item.pubDate ? item.pubDate.split(' ')[0] : 'RAW_DATA',
                        link: item.link,
                        origen: resultado.sourceId,
                        // Resumen más corto (80 chars) para encajar en tarjetas pequeñas
                        resumen: textoLimpio.substring(0, 80) + "...", 
                        contenidoCompleto: item.content || item.description || textoLimpio,
                        timestamp: item.pubDate ? new Date(item.pubDate).getTime() : 0
                    };
                });
                todasLasNoticias = todasLasNoticias.concat(noticiasAdaptadas);
            }
        });

        // Ordenamos cronológicamente (las más nuevas primero)
        todasLasNoticias.sort((a, b) => b.timestamp - a.timestamp);

        if (todasLasNoticias.length < 10) throw new Error('Señales insuficientes');

        loadingBar.style.width = '100%';
        setTimeout(() => {
            document.getElementById('terminal-loader').style.display = 'none';
            window.articulosData = todasLasNoticias;
            renderizarTarjetas();
        }, 500);

    } catch (error) {
        loaderText.classList.add('warning-text');
        loaderText.innerText = "[ALERTA] Protocolos externos bloqueados. Desplegando enjambre de respaldo...";
        loadingBar.style.background = '#ff003c';
        
        setTimeout(() => {
            document.getElementById('terminal-loader').style.display = 'none';
            window.articulosData = generarEnjambreRespaldo();
            renderizarTarjetas();
        }, 1500);
    }
}

// Enjambre masivo simulado (24 tarjetas de emergencia)
function generarEnjambreRespaldo() {
    const titulos = [
        "Fuga en AGI-7", "Deepfakes Letales", "El Olvido Digital", "Anomalía Neuralink", 
        "Drones Autónomos", "Colapso del Metaverso", "Justicia Algorítmica", "Fin del Trabajo Creativo", 
        "Censura Cuántica", "Biotecnología Rebelde", "Guerra de Silicio", "Paranoia Sintética"
    ];
    
    let backup = [];
    // Generamos 24 tarjetas iterando sobre los títulos y añadiendo IDs falsos para que se vea masivo
    for(let i = 0; i < 24; i++) {
        let tIndex = i % titulos.length;
        backup.push({
            titulo: `${titulos[tIndex]} [SEC-${Math.floor(Math.random() * 999)}]`,
            fecha: `2026-ERR-${Math.floor(Math.random() * 99)}`,
            link: "#",
            origen: "/SYS_ARCHIVE",
            resumen: "Fragmento corrupto interceptado. Proceda con precaución. El sistema central ha bloqueado el acceso al nodo...",
            contenidoCompleto: "<p>ACCESO DENEGADO. Nivel de autorización insuficiente para leer el reporte completo en este nodo.</p>"
        });
    }
    return backup;
}

// Iniciar
cazarSeñalesMultiples();
