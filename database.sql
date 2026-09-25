-- =========================================================
-- EMERGENCY BLOOD DONOR FINDER SYSTEM
-- DATABASE SETUP
-- =========================================================

-- =========================================================
-- STEP 1 : CREATE DATABASE
-- =========================================================

CREATE DATABASE IF NOT EXISTS EmergencyBloodDonorFinder;

USE EmergencyBloodDonorFinder;


-- =========================================================
-- STEP 2 : CREATE TABLES
-- =========================================================

-- =========================================================
-- TABLE 1 : BLOOD_GROUP
-- =========================================================

CREATE TABLE BLOOD_GROUP (
    Blood_Group_ID INT PRIMARY KEY,
    Blood_Group VARCHAR(5) NOT NULL UNIQUE
);


-- =========================================================
-- TABLE 2 : DONOR
-- =========================================================

CREATE TABLE DONOR (
    Donor_ID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Age INT CHECK (Age >= 18),
    Gender VARCHAR(10),
    Phone VARCHAR(15) UNIQUE,
    Location VARCHAR(100),
    Availability VARCHAR(20) DEFAULT 'Available',
    Blood_Group_ID INT NOT NULL,
    FOREIGN KEY (Blood_Group_ID)
        REFERENCES BLOOD_GROUP(Blood_Group_ID)
);


-- =========================================================
-- TABLE 3 : BLOOD_BANK
-- =========================================================

CREATE TABLE BLOOD_BANK (
    BloodBank_ID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Location VARCHAR(100),
    Contact VARCHAR(15)
);


-- =========================================================
-- TABLE 4 : HOSPITAL
-- =========================================================

CREATE TABLE HOSPITAL (
    Hospital_ID INT PRIMARY KEY,
    Hospital_Name VARCHAR(100) NOT NULL,
    Location VARCHAR(100),
    Phone VARCHAR(15)
);


-- =========================================================
-- TABLE 5 : DONATION
-- =========================================================

CREATE TABLE DONATION (
    Donation_ID INT PRIMARY KEY,
    Donation_Date DATE NOT NULL,
    Units_Donated INT CHECK (Units_Donated > 0),
    Donor_ID INT NOT NULL,
    BloodBank_ID INT NOT NULL,
    FOREIGN KEY (Donor_ID)
        REFERENCES DONOR(Donor_ID),
    FOREIGN KEY (BloodBank_ID)
        REFERENCES BLOOD_BANK(BloodBank_ID)
);


-- =========================================================
-- TABLE 6 : BLOOD_INVENTORY
-- =========================================================

CREATE TABLE BLOOD_INVENTORY (
    Inventory_ID INT PRIMARY KEY,
    BloodBank_ID INT NOT NULL,
    Blood_Group_ID INT NOT NULL,
    Available_Units INT DEFAULT 0 CHECK (Available_Units >= 0),
    FOREIGN KEY (BloodBank_ID)
        REFERENCES BLOOD_BANK(BloodBank_ID),
    FOREIGN KEY (Blood_Group_ID)
        REFERENCES BLOOD_GROUP(Blood_Group_ID)
);


-- =========================================================
-- TABLE 7 : BLOOD_REQUEST
-- =========================================================

CREATE TABLE BLOOD_REQUEST (
    Request_ID INT PRIMARY KEY,
    Patient_Name VARCHAR(100) NOT NULL,
    Blood_Group_ID INT NOT NULL,
    Units_Required INT CHECK (Units_Required > 0),
    Emergency_Level VARCHAR(20),
    Request_Date DATE NOT NULL,
    Hospital_ID INT NOT NULL,
    FOREIGN KEY (Blood_Group_ID)
        REFERENCES BLOOD_GROUP(Blood_Group_ID),
    FOREIGN KEY (Hospital_ID)
        REFERENCES HOSPITAL(Hospital_ID)
);


-- =========================================================
-- TABLE 8 : DONOR_RESPONSE
-- =========================================================

CREATE TABLE DONOR_RESPONSE (
    Response_ID INT PRIMARY KEY,
    Response_Date DATE NOT NULL,
    Response_Status VARCHAR(20),
    Donor_ID INT NOT NULL,
    Request_ID INT NOT NULL,
    FOREIGN KEY (Donor_ID)
        REFERENCES DONOR(Donor_ID),
    FOREIGN KEY (Request_ID)
        REFERENCES BLOOD_REQUEST(Request_ID)
);


-- =========================================================
-- STEP 2A : APPLICATION USER TABLE
-- Added later for the web application
-- =========================================================

CREATE TABLE USERS (
    User_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(15) UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL DEFAULT 'USER'
);


-- =========================================================
-- STEP 2B : CONNECT DONORS WITH USERS
-- Application addition
-- =========================================================

ALTER TABLE DONOR
ADD COLUMN User_ID INT NULL,
ADD CONSTRAINT fk_donor_user
FOREIGN KEY (User_ID)
REFERENCES USERS(User_ID);


-- =========================================================
-- STEP 2C : CONNECT BLOOD REQUESTS WITH USERS
-- Application addition
-- =========================================================

ALTER TABLE BLOOD_REQUEST
ADD COLUMN User_ID INT NULL,
ADD CONSTRAINT fk_blood_request_user
FOREIGN KEY (User_ID)
REFERENCES USERS(User_ID);


-- =========================================================
-- STEP 3 : DML QUERIES
-- =========================================================


-- =========================================================
-- 1. Increment Blood Bank Inventory Stock
-- Increases available units following a donation event
-- =========================================================

UPDATE BLOOD_INVENTORY
SET Available_Units = Available_Units + 1
WHERE BloodBank_ID = 20
AND Blood_Group_ID = 1;


-- =========================================================
-- 2. Update Pending Responses to Rejected
-- Closes old pending donor responses
-- =========================================================

UPDATE DONOR_RESPONSE
SET Response_Status = 'Rejected'
WHERE Response_Status = 'Pending'
AND Response_Date < DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY);


-- =========================================================
-- 3. Deactivate Donor Upon Successful Donation
-- Donor becomes unavailable after donation
-- =========================================================

UPDATE DONOR d
JOIN DONATION dn
ON d.Donor_ID = dn.Donor_ID
SET d.Availability = 'Unavailable'
WHERE dn.Donation_ID = 901;


-- =========================================================
-- 4. Delete Abandoned Unfulfilled Requests Older Than 30 Days
-- Deletes old requests which were never accepted
-- =========================================================

DELETE FROM BLOOD_REQUEST
WHERE Request_Date < DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
AND Request_ID NOT IN (
    SELECT DISTINCT Request_ID
    FROM DONOR_RESPONSE
    WHERE Response_Status = 'Accepted'
);


-- =========================================================
-- 5. Delete Inactive Donors With Zero Donation History
-- Removes donors having no donation and no response history
-- =========================================================

DELETE d
FROM DONOR d
LEFT JOIN DONATION dn
ON d.Donor_ID = dn.Donor_ID
LEFT JOIN DONOR_RESPONSE dr
ON d.Donor_ID = dr.Donor_ID
WHERE dn.Donation_ID IS NULL
AND dr.Response_ID IS NULL
AND d.Availability = 'Unavailable';


-- =========================================================
-- 6. Blood Banks Facing Inventory Deficits
-- Shows blood banks having less than 5 units
-- =========================================================

SELECT
    bb.Name AS Blood_Bank_Name,
    bb.Contact,
    bg.Blood_Group,
    bi.Available_Units
FROM BLOOD_INVENTORY bi
JOIN BLOOD_BANK bb
ON bi.BloodBank_ID = bb.BloodBank_ID
JOIN BLOOD_GROUP bg
ON bi.Blood_Group_ID = bg.Blood_Group_ID
WHERE bi.Available_Units < 5
ORDER BY bi.Available_Units ASC;


-- =========================================================
-- 7. Registered Donors in the Same Locality as a Hospital
-- Finds available donors near the requesting hospital
-- =========================================================

SELECT
    d.Donor_ID,
    d.Name AS Donor_Name,
    d.Phone,
    d.Location AS Donor_Area,
    h.Hospital_Name,
    br.Request_ID
FROM DONOR d
JOIN BLOOD_REQUEST br
ON d.Blood_Group_ID = br.Blood_Group_ID
JOIN HOSPITAL h
ON br.Hospital_ID = h.Hospital_ID
WHERE d.Location = h.Location
AND d.Availability = 'Available';


-- =========================================================
-- 8. Most Demanded Blood Groups
-- Shows total requests and total units demanded
-- =========================================================

SELECT
    bg.Blood_Group,
    COUNT(br.Request_ID) AS Total_Requests,
    SUM(br.Units_Required) AS Total_Units_Demanded
FROM BLOOD_GROUP bg
LEFT JOIN BLOOD_REQUEST br
ON bg.Blood_Group_ID = br.Blood_Group_ID
GROUP BY bg.Blood_Group_ID, bg.Blood_Group
ORDER BY Total_Units_Demanded DESC;


-- =========================================================
-- 9. Toggle Donor Availability After Donation
-- Makes a donor unavailable
-- =========================================================

UPDATE DONOR
SET Availability = 'Unavailable'
WHERE Donor_ID = 101;


-- =========================================================
-- 10. Re-enable Donor After 90-Day Cooldown
-- Makes donor available after 90 days from latest donation
-- =========================================================

UPDATE DONOR d
JOIN (
    SELECT
        Donor_ID,
        MAX(Donation_Date) AS Last_Donated
    FROM DONATION
    GROUP BY Donor_ID
) past_donations
ON d.Donor_ID = past_donations.Donor_ID
SET d.Availability = 'Available'
WHERE d.Availability = 'Unavailable'
AND DATEDIFF(CURRENT_DATE, past_donations.Last_Donated) >= 90;


-- =========================================================
-- EXTRA CHECK QUERIES
-- =========================================================

SELECT * FROM DONOR;

SELECT * FROM BLOOD_INVENTORY;

SELECT * FROM DONOR_RESPONSE;

SELECT * FROM BLOOD_REQUEST;


-- =========================================================
-- STEP 4 : PROCEDURES, FUNCTIONS AND TRIGGERS
-- =========================================================


-- =========================================================
-- PROCEDURE 1
-- Dispatch emergency alerts to eligible donors
-- =========================================================

DROP PROCEDURE IF EXISTS DispatchEmergencyAlerts;

DELIMITER $$

CREATE PROCEDURE DispatchEmergencyAlerts(
    IN p_Request_ID INT,
    OUT p_AlertsSent INT
)
BEGIN

    DECLARE done INT DEFAULT FALSE;
    DECLARE v_donor_id INT;
    DECLARE v_req_blood_group INT;
    DECLARE v_req_location VARCHAR(100);

    DECLARE donor_cursor CURSOR FOR
        SELECT d.Donor_ID
        FROM DONOR d
        WHERE d.Blood_Group_ID = v_req_blood_group
        AND d.Location = v_req_location
        AND d.Availability = 'Available'
        AND NOT EXISTS (
            SELECT 1
            FROM DONATION dn
            WHERE dn.Donor_ID = d.Donor_ID
            AND DATEDIFF(CURRENT_DATE, dn.Donation_Date) < 90
        );

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SET p_AlertsSent = 0;

    -- Get blood group and location required by the request
    SELECT br.Blood_Group_ID, h.Location
    INTO v_req_blood_group, v_req_location
    FROM BLOOD_REQUEST br
    JOIN HOSPITAL h
    ON br.Hospital_ID = h.Hospital_ID
    WHERE br.Request_ID = p_Request_ID;

    OPEN donor_cursor;

    read_loop: LOOP

        FETCH donor_cursor INTO v_donor_id;

        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Prevent duplicate response
        IF NOT EXISTS (
            SELECT 1
            FROM DONOR_RESPONSE
            WHERE Donor_ID = v_donor_id
            AND Request_ID = p_Request_ID
        ) THEN

            INSERT INTO DONOR_RESPONSE
            (
                Response_ID,
                Response_Date,
                Response_Status,
                Donor_ID,
                Request_ID
            )
            VALUES
            (
                (
                    SELECT COALESCE(MAX(r.Response_ID), 0) + 1
                    FROM DONOR_RESPONSE r
                ),
                CURRENT_DATE,
                'Pending',
                v_donor_id,
                p_Request_ID
            );

            SET p_AlertsSent = p_AlertsSent + 1;

        END IF;

    END LOOP;

    CLOSE donor_cursor;

END$$

DELIMITER ;


-- =========================================================
-- PROCEDURE 2
-- Refresh donor availability after 90-day cooldown
-- =========================================================

DROP PROCEDURE IF EXISTS RefreshDonorAvailability;

DELIMITER $$

CREATE PROCEDURE RefreshDonorAvailability(
    OUT p_UpdatedCount INT
)
BEGIN

    DECLARE done INT DEFAULT FALSE;
    DECLARE v_donor_id INT;
    DECLARE v_days_elapsed INT;

    DECLARE unavailable_cursor CURSOR FOR
        SELECT
            d.Donor_ID,
            DATEDIFF(CURRENT_DATE, MAX(dn.Donation_Date))
        FROM DONOR d
        JOIN DONATION dn
        ON d.Donor_ID = dn.Donor_ID
        WHERE d.Availability = 'Unavailable'
        GROUP BY d.Donor_ID;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SET p_UpdatedCount = 0;

    OPEN unavailable_cursor;

    donor_loop: LOOP

        FETCH unavailable_cursor
        INTO v_donor_id, v_days_elapsed;

        IF done THEN
            LEAVE donor_loop;
        END IF;

        IF v_days_elapsed >= 90 THEN

            UPDATE DONOR
            SET Availability = 'Available'
            WHERE Donor_ID = v_donor_id;

            SET p_UpdatedCount = p_UpdatedCount + 1;

        END IF;

    END LOOP;

    CLOSE unavailable_cursor;

END$$

DELIMITER ;


-- =========================================================
-- FUNCTION 1
-- Check donor eligibility
-- =========================================================

DROP FUNCTION IF EXISTS CheckDonorEligibility;

DELIMITER $$

CREATE FUNCTION CheckDonorEligibility(
    p_Donor_ID INT
)
RETURNS VARCHAR(100)
DETERMINISTIC
READS SQL DATA
BEGIN

    DECLARE v_age INT;
    DECLARE v_last_donation DATE;
    DECLARE v_days INT;
    DECLARE v_result VARCHAR(100);

    SELECT Age
    INTO v_age
    FROM DONOR
    WHERE Donor_ID = p_Donor_ID;

    IF v_age IS NULL THEN
        RETURN 'Donor not found';
    END IF;

    IF v_age < 18 THEN
        RETURN 'Ineligible: Age below 18';
    END IF;

    SELECT MAX(Donation_Date)
    INTO v_last_donation
    FROM DONATION
    WHERE Donor_ID = p_Donor_ID;

    IF v_last_donation IS NULL THEN

        SET v_result = 'Eligible: First-time Donor';

    ELSE

        SET v_days = DATEDIFF(CURRENT_DATE, v_last_donation);

        IF v_days < 90 THEN

            SET v_result = CONCAT(
                'Ineligible: ',
                90 - v_days,
                ' days cooldown remaining'
            );

        ELSE

            SET v_result = 'Eligible to Donate';

        END IF;

    END IF;

    RETURN v_result;

END$$

DELIMITER ;


-- =========================================================
-- FUNCTION 2
-- Count accepted responses for a blood request
-- =========================================================

DROP FUNCTION IF EXISTS GetRequestFulfillmentUnits;

DELIMITER $$

CREATE FUNCTION GetRequestFulfillmentUnits(
    p_Request_ID INT
)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN

    DECLARE v_accepted_count INT DEFAULT 0;

    SELECT COUNT(*)
    INTO v_accepted_count
    FROM DONOR_RESPONSE
    WHERE Request_ID = p_Request_ID
    AND Response_Status = 'Accepted';

    RETURN v_accepted_count;

END$$

DELIMITER ;


-- =========================================================
-- TRIGGER 1
-- After donation:
-- 1. Increase blood inventory
-- 2. Make donor unavailable
-- =========================================================

DROP TRIGGER IF EXISTS trg_After_Donation_Insert;

DELIMITER $$

CREATE TRIGGER trg_After_Donation_Insert
AFTER INSERT ON DONATION
FOR EACH ROW
BEGIN

    DECLARE v_blood_group INT;

    -- Get donor's blood group
    SELECT Blood_Group_ID
    INTO v_blood_group
    FROM DONOR
    WHERE Donor_ID = NEW.Donor_ID;

    -- If inventory record already exists, increase units
    IF EXISTS (
        SELECT 1
        FROM BLOOD_INVENTORY
        WHERE BloodBank_ID = NEW.BloodBank_ID
        AND Blood_Group_ID = v_blood_group
    ) THEN

        UPDATE BLOOD_INVENTORY
        SET Available_Units = Available_Units + NEW.Units_Donated
        WHERE BloodBank_ID = NEW.BloodBank_ID
        AND Blood_Group_ID = v_blood_group;

    ELSE

        -- Otherwise create a new inventory record
        INSERT INTO BLOOD_INVENTORY
        (
            Inventory_ID,
            BloodBank_ID,
            Blood_Group_ID,
            Available_Units
        )
        VALUES
        (
            (
                SELECT COALESCE(MAX(i.Inventory_ID), 0) + 1
                FROM BLOOD_INVENTORY i
            ),
            NEW.BloodBank_ID,
            v_blood_group,
            NEW.Units_Donated
        );

    END IF;

    -- Donor enters 90-day cooldown
    UPDATE DONOR
    SET Availability = 'Unavailable'
    WHERE Donor_ID = NEW.Donor_ID;

END$$

DELIMITER ;


-- =========================================================
-- TRIGGER 2
-- Prevent duplicate donor response for same request
-- =========================================================

DROP TRIGGER IF EXISTS trg_Before_DonorResponse_Insert;

DELIMITER $$

CREATE TRIGGER trg_Before_DonorResponse_Insert
BEFORE INSERT ON DONOR_RESPONSE
FOR EACH ROW
BEGIN

    IF EXISTS (
        SELECT 1
        FROM DONOR_RESPONSE
        WHERE Donor_ID = NEW.Donor_ID
        AND Request_ID = NEW.Request_ID
    ) THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
        'Duplicate Entry: Donor has already responded to this request';

    END IF;

END$$

DELIMITER ;


-- =========================================================
-- STEP 5 : TEST THE FUNCTIONS
-- =========================================================

SELECT CheckDonorEligibility(101)
AS Donor_Eligibility;

SELECT GetRequestFulfillmentUnits(1)
AS Accepted_Responses;


-- =========================================================
-- STEP 6 : CHECK CREATED PROCEDURES
-- =========================================================

SHOW PROCEDURE STATUS
WHERE Db = 'EmergencyBloodDonorFinder';


-- =========================================================
-- STEP 7 : CHECK CREATED FUNCTIONS
-- =========================================================

SHOW FUNCTION STATUS
WHERE Db = 'EmergencyBloodDonorFinder';


-- =========================================================
-- STEP 8 : CHECK CREATED TRIGGERS
-- =========================================================

SHOW TRIGGERS
FROM EmergencyBloodDonorFinder;