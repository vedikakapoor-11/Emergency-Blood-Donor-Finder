/* =========================================================
   BLOODLINK - DONOR RESPONSES JAVASCRIPT
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
    DONOR_RESPONSE
*/


document.addEventListener("DOMContentLoaded", function () {


    console.log("-----------------------------------------");
    console.log("       BLOODLINK DONOR RESPONSES");
    console.log("-----------------------------------------");
    console.log("Responses page loaded successfully.");
    console.log("Backend API: CONNECTED");
    console.log("-----------------------------------------");


    /* =====================================================
       API
       ===================================================== */

    const API_BASE_URL =
        "http://127.0.0.1:5000/api";


    /* =====================================================
       RESPONSE DATA
       ===================================================== */

    let responseData = [];


    /* =====================================================
       ELEMENT REFERENCES
       ===================================================== */

    const menuButton =
        document.getElementById("menuButton");


    const sidebar =
        document.querySelector(".sidebar");


    const totalResponses =
        document.getElementById("totalResponses");


    const acceptedResponses =
        document.getElementById("acceptedResponses");


    const pendingResponses =
        document.getElementById("pendingResponses");


    const rejectedResponses =
        document.getElementById("rejectedResponses");


    const responseSearch =
        document.getElementById("responseSearch");


    const responseStatus =
        document.getElementById("responseStatus");


    const responseDate =
        document.getElementById("responseDate");


    const resetFilters =
        document.getElementById("resetFilters");


    const refreshResponses =
        document.getElementById("refreshResponses");


    const responseTableBody =
        document.getElementById("responseTableBody");


    const resultSummary =
        document.getElementById("resultSummary");


    /* =====================================================
       MODAL ELEMENTS
       ===================================================== */

    const responseModal =
        document.getElementById("responseModal");


    const modalResponseTitle =
        document.getElementById("modalResponseTitle");


    const modalResponseBody =
        document.getElementById("modalResponseBody");


    const closeResponseModal =
        document.getElementById("closeResponseModal");


    const closeResponseButton =
        document.getElementById("closeResponseButton");


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
                    sidebar.contains(event.target);


                const clickedMenuButton =
                    menuButton.contains(event.target);


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
       GET STATUS CLASS
       ===================================================== */

    function getStatusClass(status) {

        if (status === "Accepted") {

            return "accepted";

        }


        if (status === "Rejected") {

            return "rejected";

        }


        return "pending";

    }


    /* =====================================================
       FORMAT DATE
       ===================================================== */

    function formatDate(dateString) {

        if (!dateString) {

            return "-";

        }


        const date =
            new Date(dateString);


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


    /* =====================================================
       LOAD RESPONSES FROM MYSQL
       ===================================================== */

    async function loadResponses() {

        try {

            console.log(
                "Loading donor responses from MySQL..."
            );


            const response = await fetch(
                `${API_BASE_URL}/responses`
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to fetch donor responses"
                );

            }


            const data =
                await response.json();


            responseData =
                data.map(function (item) {

                    return {

                        responseId:
                            Number(
                                item.Response_ID
                            ),

                        responseDate:
                            item.Response_Date,

                        responseStatus:
                            item.Response_Status,

                        donorId:
                            Number(
                                item.Donor_ID
                            ),

                        donorName:
                            item.Donor_Name,

                        bloodGroup:
                            item.Blood_Group,

                        requestId:
                            Number(
                                item.Request_ID
                            ),

                        patientName:
                            item.Patient_Name,

                        unitsRequired:
                            Number(
                                item.Units_Required
                            )

                    };

                });


            console.log(
                "Responses loaded from MySQL:",
                responseData
            );


            updateStatistics(
                responseData
            );


            displayResponses(
                responseData
            );


        }
        catch (error) {

            console.error(
                "Error loading donor responses:",
                error
            );


            responseData = [];


            updateStatistics([]);


            displayResponses([]);


            alert(
                "Unable to load donor responses from the backend."
            );

        }

    }


    /* =====================================================
       UPDATE STATISTICS
       ===================================================== */

    function updateStatistics(data) {

        let accepted = 0;

        let pending = 0;

        let rejected = 0;


        data.forEach(function (item) {

            if (
                item.responseStatus ===
                "Accepted"
            ) {

                accepted++;

            }


            else if (
                item.responseStatus ===
                "Pending"
            ) {

                pending++;

            }


            else if (
                item.responseStatus ===
                "Rejected"
            ) {

                rejected++;

            }

        });


        if (totalResponses) {

            totalResponses.textContent =
                data.length;

        }


        if (acceptedResponses) {

            acceptedResponses.textContent =
                accepted;

        }


        if (pendingResponses) {

            pendingResponses.textContent =
                pending;

        }


        if (rejectedResponses) {

            rejectedResponses.textContent =
                rejected;

        }

    }


    /* =====================================================
       DISPLAY RESPONSE TABLE
       ===================================================== */

    function displayResponses(data) {

        if (!responseTableBody) {

            return;

        }


        responseTableBody.innerHTML = "";


        if (data.length === 0) {

            responseTableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="no-results"
                    >

                        <i
                            class="fa-solid fa-inbox"
                        ></i>

                        <br><br>

                        No donor responses found.

                    </td>

                </tr>

            `;


            if (resultSummary) {

                resultSummary.textContent =
                    "Showing 0 responses";

            }


            return;

        }


        data.forEach(function (item) {

            const statusClass =
                getStatusClass(
                    item.responseStatus
                );


            const initials =
                getInitials(
                    item.donorName
                );


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <span class="response-id">

                        #${item.responseId}

                    </span>

                </td>


                <td>

                    <div class="donor-name">

                        <div class="donor-avatar-small">

                            ${initials}

                        </div>

                        <span>

                            ${item.donorName || "-"}

                        </span>

                    </div>

                </td>


                <td>

                    <span class="request-id">

                        #${item.requestId}

                    </span>

                </td>


                <td>

                    ${formatDate(
                        item.responseDate
                    )}

                </td>


                <td>

                    <span
                        class="response-status ${statusClass}"
                    >

                        ${item.responseStatus || "-"}

                    </span>

                </td>


                <td>

                    <button
                        class="table-action"
                        title="View response"
                        data-id="${item.responseId}"
                    >

                        <i
                            class="fa-solid fa-eye"
                        ></i>

                    </button>

                </td>

            `;


            responseTableBody.appendChild(row);

        });


        if (resultSummary) {

            resultSummary.textContent =
                `Showing ${data.length} response${data.length !== 1 ? "s" : ""}`;

        }


        addViewButtonEvents();

    }


    /* =====================================================
       GET DONOR INITIALS
       ===================================================== */

    function getInitials(name) {

        if (!name) {

            return "?";

        }


        const words =
            name.trim().split(" ");


        if (words.length === 1) {

            return words[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();

    }


    /* =====================================================
       VIEW BUTTON EVENTS
       ===================================================== */

    function addViewButtonEvents() {

        const buttons =
            document.querySelectorAll(
                ".table-action"
            );


        buttons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const responseId =
                        Number(
                            this.dataset.id
                        );


                    openResponseModal(
                        responseId
                    );

                }
            );

        });

    }


    /* =====================================================
       OPEN RESPONSE MODAL
       ===================================================== */

    function openResponseModal(responseId) {

        const response =
            responseData.find(
                function (item) {

                    return (
                        item.responseId ===
                        responseId
                    );

                }
            );


        if (
            !response ||
            !responseModal
        ) {

            return;

        }


        const statusClass =
            getStatusClass(
                response.responseStatus
            );


        if (modalResponseTitle) {

            modalResponseTitle.textContent =
                `Response #${response.responseId}`;

        }


        if (modalResponseBody) {

            modalResponseBody.innerHTML = `

                <div class="detail-row">

                    <span>
                        Response ID
                    </span>

                    <strong>
                        #${response.responseId}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Donor ID
                    </span>

                    <strong>
                        #${response.donorId}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Donor Name
                    </span>

                    <strong>
                        ${response.donorName || "-"}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Blood Group
                    </span>

                    <strong>
                        ${response.bloodGroup || "-"}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Request ID
                    </span>

                    <strong>
                        #${response.requestId}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Patient Name
                    </span>

                    <strong>
                        ${response.patientName || "-"}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Units Required
                    </span>

                    <strong>
                        ${response.unitsRequired || 0}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Response Date
                    </span>

                    <strong>
                        ${formatDate(
                            response.responseDate
                        )}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Response Status
                    </span>

                    <strong>

                        <span
                            class="response-status ${statusClass}"
                        >

                            ${response.responseStatus}

                        </span>

                    </strong>

                </div>


                <!-- =================================================
                     UPDATE RESPONSE STATUS
                     ================================================= -->

                <div
                    class="detail-row"
                    style="
                        margin-top: 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    "
                >

                    <span>
                        Update Response Status
                    </span>


                    <select
                        id="updateResponseStatus"
                        style="
                            width: 100%;
                            padding: 10px 12px;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            font-size: 14px;
                            background: white;
                            cursor: pointer;
                        "
                    >

                        <option
                            value="Pending"
                            ${response.responseStatus === "Pending" ? "selected" : ""}
                        >
                            Pending
                        </option>


                        <option
                            value="Accepted"
                            ${response.responseStatus === "Accepted" ? "selected" : ""}
                        >
                            Accepted
                        </option>


                        <option
                            value="Rejected"
                            ${response.responseStatus === "Rejected" ? "selected" : ""}
                        >
                            Rejected
                        </option>

                    </select>


                    <button
                        id="updateResponseButton"
                        type="button"
                        style="
                            width: 100%;
                            padding: 11px 16px;
                            border: none;
                            border-radius: 8px;
                            background: #dc2626;
                            color: white;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                        "
                    >

                        Update Status

                    </button>

                </div>

            `;


            /* =================================================
               UPDATE STATUS BUTTON
               ================================================= */

            const updateButton =
                document.getElementById(
                    "updateResponseButton"
                );


            if (updateButton) {

                updateButton.addEventListener(
                    "click",
                    async function () {

                        const statusSelect =
                            document.getElementById(
                                "updateResponseStatus"
                            );


                        if (!statusSelect) {

                            return;

                        }


                        const newStatus =
                            statusSelect.value;


                        if (
                            newStatus !== "Pending" &&
                            newStatus !== "Accepted" &&
                            newStatus !== "Rejected"
                        ) {

                            alert(
                                "Please select a valid response status."
                            );

                            return;

                        }


                        await updateResponseStatus(
                            response.responseId,
                            newStatus
                        );

                    }
                );

            }

        }


        responseModal.classList.add(
            "show"
        );


        document.body.style.overflow =
            "hidden";

    }


    /* =====================================================
       UPDATE RESPONSE STATUS
       ===================================================== */

    async function updateResponseStatus(
        responseId,
        newStatus
    ) {

        try {

            console.log(
                "Updating response:",
                responseId,
                "to:",
                newStatus
            );


            const updateButton =
                document.getElementById(
                    "updateResponseButton"
                );


            if (updateButton) {

                updateButton.disabled =
                    true;

                updateButton.textContent =
                    "Updating...";

                updateButton.style.opacity =
                    "0.7";

                updateButton.style.cursor =
                    "not-allowed";

            }


            const response =
                await fetch(
                    `${API_BASE_URL}/responses/${responseId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            Response_Status:
                                newStatus
                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to update response status"
                );

            }


            console.log(
                "Response status updated successfully:",
                data
            );


            /*
                Reload all response data
                directly from MySQL.
            */

            await loadResponses();


            /*
                Close the modal after
                successful update.
            */

            closeResponseDetails();


            alert(
                `Response #${responseId} updated to ${newStatus}.`
            );


        }
        catch (error) {

            console.error(
                "Error updating response status:",
                error
            );


            alert(
                "Unable to update response status.\n\n" +
                error.message
            );


            const updateButton =
                document.getElementById(
                    "updateResponseButton"
                );


            if (updateButton) {

                updateButton.disabled =
                    false;

                updateButton.textContent =
                    "Update Status";

                updateButton.style.opacity =
                    "1";

                updateButton.style.cursor =
                    "pointer";

            }

        }

    }


    /* =====================================================
       CLOSE RESPONSE MODAL
       ===================================================== */

    function closeResponseDetails() {

        if (!responseModal) {

            return;

        }


        responseModal.classList.remove(
            "show"
        );


        document.body.style.overflow =
            "";

    }


    if (closeResponseModal) {

        closeResponseModal.addEventListener(
            "click",
            closeResponseDetails
        );

    }


    if (closeResponseButton) {

        closeResponseButton.addEventListener(
            "click",
            closeResponseDetails
        );

    }


    /* =====================================================
       CLOSE WHEN CLICKING OUTSIDE MODAL
       ===================================================== */

    if (responseModal) {

        responseModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    responseModal
                ) {

                    closeResponseDetails();

                }

            }
        );

    }


    /* =====================================================
       SEARCH + FILTER
       ===================================================== */

    function applyFilters() {

        const searchText =
            responseSearch
                ? responseSearch.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedStatus =
            responseStatus
                ? responseStatus.value
                : "";


        const selectedDate =
            responseDate
                ? responseDate.value
                : "";


        const filteredData =
            responseData.filter(
                function (item) {


                    /* SEARCH */

                    const donorName =
                        item.donorName
                            ? item.donorName
                                .toLowerCase()
                            : "";


                    const matchesSearch =

                        searchText === "" ||

                        donorName.includes(
                            searchText
                        ) ||

                        String(
                            item.responseId
                        ).includes(
                            searchText
                        ) ||

                        String(
                            item.requestId
                        ).includes(
                            searchText
                        );


                    /* STATUS */

                    const matchesStatus =

                        selectedStatus === "" ||

                        item.responseStatus ===
                        selectedStatus;


                    /* DATE */

                    const matchesDate =

                        selectedDate === "" ||

                        item.responseDate ===
                        selectedDate;


                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesDate
                    );

                }
            );


        displayResponses(
            filteredData
        );


        updateStatistics(
            filteredData
        );

    }


    /* =====================================================
       SEARCH EVENT
       ===================================================== */

    if (responseSearch) {

        responseSearch.addEventListener(
            "input",
            applyFilters
        );

    }


    /* =====================================================
       STATUS FILTER EVENT
       ===================================================== */

    if (responseStatus) {

        responseStatus.addEventListener(
            "change",
            applyFilters
        );

    }


    /* =====================================================
       DATE FILTER EVENT
       ===================================================== */

    if (responseDate) {

        responseDate.addEventListener(
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


                if (responseSearch) {

                    responseSearch.value =
                        "";

                }


                if (responseStatus) {

                    responseStatus.value =
                        "";

                }


                if (responseDate) {

                    responseDate.value =
                        "";

                }


                updateStatistics(
                    responseData
                );


                displayResponses(
                    responseData
                );

            }
        );

    }


    /* =====================================================
       REFRESH RESPONSES
       ===================================================== */

    if (refreshResponses) {

        refreshResponses.addEventListener(
            "click",
            async function () {

                await loadResponses();


                alert(
                    "Donor responses refreshed successfully."
                );

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

                const pendingCount =
                    responseData.filter(
                        function (item) {

                            return (
                                item.responseStatus ===
                                "Pending"
                            );

                        }
                    ).length;


                alert(
                    "Donor Response Notifications\n\n" +
                    "Pending donor responses: " +
                    pendingCount
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

    loadResponses();

});