/* =========================================================
   BLOODLINK - FIND DONOR JAVASCRIPT
   Emergency Blood Donor Finder System
   ========================================================= */


/* =========================================================
   1. PAGE INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("Find Donor page loaded.");

    loadDonors();

    initializeSearch();

    initializeDonorModal();

    initializeNotification();

    initializeMobileMenu();

});


/* =========================================================
   2. USER / ADMIN MODE
   ========================================================= */

/*
   User Dashboard opens this page with:

   find-donor.html?mode=user

   Admin opens the normal page:

   find-donor.html

   User mode:
   - Only eligible donors
   - Only available donors

   Admin mode:
   - Existing normal donor search behavior
*/

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const userMode =
    urlParams.get("mode") === "user";


console.log(
    "Find Donor Mode:",
    userMode ? "USER" : "ADMIN"
);


/* =========================================================
   3. DONOR DATA FROM FLASK / MYSQL
   ========================================================= */

let donors = [];


async function loadDonors() {

    try {

        /*
           Base Flask API
        */

        let apiURL =
            "http://127.0.0.1:5000/api/donors";


        /*
           Build query parameters
        */

        const params =
            new URLSearchParams();


        /*
           USER MODE

           User should only see:
           1. Eligible donors
           2. Available donors
        */

        if (userMode) {

            params.append(
                "eligibleOnly",
                "true"
            );

            params.append(
                "availableOnly",
                "true"
            );

        }


        /*
           Add parameters to URL
        */

        const queryString =
            params.toString();


        if (queryString !== "") {

            apiURL +=
                "?" +
                queryString;

        }


        console.log(
            "Loading donors from backend:",
            apiURL
        );


        /*
           Send request to Flask
        */

        const response =
            await fetch(apiURL);


        if (!response.ok) {

            throw new Error(
                "Failed to fetch donors"
            );

        }


        /*
           Read backend response
        */

        const data =
            await response.json();


        /*
           Convert backend data
           into frontend donor objects
        */

        donors =
            data.map(function (donor) {

                return {

                    name:
                        donor.Name,

                    bloodGroup:
                        donor.Blood_Group,

                    location:
                        donor.Location,

                    phone:
                        donor.Phone,

                    available:
                        donor.Availability ===
                        "Available"

                };

            });


        console.log(
            "Donors loaded from MySQL:",
            donors
        );


        /*
           Display donors initially
        */

        displayDonors(
            donors
        );


        /*
           Update result information
        */

        updateResultInformation(
            donors.length,
            "",
            ""
        );


    } catch (error) {

        console.error(
            "Error loading donors:",
            error
        );


        alert(
            "Unable to load donor data from the backend."
        );

    }

}


/* =========================================================
   4. SEARCH FUNCTION
   ========================================================= */

function initializeSearch() {

    const searchForm =
        document.getElementById(
            "donorSearchForm"
        );


    if (!searchForm) {

        return;

    }


    searchForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /*
               Get Blood Group
            */

            const bloodGroup =
                document.getElementById(
                    "bloodGroup"
                ).value;


            /*
               Get Location
            */

            const location =
                document.getElementById(
                    "location"
                ).value.trim();


            /*
               Get Availability Filter
            */

            const availableOnly =
                document.getElementById(
                    "availableOnly"
                ).checked;


            try {

                /*
                   Base Flask API
                */

                let apiURL =
                    "http://127.0.0.1:5000/api/donors";


                /*
                   Build query parameters
                */

                const params =
                    new URLSearchParams();


                /*
                   Blood Group Filter
                */

                if (bloodGroup !== "") {

                    params.append(
                        "bloodGroup",
                        bloodGroup
                    );

                }


                /*
                   Location Filter
                */

                if (location !== "") {

                    params.append(
                        "location",
                        location
                    );

                }


                /*
                   Available Only Filter
                */

                if (availableOnly) {

                    params.append(
                        "availableOnly",
                        "true"
                    );

                }


                /*
                   USER MODE

                   Always apply:
                   - eligibleOnly = true
                   - availableOnly = true

                   This makes sure that normal
                   users only see donors who can
                   actually donate.
                */

                if (userMode) {

                    /*
                       Make sure availableOnly
                       is enabled for user mode.
                    */

                    if (!availableOnly) {

                        params.set(
                            "availableOnly",
                            "true"
                        );

                    }


                    params.set(
                        "eligibleOnly",
                        "true"
                    );

                }


                /*
                   Add parameters to URL
                */

                const queryString =
                    params.toString();


                if (queryString !== "") {

                    apiURL +=
                        "?" +
                        queryString;

                }


                console.log(
                    "Searching donors from backend:",
                    apiURL
                );


                /*
                   Send request to Flask
                */

                const response =
                    await fetch(apiURL);


                if (!response.ok) {

                    throw new Error(
                        "Failed to search donors"
                    );

                }


                /*
                   Read backend response
                */

                const data =
                    await response.json();


                console.log(
                    "Donor search result from MySQL:",
                    data
                );


                /*
                   Update global donor array

                   This is important because
                   View Details uses this array.
                */

                donors =
                    data.map(function (donor) {

                        return {

                            name:
                                donor.Name,

                            bloodGroup:
                                donor.Blood_Group,

                            location:
                                donor.Location,

                            phone:
                                donor.Phone,

                            available:
                                donor.Availability ===
                                "Available"

                        };

                    });


                /*
                   Display search results
                */

                displayDonors(
                    donors
                );


                /*
                   Update result count
                   and search summary
                */

                updateResultInformation(
                    donors.length,
                    bloodGroup,
                    location
                );


            } catch (error) {

                console.error(
                    "Donor search error:",
                    error
                );


                alert(
                    "Unable to search donors from the backend."
                );

            }

        }
    );

}


/* =========================================================
   5. DISPLAY DONORS
   ========================================================= */

function displayDonors(donorList) {

    const resultsContainer =
        document.getElementById(
            "donorResults"
        );


    if (!resultsContainer) {

        return;

    }


    /*
       Clear existing cards
    */

    resultsContainer.innerHTML = "";


    /*
       No results
    */

    if (
        !Array.isArray(donorList) ||
        donorList.length === 0
    ) {

        resultsContainer.innerHTML = `

            <div class="no-results">

                <div class="no-results-icon">

                    <i class="fa-solid fa-user-slash"></i>

                </div>


                <h3>
                    No Donors Found
                </h3>


                <p>
                    No donors match the selected criteria.
                    Try changing the blood group or location.
                </p>

            </div>

        `;


        return;

    }


    /*
       Create donor cards
    */

    donorList.forEach(function (donor) {

        const donorCard =
            createDonorCard(donor);


        resultsContainer.innerHTML +=
            donorCard;

    });


    /*
       Reconnect View Details buttons
    */

    initializeDonorButtons();

}


/* =========================================================
   6. CREATE DONOR CARD
   ========================================================= */

function createDonorCard(donor) {

    const statusClass =
        donor.available
            ? "available-badge"
            : "unavailable-badge";


    const avatarClass =
        donor.available
            ? "donor-avatar"
            : "donor-avatar unavailable-avatar";


    const statusText =
        donor.available
            ? "Available"
            : "Unavailable";


    return `

        <div
            class="donor-card"
            data-blood="${donor.bloodGroup}"
            data-location="${donor.location}"
            data-available="${donor.available}"
        >


            <div class="donor-card-left">


                <div class="${avatarClass}">

                    <i class="fa-solid fa-user"></i>

                </div>


                <div class="donor-details">


                    <div class="donor-name-row">

                        <h3>
                            ${donor.name}
                        </h3>


                        <span class="${statusClass}">

                            <i class="fa-solid fa-circle"></i>

                            ${statusText}

                        </span>

                    </div>


                    <div class="donor-meta">


                        <span>

                            <i class="fa-solid fa-droplet"></i>

                            ${donor.bloodGroup}

                        </span>


                        <span>

                            <i class="fa-solid fa-location-dot"></i>

                            ${donor.location}

                        </span>


                        <span>

                            <i class="fa-solid fa-phone"></i>

                            ${donor.phone}

                        </span>


                    </div>


                </div>


            </div>


            <div class="blood-type-large">

                ${donor.bloodGroup}

            </div>


            <div class="donor-action">

                <button
                    class="view-donor-button"
                    data-donor="${donor.name}"
                >

                    View Details

                    <i class="fa-solid fa-arrow-right"></i>

                </button>

            </div>


        </div>

    `;

}


/* =========================================================
   7. UPDATE RESULT INFORMATION
   ========================================================= */

function updateResultInformation(
    count,
    bloodGroup,
    location
) {

    const resultCount =
        document.getElementById(
            "resultCount"
        );


    const resultSummary =
        document.getElementById(
            "resultSummary"
        );


    if (resultCount) {

        resultCount.textContent =
            count;

    }


    if (resultSummary) {

        let message =
            `Showing ${count} donor`;


        if (count !== 1) {

            message += "s";

        }


        if (bloodGroup !== "") {

            message +=
                ` with blood group ${bloodGroup}`;

        }


        if (location !== "") {

            message +=
                ` in ${location}`;

        }


        resultSummary.textContent =
            message;

    }

}


/* =========================================================
   8. DONOR DETAILS MODAL
   ========================================================= */

function initializeDonorModal() {

    initializeDonorButtons();


    const modal =
        document.getElementById(
            "donorModal"
        );


    const closeButton =
        document.getElementById(
            "modalClose"
        );


    if (!modal || !closeButton) {

        return;

    }


    /*
       Close using X button
    */

    closeButton.addEventListener(
        "click",
        function () {

            closeModal();

        }
    );


    /*
       Close when clicking outside modal
    */

    modal.addEventListener(
        "click",
        function (event) {

            if (event.target === modal) {

                closeModal();

            }

        }
    );


    /*
       Close using Escape key
    */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeModal();

            }

        }
    );


    /*
       Contact donor button
    */

    const contactButton =
        document.getElementById(
            "modalContactButton"
        );


    if (contactButton) {

        contactButton.addEventListener(
            "click",
            function () {

                alert(
                    "Donor contact functionality " +
                    "will be connected to the backend."
                );

            }
        );

    }

}


/* =========================================================
   9. VIEW DETAILS BUTTONS
   ========================================================= */

function initializeDonorButtons() {

    const buttons =
        document.querySelectorAll(
            ".view-donor-button"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const donorName =
                    this.getAttribute(
                        "data-donor"
                    );


                openDonorModal(
                    donorName
                );

            }
        );

    });

}


/* =========================================================
   10. OPEN DONOR MODAL
   ========================================================= */

function openDonorModal(donorName) {

    const donor =
        donors.find(function (item) {

            return item.name === donorName;

        });


    if (!donor) {

        return;

    }


    const modal =
        document.getElementById(
            "donorModal"
        );


    const modalName =
        document.getElementById(
            "modalDonorName"
        );


    const modalBlood =
        document.getElementById(
            "modalBloodGroup"
        );


    const modalLocation =
        document.getElementById(
            "modalLocation"
        );


    const modalPhone =
        document.getElementById(
            "modalPhone"
        );


    if (!modal) {

        return;

    }


    modalName.textContent =
        donor.name;


    modalBlood.textContent =
        donor.bloodGroup;


    modalLocation.textContent =
        donor.location;


    modalPhone.textContent =
        donor.phone;


    modal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   11. CLOSE DONOR MODAL
   ========================================================= */

function closeModal() {

    const modal =
        document.getElementById(
            "donorModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   12. NOTIFICATION
   ========================================================= */

function initializeNotification() {

    const notificationButton =
        document.querySelector(
            ".notification-btn"
        );


    if (!notificationButton) {

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
   13. MOBILE SIDEBAR
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


    if (!menuButton || !sidebar) {

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


    /*
       Close sidebar after selecting a page
    */

    const navigationItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navigationItems.forEach(function (item) {

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

    });


    /*
       Close when clicking outside
    */

    document.addEventListener(
        "click",
        function (event) {

            const insideSidebar =
                sidebar.contains(
                    event.target
                );


            const menuClicked =
                menuButton.contains(
                    event.target
                );


            if (
                !insideSidebar &&
                !menuClicked &&
                window.innerWidth <= 800
            ) {

                sidebar.classList.remove(
                    "mobile-open"
                );

            }

        }
    );

}


/* =========================================================
   14. WINDOW RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    function () {

        const sidebar =
            document.querySelector(
                ".sidebar"
            );


        if (
            sidebar &&
            window.innerWidth > 800
        ) {

            sidebar.classList.remove(
                "mobile-open"
            );

        }

    }
);


/* =========================================================
   15. CONSOLE STATUS
   ========================================================= */

console.log("-----------------------------------------");
console.log("       BLOODLINK FIND DONOR");
console.log("-----------------------------------------");
console.log("Search system: READY");
console.log("Donor data source: FLASK / MYSQL");
console.log("Backend API: CONNECTED");
console.log(
    "Current mode:",
    userMode ? "USER - ELIGIBLE ONLY" : "ADMIN - NORMAL"
);
console.log("-----------------------------------------");