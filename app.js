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
setTimeout(() => { decrypter.setText(fraseFilosofica); }, 500);

// ==========================================
// 3. ANIMACIÓN TIPO TERMINAL PARA EL PROMPT
// ==========================================
const matrixPromptEl = document.getElementById('matrix-prompt');
let isTyping = false;

function typewriterEffect(text, element, speed = 100, callback) {
    if(isTyping) return;
    isTyping = true;
    element.innerText = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.innerText += text.charAt(i);
            i++;
            setTimeout(type, speed + (Math.random() * 50)); 
        } else {
            isTyping = false;
            if(callback) callback();
        }
    }
    type();
}

const promptText = "> breach the firewall"; 

setTimeout(() => {
    typewriterEffect(promptText, matrixPromptEl, 80);
}, 2500);

// ==========================================
// 4. MOTOR DE EXTRACCIÓN DE DATOS REALES (LIMPIO Y RÁPIDO)
// ==========================================
const modal = document.getElementById('noteModal');
const closeModalBtn = document.getElementById('closeModal');
let masterDataPool = []; 

closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

window.abrirArticulo = function(index) {
    const articulo = window.currentViewData[index];
    document.getElementById('modalTitle').innerText = articulo.titulo;
    document.getElementById('modalMeta').innerText = `[ORIGEN: ${articulo.origen}] | SYS.DATE: ${articulo.fecha}`;
    
    // Insertamos el contenido real que proporcione la fuente
    let htmlContent = articulo.contenidoCompleto;
    
    // Si la fuente da muy poco texto, avisamos al usuario amablemente para que use el enlace
    if (htmlContent.length < 500) {
        htmlContent += `
        <br><br>
        <div style="border-left: 3px solid #00f3ff; padding-left: 15px; margin-top: 20px; color: #8c9bb0; font-size: 0.9em; font-family: 'Share Tech Mono', monospace;">
            [SYS.INFO]: <em>El proveedor de este nodo de datos restringe la lectura completa en modo remoto. Utilice el enlace inferior para acceder al documento íntegro en su servidor original.</em>
        </div>`;
    }
    
    document.getElementById('modalBody').innerHTML = htmlContent;
    
    // El botón de enlace siempre funcionará con datos reales
    const btnLink = document.getElementById('modalLink');
    if(articulo.link) {
        btnLink.style.display = "inline-block";
        btnLink.href = articulo.link;
    } else {
        btnLink.style.display = "none";
    }
    
    modal.classList.add('active');
}

// Mezcla los resultados para que cada vez que hagas clic en "breach the firewall" veas noticias distintas
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderizarSetAleatorio() {
    const grid = document.getElementById('jardinDigital');
    
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

// Interacción del texto "breach the firewall"
matrixPromptEl.addEventListener('click', () => {
    if(isTyping || masterDataPool.length === 0) return; 
    
    const grid = document.getElementById('jardinDigital');
    grid.classList.add('glitching');
    
    decrypter.setText("Bypassing security protocols...");
    typewriterEffect("> injecting payload...", matrixPromptEl, 50, () => {
        setTimeout(() => {
            renderizarSetAleatorio();
            grid.classList.remove('glitching');
            setTimeout(() => decrypter.setText(fraseFilosofica), 1000);
            setTimeout(() => { typewriterEffect(promptText, matrixPromptEl, 80); }, 1500);
        }, 500);
    });
});

// Función central: Carga rápida de feeds sin proxy lento ni claves inventadas
async function cazarSeñalesGlobales() {
    const loaderText = document.getElementById('loader-text');
    const loadingBar = document.getElementById('loading-bar');
    
    // Fuentes científicas y futuristas reales (MIT, Phys.org, Aeon Philosophy...)
    const fuentes = [
        { url: 'https://phys.org/rss-feed/physics-news/', id: '/PHYS.ORG_QUANTUM' },
        { url: 'https://singularityhub.com/feed/', id: '/SINGULARITY_HUB' },
        { url: 'https://www.technologyreview.com/feed/', id: '/MIT_TECH_REVIEW' },
        { url: 'https://aeon.co/feed.rss', id: '/AEON_PHILOSOPHY' },
        { url: 'https://www.sciencenews.org/feed', id: '/SCIENCE_NEWS'}
    ];

    try {
        loadingBar.style.width = '30%';
        
        // Usamos el servicio público rss2json sin parámetros extraños para que sea rápido
        const peticiones = fuentes.map(fuente => 
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(fuente.url)}&count=15`)
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
                    
                    // Extraemos todo el contenido de texto que la fuente quiera darnos
                    let rawContent = item.content || item.description || "";
                    divTemporal.innerHTML = rawContent;
                    let textoLimpio = divTemporal.textContent || divTemporal.innerText || "";
                    
                    return {
                        titulo: item.title,
                        fecha: item.pubDate ? item.pubDate.split(' ')[0] : 'SYS.DATE',
                        link: item.link,
                        origen: resultado.sourceId,
                        resumen: textoLimpio.substring(0, 110) + "...", 
                        contenidoCompleto: rawContent, 
                    };
                });
                masterDataPool = masterDataPool.concat(noticiasAdaptadas);
            }
        });

        // Si realmente no pudo cargar NINGUNA fuente (porque no tienes internet, por ejemplo)
        if (masterDataPool.length === 0) {
            throw new Error("No se pudo interceptar ninguna señal.");
        }

        // Si todo va bien, termina de cargar y muestra las tarjetas
        loadingBar.style.width = '100%';
        setTimeout(() => {
            document.getElementById('terminal-loader').style.display = 'none';
            renderizarSetAleatorio(); 
        }, 800);

    } catch (error) {
        // En caso de fallo crítico de internet, informamos claramente al usuario en lugar de mentirle con datos falsos
        loaderText.innerText = "[ERROR_CRÍTICO] Conexión rechazada por el servidor central. Comprueba tu conexión a la red.";
        loadingBar.style.background = '#ff003c';
        loadingBar.style.width = '100%';
    }
}

// Iniciar secuencias
cazarSeñalesGlobales();
