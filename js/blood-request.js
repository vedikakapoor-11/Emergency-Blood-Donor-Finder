/* =========================================================
   BLOODLINK - BLOOD REQUEST JAVASCRIPT
   Emergency Blood Donor Finder System

   NOTE:
   Currently using temporary frontend demo data.
   Later this file will connect to:
   HTML/JS → Flask API → MySQL
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("-----------------------------------------");
    console.log("       BLOODLINK BLOOD REQUEST");
    console.log("-----------------------------------------");
    console.log("Blood Request Page: READY");
    console.log("Backend API: CONNECTED");
    console.log("Database: MySQL");
    console.log("-----------------------------------------");

    initializePage();

    loadHospitals();

    loadBloodRequests();
});


/* =========================================================
   DEMO REQUEST DATA
   These fields match the BLOOD_REQUEST database structure.
   ========================================================= */

let bloodRequests = [];


/* =========================================================
   LOAD BLOOD REQUESTS FROM MYSQL
   ========================================================= */

async function loadBloodRequests() {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/blood-requests"
        );


        if (!response.ok) {

            throw new Error(
                "Failed to fetch blood requests"
            );

        }


        const data =
            await response.json();


        bloodRequests = data.map(function (request) {

            return {

                requestId:
                    "REQ" + request.Request_ID,

                patientName:
                    request.Patient_Name,

                bloodGroup:
                    request.Blood_Group,

                unitsRequired:
                    request.Units_Required,

                emergencyLevel:
                    request.Emergency_Level,

                requestDate:
                    request.Request_Date,

                hospital:
                    request.Hospital_Name,

                hospitalId:
                    request.Hospital_ID

            };

        });


        console.log(
            "Blood requests loaded from MySQL:",
            bloodRequests
        );


        renderRequests();

        updateSummaryCards();


    } catch (error) {

        console.error(
            "Error loading blood requests:",
            error
        );


        alert(
            "Unable to load blood requests from the backend."
        );

    }
}


async function loadHospitals() {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/hospitals"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch hospitals");
        }

        const hospitals = await response.json();

        const hospitalSelect =
            document.getElementById("hospital");

        if (!hospitalSelect) return;

        hospitalSelect.innerHTML = `
            <option value="">
                Select Hospital
            </option>
        `;

        hospitals.forEach(function (hospital) {

            const option =
                document.createElement("option");

            option.value = hospital.Hospital_ID;

            option.textContent =
                hospital.Hospital_Name;

            hospitalSelect.appendChild(option);

        });

        console.log(
            "Hospitals loaded from MySQL:",
            hospitals
        );

    } catch (error) {

        console.error(
            "Error loading hospitals:",
            error
        );

        alert(
            "Unable to load hospitals from the backend."
        );
    }
}


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

function initializePage() {

    setDefaultDate();

    initializeMobileMenu();

    initializeForm();

    initializeSearch();

    initializeModal();

    renderRequests();

    updateSummaryCards();

    initializeNotification();

    initializeUserProfile();
}


/* =========================================================
   SET TODAY'S DATE
   ========================================================= */

function setDefaultDate() {

    const dateInput = document.getElementById("requestDate");

    if (!dateInput) return;

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;
}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function initializeMobileMenu() {

    const menuButton = document.getElementById("menuButton");

    const sidebar = document.querySelector(".sidebar");

    if (!menuButton || !sidebar) return;

    menuButton.addEventListener("click", function () {

        sidebar.classList.toggle("mobile-open");

    });


    document.addEventListener("click", function (event) {

        const clickedInsideSidebar =
            sidebar.contains(event.target);

        const clickedMenuButton =
            menuButton.contains(event.target);

        if (
            !clickedInsideSidebar &&
            !clickedMenuButton &&
            sidebar.classList.contains("mobile-open")
        ) {

            sidebar.classList.remove("mobile-open");

        }

    });


    const navigationItems =
        document.querySelectorAll(".nav-item");

    navigationItems.forEach(function (item) {

        item.addEventListener("click", function () {

            if (window.innerWidth <= 800) {

                sidebar.classList.remove("mobile-open");

            }

        });

    });
}


/* =========================================================
   BLOOD GROUP ID MAPPING
   ========================================================= */

function getBloodGroupId(bloodGroup) {

    const bloodGroupMap = {
        "A+": 1,
        "A-": 2,
        "B+": 3,
        "B-": 4,
        "AB+": 5,
        "AB-": 6,
        "O+": 7,
        "O-": 8
    };

    return bloodGroupMap[bloodGroup];
}


/* =========================================================
   BLOOD REQUEST FORM
   ========================================================= */

function initializeForm() {

    const form = document.getElementById("bloodRequestForm");

    if (!form) return;

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const patientName =
            document.getElementById("patientName").value.trim();

        const bloodGroup =
            document.getElementById("bloodGroup").value;

        const unitsRequired =
            parseInt(
                document.getElementById("unitsRequired").value
            );

        const requestDate =
            document.getElementById("requestDate").value;

        const emergencyLevel =
            document.getElementById("emergencyLevel").value;

        const hospitalSelect =
            document.getElementById("hospital");

        const hospitalId =
            hospitalSelect.value;

        const hospitalName =
            hospitalSelect.options[
                hospitalSelect.selectedIndex
            ].text;


        /* ---------- Validation ---------- */

        if (!patientName) {

            alert("Please enter the patient name.");

            return;
        }


        if (!bloodGroup) {

            alert("Please select a blood group.");

            return;
        }


        if (!unitsRequired || unitsRequired <= 0) {

            alert("Units required must be greater than 0.");

            return;
        }


        if (!requestDate) {

            alert("Please select the request date.");

            return;
        }


        if (!emergencyLevel) {

            alert("Please select the emergency level.");

            return;
        }


        if (!hospitalId) {

            alert("Please select a hospital.");

            return;
        }


        /* ---------- Send request to Flask / MySQL ---------- */

        try {

            const bloodGroupId =
                getBloodGroupId(bloodGroup);

            if (!bloodGroupId) {

                alert("Invalid blood group selected.");

                return;
            }


            const response = await fetch(
                "http://127.0.0.1:5000/api/blood-requests",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

    Patient_Name: patientName,

    Blood_Group_ID: bloodGroupId,

    Units_Required: unitsRequired,

    Emergency_Level: emergencyLevel,

    Request_Date: requestDate,

    Hospital_ID: parseInt(hospitalId),

    User_ID: JSON.parse(
        localStorage.getItem("bloodLinkUser")
    ).User_ID

})
                }
            );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Failed to create blood request"
                );

            }


            alert(
                "Blood request created successfully.\n\n" +
                "Request ID: REQ" +
                result.Request_ID
            );


            /* ---------- Reload requests from MySQL ---------- */

            await loadBloodRequests();



            /* ---------- Reset form ---------- */

            form.reset();

            setDefaultDate();


        } catch (error) {

            console.error(
                "Error creating blood request:",
                error
            );


            alert(
                "Unable to create blood request.\n\n" +
                error.message
            );

        }

    });
}


/* =========================================================
   GENERATE TEMPORARY REQUEST ID
   ========================================================= */

function generateRequestId() {

    const number =
        bloodRequests.length + 1;

    return "REQ" +
        String(number).padStart(3, "0");
}


/* =========================================================
   RENDER REQUEST TABLE
   ========================================================= */

function renderRequests(requestList = bloodRequests) {

    const tableBody =
        document.getElementById("requestTableBody");

    if (!tableBody) return;


    tableBody.innerHTML = "";


    if (requestList.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="no-results">
                    No blood requests found.
                </td>
            </tr>
        `;

        return;
    }


    requestList.forEach(function (request) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>${request.requestId}</strong>
            </td>

            <td>
                ${request.patientName}
            </td>

            <td>
                <span class="blood-badge">
                    ${request.bloodGroup}
                </span>
            </td>

            <td>
                ${request.unitsRequired}
            </td>

            <td>
                <span class="emergency-badge ${getEmergencyClass(request.emergencyLevel)}">
                    ${request.emergencyLevel}
                </span>
            </td>

            <td>
                ${request.requestDate}
            </td>

            <td>
                ${request.hospital}
            </td>

            <td>
                <button
                    class="table-action"
                    onclick="viewRequest('${request.requestId}')"
                    title="View Request"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>
            </td>

        `;


        tableBody.appendChild(row);

    });
}


/* =========================================================
   EMERGENCY BADGE CLASS
   ========================================================= */

function getEmergencyClass(level) {

    if (!level) return "";

    return level
        .toLowerCase()
        .replace(/\s+/g, "-");

}


/* =========================================================
   UPDATE SUMMARY CARDS
   ========================================================= */

function updateSummaryCards() {

    const criticalCount =
        bloodRequests.filter(function (request) {

            return request.emergencyLevel === "Critical";

        }).length;


    const urgentCount =
        bloodRequests.filter(function (request) {

            return request.emergencyLevel === "Urgent";

        }).length;


    const normalCount =
        bloodRequests.filter(function (request) {

            return request.emergencyLevel === "Normal";

        }).length;


    const totalCount =
        bloodRequests.length;


    const criticalElement =
        document.getElementById("criticalCount");

    const urgentElement =
        document.getElementById("urgentCount");

    const normalElement =
        document.getElementById("normalCount");

    const totalElement =
        document.getElementById("totalCount");


    if (criticalElement) {

        criticalElement.textContent =
            criticalCount;

    }


    if (urgentElement) {

        urgentElement.textContent =
            urgentCount;

    }


    if (normalElement) {

        normalElement.textContent =
            normalCount;

    }


    if (totalElement) {

        totalElement.textContent =
            totalCount;

    }
}


/* =========================================================
   SEARCH REQUESTS
   ========================================================= */

function initializeSearch() {

    const searchInput =
        document.getElementById("requestSearch");

    if (!searchInput) return;


    searchInput.addEventListener("input", function () {

        const searchText =
            this.value.toLowerCase().trim();


        if (!searchText) {

            renderRequests();

            return;

        }


        const filteredRequests =
            bloodRequests.filter(function (request) {

                return (

                    request.requestId
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    request.patientName
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    request.bloodGroup
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    request.emergencyLevel
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    request.hospital
                        .toLowerCase()
                        .includes(searchText)

                );

            });


        renderRequests(filteredRequests);

    });
}


/* =========================================================
   VIEW REQUEST DETAILS
   ========================================================= */

function viewRequest(requestId) {

    const request =
        bloodRequests.find(function (item) {

            return item.requestId === requestId;

        });


    if (!request) {

        alert("Request details not found.");

        return;

    }


    const modal =
        document.getElementById("requestModal");

    if (!modal) return;


    const modalBody =
        document.getElementById("modalRequestBody");

    if (modalBody) {

        modalBody.innerHTML = `

            <div class="detail-row">
                <span>Request ID</span>
                <strong>${request.requestId}</strong>
            </div>

            <div class="detail-row">
                <span>Patient Name</span>
                <strong>${request.patientName}</strong>
            </div>

            <div class="detail-row">
                <span>Blood Group</span>
                <strong>${request.bloodGroup}</strong>
            </div>

            <div class="detail-row">
                <span>Units Required</span>
                <strong>${request.unitsRequired}</strong>
            </div>

            <div class="detail-row">
                <span>Emergency Level</span>
                <strong>${request.emergencyLevel}</strong>
            </div>

            <div class="detail-row">
                <span>Request Date</span>
                <strong>${request.requestDate}</strong>
            </div>

            <div class="detail-row">
                <span>Hospital</span>
                <strong>${request.hospital}</strong>
            </div>

        `;

    }


    modal.classList.add("show");

}


/* =========================================================
   MODAL CONTROLS
   ========================================================= */

function initializeModal() {

    const modal =
        document.getElementById("requestModal");

    if (!modal) return;


    const closeButton =
        modal.querySelector(".modal-close");


    if (closeButton) {

        closeButton.addEventListener("click", function () {

            modal.classList.remove("show");

        });

    }


    window.addEventListener("click", function (event) {

        if (event.target === modal) {

            modal.classList.remove("show");

        }

    });


    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            modal.classList.remove("show");

        }

    });

}


/* =========================================================
   NOTIFICATION
   ========================================================= */

function initializeNotification() {

    const notificationButton =
        document.querySelector(".notification-btn");

    if (!notificationButton) return;


    notificationButton.addEventListener("click", function () {

        alert(
            "BloodLink Notifications\n\n" +
            "You have new blood request notifications."
        );

    });

}


/* =========================================================
   USER PROFILE
   ========================================================= */

function initializeUserProfile() {

    const userProfile =
        document.querySelector(".user-profile");

    if (!userProfile) return;


    userProfile.addEventListener("click", function () {

        alert(
            "Administrator Profile\n\n" +
            "Role: System Administrator"
        );

    });

}


/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener("resize", function () {

    const sidebar =
        document.querySelector(".sidebar");

    if (!sidebar) return;


    if (window.innerWidth > 800) {

        sidebar.classList.remove("mobile-open");

    }

});


/* =========================================================
   FUTURE MYSQL / FLASK CONNECTION
   =========================================================

   Later, when your friend's Flask backend is ready,
   the demo submission above will be replaced by something
   similar to:

   fetch("http://localhost:5000/api/blood-requests", {
       method: "POST",
       headers: {
           "Content-Type": "application/json"
       },
       body: JSON.stringify({
           Patient_Name: patientName,
           Blood_Group_ID: bloodGroupId,
           Units_Required: unitsRequired,
           Emergency_Level: emergencyLevel,
           Request_Date: requestDate,
           Hospital_ID: hospitalId
       })
   });

   The Flask backend will then insert the data into:

   BLOOD_REQUEST

   We will NOT connect JavaScript directly to MySQL.
   ========================================================= */