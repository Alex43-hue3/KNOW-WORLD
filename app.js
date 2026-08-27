/* =========================================================
   KNOW WORLD
   Sistema inicial del juego
========================================================= */


/* =========================================================
   DATOS DEL JUGADOR
========================================================= */

let player = {

    name: "ALEX",

    exp: 12450,

    historicalExp: 87420,

    coins: 8750,

    lives: 5,

    maxLives: 5,

    ranking: 47,

    streak: 7,

    bestStreak: 23,

    level: 23,

    title: "Explorador del Saber",

    expRecoveryCost: 200,

    coinRecoveryCost: 500

};


/* =========================================================
   ELEMENTOS
========================================================= */

const expElement = document.getElementById("exp");
const coinsElement = document.getElementById("coins");
const livesElement = document.getElementById("lives");
const positionElement = document.getElementById("position");

const lifeModal = document.getElementById("lifeModal");

const expCostElement = document.getElementById("expCost");


/* =========================================================
   ACTUALIZAR INTERFAZ
========================================================= */

function updateUI() {

    expElement.textContent =
        player.exp.toLocaleString("es-MX");

    coinsElement.textContent =
        player.coins.toLocaleString("es-MX");

    livesElement.textContent =
        `${player.lives}/${player.maxLives}`;

    positionElement.textContent =
        `#${player.ranking}`;

    expCostElement.textContent =
        `${player.expRecoveryCost} EXP`;

}


/* =========================================================
   CAMBIAR PANTALLA
========================================================= */

function showScreen(screenId) {

    document.querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove("active");

        });


    const target =
        document.getElementById(screenId);


    if (target) {

        target.classList.add("active");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

}


/* =========================================================
   INICIAR JUEGO
========================================================= */

function startGame() {

    if (player.lives <= 0) {

        openLifeRecovery();

        return;

    }

    showScreen("gameScreen");

    startQuestionTimer();

}


/* =========================================================
   TEMPORIZADOR DE PREGUNTA
========================================================= */

let questionTimerInterval;

function startQuestionTimer() {

    clearInterval(questionTimerInterval);

    let time = 12;

    const timer =
        document.getElementById("questionTimer");

    timer.textContent = time;


    questionTimerInterval =
        setInterval(() => {

            time--;

            timer.textContent = time;


            if (time <= 0) {

                clearInterval(questionTimerInterval);

                questionTimeout();

            }

        }, 1000);

}


/* =========================================================
   TIEMPO AGOTADO
========================================================= */

function questionTimeout() {

    loseLife();

    setTimeout(() => {

        nextQuestion();

    }, 800);

}


/* =========================================================
   RESPONDER
========================================================= */

let secondChance = false;

function answerQuestion(button, correct) {

    clearInterval(questionTimerInterval);


    if (correct) {

        button.classList.add("correct");

        earnExp(50);

        player.streak++;

        if (player.streak > player.bestStreak) {

            player.bestStreak =
                player.streak;

        }


        setTimeout(() => {

            nextQuestion();

        }, 900);


        return;

    }


    /* ================================================
       PRIMER ERROR
    ================================================= */

    if (!secondChance) {

        secondChance = true;

        button.classList.add("wrong");

        loseLife();

        alert(
            "❌ Incorrecto\n\nTienes una segunda oportunidad."
        );

        startQuestionTimer();

        return;

    }


    /* ================================================
       SEGUNDO ERROR
    ================================================= */

    button.classList.add("wrong");

    player.streak = 0;

    loseLife();


    setTimeout(() => {

        nextQuestion();

    }, 900);

}


/* =========================================================
   PERDER VIDA
========================================================= */

function loseLife() {

    if (player.lives > 0) {

        player.lives--;

        updateUI();

    }

}


/* =========================================================
   GANAR EXP
========================================================= */

function earnExp(amount) {

    player.exp += amount;

    player.historicalExp += amount;

    updateUI();

}


/* =========================================================
   SIGUIENTE PREGUNTA
========================================================= */

function nextQuestion() {

    secondChance = false;

    document
        .querySelectorAll(".answers button")
        .forEach(button => {

            button.classList.remove(
                "correct",
                "wrong"
            );

        });


    if (player.lives <= 0) {

        openLifeRecovery();

        showScreen("homeScreen");

        return;

    }


    startQuestionTimer();

}


/* =========================================================
   RECUPERAR VIDAS
========================================================= */

function openLifeRecovery() {

    if (player.lives >= player.maxLives) {

        alert(
            "❤️ Ya tienes todas tus vidas."
        );

        return;

    }

    lifeModal.classList.add("show");

}


function closeLifeRecovery() {

    lifeModal.classList.remove("show");

}


/* =========================================================
   RECUPERAR CON EXP
========================================================= */

function recoverWithExp() {

    const cost =
        player.expRecoveryCost;


    if (player.exp < cost) {

        alert(
            "No tienes suficiente EXP."
        );

        return;

    }


    player.exp -= cost;

    player.lives++;

    if (player.lives > player.maxLives) {

        player.lives =
            player.maxLives;

    }


    /*
       El costo aumenta con cada uso.
    */

    player.expRecoveryCost += 100;


    updateUI();

    closeLifeRecovery();


    alert(
        `❤️ Vida recuperada.\n\n` +
        `Costo: ${cost} EXP\n` +
        `Siguiente recuperación: ${player.expRecoveryCost} EXP`
    );

}


/* =========================================================
   RECUPERAR CON MONEDAS
========================================================= */

function recoverWithCoins() {

    const cost =
        player.coinRecoveryCost;


    if (player.coins < cost) {

        alert(
            "No tienes suficientes monedas."
        );

        return;

    }


    player.coins -= cost;

    player.lives++;


    if (player.lives > player.maxLives) {

        player.lives =
            player.maxLives;

    }


    updateUI();

    closeLifeRecovery();


    alert(
        "❤️ Vida recuperada por 500 monedas."
    );

}


/* =========================================================
   TEMPORIZADOR DE RECUPERACIÓN
========================================================= */

let lifeSeconds = 30 * 60;


function updateLifeTimer() {

    if (player.lives >= player.maxLives) {

        lifeSeconds = 30 * 60;

        document.getElementById(
            "lifeTimer"
        ).textContent =
            "VIDAS COMPLETAS";

        return;

    }


    let minutes =
        Math.floor(lifeSeconds / 60);

    let seconds =
        lifeSeconds % 60;


    document.getElementById(
        "lifeTimer"
    ).textContent =
        `+1 vida en ${minutes
            .toString()
            .padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;


    lifeSeconds--;


    if (lifeSeconds < 0) {

        if (player.lives < player.maxLives) {

            player.lives++;

            updateUI();

        }

        lifeSeconds =
            30 * 60;

    }

}


setInterval(updateLifeTimer, 1000);


/* =========================================================
   CATEGORÍAS
========================================================= */

function showCategories() {

    alert(
        "📚 CATEGORÍAS\n\n" +
        "🌎 Geografía\n" +
        "🏛️ Historia\n" +
        "🔬 Ciencia\n" +
        "🧬 Biología\n" +
        "💻 Tecnología\n" +
        "🎨 Arte\n" +
        "🎵 Música\n" +
        "🎬 Cine\n" +
        "⚽ Deportes\n" +
        "📚 Literatura"
    );

}


/* =========================================================
   INICIALIZAR
========================================================= */

updateUI();

updateLifeTimer();
