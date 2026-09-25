/* =========================================================
   BLOODLINK - REPORTS JAVASCRIPT
   Emergency Blood Donor Finder System
   ========================================================= */


/* =========================================================
   API CONFIGURATION
   ========================================================= */

const API_BASE_URL =
    "http://127.0.0.1:5000/api";


/* =========================================================
   REAL REPORT DATA
   ---------------------------------------------------------
   Data is loaded from Flask API → MySQL.
   ========================================================= */

const reportData = {

    donors: {
        total: 0,
        status: "Available",
        description:
            "Registered blood donors in the system."
    },

    requests: {
        total: 0,
        status: "Active",
        description:
            "Blood requests recorded in the system."
    },

    donations: {
        total: 0,
        status: "Recorded",
        description:
            "Blood donation records."
    },

    inventory: {
        total: 0,
        status: "Available",
        description:
            "Total blood units currently available."
    },

    responses: {
        total: 0,
        status: "Recorded",
        description:
            "Donor responses to blood requests."
    }

};


/* =========================================================
   REAL SUMMARY DATA
   ========================================================= */

const requestSummary = {

    critical: 0,

    urgent: 0,

    normal: 0

};


const responseSummary = {

    accepted: 0,

    pending: 0,

    rejected: 0

};


const inventorySummary = {

    groups: 0,

    banks: 0,

    lowStock: 0

};


/* =========================================================
   ADDITIONAL REPORT DATA
   ========================================================= */

let demandedGroupsData = [];

let lowInventoryData = [];

let emergencySummaryData = [];


/* =========================================================
   RAW DATA FOR DATE FILTERING
   ========================================================= */

let allBloodRequests = [];

let allDonations = [];

let allResponses = [];


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("-----------------------------------------");
        console.log("          BLOODLINK REPORTS");
        console.log("-----------------------------------------");

        initializeReportsPage();

    }
);


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

function initializeReportsPage() {

    setDefaultDates();

    initializeReportType();

    initializeDateFilters();

    initializeReset();

    initializeGenerateReport();

    initializeRefresh();

    initializeModal();

    initializeMobileMenu();

    initializeNotification();

    initializeUserProfile();

    loadReports();

}


/* =========================================================
   LOAD REPORT DATA
   ========================================================= */

async function loadReports() {

    showLoadingState();


    try {

        /* =================================================
           LOAD DASHBOARD COUNTS
           ================================================= */

        const dashboardResponse =
            await fetch(
                `${API_BASE_URL}/dashboard`
            );


        if (!dashboardResponse.ok) {

            throw new Error(
                `Dashboard API returned ${dashboardResponse.status}`
            );

        }


        const dashboardData =
            await dashboardResponse.json();


        /* =================================================
           LOAD REPORT-SPECIFIC DATA
           ================================================= */

        const reportsResponse =
            await fetch(
                `${API_BASE_URL}/reports`
            );


        if (!reportsResponse.ok) {

            throw new Error(
                `Reports API returned ${reportsResponse.status}`
            );

        }


        const reportsData =
            await reportsResponse.json();


        /* =================================================
           LOAD ALL BLOOD REQUESTS
           ================================================= */

        const requestsResponse =
            await fetch(
                `${API_BASE_URL}/blood-requests`
            );


        if (!requestsResponse.ok) {

            throw new Error(
                `Blood Requests API returned ${requestsResponse.status}`
            );

        }


        allBloodRequests =
            await requestsResponse.json();


        if (!Array.isArray(allBloodRequests)) {

            allBloodRequests = [];

        }


        /* =================================================
           LOAD ALL DONATIONS
           ================================================= */

        const donationsResponse =
            await fetch(
                `${API_BASE_URL}/donations`
            );


        if (!donationsResponse.ok) {

            throw new Error(
                `Donations API returned ${donationsResponse.status}`
            );

        }


        allDonations =
            await donationsResponse.json();


        if (!Array.isArray(allDonations)) {

            allDonations = [];

        }


        /* =================================================
           LOAD ALL DONOR RESPONSES
           ================================================= */

        const responsesResponse =
            await fetch(
                `${API_BASE_URL}/responses`
            );


        if (!responsesResponse.ok) {

            throw new Error(
                `Responses API returned ${responsesResponse.status}`
            );

        }


        allResponses =
            await responsesResponse.json();


        if (!Array.isArray(allResponses)) {

            allResponses = [];

        }


        /* =================================================
           MAIN REPORT COUNTS
           ================================================= */

        reportData.donors.total =
            Number(
                dashboardData.total_donors || 0
            );


        /*
           Initially use the complete database
           totals.

           Date filtering will change the
           request/donation/response values later.
        */

        reportData.requests.total =
            allBloodRequests.length;


        reportData.donations.total =
            allDonations.length;


        reportData.inventory.total =
            Number(
                dashboardData.total_inventory_units || 0
            );


        reportData.responses.total =
            allResponses.length;


        /* =================================================
           REQUEST REPORT DATA
           ================================================= */

        emergencySummaryData =
            reportsData.emergency_summary || [];


        /*
           Calculate the complete request summary
           directly from the actual request records.
        */

        calculateRequestSummary(
            allBloodRequests
        );


        /* =================================================
           RESPONSE REPORT DATA
           ================================================= */

        calculateResponseSummary(
            allResponses
        );


        /*
           Backend pending count is used only
           when no date filter is active.
        */

        if (
            dashboardData.pending_responses !== undefined &&
            !hasActiveDateFilter()
        ) {

            responseSummary.pending =
                Number(
                    dashboardData.pending_responses
                );

        }


        /* =================================================
           INVENTORY REPORT DATA
           ================================================= */

        demandedGroupsData =
            reportsData.demanded_groups || [];


        lowInventoryData =
            reportsData.low_inventory || [];


        inventorySummary.groups =
            demandedGroupsData.length;


        inventorySummary.banks =
            Number(
                dashboardData.total_blood_banks || 0
            );


        inventorySummary.lowStock =
            lowInventoryData.length;


        /* =================================================
           INITIAL DISPLAY
           ================================================= */

        applyDateFilter();


        console.log(
            "Reports loaded from MySQL:",
            {
                dashboard:
                    dashboardData,

                reports:
                    reportsData,

                bloodRequests:
                    allBloodRequests,

                donations:
                    allDonations,

                responses:
                    allResponses
            }
        );


    } catch (error) {

        console.error(
            "Error loading reports:",
            error
        );


        showErrorState();


        alert(
            "Unable to load report data.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   CALCULATE REQUEST SUMMARY
   ========================================================= */

function calculateRequestSummary(
    requests
) {

    requestSummary.critical = 0;

    requestSummary.urgent = 0;

    requestSummary.normal = 0;


    if (!Array.isArray(requests)) {

        return;

    }


    requests.forEach(
        function (request) {

            const level =
                String(
                    request.Emergency_Level || ""
                )
                .trim()
                .toLowerCase();


            if (level === "critical") {

                requestSummary.critical++;

            }

            else if (level === "urgent") {

                requestSummary.urgent++;

            }

            else if (level === "normal") {

                requestSummary.normal++;

            }

        }
    );

}


/* =========================================================
   CALCULATE RESPONSE SUMMARY
   ========================================================= */

function calculateResponseSummary(
    responses
) {

    responseSummary.accepted = 0;

    responseSummary.pending = 0;

    responseSummary.rejected = 0;


    if (!Array.isArray(responses)) {

        return;

    }


    responses.forEach(
        function (response) {

            const status =
                String(
                    response.Response_Status || ""
                )
                .trim()
                .toLowerCase();


            if (status === "accepted") {

                responseSummary.accepted++;

            }

            else if (status === "pending") {

                responseSummary.pending++;

            }

            else if (status === "rejected") {

                responseSummary.rejected++;

            }

        }
    );

}


/* =========================================================
   CHECK WHETHER DATE FILTER IS ACTIVE
   ========================================================= */

function hasActiveDateFilter() {

    const fromDate =
        document.getElementById(
            "fromDate"
        );


    const toDate =
        document.getElementById(
            "toDate"
        );


    return Boolean(
        (
            fromDate &&
            fromDate.value
        ) ||
        (
            toDate &&
            toDate.value
        )
    );

}


/* =========================================================
   APPLY DATE FILTER
   ========================================================= */

function applyDateFilter() {

    const fromDateElement =
        document.getElementById(
            "fromDate"
        );


    const toDateElement =
        document.getElementById(
            "toDate"
        );


    const fromDate =
        fromDateElement
            ? fromDateElement.value
            : "";


    const toDate =
        toDateElement
            ? toDateElement.value
            : "";


    /* =====================================================
       FILTER BLOOD REQUESTS
       ===================================================== */

    const filteredRequests =
        filterRecordsByDate(
            allBloodRequests,
            "Request_Date",
            fromDate,
            toDate
        );


    /* =====================================================
       FILTER DONATIONS
       ===================================================== */

    const filteredDonations =
        filterRecordsByDate(
            allDonations,
            "Donation_Date",
            fromDate,
            toDate
        );


    /* =====================================================
       FILTER RESPONSES
       ===================================================== */

    const filteredResponses =
        filterRecordsByDate(
            allResponses,
            "Response_Date",
            fromDate,
            toDate
        );


    /* =====================================================
       REQUEST COUNT
       ===================================================== */

    reportData.requests.total =
        filteredRequests.length;


    /* =====================================================
       DONATION COUNT
       ===================================================== */

    reportData.donations.total =
        filteredDonations.length;


    /* =====================================================
       RESPONSE COUNT
       ===================================================== */

    reportData.responses.total =
        filteredResponses.length;


    /* =====================================================
       REQUEST SUMMARY
       ===================================================== */

    calculateRequestSummary(
        filteredRequests
    );


    /* =====================================================
       RESPONSE SUMMARY
       ===================================================== */

    calculateResponseSummary(
        filteredResponses
    );


    /* =====================================================
       IF THERE IS NO DATE FILTER
       RESTORE COMPLETE DATABASE VALUES
       ===================================================== */

    if (!fromDate && !toDate) {

        reportData.requests.total =
            allBloodRequests.length;


        reportData.donations.total =
            allDonations.length;


        reportData.responses.total =
            allResponses.length;


        calculateRequestSummary(
            allBloodRequests
        );


        calculateResponseSummary(
            allResponses
        );

    }


    /* =====================================================
       UPDATE PAGE
       ===================================================== */

    updateSummaryCards();

    updateReportInformation();

    renderReportTable();


    console.log(
        "Report date filter applied:",
        {
            from:
                fromDate || "All",

            to:
                toDate || "All",

            requests:
                filteredRequests.length,

            donations:
                filteredDonations.length,

            responses:
                filteredResponses.length
        }
    );

}


/* =========================================================
   FILTER RECORDS BY DATE
   ========================================================= */

function filterRecordsByDate(
    records,
    dateField,
    fromDate,
    toDate
) {

    if (!Array.isArray(records)) {

        return [];

    }


    return records.filter(
        function (record) {

            const recordDate =
                record[dateField];


            if (!recordDate) {

                return false;

            }


            /*
               MySQL DATE values are YYYY-MM-DD.

               We use the first 10 characters
               to avoid timezone issues.
            */

            const recordDateText =
                String(
                    recordDate
                ).substring(
                    0,
                    10
                );


            if (
                fromDate &&
                recordDateText < fromDate
            ) {

                return false;

            }


            if (
                toDate &&
                recordDateText > toDate
            ) {

                return false;

            }


            return true;

        }
    );

}


/* =========================================================
   LOADING STATE
   ========================================================= */

function showLoadingState() {

    const elements = [

        "totalDonors",
        "totalRequests",
        "totalDonations",
        "availableUnits",
        "criticalRequests",
        "urgentRequests",
        "normalRequests",
        "acceptedResponses",
        "pendingResponses",
        "rejectedResponses",
        "inventoryGroups",
        "inventoryBanks",
        "lowStockRecords"

    ];


    elements.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    "...";

            }

        }
    );


    const tableBody =
        document.getElementById(
            "reportTableBody"
        );


    if (tableBody) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="no-results"
                >
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <br><br>
                    Loading report data...
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   ERROR STATE
   ========================================================= */

function showErrorState() {

    const elements = [

        "totalDonors",
        "totalRequests",
        "totalDonations",
        "availableUnits",
        "criticalRequests",
        "urgentRequests",
        "normalRequests",
        "acceptedResponses",
        "pendingResponses",
        "rejectedResponses",
        "inventoryGroups",
        "inventoryBanks",
        "lowStockRecords"

    ];


    elements.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    "0";

            }

        }
    );


    const tableBody =
        document.getElementById(
            "reportTableBody"
        );


    if (tableBody) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="no-results"
                >
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <br><br>
                    Unable to load report data.
                    <br><br>
                    Please make sure the Flask server is running.
                </td>
            </tr>
        `;

    }


    const summary =
        document.getElementById(
            "reportSummary"
        );


    if (summary) {

        summary.textContent =
            "Unable to load report data";

    }

}


/* =========================================================
   SET DEFAULT DATES
   ========================================================= */

function setDefaultDates() {

    const fromDate =
        document.getElementById(
            "fromDate"
        );


    const toDate =
        document.getElementById(
            "toDate"
        );


    if (
        !fromDate ||
        !toDate
    ) {

        return;

    }


    /*
       Empty date range means:

       "All Records"
    */

    fromDate.value = "";

    toDate.value = "";

}


/* =========================================================
   UPDATE SUMMARY CARDS
   ========================================================= */

function updateSummaryCards() {

    const totalDonors =
        document.getElementById(
            "totalDonors"
        );


    const totalRequests =
        document.getElementById(
            "totalRequests"
        );


    const totalDonations =
        document.getElementById(
            "totalDonations"
        );


    const availableUnits =
        document.getElementById(
            "availableUnits"
        );


    if (totalDonors) {

        totalDonors.textContent =
            reportData.donors.total;

    }


    if (totalRequests) {

        totalRequests.textContent =
            reportData.requests.total;

    }


    if (totalDonations) {

        totalDonations.textContent =
            reportData.donations.total;

    }


    if (availableUnits) {

        availableUnits.textContent =
            reportData.inventory.total;

    }


    /* =====================================================
       REQUEST SUMMARY
       ===================================================== */

    const critical =
        document.getElementById(
            "criticalRequests"
        );


    const urgent =
        document.getElementById(
            "urgentRequests"
        );


    const normal =
        document.getElementById(
            "normalRequests"
        );


    if (critical) {

        critical.textContent =
            requestSummary.critical;

    }


    if (urgent) {

        urgent.textContent =
            requestSummary.urgent;

    }


    if (normal) {

        normal.textContent =
            requestSummary.normal;

    }


    /* =====================================================
       RESPONSE SUMMARY
       ===================================================== */

    const accepted =
        document.getElementById(
            "acceptedResponses"
        );


    const pending =
        document.getElementById(
            "pendingResponses"
        );


    const rejected =
        document.getElementById(
            "rejectedResponses"
        );


    if (accepted) {

        accepted.textContent =
            responseSummary.accepted;

    }


    if (pending) {

        pending.textContent =
            responseSummary.pending;

    }


    if (rejected) {

        rejected.textContent =
            responseSummary.rejected;

    }


    /* =====================================================
       INVENTORY SUMMARY
       ===================================================== */

    const groups =
        document.getElementById(
            "inventoryGroups"
        );


    const banks =
        document.getElementById(
            "inventoryBanks"
        );


    const lowStock =
        document.getElementById(
            "lowStockRecords"
        );


    if (groups) {

        groups.textContent =
            inventorySummary.groups;

    }


    if (banks) {

        banks.textContent =
            inventorySummary.banks;

    }


    if (lowStock) {

        lowStock.textContent =
            inventorySummary.lowStock;

    }

}


/* =========================================================
   REPORT TABLE
   ========================================================= */

function renderReportTable() {

    const tableBody =
        document.getElementById(
            "reportTableBody"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    const rows = [

        {
            category:
                "Registered Donors",

            total:
                reportData.donors.total,

            status:
                "Available",

            statusClass:
                "available",

            description:
                reportData.donors.description
        },

        {
            category:
                "Blood Requests",

            total:
                reportData.requests.total,

            status:
                "Active",

            statusClass:
                "info",

            description:
                reportData.requests.description
        },

        {
            category:
                "Blood Donations",

            total:
                reportData.donations.total,

            status:
                "Recorded",

            statusClass:
                "available",

            description:
                reportData.donations.description
        },

        {
            category:
                "Blood Inventory",

            total:
                reportData.inventory.total,

            status:
                "Available",

            statusClass:
                "available",

            description:
                reportData.inventory.description
        },

        {
            category:
                "Donor Responses",

            total:
                reportData.responses.total,

            status:
                "Recorded",

            statusClass:
                "info",

            description:
                reportData.responses.description
        }

    ];


    rows.forEach(
        function (row) {

            const tableRow =
                document.createElement(
                    "tr"
                );


            tableRow.innerHTML = `

                <td>
                    <strong>
                        ${escapeHTML(
                            row.category
                        )}
                    </strong>
                </td>

                <td>
                    ${row.total}
                </td>

                <td>

                    <span
                        class="report-status ${row.statusClass}"
                    >
                        ${escapeHTML(
                            row.status
                        )}
                    </span>

                </td>

                <td>
                    ${escapeHTML(
                        row.description
                    )}
                </td>

            `;


            tableBody.appendChild(
                tableRow
            );

        }
    );


    const summary =
        document.getElementById(
            "reportSummary"
        );


    if (summary) {

        summary.textContent =
            `Showing ${rows.length} report categories`;

    }

}


/* =========================================================
   REPORT TYPE
   ========================================================= */

function initializeReportType() {

    const reportType =
        document.getElementById(
            "reportType"
        );


    if (!reportType) {

        return;

    }


    reportType.addEventListener(
        "change",
        function () {

            updateReportInformation();

        }
    );

}


/* =========================================================
   DATE FILTERS
   ========================================================= */

function initializeDateFilters() {

    const fromDate =
        document.getElementById(
            "fromDate"
        );


    const toDate =
        document.getElementById(
            "toDate"
        );


    if (fromDate) {

        fromDate.addEventListener(
            "change",
            function () {

                if (
                    validateDates()
                ) {

                    applyDateFilter();

                }

            }
        );

    }


    if (toDate) {

        toDate.addEventListener(
            "change",
            function () {

                if (
                    validateDates()
                ) {

                    applyDateFilter();

                }

            }
        );

    }

}


/* =========================================================
   VALIDATE DATE RANGE
   ========================================================= */

function validateDates() {

    const fromDate =
        document.getElementById(
            "fromDate"
        );


    const toDate =
        document.getElementById(
            "toDate"
        );


    if (
        !fromDate ||
        !toDate
    ) {

        return true;

    }


    /*
       Both empty = all records.
    */

    if (
        !fromDate.value &&
        !toDate.value
    ) {

        updateReportInformation();

        return true;

    }


    /*
       Only From Date selected.
    */

    if (
        fromDate.value &&
        !toDate.value
    ) {

        updateReportInformation();

        return true;

    }


    /*
       Only To Date selected.
    */

    if (
        !fromDate.value &&
        toDate.value
    ) {

        updateReportInformation();

        return true;

    }


    /*
       Both selected.
    */

    if (
        new Date(fromDate.value) >
        new Date(toDate.value)
    ) {

        alert(
            "From Date cannot be later than To Date."
        );


        toDate.value = "";


        updateReportInformation();

        return false;

    }


    updateReportInformation();

    return true;

}


/* =========================================================
   UPDATE REPORT INFORMATION
   ========================================================= */

function updateReportInformation() {

    const reportType =
        document.getElementById(
            "reportType"
        );


    const fromDate =
        document.getElementById(
            "fromDate"
        );


    const toDate =
        document.getElementById(
            "toDate"
        );


    const selectedType =
        document.getElementById(
            "selectedReportType"
        );


    const selectedDateRange =
        document.getElementById(
            "selectedDateRange"
        );


    /* =====================================================
       REPORT TYPE
       ===================================================== */

    if (
        reportType &&
        selectedType
    ) {

        const selectedOption =
            reportType.options[
                reportType.selectedIndex
            ];


        if (selectedOption) {

            selectedType.textContent =
                selectedOption.textContent;

        }

    }


    /* =====================================================
       DATE RANGE
       ===================================================== */

    if (selectedDateRange) {

        const from =
            fromDate
                ? fromDate.value
                : "";


        const to =
            toDate
                ? toDate.value
                : "";


        if (
            from &&
            to
        ) {

            selectedDateRange.textContent =
                formatDate(from) +
                " to " +
                formatDate(to);

        }

        else if (from) {

            selectedDateRange.textContent =
                "From " +
                formatDate(from);

        }

        else if (to) {

            selectedDateRange.textContent =
                "Until " +
                formatDate(to);

        }

        else {

            selectedDateRange.textContent =
                "All Records";

        }

    }

}


/* =========================================================
   RESET REPORT
   ========================================================= */

function initializeReset() {

    const resetButton =
        document.getElementById(
            "resetReport"
        );


    if (!resetButton) {

        return;

    }


    resetButton.addEventListener(
        "click",
        function () {

            const reportType =
                document.getElementById(
                    "reportType"
                );


            const fromDate =
                document.getElementById(
                    "fromDate"
                );


            const toDate =
                document.getElementById(
                    "toDate"
                );


            if (reportType) {

                reportType.value =
                    "overview";

            }


            if (fromDate) {

                fromDate.value = "";

            }


            if (toDate) {

                toDate.value = "";

            }


            updateReportInformation();

            applyDateFilter();

        }
    );

}


/* =========================================================
   GENERATE REPORT
   ========================================================= */

function initializeGenerateReport() {

    const generateButton =
        document.getElementById(
            "generateReportButton"
        );


    if (!generateButton) {

        return;

    }


    generateButton.addEventListener(
        "click",
        function () {

            if (
                !validateDates()
            ) {

                return;

            }


            /*
               Make sure the latest selected
               date range is reflected before
               opening the generated report.
            */

            applyDateFilter();


            const reportType =
                document.getElementById(
                    "reportType"
                );


            const fromDate =
                document.getElementById(
                    "fromDate"
                );


            const toDate =
                document.getElementById(
                    "toDate"
                );


            const modal =
                document.getElementById(
                    "reportModal"
                );


            const message =
                document.getElementById(
                    "generatedReportMessage"
                );


            let typeName =
                "System Overview";


            if (reportType) {

                typeName =
                    reportType.options[
                        reportType.selectedIndex
                    ].textContent;

            }


            let dateText =
                "all available records";


            if (
                fromDate &&
                toDate &&
                fromDate.value &&
                toDate.value
            ) {

                dateText =
                    `${formatDate(
                        fromDate.value
                    )} to ${formatDate(
                        toDate.value
                    )}`;

            }

            else if (
                fromDate &&
                fromDate.value
            ) {

                dateText =
                    `from ${formatDate(
                        fromDate.value
                    )}`;

            }

            else if (
                toDate &&
                toDate.value
            ) {

                dateText =
                    `until ${formatDate(
                        toDate.value
                    )}`;

            }


            if (message) {

                message.textContent =
                    `${typeName} has been prepared ` +
                    `for ${dateText}.`;

            }


            if (modal) {

                modal.classList.add(
                    "show"
                );

            }


            console.log(
                "Report generated:",
                {
                    type:
                        typeName,

                    from:
                        fromDate
                            ? fromDate.value
                            : "",

                    to:
                        toDate
                            ? toDate.value
                            : "",

                    filteredRequests:
                        reportData.requests.total,

                    filteredDonations:
                        reportData.donations.total,

                    filteredResponses:
                        reportData.responses.total
                }
            );

        }
    );

}


/* =========================================================
   REFRESH REPORT
   ========================================================= */

function initializeRefresh() {

    const refreshButton =
        document.getElementById(
            "refreshReport"
        );


    if (!refreshButton) {

        return;

    }


    refreshButton.addEventListener(
        "click",
        async function () {

            const originalButtonHTML =
                refreshButton.innerHTML;


            refreshButton.disabled =
                true;


            refreshButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Refreshing...
            `;


            try {

                await loadReports();


                console.log(
                    "Report data refreshed from MySQL."
                );


            } catch (error) {

                console.error(
                    "Report refresh error:",
                    error
                );

            }


            refreshButton.disabled =
                false;


            refreshButton.innerHTML =
                originalButtonHTML;

        }
    );

}


/* =========================================================
   MODAL
   ========================================================= */

function initializeModal() {

    const modal =
        document.getElementById(
            "reportModal"
        );


    const closeButton =
        document.getElementById(
            "closeReportModal"
        );


    const closeReportButton =
        document.getElementById(
            "closeReportButton"
        );


    const downloadButton =
        document.getElementById(
            "downloadReportButton"
        );


    /* =====================================================
       CLOSE
       ===================================================== */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                if (modal) {

                    modal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    if (closeReportButton) {

        closeReportButton.addEventListener(
            "click",
            function () {

                if (modal) {

                    modal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    /* =====================================================
       EXPORT
       ===================================================== */

    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            function () {

                alert(
                    "Report export will be connected to the backend later."
                );

            }
        );

    }


    /* =====================================================
       CLICK OUTSIDE
       ===================================================== */

    window.addEventListener(
        "click",
        function (event) {

            if (
                modal &&
                event.target === modal
            ) {

                modal.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =====================================================
       ESCAPE
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                modal
            ) {

                modal.classList.remove(
                    "show"
                );

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


    if (
        !menuButton ||
        !sidebar
    ) {

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
   USER PROFILE
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
   FORMAT DATE
   ========================================================= */

function formatDate(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"
        }
    );

}


/* =========================================================
   HTML ESCAPE HELPER
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
   BACKEND INTEGRATION
   =========================================================

   FINAL ARCHITECTURE:

   Browser
       ↓
   reports.js
       ↓
   Flask API
       ↓
   MySQL
       ↓
   EmergencyBloodDonorFinder


   APIs used:

   GET /api/dashboard

   GET /api/reports

   GET /api/blood-requests

   GET /api/donations

   GET /api/responses


   Date fields used:

   BLOOD_REQUEST
       → Request_Date

   DONATION
       → Donation_Date

   DONOR_RESPONSE
       → Response_Date


   IMPORTANT:

   Do NOT put MySQL username/password
   inside this JavaScript file.

   Database credentials remain
   inside the Flask backend.

   ========================================================= */


/* =========================================================
   FINAL CONSOLE MESSAGE
   ========================================================= */

console.log(
    "-----------------------------------------"
);

console.log(
    "       BLOODLINK REPORTS"
);

console.log(
    "       Data source: MySQL"
);

console.log(
    "       Backend API: CONNECTED"
);

console.log(
    "       Date filtering: ENABLED"
);

console.log(
    "-----------------------------------------"
);