/* =========================================================
   BLOODLINK - MAIN JAVASCRIPT
   Emergency Blood Donor Finder System
   ========================================================= */


/* =========================================================
   1. PAGE LOADED MESSAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("BloodLink frontend loaded successfully.");

});


/* =========================================================
   2. SMOOTH SCROLLING
   ========================================================= */

document.querySelectorAll('a[href^="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

        const targetId = this.getAttribute("href");

        if (targetId === "#") {
            return;
        }

        const targetElement = document.querySelector(targetId);

        if (targetElement) {

            event.preventDefault();

            targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});


/* =========================================================
   3. HERO CARD BUTTON
   ========================================================= */

const cardAction = document.querySelector(".card-action");

if (cardAction) {

    cardAction.addEventListener("click", function () {

        window.location.href = "dashboard.html";

    });

}


/* =========================================================
   4. BUTTON CLICK EFFECT
   ========================================================= */

const buttons = document.querySelectorAll(".btn");

buttons.forEach(function (button) {

    button.addEventListener("click", function () {

        this.style.transform = "scale(0.98)";

        setTimeout(() => {

            this.style.transform = "";

        }, 120);

    });

});


/* =========================================================
   5. CONSOLE INFORMATION
   ========================================================= */

console.log("-----------------------------------------");
console.log("       BLOODLINK FRONTEND");
console.log("Emergency Blood Donor Finder System");
console.log("-----------------------------------------");
console.log("Frontend status: READY");
console.log("Backend status: NOT CONNECTED YET");
console.log("-----------------------------------------");