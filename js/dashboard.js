/* =========================================================
   BLOODLINK - DASHBOARD JAVASCRIPT
   Emergency Blood Donor Finder System
   ========================================================= */


/* =========================================================
   0. ADMIN ACCESS PROTECTION
   ========================================================= */

(function protectAdminDashboard() {

    const loggedInUserJSON =
        localStorage.getItem("bloodLinkUser");


    if (!loggedInUserJSON) {

        console.log(
            "No logged-in user found. Redirecting to login."
        );

        window.location.href =
            "User/pages/login.html";

        return;

    }


    let loggedInUser;

    try {

        loggedInUser =
            JSON.parse(loggedInUserJSON);

    } catch (error) {

        console.error(
            "Invalid login information:",
            error
        );

        localStorage.removeItem(
            "bloodLinkUser"
        );

        window.location.href =
            "User/pages/login.html";

        return;

    }


    const userRole =
        String(
            loggedInUser.Role || ""
        ).toUpperCase();


    if (userRole !== "ADMIN") {

        console.log(
            "Access denied. Admin dashboard is restricted to administrators."
        );

        window.location.href =
            "User/pages/user-dashboard.html";

        return;

    }


    console.log(
        "ADMIN access granted."
    );

})();


/* =========================================================
   1. PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "BloodLink Dashboard loaded successfully."
        );


        initializeMobileMenu();

        initializeNotification();

        initializeUserProfile();

        loadDashboardData();

        loadRecentBloodRequests();

        loadDashboardInventory();

    }
);


/* =========================================================
   2. LOAD DASHBOARD STATISTICS
   ========================================================= */

async function loadDashboardData() {

    console.log(
        "Loading dashboard statistics from MySQL..."
    );


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/dashboard"
            );


        if (!response.ok) {

            throw new Error(
                "Dashboard API returned an error."
            );

        }


        const data =
            await response.json();


        console.log(
            "Dashboard statistics loaded from MySQL:",
            data
        );


        updateDashboardStatistics(
            data
        );


        console.log(
            "Dashboard statistics updated successfully."
        );


    } catch (error) {

        console.error(
            "Error loading dashboard statistics:",
            error
        );

    }

}


/* =========================================================
   3. UPDATE DASHBOARD STATISTICS
   ========================================================= */

function updateDashboardStatistics(
    data
) {

    updateStatisticCard(
        "Registered Donors",
        data.total_donors
    );


    updateStatisticCard(
        "Blood Requests",
        data.total_requests
    );


    updateStatisticCard(
        "Blood Units",
        data.total_inventory_units
    );


    updateStatisticCard(
        "Hospitals",
        data.total_hospitals
    );


    console.log(
        "Registered Donors:",
        data.total_donors
    );

    console.log(
        "Blood Requests:",
        data.total_requests
    );

    console.log(
        "Blood Units:",
        data.total_inventory_units
    );

    console.log(
        "Hospitals:",
        data.total_hospitals
    );

    console.log(
        "Total Donations:",
        data.total_donations
    );

    console.log(
        "Blood Banks:",
        data.total_blood_banks
    );

    console.log(
        "Pending Responses:",
        data.pending_responses
    );

}


/* =========================================================
   4. UPDATE ONE STATISTIC CARD
   ========================================================= */

function updateStatisticCard(
    labelText,
    value
) {

    const cards =
        document.querySelectorAll(
            ".dashboard-stat-card"
        );


    cards.forEach(
        function (card) {

            const label =
                card.querySelector(
                    ".stat-label"
                );


            const number =
                card.querySelector(
                    ".stat-number"
                );


            if (
                !label ||
                !number
            ) {

                return;

            }


            if (
                label.textContent.trim() ===
                labelText
            ) {

                number.textContent =
                    Number(value || 0);

            }

        }
    );

}


/* =========================================================
   5. LOAD RECENT BLOOD REQUESTS
   ========================================================= */

/*
   API:
   GET /api/blood-requests

   Backend returns:
   - Request_ID
   - Patient_Name
   - Blood_Group
   - Units_Required
   - Emergency_Level
   - Request_Date
   - Hospital_ID
   - Hospital_Name
*/

async function loadRecentBloodRequests() {

    console.log(
        "Loading recent blood requests from MySQL..."
    );


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/blood-requests"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load blood requests."
            );

        }


        const requests =
            await response.json();


        console.log(
            "Blood requests loaded from MySQL:",
            requests
        );


        renderRecentBloodRequests(
            requests
        );


    } catch (error) {

        console.error(
            "Error loading blood requests:",
            error
        );

    }

}


/* =========================================================
   6. RENDER RECENT BLOOD REQUESTS
   ========================================================= */

function renderRecentBloodRequests(
    requests
) {

    const requestList =
        document.querySelector(
            ".request-list"
        );


    if (!requestList) {

        console.warn(
            "Request list not found."
        );

        return;

    }


    requestList.innerHTML = "";


    if (
        !Array.isArray(requests) ||
        requests.length === 0
    ) {

        requestList.innerHTML = `

            <div
                style="
                    padding:30px;
                    text-align:center;
                    color:#777;
                "
            >

                <i
                    class="fa-solid fa-circle-info"
                    style="
                        font-size:25px;
                        margin-bottom:10px;
                    "
                ></i>

                <p
                    style="
                        margin:0;
                    "
                >
                    No blood requests found.
                </p>

            </div>

        `;

        return;

    }


    /*
       Backend already sorts newest first.
       We only display the latest 4 so the
       dashboard keeps the same layout.
    */

    const recentRequests =
        requests.slice(
            0,
            4
        );


    recentRequests.forEach(
        function (request) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "request-row";


            const bloodGroup =
                request.Blood_Group ||
                "-";


            const patientName =
                request.Patient_Name ||
                "Unknown Patient";


            const hospitalName =
                request.Hospital_Name ||
                "Unknown Hospital";


            const units =
                Number(
                    request.Units_Required || 0
                );


            const emergencyLevel =
                request.Emergency_Level ||
                "Normal";


            const statusClass =
                getEmergencyStatusClass(
                    emergencyLevel
                );


            row.innerHTML = `

                <div class="request-blood">
                    ${escapeHTML(bloodGroup)}
                </div>


                <div class="request-info">

                    <strong>
                        ${escapeHTML(patientName)}
                    </strong>

                    <span>
                        ${escapeHTML(hospitalName)}
                    </span>

                </div>


                <div class="request-units">

                    <strong>
                        ${units}
                        ${units === 1 ? "Unit" : "Units"}
                    </strong>

                    <span>
                        Required
                    </span>

                </div>


                <div class="request-status ${statusClass}">
                    ${escapeHTML(emergencyLevel)}
                </div>

            `;


            requestList.appendChild(
                row
            );

        }
    );


    console.log(
        "Recent blood requests rendered:",
        recentRequests.length
    );

}


/* =========================================================
   7. EMERGENCY STATUS CLASS
   ========================================================= */

function getEmergencyStatusClass(
    emergencyLevel
) {

    const level =
        String(
            emergencyLevel || ""
        )
        .trim()
        .toLowerCase();


    if (
        level === "critical"
    ) {

        return "critical";

    }


    if (
        level === "urgent"
    ) {

        return "urgent";

    }


    return "normal";

}


/* =========================================================
   8. LOAD INVENTORY
   ========================================================= */

/*
   API:
   GET /api/inventory

   Inventory records are stored per
   blood bank + blood group.

   For the dashboard we combine records
   belonging to the same blood group.

   Example:

   Bank A → O+ → 10
   Bank B → O+ → 12

   Dashboard:

   O+ → 22 Units
*/

async function loadDashboardInventory() {

    console.log(
        "Loading blood inventory from MySQL..."
    );


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/inventory"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load inventory."
            );

        }


        const inventory =
            await response.json();


        console.log(
            "Inventory loaded from MySQL:",
            inventory
        );


        renderDashboardInventory(
            inventory
        );


    } catch (error) {

        console.error(
            "Error loading inventory:",
            error
        );

    }

}


/* =========================================================
   9. GROUP INVENTORY BY BLOOD GROUP
   ========================================================= */

function renderDashboardInventory(
    inventory
) {

    const inventoryList =
        document.querySelector(
            ".inventory-list"
        );


    if (!inventoryList) {

        console.warn(
            "Inventory list not found."
        );

        return;

    }


    inventoryList.innerHTML = "";


    if (
        !Array.isArray(inventory) ||
        inventory.length === 0
    ) {

        inventoryList.innerHTML = `

            <div
                style="
                    padding:30px;
                    text-align:center;
                    color:#777;
                "
            >

                <i
                    class="fa-solid fa-box-open"
                    style="
                        font-size:25px;
                        margin-bottom:10px;
                    "
                ></i>

                <p
                    style="
                        margin:0;
                    "
                >
                    No inventory records found.
                </p>

            </div>

        `;

        return;

    }


    const groupedInventory =
        {};


    inventory.forEach(
        function (item) {

            const bloodGroup =
                item.Blood_Group ||
                "Unknown";


            const units =
                Number(
                    item.Available_Units || 0
                );


            if (
                !groupedInventory[bloodGroup]
            ) {

                groupedInventory[bloodGroup] =
                    0;

            }


            groupedInventory[bloodGroup] +=
                units;

        }
    );


    /*
       Convert object into array.
    */

    const groupedArray =
        Object.keys(
            groupedInventory
        ).map(
            function (bloodGroup) {

                return {

                    bloodGroup:
                        bloodGroup,

                    units:
                        groupedInventory[
                            bloodGroup
                        ]

                };

            }
        );


    /*
       Sort highest stock first.
    */

    groupedArray.sort(
        function (a, b) {

            return b.units - a.units;

        }
    );


    /*
       Display all available blood groups.
    */

    const maxUnits =
        Math.max(
            ...groupedArray.map(
                function (item) {
                    return item.units;
                }
            ),
            1
        );


    groupedArray.forEach(
        function (item) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "inventory-row";


            const bloodGroup =
                item.bloodGroup;


            const units =
                item.units;


            /*
               Calculate percentage for
               the visual progress bar.
            */

            let percentage =
                (units / maxUnits) * 100;


            /*
               Keep percentage within
               5% - 100% so very small
               quantities remain visible.
            */

            percentage =
                Math.max(
                    5,
                    Math.min(
                        100,
                        percentage
                    )
                );


            const fullBloodName =
                getBloodGroupName(
                    bloodGroup
                );


            row.innerHTML = `

                <div class="inventory-group">

                    <div class="blood-mini">
                        ${escapeHTML(bloodGroup)}
                    </div>

                    <span>
                        ${escapeHTML(fullBloodName)}
                    </span>

                </div>


                <div class="inventory-bar">

                    <div class="bar">

                        <div
                            class="bar-fill"
                            style="
                                width:${percentage}%;
                            "
                        ></div>

                    </div>


                    <span>
                        ${units}
                        ${units === 1 ? "Unit" : "Units"}
                    </span>

                </div>

            `;


            inventoryList.appendChild(
                row
            );

        }
    );


    console.log(
        "Dashboard inventory rendered:",
        groupedArray
    );

}


/* =========================================================
   10. BLOOD GROUP FULL NAMES
   ========================================================= */

function getBloodGroupName(
    bloodGroup
) {

    const names = {

        "A+": "A Positive",

        "A-": "A Negative",

        "B+": "B Positive",

        "B-": "B Negative",

        "AB+": "AB Positive",

        "AB-": "AB Negative",

        "O+": "O Positive",

        "O-": "O Negative"

    };


    return (
        names[bloodGroup] ||
        bloodGroup
    );

}


/* =========================================================
   11. HTML ESCAPE
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================================
   12. MOBILE SIDEBAR MENU
   ========================================================= */

function initializeMobileMenu() {

    const menuButton =
        document.getElementById(
            "menuButton"
        );


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (
        !menuButton ||
        !sidebar
    ) {

        return;

    }


    menuButton.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "mobile-open"
            );

        }
    );


    document.addEventListener(
        "click",
        function (event) {

            const clickedInsideSidebar =
                sidebar.contains(
                    event.target
                );


            const clickedMenuButton =
                menuButton.contains(
                    event.target
                );


            if (
                !clickedInsideSidebar &&
                !clickedMenuButton &&
                sidebar.classList.contains(
                    "mobile-open"
                )
            ) {

                sidebar.classList.remove(
                    "mobile-open"
                );

            }

        }
    );


    const navigationItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navigationItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {

                    if (
                        window.innerWidth <= 800
                    ) {

                        sidebar.classList.remove(
                            "mobile-open"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   13. NOTIFICATION BUTTON
   ========================================================= */

function initializeNotification() {

    const notificationButton =
        document.querySelector(
            ".notification-btn"
        );


    if (
        !notificationButton
    ) {

        return;

    }


    notificationButton.addEventListener(
        "click",
        function () {

            alert(
                "You have new blood request notifications."
            );

        }
    );

}


/* =========================================================
   14. USER PROFILE
   ========================================================= */

function initializeUserProfile() {

    const userProfile =
        document.querySelector(
            ".user-profile"
        );


    if (
        !userProfile
    ) {

        return;

    }


    userProfile.addEventListener(
        "click",
        function () {

            alert(
                "Administrator Profile\n\n" +
                "Role: System Administrator"
            );

        }
    );

}


/* =========================================================
   15. WINDOW RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    function () {

        const sidebar =
            document.querySelector(
                ".sidebar"
            );


        if (
            !sidebar
        ) {

            return;

        }


        if (
            window.innerWidth > 800
        ) {

            sidebar.classList.remove(
                "mobile-open"
            );

        }

    }
);


/* =========================================================
   16. DASHBOARD STATUS
   ========================================================= */

console.log(
    "-----------------------------------------"
);

console.log(
    "       BLOODLINK DASHBOARD"
);

console.log(
    "-----------------------------------------"
);

console.log(
    "Dashboard: READY"
);

console.log(
    "Donor data: MYSQL DATABASE"
);

console.log(
    "Blood requests: MYSQL DATABASE"
);

console.log(
    "Inventory: MYSQL DATABASE"
);

console.log(
    "Backend API: CONNECTED"
);

console.log(
    "-----------------------------------------"
);