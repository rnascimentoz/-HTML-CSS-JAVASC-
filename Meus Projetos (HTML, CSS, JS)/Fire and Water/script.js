const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

const gravity = 0.4;
const keys = {};
let time = 0;

addEventListener("keydown", e => {

    keys[e.key] = true;

    if (e.key.toLowerCase() === "n") {
        nextLevel();
    }

    if (e.key.toLowerCase() === "r") {
        nextLevel(); // reset = reinicia fase
    }

});

addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

// ================= BACKGROUND =================
function drawBackground() {
    let g = ctx.createLinearGradient(0,0,0,canvas.height);
    g.addColorStop(0, "#0f2027");
    g.addColorStop(1, "#2c5364");

    ctx.fillStyle = g;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // partículas animadas
    for (let i = 0; i < 40; i++) {
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.beginPath();
        ctx.arc(
            (i*37 + time*0.5) % canvas.width,
            (i*53) % canvas.height,
            2,
            0,
            Math.PI*2
        );
        ctx.fill();
    }
}

// ================= PLAYER =================
class Player {
    constructor(x, y, color, element, controls) {
        this.x = x;
        this.y = y;
        this.w = 30;
        this.h = 30;
        this.color = color;
        this.element = element;
        this.controls = controls;

        this.vx = 0;
        this.vy = 0;
        this.speed = 0.4;
        this.maxSpeed = 3;
        this.jump = -9;

        this.alive = true;
        this.reachedGoal = false;
    }

    update(level) {
        if (!this.alive) return;

        if (keys[this.controls.left]) this.vx -= this.speed;
        if (keys[this.controls.right]) this.vx += this.speed;

        this.vx *= 0.9;
        this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vx));

        if (keys[this.controls.jump] && this.vy === 0) {
            this.vy = this.jump;
        }

        this.vy += gravity;

        this.x += this.vx;
        this.y += this.vy;

        this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));

        // plataformas
        level.platforms.forEach(p => {

    let prevBottom = this.y + this.h - this.vy; // posição anterior

    // só colide se estava acima da plataforma antes
    if (
        this.x < p.x + p.w &&
        this.x + this.w > p.x &&
        prevBottom <= p.y &&
        this.y + this.h >= p.y
    ) {
        this.y = p.y - this.h;
        this.vy = 0;
    }

});

        // hazards
        level.hazards.forEach(h => {
            if (collide(this,h) && this.element !== h.type) {
                this.alive = false;
            }
        });

        // diamantes
        level.diamonds.forEach(d => {
            if (!d.collected && collide(this,d)) {
                d.collected = true;
                level.score += 10;
            }
        });

        // porta
        level.door.active = level.diamonds.every(d => d.collected);

        if (collide(this, level.door) && level.door.active) {
    this.reachedGoal = true;

    // trava na porta
    this.vx = 0;
    this.vy = 0;

    this.x = level.door.x + level.door.w/2 - this.w/2;
    this.y = level.door.y + level.door.h - this.h;
}

        // empilhar
        let other = this === fire ? water : fire;
        if (collide(this, other) && this.vy > 0) {
            this.y = other.y - this.h;
            this.vy = 0;
        }

        if (this.y > canvas.height) this.alive = false;
    }

    draw() {
        if (!this.alive) return;

        let bounce = Math.sin(time * 0.1) * 2;

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y + bounce, this.w, this.h);

        // olhos
        ctx.fillStyle = "white";
        ctx.fillRect(this.x+5, this.y+8 + bounce, 5,5);
        ctx.fillRect(this.x+20, this.y+8 + bounce, 5,5);
    }
}

// ================= LEVEL =================
class Level {
    constructor() {
        this.platforms = [];
        this.hazards = [];
        this.diamonds = [];
        this.score = 0;

        this.generate();

        this.door = {
            x: canvas.width - 80,
            y: 100,
            w: 50,
            h: 70,
            active: false
        };
    }

    generate() {
        this.platforms.push({x:0,y:450,w:900,h:50});

        let x = 50;
        let y = 380;

        for (let i = 0; i < 8; i++) {

            let width = 120 + Math.random()*40;

            this.platforms.push({x,y,w:width,h:20});

            this.diamonds.push({
                x: x + width/2 - 10,
                y: y - 35,
                w: 20,
                h: 20,
                collected:false
            });

            if (i > 1 && Math.random() > 0.5) {
                let type = Math.random() > 0.5 ? "fire" : "water";

                this.hazards.push({
                    x: x + 10,
                    y: y - 10,
                    w: width - 20,
                    h: 10,
                    type
                });
            }

            x += 110 + Math.random()*50;
            y -= 40 + Math.random()*20;
        }

        this.hazards.push({x:0,y:450,w:200,h:50,type:"water"});
        this.hazards.push({x:700,y:450,w:200,h:50,type:"fire"});
    }

    draw() {
        ctx.fillStyle = "#ddd";
        this.platforms.forEach(p => ctx.fillRect(p.x,p.y,p.w,p.h));

        this.hazards.forEach(h=>{
            let pulse = Math.sin(time*0.1)*2;
            ctx.fillStyle = h.type==="fire"?"orange":"cyan";
            ctx.fillRect(h.x, h.y + pulse, h.w, h.h);
        });

        this.diamonds.forEach(d=>{
            if (!d.collected) {
                let glow = Math.sin(time*0.2)*3;
                ctx.fillStyle = "lime";
                ctx.fillRect(d.x, d.y - glow, d.w, d.h);
            }
        });

        let grd = ctx.createLinearGradient(
            this.door.x, this.door.y,
            this.door.x, this.door.y + this.door.h
        );

        grd.addColorStop(0, this.door.active ? "#ffd700" : "#444");
        grd.addColorStop(1, this.door.active ? "#ff8c00" : "#222");

        ctx.fillStyle = grd;
        ctx.fillRect(this.door.x,this.door.y,this.door.w,this.door.h);

        if (this.door.active) {
            ctx.shadowColor = "gold";
            ctx.shadowBlur = 20;
            ctx.strokeStyle = "yellow";
            ctx.strokeRect(this.door.x,this.door.y,this.door.w,this.door.h);
            ctx.shadowBlur = 0;
        }
    }
}

// ================= COLLISION =================
function collide(a,b){
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
}

// ================= GAME =================
let level;
let fire;
let water;

function createPlayers() {
    fire = new Player(50,300,"red","fire",{left:"a",right:"d",jump:"w"});
    water = new Player(120,300,"blue","water",{left:"ArrowLeft",right:"ArrowRight",jump:"ArrowUp"});
}

function nextLevel(){
    level = new Level();
    createPlayers();
    loop();
}

// ================= UI =================
function drawUI(score){
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
}

function drawText(text){
    ctx.fillStyle = "red";
    ctx.font = "bold 50px Arial";
    ctx.fillText(text,300,220);
}

// ================= LOOP =================
function loop(){
    time++;

    drawBackground();

    level.draw();

    fire.update(level);
    water.update(level);

    fire.draw();
    water.draw();

    drawUI(level.score);

    if(!fire.alive || !water.alive){
        drawText("GAME OVER");
        setTimeout(nextLevel,1500);
        return;
    }

    if(fire.reachedGoal && water.reachedGoal){
        nextLevel();
        return;
    }

    requestAnimationFrame(loop);
}

// START
nextLevel();