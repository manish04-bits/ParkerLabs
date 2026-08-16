const intro = document.getElementById("intro");
const question = document.getElementById("question");
const proposal = document.getElementById("proposal");
const success = document.getElementById("success");

const noBtn = document.getElementById("noBtn");
const hint = document.getElementById("hint");


/* SCREEN SWITCHER */

function hideAll() {

    intro.classList.add("hidden");
    question.classList.add("hidden");
    proposal.classList.add("hidden");
    success.classList.add("hidden");

}


function startProposal() {

    hideAll();

    question.classList.remove("hidden");

}


function showProposal() {

    hideAll();

    proposal.classList.remove("hidden");

}


/* YES */

function yesClicked() {

    hideAll();

    success.classList.remove("hidden");

    createConfetti();

    for (let i = 0; i < 25; i++) {
        createHeart();
    }

}


/* RUNNING NO BUTTON */

let noCount = 0;

function noClicked() {

    noCount++;

    const messages = [
        "Are you sure? 👀",
        "Think again 😭",
        "That button seems suspicious...",
        "You really want to press NO? 💀",
        "Nice try 😂",
        "The universe says NO to your NO."
    ];

    hint.textContent =
        messages[Math.min(noCount - 1, messages.length - 1)];


    const x = Math.random() * 240 - 120;
    const y = Math.random() * 120 - 60;

    noBtn.style.transform =
        `translate(${x}px, ${y}px)`;
}


/* CONFETTI */

function createConfetti() {

    for (let i = 0; i < 120; i++) {

        const piece = document.createElement("div");

        piece.classList.add("confetti");

        piece.style.left =
            Math.random() * 100 + "vw";

        piece.style.animationDelay =
            Math.random() * 1.5 + "s";

        piece.style.transform =
            `rotate(${Math.random() * 360}deg)`;

        document.body.appendChild(piece);


        setTimeout(() => {

            piece.remove();

        }, 4000);

    }

}


/* FLOATING HEART */

function createHeart() {

    const heart =
        document.createElement("div");

    heart.classList.add("heart");

    heart.innerHTML =
        ["❤️", "💗", "💖", "💕", "💘"][
            Math.floor(Math.random() * 5)
        ];

    heart.style.left =
        Math.random() * 100 + "vw";

    heart.style.animationDuration =
        (3 + Math.random() * 4) + "s";

    heart.style.fontSize =
        (15 + Math.random() * 25) + "px";

    document.querySelector(".hearts")
        .appendChild(heart);


    setTimeout(() => {

        heart.remove();

    }, 7000);

}


/* CONTINUOUS HEARTS */

setInterval(() => {

    createHeart();

}, 1200);


/* RESTART */

function restart() {

    location.reload();

}
