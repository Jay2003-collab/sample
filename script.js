
const welcome = document.getElementById("welcome");
const celebration = document.getElementById("celebration");
const openBtn = document.getElementById("openBtn");
const musicBtn = document.getElementById("musicBtn");
const giftBtn = document.getElementById("giftBtn");
const giftMessage = document.getElementById("giftMessage");

// Background music: an original synthesized birthday melody
let audio = null;
let musicPlaying = false;
let musicTimer = null;
let noteIndex = 0;
let oscillators = [];

const melody = [
    [523.25, 0.28], [523.25, 0.28],
    [587.33, 0.55], [523.25, 0.55],
    [698.46, 0.55], [659.25, 0.85],
    [523.25, 0.28], [523.25, 0.28],
    [587.33, 0.55], [523.25, 0.55],
    [783.99, 0.55], [698.46, 0.85],
    [523.25, 0.28], [523.25, 0.28],
    [1046.5, 0.55], [880, 0.55],
    [698.46, 0.55], [659.25, 0.55],
    [587.33, 0.85], [932.33, 0.28],
    [932.33, 0.28], [880, 0.55],
    [698.46, 0.55], [783.99, 0.55],
    [698.46, 0.85]
];

function playNote(frequency, duration) {
    if (!audio || !musicPlaying) return;

    const oscillator = audio.createOscillator();
    const volume = audio.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    const now = audio.currentTime;

    volume.gain.setValueAtTime(0.001, now);
    volume.gain.linearRampToValueAtTime(0.12, now + 0.03);
    volume.gain.setTargetAtTime(0.001, now + duration * 0.6, 0.08);

    oscillator.connect(volume);
    volume.connect(audio.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);

    oscillators.push(oscillator);

    oscillator.onended = () => {
        oscillators = oscillators.filter(o => o !== oscillator);
        oscillator.disconnect();
        volume.disconnect();
    };
}

function nextNote() {
    if (!musicPlaying) return;

    const [frequency, duration] = melody[noteIndex];

    playNote(frequency, duration);
    noteIndex = (noteIndex + 1) % melody.length;

    musicTimer = setTimeout(nextNote, (duration + 0.12) * 1000);
}

async function startMusic() {
    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
        alert("Audio is not supported by this browser.");
        return;
    }

    try {
        if (!audio) audio = new AudioContextClass();

        await audio.resume();

        if (musicPlaying) return;

        musicPlaying = true;
        musicBtn.textContent = "⏸ Pause Music";
        nextNote();
    } catch (error) {
        alert("Please try clicking the music button again.");
    }
}

function stopMusic() {
    musicPlaying = false;
    clearTimeout(musicTimer);

    oscillators.forEach(o => {
        try { o.stop(); } catch (error) {}
    });

    oscillators = [];
    musicBtn.textContent = "🎵 Play Music Again";
}

// Click Me: reveal the celebration and start the music
openBtn.addEventListener("click", async () => {
    welcome.classList.add("hidden");
    celebration.classList.remove("hidden");

    launchConfetti(240);
    startHearts();

    await startMusic();
});

// Music play/pause button
musicBtn.addEventListener("click", () => {
    if (musicPlaying) {
        stopMusic();
    } else {
        startMusic();
    }
});

// Reveal birthday message
giftBtn.addEventListener("click", () => {
    giftMessage.classList.toggle("hidden");

    if (!giftMessage.classList.contains("hidden")) {
        giftBtn.textContent = "💗 Your Special Message";
        launchConfetti(100);
    } else {
        giftBtn.textContent = "🎁 Open Your Birthday Message";
    }
});

// Floating hearts
let heartsStarted = false;

function startHearts() {
    if (heartsStarted) return;
    heartsStarted = true;

    const container = document.getElementById("hearts");
    const emojis = ["💗", "💜", "💕", "✨", "♡"];

    setInterval(() => {
        const heart = document.createElement("span");

        heart.className = "heart";
        heart.textContent = emojis[
            Math.floor(Math.random() * emojis.length)
        ];

        heart.style.left = Math.random() * 100 + "vw";
        heart.style.fontSize = (14 + Math.random() * 22) + "px";
        heart.style.animationDuration = (5 + Math.random() * 5) + "s";

        container.appendChild(heart);

        setTimeout(() => heart.remove(), 11000);
    }, 300);
}

// Confetti
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

let pieces = [];
let confettiRunning = false;

function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function launchConfetti(amount) {
    const colors = [
        "#ff83c5", "#d7a1ff", "#fff0a6",
        "#ffffff", "#ff5db1", "#b77aff"
    ];

    for (let i = 0; i < amount; i++) {
        pieces.push({
            x: Math.random() * window.innerWidth,
            y: -20 - Math.random() * window.innerHeight,
            size: 4 + Math.random() * 7,
            speed: 2 + Math.random() * 5,
            drift: (Math.random() - 0.5) * 3,
            rotation: Math.random() * 360,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    if (!confettiRunning) {
        confettiRunning = true;
        animateConfetti();
    }
}

function animateConfetti() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    pieces.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);

        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);

        ctx.restore();

        p.y += p.speed;
        p.x += p.drift;
        p.rotation += 4;
    });

    pieces = pieces.filter(p => p.y < window.innerHeight + 20);

    if (pieces.length > 0) {
        requestAnimationFrame(animateConfetti);
    } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        confettiRunning = false;
    }
}
