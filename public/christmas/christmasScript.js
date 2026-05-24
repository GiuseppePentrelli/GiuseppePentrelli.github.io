function startChristmasCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const christmasDate = new Date(currentYear, 11, 25);

    if (now > christmasDate) {
        christmasDate.setFullYear(currentYear + 1);
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = christmasDate - now;

        const oneSecond = 1000;
        const oneMinute = oneSecond * 60;
        const oneHour = oneMinute * 60;
        const oneDay = oneHour * 24;

        const days = Math.floor(distance / oneDay);
        const hours = Math.floor((distance % oneDay) / oneHour);
        const minutes = Math.floor((distance % oneHour) / oneMinute);
        const seconds = Math.floor((distance % oneMinute) / oneSecond);

        document.getElementById("days-number").textContent = days;
        document.getElementById("hours-number").textContent = hours.toString().padStart(2, "0");
        document.getElementById("minutes-number").textContent = minutes.toString().padStart(2, "0");
        document.getElementById("seconds-number").textContent = seconds.toString().padStart(2, "0");

        if (distance < 0) {
            clearInterval(interval);
            document.getElementById("countdown").innerHTML = "<h2>🎄 È Natale! 🎁</h2>";
            document.querySelector(".countdown-title").textContent = "Buon Natale!";
        }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
}

/* ❄️ Optional snow effect */
function createSnow() {
    for (let i = 0; i < 40; i++) {
        const snow = document.createElement("div");
        snow.classList.add("snowflake");
        snow.textContent = "❄";
        snow.style.left = Math.random() * 100 + "vw";
        snow.style.animationDuration = 4 + Math.random() * 6 + "s";
        snow.style.fontSize = 12 + Math.random() * 16 + "px";
        document.body.appendChild(snow);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    startChristmasCountdown();
    createSnow(); 
    createSnow(); 


});
