// // Показываем модалку при старте
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function goBack() {
    window.location.href = "/index.html";
}


// Анимация появления кнопки
window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});

document.getElementById("backBtn").addEventListener("click", goBack);


//liderbord
let currentUser = null;

// Картинки
const birdImg = new Image();
birdImg.src = "../img/geeksLogo.svg";

const bgImg = new Image();
bgImg.src = "../img/background.png";

let bgX = 0;
const bgSpeed = 0.5;
let animationId;
let isGameOver = false;

// Устанавливаем размеры канваса
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Птица
let bird = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    width: 50,
    height: 80,
    gravity: 0.4,
    lift: -10,
    velocity: 0
};

// Трубы
let pipes = [];
let frame = 0;
let pipeGap = 300;
let pipeWidth = 60;
let pipeSpeed = 2.2;
let pipeColor = "#FFD700";

// Счёт
let score = 0;

// DOM элементы
const gameOverModal = document.getElementById("gameOverModal");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

// Регистрация
const registrationModal = document.getElementById("registrationModal");
registrationModal.style.display = "flex";
const saveUserBtn = document.getElementById("saveUserBtn");

document.addEventListener("keydown", jump);
document.addEventListener("touchstart", jump);

function jump() {
    if (!isGameOver) {
        bird.velocity = bird.lift;
    }
}

function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    finalScore.textContent = score;
    if (currentUser) {
        currentUser.score = score;

        // Сохраняем в localStorage
        let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

        // Обновляем, если пользователь уже есть
        const existing = leaderboard.find(u => u.phone === currentUser.phone);
        if (existing) {
            if (score > existing.score) {
                existing.score = score;
            }
        } else {
            leaderboard.push(currentUser);
        }

        localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    }
    gameOverModal.classList.remove("hidden");
}

function resetGame() {
    isGameOver = false;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    frame = 0;
    score = 0;
    pipeGap = 300;
    pipeSpeed = 2.2;
    pipeColor = "#FFD700";
    gameOverModal.classList.add("hidden");
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    gameLoop();
}

restartBtn.addEventListener("click", resetGame);

function update() {
    if (isGameOver) return;

    frame++;
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Двигающийся фон
    bgX -= bgSpeed;
    if (bgX <= -canvas.width) {
        bgX = 0;
    }

    // Новая труба
    if (frame % 100 === 0) {
        let top = Math.random() * (canvas.height - pipeGap - 100);
        pipes.push({
            x: canvas.width,
            top,
            bottom: top + pipeGap,
            passed: false
        });
    }

    // Уровни сложности
    if (score >= 20) {
        pipeSpeed = 4.5;
        pipeGap = 140;
        pipeColor = "#90EE90"; // светло-зелёный
    } else if (score >= 10) {
        pipeSpeed = 3.2;
        pipeGap = 160;
        pipeColor = "#00BFFF"; // голубой
    }

    // Движение труб и столкновения
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;

        if (
            bird.x + bird.width > pipes[i].x &&
            bird.x < pipes[i].x + pipeWidth &&
            (bird.y < pipes[i].top || bird.y + bird.height > pipes[i].bottom)
        ) {
            gameOver();
        }

        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }

        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].passed = true;
            score++;
        }
    }

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Фон
    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);

    // Птица
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Трубы
    ctx.fillStyle = pipeColor;
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    });

    // Счёт
    ctx.fillStyle = "#FFD700";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Счёт: ${score}`, canvas.width / 2, 40);
}

function gameLoop() {
    if (isGameOver) return;
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

const savedUser = localStorage.getItem("currentUser");
if (savedUser) {
    // Если данные о пользователе есть, то игра уже началась
    currentUser = JSON.parse(savedUser);
    registrationModal.style.display = "none";  // Скрываем модальное окно
    gameLoop(); // Запускаем игру
} else {
    // Если данных нет, показываем модальное окно
    registrationModal.style.display = "flex"; 
}

// Проверка, если пользователь уже зарегистрирован
const savdUser = localStorage.getItem("currentUser");
if (savdUser) {
    // Если данные о пользователе есть, то игра уже началась
    currentUser = JSON.parse(savdUser);
    registrationModal.style.display = "none";  // Скрываем модальное окно
    gameLoop(); // Запускаем игру
} else {
    // Если данных нет, показываем модальное окно
    registrationModal.style.display = "flex"; 
}

// Регистрация
saveUserBtn.addEventListener("click", () => {
    const name = document.getElementById("userName").value.trim();
    const phone = document.getElementById("userPhone").value.trim();

    const kyrgyzPhoneRegex = /^\+996\d{9}$/;

    // Проверка на корректность данных
    if (!name || !kyrgyzPhoneRegex.test(phone)) {
        alert("Введите имя и корректный номер (+996XXXXXXXXX)");
        return;
    }

    // Создаём объект пользователя
    currentUser = { name, phone, score: 0 };
    localStorage.setItem("currentUser", JSON.stringify(currentUser)); // Сохраняем пользователя в localStorage

    // Отправка данных на API Bitrix24
    const apiUrl = "https://geektech.bitrix24.ru/rest/1/e08w1jvst0jj152c/crm.lead.add.json";
    
    const params = new URLSearchParams({
        "fields[SOURCE_ID]": 127,
        "fields[NAME]": name,
        "fields[TITLE]": "GEEKS GAME: Хакатон 2025",
        "fields[PHONE][0][VALUE]": phone,
        "fields[PHONE][0][VALUE_TYPE]": "WORK"
    });

    fetch(`${apiUrl}?${params.toString()}`, {
        method: "GET",  // Метод GET для API Bitrix24
    })
    .then(response => response.json())
    .then(data => {
        if (data.result) {
            // Если запрос успешен, скрываем модалку и начинаем игру
            registrationModal.style.display = "none";  // Скрываем модальное окно

            // Запуск игры
            gameLoop(); // запускаем игру
        } else {
            alert("Произошла ошибка при отправке данных на сервер.");
        }
    })
    .catch(error => {
        console.error("Ошибка запроса:", error);
        alert("Ошибка сети. Попробуйте позже.");
    });
});


// // Регистрация
// saveUserBtn.addEventListener("click", () => {
//     const name = document.getElementById("userName").value.trim();
//     const phone = document.getElementById("userPhone").value.trim();

//     const kyrgyzPhoneRegex = /^\+996\d{9}$/;

//     if (!name || !kyrgyzPhoneRegex.test(phone)) {
//         alert("Введите имя и корректный номер (+996XXXXXXXXX)");
//         return;
//     }

//     currentUser = { name, phone, score: 0 };
//     localStorage.setItem("currentUser", JSON.stringify(currentUser));

//     // Отправка данных на API Bitrix24
//     const apiUrl = "https://geektech.bitrix24.ru/rest/1/e08w1jvst0jj152c/crm.lead.add.json";
    
//     const params = new URLSearchParams({
//         "fields[SOURCE_ID]": 127,
//         "fields[NAME]": name,
//         "fields[TITLE]": "GEEKS GAME: Хакатон 2025",
//         "fields[PHONE][0][VALUE]": phone,
//         "fields[PHONE][0][VALUE_TYPE]": "WORK"
//     });

//     fetch(`${apiUrl}?${params.toString()}`, {
//         method: "GET",  // Метод GET для API Bitrix24
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.result) {

//             gameLoop();
//         } else {
//             alert("Произошла ошибка при отправке данных на сервер.");
//         }
//     })
//     .catch(error => {
//         console.error("Ошибка запроса:", error);
//         alert("Ошибка сети. Попробуйте позже.");
//     });

//     gameLoop(); // запускаем игру
// });
// saveUserBtn.addEventListener('click', () => {
//     registrationModal.style.display = 'none';
//   })
