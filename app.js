// 1. MOTOR GRÁFICO (PARTÍCULAS - ARREGLADO Y ROBUSTO)
const canvas = document.getElementById('cyber-canvas');
const ctx = canvas.getContext('2d');
let cw, ch;
let particles = [];
const mouse = { x: null, y: null, radius: 150 };

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;
    initParticles();
}

class Particle {
    constructor() {
        this.x = Math.random() * cw;
        this.y = Math.random() * ch;
        this.size = Math.random() * 1.5 + 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.velocity = Math.random() * 0.2 + 0.05;
        this.angularVelocity = (Math.random() - 0.5) * 0.01;
    }
    update() {
        this.angle += this.angularVelocity;
        this.x += Math.cos(this.angle) * this.velocity;
        this.y += Math.sin(this.angle) * this.velocity;
        
        if (this.x < -50) this.x = cw + 50; if (this.x > cw + 50) this.x = -50;
        if (this.y < -50) this.y = ch + 50; if (this.y > ch + 50) this.y = -50;
        
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                this.x -= (dx / dist) * force * 1.5;
                this.y -= (dy / dist) * force * 1.5;
            }
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    if(!cw || !ch) return;
    let count = Math.floor((cw * ch) / 12000);
    if(count > 150) count = 150; // Límite para que no explote el ordenador
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function animateCanvas() {
    if(!cw || !ch) {
        requestAnimationFrame(animateCanvas);
        return;
    }
    ctx.clearRect(0, 0, cw, ch);
    for (let i = 0; i < particles.length; i++) { 
        particles[i].update(); 
        particles[i].draw(); 
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 243, 255, ${(1 - dist/120) * 0.15})`; 
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateCanvas);
}

// 2. EFECTO DESENCRIPTADO DEL TÍTULO
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\\\/[]{}—=+*^?#________';
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
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += `<span style="color:#00f3ff;">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}

// 3. BASE DE DATOS LOCAL (WIKILEAKS, NSA, OVNIS)
const baseDeDatos = {
    wikileaks: [
        {
            titulo: "Vault 7: Herramientas de Hacking de la CIA",
            origen: "WIKILEAKS_RELEASE",
            fecha: "2017.03.07",
            resumen: "Publicación de la mayor filtración de documentos confidenciales sobre la CIA, detallando su arsenal de ciberarmas globales.",
            contenidoCompleto: "<p><b>Vault 7</b> es una serie de documentos que WikiLeaks comenzó a publicar el 7 de marzo de 2017, detallando las actividades y capacidades de la Agencia Central de Inteligencia (CIA) de los Estados Unidos para realizar vigilancia electrónica y ciberguerra.</p><br><p>Los archivos demuestran que la CIA poseía un arsenal inmenso de <i>Zero Days</i> (vulnerabilidades no reportadas) para comprometer sistemas Android, iOS, Windows y Linux. Más escalofriante aún fue el programa 'Weeping Angel', que permitía a la CIA infiltrarse en Smart TVs de Samsung, apagando falsamente la pantalla para que los micrófonos internos siguieran grabando audio encubiertamente en las salas de estar de los ciudadanos.</p><br><p>Los documentos también revelaron la existencia del grupo 'UMBRAGE', un equipo que recopilaba tácticas de malware de otros estados (como Rusia o China) para dejar firmas falsas en sus propios hackeos, manipulando así las investigaciones forenses internacionales.</p>"
        },
        {
            titulo: "Collateral Murder: Reglas de Enganche en Irak",
            origen: "WIKILEAKS_RELEASE",
            fecha: "2010.04.05",
            resumen: "Video filtrado clasificado que muestra a helicópteros Apache estadounidenses atacando y matando a civiles y periodistas en Nuevo Bagdad.",
            contenidoCompleto: "<p>En abril de 2010, WikiLeaks publicó un video clasificado de 39 minutos del ejército estadounidense bajo el título <b>Collateral Murder</b> (Asesinato Colateral). Las imágenes, tomadas desde la cámara del cañón de un helicóptero Apache AH-64 en 2007, conmocionaron al mundo.</p><br><p>El video documenta un ataque no provocado a un grupo de personas en las calles de Bagdad, entre las cuales se encontraban dos reporteros de la agencia Reuters: Saeed Chmagh y Namir Noor-Eldeen. Las transmisiones de radio interceptadas en el video muestran a la tripulación riendo e ignorando las reglas de combate para abrir fuego.</p><br><p>La publicación de este documento visual por parte de Julian Assange desencadenó el mayor debate ético sobre la guerra moderna y catapultó a WikiLeaks como la principal organización mundial de disidencia y transparencia.</p>"
        }
    ],
    nsa: [
        {
            titulo: "PRISM: El Programa de Vigilancia Masiva Global",
            origen: "SNOWDEN_LEAKS",
            fecha: "2013.06.06",
            resumen: "Documentos de la NSA revelan que empresas como Google, Apple y Microsoft otorgan acceso directo a sus servidores al gobierno.",
            contenidoCompleto: "<p>En junio de 2013, el analista Edward Snowden filtró documentos altamente clasificados de la Agencia de Seguridad Nacional (NSA), revelando la existencia de <b>PRISM</b>.</p><br><p>PRISM es una herramienta de extracción de datos diseñada para recolectar comunicaciones privadas de usuarios de internet a nivel mundial. Según los documentos filtrados, empresas como Microsoft, Yahoo, Google, Facebook, PalTalk, AOL, Skype, YouTube y Apple formaban parte del programa, permitiendo a la NSA el acceso directo a historiales de búsqueda, correos electrónicos, transferencias de archivos y chats en vivo.</p><br><p>Esta filtración confirmó lo que durante años se había tildado de teoría de la conspiración: el complejo militar-industrial de Estados Unidos espía indiscriminadamente a ciudadanos de todo el mundo sin orden judicial, procesando trillones de bytes de información privada diariamente bajo el pretexto de la lucha contra el terrorismo.</p>"
        },
        {
            titulo: "XKeyscore: Intercepción de fibra óptica marina",
            origen: "SNOWDEN_LEAKS",
            fecha: "2013.07.31",
            resumen: "El sistema secreto de la NSA que permite a los analistas buscar en todo el historial de internet de un individuo sin autorización.",
            contenidoCompleto: "<p>El sistema <b>XKeyscore</b> (XKS) es una pieza de software altamente secreta utilizada por la NSA y sus aliados (los 'Cinco Ojos') para analizar los datos de internet interceptados globalmente a través de cables submarinos de fibra óptica.</p><br><p>Los documentos de entrenamiento internos filtrados presumían de que XKeyscore permitía a cualquier analista acceder a 'casi todo lo que un usuario típico hace en Internet'. Snowden declaró infamemente: <i>'Estando en mi escritorio, podía intervenir el teléfono de cualquier persona, desde usted o su contable hasta un juez federal, e incluso el del Presidente, si tenía su correo electrónico personal.'</i></p><br><p>El sistema registra cada tecla presionada, los sitios web visitados, contraseñas y datos biométricos en tiempo real, almacenándolos en enormes granjas de servidores en el desierto de Utah por un periodo de varios días, listos para ser consultados sin ninguna supervisión judicial externa.</p>"
        }
    ],
    uap: [
        {
            titulo: "El Programa AATIP del Pentágono y los Videos 'Tic Tac'",
            origen: "DEPT_OF_DEFENSE",
            fecha: "2020.04.27",
            resumen: "El Departamento de Defensa de EE.UU. desclasifica oficialmente tres videos de Fenómenos Aéreos No Identificados (UAP) persiguiendo a cazas F/A-18.",
            contenidoCompleto: "<p>Después de años de negativas, el Departamento de Defensa de los Estados Unidos publicó oficialmente tres videos desclasificados capturados por pilotos de la Marina que muestran Fenómenos Aéreos No Identificados (UAP, por sus siglas en inglés, anteriormente conocidos como OVNIs).</p><br><p>Los videos, conocidos popularmente como 'FLIR1', 'Gimbal' y 'GoFast', muestran objetos sin alas, sin escapes de motores térmicos y sin superficies de control de vuelo visibles, acelerando a velocidades hipersónicas y realizando maniobras físicas que destrozarían a cualquier piloto humano (fuerzas G estimadas por encima de 400). El caso más famoso es el del objeto 'Tic Tac' encontrado por el Comandante David Fravor en la costa de San Diego en 2004, que descendió desde 80.000 pies al nivel del mar en segundos.</p><br><p>A esto le siguió la confirmación del programa secreto <b>AATIP</b> (Advanced Aerospace Threat Identification Program), cuyo exdirector, Luis Elizondo, testificó ante el congreso que el gobierno estadounidense posee actualmente metamateriales recuperados de vehículos de origen 'no terrestre'.</p>"
        }
    ]
};

// 4. LÓGICA DE INTERFAZ Y ARRANQUE SEGURO
document.addEventListener('DOMContentLoaded', () => {
    
    // Iniciar gráficos
    resizeCanvas();
    animateCanvas();

    const grid = document.getElementById('jardinDigital');
    const modal = document.getElementById('reader-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const categoryNav = document.getElementById('category-nav');
    const bootScreen = document.getElementById('terminal-loader');
    const progressBar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loader-text');
    let isAnimating = false;

    // Configuración del modal
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    window.abrirArticulo = function(cat, index) {
        if(!baseDeDatos[cat] || !baseDeDatos[cat][index]) return;
        const art = baseDeDatos[cat][index];
        document.getElementById('reader-title').innerText = art.titulo;
        document.getElementById('reader-meta').innerText = `[FUENTE_FILTRACIÓN: ${art.origen}] | [FECHA: ${art.fecha}]`;
        document.getElementById('reader-content').innerHTML = art.contenidoCompleto;
        modal.classList.remove('hidden');
    };

    function renderizarCategoria(categoria) {
        grid.innerHTML = '';
        
        if (categoria === 'inicio') {
            grid.style.display = "block";
            grid.innerHTML = `
                <div style="text-align: center; padding: 50px 20px; max-width: 800px; margin: 0 auto;">
                    <h1 style="font-family: 'Rajdhani', sans-serif; font-size: 2.8rem; color: #fff; margin-bottom: 20px; text-shadow: 0 0 10px #00f3ff;">SISTEMA.CERO [MODO OFFLINE]</h1>
                    <p style="font-family: 'Space Mono', monospace; font-size: 1.1rem; line-height: 1.8; color: #a0b2c6;">Para evadir rastreadores gubernamentales, esta terminal ha sido desconectada de la red global.</p>
                    <p style="font-family: 'Space Mono', monospace; font-size: 1.1rem; line-height: 1.8; margin-top: 15px; color: #a0b2c6;">Los documentos clasificados que verás a continuación están pre-cargados en la memoria caché local. Navega sin dejar rastro.</p>
                    <div style="margin-top: 40px; padding: 20px; border: 1px dashed #ff003c; background: rgba(255, 0, 60, 0.05); display: inline-block;">
                        <p style="color: #ff003c; font-weight:bold; font-family: 'Share Tech Mono', monospace;">SELECCIONE UNA CARPETA EN EL MENÚ SUPERIOR.</p>
                    </div>
                </div>
            `;
            return;
        }

        grid.style.display = "grid";
        const articulos = baseDeDatos[categoria];
        
        if(articulos) {
            articulos.forEach((art, index) => {
                grid.innerHTML += `
                    <article class="article-card" onclick="abrirArticulo('${categoria}', ${index})">
                        <div class="card-meta">
                            <span style="color: #00f3ff; font-weight:bold;">${art.origen}</span>
                            <span>${art.fecha}</span>
                        </div>
                        <h2 class="card-title">${art.titulo}</h2>
                        <p class="card-excerpt">${art.resumen}</p>
                        <span style="margin-top: 15px; color: #00ff41; font-size: 0.8rem; font-weight: bold;">> DESENCRIPTAR ARCHIVO_</span>
                    </article>
                `;
            });
        }
    }

    const navBtns = document.querySelectorAll('.cyber-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(isAnimating) return;
            isAnimating = true;

            navBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            grid.style.opacity = 0;
            setTimeout(() => {
                renderizarCategoria(e.currentTarget.getAttribute('data-category'));
                grid.style.opacity = 1;
                isAnimating = false;
            }, 300);
        });
    });

    // Iniciar animación del título superior
    const decrypter = new TextScramble(document.getElementById('motto'));
    setTimeout(() => { 
        decrypter.setText("La información quiere ser libre. Todo lo que te ocultan, está aquí."); 
    }, 500);

    // Secuencia de carga falsa para dar ambiente Hacker
    let progreso = 0;
    setTimeout(() => loadingText.innerHTML += "<br>> BYPASSING FIREWALL...", 600);
    setTimeout(() => loadingText.innerHTML += "<br>> EXTRAYENDO CACHÉ DE WIKILEAKS...", 1200);

    const intervalo = setInterval(() => {
        progreso += Math.random() * 20;
        if(progreso >= 100) {
            progreso = 100;
            progressBar.style.width = '100%';
            clearInterval(intervalo);
            
            setTimeout(() => {
                bootScreen.classList.add('hidden');
                categoryNav.classList.remove('hidden');
                grid.classList.remove('hidden');
                renderizarCategoria('inicio');
            }, 600);
        } else {
            progressBar.style.width = progreso + '%';
        }
    }, 250);
});
