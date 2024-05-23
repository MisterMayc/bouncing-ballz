// this is the gravity value according to physics, in general it is 9.81 as Galileo Galilei invented, but I scaled it up to make it more realistic inside our canvas
const GRAVITY = 9810;
// Damping factor is different for different mass of our object, I set a random value to make our ball's movement realistic
const DAMPING = 0.7;
// this one is the size of our circles
const RADIUS = 35;
// the background particle effect's maximum particles count
const PARTICLE_COUNT = 200;
// and finally the maximum amount if circles we can create
const MAX_CIRCLES = 100;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d') as CanvasRenderingContext2D;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

interface Circle {
    x: number;
    y: number;
    radius: number;
    color: string;
    velocityY: number;
}

interface Particle {
    x: number;
    y: number;
    radius: number;
    color: string;
    brightness: number;
    velocityX: number;
    velocityY: number;
    twinkleFactor: number;
    originalBrightness: number;
}

const circles: Circle[] = [];
const particles: Particle[] = [];

function createCircle(x: number, y: number): Circle {
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    return {
        x: x,
        y: y,
        radius: RADIUS,
        color: color,
        velocityY: 0,
    };
}

canvas.addEventListener('click', (event) => {
    if (circles.length < MAX_CIRCLES) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        circles.push(createCircle(x, y));
    }
});

function updateCircle(circle: Circle, deltaTime: number) {
    circle.velocityY += GRAVITY * deltaTime;
    circle.y += circle.velocityY * deltaTime;

    if (circle.y + circle.radius > canvas.height) {
        circle.y = canvas.height - circle.radius;
        circle.velocityY *= -DAMPING;

        if (Math.abs(circle.velocityY) < 20) {
            circle.velocityY = 0;
        }
    }
}

function drawCircle(circle: Circle) {
    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);

    // here are some shadows for the balls, but I have commented them to have more frame rate
    // context.shadowColor = circle.color;
    // context.shadowBlur = 20;

    context.fillStyle = circle.color;
    context.fill();
    context.closePath();

    context.shadowColor = 'transparent';
}

// creating the background particles
function createParticle(): Particle {
    const radius = Math.random() * 2 + 1;
    const brightness = Math.random() * 0.5 + 0.5;
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: radius,
        color: `rgba(255, 255, 255, ${brightness})`,
        brightness: brightness,
        originalBrightness: brightness,
        velocityX: (Math.random() - 0.5) * 0.1,
        velocityY: (Math.random() - 0.5) * 0.1,
        twinkleFactor: 0.01
    };
}

function updateParticle(particle: Particle) {
    particle.x += particle.velocityX;
    particle.y += particle.velocityY;

    if (particle.x < 0 || particle.x > canvas.width) particle.velocityX *= -1;
    if (particle.y < 0 || particle.y > canvas.height) particle.velocityY *= -1;

    particle.brightness += particle.twinkleFactor;
    if (particle.brightness > 1 || particle.brightness < 0.5) {
        particle.twinkleFactor *= -1;
    }
    particle.color = `rgba(255, 255, 255, ${particle.brightness})`;
}

function drawParticle(particle: Particle) {
    const spikes = 4;
    const step = Math.PI / spikes;
    const outerRadius = particle.radius;
    const innerRadius = particle.radius / 2;

    context.save();
    context.beginPath();
    context.translate(particle.x, particle.y);
    context.moveTo(0, -outerRadius);
    for (let i = 0; i < 2 * spikes; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(i * step) * radius;
        const y = Math.sin(i * step) * radius;
        context.lineTo(x, y);
    }
    context.closePath();
    context.fillStyle = particle.color;
    context.fill();
    context.restore();

    context.shadowColor = 'transparent';
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle());
}

let lastTime = performance.now();

function tick(currentTime: number) {
    const deltaTime = (currentTime - lastTime) / 1000; // delta time in seconds
    lastTime = currentTime;

    context.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        updateParticle(particle);
        drawParticle(particle);
    });

    circles.forEach(circle => {
        updateCircle(circle, deltaTime);
        drawCircle(circle);
    });

    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
