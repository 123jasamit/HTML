const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

// GAME STATE
let gameState = "menu";

// PLAYER
let player = {
    x: 100,
    y: 300,
    width: 30,
    height: 30,
    dy: 0,
    gravity: 0.8,
    jumpForce: -13,
    onGround: false,
    flying: false,
    flyStart: 0,
    maxFlyDuration: 60000,
    speed: 5
};

// LEVELS
const levels = [
    { name: "Easy", emoji: "🔹" },
    { name: "Medium", emoji: "🔸" },
    { name: "Hard", emoji: "🔺" }
];

let currentLevelIndex = 0;

// OBSTACLES & PORTALS
let obstacles = [];
let portals = [];
let obstacleWidth = 30;
let spikeHeight = 45;

// KEYS & SCORE
let keysPressed = {};
let score = 0;

// INPUT
document.addEventListener("keydown", e => {
    keysPressed[e.code] = true;
    if (gameState === "menu" || gameState === "dead") {
        if (e.code === "ArrowLeft") currentLevelIndex = (currentLevelIndex + levels.length - 1) % levels.length;
        if (e.code === "ArrowRight") currentLevelIndex = (currentLevelIndex + 1) % levels.length;
        if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") startLevel();
    }
});
document.addEventListener("keyup", e => keysPressed[e.code] = false);

// START LEVEL
function startLevel() {
    gameState = "playing";
    player.y = 300;
    player.dy = 0;
    player.onGround = false;
    player.flying = false;
    player.flyStart = 0;

    obstacles = [];
    portals = [];

    let startX = 400;
    for (let i = 0; i < 10; i++) {
        let spacing = 250 + Math.floor(Math.random() * 200);
        obstacles.push({ x: startX, y: 360, width: obstacleWidth, height: spikeHeight });
        if (i % 4 === 3) {
            let type = Math.random() < 0.5 ? "fly" : "speed";
            portals.push({ x: startX + spacing / 2, y: 360 - 30, width: 30, height: 30, type: type });
        }
        startX += spacing;
    }
    score = 0;
}

// DRAW SPIKE
function drawSpike(obj) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(obj.x, obj.y);
    ctx.lineTo(obj.x + obj.width/2, obj.y - obj.height);
    ctx.lineTo(obj.x + obj.width, obj.y);
    ctx.closePath();
    ctx.fill();
}

// DRAW PORTAL
function drawPortal(portal) {
    ctx.fillStyle = portal.type === "fly" ? "lime" : "orange";
    ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
}

// GAME LOOP
function update() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // MENU / DEAD SCREEN
    if (gameState === "menu" || gameState === "dead") {
        ctx.fillStyle = "white";
        ctx.font = "36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("MINI GEOMETRY DASH", canvas.width/2, 100);
        ctx.font = "24px Arial";
        ctx.fillText(`Level: ${levels[currentLevelIndex].name} ${levels[currentLevelIndex].emoji}`, canvas.width/2, 160);
        ctx.font = "20px Arial";
        ctx.fillText("Use ◀ ▶ to select level", canvas.width/2, 200);
        ctx.fillText("Press W / UP / SPACE to play", canvas.width/2, 240);
        if(gameState==="dead"){
            ctx.fillStyle="yellow";
            ctx.font="28px Arial";
            ctx.fillText("YOU CRASHED!",canvas.width/2,280);
        }
        requestAnimationFrame(update);
        return;
    }

    // JUMP
    if(!player.flying && (keysPressed["Space"] || keysPressed["ArrowUp"] || keysPressed["KeyW"]) && player.onGround){
        player.dy = player.jumpForce;
    }

    // FLYING LOGIC
    if(player.flying){
        if(Date.now() - player.flyStart < player.maxFlyDuration){
            if(keysPressed["Space"] || keysPressed["ArrowUp"] || keysPressed["KeyW"]) player.dy = -7;
            else if(keysPressed["ArrowDown"] || keysPressed["KeyS"]) player.dy = 7;
            else player.dy = 0;
        } else {
            player.flying = false;
            player.dy = player.gravity; // start falling immediately
        }
    }

    // APPLY GRAVITY IF NOT FLYING
    if(!player.flying) player.dy += player.gravity;

    // MOVE PLAYER
    player.y += player.dy;

    if(player.y<50) player.y=50;
    if(player.y + player.height > 360){
        player.y = 360 - player.height;
        player.dy = 0;
        player.onGround = true;
    } else if(!player.flying) player.onGround = false;

    // MOVE OBSTACLES & PORTALS
    obstacles.forEach(obj => obj.x -= player.speed);
    portals.forEach(portal => portal.x -= player.speed);

    // REMOVE OFFSCREEN
    obstacles = obstacles.filter(obj => obj.x + obj.width > 0);
    portals = portals.filter(portal => portal.x + portal.width > 0);

    // SPAWN NEW OBSTACLES
    if(obstacles.length && obstacles[obstacles.length-1].x < canvas.width){
        let lastX = obstacles[obstacles.length-1].x;
        let spacing = 250 + Math.floor(Math.random()*200);
        obstacles.push({x:lastX+spacing, y:360, width:obstacleWidth, height:spikeHeight});
        if(Math.random()<0.25){
            let type = Math.random()<0.5?"fly":"speed";
            portals.push({x:lastX+spacing+50, y:360-30, width:30, height:30, type:type});
        }
    }

    // COLLISION WITH SPIKES
    for(let obj of obstacles){
        if(player.x < obj.x + obj.width &&
           player.x + player.width > obj.x &&
           player.y < obj.y &&
           player.y + player.height > obj.y - obj.height){
               gameState="dead";
        }
    }

    // COLLISION WITH PORTALS
    portals.forEach((portal,i)=>{
        if(player.x < portal.x + portal.width &&
           player.x + player.width > portal.x &&
           player.y < portal.y + portal.height &&
           player.y + player.height > portal.y){
               if(portal.type==="fly"){
                   player.flying=true;
                   player.flyStart = Date.now();
               } else if(portal.type==="speed"){
                   ctx.fillStyle="orange";
                   ctx.fillRect(player.x-5, player.y-5, player.width+10, player.height+10);
               }
               portals.splice(i,1);
        }
    });

    // FLOOR
    ctx.fillStyle="gray";
    ctx.fillRect(0,360,canvas.width,3);

    // DRAW PLAYER
    ctx.fillStyle="cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // DRAW SPIKES & PORTALS
    obstacles.forEach(drawSpike);
    portals.forEach(drawPortal);

    // SCORE
    ctx.fillStyle="white";
    ctx.font="18px Arial";
    ctx.textAlign="left";
    ctx.fillText("Score: "+score,10,20);
    score++;

    requestAnimationFrame(update);
}

update();




















