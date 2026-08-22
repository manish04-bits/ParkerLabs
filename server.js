const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = new Map();

function roomCode() {
    return crypto.randomBytes(3).toString("hex").toUpperCase();
}

function getRoom(socket) {
    for (const [code, room] of rooms) {
        if (room.players.some(p => p.id === socket.id)) {
            return { code, room };
        }
    }
    return null;
}

io.on("connection", socket => {

    socket.on("createRoom", name => {

        const code = roomCode();

        rooms.set(code, {
            game: null,
            players: [{
                id: socket.id,
                name: name || "Player 1"
            }],
            data: {}
        });

        socket.join(code);

        socket.emit("roomCreated", code);
        io.to(code).emit("players", rooms.get(code).players);
    });

    socket.on("joinRoom", ({ code, name }) => {

        const room = rooms.get(code);

        if (!room) {
            socket.emit("errorMessage", "Room not found.");
            return;
        }

        if (room.players.length >= 2) {
            socket.emit("errorMessage", "Room is full.");
            return;
        }

        room.players.push({
            id: socket.id,
            name: name || "Player 2"
        });

        socket.join(code);

        io.to(code).emit("players", room.players);
    });

    socket.on("selectGame", game => {

        const info = getRoom(socket);

        if (!info) return;

        info.room.game = game;
        info.room.data = {};

        io.to(info.code).emit("gameSelected", game);
    });

    /*
    =================================
    TIC TAC TOE
    =================================
    */

    socket.on("tttMove", index => {

        const info = getRoom(socket);
        if (!info) return;

        const room = info.room;

        if (!room.data.board) {
            room.data.board = Array(9).fill("");
            room.data.turn = room.players[0].id;
        }

        if (socket.id !== room.data.turn) return;
        if (room.data.board[index]) return;

        room.data.board[index] =
            room.players.findIndex(p => p.id === socket.id) === 0
                ? "X"
                : "O";

        const winner = checkWinner(room.data.board);

        if (winner) {
            io.to(info.code).emit("tttUpdate", {
                board: room.data.board,
                winner
            });
            return;
        }

        room.data.turn =
            room.players.find(p => p.id !== socket.id)?.id;

        io.to(info.code).emit("tttUpdate", {
            board: room.data.board,
            turn: room.data.turn
        });
    });

    /*
    =================================
    ROCK PAPER SCISSORS
    =================================
    */

    socket.on("rpsChoice", choice => {

        const info = getRoom(socket);
        if (!info) return;

        if (!info.room.data.rps) {
            info.room.data.rps = {};
        }

        info.room.data.rps[socket.id] = choice;

        const choices = info.room.data.rps;

        if (Object.keys(choices).length === 2) {

            const ids = Object.keys(choices);

            const result = rpsWinner(
                choices[ids[0]],
                choices[ids[1]]
            );

            io.to(info.code).emit("rpsResult", {
                choices,
                result
            });

            info.room.data.rps = {};
        }
    });

    /*
    =================================
    QUIZ BATTLE
    =================================
    */

    socket.on("quizAnswer", answer => {

        const info = getRoom(socket);
        if (!info) return;

        if (!info.room.data.quiz) {
            info.room.data.quiz = {
                question: randomQuestion(),
                answers: {}
            };

            io.to(info.code).emit(
                "quizQuestion",
                info.room.data.quiz.question
            );
        }

        info.room.data.quiz.answers[socket.id] = answer;

        if (
            Object.keys(info.room.data.quiz.answers).length ===
            info.room.players.length
        ) {

            const q = info.room.data.quiz;

            const results = {};

            for (const id in q.answers) {
                results[id] =
                    q.answers[id] === q.question.answer;
            }

            io.to(info.code).emit("quizResult", {
                results,
                correct: q.question.answer
            });

            info.room.data.quiz = {
                question: randomQuestion(),
                answers: {}
            };

            setTimeout(() => {
                io.to(info.code).emit(
                    "quizQuestion",
                    info.room.data.quiz.question
                );
            }, 1500);
        }
    });

    /*
    =================================
    MEMORY BATTLE
    =================================
    */

    socket.on("memoryStart", () => {

        const info = getRoom(socket);
        if (!info) return;

        const cards = shuffle([
            "🍎", "🍎",
            "🚀", "🚀",
            "🎮", "🎮",
            "🐍", "🐍",
            "⚡", "⚡",
            "🔥", "🔥"
        ]);

        info.room.data.memory = {
            cards,
            flipped: [],
            matched: []
        };

        io.to(info.code).emit(
            "memoryBoard",
            cards.map(() => false)
        );
    });

    /*
    =================================
    GENERIC REAL-TIME GAMES
    =================================
    */

    socket.on("gameState", state => {

        const info = getRoom(socket);
        if (!info) return;

        socket.to(info.code).emit(
            "opponentState",
            state
        );
    });

    socket.on("restartGame", () => {

        const info = getRoom(socket);
        if (!info) return;

        info.room.data = {};

        io.to(info.code).emit("restartGame");
    });

    socket.on("disconnect", () => {

        const info = getRoom(socket);

        if (!info) return;

        info.room.players =
            info.room.players.filter(
                p => p.id !== socket.id
            );

        if (info.room.players.length === 0) {
            rooms.delete(info.code);
        } else {
            io.to(info.code).emit(
                "players",
                info.room.players
            );
        }
    });
});


function checkWinner(board) {

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

    for (const [a,b,c] of wins) {

        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return board[a];
        }
    }

    if (board.every(Boolean)) return "draw";

    return null;
}


function rpsWinner(a, b) {

    if (a === b) return "draw";

    if (
        (a === "rock" && b === "scissors") ||
        (a === "paper" && b === "rock") ||
        (a === "scissors" && b === "paper")
    ) {
        return "player1";
    }

    return "player2";
}


const questions = [

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
        q: "Which language is primarily used to style web pages?",
        options: [
            "HTML",
            "CSS",
            "Python",
            "C"
        ],
        answer: 1
    }

];

function randomQuestion() {

    return questions[
        Math.floor(Math.random() * questions.length)
    ];
}


function shuffle(array) {

    return [...array].sort(
        () => Math.random() - 0.5
    );
}


server.listen(3000, () => {

    console.log(
        "🔥 GameVerse running at http://localhost:3000"
    );

});
