// ==========================================
// 1. BASE DE DATOS DEL SISTEMA (TUS DATOS PERSONALES)
// ==========================================
// Aquí es donde tú editas tu web. Todo está en este archivo. Cambia los textos por los tuyos.

const systemData = {
    "inicio": `
        <h2>> INICIALIZANDO SECUENCIA_</h2>
        <p>Bienvenido al Sistema.Cero. La realidad es una alucinación consensuada, pero los datos aquí contenidos son absolutos.</p>
        <p>Este nodo funciona como un repositorio central de archivos, proyectos e interceptaciones. Seleccione una ruta en el menú superior para acceder a los bloques de memoria asignados.</p>
        <br>
        <h3 style="color: #ff003c;">[ ADVERTENCIA ]</h3>
        <p>Tus recuerdos no son tuyos, son solo datos guardados en caché. Procede con precaución por la red.</p>
    `,
    "habilidades": `
        <h2>> EXTRACCIÓN DE ESPECIFICACIONES TÉCNICAS_</h2>
        <p>Escaneo de capacidades del host completado. Nivel de autorización: ACEPTADO.</p>
        
        <div class="data-grid">
            <div class="data-card">
                <h3 style="color: #00f3ff;">[ FRONT-END / INTERFAZ ]</h3>
                <p>Dominio avanzado en manipulación del DOM, estructuración semántica y arquitecturas visuales.</p>
                <p>> HTML5, CSS3, SCSS</p>
                <p>> JavaScript (ES6+)</p>
                <p>> React / Vue.js</p>
            </div>
            <div class="data-card">
                <h3 style="color: #00f3ff;">[ BACK-END / NÚCLEO ]</h3>
                <p>Construcción de servidores resilientes y gestión de bases de datos relacionales/no relacionales.</p>
                <p>> Node.js / Express</p>
                <p>> Python / Django</p>
                <p>> MongoDB, PostgreSQL</p>
            </div>
            <div class="data-card">
                <h3 style="color: #00f3ff;">[ SEGURIDAD / REDES ]</h3>
                <p>Protocolos de encriptación y análisis de vulnerabilidades del sistema central.</p>
                <p>> Penetration Testing Básico</p>
                <p>> Criptografía</p>
                <p>> Arquitectura en la Nube (AWS/Azure)</p>
            </div>
        </div>
    `,
    "archivos": `
        <h2>> ACCEDIENDO AL ARCHIVO DE PROYECTOS CLASIFICADOS_</h2>
        <p>Los siguientes desarrollos han sido desclasificados para revisión pública:</p>
        
        <div class="data-grid">
            <div class="data-card">
                <h3>[ PROYECTO: NEURONAL_NET ]</h3>
                <p><strong>Estado:</strong> Completado</p>
                <p>Simulador interactivo de conexiones sinápticas usando Canvas HTML5 y algoritmos físicos de repulsión.</p>
                <a href="#" style="color:#00f3ff; text-decoration:none;">> Ejecutar simulador</a>
            </div>
            <div class="data-card">
                <h3>[ PROYECTO: DATA_CRAWLER ]</h3>
                <p><strong>Estado:</strong> En progreso</p>
                <p>Bot automatizado en Python para extracción y filtrado de grandes volúmenes de datos en la Dark Web.</p>
                <a href="#" style="color:#00f3ff; text-decoration:none;">> Ver repositorio</a>
            </div>
            <div class="data-card">
                <h3>[ PROYECTO: SECURE_VAULT ]</h3>
                <p><strong>Estado:</strong> Beta</p>
                <p>Aplicación de mensajería encriptada peer-to-peer con autodestrucción de paquetes basada en tiempo.</p>
                <a href="#" style="color:#00f3ff; text-decoration:none;">> Acceder a la Beta</a>
            </div>
        </div>
    `,
    "contacto": `
        <h2>> ESTABLECER ENLACE DE COMUNICACIÓN_</h2>
        <p>Si deseas abrir un canal encriptado directo con el administrador de este nodo, utiliza las siguientes coordenadas:</p>
        <br>
        <p><strong style="color: #00ff41;">> EMAIL:</strong> contacto@gabriellopez.es</p>
        <p><strong style="color: #00ff41;">> GITHUB:</strong> github.com/TuUsuario</p>
        <p><strong style="color: #00ff41;">> SEÑAL_LOCAL:</strong> Guadalajara, Sistema Terrestre</p>
        <br><br>
        <div style="border: 1px dashed #ff003c; padding: 15px;">
            <p style="color: #ff003c;">[ TERMINAL DE TRANSMISIÓN DIRECTA: EN MANTENIMIENTO. POR FAVOR USE RUTAS CONVENCIONALES ]</p>
        </div>
    `
};

// ==========================================
// 2. LÓGICA DE LA INTERFAZ Y NAVEGACIÓN
// ==========================================
const screenContent = document.getElementById('content-screen');
const navButtons = document.querySelectorAll('.cyber-btn');
let isTyping = false;

// Efecto máquina de escribir (Terminal)
function typeWriter(html, element, speed = 5) {
    if(isTyping) return;
    isTyping = true;
    element.innerHTML = '';
    
    // Para escribir HTML rápidamente sin romper etiquetas, lo insertamos directamente 
    // pero con un efecto visual de "glitch" en la opacidad
    element.style.opacity = 0;
    element.innerHTML = html;
    
    let opacity = 0;
    const fade = setInterval(() => {
        opacity += 0.1;
        element.style.opacity = opacity;
        if(opacity >= 1) {
            clearInterval(fade);
            isTyping = false;
        }
    }, 30);
}

// Cambiar de sección al hacer clic
navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if(isTyping) return; // Evita clics múltiples rápidos
        
        // Actualizar botones
        navButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Cargar contenido
        const target = e.currentTarget.getAttribute('data-target');
        const dataToLoad = systemData[target] || "<p>ERROR 404: ARCHIVO NO ENCONTRADO</p>";
        
        typeWriter(dataToLoad, screenContent);
    });
});

// ==========================================
// 3. SECUENCIA DE ARRANQUE (BOOT)
// ==========================================
window.addEventListener('load', () => {
    const bootScreen = document.getElementById('boot-screen');
    const progressBar = document.getElementById('boot-progress');
    const hud = document.getElementById('hud-interface');
    const footer = document.getElementById('hud-footer');

    let width = 0;
    const bootInterval = setInterval(() => {
        width += Math.random() * 15;
        if(width >= 100) {
            width = 100;
            progressBar.style.width = width + '%';
            clearInterval(bootInterval);
            
            setTimeout(() => {
                bootScreen.classList.add('hidden');
                setTimeout(() => {
                    hud.classList.remove('hidden');
                    footer.classList.remove('hidden');
                    // Cargar la página de inicio por defecto
                    typeWriter(systemData["inicio"], screenContent);
                }, 500);
            }, 500);
        } else {
            progressBar.style.width = width + '%';
        }
    }, 150);
});

// ==========================================
// 4. MOTOR GRÁFICO (RED NEURONAL DE FONDO)
// ==========================================
const canvas = document.getElementById('cyber-canvas');
const ctx = canvas.getContext('2d');
let cw, ch, particles = [];
const mouse = { x: null, y: null, radius: 150 };

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    cw = canvas.width = window.innerWidth; 
    ch = canvas.height = window.innerHeight;
    initParticles();
}

class Particle {
    constructor() {
        this.x = Math.random() * cw; this.y = Math.random() * ch;
        this.size = Math.random() * 1.5 + 0.5; this.angle = Math.random() * Math.PI * 2;
        this.velocity = Math.random() * 0.2 + 0.05; this.angularVelocity = (Math.random() - 0.5) * 0.01;
    }
    update() {
        this.angle += this.angularVelocity;
        this.x += Math.cos(this.angle) * this.velocity; this.y += Math.sin(this.angle) * this.velocity;
        
        if (this.x < -50) this.x = cw + 50; if (this.x > cw + 50) this.x = -50;
        if (this.y < -50) this.y = ch + 50; if (this.y > ch + 50) this.y = -50;
        
        // Repulsión del ratón
        if (mouse.x != null) {
            let dx = mouse.x - this.x, dy = mouse.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                this.x -= (dx / dist) * force; this.y -= (dy / dist) * force;
            }
        }
    }
    draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 243, 255, 0.3)`; ctx.fill();
    }
}

function initParticles() {
    particles = [];
    let count = Math.floor((cw * ch) / 12000); // Densidad equilibrada
    for (let i = 0; i < count; i++) particles.push(new Particle());
}

function animateCanvas() {
    ctx.clearRect(0, 0, cw, ch);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update(); particles[i].draw();
        
        // Conexiones
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctx.beginPath(); 
                ctx.strokeStyle = `rgba(0, 243, 255, ${0.15 - (dist/120)*0.15})`; 
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateCanvas);
}

resizeCanvas(); 
animateCanvas();
