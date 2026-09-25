/* =========================================================
   BLOODLINK - DONORS JAVASCRIPT
   Emergency Blood Donor Finder System

   Current version:
   Frontend demo data

   Future:
   HTML/JS → Flask API → MySQL
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("-----------------------------------------");
    console.log("       BLOODLINK DONORS");
    console.log("-----------------------------------------");
    console.log("Donors Page: READY");
    console.log("Database: MySQL");
    console.log("Backend API: NOT CONNECTED YET");
    console.log("-----------------------------------------");

    initializeDonorsPage();

});


/* =========================================================
   TEMPORARY DEMO DONOR DATA

   These fields correspond to the DONOR table:

   Donor_ID
   Name
   Age
   Gender
   Phone
   Location
   Availability
   Blood_Group_ID

   Blood_Group_ID will be handled by Flask later.
   ========================================================= */

let donors = [

    {
        donorId: 1,
        name: "Aryan Choudhari",
        age: 21,
        gender: "Male",
        phone: "+91 XXXXXXX123",
        location: "Pune",
        availability: true,
        bloodGroup: "O+",
        bloodGroupId: null
    },

    {
        donorId: 2,
        name: "Riti Kumar",
        age: 20,
        gender: "Female",
        phone: "+91 XXXXXXX456",
        location: "Pune",
        availability: true,
        bloodGroup: "O+",
        bloodGroupId: null
    },

    {
        donorId: 3,
        name: "Vedika Kapoor",
        age: 21,
        gender: "Female",
        phone: "+91 XXXXXXX789",
        location: "Pune",
        availability: true,
        bloodGroup: "B+",
        bloodGroupId: null
    },

    {
        donorId: 4,
        name: "Shivani Salunkhe",
        age: 22,
        gender: "Female",
        phone: "+91 XXXXXXX321",
        location: "Mumbai",
        availability: true,
        bloodGroup: "A+",
        bloodGroupId: null
    },

    {
        donorId: 5,
        name: "Karan Mehta",
        age: 25,
        gender: "Male",
        phone: "+91 XXXXXXX654",
        location: "Pune",
        availability: false,
        bloodGroup: "AB+",
        bloodGroupId: null
    },

    {
        donorId: 6,
        name: "Rahul Patil",
        age: 27,
        gender: "Male",
        phone: "+91 XXXXXXX987",
        location: "Nashik",
        availability: true,
        bloodGroup: "A-",
        bloodGroupId: null
    },

    {
        donorId: 7,
        name: "Sneha Joshi",
        age: 24,
        gender: "Female",
        phone: "+91 XXXXXXX741",
        location: "Mumbai",
        availability: false,
        bloodGroup: "B-",
        bloodGroupId: null
    },

    {
        donorId: 8,
        name: "Aditya Kulkarni",
        age: 29,
        gender: "Male",
        phone: "+91 XXXXXXX852",
        location: "Nagpur",
        availability: true,
        bloodGroup: "O-",
        bloodGroupId: null
    }

];


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

function initializeDonorsPage() {

    renderDonors();

    updateStatistics();

    initializeSearch();

    initializeBloodGroupFilter();

    initializeLocationFilter();

    initializeAvailabilityFilter();

    initializeResetButton();

    initializeRefreshButton();

    initializeDonorModal();

    initializeAddDonorModal();

    initializeMobileMenu();

    initializeNotification();

    initializeUserProfile();

}


/* =========================================================
   RENDER DONORS
   ========================================================= */

function renderDonors(donorList = donors) {

    const tableBody =
        document.getElementById("donorTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";


    if (donorList.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="no-results"
                >
                    <i class="fa-solid fa-users-slash"></i>

                    <br><br>

                    No donors found matching
                    your search criteria.

                </td>

            </tr>

        `;

        updateResultSummary(0);

        return;
    }


    donorList.forEach(function (donor) {

        const row =
            document.createElement("tr");


        const initials =
            getInitials(donor.name);


        const availabilityHTML =
            donor.availability

                ? `
                    <span class="availability-badge available">
                        Available
                    </span>
                  `

                : `
                    <span class="availability-badge unavailable">
                        Not Available
                    </span>
                  `;


        row.innerHTML = `

            <td>

                <div class="donor-name">

                    <div class="donor-avatar">
                        ${initials}
                    </div>

                    <div>

                        <strong>
                            ${donor.name}
                        </strong>

                        <small>
                            ID: ${donor.donorId}
                        </small>

                    </div>

                </div>

            </td>


            <td>

                <span class="blood-badge">
                    ${donor.bloodGroup}
                </span>

            </td>


            <td>
                ${donor.age}
            </td>


            <td>
                ${donor.gender}
            </td>


            <td>
                ${donor.phone}
            </td>


            <td>

                <i
                    class="fa-solid fa-location-dot"
                    style="color: #d62828; margin-right: 5px;"
                ></i>

                ${donor.location}

            </td>


            <td>
                ${availabilityHTML}
            </td>


            <td>

                <button
                    class="table-action"
                    onclick="viewDonor(${donor.donorId})"
                    title="View Donor"
                >

                    <i class="fa-solid fa-eye"></i>

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });


    updateResultSummary(donorList.length);

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
   RESULT SUMMARY
   ========================================================= */

function updateResultSummary(count) {

    const summary =
        document.getElementById("resultSummary");

    if (!summary) return;


    summary.textContent =
        `Showing ${count} donor${count === 1 ? "" : "s"}`;

}


/* =========================================================
   UPDATE STATISTICS
   ========================================================= */

function updateStatistics() {

    const total =
        donors.length;


    const available =
        donors.filter(function (donor) {

            return donor.availability === true;

        }).length;


    const bloodGroups =
        new Set(

            donors.map(function (donor) {

                return donor.bloodGroup;

            })

        ).size;


    const locations =
        new Set(

            donors.map(function (donor) {

                return donor.location;

            })

        ).size;


    const totalElement =
        document.getElementById("totalDonors");

    const availableElement =
        document.getElementById("availableDonors");

    const bloodGroupElement =
        document.getElementById("bloodGroupCount");

    const locationElement =
        document.getElementById("locationCount");


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (availableElement) {

        availableElement.textContent =
            available;

    }


    if (bloodGroupElement) {

        bloodGroupElement.textContent =
            bloodGroups;

    }


    if (locationElement) {

        locationElement.textContent =
            locations;

    }

}


/* =========================================================
   SEARCH + FILTER
   ========================================================= */

function initializeSearch() {

    const searchInput =
        document.getElementById("donorSearch");

    if (!searchInput) return;


    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


function initializeBloodGroupFilter() {

    const filter =
        document.getElementById("bloodGroupFilter");

    if (!filter) return;


    filter.addEventListener(
        "change",
        applyFilters
    );

}


function initializeLocationFilter() {

    const filter =
        document.getElementById("locationFilter");

    if (!filter) return;


    filter.addEventListener(
        "change",
        applyFilters
    );

}


function initializeAvailabilityFilter() {

    const filter =
        document.getElementById("availabilityFilter");

    if (!filter) return;


    filter.addEventListener(
        "change",
        applyFilters
    );

}


/* =========================================================
   APPLY ALL FILTERS
   ========================================================= */

function applyFilters() {

    const searchInput =
        document.getElementById("donorSearch");

    const bloodGroupFilter =
        document.getElementById("bloodGroupFilter");

    const locationFilter =
        document.getElementById("locationFilter");

    const availabilityFilter =
        document.getElementById("availabilityFilter");


    const searchText =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";


    const selectedBloodGroup =
        bloodGroupFilter
            ? bloodGroupFilter.value
            : "";


    const selectedLocation =
        locationFilter
            ? locationFilter.value
            : "";


    const selectedAvailability =
        availabilityFilter
            ? availabilityFilter.value
            : "";


    const filteredDonors =
        donors.filter(function (donor) {


            /* SEARCH */

            const matchesSearch =

                donor.name
                    .toLowerCase()
                    .includes(searchText)

                ||

                donor.phone
                    .toLowerCase()
                    .includes(searchText);


            /* BLOOD GROUP */

            const matchesBloodGroup =

                !selectedBloodGroup

                ||

                donor.bloodGroup ===
                    selectedBloodGroup;


            /* LOCATION */

            const matchesLocation =

                !selectedLocation

                ||

                donor.location ===
                    selectedLocation;


            /* AVAILABILITY */

            let matchesAvailability = true;


            if (
                selectedAvailability ===
                "available"
            ) {

                matchesAvailability =
                    donor.availability === true;

            }


            if (
                selectedAvailability ===
                "unavailable"
            ) {

                matchesAvailability =
                    donor.availability === false;

            }


            return (

                matchesSearch &&

                matchesBloodGroup &&

                matchesLocation &&

                matchesAvailability

            );

        });


    renderDonors(filteredDonors);

}


/* =========================================================
   RESET FILTERS
   ========================================================= */

function initializeResetButton() {

    const resetButton =
        document.getElementById("resetFilters");

    if (!resetButton) return;


    resetButton.addEventListener(
        "click",
        function () {

            const search =
                document.getElementById(
                    "donorSearch"
                );

            const bloodGroup =
                document.getElementById(
                    "bloodGroupFilter"
                );

            const location =
                document.getElementById(
                    "locationFilter"
                );

            const availability =
                document.getElementById(
                    "availabilityFilter"
                );


            if (search) {
                search.value = "";
            }

            if (bloodGroup) {
                bloodGroup.value = "";
            }

            if (location) {
                location.value = "";
            }

            if (availability) {
                availability.value = "";
            }


            renderDonors();

        }
    );

}


/* =========================================================
   REFRESH
   ========================================================= */

function initializeRefreshButton() {

    const refreshButton =
        document.getElementById("refreshDonors");

    if (!refreshButton) return;


    refreshButton.addEventListener(
        "click",
        function () {

            renderDonors();

            updateStatistics();

            alert(
                "Donor directory refreshed successfully."
            );

        }
    );

}


/* =========================================================
   VIEW DONOR DETAILS
   ========================================================= */

function viewDonor(donorId) {

    const donor =
        donors.find(function (item) {

            return item.donorId === donorId;

        });


    if (!donor) {

        alert("Donor information not found.");

        return;

    }


    const modal =
        document.getElementById("donorModal");

    const modalName =
        document.getElementById("modalDonorName");

    const modalBody =
        document.getElementById("modalDonorBody");


    if (!modal || !modalBody) return;


    if (modalName) {

        modalName.textContent =
            donor.name;

    }


    const availabilityText =
        donor.availability
            ? "Available"
            : "Not Available";


    modalBody.innerHTML = `

        <div class="detail-row">

            <span>Donor ID</span>

            <strong>
                ${donor.donorId}
            </strong>

        </div>


        <div class="detail-row">

            <span>Full Name</span>

            <strong>
                ${donor.name}
            </strong>

        </div>


        <div class="detail-row">

            <span>Blood Group</span>

            <strong>
                ${donor.bloodGroup}
            </strong>

        </div>


        <div class="detail-row">

            <span>Age</span>

            <strong>
                ${donor.age} years
            </strong>

        </div>


        <div class="detail-row">

            <span>Gender</span>

            <strong>
                ${donor.gender}
            </strong>

        </div>


        <div class="detail-row">

            <span>Phone</span>

            <strong>
                ${donor.phone}
            </strong>

        </div>


        <div class="detail-row">

            <span>Location</span>

            <strong>
                ${donor.location}
            </strong>

        </div>


        <div class="detail-row">

            <span>Availability</span>

            <strong>
                ${availabilityText}
            </strong>

        </div>

    `;


    modal.classList.add("show");

}


/* =========================================================
   DONOR DETAILS MODAL
   ========================================================= */

function initializeDonorModal() {

    const modal =
        document.getElementById("donorModal");

    if (!modal) return;


    const closeButton =
        document.getElementById(
            "closeDonorModal"
        );


    const closeModalButton =
        document.getElementById(
            "closeModalButton"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                modal.classList.remove("show");

            }
        );

    }


    if (closeModalButton) {

        closeModalButton.addEventListener(
            "click",
            function () {

                modal.classList.remove("show");

            }
        );

    }


    window.addEventListener(
        "click",
        function (event) {

            if (event.target === modal) {

                modal.classList.remove("show");

            }

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                modal.classList.remove("show");

            }

        }
    );

}


/* =========================================================
   ADD DONOR MODAL
   ========================================================= */

function initializeAddDonorModal() {

    const addButton =
        document.getElementById(
            "addDonorButton"
        );


    const modal =
        document.getElementById(
            "addDonorModal"
        );


    const closeButton =
        document.getElementById(
            "closeAddDonorModal"
        );


    const cancelButton =
        document.getElementById(
            "cancelAddDonor"
        );


    const form =
        document.getElementById(
            "addDonorForm"
        );


    if (!addButton || !modal) return;


    /* OPEN */

    addButton.addEventListener(
        "click",
        function () {

            modal.classList.add("show");

        }
    );


    /* CLOSE */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                modal.classList.remove("show");

            }
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                modal.classList.remove("show");

            }
        );

    }


    /* CLICK OUTSIDE */

    window.addEventListener(
        "click",
        function (event) {

            if (event.target === modal) {

                modal.classList.remove("show");

            }

        }
    );


    /* ESCAPE */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                modal.classList.remove("show");

            }

        }
    );


    /* FORM SUBMISSION */

    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                addNewDonor();

            }
        );

    }

}


/* =========================================================
   ADD NEW DONOR
   ========================================================= */

function addNewDonor() {

    const name =
        document.getElementById(
            "donorName"
        ).value.trim();


    const age =
        parseInt(
            document.getElementById(
                "donorAge"
            ).value
        );


    const gender =
        document.getElementById(
            "donorGender"
        ).value;


    const phone =
        document.getElementById(
            "donorPhone"
        ).value.trim();


    const bloodGroup =
        document.getElementById(
            "donorBloodGroup"
        ).value;


    const location =
        document.getElementById(
            "donorLocation"
        ).value.trim();


    const availability =
        document.getElementById(
            "donorAvailability"
        ).checked;


    /* VALIDATION */

    if (!name) {

        alert("Please enter the donor name.");

        return;

    }


    if (!age || age < 18) {

        alert(
            "Donor must be at least 18 years old."
        );

        return;

    }


    if (!gender) {

        alert("Please select gender.");

        return;

    }


    if (!phone) {

        alert("Please enter phone number.");

        return;

    }


    if (!bloodGroup) {

        alert("Please select blood group.");

        return;

    }


    if (!location) {

        alert("Please enter donor location.");

        return;

    }


    /* CREATE DEMO DONOR */

    const newDonor = {

        donorId:
            generateDonorId(),

        name:
            name,

        age:
            age,

        gender:
            gender,

        phone:
            phone,

        location:
            location,

        availability:
            availability,

        bloodGroup:
            bloodGroup,

        bloodGroupId:
            null

    };


    donors.unshift(newDonor);


    /* REFRESH */

    renderDonors();

    updateStatistics();


    /* CLOSE MODAL */

    const modal =
        document.getElementById(
            "addDonorModal"
        );


    const form =
        document.getElementById(
            "addDonorForm"
        );


    if (modal) {

        modal.classList.remove("show");

    }


    if (form) {

        form.reset();

    }


    /* DEFAULT AVAILABILITY */

    const availabilityCheckbox =
        document.getElementById(
            "donorAvailability"
        );


    if (availabilityCheckbox) {

        availabilityCheckbox.checked = true;

    }


    alert(
        "Donor registered successfully.\n\n" +
        "Donor ID: " +
        newDonor.donorId
    );

}


/* =========================================================
   GENERATE DEMO DONOR ID
   ========================================================= */

function generateDonorId() {

    if (donors.length === 0) {

        return 1;

    }


    const highestId =
        Math.max.apply(
            null,
            donors.map(function (donor) {

                return donor.donorId;

            })
        );


    return highestId + 1;

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
                sidebar.contains(event.target);


            const insideMenuButton =
                menuButton.contains(event.target);


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
                "You have new donor notifications."
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
   FUTURE FLASK + MYSQL CONNECTION
   =========================================================

   IMPORTANT:

   We will NOT connect this JavaScript directly
   to MySQL.

   Final architecture:

   donors.html
        ↓
   donors.js
        ↓
   Flask REST API
        ↓
   MySQL
        ↓
   DONOR + BLOOD_GROUP


   Example future request:

   fetch("http://localhost:5000/api/donors")
        .then(response => response.json())
        .then(data => {
            donors = data;
            renderDonors();
            updateStatistics();
        });

   For adding a donor:

   fetch("http://localhost:5000/api/donors", {
       method: "POST",
       headers: {
           "Content-Type": "application/json"
       },
       body: JSON.stringify({
           Name: name,
           Age: age,
           Gender: gender,
           Phone: phone,
           Location: location,
           Availability: availability,
           Blood_Group_ID: bloodGroupId
       })
   });

   The exact endpoint and JSON format will be
   changed to match your friend's actual Flask backend.

   ========================================================= */