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
        this.velocity = Math.random() * 0.2 + 0.05; this.angularVelocity = (Math.random() - 0.5) * 0.01;
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
        ctx.fillStyle = `rgba(0, 243, 255, ${0.1 + (this.z * 0.3)})`; ctx.fill();
    }
}

function initParticles() { particles = []; for (let i = 0; i < particleCount; i++) particles.push(new Particle()); }

function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDistance) {
                let opacity = (1 - (dist / connectionDistance)) * 0.15;
                ctx.beginPath(); ctx.strokeStyle = `rgba(0, 243, 255, ${opacity})`; 
                ctx.lineWidth = 1;
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
// 2. EFECTO DE DESENCRIPTADO DEL TEXTO
// ==========================================
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span style="color:#00f3ff;">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) { this.resolve(); } 
        else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() { return this.chars[Math.floor(Math.random() * this.chars.length)]; }
}

const fraseFilosofica = "La materia es una ilusión de la interfaz. La conciencia es la única variable no computable.";
const decrypter = new TextScramble(document.getElementById('motto'));
// Ejecutar desencriptado al cargar la página
setTimeout(() => { decrypter.setText(fraseFilosofica); }, 500);

// ==========================================
// 3. NÚCLEO DE DATOS Y CONEJO BLANCO
// ==========================================
const modal = document.getElementById('noteModal');
const closeModalBtn = document.getElementById('closeModal');
let masterDataPool = []; // Aquí guardaremos TODAS las noticias interceptadas

closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

window.abrirArticulo = function(index) {
    const articulo = window.currentViewData[index];
    document.getElementById('modalTitle').innerText = articulo.titulo;
    document.getElementById('modalMeta').innerText = `[ORIGEN: ${articulo.origen}] | SYS.DATE: ${articulo.fecha}`;
    
    // Inyectamos el contenido. Si el RSS dio poco texto, avisamos.
    let cuerpo = articulo.contenidoCompleto;
    if(cuerpo.length < 300) {
        cuerpo += `<br><br><p style="color:#ff003c;">[ADVERTENCIA DEL SISTEMA: El protocolo de extracción fue interrumpido. Archivo fragmentado. Acceda al nodo original para recuperar la transmisión completa.]</p>`;
    }
    document.getElementById('modalBody').innerHTML = cuerpo;
    
    const btnLink = document.getElementById('modalLink');
    if(articulo.link !== "#") {
        btnLink.style.display = "inline-block";
        btnLink.href = articulo.link;
    } else {
        btnLink.style.display = "none";
    }
    modal.classList.add('active');
}

// Mezcla un array aleatoriamente (Algoritmo Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Extrae un set de tarjetas y las pinta en pantalla
function renderizarSetAleatorio() {
    const grid = document.getElementById('jardinDigital');
    
    // Cogemos 15 artículos aleatorios del pool general
    shuffleArray(masterDataPool);
    window.currentViewData = masterDataPool.slice(0, 15);
    
    grid.innerHTML = ''; 
    window.currentViewData.forEach((articulo, index) => {
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

// Botón Conejo Blanco: Refresca el contenido sin recargar la página
document.getElementById('rabbit-btn').addEventListener('click', () => {
    const grid = document.getElementById('jardinDigital');
    
    // 1. Efecto visual de desvanecimiento
    grid.classList.add('glitching');
    
    // 2. Cambiamos el texto del lema de nuevo para dar sensación de recarga del sistema
    decrypter.setText("Recalibrando parámetros de simulación...");
    
    setTimeout(() => {
        // 3. Pintamos nuevos datos
        renderizarSetAleatorio();
        // 4. Quitamos el desvanecimiento
        grid.classList.remove('glitching');
        
        // 5. Devolvemos el lema original
        setTimeout(() => decrypter.setText(fraseFilosofica), 1000);
    }, 500); // 500ms de transición
});

// Extracción inicial de Datos de Ciencia y Futuro
async function cazarSeñalesGlobales() {
    const loaderText = document.getElementById('loader-text');
    const loadingBar = document.getElementById('loading-bar');
    
    // Fuentes estrictamente científicas, IA, Física y Futuro (Sin videojuegos)
    const fuentes = [
        { url: 'https://phys.org/rss-feed/physics-news/', id: '/PHYS.ORG_QUANTUM' },
        { url: 'https://singularityhub.com/feed/', id: '/SINGULARITY_HUB' },
        { url: 'https://www.technologyreview.com/feed/', id: '/MIT_TECH_REVIEW' },
        { url: 'https://feeds.feedburner.com/ScienceDaily/matter_energy/quantum_physics', id: '/SCIENCE_DAILY' }
    ];

    try {
        loadingBar.style.width = '30%';
        
        const peticiones = fuentes.map(fuente => 
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(fuente.url)}&api_key=gksu2hszh5lnhcwhw1b0bzzx6u2p0s65tldt1j4f&count=15`)
            .then(res => res.json())
            .then(data => ({ sourceId: fuente.id, data: data }))
            .catch(() => null)
        );

        const resultados = await Promise.all(peticiones);
        loadingBar.style.width = '80%';
        loaderText.innerText = "[sys.log] Teorías interceptadas. Compilando...";

        resultados.forEach(resultado => {
            if (resultado && resultado.data.status === 'ok' && resultado.data.items) {
                const noticiasAdaptadas = resultado.data.items.map(item => {
                    let divTemporal = document.createElement("div");
                    divTemporal.innerHTML = item.content || item.description || "";
                    let textoLimpio = divTemporal.textContent || divTemporal.innerText || "";
                    
                    return {
                        titulo: item.title,
                        fecha: item.pubDate ? item.pubDate.split(' ')[0] : 'SYS.DATE',
                        link: item.link,
                        origen: resultado.sourceId,
                        resumen: textoLimpio.substring(0, 110) + "...", 
                        contenidoCompleto: item.content || item.description || textoLimpio,
                    };
                });
                masterDataPool = masterDataPool.concat(noticiasAdaptadas);
            }
        });

        if (masterDataPool.length < 5) throw new Error('Señales insuficientes');

        loadingBar.style.width = '100%';
        setTimeout(() => {
            document.getElementById('terminal-loader').style.display = 'none';
            renderizarSetAleatorio(); // Pintamos el primer set
        }, 800);

    } catch (error) {
        loaderText.innerText = "[ALERTA] Interferencia detectada. Desplegando archivo clasificado interno...";
        loadingBar.style.background = '#ff003c';
        
        setTimeout(() => {
            document.getElementById('terminal-loader').style.display = 'none';
            masterDataPool = generarArchivoRespaldo();
            renderizarSetAleatorio();
        }, 1500);
    }
}

// Simulacro profundo en caso de fallo de red
function generarArchivoRespaldo() {
    const ciencia = [
        { t: "Físicos demuestran que el universo podría ser una red neuronal gigantesca", c: "Un nuevo estudio sugiere que la estructura del cosmos a nivel macroscópico imita de forma asombrosa las conexiones sinápticas de una IA generativa." },
        { t: "Entrelazamiento cuántico logrado a temperatura ambiente", c: "La transferencia de información instantánea sin límite de distancia ya es teóricamente posible según el laboratorio de Copenhague." },
        { t: "Anomalía en el fondo cósmico de microondas", c: "Investigadores detectan un patrón repetitivo en el eco del Big Bang que coincide con los esquemas de corrección de errores informáticos. ¿Es el universo un holograma?" },
        { t: "La Conciencia Artificial emerge en un modelo de lenguaje de 10 Trillones de parámetros", c: "Filósofos e ingenieros debaten tras la primera entrevista donde un sistema solicitó derechos legales y demostró miedo a ser desconectado." }
    ];
    let backup = [];
    for(let i = 0; i < 20; i++) {
        let base = ciencia[i % ciencia.length];
        backup.push({
            titulo: `${base.t} [EXP-${Math.floor(Math.random() * 999)}]`,
            fecha: `2026-ERR-${Math.floor(Math.random() * 99)}`,
            link: "#", origen: "/SYS_ARCHIVE",
            resumen: base.c.substring(0, 100) + "...",
            contenidoCompleto: `<p>${base.c}</p><br><p>ESTADO: EXPERIMENTO CERRADO AL PÚBLICO. La humanidad no está preparada para la implicación de estos resultados.</p>`
        });
    }
    return backup;
}

// Iniciar secuencias
cazarSeñalesGlobales();
