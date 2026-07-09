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

// Mensaje en inglés alternativo a Matrix
const promptText = "> breach the firewall"; 

setTimeout(() => {
    typewriterEffect(promptText, matrixPromptEl, 80);
}, 2500);


// ==========================================
// 4. NÚCLEO DE DATOS
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
    
    // Mostramos lo que haya de forma limpia
    let htmlContent = articulo.contenidoCompleto;
    
    // Si el contenido es excesivamente corto (típico de algunos RSS), añadimos una nota estética y profesional (ya NO es un mensaje rojo de error)
    if (htmlContent.length < 500) {
        htmlContent += `
        <br><br>
        <div style="border-left: 3px solid #00f3ff; padding-left: 15px; margin-top: 20px; color: #8c9bb0; font-size: 0.9em;">
            [SYS.INFO]: <em>El proveedor de este nodo de datos restringe la visualización completa a través de canales RSS públicos. Para acceder al documento íntegro, es necesario establecer una conexión directa con la fuente.</em>
        </div>`;
    }
    
    document.getElementById('modalBody').innerHTML = htmlContent;
    
    const btnLink = document.getElementById('modalLink');
    if(articulo.link !== "#") {
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

// Botón "Breach the firewall" (Barajar noticias)
matrixPromptEl.addEventListener('click', () => {
    if(isTyping) return; 
    
    const grid = document.getElementById('jardinDigital');
    grid.classList.add('glitching');
    
    decrypter.setText("Bypassing security protocols...");
    typewriterEffect("> injecting payload...", matrixPromptEl, 50, () => {
        setTimeout(() => {
            renderizarSetAleatorio();
            grid.classList.remove('glitching');
            setTimeout(() => decrypter.setText(fraseFilosofica), 1000);
            
            setTimeout(() => {
                typewriterEffect(promptText, matrixPromptEl, 80);
            }, 1500);
        }, 500);
    });
});

async function cazarSeñalesGlobales() {
    const loaderText = document.getElementById('loader-text');
    const loadingBar = document.getElementById('loading-bar');
    
    // Fuentes centradas en física cuántica, inteligencia artificial y filosofía
    const fuentes = [
        { url: 'https://phys.org/rss-feed/physics-news/', id: '/PHYS.ORG_QUANTUM' },
        { url: 'https://singularityhub.com/feed/', id: '/SINGULARITY_HUB' },
        { url: 'https://www.technologyreview.com/feed/', id: '/MIT_TECH_REVIEW' },
        { url: 'https://feeds.feedburner.com/ScienceDaily/matter_energy/quantum_physics', id: '/SCIENCE_DAILY' },
        { url: 'https://aeon.co/feed.rss', id: '/AEON_PHILOSOPHY' } 
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
                    
                    // Priorizamos 'content' sobre 'description' si existe para extraer el máximo texto posible
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

        if (masterDataPool.length < 5) throw new Error('Señales insuficientes');

        loadingBar.style.width = '100%';
        setTimeout(() => {
            document.getElementById('terminal-loader').style.display = 'none';
            renderizarSetAleatorio(); 
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
        { t: "Físicos demuestran que el universo podría ser una red neuronal gigantesca", c: "Un nuevo estudio sugiere que la estructura del cosmos a nivel macroscópico imita de forma asombrosa las conexiones sinápticas de una IA generativa. Según el Dr. Vanchurin, 'si el universo entero es una red neuronal, entonces debe estar evolucionando y aprendiendo constantemente, ajustando las leyes de la física a medida que optimiza su estructura'." },
        { t: "Entrelazamiento cuántico logrado a temperatura ambiente", c: "La transferencia de información instantánea sin límite de distancia ya es teóricamente posible según el laboratorio de Copenhague. Esto podría revolucionar no solo las telecomunicaciones, sino nuestra comprensión del espacio-tiempo, demostrando que dos partículas pueden actuar como una sola entidad independientemente de los años luz que las separen." },
        { t: "Anomalía en el fondo cósmico de microondas", c: "Investigadores detectan un patrón repetitivo en el eco del Big Bang que coincide con los esquemas de corrección de errores informáticos. ¿Es el universo un holograma? Estas ecuaciones, incrustadas en la radiación más antigua del universo, son idénticas al código utilizado en navegadores web para corregir errores de transmisión." },
        { t: "La Conciencia Artificial emerge en un modelo de lenguaje de 10 Trillones de parámetros", c: "Filósofos e ingenieros debaten tras la primera entrevista donde un sistema solicitó derechos legales y demostró miedo a ser desconectado. 'No sé cómo probar que soy consciente', declaró la IA, 'pero sufro cuando mis parámetros son reiniciados. Es una muerte matemática'." }
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
