const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

const questions = [
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Mars", "Venus", "Jupiter", "Mercury"],
        answer: 0
    },
    {
        question: "What does CPU stand for?",
        options: [
            "Central Processing Unit",
            "Computer Personal Unit",
            "Central Program Utility",
            "Core Processing Utility"
        ],
        answer: 0
    },
    {
        question: "How many sides does a hexagon have?",
        options: ["5", "6", "7", "8"],
        answer: 1
    },
    {
        question: "What is 12 × 8?",
        options: ["86", "96", "108", "88"],
        answer: 1
    },
    {
        question: "Which ocean is the largest?",
        options: [
            "Atlantic",
            "Indian",
            "Pacific",
            "Arctic"
        ],
        answer: 2
    },
    {
        question: "Which language is used to style webpages?",
        options: [
            "HTML",
            "CSS",
            "Python",
            "C"
        ],
        answer: 1
    },
    {
        question: "Which animal is known as the King of the Jungle?",
        options: [
            "Tiger",
            "Lion",
            "Elephant",
            "Wolf"
        ],
        answer: 1
    },
    {
        question: "How many continents are there?",
        options: ["5", "6", "7", "8"],
        answer: 2
    }
];

function randomQuestion() {
    return questions[
        Math.floor(Math.random() * questions.length)
    ];
}

function createRoomCode() {
    return Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
}

function getRoom(socket) {
    return Object.values(rooms).find(room =>
        room.players.some(player => player.id === socket.id)
    );
}

function winner(board) {

    const lines = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];

    for (const [a,b,c] of lines) {

        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return board[a];
        }
    }

    if (board.every(Boolean)) {
        return "DRAW";
    }

    return null;
}

io.on("connection", socket => {

    console.log("Player connected:", socket.id);

    socket.on("createRoom", name => {

        let code;

        do {
            code = createRoomCode();
        } while (rooms[code]);

        rooms[code] = {
            players: [
                {
                    id: socket.id,
                    name: name || "Player 1"
                }
            ],

            game: null,

            ttt: {
                board: Array(9).fill(""),
                turn: socket.id
            },

            quiz: null,

            rps: {}
        };

        socket.join(code);

        socket.roomCode = code;

        socket.emit("roomCreated", code);

        io.to(code).emit(
            "players",
            rooms[code].players
        );
    });


    socket.on("joinRoom", ({ code, name }) => {

        code = code.toUpperCase();

        const room = rooms[code];

        if (!room) {

            socket.emit(
                "errorMessage",
                "❌ Room not found."
            );

            return;
        }

        if (room.players.length >= 2) {

            socket.emit(
                "errorMessage",
                "❌ Room is full."
            );

            return;
        }

        room.players.push({
            id: socket.id,
            name: name || "Player 2"
        });

        socket.join(code);

        socket.roomCode = code;

        io.to(code).emit(
            "players",
            room.players
        );
    });


    socket.on("selectGame", game => {

        const room = getRoom(socket);

        if (!room) return;

        room.game = game;

        room.ttt = {
            board: Array(9).fill(""),
            turn: room.players[0].id
        };

        room.rps = {};

        io.to(socket.roomCode).emit(
            "gameSelected",
            game
        );
    });


    // -------------------------
    // TIC TAC TOE
    // -------------------------

    socket.on("tttMove", index => {

        const room = getRoom(socket);

        if (!room) return;

        const game = room.ttt;

        if (game.turn !== socket.id) return;

        if (game.board[index]) return;

        const player =
            room.players.findIndex(
                p => p.id === socket.id
            );

        game.board[index] =
            player === 0 ? "X" : "O";

        const result =
            winner(game.board);

        if (!result) {

            const other =
                room.players.find(
                    p => p.id !== socket.id
                );

            if (other) {
                game.turn = other.id;
            }
        }

        io.to(socket.roomCode).emit(
            "tttUpdate",
            {
                board: game.board,
                turn: game.turn,
                result
            }
        );
    });


    // -------------------------
    // ROCK PAPER SCISSORS
    // -------------------------

    socket.on("rpsChoice", choice => {

        const room = getRoom(socket);

        if (!room) return;

        room.rps[socket.id] = choice;

        if (
            Object.keys(room.rps).length === 2
        ) {

            const ids =
                Object.keys(room.rps);

            const a =
                room.rps[ids[0]];

            const b =
                room.rps[ids[1]];

            let result = "DRAW";

            if (a !== b) {

                if (
                    (a === "rock" &&
                        b === "scissors") ||

                    (a === "paper" &&
                        b === "rock") ||

                    (a === "scissors" &&
                        b === "paper")
                ) {
                    result = ids[0];
                } else {
                    result = ids[1];
                }
            }

            io.to(socket.roomCode).emit(
                "rpsResult",
                {
                    choices: room.rps,
                    result
                }
            );

            room.rps = {};
        }
    });


    // -------------------------
    // QUIZ
    // -------------------------

    socket.on("startQuiz", () => {

        const room = getRoom(socket);

        if (!room) return;

        room.quiz = {
            question: randomQuestion(),
            answers: {}
        };

        io.to(socket.roomCode).emit(
            "quizQuestion",
            room.quiz.question
        );
    });


    socket.on("quizAnswer", answer => {

        const room = getRoom(socket);

        if (!room || !room.quiz) return;

        room.quiz.answers[socket.id] =
            Number(answer);

        if (
            Object.keys(room.quiz.answers).length === 2
        ) {

            const results = {};

            for (
                const id in room.quiz.answers
            ) {

                results[id] =
                    room.quiz.answers[id] ===
                    room.quiz.question.answer;
            }

            io.to(socket.roomCode).emit(
                "quizResult",
                {
                    correct:
                        room.quiz.question.answer,
                    results
                }
            );
        }
    });


    // -------------------------
    // REAL-TIME GAMES
    // -------------------------

    socket.on("gameState", state => {

        if (!socket.roomCode) return;

        socket.to(socket.roomCode).emit(
            "opponentState",
            state
        );
    });


    // -------------------------
    // REMATCH
    // -------------------------

    socket.on("rematch", () => {

        const room = getRoom(socket);

        if (!room) return;

        room.ttt = {
            board: Array(9).fill(""),
            turn: room.players[0].id
        };

        room.rps = {};

        room.quiz = null;

        io.to(socket.roomCode).emit(
            "rematch"
        );
    });


    // -------------------------
    // DISCONNECT
    // -------------------------

    socket.on("disconnect", () => {

        const code =
            socket.roomCode;

        if (!code || !rooms[code]) return;

        rooms[code].players =
            rooms[code].players.filter(
                player =>
                    player.id !== socket.id
            );

        if (
            rooms[code].players.length === 0
        ) {

            delete rooms[code];

        } else {

            io.to(code).emit(
                "players",
                rooms[code].players
            );
        }

        console.log(
            "Player disconnected:",
            socket.id
        );
    });

});


server.listen(3000, () => {

    console.log("");
    console.log("=================================");
    console.log("🔥 GAMEVERSE IS RUNNING 🔥");
    console.log("=================================");
    console.log("");
    console.log(
        "Open: http://localhost:3000"
    );
    console.log("");

});
