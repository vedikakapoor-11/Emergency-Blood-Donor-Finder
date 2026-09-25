/* =========================================================
   BLOODLINK - HOSPITALS JAVASCRIPT
   Emergency Blood Donor Finder System
   ========================================================= */

/*
    FINAL ARCHITECTURE:

    Frontend
        ↓
    Flask API
        ↓
    MySQL
        ↓
    HOSPITAL
*/


document.addEventListener("DOMContentLoaded", function () {


    console.log("-----------------------------------------");
    console.log("       BLOODLINK HOSPITALS");
    console.log("-----------------------------------------");
    console.log("Hospitals page loaded successfully.");
    console.log("Backend API: CONNECTED");
    console.log("-----------------------------------------");


    /* =====================================================
       API
       ===================================================== */

    const API_BASE_URL =
        "http://127.0.0.1:5000/api";


    /* =====================================================
       HOSPITAL DATA
       ===================================================== */

    let hospitalData = [];


    /* =====================================================
       ELEMENT REFERENCES
       ===================================================== */

    const menuButton =
        document.getElementById("menuButton");


    const sidebar =
        document.querySelector(".sidebar");


    const totalHospitals =
        document.getElementById("totalHospitals");


    const locationCount =
        document.getElementById("locationCount");


    const contactCount =
        document.getElementById("contactCount");


    const directoryStatus =
        document.getElementById("directoryStatus");


    const hospitalSearch =
        document.getElementById("hospitalSearch");


    const hospitalLocation =
        document.getElementById("hospitalLocation");


    const resetFilters =
        document.getElementById("resetFilters");


    const refreshHospitals =
        document.getElementById("refreshHospitals");


    const hospitalTableBody =
        document.getElementById("hospitalTableBody");


    const resultSummary =
        document.getElementById("resultSummary");


    /* =====================================================
       DETAILS MODAL
       ===================================================== */

    const hospitalModal =
        document.getElementById("hospitalModal");


    const modalHospitalTitle =
        document.getElementById("modalHospitalTitle");


    const modalHospitalBody =
        document.getElementById("modalHospitalBody");


    const closeHospitalModal =
        document.getElementById("closeHospitalModal");


    const closeHospitalButton =
        document.getElementById("closeHospitalButton");


    /* =====================================================
       ADD HOSPITAL MODAL
       ===================================================== */

    const addHospitalButton =
        document.getElementById("addHospitalButton");


    const addHospitalModal =
        document.getElementById("addHospitalModal");


    const closeAddHospitalModal =
        document.getElementById(
            "closeAddHospitalModal"
        );


    const addHospitalForm =
        document.getElementById(
            "addHospitalForm"
        );


    const cancelAddHospital =
        document.getElementById(
            "cancelAddHospital"
        );


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    if (menuButton && sidebar) {

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

    }


    /* =====================================================
       UPDATE STATISTICS
       ===================================================== */

    function updateStatistics(data) {

        const locations =
            new Set();


        let contacts = 0;


        data.forEach(
            function (hospital) {

                if (hospital.location) {

                    locations.add(
                        hospital.location
                    );

                }


                if (
                    hospital.phone &&
                    hospital.phone.trim() !== ""
                ) {

                    contacts++;

                }

            }
        );


        if (totalHospitals) {

            totalHospitals.textContent =
                data.length;

        }


        if (locationCount) {

            locationCount.textContent =
                locations.size;

        }


        if (contactCount) {

            contactCount.textContent =
                contacts;

        }


        if (directoryStatus) {

            directoryStatus.textContent =
                "Active";

        }

    }


    /* =====================================================
       POPULATE LOCATION FILTER
       ===================================================== */

    function populateLocationFilter() {

        if (!hospitalLocation) {

            return;

        }


        const currentValue =
            hospitalLocation.value;


        const locations =
            [
                ...new Set(
                    hospitalData
                        .map(
                            function (hospital) {

                                return hospital.location;

                            }
                        )
                        .filter(
                            function (location) {

                                return location;

                            }
                        )
                )
            ].sort();


        hospitalLocation.innerHTML = `

            <option value="">
                All Locations
            </option>

        `;


        locations.forEach(
            function (location) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    location;


                option.textContent =
                    location;


                hospitalLocation.appendChild(
                    option
                );

            }
        );


        if (
            locations.includes(
                currentValue
            )
        ) {

            hospitalLocation.value =
                currentValue;

        }

    }


    /* =====================================================
       LOAD HOSPITALS FROM MYSQL
       ===================================================== */

    async function loadHospitals() {

        try {

            console.log(
                "Loading hospitals from MySQL..."
            );


            const response =
                await fetch(
                    `${API_BASE_URL}/hospitals`
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to fetch hospitals"
                );

            }


            const data =
                await response.json();


            hospitalData =
                data.map(
                    function (hospital) {

                        return {

                            hospitalId:
                                Number(
                                    hospital.Hospital_ID
                                ),

                            hospitalName:
                                hospital.Hospital_Name,

                            location:
                                hospital.Location,

                            phone:
                                hospital.Phone || ""

                        };

                    }
                );


            console.log(
                "Hospitals loaded from MySQL:",
                hospitalData
            );


            populateLocationFilter();


            updateStatistics(
                hospitalData
            );


            displayHospitals(
                hospitalData
            );


        }
        catch (error) {

            console.error(
                "Error loading hospitals:",
                error
            );


            hospitalData = [];


            populateLocationFilter();


            updateStatistics([]);


            displayHospitals([]);


            alert(
                "Unable to load hospitals from the backend."
            );

        }

    }


    /* =====================================================
       DISPLAY HOSPITAL TABLE
       ===================================================== */

    function displayHospitals(data) {

        if (!hospitalTableBody) {

            return;

        }


        hospitalTableBody.innerHTML = "";


        if (data.length === 0) {

            hospitalTableBody.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="no-results"
                    >

                        <i
                            class="fa-solid fa-hospital"
                        ></i>

                        <br><br>

                        No hospitals found.

                    </td>

                </tr>

            `;


            if (resultSummary) {

                resultSummary.textContent =
                    "Showing 0 hospitals";

            }


            return;

        }


        data.forEach(
            function (hospital) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        <span class="hospital-id">

                            #${hospital.hospitalId}

                        </span>

                    </td>


                    <td>

                        <div class="hospital-name">

                            <div class="hospital-icon">

                                <i
                                    class="fa-solid fa-hospital"
                                ></i>

                            </div>

                            <span>

                                ${hospital.hospitalName || "-"}

                            </span>

                        </div>

                    </td>


                    <td>

                        <div class="location-cell">

                            <i
                                class="fa-solid fa-location-dot"
                            ></i>

                            <span>

                                ${hospital.location || "-"}

                            </span>

                        </div>

                    </td>


                    <td>

                        <div class="phone-cell">

                            <i
                                class="fa-solid fa-phone"
                            ></i>

                            <span>

                                ${hospital.phone || "-"}

                            </span>

                        </div>

                    </td>


                    <td>

                        <button
                            class="table-action"
                            title="View hospital"
                            data-id="${hospital.hospitalId}"
                        >

                            <i
                                class="fa-solid fa-eye"
                            ></i>

                        </button>

                    </td>

                `;


                hospitalTableBody.appendChild(
                    row
                );

            }
        );


        if (resultSummary) {

            resultSummary.textContent =
                `Showing ${data.length} hospital${data.length !== 1 ? "s" : ""}`;

        }


        addViewButtonEvents();

    }


    /* =====================================================
       VIEW BUTTON EVENTS
       ===================================================== */

    function addViewButtonEvents() {

        const buttons =
            document.querySelectorAll(
                ".table-action"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const hospitalId =
                            Number(
                                this.dataset.id
                            );


                        openHospitalModal(
                            hospitalId
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       OPEN HOSPITAL DETAILS MODAL
       ===================================================== */

    function openHospitalModal(
        hospitalId
    ) {

        const hospital =
            hospitalData.find(
                function (item) {

                    return (
                        item.hospitalId ===
                        hospitalId
                    );

                }
            );


        if (
            !hospital ||
            !hospitalModal
        ) {

            return;

        }


        if (modalHospitalTitle) {

            modalHospitalTitle.textContent =
                hospital.hospitalName;

        }


        if (modalHospitalBody) {

            modalHospitalBody.innerHTML = `

                <div class="detail-row">

                    <span>
                        Hospital ID
                    </span>

                    <strong>
                        #${hospital.hospitalId}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Hospital Name
                    </span>

                    <strong>
                        ${hospital.hospitalName || "-"}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Location
                    </span>

                    <strong>
                        ${hospital.location || "-"}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Phone
                    </span>

                    <strong>
                        ${hospital.phone || "-"}
                    </strong>

                </div>

            `;

        }


        hospitalModal.classList.add(
            "show"
        );


        document.body.style.overflow =
            "hidden";

    }


    /* =====================================================
       CLOSE DETAILS MODAL
       ===================================================== */

    function closeHospitalDetails() {

        if (!hospitalModal) {

            return;

        }


        hospitalModal.classList.remove(
            "show"
        );


        document.body.style.overflow =
            "";

    }


    if (closeHospitalModal) {

        closeHospitalModal.addEventListener(
            "click",
            closeHospitalDetails
        );

    }


    if (closeHospitalButton) {

        closeHospitalButton.addEventListener(
            "click",
            closeHospitalDetails
        );

    }


    if (hospitalModal) {

        hospitalModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    hospitalModal
                ) {

                    closeHospitalDetails();

                }

            }
        );

    }


    /* =====================================================
       SEARCH + FILTER
       ===================================================== */

    function applyFilters() {

        const searchText =
            hospitalSearch
                ? hospitalSearch.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedLocation =
            hospitalLocation
                ? hospitalLocation.value
                : "";


        const filteredData =
            hospitalData.filter(
                function (hospital) {

                    const hospitalName =
                        hospital.hospitalName
                            ? hospital.hospitalName
                                .toLowerCase()
                            : "";


                    const location =
                        hospital.location
                            ? hospital.location
                                .toLowerCase()
                            : "";


                    const phone =
                        hospital.phone
                            ? hospital.phone
                                .toLowerCase()
                            : "";


                    const matchesSearch =

                        searchText === "" ||

                        hospitalName.includes(
                            searchText
                        ) ||

                        location.includes(
                            searchText
                        ) ||

                        phone.includes(
                            searchText
                        ) ||

                        String(
                            hospital.hospitalId
                        ).includes(
                            searchText
                        );


                    const matchesLocation =

                        selectedLocation === "" ||

                        hospital.location ===
                        selectedLocation;


                    return (
                        matchesSearch &&
                        matchesLocation
                    );

                }
            );


        displayHospitals(
            filteredData
        );


        updateStatistics(
            filteredData
        );

    }


    /* =====================================================
       SEARCH EVENT
       ===================================================== */

    if (hospitalSearch) {

        hospitalSearch.addEventListener(
            "input",
            applyFilters
        );

    }


    /* =====================================================
       LOCATION FILTER EVENT
       ===================================================== */

    if (hospitalLocation) {

        hospitalLocation.addEventListener(
            "change",
            applyFilters
        );

    }


    /* =====================================================
       RESET FILTERS
       ===================================================== */

    if (resetFilters) {

        resetFilters.addEventListener(
            "click",
            function () {

                if (hospitalSearch) {

                    hospitalSearch.value =
                        "";

                }


                if (hospitalLocation) {

                    hospitalLocation.value =
                        "";

                }


                updateStatistics(
                    hospitalData
                );


                displayHospitals(
                    hospitalData
                );

            }
        );

    }


    /* =====================================================
       REFRESH HOSPITALS
       ===================================================== */

    if (refreshHospitals) {

        refreshHospitals.addEventListener(
            "click",
            async function () {

                await loadHospitals();


                alert(
                    "Hospital directory refreshed successfully."
                );

            }
        );

    }


    /* =====================================================
       OPEN ADD HOSPITAL MODAL
       ===================================================== */

    if (addHospitalButton) {

        addHospitalButton.addEventListener(
            "click",
            function () {

                if (!addHospitalModal) {

                    return;

                }


                addHospitalModal.classList.add(
                    "show"
                );


                document.body.style.overflow =
                    "hidden";

            }
        );

    }


    /* =====================================================
       CLOSE ADD HOSPITAL MODAL
       ===================================================== */

    function closeAddHospital() {

        if (!addHospitalModal) {

            return;

        }


        addHospitalModal.classList.remove(
            "show"
        );


        document.body.style.overflow =
            "";

    }


    if (closeAddHospitalModal) {

        closeAddHospitalModal.addEventListener(
            "click",
            closeAddHospital
        );

    }


    if (cancelAddHospital) {

        cancelAddHospital.addEventListener(
            "click",
            closeAddHospital
        );

    }


    if (addHospitalModal) {

        addHospitalModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    addHospitalModal
                ) {

                    closeAddHospital();

                }

            }
        );

    }


    /* =====================================================
       ADD HOSPITAL FORM
       ===================================================== */

    if (addHospitalForm) {

        addHospitalForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const idInput =
                    document.getElementById(
                        "hospitalId"
                    );


                const nameInput =
                    document.getElementById(
                        "hospitalName"
                    );


                const locationInput =
                    document.getElementById(
                        "hospitalLocationInput"
                    );


                const phoneInput =
                    document.getElementById(
                        "hospitalPhone"
                    );


                if (
                    !idInput ||
                    !nameInput ||
                    !locationInput ||
                    !phoneInput
                ) {

                    return;

                }


                const hospitalId =
                    Number(
                        idInput.value
                    );


                const hospitalName =
                    nameInput.value.trim();


                const location =
                    locationInput.value.trim();


                const phone =
                    phoneInput.value.trim();


                /* =================================================
                   VALIDATION
                   ================================================= */

                if (
                    !hospitalId ||
                    hospitalId < 1
                ) {

                    alert(
                        "Please enter a valid Hospital ID."
                    );

                    return;

                }


                if (!hospitalName) {

                    alert(
                        "Please enter the hospital name."
                    );

                    return;

                }


                if (!location) {

                    alert(
                        "Please enter the hospital location."
                    );

                    return;

                }


                if (!phone) {

                    alert(
                        "Please enter the hospital phone number."
                    );

                    return;

                }


                /* =================================================
                   CHECK DUPLICATE ID
                   ================================================= */

                const duplicate =
                    hospitalData.some(
                        function (hospital) {

                            return (
                                hospital.hospitalId ===
                                hospitalId
                            );

                        }
                    );


                if (duplicate) {

                    alert(
                        "This Hospital ID already exists."
                    );

                    return;

                }


                /* =================================================
                   DISABLE SUBMIT BUTTON
                   ================================================= */

                const submitButton =
                    addHospitalForm.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Adding...";

                }


                try {

                    console.log(
                        "Adding hospital:",
                        {
                            hospitalId:
                                hospitalId,

                            hospitalName:
                                hospitalName,

                            location:
                                location,

                            phone:
                                phone
                        }
                    );


                    /* =============================================
                       SEND TO FLASK
                       ============================================= */

                    const response =
                        await fetch(
                            `${API_BASE_URL}/hospitals`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        Hospital_ID:
                                            hospitalId,

                                        Hospital_Name:
                                            hospitalName,

                                        Location:
                                            location,

                                        Phone:
                                            phone

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to add hospital"
                        );

                    }


                    console.log(
                        "Hospital added successfully:",
                        data
                    );


                    /* =============================================
                       RELOAD FROM MYSQL
                       ============================================= */

                    await loadHospitals();


                    /* =============================================
                       RESET FORM
                       ============================================= */

                    addHospitalForm.reset();


                    /* =============================================
                       CLOSE MODAL
                       ============================================= */

                    closeAddHospital();


                    alert(
                        "Hospital added successfully."
                    );


                }
                catch (error) {

                    console.error(
                        "Error adding hospital:",
                        error
                    );


                    alert(
                        "Unable to add hospital.\n\n" +
                        error.message
                    );

                }
                finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "Add Hospital";

                    }

                }

            }
        );

    }


    /* =====================================================
       NOTIFICATION
       ===================================================== */

    const notificationButton =
        document.querySelector(
            ".notification-btn"
        );


    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            function () {

                alert(
                    "Hospital Notifications\n\n" +
                    "Hospital directory is currently up to date."
                );

            }
        );

    }


    /* =====================================================
       USER PROFILE
       ===================================================== */

    const userProfile =
        document.querySelector(
            ".user-profile"
        );


    if (userProfile) {

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


    /* =====================================================
       WINDOW RESIZE
       ===================================================== */

    window.addEventListener(
        "resize",
        function () {

            if (!sidebar) {

                return;

            }


            if (window.innerWidth > 800) {

                sidebar.classList.remove(
                    "mobile-open"
                );

            }

        }
    );


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    loadHospitals();

});