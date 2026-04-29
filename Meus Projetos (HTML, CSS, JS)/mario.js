const mario = document.querySelector('.mario');
const bowser = document.querySelector('.bowser');
const peach = document.querySelector('.peach');
const pipe = document.querySelector('.pipe');

let gameOver = false;

// controle para não ficar pulando infinitamente
let bowserTriggered = false;
let peachTriggered = false;

// =========================
// SCORE + TEMPO
// =========================
let score = 0;
let jumpsOverPipe = 0;
let countedThisPipe = false;
let time = 0;

// contador de tempo
setInterval(() => {
    if (!gameOver) {
        time++;
        const timeEl = document.getElementById("time");
        if (timeEl) timeEl.innerText = "Tempo: " + time + "s";
    }
}, 1000);

// =========================
// PULO MARIO
// =========================
const marioJump = () => {
    if (gameOver) return;

    if (!mario.classList.contains('mario-jump')) {
        mario.classList.add('mario-jump');

        setTimeout(() => {
            mario.classList.remove('mario-jump');
        }, 500);
    }
};

// =========================
// PULO BOWSER
// =========================
const bowserJump = () => {
    if (!bowser.classList.contains('bowser-jump')) {
        bowser.classList.add('bowser-jump');

        setTimeout(() => {
            bowser.classList.remove('bowser-jump');
        }, 500);
    }
};

// =========================
// PULO PEACH
// =========================
const peachJump = () => {
    if (!peach.classList.contains('peach-jump')) {
        peach.classList.add('peach-jump');

        setTimeout(() => {
            peach.classList.remove('peach-jump');
        }, 500);
    }
};

// =========================
// LOOP PRINCIPAL
// =========================
const loop = setInterval(() => {

    const pipePosition = pipe.offsetLeft;

    const marioPosition = +window.getComputedStyle(mario)
        .bottom.replace('px', '');

    const bowserPositionX = bowser.offsetLeft;
    const peachPositionX = peach.offsetLeft;

    // =========================
    // DISTÂNCIAS
    // =========================
    const distBowser = pipePosition - bowserPositionX;
    const distPeach = pipePosition - peachPositionX;

    // =========================
    // BOWSER PULA
    // =========================
    if (distBowser < 250 && distBowser > 0 && !bowserTriggered) {
        bowserTriggered = true;
        bowserJump();
    }

    if (pipePosition > 500) {
        bowserTriggered = false;
    }

    // =========================
    // PEACH PULA
    // =========================
    if (distPeach < 220 && distPeach > 0 && !peachTriggered) {
        peachTriggered = true;
        peachJump();
    }

    if (pipePosition > 500) {
        peachTriggered = false;
    }

    // =========================
    // SCORE AO PULAR CANO
    // =========================
    if (pipePosition < 250 && !countedThisPipe && marioPosition > 95) {

        countedThisPipe = true;
        score += 10;
        jumpsOverPipe++;

        // bônus a cada 5
        if (jumpsOverPipe % 5 === 0) {
            score += 50;

        }

        const scoreEl = document.getElementById("score");
        if (scoreEl) scoreEl.innerText = "Score: " + score;
    }

    if (pipePosition > 500) {
        countedThisPipe = false;
    }

    // =========================
    // COLISÃO MARIO
    // =========================
    if (
        pipePosition <= 330 &&
        pipePosition >= 230 &&
        marioPosition <= 90
    ) {
        gameOver = true;

        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;

        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition}px`;

        mario.src = 'Images/game-over.png';
        mario.style.width = '65px';

        clearInterval(loop);
    }

}, 10);

// =========================
// CONTROLE
// =========================
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        marioJump();
    }
});