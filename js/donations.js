/* =========================================================
   BLOODLINK - DONATIONS JAVASCRIPT
   Emergency Blood Donor Finder System

   Frontend:
   HTML → JavaScript → Flask API → MySQL
   ========================================================= */


const API_BASE_URL =
    "http://127.0.0.1:5000/api";


document.addEventListener("DOMContentLoaded", function () {

    console.log("-----------------------------------------");
    console.log("       BLOODLINK DONATIONS");
    console.log("-----------------------------------------");
    console.log("Donations Page: READY");
    console.log("Database: MySQL");
    console.log("Backend API: CONNECTED");
    console.log("-----------------------------------------");

    initializeDonationsPage();

});


/* =========================================================
   DONATION DATA
   ========================================================= */

let donations = [];


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

function initializeDonationsPage() {

    renderDonations();

    updateStatistics();

    initializeSearch();

    initializeDateFilter();

    initializeResetButton();

    initializeRefreshButton();

    initializeDonationModal();

    initializeAddDonationModal();

    initializeMobileMenu();

    initializeNotification();

    initializeUserProfile();

    loadDonations();

    loadDonationFormData();

}


/* =========================================================
   LOAD DONATIONS FROM MYSQL
   ========================================================= */

async function loadDonations() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/donations`
        );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch donations"
            );

        }

        const data =
            await response.json();


        donations = data.map(function (item) {

            return {

                donationId:
                    item.Donation_ID,

                donationDate:
                    item.Donation_Date,

                unitsDonated:
                    Number(item.Units_Donated),

                donorId:
                    item.Donor_ID,

                donorName:
                    item.Donor_Name,

                bloodGroup:
                    item.Blood_Group,

                bloodBankId:
                    item.BloodBank_ID,

                bloodBankName:
                    item.Blood_Bank_Name

            };

        });


        console.log(
            "Donations loaded from MySQL:",
            donations
        );


        renderDonations();

        updateStatistics();

    }

    catch (error) {

        console.error(
            "Error loading donations:",
            error
        );

        alert(
            "Unable to load donation records from the backend."
        );

    }

}


/* =========================================================
   LOAD DONORS AND BLOOD BANKS
   FOR ADD DONATION FORM
   ========================================================= */

async function loadDonationFormData() {

    try {

        const donorResponse =
            await fetch(
                `${API_BASE_URL}/donors`
            );


        const bloodBankResponse =
            await fetch(
                `${API_BASE_URL}/blood-banks`
            );


        if (
            !donorResponse.ok ||
            !bloodBankResponse.ok
        ) {

            throw new Error(
                "Failed to load form data"
            );

        }


        const donors =
            await donorResponse.json();


        const bloodBanks =
            await bloodBankResponse.json();


        populateDonorDropdown(donors);

        populateBloodBankDropdown(bloodBanks);


        console.log(
            "Donation form data loaded successfully."
        );

    }

    catch (error) {

        console.error(
            "Error loading donation form data:",
            error
        );

    }

}


/* =========================================================
   POPULATE DONOR DROPDOWN
   ========================================================= */

function populateDonorDropdown(donors) {

    const donorSelect =
        document.getElementById(
            "donationDonor"
        );


    if (!donorSelect) return;


    donorSelect.innerHTML =
        `<option value="">Select Donor</option>`;


    donors.forEach(function (donor) {

        const option =
            document.createElement("option");


        option.value =
            donor.Donor_ID;


        option.textContent =
            `${donor.Name} (${donor.Blood_Group})`;


        donorSelect.appendChild(option);

    });

}


/* =========================================================
   POPULATE BLOOD BANK DROPDOWN
   ========================================================= */

function populateBloodBankDropdown(bloodBanks) {

    const bloodBankSelect =
        document.getElementById(
            "donationBloodBank"
        );


    if (!bloodBankSelect) return;


    bloodBankSelect.innerHTML =
        `<option value="">Select Blood Bank</option>`;


    bloodBanks.forEach(function (bank) {

        const option =
            document.createElement("option");


        option.value =
            bank.BloodBank_ID;


        option.textContent =
            bank.Name;


        bloodBankSelect.appendChild(option);

    });

}


/* =========================================================
   RENDER DONATIONS
   ========================================================= */

function renderDonations(
    donationList = donations
) {

    const tableBody =
        document.getElementById(
            "donationTableBody"
        );


    if (!tableBody) return;


    tableBody.innerHTML = "";


    if (donationList.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="no-results"
                >

                    <i class="fa-solid fa-heart-crack"></i>

                    <br><br>

                    No donation records found.

                </td>

            </tr>

        `;


        updateResultSummary(0);

        return;

    }


    donationList.forEach(function (donation) {

        const row =
            document.createElement("tr");


        const initials =
            getInitials(
                donation.donorName
            );


        row.innerHTML = `

            <td>

                <span class="donation-id">
                    #${String(
                        donation.donationId
                    ).padStart(3, "0")}
                </span>

            </td>


            <td>

                <div class="donor-name">

                    <div class="donor-avatar">
                        ${initials}
                    </div>

                    <strong>
                        ${donation.donorName}
                    </strong>

                </div>

            </td>


            <td>
                ${formatDate(
                    donation.donationDate
                )}
            </td>


            <td>

                <span class="units-badge">

                    ${donation.unitsDonated}

                    ${
                        donation.unitsDonated === 1
                            ? "Unit"
                            : "Units"
                    }

                </span>

            </td>


            <td>

                <div class="blood-bank-name">

                    <i class="fa-solid fa-building-columns"></i>

                    ${donation.bloodBankName}

                </div>

            </td>


            <td>

                <button
                    class="table-action"
                    onclick="viewDonation(${donation.donationId})"
                    title="View Donation"
                >

                    <i class="fa-solid fa-eye"></i>

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });


    updateResultSummary(
        donationList.length
    );

}


/* =========================================================
   GET INITIALS
   ========================================================= */

function getInitials(name) {

    if (!name) return "?";


    const parts =
        name.trim().split(" ");


    if (parts.length === 1) {

        return parts[0]
            .charAt(0)
            .toUpperCase();

    }


    return (

        parts[0].charAt(0) +

        parts[parts.length - 1].charAt(0)

    ).toUpperCase();

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(dateString) {

    if (!dateString) return "-";


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    if (isNaN(date.getTime())) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   RESULT SUMMARY
   ========================================================= */

function updateResultSummary(count) {

    const summary =
        document.getElementById(
            "resultSummary"
        );


    if (!summary) return;


    summary.textContent =
        `Showing ${count} donation record${
            count === 1 ? "" : "s"
        }`;

}


/* =========================================================
   UPDATE STATISTICS
   ========================================================= */

function updateStatistics() {

    const totalDonations =
        donations.length;


    const totalUnits =
        donations.reduce(
            function (total, donation) {

                return total +
                    donation.unitsDonated;

            },
            0
        );


    const uniqueDonorIds =
        new Set(

            donations.map(
                function (donation) {

                    return donation.donorId;

                }
            )

        );


    const uniqueBloodBanks =
        new Set(

            donations.map(
                function (donation) {

                    return donation.bloodBankId;

                }
            )

        );


    const totalElement =
        document.getElementById(
            "totalDonations"
        );


    const unitsElement =
        document.getElementById(
            "totalUnits"
        );


    const donorsElement =
        document.getElementById(
            "uniqueDonors"
        );


    const banksElement =
        document.getElementById(
            "bloodBanks"
        );


    if (totalElement) {

        totalElement.textContent =
            totalDonations;

    }


    if (unitsElement) {

        unitsElement.textContent =
            totalUnits;

    }


    if (donorsElement) {

        donorsElement.textContent =
            uniqueDonorIds.size;

    }


    if (banksElement) {

        banksElement.textContent =
            uniqueBloodBanks.size;

    }

}


/* =========================================================
   SEARCH
   ========================================================= */

function initializeSearch() {

    const searchInput =
        document.getElementById(
            "donationSearch"
        );


    if (!searchInput) return;


    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


/* =========================================================
   DATE FILTER
   ========================================================= */

function initializeDateFilter() {

    const dateInput =
        document.getElementById(
            "donationDateFilter"
        );


    if (!dateInput) return;


    dateInput.addEventListener(
        "change",
        applyFilters
    );

}


/* =========================================================
   APPLY FILTERS
   ========================================================= */

function applyFilters() {

    const searchInput =
        document.getElementById(
            "donationSearch"
        );


    const dateInput =
        document.getElementById(
            "donationDateFilter"
        );


    const searchText =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const selectedDate =
        dateInput
            ? dateInput.value
            : "";


    const filteredDonations =
        donations.filter(
            function (donation) {


                const donorName =
                    donation.donorName
                        ? donation.donorName
                            .toLowerCase()
                        : "";


                const bloodBankName =
                    donation.bloodBankName
                        ? donation.bloodBankName
                            .toLowerCase()
                        : "";


                const bloodGroup =
                    donation.bloodGroup
                        ? donation.bloodGroup
                            .toLowerCase()
                        : "";


                const matchesSearch =

                    donorName.includes(
                        searchText
                    )

                    ||

                    bloodBankName.includes(
                        searchText
                    )

                    ||

                    bloodGroup.includes(
                        searchText
                    )

                    ||

                    String(
                        donation.donationId
                    ).includes(
                        searchText
                    );


                const matchesDate =

                    !selectedDate

                    ||

                    donation.donationDate ===
                        selectedDate;


                return (
                    matchesSearch &&
                    matchesDate
                );

            }
        );


    renderDonations(
        filteredDonations
    );

}


/* =========================================================
   RESET FILTERS
   ========================================================= */

function initializeResetButton() {

    const resetButton =
        document.getElementById(
            "resetFilters"
        );


    if (!resetButton) return;


    resetButton.addEventListener(
        "click",
        function () {


            const searchInput =
                document.getElementById(
                    "donationSearch"
                );


            const dateInput =
                document.getElementById(
                    "donationDateFilter"
                );


            if (searchInput) {

                searchInput.value = "";

            }


            if (dateInput) {

                dateInput.value = "";

            }


            renderDonations();

            updateStatistics();

        }
    );

}


/* =========================================================
   REFRESH
   ========================================================= */

function initializeRefreshButton() {

    const refreshButton =
        document.getElementById(
            "refreshDonations"
        );


    if (!refreshButton) {
        return;
    }


    refreshButton.addEventListener(
        "click",
        async function () {

            await loadDonations();

            await loadDonationFormData();

            alert(
                "Donation records refreshed successfully."
            );

        }
    );

}


/* =========================================================
   VIEW DONATION
   ========================================================= */

function viewDonation(donationId) {

    const donation =
        donations.find(
            function (item) {

                return item.donationId ===
                    donationId;

            }
        );


    if (!donation) {

        alert(
            "Donation record not found."
        );

        return;

    }


    const modal =
        document.getElementById(
            "donationModal"
        );


    const modalTitle =
        document.getElementById(
            "modalDonationTitle"
        );


    const modalBody =
        document.getElementById(
            "modalDonationBody"
        );


    if (!modal || !modalBody) return;


    if (modalTitle) {

        modalTitle.textContent =
            "Donation #" +
            String(donation.donationId)
                .padStart(3, "0");

    }


    modalBody.innerHTML = `

        <div class="detail-row">

            <span>Donation ID</span>

            <strong>
                #${String(
                    donation.donationId
                ).padStart(3, "0")}
            </strong>

        </div>


        <div class="detail-row">

            <span>Donor</span>

            <strong>
                ${donation.donorName}
            </strong>

        </div>


        <div class="detail-row">

            <span>Donor ID</span>

            <strong>
                ${donation.donorId}
            </strong>

        </div>


        <div class="detail-row">

            <span>Blood Group</span>

            <strong>
                ${donation.bloodGroup || "-"}
            </strong>

        </div>


        <div class="detail-row">

            <span>Donation Date</span>

            <strong>
                ${formatDate(
                    donation.donationDate
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>Units Donated</span>

            <strong>
                ${donation.unitsDonated}
            </strong>

        </div>


        <div class="detail-row">

            <span>Blood Bank</span>

            <strong>
                ${donation.bloodBankName}
            </strong>

        </div>


        <div class="detail-row">

            <span>Blood Bank ID</span>

            <strong>
                ${donation.bloodBankId}
            </strong>

        </div>

    `;


    modal.classList.add("show");

}


/* =========================================================
   DONATION DETAILS MODAL
   ========================================================= */

function initializeDonationModal() {

    const modal =
        document.getElementById(
            "donationModal"
        );


    if (!modal) return;


    const closeButton =
        document.getElementById(
            "closeDonationModal"
        );


    const closeDonationButton =
        document.getElementById(
            "closeDonationButton"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                modal.classList.remove(
                    "show"
                );

            }
        );

    }


    if (closeDonationButton) {

        closeDonationButton.addEventListener(
            "click",
            function () {

                modal.classList.remove(
                    "show"
                );

            }
        );

    }


    window.addEventListener(
        "click",
        function (event) {

            if (event.target === modal) {

                modal.classList.remove(
                    "show"
                );

            }

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                modal.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================================================
   ADD DONATION MODAL
   ========================================================= */

function initializeAddDonationModal() {

    const addButton =
        document.getElementById(
            "addDonationButton"
        );


    const modal =
        document.getElementById(
            "addDonationModal"
        );


    const closeButton =
        document.getElementById(
            "closeAddDonationModal"
        );


    const cancelButton =
        document.getElementById(
            "cancelAddDonation"
        );


    const form =
        document.getElementById(
            "addDonationForm"
        );


    if (!addButton || !modal) return;


    /* OPEN */

    addButton.addEventListener(
        "click",
        function () {

            setDefaultDonationDate();

            modal.classList.add("show");

        }
    );


    /* CLOSE */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                modal.classList.remove(
                    "show"
                );

            }
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                modal.classList.remove(
                    "show"
                );

            }
        );

    }


    /* CLICK OUTSIDE */

    window.addEventListener(
        "click",
        function (event) {

            if (event.target === modal) {

                modal.classList.remove(
                    "show"
                );

            }

        }
    );


    /* ESCAPE */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                modal.classList.remove(
                    "show"
                );

            }

        }
    );


    /* FORM */

    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                addNewDonation();

            }
        );

    }

}


/* =========================================================
   DEFAULT DONATION DATE
   ========================================================= */

function setDefaultDonationDate() {

    const dateInput =
        document.getElementById(
            "donationDate"
        );


    if (!dateInput) return;


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    dateInput.value =
        `${year}-${month}-${day}`;

}


/* =========================================================
   ADD NEW DONATION
   MYSQL + FLASK
   ========================================================= */

async function addNewDonation() {

    const donorSelect =
        document.getElementById(
            "donationDonor"
        );


    const dateInput =
        document.getElementById(
            "donationDate"
        );


    const unitsInput =
        document.getElementById(
            "unitsDonated"
        );


    const bankSelect =
        document.getElementById(
            "donationBloodBank"
        );


    if (
        !donorSelect ||
        !dateInput ||
        !unitsInput ||
        !bankSelect
    ) {

        return;

    }


    const donorId =
        donorSelect.value;


    const donationDate =
        dateInput.value;


    const unitsDonated =
        parseInt(
            unitsInput.value,
            10
        );


    const bloodBankId =
        bankSelect.value;


    /* VALIDATION */

    if (!donorId) {

        alert(
            "Please select a donor."
        );

        return;

    }


    if (!donationDate) {

        alert(
            "Please select the donation date."
        );

        return;

    }


    if (
        !unitsDonated ||
        unitsDonated <= 0
    ) {

        alert(
            "Units donated must be greater than 0."
        );

        return;

    }


    if (!bloodBankId) {

        alert(
            "Please select a blood bank."
        );

        return;

    }


    /* SEND DATA TO FLASK */

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/donations`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        Donation_Date:
                            donationDate,

                        Units_Donated:
                            unitsDonated,

                        Donor_ID:
                            parseInt(
                                donorId,
                                10
                            ),

                        BloodBank_ID:
                            parseInt(
                                bloodBankId,
                                10
                            )

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to add donation"
            );

        }


        console.log(
            "Donation created:",
            result
        );


        /* CLOSE MODAL */

        const modal =
            document.getElementById(
                "addDonationModal"
            );


        const form =
            document.getElementById(
                "addDonationForm"
            );


        if (modal) {

            modal.classList.remove(
                "show"
            );

        }


        if (form) {

            form.reset();

        }


        /* RELOAD MYSQL DATA */

        await loadDonations();

        await loadDonationFormData();


        /* SUCCESS MESSAGE */

        alert(
            "Donation recorded successfully.\n\n" +
            "Donation ID: #" +
            String(
                result.Donation_ID
            ).padStart(3, "0")
        );

    }

    catch (error) {

        console.error(
            "Error adding donation:",
            error
        );


        alert(
            "Unable to record donation.\n\n" +
            error.message
        );

    }

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


    if (!menuButton || !sidebar) return;


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

            const insideSidebar =
                sidebar.contains(
                    event.target
                );


            const insideMenuButton =
                menuButton.contains(
                    event.target
                );


            if (
                !insideSidebar &&
                !insideMenuButton &&
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
   NOTIFICATION
   ========================================================= */

function initializeNotification() {

    const notificationButton =
        document.querySelector(
            ".notification-btn"
        );


    if (!notificationButton) return;


    notificationButton.addEventListener(
        "click",
        function () {

            alert(
                "BloodLink Notifications\n\n" +
                "You have new donation notifications."
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


    if (!userProfile) return;


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
   WINDOW RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    function () {

        const sidebar =
            document.querySelector(
                ".sidebar"
            );


        if (!sidebar) return;


        if (window.innerWidth > 800) {

            sidebar.classList.remove(
                "mobile-open"
            );

        }

    }
);


/* =========================================================
   END
   ========================================================= */