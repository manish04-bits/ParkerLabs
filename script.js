const questions = [

    {
        question: "If Manish suddenly says \"Bro, I have an idea\", what should you expect?",
        options: [
            "Something completely normal",
            "A serious life-changing plan",
            "Some random nonsense that somehow becomes fun",
            "He's finally becoming productive 😭"
        ],
        answer: 2,
        reward: "🎁 +10 XP — Congratulations. You survived another Manish idea."
    },

    {
        question: "If Manish gets a completely free day, what would he enjoy doing?",
        options: [
            "Make a detailed schedule",
            "Go outside all day",
            "Absolutely nothing 😂",
            "Clean everything"
        ],
        answer: 2,
        reward: "🎁 +10 XP — You discovered Manish's secret talent: doing absolutely nothing."
    },

    {
        question: "What would Manish probably watch when he feels bored?",
        options: [
            "Random documentaries",
            "Sports highlights",
            "One Piece or some anime stuff",
            "The news"
        ],
        answer: 2,
        reward: "🎁 +10 XP — You know the pirate life. Respect. 🏴‍☠️"
    },

    {
        question: "What would Manish probably do when he's completely free and has nothing to do?",
        options: [
            "Listen to music 🎧",
            "Watch random stuff",
            "Talk to ChatGPT 🤖",
            "Honestly… probably rotate between all three"
        ],
        answer: 3,
        reward: "🎁 +10 XP — You understand the Manish boredom cycle."
    },

    {
        question: "What's most likely to make Manish laugh unexpectedly?",
        options: [
            "A perfectly planned joke",
            "Something completely random",
            "A motivational speech",
            "A serious conversation"
        ],
        answer: 1,
        reward: "🎁 +10 XP — Apparently randomness is comedy now. 😂"
    },

    {
        question: "If Manish says \"I'm coming in 5 minutes\", what does that actually mean?",
        options: [
            "Exactly 5 minutes",
            "10 minutes",
            "Eventually 😂",
            "He's already there"
        ],
        answer: 2,
        reward: "🎁 +10 XP — You understand the ancient Manish time system."
    },

    {
        question: "What's Manish most likely to do when absolutely nothing interesting is happening?",
        options: [
            "Go outside and find something to do",
            "Start a random conversation",
            "Find something productive",
            "Nothing. Absolutely nothing. 🗿"
        ],
        answer: 3,
        reward: "🎁 +10 XP — Congratulations. You understand the ancient art of doing NOTHING."
    }

];

let currentQuestion = 0;
let score = 0;
let answered = false;

function startQuiz() {

    currentQuestion = 0;
    score = 0;

    document.getElementById("home").classList.remove("active");
    document.getElementById("quiz").classList.add("active");

    loadQuestion();
}

function loadQuestion() {

    answered = false;

    const q = questions[currentQuestion];

    document.getElementById("question").textContent = q.question;

    document.getElementById("questionNumber").textContent =
        `${String(currentQuestion + 1).padStart(2, "0")} / 07`;

    document.getElementById("progress").style.width =
        `${((currentQuestion) / questions.length) * 100}%`;

    document.getElementById("score").textContent = score;

    const optionsContainer = document.getElementById("options");

    optionsContainer.innerHTML = "";

    document.getElementById("feedback").textContent = "";

    document.getElementById("nextBtn").style.display = "none";

    q.options.forEach((option, index) => {

        const button = document.createElement("button");

        button.className = "option";
        button.textContent = option;

        button.onclick = () => selectAnswer(index, button);

        optionsContainer.appendChild(button);
    });
}

function selectAnswer(selected, clickedButton) {

    if (answered) return;

    answered = true;

    const q = questions[currentQuestion];

    const allOptions = document.querySelectorAll(".option");

    allOptions.forEach(button => {
        button.disabled = true;
    });

    if (selected === q.answer) {

        clickedButton.classList.add("correct");

        score += 10;

        document.getElementById("feedback").innerHTML =
            `<span style="color:#00ff78">${q.reward}</span>`;

    } else {

        clickedButton.classList.add("wrong");

        allOptions[q.answer].classList.add("correct");

        document.getElementById("feedback").innerHTML =
            `<span style="color:#ff5050">
            ❌ WRONG — You have officially disappointed Manish. 😂
            </span>`;
    }

    document.getElementById("score").textContent = score;

    document.getElementById("nextBtn").style.display = "inline-block";
}

function nextQuestion() {

    currentQuestion++;

    if (currentQuestion >= questions.length) {
        showResult();
        return;
    }

    loadQuestion();
}

function showResult() {

    document.getElementById("quiz").classList.remove("active");
    document.getElementById("result").classList.add("active");

    document.getElementById("finalScore").textContent = score;

    let title;
    let message;

    if (score === 70) {

        title = "🕷️ MANISH LORE MASTER";

        message =
            "YOU ACTUALLY KNOW MANISH. This is either impressive or slightly concerning.";

        document.getElementById("reward").textContent =
            "🏆 SECRET REWARD UNLOCKED — Certified Real One.";

    } else if (score >= 50) {

        title = "🔥 CERTIFIED HOMIE";

        message =
            "Okay... you actually pay attention. Manish might allow you to stay in the friend group.";

        document.getElementById("reward").textContent =
            "🎁 Reward unlocked: Respect +10.";

    } else if (score >= 30) {

        title = "👀 CASUAL OBSERVER";

        message =
            "You know some Manish lore. But there's still a LOT you don't know.";

        document.getElementById("reward").textContent =
            "🎁 Reward: You may continue your investigation.";

    } else {

        title = "🥔 WHO EVEN ARE YOU?";

        message =
            "You might have met Manish once. Please investigate further.";

        document.getElementById("reward").textContent =
            "💀 Reward: Absolutely nothing. Just like Manish's free day.";

    }

    document.getElementById("resultTitle").textContent = title;

    document.getElementById("resultMessage").textContent = message;
}

function restartQuiz() {

    document.getElementById("result").classList.remove("active");
    document.getElementById("home").classList.add("active");

    score = 0;
    currentQuestion = 0;
}
