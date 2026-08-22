const socket = io();

let currentGame = null;
let roomCode = null;


/* =========================
   ROOM SYSTEM
========================= */

function name() {

    return (
        document.getElementById("playerName").value.trim()
        || "Player"
    );

}


function createRoom() {

    socket.emit(
        "createRoom",
        name()
    );

}


function joinRoom() {

    const code =
        document
        .getElementById("roomCode")
        .value
        .trim()
        .toUpperCase();

    socket.emit(
        "joinRoom",
        {
            code,
            name: name()
        }
    );

}


socket.on("roomCreated", code => {

    roomCode = code;

    document
        .getElementById("roomDisplay")
        .textContent = code;

    show("lobby");

});


socket.on("players", players => {

    const container =
        document.getElementById("players");

    container.innerHTML = "";

    players.forEach(player => {

        const div =
            document.createElement("div");

        div.className = "player";

        div.textContent =
            "🟢 " + player.name;

        container.appendChild(div);

    });

});


socket.on("errorMessage", message => {

    document
        .getElementById("message")
        .textContent = message;

});


/* =========================
   GAME SELECTION
========================= */

function selectGame(game) {

    socket.emit(
        "selectGame",
        game
    );

}


socket.on("gameSelected", game => {

    currentGame = game;

    show("game");

    const titles = {

        ttt: "❌⭕ TIC-TAC-TOE",
        rps: "✊ ROCK PAPER SCISSORS",
        pong: "🏓 MINI PONG",
        memory: "🃏 MEMORY BATTLE",
        snake: "🐍 MULTIPLAYER SNAKE",
        racing: "🏎️ MINI RACING",
        arena: "🏹 1v1 ARENA",
        quiz: "🧠 QUIZ BATTLE"

    };

    document
        .getElementById("gameTitle")
        .textContent = titles[game];

    renderGame(game);

});


function renderGame(game) {

    const area =
        document.getElementById("gameArea");

    area.innerHTML = "";

    if (game === "ttt")
        renderTicTacToe(area);

    else if (game === "rps")
        renderRPS(area);

    else if (game === "quiz")
        renderQuiz(area);

    else if (game === "memory")
        renderMemory(area);

    else
        renderComingGame(area, game);

}


/* =========================
   TIC TAC TOE
========================= */

function renderTicTacToe(area) {

    area.innerHTML = `
        <p id="tttStatus">Waiting...</p>

        <div class="ttt">
            ${Array.from(
                {length:9},
                (_,i) =>
                `<div
                    class="cell"
                    onclick="tttMove(${i})"
                    id="cell-${i}"
                ></div>`
            ).join("")}
        </div>

        <button onclick="restart()">
            🔄 REMATCH
        </button>
    `;

}


function tttMove(index) {

    socket.emit(
        "tttMove",
        index
    );

}


socket.on("tttUpdate", data => {

    data.board.forEach(
        (value,index) => {

            document
                .getElementById(
                    `cell-${index}`
                )
                .textContent = value;

        }
    );

    const status =
        document.getElementById("tttStatus");

    if (data.winner) {

        if (data.winner === "draw") {

            status.textContent =
                "💀 DEADLOCK!";

        } else {

            status.textContent =
                `🔥 ${data.winner} WINS!`;

            confetti();

        }

    } else {

        status.textContent =
            "⚡ Make your move!";

    }

});


/* =========================
   RPS
========================= */

function renderRPS(area) {

    area.innerHTML = `

        <h3>Choose your weapon!</h3>

        <div class="rps">

            <button onclick="rps('rock')">
                🪨
            </button>

            <button onclick="rps('paper')">
                📄
            </button>

            <button onclick="rps('scissors')">
                ✂️
            </button>

        </div>

        <h2 id="rpsResult"></h2>
    `;

}


function rps(choice) {

    socket.emit(
        "rpsChoice",
        choice
    );

}


socket.on("rpsResult", data => {

    document
        .getElementById("rpsResult")
        .textContent =
        data.result === "draw"
            ? "🤝 DRAW!"
            : `🔥 ${data.result} WINS!`;

});


/* =========================
   QUIZ BATTLE
========================= */

function renderQuiz(area) {

    area.innerHTML = `

        <div
            id="quizQuestion"
            class="quiz-question"
        >
            Waiting for question...
        </div>

        <div
            id="quizOptions"
            class="quiz-options"
        ></div>

        <h3 id="quizResult"></h3>

    `;

}


socket.on("quizQuestion", q => {

    document
        .getElementById("quizQuestion")
        .textContent = q.q;

    const options =
        document.getElementById("quizOptions");

    options.innerHTML = "";

    q.options.forEach(
        (option,index) => {

            const button =
                document.createElement("button");

            button.textContent = option;

            button.onclick = () => {

                socket.emit(
                    "quizAnswer",
                    index
                );

            };

            options.appendChild(button);

        }
    );

});


socket.on("quizResult", data => {

    document
        .getElementById("quizResult")
        .textContent =
        "🎯 Correct answer revealed!";

});


/* =========================
   MEMORY
========================= */

function renderMemory(area) {

    area.innerHTML = `

        <button onclick="startMemory()">
            🃏 START MEMORY BATTLE
        </button>

        <div
            id="memoryBoard"
            class="memory"
        ></div>

    `;

}


function startMemory() {

    socket.emit("memoryStart");

}


socket.on("memoryBoard", board => {

    const area =
        document.getElementById(
            "memoryBoard"
        );

    area.innerHTML = "";

    board.forEach((_,i) => {

        const card =
            document.createElement("div");

        card.className =
            "memory-card";

        card.textContent = "?";

        area.appendChild(card);

    });

});


/* =========================
   OTHER GAMES
========================= */

function renderComingGame(area, game) {

    const names = {

        pong: "🏓 Mini Pong",
        snake: "🐍 Multiplayer Snake",
        racing: "🏎️ Mini Racing",
        arena: "🏹 1v1 Arena"

    };

    area.innerHTML = `

        <h2>${names[game]}</h2>

        <p>
            Multiplayer connection is ready.
        </p>

        <p>
            This game engine is the next module
            we'll plug into the GameVerse system.
        </p>

        <button onclick="restart()">
            🔄 RESTART
        </button>

    `;

}


/* =========================
   NAVIGATION
========================= */

function show(id) {

    document
        .querySelectorAll(".screen")
        .forEach(
            s => s.classList.add("hidden")
        );

    document
        .getElementById(id)
        .classList.remove("hidden");

}


function backLobby() {

    show("lobby");

}


function restart() {

    socket.emit("restartGame");

}


socket.on("restartGame", () => {

    renderGame(currentGame);

});


/* =========================
   EFFECTS
========================= */

function confetti() {

    for (let i = 0; i < 50; i++) {

        const piece =
            document.createElement("div");

        piece.textContent = "✨";

        piece.style.position = "fixed";
        piece.style.left =
            Math.random() * 100 + "%";

        piece.style.top = "-20px";

        piece.style.fontSize =
            Math.random() * 20 + 10 + "px";

        piece.style.transition =
            "top 1.5s linear";

        document.body.appendChild(piece);

        setTimeout(() => {

            piece.style.top = "110%";

        }, 20);

        setTimeout(() => {

            piece.remove();

        }, 1600);

    }

}
