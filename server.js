const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = new Map();

const quizQuestions = [
    {
        q: "Which planet is known as the Red Planet?",
        options: ["Mars", "Venus", "Jupiter", "Mercury"],
        answer: 0
    },
    {
        q: "What does CPU stand for?",
        options: [
            "Central Processing Unit",
            "Computer Personal Unit",
            "Central Program Utility",
            "Core Processing Utility"
        ],
        answer: 0
    },
    {
        q: "How many sides does a hexagon have?",
        options: ["5", "6", "7", "8"],
        answer: 1
    },
    {
        q: "Which ocean is the largest?",
        options: [
            "Atlantic",
            "Indian",
            "Pacific",
            "Arctic"
        ],
        answer: 2
    },
    {
        q: "Which language is mainly used to style webpages?",
        options: [
            "HTML",
            "CSS",
            "Python",
            "C"
        ],
        answer: 1
    },
    {
        q: "Which device is used to connect networks?",
        options: [
            "Router",
            "Keyboard",
            "Monitor",
            "Printer"
        ],
        answer: 0
    },
    {
        q: "What is 12 × 8?",
        options: ["86", "96", "108", "88"],
        answer: 1
    },
    {
        q: "Which animal is known as the King of the Jungle?",
        options: [
            "Tiger",
            "Elephant",
            "Lion",
            "Wolf"
        ],
        answer: 2
    }
];

function randomQuestion() {
    return quizQuestions[
        Math.floor(Math.random() * quizQuestions.length)
    ];
}

function createRoomCode() {
    return crypto.randomBytes(3).toString("hex").toUpperCase();
}

function findRoom(socket) {
    for (const [code, room] of rooms) {
        if (room.players.some(p => p.id === socket.id)) {
            return { code, room };
        }
    }

    return null;
}

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function checkWinner(board) {

    const wins = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const [a, b, c] of wins) {

        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return board[a];
        }
    }

    if (board.every(Boolean)) {
        return "draw";
    }

    return null;
}

function rpsWinner(a, b) {

    if (a === b) {
        return "draw";
    }

    if (
        (a === "rock" && b === "scissors") ||
        (a === "paper" && b === "rock") ||
        (a === "scissors" && b === "paper")
    ) {
        return "player1";
    }

    return "player2";
}

io.on("connection", socket => {

    console.log("Connected:", socket.id);

    // CREATE ROOM
    socket.on("createRoom", name => {

        let code;

        do {
            code = createRoomCode();
        } while (rooms.has(code));

        const room = {
            players: [
                {
                    id: socket.id,
                    name: name || "Player 1"
                }
            ],

            game: null,

            data: {}
        };

        rooms.set(code, room);

        socket.join(code);

        socket.emit("roomCreated", code);

        io.to(code).emit(
            "players",
            room.players
        );
    });

    // JOIN ROOM
    socket.on("joinRoom", ({ code, name }) => {

        const room = rooms.get(code);

        if (!room) {

            socket.emit(
                "errorMessage",
                "Room does not exist."
            );

            return;
        }

        if (room.players.length >= 2) {

            socket.emit(
                "errorMessage",
                "Room is full."
            );

            return;
        }

        room.players.push({
            id: socket.id,
            name: name || "Player 2"
        });

        socket.join(code);

        io.to(code).emit(
            "players",
            room.players
        );
    });

    // SELECT GAME
    socket.on("selectGame", game => {

        const info = findRoom(socket);

        if (!info) return;

        info.room.game = game;
        info.room.data = {};

        io.to(info.code).emit(
            "gameSelected",
            game
        );
    });

    // TIC TAC TOE
    socket.on("tttMove", index => {

        const info = findRoom(socket);

        if (!info) return;

        const room = info.room;

        if (!room.data.ttt) {

            room.data.ttt = {
                board: Array(9).fill(""),
                turn: room.players[0].id
            };
        }

        const game = room.data.ttt;

        if (game.turn !== socket.id) return;

        if (game.board[index]) return;

        const playerIndex =
            room.players.findIndex(
                p => p.id === socket.id
            );

        game.board[index] =
            playerIndex === 0 ? "X" : "O";

        const winner =
            checkWinner(game.board);

        if (!winner) {

            const opponent =
                room.players.find(
                    p => p.id !== socket.id
                );

            if (opponent) {
                game.turn = opponent.id;
            }
        }

        io.to(info.code).emit(
            "tttUpdate",
            {
                board: game.board,
                turn: game.turn,
                winner
            }
        );
    });

    // RPS
    socket.on("rpsChoice", choice => {

        const info = findRoom(socket);

        if (!info) return;

        if (!info.room.data.rps) {
            info.room.data.rps = {};
        }

        info.room.data.rps[socket.id] =
            choice;

        const choices =
            info.room.data.rps;

        if (
            Object.keys(choices).length ===
            info.room.players.length
        ) {

            const ids =
                Object.keys(choices);

            const result =
                rpsWinner(
                    choices[ids[0]],
                    choices[ids[1]]
                );

            io.to(info.code).emit(
                "rpsResult",
                {
                    choices,
                    result
                }
            );

            info.room.data.rps = {};
        }
    });

    // QUIZ
    socket.on("startQuiz", () => {

        const info = findRoom(socket);

        if (!info) return;

        info.room.data.quiz = {
            question: randomQuestion(),
            answers: {}
        };

        io.to(info.code).emit(
            "quizQuestion",
            info.room.data.quiz.question
        );
    });

    socket.on("quizAnswer", answer => {

        const info = findRoom(socket);

        if (!info) return;

        const quiz =
            info.room.data.quiz;

        if (!quiz) return;

        quiz.answers[socket.id] =
            Number(answer);

        if (
            Object.keys(quiz.answers).length ===
            info.room.players.length
        ) {

            const results = {};

            for (const id in quiz.answers) {

                results[id] =
                    quiz.answers[id] ===
                    quiz.question.answer;
            }

            io.to(info.code).emit(
                "quizResult",
                {
                    results,
                    correct:
                        quiz.question.answer
                }
            );

            setTimeout(() => {

                info.room.data.quiz = {
                    question: randomQuestion(),
                    answers: {}
                };

                io.to(info.code).emit(
                    "quizQuestion",
                    info.room.data.quiz.question
                );

            }, 1800);
        }
    });

    // MEMORY
    socket.on("memoryStart", () => {

        const info = findRoom(socket);

        if (!info) return;

        const cards = shuffle([
            "🍎", "🍎",
            "🚀", "🚀",
            "🎮", "🎮",
            "🐍", "🐍",
            "⚡", "⚡",
            "🔥", "🔥",
            "👾", "👾",
            "🎯", "🎯"
        ]);

        info.room.data.memory = {
            cards,
            flipped: [],
            matched: []
        };

        io.to(info.code).emit(
            "memoryBoard",
            cards
        );
    });

    // REAL-TIME STATE
    socket.on("gameState", state => {

        const info = findRoom(socket);

        if (!info) return;

        socket.to(info.code).emit(
            "opponentState",
            state
        );
    });

    // REMATCH
    socket.on("restartGame", () => {

        const info = findRoom(socket);

        if (!info) return;

        info.room.data = {};

        io.to(info.code).emit(
            "restartGame"
        );
    });

    // DISCONNECT
    socket.on("disconnect", () => {

        const info = findRoom(socket);

        if (!info) return;

        info.room.players =
            info.room.players.filter(
                p => p.id !== socket.id
            );

        if (
            info.room.players.length === 0
        ) {

            rooms.delete(info.code);

        } else {

            io.to(info.code).emit(
                "players",
                info.room.players
            );
        }

        console.log(
            "Disconnected:",
            socket.id
        );
    });
});

server.listen(3000, () => {

    console.log(
        "🔥 GAMEVERSE running at http://localhost:3000"
    );

});
