/* =========================================================
   BLOODLINK - USER DASHBOARD JAVASCRIPT
   Emergency Blood Donor Finder System
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("-----------------------------------------");
    console.log("       BLOODLINK USER DASHBOARD");
    console.log("-----------------------------------------");
    console.log("User dashboard loaded successfully.");
    console.log("Mode: USER");
    console.log("Backend connection: ACTIVE");
    console.log("-----------------------------------------");


    /* =====================================================
       ELEMENT REFERENCES
       ===================================================== */

    const menuButton =
        document.getElementById("menuButton");

    const sidebar =
        document.getElementById("sidebar");

    const notificationButton =
        document.getElementById("notificationButton");

    const notificationBadge =
        document.getElementById("notificationBadge");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const closeNotifications =
        document.getElementById("closeNotifications");

    const userProfileButton =
        document.getElementById("userProfileButton");

    const profileMenu =
        document.getElementById("profileMenu");

    const profileMenuProfile =
        document.getElementById("profileMenuProfile");

    const profileMenuLogout =
        document.getElementById("profileMenuLogout");

    const logoutButton =
        document.getElementById("logoutButton");

    const findDonorButton =
        document.getElementById("findDonorButton");

    const requestBloodButton =
        document.getElementById("requestBloodButton");

    const becomeDonorButton =
        document.getElementById("becomeDonorButton");

    const emergencyFindButton =
        document.getElementById("emergencyFindButton");

    const viewAllRequestsButton =
        document.getElementById("viewAllRequestsButton");

    const createFirstRequestButton =
        document.getElementById("createFirstRequestButton");

    const registerDonorButton =
        document.getElementById("registerDonorButton");

    const userName =
        document.getElementById("userName");

    const welcomeMessage =
        document.getElementById("welcomeMessage");

    const profileMenuName =
        document.getElementById("profileMenuName");

    const profileMenuEmail =
        document.getElementById("profileMenuEmail");

    const myRequestsCount =
        document.getElementById("myRequestsCount");

    const myDonationsCount =
        document.getElementById("myDonationsCount");

    const myResponsesCount =
        document.getElementById("myResponsesCount");

    const donorStatus =
        document.getElementById("donorStatus");
    const recentRequests =
    document.getElementById("recentRequests");

    /* =====================================================
       GET LOGGED-IN USER
       ===================================================== */

    const loggedInUserJSON =
        localStorage.getItem("bloodLinkUser");


    if (!loggedInUserJSON) {

        console.log(
            "No logged-in user found."
        );

        window.location.href =
            "login.html";

        return;

    }


    let loggedInUser;

    try {

        loggedInUser =
            JSON.parse(loggedInUserJSON);

    } catch (error) {

        console.error(
            "Invalid logged-in user data:",
            error
        );

        localStorage.removeItem(
            "bloodLinkUser"
        );

        window.location.href =
            "login.html";

        return;

    }


    /* =====================================================
       VALIDATE USER ID
       ===================================================== */

    if (
        !loggedInUser ||
        !loggedInUser.User_ID
    ) {

        console.error(
            "User ID not found in login data."
        );

        localStorage.removeItem(
            "bloodLinkUser"
        );

        window.location.href =
            "login.html";

        return;

    }


    console.log(
        "Logged-in user:",
        loggedInUser
    );


    /* =====================================================
       LOAD USER INFORMATION
       ===================================================== */

    function loadUserInformation() {

        const name =
            loggedInUser.Name ||
            "User";

        const email =
            loggedInUser.Email ||
            "";


        if (userName) {

            userName.textContent =
                name;

        }


        if (welcomeMessage) {

            welcomeMessage.textContent =
                `Welcome to BloodLink, ${name}!`;

        }


        if (profileMenuName) {

            profileMenuName.textContent =
                name;

        }


        if (profileMenuEmail) {

            profileMenuEmail.textContent =
                email;

        }

    }


    /* =====================================================
       LOAD USER DASHBOARD FROM FLASK
       ===================================================== */

    async function loadUserDashboard() {

        try {

            console.log(
                "Loading user dashboard..."
            );


            const response =
                await fetch(
                    `http://127.0.0.1:5000/api/user-dashboard/${loggedInUser.User_ID}`
                );


            const data =
                await response.json();


            console.log(
                "User dashboard API response:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load dashboard"
                );

            }


            /* =================================================
               UPDATE USER INFORMATION
               ================================================= */

            if (data.user) {

                const user =
                    data.user;


                if (userName) {

                    userName.textContent =
                        user.Name ||
                        "User";

                }


                if (welcomeMessage) {

                    welcomeMessage.textContent =
                        `Welcome to BloodLink, ${user.Name || "User"}!`;

                }


                if (profileMenuName) {

                    profileMenuName.textContent =
                        user.Name ||
                        "User";

                }


                if (profileMenuEmail) {

                    profileMenuEmail.textContent =
                        user.Email ||
                        "";

                }

            }


            /* =================================================
               UPDATE MY REQUESTS
               ================================================= */

            if (myRequestsCount) {

                const requestCount =
        data.my_requests_count !== undefined &&
        data.my_requests_count !== null
            ? data.my_requests_count
            : Array.isArray(data.requests)
                ? data.requests.length
                : 0;

    myRequestsCount.textContent =
        requestCount;

            }
        renderRecentRequests(
    data.requests || []
);


            /* =================================================
               UPDATE MY DONATIONS
               ================================================= */

            if (myDonationsCount) {

                myDonationsCount.textContent =
                    data.my_donations_count ??
                    0;

            }


            /* =================================================
               UPDATE MY RESPONSES
               ================================================= */

            if (myResponsesCount) {

                myResponsesCount.textContent =
                    data.my_responses_count ??
                    0;

            }


            /* =================================================
               UPDATE DONOR STATUS
               ================================================= */

            if (donorStatus) {

                donorStatus.textContent =
                    data.donor_status ||
                    "Not Registered";

            }


            /* =================================================
               UPDATE NOTIFICATION COUNT
               ================================================= */

            updateNotificationCount(
                data.my_responses_count || 0
            );


            console.log(
                "User dashboard data loaded successfully."
            );

        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );


            if (myRequestsCount) {

                myRequestsCount.textContent =
                    "0";

            }


            if (myDonationsCount) {

                myDonationsCount.textContent =
                    "0";

            }


            if (myResponsesCount) {

                myResponsesCount.textContent =
                    "0";

            }


            if (donorStatus) {

                donorStatus.textContent =
                    "Not Available";

            }

        }

    }

/* =====================================================
   RENDER RECENT REQUESTS
   ===================================================== */

function renderRecentRequests(requests) {

    if (!recentRequests) {
        return;
    }


    /* -------------------------------------------------
       NO REQUESTS
       ------------------------------------------------- */

    if (!Array.isArray(requests) || requests.length === 0) {

        recentRequests.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    <i class="fa-solid fa-file-medical"></i>

                </div>

                <h3>
                    No requests yet
                </h3>

                <p>
                    Your recent blood requests will appear here.
                </p>

                <button
                    class="primary-button"
                    id="createFirstRequestButton"
                    type="button"
                >

                    <i class="fa-solid fa-plus"></i>

                    Request Blood

                </button>

            </div>

        `;


        const newCreateButton =
            document.getElementById(
                "createFirstRequestButton"
            );


        if (newCreateButton) {

            newCreateButton.addEventListener(
                "click",
                openBloodRequest
            );

        }


        return;

    }


    /* -------------------------------------------------
       SHOW REQUESTS
       ------------------------------------------------- */

    recentRequests.innerHTML = "";


    requests.forEach(function (request) {

        const requestCard =
            document.createElement("div");


        requestCard.style.cssText = `
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 22px;
            margin-bottom: 16px;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
        `;


        requestCard.innerHTML = `

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:15px;
                    margin-bottom:18px;
                    flex-wrap:wrap;
                "
            >

                <div>

                    <span
                        style="
                            font-size:12px;
                            font-weight:700;
                            color:#ef4444;
                            letter-spacing:0.8px;
                        "
                    >
                        BLOOD REQUEST
                    </span>

                    <h3
                        style="
                            margin:5px 0 0 0;
                            color:#172554;
                            font-size:20px;
                        "
                    >
                        REQ${request.Request_ID}
                    </h3>

                </div>


                <span
                    style="
                        background:#fff1f2;
                        color:#dc2626;
                        padding:7px 12px;
                        border-radius:20px;
                        font-size:13px;
                        font-weight:600;
                    "
                >
                    ${request.Emergency_Level || "Normal"}
                </span>

            </div>


            <div
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(auto-fit, minmax(180px, 1fr));
                    gap:14px;
                "
            >

                <div>

                    <small
                        style="
                            display:block;
                            color:#64748b;
                            margin-bottom:4px;
                        "
                    >
                        Patient
                    </small>

                    <strong>
                        ${request.Patient_Name || "-"}
                    </strong>

                </div>


                <div>

                    <small
                        style="
                            display:block;
                            color:#64748b;
                            margin-bottom:4px;
                        "
                    >
                        Blood Group
                    </small>

                    <strong>
                        ${request.Blood_Group || "-"}
                    </strong>

                </div>


                <div>

                    <small
                        style="
                            display:block;
                            color:#64748b;
                            margin-bottom:4px;
                        "
                    >
                        Units Required
                    </small>

                    <strong>
                        ${request.Units_Required || 0}
                    </strong>

                </div>


                <div>

                    <small
                        style="
                            display:block;
                            color:#64748b;
                            margin-bottom:4px;
                        "
                    >
                        Hospital
                    </small>

                    <strong>
                        ${request.Hospital_Name || "-"}
                    </strong>

                </div>


                <div>

                    <small
                        style="
                            display:block;
                            color:#64748b;
                            margin-bottom:4px;
                        "
                    >
                        Request Date
                    </small>

                    <strong>
                        ${request.Request_Date || "-"}
                    </strong>

                </div>

            </div>

        `;


        recentRequests.appendChild(
            requestCard
        );

    });

}
    /* =====================================================
       MOBILE SIDEBAR
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
       CLOSE SIDEBAR AFTER NAVIGATION
       ===================================================== */

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function () {

                if (
                    window.innerWidth <= 900 &&
                    sidebar
                ) {

                    sidebar.classList.remove(
                        "mobile-open"
                    );

                }

            }
        );

    });


    /* =====================================================
       NOTIFICATION PANEL
       ===================================================== */

    if (
        notificationButton &&
        notificationPanel
    ) {

        notificationButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                closeProfileMenu();

                notificationPanel.classList.toggle(
                    "show"
                );

            }
        );

    }


    if (closeNotifications) {

        closeNotifications.addEventListener(
            "click",
            function () {

                closeNotificationPanel();

            }
        );

    }


    function closeNotificationPanel() {

        if (notificationPanel) {

            notificationPanel.classList.remove(
                "show"
            );

        }

    }


    /* =====================================================
       UPDATE NOTIFICATION COUNT
       ===================================================== */

    function updateNotificationCount(count) {

        if (!notificationBadge) {

            return;

        }


        notificationBadge.textContent =
            count;


        if (count > 0) {

            notificationBadge.style.display =
                "flex";

        } else {

            notificationBadge.style.display =
                "none";

        }

    }


    /* =====================================================
       PROFILE MENU
       ===================================================== */

    if (
        userProfileButton &&
        profileMenu
    ) {

        userProfileButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                closeNotificationPanel();

                profileMenu.classList.toggle(
                    "show"
                );

            }
        );

    }


    function closeProfileMenu() {

        if (profileMenu) {

            profileMenu.classList.remove(
                "show"
            );

        }

    }


    /* =====================================================
       CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
       ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const clickedProfile =
                profileMenu &&
                profileMenu.contains(event.target);

            const clickedProfileButton =
                userProfileButton &&
                userProfileButton.contains(event.target);

            const clickedNotification =
                notificationPanel &&
                notificationPanel.contains(event.target);

            const clickedNotificationButton =
                notificationButton &&
                notificationButton.contains(event.target);


            if (
                !clickedProfile &&
                !clickedProfileButton
            ) {

                closeProfileMenu();

            }


            if (
                !clickedNotification &&
                !clickedNotificationButton
            ) {

                closeNotificationPanel();

            }

        }
    );


    /* =====================================================
       NAVIGATION HELPER
       ===================================================== */

    function showComingSoon(message) {

        alert(
            message +
            "\n\nThis feature will be connected in the next step."
        );

    }


    /* =====================================================
       FIND DONOR
       ===================================================== */

    function openFindDonor() {

   window.location.href = "../../pages/find-donor.html?mode=user";

}


    if (findDonorButton) {

        findDonorButton.addEventListener(
            "click",
            openFindDonor
        );

    }


    if (emergencyFindButton) {

        emergencyFindButton.addEventListener(
            "click",
            openFindDonor
        );

    }


    /* =====================================================
       REQUEST BLOOD
       ===================================================== */

    function openBloodRequest() {

 window.location.href = "../../pages/blood-request.html";

}


    if (requestBloodButton) {

        requestBloodButton.addEventListener(
            "click",
            openBloodRequest
        );

    }


    if (createFirstRequestButton) {

        createFirstRequestButton.addEventListener(
            "click",
            openBloodRequest
        );

    }

    /* =====================================================
       BECOME A DONOR
       ===================================================== */

    function becomeDonor() {

        /* -------------------------------------------------
           CHECK IF USER IS ALREADY A DONOR
           ------------------------------------------------- */

        if (
            donorStatus &&
            donorStatus.textContent.trim() !== "Not Registered"
        ) {

            alert(
                "You are already registered as a blood donor."
            );

            return;

        }


        /* -------------------------------------------------
           REMOVE OLD MODAL IF IT EXISTS
           ------------------------------------------------- */

        const oldModal =
            document.getElementById(
                "becomeDonorModal"
            );

        if (oldModal) {

            oldModal.remove();

        }


        /* -------------------------------------------------
           CREATE DONOR MODAL
           ------------------------------------------------- */

        const modal =
            document.createElement("div");

        modal.id =
            "becomeDonorModal";


        modal.innerHTML = `

            <div
                style="
                    position:fixed;
                    inset:0;
                    background:rgba(15,23,42,0.65);
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:20px;
                    z-index:9999;
                    backdrop-filter:blur(3px);
                "
                id="donorModalOverlay"
            >

                <div
                    style="
                        width:100%;
                        max-width:620px;
                        max-height:90vh;
                        overflow-y:auto;
                        background:#ffffff;
                        border-radius:20px;
                        box-shadow:0 20px 50px rgba(0,0,0,0.20);
                        padding:30px;
                        position:relative;
                    "
                >

                    <!-- =================================
                         CLOSE BUTTON
                    ================================== -->

                    <button
                        type="button"
                        id="closeDonorModal"
                        style="
                            position:absolute;
                            top:18px;
                            right:18px;
                            width:38px;
                            height:38px;
                            border:none;
                            border-radius:50%;
                            background:#f1f5f9;
                            color:#475569;
                            font-size:18px;
                            cursor:pointer;
                        "
                    >

                        <i class="fa-solid fa-xmark"></i>

                    </button>


                    <!-- =================================
                         HEADER
                    ================================== -->

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:15px;
                            margin-bottom:25px;
                            padding-right:45px;
                        "
                    >

                        <div
                            style="
                                width:52px;
                                height:52px;
                                border-radius:14px;
                                background:#fff1f2;
                                color:#dc2626;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:23px;
                            "
                        >

                            <i class="fa-solid fa-heart"></i>

                        </div>


                        <div>

                            <span
                                style="
                                    font-size:12px;
                                    font-weight:700;
                                    color:#dc2626;
                                    letter-spacing:0.8px;
                                "
                            >
                                SAVE A LIFE
                            </span>

                            <h2
                                style="
                                    margin:4px 0 0;
                                    color:#172554;
                                    font-size:24px;
                                "
                            >
                                Become a Donor
                            </h2>

                        </div>

                    </div>


                    <p
                        style="
                            color:#64748b;
                            font-size:14px;
                            line-height:1.6;
                            margin-bottom:25px;
                        "
                    >
                        Register yourself as a blood donor
                        and help someone in need.
                    </p>


                    <!-- =================================
                         FORM
                    ================================== -->

                    <form id="donorRegistrationForm">


                        <!-- NAME -->

                        <div
                            style="
                                margin-bottom:18px;
                            "
                        >

                            <label
                                for="donorName"
                                style="
                                    display:block;
                                    margin-bottom:7px;
                                    font-size:14px;
                                    font-weight:600;
                                    color:#334155;
                                "
                            >
                                Full Name
                            </label>

                            <input
                                type="text"
                                id="donorName"
                                value="${loggedInUser.Name || ""}"
                                required
                                style="
                                    width:100%;
                                    padding:12px 14px;
                                    border:1px solid #d5d5d5;
                                    border-radius:9px;
                                    outline:none;
                                    font-size:15px;
                                    box-sizing:border-box;
                                "
                            >

                        </div>


                        <!-- AGE + GENDER -->

                        <div
                            style="
                                display:grid;
                                grid-template-columns:
                                    repeat(
                                        auto-fit,
                                        minmax(180px,1fr)
                                    );
                                gap:16px;
                            "
                        >

                            <div
                                style="
                                    margin-bottom:18px;
                                "
                            >

                                <label
                                    for="donorAge"
                                    style="
                                        display:block;
                                        margin-bottom:7px;
                                        font-size:14px;
                                        font-weight:600;
                                        color:#334155;
                                    "
                                >
                                    Age
                                </label>

                                <input
                                    type="number"
                                    id="donorAge"
                                    min="18"
                                    max="100"
                                    required
                                    placeholder="Enter your age"
                                    style="
                                        width:100%;
                                        padding:12px 14px;
                                        border:1px solid #d5d5d5;
                                        border-radius:9px;
                                        outline:none;
                                        font-size:15px;
                                        box-sizing:border-box;
                                    "
                                >

                            </div>


                            <div
                                style="
                                    margin-bottom:18px;
                                "
                            >

                                <label
                                    for="donorGender"
                                    style="
                                        display:block;
                                        margin-bottom:7px;
                                        font-size:14px;
                                        font-weight:600;
                                        color:#334155;
                                    "
                                >
                                    Gender
                                </label>

                                <select
                                    id="donorGender"
                                    required
                                    style="
                                        width:100%;
                                        padding:12px 14px;
                                        border:1px solid #d5d5d5;
                                        border-radius:9px;
                                        outline:none;
                                        font-size:15px;
                                        background:#ffffff;
                                        box-sizing:border-box;
                                    "
                                >

                                    <option value="">
                                        Select Gender
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>

                        </div>


                        <!-- PHONE -->

                        <div
                            style="
                                margin-bottom:18px;
                            "
                        >

                            <label
                                for="donorPhone"
                                style="
                                    display:block;
                                    margin-bottom:7px;
                                    font-size:14px;
                                    font-weight:600;
                                    color:#334155;
                                "
                            >
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                id="donorPhone"
                                value="${loggedInUser.Phone || ""}"
                                maxlength="15"
                                required
                                placeholder="Enter phone number"
                                style="
                                    width:100%;
                                    padding:12px 14px;
                                    border:1px solid #d5d5d5;
                                    border-radius:9px;
                                    outline:none;
                                    font-size:15px;
                                    box-sizing:border-box;
                                "
                            >

                        </div>


                        <!-- LOCATION -->

                        <div
                            style="
                                margin-bottom:18px;
                            "
                        >

                            <label
                                for="donorLocation"
                                style="
                                    display:block;
                                    margin-bottom:7px;
                                    font-size:14px;
                                    font-weight:600;
                                    color:#334155;
                                "
                            >
                                Location
                            </label>

                            <input
                                type="text"
                                id="donorLocation"
                                required
                                placeholder="Example: Pune"
                                style="
                                    width:100%;
                                    padding:12px 14px;
                                    border:1px solid #d5d5d5;
                                    border-radius:9px;
                                    outline:none;
                                    font-size:15px;
                                    box-sizing:border-box;
                                "
                            >

                        </div>


                        <!-- BLOOD GROUP -->

                        <div
                            style="
                                margin-bottom:20px;
                            "
                        >

                            <label
                                for="donorBloodGroup"
                                style="
                                    display:block;
                                    margin-bottom:7px;
                                    font-size:14px;
                                    font-weight:600;
                                    color:#334155;
                                "
                            >
                                Blood Group
                            </label>

                            <select
                                id="donorBloodGroup"
                                required
                                style="
                                    width:100%;
                                    padding:12px 14px;
                                    border:1px solid #d5d5d5;
                                    border-radius:9px;
                                    outline:none;
                                    font-size:15px;
                                    background:#ffffff;
                                    box-sizing:border-box;
                                "
                            >

                                <option value="">
                                    Select Blood Group
                                </option>

                                <option value="1">
                                    A+
                                </option>

                                <option value="2">
                                    A-
                                </option>

                                <option value="3">
                                    B+
                                </option>

                                <option value="4">
                                    B-
                                </option>

                                <option value="5">
                                    AB+
                                </option>

                                <option value="6">
                                    AB-
                                </option>

                                <option value="7">
                                    O+
                                </option>

                                <option value="8">
                                    O-
                                </option>

                            </select>

                        </div>


                        <!-- MESSAGE -->

                        <div
                            id="donorFormMessage"
                            style="
                                display:none;
                                padding:12px 14px;
                                border-radius:9px;
                                margin-bottom:18px;
                                font-size:14px;
                            "
                        >
                        </div>


                        <!-- BUTTONS -->

                        <div
                            style="
                                display:flex;
                                gap:12px;
                                justify-content:flex-end;
                                flex-wrap:wrap;
                            "
                        >

                            <button
                                type="button"
                                id="cancelDonorRegistration"
                                style="
                                    padding:12px 20px;
                                    border:1px solid #cbd5e1;
                                    border-radius:9px;
                                    background:#ffffff;
                                    color:#475569;
                                    font-size:14px;
                                    font-weight:600;
                                    cursor:pointer;
                                "
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                id="submitDonorRegistration"
                                style="
                                    padding:12px 22px;
                                    border:none;
                                    border-radius:9px;
                                    background:#dc3545;
                                    color:#ffffff;
                                    font-size:14px;
                                    font-weight:600;
                                    cursor:pointer;
                                "
                            >

                                <i class="fa-solid fa-heart"></i>

                                Register as Donor

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        /* -------------------------------------------------
           ELEMENT REFERENCES
           ------------------------------------------------- */

        const donorForm =
            document.getElementById(
                "donorRegistrationForm"
            );

        const closeButton =
            document.getElementById(
                "closeDonorModal"
            );

        const cancelButton =
            document.getElementById(
                "cancelDonorRegistration"
            );

        const overlay =
            document.getElementById(
                "donorModalOverlay"
            );

        const message =
            document.getElementById(
                "donorFormMessage"
            );

        const submitButton =
            document.getElementById(
                "submitDonorRegistration"
            );


        /* -------------------------------------------------
           CLOSE MODAL
           ------------------------------------------------- */

        function closeDonorModal() {

            modal.remove();

            document.body.style.overflow =
                "";

        }


        closeButton.addEventListener(
            "click",
            closeDonorModal
        );


        cancelButton.addEventListener(
            "click",
            closeDonorModal
        );


        overlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    overlay
                ) {

                    closeDonorModal();

                }

            }
        );


        document.body.style.overflow =
            "hidden";


        /* -------------------------------------------------
           ESC KEY
           ------------------------------------------------- */

        function handleEscape(event) {

            if (
                event.key === "Escape"
            ) {

                closeDonorModal();

                document.removeEventListener(
                    "keydown",
                    handleEscape
                );

            }

        }


        document.addEventListener(
            "keydown",
            handleEscape
        );


        /* -------------------------------------------------
           SUBMIT DONOR FORM
           ------------------------------------------------- */

        donorForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                /* -----------------------------------------
                   GET FORM VALUES
                   ----------------------------------------- */

                const name =
                    document
                        .getElementById(
                            "donorName"
                        )
                        .value
                        .trim();


                const age =
                    document
                        .getElementById(
                            "donorAge"
                        )
                        .value;


                const gender =
                    document
                        .getElementById(
                            "donorGender"
                        )
                        .value;


                const phone =
                    document
                        .getElementById(
                            "donorPhone"
                        )
                        .value
                        .trim();


                const location =
                    document
                        .getElementById(
                            "donorLocation"
                        )
                        .value
                        .trim();


                const bloodGroupId =
                    document
                        .getElementById(
                            "donorBloodGroup"
                        )
                        .value;


                /* -----------------------------------------
                   VALIDATION
                   ----------------------------------------- */

                if (!name) {

                    message.style.display =
                        "block";

                    message.style.background =
                        "#fef2f2";

                    message.style.color =
                        "#dc2626";

                    message.textContent =
                        "Please enter your full name.";

                    return;

                }


                if (
                    !age ||
                    Number(age) < 18
                ) {

                    message.style.display =
                        "block";

                    message.style.background =
                        "#fef2f2";

                    message.style.color =
                        "#dc2626";

                    message.textContent =
                        "Donor must be at least 18 years old.";

                    return;

                }


                if (!gender) {

                    message.style.display =
                        "block";

                    message.style.background =
                        "#fef2f2";

                    message.style.color =
                        "#dc2626";

                    message.textContent =
                        "Please select your gender.";

                    return;

                }


                if (!phone) {

                    message.style.display =
                        "block";

                    message.style.background =
                        "#fef2f2";

                    message.style.color =
                        "#dc2626";

                    message.textContent =
                        "Please enter your phone number.";

                    return;

                }


                if (!location) {

                    message.style.display =
                        "block";

                    message.style.background =
                        "#fef2f2";

                    message.style.color =
                        "#dc2626";

                    message.textContent =
                        "Please enter your location.";

                    return;

                }


                if (!bloodGroupId) {

                    message.style.display =
                        "block";

                    message.style.background =
                        "#fef2f2";

                    message.style.color =
                        "#dc2626";

                    message.textContent =
                        "Please select your blood group.";

                    return;

                }


                /* -----------------------------------------
                   DISABLE BUTTON
                   ----------------------------------------- */

                submitButton.disabled =
                    true;

                submitButton.innerHTML =
                    `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Registering...
                    `;


                message.style.display =
                    "none";


                /* -----------------------------------------
                   SEND TO FLASK
                   ----------------------------------------- */

                try {

                    const response =
                        await fetch(
                            "http://127.0.0.1:5000/api/donors",
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        User_ID:
                                            loggedInUser.User_ID,

                                        Name:
                                            name,

                                        Age:
                                            Number(age),

                                        Gender:
                                            gender,

                                        Phone:
                                            phone,

                                        Location:
                                            location,

                                        Blood_Group_ID:
                                            Number(
                                                bloodGroupId
                                            )

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    console.log(
                        "Donor registration response:",
                        data
                    );


                    /* -------------------------------------
                       ERROR
                       ------------------------------------- */

                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Unable to register donor."
                        );

                    }


                    /* -------------------------------------
                       SUCCESS
                       ------------------------------------- */

                    message.style.display =
                        "block";

                    message.style.background =
                        "#f0fdf4";

                    message.style.color =
                        "#15803d";

                    message.textContent =
                        "Donor registration successful!";


                    submitButton.innerHTML =
                        `
                            <i class="fa-solid fa-check"></i>
                            Registered
                        `;


                    /* -------------------------------------
                       REFRESH DASHBOARD
                       ------------------------------------- */

                    setTimeout(
                        function () {

                            closeDonorModal();

                            loadUserDashboard();

                        },
                        1000
                    );

                }


                /* -----------------------------------------
                   CATCH ERROR
                   ----------------------------------------- */

                catch (error) {

                    console.error(
                        "Donor registration error:",
                        error
                    );


                    message.style.display =
                        "block";

                    message.style.background =
                        "#fef2f2";

                    message.style.color =
                        "#dc2626";

                    message.textContent =
                        error.message ||
                        "Unable to register donor.";


                    submitButton.disabled =
                        false;

                    submitButton.innerHTML =
                        `
                            <i class="fa-solid fa-heart"></i>
                            Register as Donor
                        `;

                }

            }
        );

    }


    if (becomeDonorButton) {

        becomeDonorButton.addEventListener(
            "click",
            becomeDonor
        );

    }


    if (registerDonorButton) {

        registerDonorButton.addEventListener(
            "click",
            becomeDonor
        );

    }


    /* =====================================================
       MY REQUESTS
       ===================================================== */

   function openMyRequests() {

    const loggedInUser =
        JSON.parse(
            localStorage.getItem("bloodLinkUser")
        );


    if (!loggedInUser || !loggedInUser.User_ID) {

        alert(
            "Please login again to view your requests."
        );

        return;

    }


    fetch(
        `http://127.0.0.1:5000/api/user-dashboard/${loggedInUser.User_ID}`
    )

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "Failed to load user requests."
                );

            }

            return response.json();

        })

        .then(function (data) {

            if (
                !data ||
                data.status !== "success"
            ) {

                throw new Error(
                    "Unable to load your requests."
                );

            }


            const requests =
                Array.isArray(data.requests)
                    ? data.requests
                    : [];


            /* =========================================
               CREATE VIEW ALL MODAL
               ========================================= */

            const existingModal =
                document.getElementById(
                    "myRequestsModal"
                );


            if (existingModal) {

                existingModal.remove();

            }


            const modal =
                document.createElement("div");

            modal.id =
                "myRequestsModal";


            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 23, 42, 0.55);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
                box-sizing: border-box;
            `;


            /* =========================================
               MODAL CONTENT
               ========================================= */

            const modalContent =
                document.createElement("div");


            modalContent.style.cssText = `
                background: #ffffff;
                width: 100%;
                max-width: 900px;
                max-height: 85vh;
                overflow-y: auto;
                border-radius: 20px;
                padding: 30px;
                box-sizing: border-box;
                box-shadow:
                    0 20px 60px rgba(0, 0, 0, 0.2);
            `;


            /* =========================================
               HEADER
               ========================================= */

            modalContent.innerHTML = `

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:20px;
                        margin-bottom:25px;
                    "
                >

                    <div>

                        <span
                            style="
                                font-size:12px;
                                font-weight:700;
                                color:#ef4444;
                                letter-spacing:1px;
                            "
                        >
                            MY ACTIVITY
                        </span>

                        <h2
                            style="
                                margin:6px 0 0 0;
                                color:#172554;
                                font-size:26px;
                            "
                        >
                            My Blood Requests
                        </h2>

                        <p
                            style="
                                margin:6px 0 0 0;
                                color:#64748b;
                            "
                        >
                            All blood requests submitted
                            from your account.
                        </p>

                    </div>


                    <button
                        id="closeMyRequestsModal"
                        type="button"
                        style="
                            width:42px;
                            height:42px;
                            border:none;
                            border-radius:50%;
                            background:#f1f5f9;
                            color:#334155;
                            font-size:20px;
                            cursor:pointer;
                        "
                    >

                        <i class="fa-solid fa-xmark"></i>

                    </button>

                </div>


                <div id="myRequestsModalBody"></div>

            `;


            modal.appendChild(
                modalContent
            );


            document.body.appendChild(
                modal
            );


            const modalBody =
                document.getElementById(
                    "myRequestsModalBody"
                );


            /* =========================================
               NO REQUESTS
               ========================================= */

            if (requests.length === 0) {

                modalBody.innerHTML = `

                    <div
                        style="
                            text-align:center;
                            padding:50px 20px;
                            color:#64748b;
                        "
                    >

                        <div
                            style="
                                width:70px;
                                height:70px;
                                margin:0 auto 18px;
                                border-radius:50%;
                                background:#eff6ff;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                color:#2563eb;
                                font-size:28px;
                            "
                        >

                            <i
                                class="fa-solid fa-file-medical"
                            ></i>

                        </div>


                        <h3
                            style="
                                margin:0 0 8px;
                                color:#172554;
                            "
                        >
                            No Blood Requests
                        </h3>


                        <p>
                            You haven't submitted
                            any blood requests yet.
                        </p>

                    </div>

                `;

            }


            /* =========================================
               DISPLAY ALL REQUESTS
               ========================================= */

            else {

                requests.forEach(
                    function (request) {

                        const requestCard =
                            document.createElement(
                                "div"
                            );


                        requestCard.style.cssText = `
                            border:1px solid #e2e8f0;
                            border-radius:16px;
                            padding:22px;
                            margin-bottom:16px;
                            background:#ffffff;
                        `;


                        requestCard.innerHTML = `

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    align-items:center;
                                    gap:15px;
                                    margin-bottom:20px;
                                    flex-wrap:wrap;
                                "
                            >

                                <div>

                                    <span
                                        style="
                                            font-size:12px;
                                            font-weight:700;
                                            color:#ef4444;
                                            letter-spacing:0.8px;
                                        "
                                    >
                                        REQUEST ID
                                    </span>

                                    <h3
                                        style="
                                            margin:5px 0 0;
                                            color:#172554;
                                        "
                                    >
                                        REQ${request.Request_ID}
                                    </h3>

                                </div>


                                <span
                                    style="
                                        padding:7px 13px;
                                        border-radius:20px;
                                        background:#fff1f2;
                                        color:#dc2626;
                                        font-size:13px;
                                        font-weight:600;
                                    "
                                >
                                    ${
                                        request.Emergency_Level
                                        || "Normal"
                                    }
                                </span>

                            </div>


                            <div
                                style="
                                    display:grid;
                                    grid-template-columns:
                                    repeat(
                                        auto-fit,
                                        minmax(180px, 1fr)
                                    );
                                    gap:18px;
                                "
                            >

                                <div>

                                    <small
                                        style="
                                            display:block;
                                            color:#64748b;
                                            margin-bottom:5px;
                                        "
                                    >
                                        Patient
                                    </small>

                                    <strong>
                                        ${
                                            request.Patient_Name
                                            || "-"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <small
                                        style="
                                            display:block;
                                            color:#64748b;
                                            margin-bottom:5px;
                                        "
                                    >
                                        Blood Group
                                    </small>

                                    <strong>
                                        ${
                                            request.Blood_Group
                                            || "-"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <small
                                        style="
                                            display:block;
                                            color:#64748b;
                                            margin-bottom:5px;
                                        "
                                    >
                                        Units Required
                                    </small>

                                    <strong>
                                        ${
                                            request.Units_Required
                                            || 0
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <small
                                        style="
                                            display:block;
                                            color:#64748b;
                                            margin-bottom:5px;
                                        "
                                    >
                                        Hospital
                                    </small>

                                    <strong>
                                        ${
                                            request.Hospital_Name
                                            || "-"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <small
                                        style="
                                            display:block;
                                            color:#64748b;
                                            margin-bottom:5px;
                                        "
                                    >
                                        Request Date
                                    </small>

                                    <strong>
                                        ${
                                            request.Request_Date
                                            || "-"
                                        }
                                    </strong>

                                </div>

                            </div>

                        `;


                        modalBody.appendChild(
                            requestCard
                        );

                    }
                );

            }


            /* =========================================
               CLOSE MODAL
               ========================================= */

            const closeButton =
                document.getElementById(
                    "closeMyRequestsModal"
                );


            if (closeButton) {

                closeButton.addEventListener(
                    "click",
                    function () {

                        modal.remove();

                    }
                );

            }


            /* Close when clicking outside */

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {

                        modal.remove();

                    }

                }
            );

        })

        .catch(function (error) {

            console.error(
                "Error loading my requests:",
                error
            );


            alert(
                "Unable to load your blood requests."
            );

        });

}


    if (viewAllRequestsButton) {

        viewAllRequestsButton.addEventListener(
            "click",
            openMyRequests
        );

    }


    const myRequestsNav =
        document.querySelector(
            'a[href="#my-requests"]'
        );


    if (myRequestsNav) {

        myRequestsNav.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                openMyRequests();

            }
        );

    }


   /* =====================================================
   MY DONATIONS
   ===================================================== */

const myDonationsNav =
    document.querySelector(
        'a[href="#my-donations"]'
    );


/* -----------------------------------------------------
   OPEN MY DONATIONS
   ----------------------------------------------------- */

async function openMyDonations() {

    try {

        /* ---------------------------------------------
           FETCH CURRENT USER DONATIONS
           --------------------------------------------- */

        const response =
            await fetch(
                `http://127.0.0.1:5000/api/user-dashboard/${loggedInUser.User_ID}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load donation history."
            );

        }


        /* ---------------------------------------------
           GET DONATIONS
           --------------------------------------------- */

        const donations =
            Array.isArray(data.donations)
                ? data.donations
                : Array.isArray(data.user_donations)
                    ? data.user_donations
                    : [];


        /* ---------------------------------------------
           REMOVE OLD MODAL
           --------------------------------------------- */

        const oldModal =
            document.getElementById(
                "myDonationsModal"
            );


        if (oldModal) {

            oldModal.remove();

        }


        /* ---------------------------------------------
           CREATE MODAL
           --------------------------------------------- */

        const modal =
            document.createElement("div");


        modal.id =
            "myDonationsModal";


        modal.innerHTML = `

            <div
                id="myDonationsOverlay"
                style="
                    position:fixed;
                    inset:0;
                    background:rgba(15,23,42,0.65);
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:20px;
                    z-index:9999;
                    backdrop-filter:blur(3px);
                "
            >

                <div
                    style="
                        width:100%;
                        max-width:900px;
                        max-height:90vh;
                        overflow-y:auto;
                        background:#ffffff;
                        border-radius:20px;
                        box-shadow:0 20px 50px rgba(0,0,0,0.20);
                        padding:30px;
                        position:relative;
                    "
                >

                    <!-- CLOSE BUTTON -->

                    <button
                        type="button"
                        id="closeMyDonations"
                        style="
                            position:absolute;
                            top:18px;
                            right:18px;
                            width:38px;
                            height:38px;
                            border:none;
                            border-radius:50%;
                            background:#f1f5f9;
                            color:#475569;
                            font-size:18px;
                            cursor:pointer;
                        "
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>


                    <!-- HEADER -->

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:15px;
                            margin-bottom:25px;
                            padding-right:45px;
                        "
                    >

                        <div
                            style="
                                width:52px;
                                height:52px;
                                border-radius:14px;
                                background:#fff1f2;
                                color:#dc2626;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:23px;
                            "
                        >
                            <i class="fa-solid fa-heart-pulse"></i>
                        </div>


                        <div>

                            <span
                                style="
                                    font-size:12px;
                                    font-weight:700;
                                    color:#dc2626;
                                    letter-spacing:0.8px;
                                "
                            >
                                MY ACTIVITY
                            </span>

                            <h2
                                style="
                                    margin:4px 0 0;
                                    color:#172554;
                                    font-size:24px;
                                "
                            >
                                My Donations
                            </h2>

                        </div>

                    </div>


                    <!-- SUMMARY -->

                    <div
                        style="
                            background:#f8fafc;
                            border:1px solid #e2e8f0;
                            border-radius:14px;
                            padding:18px;
                            margin-bottom:22px;
                        "
                    >

                        <div
                            style="
                                display:flex;
                                justify-content:space-between;
                                align-items:center;
                                gap:15px;
                                flex-wrap:wrap;
                            "
                        >

                            <div>

                                <span
                                    style="
                                        display:block;
                                        color:#64748b;
                                        font-size:13px;
                                        margin-bottom:5px;
                                    "
                                >
                                    Total Donations
                                </span>

                                <strong
                                    style="
                                        color:#172554;
                                        font-size:26px;
                                    "
                                >
                                    ${donations.length}
                                </strong>

                            </div>


                            <div>

                                <span
                                    style="
                                        display:block;
                                        color:#64748b;
                                        font-size:13px;
                                        margin-bottom:5px;
                                    "
                                >
                                    Total Units Donated
                                </span>

                                <strong
                                    style="
                                        color:#dc2626;
                                        font-size:26px;
                                    "
                                >
                                    ${
                                        donations.reduce(
                                            function(total, donation) {

                                                return total +
                                                    Number(
                                                        donation.Units_Donated || 0
                                                    );

                                            },
                                            0
                                        )
                                    }
                                </strong>

                            </div>

                        </div>

                    </div>


                    <!-- DONATION LIST -->

                    <div id="myDonationsList">

                        ${
                            donations.length === 0

                            ?

                            `
                                <div
                                    style="
                                        text-align:center;
                                        padding:45px 20px;
                                        background:#f8fafc;
                                        border:1px solid #e2e8f0;
                                        border-radius:16px;
                                    "
                                >

                                    <div
                                        style="
                                            width:65px;
                                            height:65px;
                                            margin:0 auto 15px;
                                            border-radius:50%;
                                            background:#fff1f2;
                                            color:#dc2626;
                                            display:flex;
                                            align-items:center;
                                            justify-content:center;
                                            font-size:27px;
                                        "
                                    >
                                        <i class="fa-solid fa-droplet"></i>
                                    </div>

                                    <h3
                                        style="
                                            margin:0 0 8px;
                                            color:#172554;
                                        "
                                    >
                                        No Donations Yet
                                    </h3>

                                    <p
                                        style="
                                            margin:0;
                                            color:#64748b;
                                            font-size:14px;
                                        "
                                    >
                                        Your donation history will appear here
                                        after you donate blood.
                                    </p>

                                </div>
                            `

                            :

                            donations.map(
                                function(donation) {

                                    return `

                                        <div
                                            style="
                                                background:#ffffff;
                                                border:1px solid #e5e7eb;
                                                border-radius:16px;
                                                padding:20px;
                                                margin-bottom:15px;
                                                box-shadow:0 4px 14px rgba(0,0,0,0.05);
                                            "
                                        >

                                            <div
                                                style="
                                                    display:flex;
                                                    justify-content:space-between;
                                                    align-items:center;
                                                    gap:15px;
                                                    flex-wrap:wrap;
                                                    margin-bottom:18px;
                                                "
                                            >

                                                <div>

                                                    <span
                                                        style="
                                                            font-size:11px;
                                                            font-weight:700;
                                                            color:#dc2626;
                                                            letter-spacing:0.8px;
                                                        "
                                                    >
                                                        DONATION
                                                    </span>

                                                    <h3
                                                        style="
                                                            margin:4px 0 0;
                                                            color:#172554;
                                                            font-size:19px;
                                                        "
                                                    >
                                                        #${donation.Donation_ID}
                                                    </h3>

                                                </div>


                                                <span
                                                    style="
                                                        background:#f0fdf4;
                                                        color:#15803d;
                                                        padding:7px 12px;
                                                        border-radius:20px;
                                                        font-size:13px;
                                                        font-weight:600;
                                                    "
                                                >
                                                    Completed
                                                </span>

                                            </div>


                                            <div
                                                style="
                                                    display:grid;
                                                    grid-template-columns:
                                                        repeat(
                                                            auto-fit,
                                                            minmax(160px,1fr)
                                                        );
                                                    gap:16px;
                                                "
                                            >

                                                <div>

                                                    <small
                                                        style="
                                                            display:block;
                                                            color:#64748b;
                                                            margin-bottom:5px;
                                                        "
                                                    >
                                                        Donation Date
                                                    </small>

                                                    <strong>
                                                        ${
                                                            donation.Donation_Date ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </div>


                                                <div>

                                                    <small
                                                        style="
                                                            display:block;
                                                            color:#64748b;
                                                            margin-bottom:5px;
                                                        "
                                                    >
                                                        Blood Group
                                                    </small>

                                                    <strong
                                                        style="
                                                            color:#dc2626;
                                                        "
                                                    >
                                                        ${
                                                            donation.Blood_Group ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </div>


                                                <div>

                                                    <small
                                                        style="
                                                            display:block;
                                                            color:#64748b;
                                                            margin-bottom:5px;
                                                        "
                                                    >
                                                        Units Donated
                                                    </small>

                                                    <strong>
                                                        ${
                                                            donation.Units_Donated ||
                                                            0
                                                        }
                                                    </strong>

                                                </div>


                                                <div>

                                                    <small
                                                        style="
                                                            display:block;
                                                            color:#64748b;
                                                            margin-bottom:5px;
                                                        "
                                                    >
                                                        Blood Bank
                                                    </small>

                                                    <strong>
                                                        ${
                                                            donation.Blood_Bank_Name ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </div>

                                            </div>

                                        </div>

                                    `;

                                }
                            ).join("")

                        }

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(modal);


        /* ---------------------------------------------
           CLOSE MODAL
           --------------------------------------------- */

        const closeButton =
            document.getElementById(
                "closeMyDonations"
            );


        const overlay =
            document.getElementById(
                "myDonationsOverlay"
            );


        function closeDonationsModal() {

            modal.remove();

            document.body.style.overflow =
                "";

        }


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeDonationsModal
            );

        }


        if (overlay) {

            overlay.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target === overlay
                    ) {

                        closeDonationsModal();

                    }

                }
            );

        }


        document.body.style.overflow =
            "hidden";


        /* ---------------------------------------------
           ESC KEY
           --------------------------------------------- */

        function handleDonationEscape(event) {

            if (
                event.key === "Escape"
            ) {

                closeDonationsModal();

                document.removeEventListener(
                    "keydown",
                    handleDonationEscape
                );

            }

        }


        document.addEventListener(
            "keydown",
            handleDonationEscape
        );


    } catch (error) {

        console.error(
            "My Donations loading error:",
            error
        );


        alert(
            "Unable to load your donation history.\n\n" +
            error.message
        );

    }

}


/* -----------------------------------------------------
   MY DONATIONS NAVIGATION
   ----------------------------------------------------- */

if (myDonationsNav) {

    myDonationsNav.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            openMyDonations();

        }
    );

}


    /* =====================================================
   MY PROFILE
   ===================================================== */

function openProfile() {

    const loggedInUserJSON =
        localStorage.getItem("bloodLinkUser");

    if (!loggedInUserJSON) {

        window.location.href =
            "login.html";

        return;

    }

    let loggedInUser;

    try {

        loggedInUser =
            JSON.parse(loggedInUserJSON);

    } catch (error) {

        console.error(
            "Unable to read logged-in user:",
            error
        );

        localStorage.removeItem(
            "bloodLinkUser"
        );

        window.location.href =
            "login.html";

        return;

    }


    const userId =
        loggedInUser.User_ID;


    if (!userId) {

        alert(
            "User information is not available."
        );

        return;

    }


    /* =================================================
       FETCH USER PROFILE
       ================================================= */

    fetch(
        `http://127.0.0.1:5000/api/user-dashboard/${userId}`
    )

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "Failed to load profile."
                );

            }

            return response.json();

        })

        .then(function (data) {

            const user =
                data.user || {};

            const donor =
                data.donor || null;


            /* =================================================
               CREATE PROFILE MODAL
               ================================================= */

            const existingModal =
                document.getElementById(
                    "myProfileModal"
                );

            if (existingModal) {

                existingModal.remove();

            }


            const modal =
                document.createElement(
                    "div"
                );

            modal.id =
                "myProfileModal";


            modal.style.position =
                "fixed";

            modal.style.top =
                "0";

            modal.style.left =
                "0";

            modal.style.width =
                "100%";

            modal.style.height =
                "100%";

            modal.style.background =
                "rgba(0, 0, 0, 0.55)";

            modal.style.display =
                "flex";

            modal.style.alignItems =
                "center";

            modal.style.justifyContent =
                "center";

            modal.style.zIndex =
                "9999";

            modal.style.padding =
                "20px";

            modal.style.boxSizing =
                "border-box";


            /* =================================================
               MODAL CONTENT
               ================================================= */

            const modalContent =
                document.createElement(
                    "div"
                );

            modalContent.style.background =
                "#ffffff";

            modalContent.style.width =
                "100%";

            modalContent.style.maxWidth =
                "600px";

            modalContent.style.maxHeight =
                "90vh";

            modalContent.style.overflowY =
                "auto";

            modalContent.style.borderRadius =
                "18px";

            modalContent.style.padding =
                "30px";

            modalContent.style.boxSizing =
                "border-box";

            modalContent.style.boxShadow =
                "0 20px 50px rgba(0,0,0,0.25)";


            /* =================================================
               PROFILE HEADER
               ================================================= */

            modalContent.innerHTML = `

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        margin-bottom:25px;
                    "
                >

                    <div>

                        <h2
                            style="
                                margin:0;
                                font-size:24px;
                            "
                        >
                            My Profile
                        </h2>

                        <p
                            style="
                                margin:6px 0 0;
                                color:#777;
                                font-size:14px;
                            "
                        >
                            Your BloodLink account information
                        </p>

                    </div>


                    <button
                        type="button"
                        id="closeMyProfileModal"
                        style="
                            border:none;
                            background:none;
                            font-size:25px;
                            cursor:pointer;
                            color:#555;
                        "
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                </div>


                <!-- PROFILE ICON -->

                <div
                    style="
                        text-align:center;
                        margin-bottom:25px;
                    "
                >

                    <div
                        style="
                            width:80px;
                            height:80px;
                            margin:0 auto 12px;
                            border-radius:50%;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            background:#f1f1f1;
                            font-size:34px;
                            color:#555;
                        "
                    >
                        <i class="fa-solid fa-user"></i>
                    </div>

                    <h3
                        style="
                            margin:0;
                            font-size:20px;
                        "
                    >
                        ${user.Name || "User"}
                    </h3>

                    <p
                        style="
                            margin:5px 0 0;
                            color:#777;
                        "
                    >
                        ${user.Role || "USER"}
                    </p>

                </div>


                <!-- ACCOUNT INFORMATION -->

                <div
                    style="
                        display:grid;
                        grid-template-columns:1fr 1fr;
                        gap:15px;
                    "
                >

                    <div
                        style="
                            padding:15px;
                            background:#f8f8f8;
                            border-radius:10px;
                        "
                    >

                        <small
                            style="
                                color:#777;
                            "
                        >
                            User ID
                        </small>

                        <strong
                            style="
                                display:block;
                                margin-top:5px;
                            "
                        >
                            ${user.User_ID || "-"}
                        </strong>

                    </div>


                    <div
                        style="
                            padding:15px;
                            background:#f8f8f8;
                            border-radius:10px;
                        "
                    >

                        <small
                            style="
                                color:#777;
                            "
                        >
                            Role
                        </small>

                        <strong
                            style="
                                display:block;
                                margin-top:5px;
                            "
                        >
                            ${user.Role || "USER"}
                        </strong>

                    </div>


                    <div
                        style="
                            padding:15px;
                            background:#f8f8f8;
                            border-radius:10px;
                        "
                    >

                        <small
                            style="
                                color:#777;
                            "
                        >
                            Name
                        </small>

                        <strong
                            style="
                                display:block;
                                margin-top:5px;
                            "
                        >
                            ${user.Name || "-"}
                        </strong>

                    </div>


                    <div
                        style="
                            padding:15px;
                            background:#f8f8f8;
                            border-radius:10px;
                        "
                    >

                        <small
                            style="
                                color:#777;
                            "
                        >
                            Email
                        </small>

                        <strong
                            style="
                                display:block;
                                margin-top:5px;
                                word-break:break-word;
                            "
                        >
                            ${user.Email || "-"}
                        </strong>

                    </div>


                    <div
                        style="
                            padding:15px;
                            background:#f8f8f8;
                            border-radius:10px;
                        "
                    >

                        <small
                            style="
                                color:#777;
                            "
                        >
                            Phone
                        </small>

                        <strong
                            style="
                                display:block;
                                margin-top:5px;
                            "
                        >
                            ${user.Phone || "-"}
                        </strong>

                    </div>


                    <div
                        style="
                            padding:15px;
                            background:#f8f8f8;
                            border-radius:10px;
                        "
                    >

                        <small
                            style="
                                color:#777;
                            "
                        >
                            Donor Status
                        </small>

                        <strong
                            style="
                                display:block;
                                margin-top:5px;
                            "
                        >
                            ${data.donor_status || "Not Registered"}
                        </strong>

                    </div>

                </div>


                ${
                    donor
                    ?

                    `

                    <!-- DONOR INFORMATION -->

                    <div
                        style="
                            margin-top:25px;
                        "
                    >

                        <h3
                            style="
                                margin-bottom:15px;
                                font-size:18px;
                            "
                        >
                            Donor Information
                        </h3>


                        <div
                            style="
                                display:grid;
                                grid-template-columns:1fr 1fr;
                                gap:15px;
                            "
                        >

                            <div
                                style="
                                    padding:15px;
                                    background:#f8f8f8;
                                    border-radius:10px;
                                "
                            >

                                <small
                                    style="
                                        color:#777;
                                    "
                                >
                                    Donor ID
                                </small>

                                <strong
                                    style="
                                        display:block;
                                        margin-top:5px;
                                    "
                                >
                                    ${donor.Donor_ID || "-"}
                                </strong>

                            </div>


                            <div
                                style="
                                    padding:15px;
                                    background:#f8f8f8;
                                    border-radius:10px;
                                "
                            >

                                <small
                                    style="
                                        color:#777;
                                    "
                                >
                                    Blood Group
                                </small>

                                <strong
                                    style="
                                        display:block;
                                        margin-top:5px;
                                    "
                                >
                                    ${donor.Blood_Group || "-"}
                                </strong>

                            </div>


                            <div
                                style="
                                    padding:15px;
                                    background:#f8f8f8;
                                    border-radius:10px;
                                "
                            >

                                <small
                                    style="
                                        color:#777;
                                    "
                                >
                                    Age
                                </small>

                                <strong
                                    style="
                                        display:block;
                                        margin-top:5px;
                                    "
                                >
                                    ${donor.Age || "-"}
                                </strong>

                            </div>


                            <div
                                style="
                                    padding:15px;
                                    background:#f8f8f8;
                                    border-radius:10px;
                                "
                            >

                                <small
                                    style="
                                        color:#777;
                                    "
                                >
                                    Gender
                                </small>

                                <strong
                                    style="
                                        display:block;
                                        margin-top:5px;
                                    "
                                >
                                    ${donor.Gender || "-"}
                                </strong>

                            </div>


                            <div
                                style="
                                    padding:15px;
                                    background:#f8f8f8;
                                    border-radius:10px;
                                "
                            >

                                <small
                                    style="
                                        color:#777;
                                    "
                                >
                                    Location
                                </small>

                                <strong
                                    style="
                                        display:block;
                                        margin-top:5px;
                                    "
                                >
                                    ${donor.Location || "-"}
                                </strong>

                            </div>


                            <div
                                style="
                                    padding:15px;
                                    background:#f8f8f8;
                                    border-radius:10px;
                                "
                            >

                                <small
                                    style="
                                        color:#777;
                                    "
                                >
                                    Availability
                                </small>

                                <strong
                                    style="
                                        display:block;
                                        margin-top:5px;
                                    "
                                >
                                    ${donor.Availability || "-"}
                                </strong>

                            </div>

                        </div>

                    </div>

                    `

                    :

                    `

                    <div
                        style="
                            margin-top:25px;
                            padding:18px;
                            background:#f8f8f8;
                            border-radius:10px;
                            text-align:center;
                            color:#777;
                        "
                    >

                        <i
                            class="fa-solid fa-hand-holding-droplet"
                            style="
                                font-size:25px;
                                margin-bottom:8px;
                            "
                        ></i>

                        <p
                            style="
                                margin:0;
                            "
                        >
                            You are not registered as a donor yet.
                        </p>

                    </div>

                    `

                }

            `;


            modal.appendChild(
                modalContent
            );


            document.body.appendChild(
                modal
            );


            /* =================================================
               CLOSE BUTTON
               ================================================= */

            const closeButton =
                document.getElementById(
                    "closeMyProfileModal"
                );


            if (closeButton) {

                closeButton.addEventListener(
                    "click",
                    function () {

                        modal.remove();

                    }
                );

            }


            /* =================================================
               CLOSE WHEN CLICKING OUTSIDE
               ================================================= */

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {

                        modal.remove();

                    }

                }
            );

        })

        .catch(function (error) {

            console.error(
                "Error loading profile:",
                error
            );

            alert(
                "Unable to load your profile."
            );

        });

}


    const profileNav =
        document.querySelector(
            'a[href="#profile"]'
        );


    if (profileNav) {

        profileNav.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                openProfile();

            }
        );

    }


    if (profileMenuProfile) {

        profileMenuProfile.addEventListener(
            "click",
            function () {

                closeProfileMenu();

                openProfile();

            }
        );

    }


    /* =====================================================
       LOGOUT
       ===================================================== */

    function logoutUser() {

        const confirmLogout =
            confirm(
                "Are you sure you want to logout?"
            );


        if (!confirmLogout) {

            return;

        }


        /* ================================================
           REMOVE LOGIN INFORMATION
           ================================================ */

        localStorage.removeItem(
            "bloodLinkUser"
        );


        console.log(
            "User logged out successfully."
        );


        /* ================================================
           REDIRECT TO LOGIN
           ================================================ */

        window.location.href =
            "login.html";

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                logoutUser();

            }
        );

    }


    if (profileMenuLogout) {

        profileMenuLogout.addEventListener(
            "click",
            function () {

                closeProfileMenu();

                logoutUser();

            }
        );

    }


    /* =====================================================
       WINDOW RESIZE
       ===================================================== */

    window.addEventListener(
        "resize",
        function () {

            if (
                window.innerWidth > 900 &&
                sidebar
            ) {

                sidebar.classList.remove(
                    "mobile-open"
                );

            }

        }
    );


    /* =====================================================
       INITIALIZE USER DASHBOARD
       ===================================================== */

    loadUserInformation();

    loadUserDashboard();


    console.log(
        "User dashboard initialized successfully."
    );

});