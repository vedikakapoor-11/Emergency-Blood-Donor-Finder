/* =========================================================
   BLOODLINK - INVENTORY JAVASCRIPT
   Emergency Blood Donor Finder System
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const API_BASE_URL = "http://127.0.0.1:5000/api";

    let inventoryData = [];

    console.log("=========================================");
    console.log("       BLOODLINK INVENTORY");
    console.log("=========================================");
    console.log("Inventory page loaded.");
    console.log("Loading data from MySQL...");
    console.log("=========================================");


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const menuButton = document.getElementById("menuButton");
    const sidebar = document.querySelector(".sidebar");

    const addInventoryButton =
        document.getElementById("addInventoryButton");

    const inventoryTableBody =
        document.getElementById("inventoryTableBody");

    const totalUnits =
        document.getElementById("totalUnits");

    const bloodGroupCount =
        document.getElementById("bloodGroupCount");

    const bloodBankCount =
        document.getElementById("bloodBankCount");

    const lowStockCount =
        document.getElementById("lowStockCount");

    const inventorySearch =
        document.getElementById("inventorySearch");

    const inventoryBloodGroup =
        document.getElementById("inventoryBloodGroup");

    const inventoryBloodBank =
        document.getElementById("inventoryBloodBank");

    const resetFilters =
        document.getElementById("resetFilters");

    const resultSummary =
        document.getElementById("resultSummary");

    const refreshInventory =
        document.getElementById("refreshInventory");


    /* =====================================================
       INVENTORY DETAILS MODAL
       ===================================================== */

    const inventoryModal =
        document.getElementById("inventoryModal");

    const modalInventoryTitle =
        document.getElementById("modalInventoryTitle");

    const modalInventoryBody =
        document.getElementById("modalInventoryBody");

    const closeInventoryModal =
        document.getElementById("closeInventoryModal");

    const closeInventoryButton =
        document.getElementById("closeInventoryButton");


    /* =====================================================
       ADD INVENTORY MODAL
       ===================================================== */

    const addInventoryModal =
        document.getElementById("addInventoryModal");

    const closeAddInventoryModal =
        document.getElementById("closeAddInventoryModal");

    const addInventoryForm =
        document.getElementById("addInventoryForm");

    const cancelAddInventory =
        document.getElementById("cancelAddInventory");


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    if (menuButton && sidebar) {

        menuButton.addEventListener("click", function () {

            sidebar.classList.toggle("mobile-open");

        });


        document.addEventListener("click", function (event) {

            if (
                !sidebar.contains(event.target) &&
                !menuButton.contains(event.target) &&
                sidebar.classList.contains("mobile-open")
            ) {

                sidebar.classList.remove("mobile-open");

            }

        });

    }


    /* =====================================================
       LOAD INVENTORY
       ===================================================== */

    async function loadInventory() {

        try {

            console.log("Fetching /api/inventory...");

            const response = await fetch(
                `${API_BASE_URL}/inventory`
            );


            if (!response.ok) {

                throw new Error(
                    `Inventory API returned ${response.status}`
                );

            }


            const data = await response.json();

            console.log("Inventory API response:", data);


            if (!Array.isArray(data)) {

                throw new Error(
                    "Invalid inventory response received."
                );

            }


            inventoryData = data.map(function (item) {

                return {

                    inventoryId:
                        Number(item.Inventory_ID),

                    bloodBankId:
                        Number(item.BloodBank_ID),

                    bloodBankName:
                        item.Blood_Bank_Name || "Unknown",

                    location:
                        item.Location || "N/A",

                    bloodGroupId:
                        Number(item.Blood_Group_ID),

                    bloodGroup:
                        item.Blood_Group || "Unknown",

                    availableUnits:
                        Number(item.Available_Units)

                };

            });


            console.log(
                "Processed inventory:",
                inventoryData
            );


            updateStatistics(inventoryData);

            populateFilterOptions();

            displayInventory(inventoryData);


        } catch (error) {

            console.error(
                "Inventory loading error:",
                error
            );


            inventoryData = [];

            updateStatistics([]);

            displayInventory([]);


            if (resultSummary) {

                resultSummary.textContent =
                    "Unable to load inventory records";

            }

        }

    }


    /* =====================================================
       POPULATE FILTER OPTIONS
       ===================================================== */

    function populateFilterOptions() {

        /* -------------------------------
           BLOOD GROUPS
           ------------------------------- */

        if (inventoryBloodGroup) {

            const selectedValue =
                inventoryBloodGroup.value;

            const groups = [];


            inventoryData.forEach(function (item) {

                if (
                    item.bloodGroupId &&
                    item.bloodGroup
                ) {

                    const exists = groups.some(
                        function (group) {

                            return (
                                group.id ===
                                item.bloodGroupId
                            );

                        }
                    );


                    if (!exists) {

                        groups.push({

                            id:
                                item.bloodGroupId,

                            name:
                                item.bloodGroup

                        });

                    }

                }

            });


            groups.sort(function (a, b) {

                return a.id - b.id;

            });


            inventoryBloodGroup.innerHTML =
                '<option value="">All Blood Groups</option>';


            groups.forEach(function (group) {

                const option =
                    document.createElement("option");

                option.value =
                    group.id;

                option.textContent =
                    group.name;

                inventoryBloodGroup.appendChild(
                    option
                );

            });


            if (
                groups.some(function (group) {

                    return (
                        String(group.id) ===
                        String(selectedValue)
                    );

                })
            ) {

                inventoryBloodGroup.value =
                    selectedValue;

            }

        }


        /* -------------------------------
           BLOOD BANKS
           ------------------------------- */

        if (inventoryBloodBank) {

            const selectedValue =
                inventoryBloodBank.value;

            const banks = [];


            inventoryData.forEach(function (item) {

                if (
                    item.bloodBankId &&
                    item.bloodBankName
                ) {

                    const exists = banks.some(
                        function (bank) {

                            return (
                                bank.id ===
                                item.bloodBankId
                            );

                        }
                    );


                    if (!exists) {

                        banks.push({

                            id:
                                item.bloodBankId,

                            name:
                                item.bloodBankName

                        });

                    }

                }

            });


            banks.sort(function (a, b) {

                return a.id - b.id;

            });


            inventoryBloodBank.innerHTML =
                '<option value="">All Blood Banks</option>';


            banks.forEach(function (bank) {

                const option =
                    document.createElement("option");

                option.value =
                    bank.id;

                option.textContent =
                    bank.name;

                inventoryBloodBank.appendChild(
                    option
                );

            });


            if (
                banks.some(function (bank) {

                    return (
                        String(bank.id) ===
                        String(selectedValue)
                    );

                })
            ) {

                inventoryBloodBank.value =
                    selectedValue;

            }

        }

    }


    /* =====================================================
       LOAD BLOOD BANKS FOR ADD INVENTORY
       ===================================================== */

    async function loadInventoryFormOptions() {

        try {

            const bankSelect =
                document.getElementById("inventoryBank");

            const groupSelect =
                document.getElementById("inventoryGroup");


            /* -------------------------------
               BLOOD BANKS
               ------------------------------- */

            if (bankSelect) {

                const response = await fetch(
                    `${API_BASE_URL}/blood-banks`
                );


                if (!response.ok) {

                    throw new Error(
                        "Failed to load blood banks"
                    );

                }


                const banks =
                    await response.json();


                bankSelect.innerHTML =
                    '<option value="">Select Blood Bank</option>';


                banks.forEach(function (bank) {

                    const option =
                        document.createElement("option");

                    option.value =
                        bank.BloodBank_ID;

                    option.textContent =
                        bank.Name;

                    bankSelect.appendChild(
                        option
                    );

                });


                console.log(
                    "Blood banks loaded:",
                    banks
                );

            }


            /* -------------------------------
               BLOOD GROUPS
               ------------------------------- */

            if (groupSelect) {

                const bloodGroups = [

                    {
                        id: 1,
                        name: "A+"
                    },

                    {
                        id: 2,
                        name: "A-"
                    },

                    {
                        id: 3,
                        name: "B+"
                    },

                    {
                        id: 4,
                        name: "B-"
                    },

                    {
                        id: 5,
                        name: "AB+"
                    },

                    {
                        id: 6,
                        name: "AB-"
                    },

                    {
                        id: 7,
                        name: "O+"
                    },

                    {
                        id: 8,
                        name: "O-"
                    }

                ];


                groupSelect.innerHTML =
                    '<option value="">Select Blood Group</option>';


                bloodGroups.forEach(function (group) {

                    const option =
                        document.createElement("option");

                    option.value =
                        group.id;

                    option.textContent =
                        group.name;

                    groupSelect.appendChild(
                        option
                    );

                });

            }

        } catch (error) {

            console.error(
                "Error loading form options:",
                error
            );

        }

    }


    /* =====================================================
       STOCK STATUS
       ===================================================== */

    function getStockStatus(units) {

        units = Number(units);


        if (units === 0) {

            return {
                className: "empty",
                text: "Out of Stock"
            };

        }


        if (units <= 5) {

            return {
                className: "low",
                text: "Low Stock"
            };

        }


        return {
            className: "good",
            text: "Available"
        };

    }


    /* =====================================================
       UPDATE STATISTICS
       ===================================================== */

    function updateStatistics(data) {

        let total = 0;

        const groups = new Set();

        const banks = new Set();

        let lowStock = 0;


        data.forEach(function (item) {

            total +=
                Number(item.availableUnits);


            groups.add(
                item.bloodGroupId
            );


            banks.add(
                item.bloodBankId
            );


            if (
                Number(item.availableUnits) <= 5
            ) {

                lowStock++;

            }

        });


        if (totalUnits) {

            totalUnits.textContent =
                total;

        }


        if (bloodGroupCount) {

            bloodGroupCount.textContent =
                groups.size;

        }


        if (bloodBankCount) {

            bloodBankCount.textContent =
                banks.size;

        }


        if (lowStockCount) {

            lowStockCount.textContent =
                lowStock;

        }

    }


    /* =====================================================
       DISPLAY INVENTORY
       ===================================================== */

    function displayInventory(data) {

        if (!inventoryTableBody) {

            return;

        }


        inventoryTableBody.innerHTML = "";


        if (!data || data.length === 0) {

            inventoryTableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="no-results"
                    >

                        <i class="fa-solid fa-box-open"></i>

                        <br><br>

                        No inventory records found.

                    </td>

                </tr>

            `;


            if (resultSummary) {

                resultSummary.textContent =
                    "Showing 0 inventory records";

            }


            return;

        }


        data.forEach(function (item) {

            const status =
                getStockStatus(
                    item.availableUnits
                );


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <span class="inventory-id">

                        #${item.inventoryId}

                    </span>

                </td>


                <td>

                    <div class="blood-bank-name">

                        <i class="fa-solid fa-building-columns"></i>

                        ${item.bloodBankName}

                    </div>

                </td>


                <td>

                    <span class="blood-group-badge">

                        ${item.bloodGroup}

                    </span>

                </td>


                <td>

                    <span class="units-badge">

                        ${item.availableUnits}

                    </span>

                </td>


                <td>

                    <span
                        class="stock-status ${status.className}"
                    >

                        ${status.text}

                    </span>

                </td>


                <td>

                    <button
                        class="table-action"
                        title="View inventory"
                        data-id="${item.inventoryId}"
                    >

                        <i class="fa-solid fa-eye"></i>

                    </button>

                </td>

            `;


            inventoryTableBody.appendChild(row);

        });


        if (resultSummary) {

            resultSummary.textContent =
                `Showing ${data.length} inventory record${data.length !== 1 ? "s" : ""}`;

        }


        addViewButtonEvents();

    }


    /* =====================================================
       VIEW BUTTONS
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

                    const id =
                        Number(
                            this.dataset.id
                        );


                    openInventoryModal(id);

                }
            );

        });

    }


    /* =====================================================
       OPEN DETAILS MODAL
       ===================================================== */

    function openInventoryModal(id) {

        const item =
            inventoryData.find(
                function (record) {

                    return (
                        record.inventoryId ===
                        id
                    );

                }
            );


        if (
            !item ||
            !inventoryModal
        ) {

            return;

        }


        const status =
            getStockStatus(
                item.availableUnits
            );


        if (modalInventoryTitle) {

            modalInventoryTitle.textContent =
                `Inventory #${item.inventoryId}`;

        }


        if (modalInventoryBody) {

            modalInventoryBody.innerHTML = `

                <div class="detail-row">

                    <span>Inventory ID</span>

                    <strong>
                        #${item.inventoryId}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>Blood Bank ID</span>

                    <strong>
                        ${item.bloodBankId}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>Blood Bank</span>

                    <strong>
                        ${item.bloodBankName}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>Location</span>

                    <strong>
                        ${item.location || "N/A"}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>Blood Group ID</span>

                    <strong>
                        ${item.bloodGroupId}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>Blood Group</span>

                    <strong>

                        <span class="blood-group-badge">

                            ${item.bloodGroup}

                        </span>

                    </strong>

                </div>


                <div class="detail-row">

                    <span>Available Units</span>

                    <strong>

                        ${item.availableUnits}
                        units

                    </strong>

                </div>


                <div class="detail-row">

                    <span>Stock Status</span>

                    <strong>

                        <span
                            class="stock-status ${status.className}"
                        >

                            ${status.text}

                        </span>

                    </strong>

                </div>

            `;

        }


        inventoryModal.classList.add("show");

        document.body.style.overflow =
            "hidden";

    }


    /* =====================================================
       CLOSE DETAILS MODAL
       ===================================================== */

    function closeInventoryDetails() {

        if (!inventoryModal) {

            return;

        }


        inventoryModal.classList.remove("show");

        document.body.style.overflow = "";

    }


    if (closeInventoryModal) {

        closeInventoryModal.addEventListener(
            "click",
            closeInventoryDetails
        );

    }


    if (closeInventoryButton) {

        closeInventoryButton.addEventListener(
            "click",
            closeInventoryDetails
        );

    }


    if (inventoryModal) {

        inventoryModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    inventoryModal
                ) {

                    closeInventoryDetails();

                }

            }
        );

    }


    /* =====================================================
       SEARCH + FILTER
       ===================================================== */

    function applyFilters() {

        const searchText =
            inventorySearch
                ? inventorySearch.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedGroup =
            inventoryBloodGroup
                ? inventoryBloodGroup.value
                : "";


        const selectedBank =
            inventoryBloodBank
                ? inventoryBloodBank.value
                : "";


        const filteredData =
            inventoryData.filter(
                function (item) {

                    const bankName =
                        String(
                            item.bloodBankName
                        ).toLowerCase();


                    const groupName =
                        String(
                            item.bloodGroup
                        ).toLowerCase();


                    const inventoryId =
                        String(
                            item.inventoryId
                        );


                    const matchesSearch =
                        searchText === "" ||
                        bankName.includes(searchText) ||
                        groupName.includes(searchText) ||
                        inventoryId.includes(searchText);


                    const matchesGroup =
                        selectedGroup === "" ||
                        String(item.bloodGroupId) ===
                        String(selectedGroup);


                    const matchesBank =
                        selectedBank === "" ||
                        String(item.bloodBankId) ===
                        String(selectedBank);


                    return (
                        matchesSearch &&
                        matchesGroup &&
                        matchesBank
                    );

                }
            );


        displayInventory(filteredData);

    }


    if (inventorySearch) {

        inventorySearch.addEventListener(
            "input",
            applyFilters
        );

    }


    if (inventoryBloodGroup) {

        inventoryBloodGroup.addEventListener(
            "change",
            applyFilters
        );

    }


    if (inventoryBloodBank) {

        inventoryBloodBank.addEventListener(
            "change",
            applyFilters
        );

    }


    /* =====================================================
       RESET
       ===================================================== */

    if (resetFilters) {

        resetFilters.addEventListener(
            "click",
            function () {

                if (inventorySearch) {

                    inventorySearch.value = "";

                }


                if (inventoryBloodGroup) {

                    inventoryBloodGroup.value = "";

                }


                if (inventoryBloodBank) {

                    inventoryBloodBank.value = "";

                }


                displayInventory(
                    inventoryData
                );

            }
        );

    }


    /* =====================================================
       REFRESH
       ===================================================== */

    if (refreshInventory) {

        refreshInventory.addEventListener(
            "click",
            async function () {

                const oldHTML =
                    refreshInventory.innerHTML;


                refreshInventory.disabled =
                    true;


                refreshInventory.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...';


                try {

                    await loadInventory();

                    await loadInventoryFormOptions();


                    alert(
                        "Inventory refreshed successfully."
                    );

                } catch (error) {

                    console.error(error);

                } finally {

                    refreshInventory.disabled =
                        false;

                    refreshInventory.innerHTML =
                        oldHTML;

                }

            }
        );

    }


    /* =====================================================
       OPEN ADD INVENTORY
       ===================================================== */

    if (addInventoryButton) {

        addInventoryButton.addEventListener(
            "click",
            async function () {

                if (!addInventoryModal) {

                    return;

                }


                await loadInventoryFormOptions();


                addInventoryModal.classList.add(
                    "show"
                );


                document.body.style.overflow =
                    "hidden";

            }
        );

    }


    /* =====================================================
       CLOSE ADD INVENTORY
       ===================================================== */

    function closeAddInventory() {

        if (!addInventoryModal) {

            return;

        }


        addInventoryModal.classList.remove(
            "show"
        );


        document.body.style.overflow = "";

    }


    if (closeAddInventoryModal) {

        closeAddInventoryModal.addEventListener(
            "click",
            closeAddInventory
        );

    }


    if (cancelAddInventory) {

        cancelAddInventory.addEventListener(
            "click",
            closeAddInventory
        );

    }


    if (addInventoryModal) {

        addInventoryModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    addInventoryModal
                ) {

                    closeAddInventory();

                }

            }
        );

    }


    /* =====================================================
       ADD INVENTORY
       ===================================================== */

    if (addInventoryForm) {

        addInventoryForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const bank =
                    document.getElementById(
                        "inventoryBank"
                    );

                const group =
                    document.getElementById(
                        "inventoryGroup"
                    );

                const units =
                    document.getElementById(
                        "availableUnits"
                    );


                if (
                    !bank ||
                    !group ||
                    !units
                ) {

                    alert(
                        "Inventory form fields could not be found."
                    );

                    return;

                }


                const bankId =
                    Number(bank.value);

                const groupId =
                    Number(group.value);

                const availableUnits =
                    Number(units.value);


                if (!bankId) {

                    alert(
                        "Please select a blood bank."
                    );

                    return;

                }


                if (!groupId) {

                    alert(
                        "Please select a blood group."
                    );

                    return;

                }


                if (
                    units.value === "" ||
                    isNaN(availableUnits) ||
                    availableUnits < 0
                ) {

                    alert(
                        "Available units cannot be negative."
                    );

                    return;

                }


                /* ---------------------------------------------
                   DUPLICATE CHECK
                   --------------------------------------------- */

                const duplicate =
                    inventoryData.find(
                        function (item) {

                            return (
                                Number(
                                    item.bloodBankId
                                ) === bankId &&

                                Number(
                                    item.bloodGroupId
                                ) === groupId
                            );

                        }
                    );


                if (duplicate) {

                    alert(
                        "Inventory record already exists for this blood bank and blood group.\n\n" +
                        "Blood Bank: " +
                        duplicate.bloodBankName +
                        "\nBlood Group: " +
                        duplicate.bloodGroup +
                        "\nCurrent Units: " +
                        duplicate.availableUnits
                    );

                    return;

                }


                const submitButton =
                    addInventoryForm.querySelector(
                        'button[type="submit"]'
                    );


                const originalText =
                    submitButton
                        ? submitButton.innerHTML
                        : "";


                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.innerHTML =
                        '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

                }


                try {

                    const requestData = {

                        BloodBank_ID:
                            bankId,

                        Blood_Group_ID:
                            groupId,

                        Available_Units:
                            availableUnits

                    };


                    console.log(
                        "Sending inventory:",
                        requestData
                    );


                    const response =
                        await fetch(
                            `${API_BASE_URL}/inventory`,
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        requestData
                                    )

                            }
                        );


                    const result =
                        await response.json();


                    console.log(
                        "Inventory POST result:",
                        result
                    );


                    if (!response.ok) {

                        throw new Error(
                            result.message ||
                            "Failed to add inventory record."
                        );

                    }


                    addInventoryForm.reset();

                    closeAddInventory();


                    await loadInventory();


                    alert(
                        "Inventory record added successfully.\n\n" +
                        "Inventory ID: #" +
                        result.Inventory_ID
                    );


                } catch (error) {

                    console.error(
                        "Error adding inventory:",
                        error
                    );


                    alert(
                        "Unable to add inventory record.\n\n" +
                        error.message
                    );


                } finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.innerHTML =
                            originalText;

                    }

                }

            }
        );

    }


    /* =====================================================
       NOTIFICATIONS
       ===================================================== */

    const notificationButton =
        document.querySelector(
            ".notification-btn"
        );


    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            function () {

                const lowStockItems =
                    inventoryData.filter(
                        function (item) {

                            return (
                                Number(
                                    item.availableUnits
                                ) <= 5
                            );

                        }
                    );


                if (
                    lowStockItems.length > 0
                ) {

                    alert(
                        "Inventory notifications\n\n" +
                        lowStockItems.length +
                        " inventory record(s) currently have low stock."
                    );

                } else {

                    alert(
                        "Inventory notifications\n\n" +
                        "No blood groups currently have low stock."
                    );

                }

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


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    loadInventory();

    loadInventoryFormOptions();

});