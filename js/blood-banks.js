/* =========================================================
   BLOODLINK - BLOOD BANKS JAVASCRIPT
   Emergency Blood Donor Finder System
   ========================================================= */


/* =========================================================
   API CONFIGURATION
   ========================================================= */

const API_BASE_URL = "http://127.0.0.1:5000/api";


/* =========================================================
   BLOOD BANK DATA
   ---------------------------------------------------------
   This array now stores REAL data loaded from MySQL.
   Flask API:
   GET  /api/blood-banks
   POST /api/blood-banks
   ========================================================= */

let bloodBanks = [];


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("-----------------------------------------");
    console.log("       BLOODLINK BLOOD BANKS");
    console.log("-----------------------------------------");

    initializeBloodBanksPage();

});


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

function initializeBloodBanksPage() {

    initializeSearch();

    initializeFilters();

    initializeModals();

    initializeAddBloodBankForm();

    initializeMobileMenu();

    initializeNotification();

    initializeUserProfile();

    initializeRefresh();

    /*
       Load actual blood bank data
       from MySQL through Flask.
    */

    loadBloodBanks();

}


/* =========================================================
   LOAD BLOOD BANKS FROM FLASK / MYSQL
   ========================================================= */

async function loadBloodBanks() {

    const tableBody =
        document.getElementById("bloodBankTableBody");

    if (tableBody) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-results">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <br><br>
                    Loading blood banks...
                </td>
            </tr>
        `;

    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/blood-banks`
        );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const data = await response.json();


        /*
           Convert MySQL field names into
           the frontend field names used
           throughout this file.
        */

        bloodBanks = data.map(function (bank) {

            return {

                bloodBankId:
                    bank.BloodBank_ID,

                name:
                    bank.Name,

                location:
                    bank.Location,

                contact:
                    bank.Contact

            };

        });


        populateLocationFilter();

        renderBloodBanks(bloodBanks);

        updateStatistics(bloodBanks);


        console.log(
            "Blood Banks loaded from MySQL:",
            bloodBanks
        );


    } catch (error) {

        console.error(
            "Error loading blood banks:",
            error
        );


        bloodBanks = [];


        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        class="no-results"
                    >
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <br><br>
                        Unable to load blood banks.
                        <br><br>
                        Please make sure the Flask server is running.
                    </td>
                </tr>
            `;

        }


        const resultSummary =
            document.getElementById("resultSummary");


        if (resultSummary) {

            resultSummary.textContent =
                "Unable to load blood bank records";

        }


        updateStatistics([]);

    }

}


/* =========================================================
   RENDER BLOOD BANK TABLE
   ========================================================= */

function renderBloodBanks(data) {

    const tableBody =
        document.getElementById("bloodBankTableBody");

    const resultSummary =
        document.getElementById("resultSummary");


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    /* =====================================================
       NO RESULTS
       ===================================================== */

    if (data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="no-results"
                >
                    <i class="fa-solid fa-building-columns"></i>
                    <br><br>
                    No blood banks found.
                </td>
            </tr>
        `;


        if (resultSummary) {

            resultSummary.textContent =
                "No blood bank records found";

        }


        return;

    }


    /* =====================================================
       CREATE TABLE ROWS
       ===================================================== */

    data.forEach(function (bank) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <span class="blood-bank-id">
                    #${escapeHTML(bank.bloodBankId)}
                </span>

            </td>


            <td>

                <div class="blood-bank-name">

                    <div class="blood-bank-icon">

                        <i class="fa-solid fa-building-columns"></i>

                    </div>

                    <span>
                        ${escapeHTML(bank.name)}
                    </span>

                </div>

            </td>


            <td>

                <div class="location-cell">

                    <i class="fa-solid fa-location-dot"></i>

                    <span>
                        ${escapeHTML(bank.location)}
                    </span>

                </div>

            </td>


            <td>

                <div class="contact-cell">

                    <i class="fa-solid fa-phone"></i>

                    <span>
                        ${escapeHTML(bank.contact)}
                    </span>

                </div>

            </td>


            <td>

                <button
                    class="table-action"
                    title="View Details"
                    onclick="viewBloodBank(${Number(bank.bloodBankId)})"
                >

                    <i class="fa-solid fa-eye"></i>

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });


    if (resultSummary) {

        resultSummary.textContent =
            `Showing ${data.length} blood bank record${data.length !== 1 ? "s" : ""}`;

    }

}


/* =========================================================
   UPDATE STATISTICS
   ========================================================= */

function updateStatistics(data) {

    const totalElement =
        document.getElementById("totalBloodBanks");

    const locationElement =
        document.getElementById("locationCount");

    const contactElement =
        document.getElementById("contactCount");

    const inventoryElement =
        document.getElementById("inventoryConnected");


    /* =====================================================
       TOTAL BLOOD BANKS
       ===================================================== */

    if (totalElement) {

        totalElement.textContent =
            data.length;

    }


    /* =====================================================
       UNIQUE LOCATIONS
       ===================================================== */

    const locations =
        new Set(
            data
                .map(function (bank) {
                    return bank.location;
                })
                .filter(function (location) {
                    return location;
                })
        );


    if (locationElement) {

        locationElement.textContent =
            locations.size;

    }


    /* =====================================================
       CONTACT AVAILABLE
       ===================================================== */

    const contacts =
        data.filter(function (bank) {

            return (
                bank.contact &&
                String(bank.contact).trim() !== ""
            );

        });


    if (contactElement) {

        contactElement.textContent =
            contacts.length;

    }


    /*
       Keep the existing statistics card.

       This value represents the number of
       blood banks connected to the system.
    */

    if (inventoryElement) {

        inventoryElement.textContent =
            data.length;

    }

}


/* =========================================================
   POPULATE LOCATION FILTER
   ========================================================= */

function populateLocationFilter() {

    const locationSelect =
        document.getElementById("bloodBankLocation");


    if (!locationSelect) {

        return;

    }


    const locations =
        [
            ...new Set(
                bloodBanks
                    .map(function (bank) {
                        return bank.location;
                    })
                    .filter(function (location) {
                        return location;
                    })
            )
        ];


    locations.sort();


    locationSelect.innerHTML = `
        <option value="">
            All Locations
        </option>
    `;


    locations.forEach(function (location) {

        const option =
            document.createElement("option");


        option.value =
            location;


        option.textContent =
            location;


        locationSelect.appendChild(option);

    });

}


/* =========================================================
   SEARCH
   ========================================================= */

function initializeSearch() {

    const searchInput =
        document.getElementById("bloodBankSearch");


    if (!searchInput) {

        return;

    }


    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


/* =========================================================
   FILTERS
   ========================================================= */

function initializeFilters() {

    const locationSelect =
        document.getElementById("bloodBankLocation");

    const resetButton =
        document.getElementById("resetFilters");


    if (locationSelect) {

        locationSelect.addEventListener(
            "change",
            applyFilters
        );

    }


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetFilters
        );

    }

}


/* =========================================================
   APPLY SEARCH + LOCATION FILTER
   ========================================================= */

function applyFilters() {

    const searchInput =
        document.getElementById("bloodBankSearch");

    const locationSelect =
        document.getElementById("bloodBankLocation");


    const searchValue =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";


    const locationValue =
        locationSelect
            ? locationSelect.value
            : "";


    const filteredBanks =
        bloodBanks.filter(function (bank) {


            const bankName =
                String(bank.name || "").toLowerCase();


            const bankLocation =
                String(bank.location || "").toLowerCase();


            const bankContact =
                String(bank.contact || "").toLowerCase();


            const bankId =
                String(bank.bloodBankId || "");


            const matchesSearch =

                bankName.includes(searchValue)

                ||

                bankLocation.includes(searchValue)

                ||

                bankContact.includes(searchValue)

                ||

                bankId.includes(searchValue);


            const matchesLocation =

                locationValue === ""

                ||

                bank.location === locationValue;


            return (
                matchesSearch &&
                matchesLocation
            );

        });


    renderBloodBanks(filteredBanks);

    updateStatistics(filteredBanks);

}


/* =========================================================
   RESET FILTERS
   ========================================================= */

function resetFilters() {

    const searchInput =
        document.getElementById("bloodBankSearch");

    const locationSelect =
        document.getElementById("bloodBankLocation");


    if (searchInput) {

        searchInput.value = "";

    }


    if (locationSelect) {

        locationSelect.value = "";

    }


    renderBloodBanks(bloodBanks);

    updateStatistics(bloodBanks);

}


/* =========================================================
   VIEW BLOOD BANK DETAILS
   ========================================================= */

function viewBloodBank(bloodBankId) {

    const bank =
        bloodBanks.find(function (item) {

            return (
                Number(item.bloodBankId) ===
                Number(bloodBankId)
            );

        });


    if (!bank) {

        return;

    }


    const modal =
        document.getElementById("bloodBankModal");

    const title =
        document.getElementById(
            "modalBloodBankTitle"
        );

    const body =
        document.getElementById(
            "modalBloodBankBody"
        );


    if (!modal || !title || !body) {

        return;

    }


    title.textContent =
        bank.name;


    body.innerHTML = `

        <div class="detail-row">

            <span>
                Blood Bank ID
            </span>

            <strong>
                #${escapeHTML(bank.bloodBankId)}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Blood Bank Name
            </span>

            <strong>
                ${escapeHTML(bank.name)}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Location
            </span>

            <strong>
                ${escapeHTML(bank.location)}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Contact
            </span>

            <strong>
                ${escapeHTML(bank.contact)}
            </strong>

        </div>

    `;


    modal.classList.add("show");

}


/* =========================================================
   MODALS
   ========================================================= */

function initializeModals() {

    const detailsModal =
        document.getElementById(
            "bloodBankModal"
        );

    const closeDetails =
        document.getElementById(
            "closeBloodBankModal"
        );

    const closeDetailsButton =
        document.getElementById(
            "closeBloodBankButton"
        );

    const addModal =
        document.getElementById(
            "addBloodBankModal"
        );

    const addButton =
        document.getElementById(
            "addBloodBankButton"
        );

    const closeAdd =
        document.getElementById(
            "closeAddBloodBankModal"
        );

    const cancelAdd =
        document.getElementById(
            "cancelAddBloodBank"
        );


    /* =====================================================
       DETAILS MODAL
       ===================================================== */

    if (closeDetails) {

        closeDetails.addEventListener(
            "click",
            function () {

                if (detailsModal) {

                    detailsModal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    if (closeDetailsButton) {

        closeDetailsButton.addEventListener(
            "click",
            function () {

                if (detailsModal) {

                    detailsModal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    /* =====================================================
       ADD MODAL
       ===================================================== */

    if (addButton) {

        addButton.addEventListener(
            "click",
            function () {

                if (addModal) {

                    addModal.classList.add(
                        "show"
                    );

                }

            }
        );

    }


    if (closeAdd) {

        closeAdd.addEventListener(
            "click",
            function () {

                if (addModal) {

                    addModal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    if (cancelAdd) {

        cancelAdd.addEventListener(
            "click",
            function () {

                if (addModal) {

                    addModal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    /* =====================================================
       CLOSE WHEN CLICKING OUTSIDE
       ===================================================== */

    window.addEventListener(
        "click",
        function (event) {


            if (
                detailsModal &&
                event.target === detailsModal
            ) {

                detailsModal.classList.remove(
                    "show"
                );

            }


            if (
                addModal &&
                event.target === addModal
            ) {

                addModal.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =====================================================
       ESCAPE KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {


                if (detailsModal) {

                    detailsModal.classList.remove(
                        "show"
                    );

                }


                if (addModal) {

                    addModal.classList.remove(
                        "show"
                    );

                }

            }

        }
    );

}


/* =========================================================
   ADD BLOOD BANK FORM
   ========================================================= */

function initializeAddBloodBankForm() {

    const form =
        document.getElementById(
            "addBloodBankForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const bloodBankId =
                Number(
                    document.getElementById(
                        "bloodBankId"
                    ).value
                );


            const name =
                document.getElementById(
                    "bloodBankName"
                ).value.trim();


            const location =
                document.getElementById(
                    "bloodBankLocationInput"
                ).value.trim();


            const contact =
                document.getElementById(
                    "bloodBankContact"
                ).value.trim();


            /* =================================================
               VALIDATION
               ================================================= */

            if (!bloodBankId) {

                alert(
                    "Please enter a valid Blood Bank ID."
                );

                return;

            }


            if (!name) {

                alert(
                    "Please enter the blood bank name."
                );

                return;

            }


            if (!location) {

                alert(
                    "Please enter the location."
                );

                return;

            }


            if (!contact) {

                alert(
                    "Please enter the contact number."
                );

                return;

            }


            /* =================================================
               CHECK DUPLICATE ID IN CURRENT DATA
               ================================================= */

            const existingBank =
                bloodBanks.find(function (bank) {

                    return (
                        Number(bank.bloodBankId) ===
                        Number(bloodBankId)
                    );

                });


            if (existingBank) {

                alert(
                    "Blood Bank ID already exists."
                );

                return;

            }


            /* =================================================
               DISABLE SUBMIT BUTTON
               ================================================= */

            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonHTML =
                submitButton
                    ? submitButton.innerHTML
                    : "";


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Saving...
                `;

            }


            /* =================================================
               SEND DATA TO FLASK
               ================================================= */

            try {

                const response = await fetch(
                    `${API_BASE_URL}/blood-banks`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            BloodBank_ID:
                                bloodBankId,

                            Name:
                                name,

                            Location:
                                location,

                            Contact:
                                contact

                        })

                    }
                );


                let result = {};


                try {

                    result =
                        await response.json();

                } catch (jsonError) {

                    result = {};

                }


                /* =================================================
                   HANDLE SERVER ERROR
                   ================================================= */

                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        `Server returned ${response.status}`
                    );

                }


                /* =================================================
                   SUCCESS
                   ================================================= */

                alert(
                    "Blood bank added successfully."
                );


                console.log(
                    "Blood Bank Added:",
                    result
                );


                /* =================================================
                   RESET FORM
                   ================================================= */

                form.reset();


                /* =================================================
                   CLOSE MODAL
                   ================================================= */

                const modal =
                    document.getElementById(
                        "addBloodBankModal"
                    );


                if (modal) {

                    modal.classList.remove(
                        "show"
                    );

                }


                /*
                   Reload from MySQL.

                   This makes sure the page displays
                   the actual database record rather
                   than a temporary frontend record.
                */

                await loadBloodBanks();


            } catch (error) {

                console.error(
                    "Error adding blood bank:",
                    error
                );


                alert(
                    "Unable to add blood bank.\n\n" +
                    error.message
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.innerHTML =
                        originalButtonHTML;

                }

            }

        }
    );

}


/* =========================================================
   REFRESH
   ========================================================= */

function initializeRefresh() {

    const refreshButton =
        document.getElementById(
            "refreshBloodBanks"
        );


    if (!refreshButton) {

        return;

    }


    refreshButton.addEventListener(
        "click",
        async function () {

            const originalButtonHTML =
                refreshButton.innerHTML;


            refreshButton.disabled = true;


            refreshButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Refreshing...
            `;


            try {

                await loadBloodBanks();


                console.log(
                    "Blood Bank data refreshed from MySQL."
                );


            } catch (error) {

                console.error(
                    "Refresh error:",
                    error
                );


            } finally {

                refreshButton.disabled = false;

                refreshButton.innerHTML = `
                    <i class="fa-solid fa-arrows-rotate"></i>
                    Refresh
                `;

            }

        }
    );

}


/* =========================================================
   MOBILE MENU
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
        function (event) {

            event.stopPropagation();

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


    window.addEventListener(
        "resize",
        function () {

            if (
                window.innerWidth > 800
            ) {

                sidebar.classList.remove(
                    "mobile-open"
                );

            }

        }
    );

}


/* =========================================================
   NOTIFICATIONS
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
   USER PROFILE
   ========================================================= */

function initializeUserProfile() {

    const userProfile =
        document.querySelector(
            ".user-profile"
        );


    if (!userProfile) {

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
   HTML ESCAPE HELPER
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   BACKEND INTEGRATION
   =========================================================

   CURRENT FLOW:

   Browser
       ↓
   blood-banks.js
       ↓
   Flask API
       ↓
   MySQL
       ↓
   BLOOD_BANK table


   GET:
   /api/blood-banks


   POST:
   /api/blood-banks


   MySQL table:

   BLOOD_BANK
   --------------------
   BloodBank_ID
   Name
   Location
   Contact

   ========================================================= */