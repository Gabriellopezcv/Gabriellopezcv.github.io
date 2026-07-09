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
// 4. NUEVO MOTOR DE INTERCEPCIÓN (DOBLE PROXY - SIN LÍMITES)
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
    
    // Contenido real interceptado
    let htmlContent = articulo.contenidoCompleto;
    
    // Si la revista ha capado el texto a menos de 500 caracteres, añadimos el mensaje de aviso elegante
    if (htmlContent.length < 500) {
        htmlContent += `
        <br><br>
        <div style="border-left: 3px solid #00f3ff; padding-left: 15px; margin-top: 20px; color: #8c9bb0; font-size: 0.9em; font-family: 'Share Tech Mono', monospace;">
            [SYS.INFO]: <em>El proveedor restringe la lectura remota de este documento. Utilice el enlace inferior para acceder al archivo íntegro en su servidor original.</em>
        </div>`;
    }
    
    document.getElementById('modalBody').innerHTML = htmlContent;
    
    // El botón siempre funciona con la noticia real
    const btnLink = document.getElementById('modalLink');
    if(articulo.link && articulo.link !== "#") {
        btnLink.style.display = "inline-block";
        btnLink.href = articulo.link;
    } else {
        btnLink.style.display = "none";
    }
    
    modal.classList.add('active');
}

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

// Función súper robusta: Intenta 2 proxies distintos y lee el XML nativo.
async function fetchNativeRSS(url, sourceId) {
    const proxies = [
        `https://api.allorigins.win/raw?url=`,
        `https://api.codetabs.com/v1/proxy?quest=`
    ];

    for (let proxy of proxies) {
        try {
            const response = await fetch(proxy + encodeURIComponent(url));
            if (!response.ok) continue;
            
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "text/xml");
            
            // Coge los artículos (algunos XML usan 'item', otros 'entry')
            const items = Array.from(xml.querySelectorAll("item, entry"));
            if (items.length === 0) continue; // Si está vacío, prueba el otro proxy

            return items.map(item => {
                const titulo = item.querySelector("title")?.textContent || "Transmisión Interceptada";
                
                // Buscar el enlace correcto
                const linkEl = item.querySelector("link");
                const link = linkEl ? (linkEl.textContent || linkEl.getAttribute("href")) : "#";
                
                // Buscar fecha
                const fechaRaw = item.querySelector("pubDate, published, updated")?.textContent || "";
                let fecha = "SYS.DATE";
                if (fechaRaw) {
                    const dateObj = new Date(fechaRaw);
                    if (!isNaN(dateObj)) fecha = dateObj.toISOString().split('T')[0];
                }

                // Buscar el contenido más largo que proporcione la web
                const contentEncoded = item.getElementsByTagNameNS("*", "encoded");
                let contenidoHtml = "";
                if (contentEncoded.length > 0) {
                    contenidoHtml = contentEncoded[0].textContent;
                } else {
                    contenidoHtml = item.querySelector("description, content")?.textContent || "";
                }

                // Limpiar HTML para el resumen de la tarjeta
                let tempDiv = document.createElement("div");
                tempDiv.innerHTML = contenidoHtml;
                let resumenLimpio = tempDiv.textContent || tempDiv.innerText || "";

                return {
                    titulo,
                    fecha,
                    link,
                    origen: sourceId,
                    resumen: resumenLimpio.substring(0, 115) + "...",
                    contenidoCompleto: contenidoHtml
                };
            });
        } catch (error) {
            // Falla en silencio y prueba el siguiente proxy
            console.warn(`[SYS] Reintentando conexión para ${sourceId}...`);
        }
    }
    return []; // Si fallan todos, devuelve array vacío
}

async function cazarSeñalesGlobales() {
    const loaderText = document.getElementById('loader-text');
    const loadingBar = document.getElementById('loading-bar');
    
    const fuentes = [
        { url: 'https://phys.org/rss-feed/physics-news/', id: '/PHYS.ORG_QUANTUM' },
        { url: 'https://singularityhub.com/feed/', id: '/SINGULARITY_HUB' },
        { url: 'https://www.technologyreview.com/feed/', id: '/MIT_TECH_REVIEW' },
        { url: 'https://aeon.co/feed.rss', id: '/AEON_PHILOSOPHY' },
        { url: 'https://www.sciencenews.org/feed', id: '/SCIENCE_NEWS'}
    ];

    try {
        loadingBar.style.width = '30%';
        loaderText.innerText = "[sys.log] Estableciendo túneles seguros. Por favor espere...";

        // Ejecutamos las descargas de forma simultánea a través del sistema Doble Proxy
        const promesas = fuentes.map(fuente => fetchNativeRSS(fuente.url, fuente.id));
        const arraysDeNoticias = await Promise.all(promesas);

        loadingBar.style.width = '80%';
        loaderText.innerText = "[sys.log] Teorías interceptadas. Compilando en matriz local...";

        arraysDeNoticias.forEach(array => {
            if (array && array.length > 0) {
                masterDataPool = masterDataPool.concat(array);
            }
        });

        // Solo saltará a error si LITERALMENTE no tienes internet o han caído todos los servidores
        if (masterDataPool.length === 0) {
            throw new Error('Corte de red');
        }

        loadingBar.style.width = '100%';
        setTimeout(() => {
            document.getElementById('terminal-loader').style.display = 'none';
            renderizarSetAleatorio(); 
        }, 800);

    } catch (error) {
        // CERO noticias falsas. Si hay un error real de internet, te lo dice honestamente.
        loaderText.innerText = "[ERROR_CRÍTICO] Conexión rechazada. Protocolos externos bloqueados temporalmente. Comprueba tu red.";
        loadingBar.style.background = '#ff003c';
        loadingBar.style.width = '100%';
    }
}

// Iniciar secuencias
cazarSeñalesGlobales();
