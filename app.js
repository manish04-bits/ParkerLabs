const socket = io();

let roomCode = null;
let currentGame = null;
let selectedGame = null;
let gameMode = null;

let localBoard = [];
let quizScore = 0;

const gameInfo = {

    ttt: {
        name: "TIC-TAC-TOE",
        icon: "❌⭕"
    },

    rps: {
        name: "ROCK PAPER SCISSORS",
        icon: "✊"
    },

    pong: {
        name: "MINI PONG",
        icon: "🏓"
    },

    memory: {
        name: "MEMORY BATTLE",
        icon: "🃏"
    },

    snake: {
        name: "SNAKE BATTLE",
        icon: "🐍"
    },

    racing: {
        name: "MINI RACING",
        icon: "🏎️"
    },

    arena: {
        name: "1V1 ARENA",
        icon: "🏹"
    },

    quiz: {
        name: "QUIZ BATTLE",
        icon: "🧠"
    }
};


/* =========================
   NAVIGATION
========================= */

function show(id) {

    document
        .querySelectorAll(".screen")
        .forEach(
            screen =>
                screen.classList.add("hidden")
        );

    document
        .getElementById(id)
        .classList.remove("hidden");
}


/* =========================
   PLAYER / ROOM
========================= */

function getName() {

    return (
        document
            .getElementById("playerName")
            .value
            .trim()
        || "Player"
    );
}


function createRoom() {

    socket.emit(
        "createRoom",
        getName()
    );
}


function joinRoom() {

    const code =
        document
            .getElementById("roomCode")
            .value
            .trim()
            .toUpperCase();

    if (!code) {

        showMessage(
            "Enter a room code."
        );

        return;
    }

    socket.emit(
        "joinRoom",
        {
            code,
            name: getName()
        }
    );
}


socket.on(
    "roomCreated",
    code => {

        roomCode = code;

        document
            .getElementById(
                "roomDisplay"
            )
            .textContent = code;

        show("lobby");
    }
);


socket.on(
    "players",
    players => {

        const box =
            document
                .getElementById(
                    "players"
                );

        box.innerHTML = "";

        players.forEach(
            player => {

                const div =
                    document.createElement(
                        "div"
                    );

                div.className =
                    "player";

                div.textContent =
                    `🟢 ${player.name}`;

                box.appendChild(div);
            }
        );
    }
);


socket.on(
    "errorMessage",
    message => {

        showMessage(message);
    }
);


function showMessage(message) {

    document
        .getElementById(
            "message"
        )
        .textContent = message;
}


function copyRoom() {

    if (!roomCode) return;

    navigator.clipboard.writeText(
        roomCode
    );

    showMessage(
        "Room code copied!"
    );
}


/* =========================
   GAME SELECTION
========================= */

function chooseGame(game) {

    selectedGame = game;

    document
        .getElementById(
            "selectedGameIcon"
        )
        .textContent =
        gameInfo[game].icon;

    document
        .getElementById(
            "selectedGameName"
        )
        .textContent =
        gameInfo[game].name;

    show("mode");
}


function startSinglePlayer() {

    gameMode = "single";

    currentGame =
        selectedGame;

    openGame();
}


function startMultiplayer() {

    gameMode = "multi";

    currentGame =
        selectedGame;

    socket.emit(
        "selectGame",
        selectedGame
    );
}


socket.on(
    "gameSelected",
    game => {

        currentGame =
            game;

        gameMode =
            "multi";

        openGame();
    }
);


function openGame() {

    document
        .getElementById(
            "gameTitle"
        )
        .textContent =
        gameInfo[currentGame].icon
        + " "
        + gameInfo[currentGame].name;

    document
        .getElementById(
            "modeLabel"
        )
        .textContent =
        gameMode === "single"
            ? "👤 SINGLE PLAYER"
            : "👥 MULTIPLAYER";

    show("game");

    renderGame();
}


function renderGame() {

    const area =
        document
            .getElementById(
                "gameArea"
            );

    area.innerHTML = "";

    if (
        gameMode === "single"
    ) {

        renderSingleGame(
            currentGame,
            area
        );

    } else {

        renderMultiGame(
            currentGame,
            area
        );
    }
}


/* =========================
   SINGLE PLAYER
========================= */

function renderSingleGame(
    game,
    area
) {

    if (game === "ttt")
        singleTicTacToe(area);

    else if (game === "rps")
        singleRPS(area);

    else if (game === "quiz")
        singleQuiz(area);

    else if (game === "memory")
        singleMemory(area);

    else if (game === "pong")
        singlePong(area);

    else if (game === "snake")
        singleSnake(area);

    else if (game === "racing")
        singleRacing(area);

    else if (game === "arena")
        singleArena(area);
}


/* =========================
   MULTIPLAYER
========================= */

function renderMultiGame(
    game,
    area
) {

    if (game === "ttt")
        multiTicTacToe(area);

    else if (game === "rps")
        multiRPS(area);

    else if (game === "quiz")
        multiQuiz(area);

    else if (game === "memory")
        multiMemory(area);

    else if (game === "pong")
        multiPong(area);

    else if (game === "snake")
        multiSnake(area);

    else if (game === "racing")
        multiRacing(area);

    else if (game === "arena")
        multiArena(area);
}


/* =====================================================
   TIC TAC TOE - SINGLE
===================================================== */

function singleTicTacToe(area) {

    localBoard =
        Array(9).fill("");

    area.innerHTML = `

        <h3 id="tttStatus">
            Your turn — X
        </h3>

        <div class="ttt">

            ${Array.from(
                { length: 9 },
                (_, i) => `
                    <div
                        class="cell"
                        id="singleCell${i}"
                        onclick="singleTTTMove(${i})"
                    ></div>
                `
            ).join("")}

        </div>

        <button
            onclick="
                singleTicTacToe(
                    document.getElementById('gameArea')
                )
            "
        >
            🔄 REMATCH
        </button>
    `;
}


function singleTTTMove(index) {

    if (localBoard[index])
        return;

    localBoard[index] = "X";

    updateSingleTTT();

    if (
        localWinner(
            localBoard
        )
    )
        return;

    setTimeout(
        () => {

            const empty =
                localBoard
                    .map(
                        (value, i) =>
                            value === ""
                                ? i
                                : null
                    )
                    .filter(
                        i => i !== null
                    );

            if (!empty.length)
                return;

            const move =
                empty[
                    Math.floor(
                        Math.random()
                        * empty.length
                    )
                ];

            localBoard[move] =
                "O";

            updateSingleTTT();

            localWinner(
                localBoard
            );

        },
        400
    );
}


function updateSingleTTT() {

    localBoard.forEach(
        (value, index) => {

            const cell =
                document.getElementById(
                    `singleCell${index}`
                );

            if (cell)
                cell.textContent =
                    value;
        }
    );
}


function localWinner(board) {

    const wins = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];

    for (
        const [a,b,c]
        of wins
    ) {

        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {

            const status =
                document.getElementById(
                    "tttStatus"
                );

            if (status) {

                status.textContent =
                    board[a] === "X"
                        ? "🔥 YOU WIN!"
                        : "🤖 AI WINS!";
            }

            confetti();

            return true;
        }
    }

    if (
        board.every(
            Boolean
        )
    ) {

        document.getElementById(
            "tttStatus"
        ).textContent =
            "🤝 DRAW!";

        return true;
    }

    return false;
}


/* =====================================================
   TIC TAC TOE - MULTI
===================================================== */

function multiTicTacToe(area) {

    area.innerHTML = `

        <h3 id="multiTTTStatus">
            Waiting for players...
        </h3>

        <div class="ttt">

            ${Array.from(
                { length: 9 },
                (_, i) => `
                    <div
                        class="cell"
                        id="multiCell${i}"
                        onclick="
                            multiTTTMove(${i})
                        "
                    ></div>
                `
            ).join("")}

        </div>

        <button
            onclick="restartMulti()"
        >
            🔄 REMATCH
        </button>
    `;
}


function multiTTTMove(index) {

    socket.emit(
        "tttMove",
        index
    );
}


socket.on(
    "tttUpdate",
    data => {

        if (
            currentGame !== "ttt"
            ||
            gameMode !== "multi"
        )
            return;

        data.board.forEach(
            (value, index) => {

                const cell =
                    document.getElementById(
                        `multiCell${index}`
                    );

                if (cell)
                    cell.textContent =
                        value;
            }
        );

        const status =
            document.getElementById(
                "multiTTTStatus"
            );

        if (!status)
            return;

        if (data.winner) {

            if (
                data.winner ===
                "draw"
            ) {

                status.textContent =
                    "💀 DEADLOCK!";

            } else {

                status.textContent =
                    `🔥 ${data.winner} WINS!`;

                confetti();
            }

        } else {

            status.textContent =
                "⚡ Your turn / Opponent turn";
        }
    }
);


/* =====================================================
   RPS SINGLE
===================================================== */

function singleRPS(area) {

    area.innerHTML = `

        <h3>
            Battle the AI 🤖
        </h3>

        <div class="rps">

            <button
                onclick="
                    singleRPSPlay('rock')
                "
            >
                🪨
            </button>

            <button
                onclick="
                    singleRPSPlay('paper')
                "
            >
                📄
            </button>

            <button
                onclick="
                    singleRPSPlay('scissors')
                "
            >
                ✂️
            </button>

        </div>

        <h2 id="rpsResult">
            Choose!
        </h2>
    `;
}


function singleRPSPlay(
    player
) {

    const choices =
        [
            "rock",
            "paper",
            "scissors"
        ];

    const ai =
        choices[
            Math.floor(
                Math.random()
                * 3
            )
        ];

    let result;

    if (
        player === ai
    ) {

        result =
            "🤝 DRAW!";

    } else if (

        (
            player === "rock"
            &&
            ai === "scissors"
        )
        ||
        (
            player === "paper"
            &&
            ai === "rock"
        )
        ||
        (
            player === "scissors"
            &&
            ai === "paper"
        )

    ) {

        result =
            "🔥 YOU WIN!";

        confetti();

    } else {

        result =
            "🤖 AI WINS!";
    }

    document
        .getElementById(
            "rpsResult"
        )
        .textContent =
        `You: ${player} | AI: ${ai} → ${result}`;
}


/* =====================================================
   RPS MULTI
===================================================== */

function multiRPS(area) {

    area.innerHTML = `

        <h3>
            Choose your weapon!
        </h3>

        <div class="rps">

            <button
                onclick="
                    multiRPSPlay('rock')
                "
            >
                🪨
            </button>

            <button
                onclick="
                    multiRPSPlay('paper')
                "
            >
                📄
            </button>

            <button
                onclick="
                    multiRPSPlay('scissors')
                "
            >
                ✂️
            </button>

        </div>

        <h2 id="multiRPSResult">
            Waiting...
        </h2>
    `;
}


function multiRPSPlay(
    choice
) {

    socket.emit(
        "rpsChoice",
        choice
    );

}


socket.on(
    "rpsResult",
    data => {

        if (
            currentGame !== "rps"
            ||
            gameMode !== "multi"
        )
            return;

        document
            .getElementById(
                "multiRPSResult"
            )
            .textContent =
            data.result === "draw"
                ? "🤝 DRAW!"
                : `🔥 ${data.result} WINS!`;
    }
);


/* =====================================================
   QUIZ SINGLE
===================================================== */

const quizQuestions = [

    {
        q:
            "Which planet is known as the Red Planet?",

        options:
            [
                "Mars",
                "Venus",
                "Jupiter",
                "Mercury"
            ],

        answer:
            0
    },

    {
        q:
            "What does CPU stand for?",

        options:
            [
                "Central Processing Unit",
                "Computer Personal Unit",
                "Central Program Utility",
                "Core Processing Utility"
            ],

        answer:
            0
    },

    {
        q:
            "How many sides does a hexagon have?",

        options:
            [
                "5",
                "6",
                "7",
                "8"
            ],

        answer:
            1
    },

    {
        q:
            "Which ocean is the largest?",

        options:
            [
                "Atlantic",
                "Indian",
                "Pacific",
                "Arctic"
            ],

        answer:
            2
    },

    {
        q:
            "Which language mainly styles webpages?",

        options:
            [
                "HTML",
                "CSS",
                "Python",
                "C"
            ],

        answer:
            1
    },

    {
        q:
            "What is 12 × 8?",

        options:
            [
                "86",
                "96",
                "108",
                "88"
            ],

        answer:
            1
    }

];


function singleQuiz(area) {

    quizScore = 0;

    area.innerHTML = `

        <div
            id="singleQuizQuestion"
            class="quiz-question"
        ></div>

        <div
            id="singleQuizOptions"
            class="quiz-options"
        ></div>

        <h3
            id="singleQuizScore"
        >
            Score: 0
        </h3>

    `;

    nextQuizQuestion();
}


function nextQuizQuestion() {

    const q =
        quizQuestions[
            Math.floor(
                Math.random()
                * quizQuestions.length
            )
        ];

    document
        .getElementById(
            "singleQuizQuestion"
        )
        .textContent =
        q.q;

    const box =
        document
            .getElementById(
                "singleQuizOptions"
            );

    box.innerHTML = "";

    q.options.forEach(
        (option, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.textContent =
                option;

            button.onclick =
                () => {

                    if (
                        index ===
                        q.answer
                    ) {

                        quizScore++;

                        button.textContent =
                            "🔥 CORRECT!";

                    } else {

                        button.textContent =
                            "❌ WRONG!";
                    }

                    document
                        .getElementById(
                            "singleQuizScore"
                        )
                        .textContent =
                        `Score: ${quizScore}`;

                    setTimeout(
                        nextQuizQuestion,
                        700
                    );
                };

            box.appendChild(
                button
            );
        }
    );
}


/* =====================================================
   QUIZ MULTI
===================================================== */

function multiQuiz(area) {

    area.innerHTML = `

        <button
            onclick="startMultiQuiz()"
        >
            ▶ START QUIZ
        </button>

        <div
            id="multiQuizQuestion"
            class="quiz-question"
        >
            Waiting...
        </div>

        <div
            id="multiQuizOptions"
            class="quiz-options"
        ></div>

        <h3
            id="multiQuizResult"
        ></h3>
    `;
}


function startMultiQuiz() {

    socket.emit(
        "startQuiz"
    );
}


socket.on(
    "quizQuestion",
    q => {

        if (
            currentGame !== "quiz"
            ||
            gameMode !== "multi"
        )
            return;

        const question =
            document
                .getElementById(
                    "multiQuizQuestion"
                );

        const options =
            document
                .getElementById(
                    "multiQuizOptions"
                );

        if (!question || !options)
            return;

        question.textContent =
            q.q;

        options.innerHTML = "";

        q.options.forEach(
            (option, index) => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.textContent =
                    option;

                button.onclick =
                    () => {

                        socket.emit(
                            "quizAnswer",
                            index
                        );

                        button.disabled =
                            true;
                    };

                options.appendChild(
                    button
                );
            }
        );
    }
);


socket.on(
    "quizResult",
    data => {

        const result =
            document
                .getElementById(
                    "multiQuizResult"
                );

        if (!result)
            return;

        result.textContent =
            "🎯 Answer: "
            +
            data.correct;

        confetti();
    }
);


/* =====================================================
   MEMORY SINGLE
===================================================== */

function singleMemory(area) {

    const symbols =
        [
            "🍎","🍎",
            "🚀","🚀",
            "🎮","🎮",
            "🐍","🐍",
            "⚡","⚡",
            "🔥","🔥",
            "👾","👾",
            "🎯","🎯"
        ].sort(
            () =>
                Math.random() - .5
        );

    let first = null;
    let second = null;
    let locked = false;
    let matches = 0;

    area.innerHTML = `

        <div
            id="singleMemory"
            class="memory"
        ></div>

        <h3 id="memoryScore">
            Matches: 0
        </h3>
    `;

    const board =
        document
            .getElementById(
                "singleMemory"
            );

    symbols.forEach(
        symbol => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "memory-card";

            card.textContent =
                "?";

            card.onclick =
                () => {

                    if (
                        locked
                        ||
                        card.textContent
                        !== "?"
                    )
                        return;

                    card.textContent =
                        symbol;

                    if (!first) {

                        first = {
                            card,
                            symbol
                        };

                        return;
                    }

                    second = {
                        card,
                        symbol
                    };

                    locked = true;

                    if (
                        first.symbol ===
                        second.symbol
                    ) {

                        matches++;

                        document
                            .getElementById(
                                "memoryScore"
                            )
                            .textContent =
                            `Matches: ${matches}`;

                        first = null;
                        second = null;
                        locked = false;

                        if (
                            matches ===
                            symbols.length / 2
                        ) {

                            confetti();
                        }

                    } else {

                        setTimeout(
                            () => {

                                first.card
                                    .textContent =
                                    "?";

                                second.card
                                    .textContent =
                                    "?";

                                first = null;
                                second = null;
                                locked = false;

                            },
                            700
                        );
                    }
                };

            board.appendChild(
                card
            );
        }
    );
}


/* =====================================================
   MEMORY MULTI
===================================================== */

function multiMemory(area) {

    area.innerHTML = `

        <button
            onclick="startMultiMemory()"
        >
            🃏 START MEMORY
        </button>

        <div
            id="multiMemory"
            class="memory"
        ></div>
    `;
}


function startMultiMemory() {

    socket.emit(
        "memoryStart"
    );
}


socket.on(
    "memoryBoard",
    cards => {

        if (
            currentGame !== "memory"
            ||
            gameMode !== "multi"
        )
            return;

        const board =
            document
                .getElementById(
                    "multiMemory"
                );

        if (!board)
            return;

        board.innerHTML = "";

        cards.forEach(
            symbol => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "memory-card";

                card.textContent =
                    "?";

                card.onclick =
                    () => {

                        card.textContent =
                            symbol;
                    };

                board.appendChild(
                    card
                );
            }
        );
    }
);


/* =====================================================
   PONG
===================================================== */

function createCanvasGame(
    area,
    title
) {

    area.innerHTML = `

        <canvas
            id="gameCanvas"
            width="700"
            height="400"
        ></canvas>

        <h3 id="canvasStatus">
            ${title}
        </h3>
    `;

    return document
        .getElementById(
            "gameCanvas"
        );
}


/* SINGLE PONG */

function singlePong(area) {

    const canvas =
        createCanvasGame(
            area,
            "🏓 Use your mouse to control the paddle"
        );

    const ctx =
        canvas.getContext("2d");

    let ball = {
        x: 350,
        y: 200,
        dx: 4,
        dy: 4,
        size: 8
    };

    let playerY = 160;
    let aiY = 160;

    canvas.onmousemove =
        event => {

            const rect =
                canvas.getBoundingClientRect();

            playerY =
                event.clientY
                - rect.top
                - 50;
        };

    function loop() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#00f7ff";

        ctx.fillRect(
            15,
            playerY,
            10,
            100
        );

        ctx.fillStyle =
            "#ff3cac";

        ctx.fillRect(
            canvas.width - 25,
            aiY,
            10,
            100
        );

        ctx.fillStyle =
            "white";

        ctx.beginPath();

        ctx.arc(
            ball.x,
            ball.y,
            ball.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ball.x += ball.dx;
        ball.y += ball.dy;

        if (
            ball.y < 0
            ||
            ball.y >
            canvas.height
        ) {

            ball.dy *= -1;
        }

        aiY +=
            (ball.y - 50 - aiY)
            * .06;

        if (
            ball.x < 35
            &&
            ball.y > playerY
            &&
            ball.y < playerY + 100
        ) {

            ball.dx =
                Math.abs(ball.dx);
        }

        if (
            ball.x >
            canvas.width - 35
            &&
            ball.y > aiY
            &&
            ball.y < aiY + 100
        ) {

            ball.dx =
                -Math.abs(ball.dx);
        }

        if (
            ball.x < 0
            ||
            ball.x > canvas.width
        ) {

            ball.x = 350;
            ball.y = 200;
        }

        requestAnimationFrame(
            loop
        );
    }

    loop();
}


/* MULTI PONG */

function multiPong(area) {

    const canvas =
        createCanvasGame(
            area,
            "🏓 Multiplayer Pong"
        );

    const ctx =
        canvas.getContext("2d");

    let y = 150;

    canvas.onmousemove =
        event => {

            const rect =
                canvas.getBoundingClientRect();

            y =
                event.clientY
                - rect.top
                - 50;
        };

    setInterval(
        () => {

            socket.emit(
                "gameState",
                {
                    type: "pong",
                    y
                }
            );

        },
        30
    );

    let opponentY = 150;

    socket.on(
        "opponentState",
        state => {

            if (
                state.type ===
                "pong"
            ) {

                opponentY =
                    state.y;
            }
        }
    );

    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#00f7ff";

        ctx.fillRect(
            15,
            y,
            10,
            100
        );

        ctx.fillStyle =
            "#ff3cac";

        ctx.fillRect(
            canvas.width - 25,
            opponentY,
            10,
            100
        );

        requestAnimationFrame(
            draw
        );
    }

    draw();
}


/* =====================================================
   SNAKE
===================================================== */

function singleSnake(area) {

    const canvas =
        createCanvasGame(
            area,
            "🐍 Arrow keys to move"
        );

    const ctx =
        canvas.getContext("2d");

    let snake = [
        {
            x: 200,
            y: 200
        }
    ];

    let food = {
        x: 300,
        y: 200
    };

    let direction = {
        x: 1,
        y: 0
    };

    document.onkeydown =
        event => {

            if (
                event.key ===
                "ArrowUp"
            ) {

                direction =
                    {
                        x: 0,
                        y: -1
                    };

            } else if (
                event.key ===
                "ArrowDown"
            ) {

                direction =
                    {
                        x: 0,
                        y: 1
                    };

            } else if (
                event.key ===
                "ArrowLeft"
            ) {

                direction =
                    {
                        x: -1,
                        y: 0
                    };

            } else if (
                event.key ===
                "ArrowRight"
            ) {

                direction =
                    {
                        x: 1,
                        y: 0
                    };
            }
        };

    function loop() {

        const head = {
            x:
                snake[0].x
                +
                direction.x * 20,

            y:
                snake[0].y
                +
                direction.y * 20
        };

        snake.unshift(
            head
        );

        if (
            Math.abs(
                head.x - food.x
            ) < 20
            &&
            Math.abs(
                head.y - food.y
            ) < 20
        ) {

            food = {
                x:
                    Math.floor(
                        Math.random()
                        * 34
                    ) * 20,

                y:
                    Math.floor(
                        Math.random()
                        * 19
                    ) * 20
            };

        } else {

            snake.pop();
        }

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#ff3cac";

        ctx.fillRect(
            food.x,
            food.y,
            18,
            18
        );

        ctx.fillStyle =
            "#00f7ff";

        snake.forEach(
            part => {

                ctx.fillRect(
                    part.x,
                    part.y,
                    18,
                    18
                );
            }
        );
    }

    setInterval(
        loop,
        100
    );
}


function multiSnake(area) {

    const canvas =
        createCanvasGame(
            area,
            "🐍 Multiplayer Snake"
        );

    const ctx =
        canvas.getContext("2d");

    let x = 200;
    let y = 200;

    let dx = 1;
    let dy = 0;

    let opponent = {
        x: 500,
        y: 200
    };

    document.onkeydown =
        event => {

            if (
                event.key ===
                "ArrowUp"
            ) {

                dx = 0;
                dy = -1;

            } else if (
                event.key ===
                "ArrowDown"
            ) {

                dx = 0;
                dy = 1;

            } else if (
                event.key ===
                "ArrowLeft"
            ) {

                dx = -1;
                dy = 0;

            } else if (
                event.key ===
                "ArrowRight"
            ) {

                dx = 1;
                dy = 0;
            }
        };

    setInterval(
        () => {

            x += dx * 20;
            y += dy * 20;

            x =
                Math.max(
                    0,
                    Math.min(
                        canvas.width - 20,
                        x
                    )
                );

            y =
                Math.max(
                    0,
                    Math.min(
                        canvas.height - 20,
                        y
                    )
                );

            socket.emit(
                "gameState",
                {
                    type:
                        "snake",

                    x,
                    y
                }
            );

        },
        100
    );

    socket.on(
        "opponentState",
        state => {

            if (
                state.type ===
                "snake"
            ) {

                opponent.x =
                    state.x;

                opponent.y =
                    state.y;
            }
        }
    );

    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#00f7ff";

        ctx.fillRect(
            x,
            y,
            18,
            18
        );

        ctx.fillStyle =
            "#ff3cac";

        ctx.fillRect(
            opponent.x,
            opponent.y,
            18,
            18
        );

        requestAnimationFrame(
            draw
        );
    }

    draw();
}


/* =====================================================
   RACING
===================================================== */

function singleRacing(area) {

    const canvas =
        createCanvasGame(
            area,
            "🏎️ Hold SPACE to accelerate"
        );

    const ctx =
        canvas.getContext("2d");

    let player = 0;
    let ai = 0;

    document.onkeydown =
        event => {

            if (
                event.code ===
                "Space"
            ) {

                player += 5;
            }
        };

    function loop() {

        player += .3;
        ai += .42;

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#111";

        ctx.fillRect(
            100,
            0,
            500,
            400
        );

        ctx.fillStyle =
            "#00f7ff";

        ctx.fillRect(
            200,
            350 - (player % 300),
            50,
            25
        );

        ctx.fillStyle =
            "#ff3cac";

        ctx.fillRect(
            450,
            350 - (ai % 300),
            50,
            25
        );

        requestAnimationFrame(
            loop
        );
    }

    loop();
}


function multiRacing(area) {

    const canvas =
        createCanvasGame(
            area,
            "🏎️ Multiplayer Racing — SPACE to accelerate"
        );

    const ctx =
        canvas.getContext("2d");

    let progress = 0;
    let opponent = 0;

    document.onkeydown =
        event => {

            if (
                event.code ===
                "Space"
            ) {

                progress += 5;
            }
        };

    setInterval(
        () => {

            socket.emit(
                "gameState",
                {
                    type:
                        "racing",

                    progress
                }
            );

        },
        50
    );

    socket.on(
        "opponentState",
        state => {

            if (
                state.type ===
                "racing"
            ) {

                opponent =
                    state.progress;
            }
        }
    );

    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#111";

        ctx.fillRect(
            100,
            0,
            500,
            400
        );

        ctx.fillStyle =
            "#00f7ff";

        ctx.fillRect(
            200,
            350 -
                (progress % 300),
            50,
            25
        );

        ctx.fillStyle =
            "#ff3cac";

        ctx.fillRect(
            450,
            350 -
                (opponent % 300),
            50,
            25
        );

        requestAnimationFrame(
            draw
        );
    }

    draw();
}


/* =====================================================
   ARENA
===================================================== */

function singleArena(area) {

    const canvas =
        createCanvasGame(
            area,
            "🏹 Arrow keys + SPACE to attack"
        );

    const ctx =
        canvas.getContext("2d");

    let player = {
        x: 150,
        y: 200,
        hp: 100
    };

    let enemy = {
        x: 500,
        y: 200,
        hp: 100
    };

    document.onkeydown =
        event => {

            if (
                event.key ===
                "ArrowUp"
            )
                player.y -= 10;

            if (
                event.key ===
                "ArrowDown"
            )
                player.y += 10;

            if (
                event.key ===
                "ArrowLeft"
            )
                player.x -= 10;

            if (
                event.key ===
                "ArrowRight"
            )
                player.x += 10;

            if (
                event.code ===
                "Space"
            ) {

                const distance =
                    Math.hypot(
                        player.x -
                            enemy.x,

                        player.y -
                            enemy.y
                    );

                if (
                    distance < 100
                ) {

                    enemy.hp -= 10;
                }
            }
        };

    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#00f7ff";

        ctx.fillRect(
            player.x,
            player.y,
            35,
            35
        );

        ctx.fillStyle =
            "#ff3cac";

        ctx.fillRect(
            enemy.x,
            enemy.y,
            35,
            35
        );

        ctx.fillStyle =
            "white";

        ctx.fillText(
            `YOU: ${player.hp}`,
            20,
            30
        );

        ctx.fillText(
            `AI: ${enemy.hp}`,
            580,
            30
        );

        requestAnimationFrame(
            draw
        );
    }

    draw();
}


function multiArena(area) {

    const canvas =
        createCanvasGame(
            area,
            "🏹 Multiplayer Arena — Arrow keys + SPACE"
        );

    const ctx =
        canvas.getContext("2d");

    let x = 150;
    let y = 200;

    let opponent = {
        x: 500,
        y: 200
    };

    document.onkeydown =
        event => {

            if (
                event.key ===
                "ArrowUp"
            )
                y -= 10;

            if (
                event.key ===
                "ArrowDown"
            )
                y += 10;

            if (
                event.key ===
                "ArrowLeft"
            )
                x -= 10;

            if (
                event.key ===
                "ArrowRight"
            )
                x += 10;
        };

    setInterval(
        () => {

            socket.emit(
                "gameState",
                {
                    type:
                        "arena",

                    x,
                    y
                }
            );

        },
        30
    );

    socket.on(
        "opponentState",
        state => {

            if (
                state.type ===
                "arena"
            ) {

                opponent.x =
                    state.x;

                opponent.y =
                    state.y;
            }
        }
    );

    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#00f7ff";

        ctx.fillRect(
            x,
            y,
            35,
            35
        );

        ctx.fillStyle =
            "#ff3cac";

        ctx.fillRect(
            opponent.x,
            opponent.y,
            35,
            35
        );

        requestAnimationFrame(
            draw
        );
    }

    draw();
}


/* =====================================================
   MULTIPLAYER HELPERS
===================================================== */

function restartMulti() {

    socket.emit(
        "restartGame"
    );
}


socket.on(
    "restartGame",
    () => {

        if (
            gameMode ===
            "multi"
        ) {

            renderGame();
        }
    }
);


function backLobby() {

    show("lobby");
}


/* =====================================================
   EFFECTS
===================================================== */

function confetti() {

    for (
        let i = 0;
        i < 35;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );

        piece.textContent =
            [
                "✨",
                "🔥",
                "⭐",
                "🎉"
            ][
                Math.floor(
                    Math.random() * 4
                )
            ];

        piece.style.position =
            "fixed";

        piece.style.left =
            Math.random() * 100
            + "%";

        piece.style.top =
            "-30px";

        piece.style.fontSize =
            15 +
            Math.random() * 25
            + "px";

        piece.style.zIndex =
            "9999";

        piece.style.transition =
            "top 1.5s linear";

        document.body.appendChild(
            piece
        );

        setTimeout(
            () => {

                piece.style.top =
                    "110%";

            },
            20
        );

        setTimeout(
            () => {

                piece.remove();

            },
            1600
        );
    }
}
