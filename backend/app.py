from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_connection

app = Flask(__name__)
CORS(app)


# =========================================================
# TEST DATABASE
# =========================================================

@app.route("/api/test-db", methods=["GET"])
def test_db():

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT 1")
        result = cursor.fetchone()

        cursor.close()
        connection.close()

        return jsonify({
            "status": "success",
            "database": "EmergencyBloodDonorFinder",
            "mysql": result[0]
        }), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# =========================================================
# DONORS - GET
# =========================================================

@app.route("/api/donors", methods=["GET"])
def get_donors():

    try:

        # -------------------------------------------------
        # GET FILTER PARAMETERS
        # -------------------------------------------------

        blood_group = request.args.get(
            "bloodGroup",
            ""
        ).strip()

        location = request.args.get(
            "location",
            ""
        ).strip()

        available_only = request.args.get(
            "availableOnly",
            "false"
        ).lower() == "true"

        eligible_only = request.args.get(
            "eligibleOnly",
            "false"
        ).lower() == "true"


        # -------------------------------------------------
        # DATABASE CONNECTION
        # -------------------------------------------------

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )


        # -------------------------------------------------
        # BASE QUERY
        # -------------------------------------------------

        query = """
            SELECT
                d.Donor_ID,
                d.Name,
                d.Age,
                d.Gender,
                d.Phone,
                d.Location,
                d.Availability,
                d.User_ID,
                bg.Blood_Group
            FROM DONOR d
            JOIN BLOOD_GROUP bg
                ON d.Blood_Group_ID = bg.Blood_Group_ID
        """


        # -------------------------------------------------
        # CONDITIONS
        # -------------------------------------------------

        conditions = []

        params = []


        # -------------------------------------------------
        # BLOOD GROUP FILTER
        # -------------------------------------------------

        if blood_group:

            conditions.append(
                "bg.Blood_Group = %s"
            )

            params.append(
                blood_group
            )


        # -------------------------------------------------
        # LOCATION FILTER
        # -------------------------------------------------

        if location:

            conditions.append(
                "LOWER(d.Location) LIKE LOWER(%s)"
            )

            params.append(
                f"%{location}%"
            )


        # -------------------------------------------------
        # AVAILABLE DONORS ONLY
        # -------------------------------------------------

        if available_only:

            conditions.append(
                "d.Availability = 'Available'"
            )


        # -------------------------------------------------
        # ELIGIBLE DONORS ONLY
        #
        # Conditions:
        #
        # 1. Age must be 18 or above
        #
        # 2. No previous donation
        #
        # OR
        #
        # 3. Last donation must be 90+ days ago
        # -------------------------------------------------

        if eligible_only:

            conditions.append("""
                d.Age >= 18

                AND

                (
                    (
                        SELECT MAX(dn.Donation_Date)
                        FROM DONATION dn
                        WHERE dn.Donor_ID = d.Donor_ID
                    ) IS NULL

                    OR

                    DATEDIFF(
                        CURRENT_DATE,
                        (
                            SELECT MAX(dn2.Donation_Date)
                            FROM DONATION dn2
                            WHERE dn2.Donor_ID = d.Donor_ID
                        )
                    ) >= 90
                )
            """)


        # -------------------------------------------------
        # APPLY CONDITIONS
        # -------------------------------------------------

        if conditions:

            query += "\nWHERE "

            query += "\nAND ".join(
                conditions
            )


        # -------------------------------------------------
        # ORDER RESULTS
        # -------------------------------------------------

        query += """
            ORDER BY d.Donor_ID
        """


        # -------------------------------------------------
        # EXECUTE QUERY
        # -------------------------------------------------

        cursor.execute(
            query,
            tuple(params)
        )


        donors = cursor.fetchall()


        # -------------------------------------------------
        # CLOSE DATABASE
        # -------------------------------------------------

        cursor.close()

        connection.close()


        # -------------------------------------------------
        # RETURN DONORS
        # -------------------------------------------------

        return jsonify(
            donors
        ), 200


    except Exception as e:

        return jsonify({

            "status":
                "error",

            "message":
                str(e)

        }), 500


# =========================================================
# DONORS - POST
# =========================================================

@app.route("/api/donors", methods=["POST"])
def create_donor():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "No donor data received"
            }), 400


        user_id = data.get("User_ID")
        name = data.get("Name")
        age = data.get("Age")
        gender = data.get("Gender")
        phone = data.get("Phone")
        location = data.get("Location")
        blood_group_id = data.get("Blood_Group_ID")


        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if not user_id:
            return jsonify({
                "status": "error",
                "message": "User_ID is required"
            }), 400


        if not name:
            return jsonify({
                "status": "error",
                "message": "Name is required"
            }), 400


        if not age:
            return jsonify({
                "status": "error",
                "message": "Age is required"
            }), 400


        if int(age) < 18:
            return jsonify({
                "status": "error",
                "message": "Donor must be at least 18 years old"
            }), 400


        if not gender:
            return jsonify({
                "status": "error",
                "message": "Gender is required"
            }), 400


        if not phone:
            return jsonify({
                "status": "error",
                "message": "Phone is required"
            }), 400


        if not location:
            return jsonify({
                "status": "error",
                "message": "Location is required"
            }), 400


        if not blood_group_id:
            return jsonify({
                "status": "error",
                "message": "Blood group is required"
            }), 400


        # -------------------------------------------------
        # DATABASE CONNECTION
        # -------------------------------------------------

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )


        # -------------------------------------------------
        # CHECK USER
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                User_ID,
                Name,
                Email,
                Phone
            FROM USERS
            WHERE User_ID = %s
        """, (
            user_id,
        ))

        user = cursor.fetchone()


        if not user:

            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404


        # -------------------------------------------------
        # CHECK IF USER IS ALREADY A DONOR
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                Donor_ID
            FROM DONOR
            WHERE User_ID = %s
        """, (
            user_id,
        ))

        existing_donor = cursor.fetchone()


        if existing_donor:

            return jsonify({
                "status": "error",
                "message":
                    "This user is already registered as a donor",
                "Donor_ID":
                    existing_donor["Donor_ID"]
            }), 409


        # -------------------------------------------------
        # CHECK PHONE
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                Donor_ID
            FROM DONOR
            WHERE Phone = %s
        """, (
            phone,
        ))

        existing_phone = cursor.fetchone()


        if existing_phone:

            return jsonify({
                "status": "error",
                "message":
                    "This phone number is already registered"
            }), 409


        # -------------------------------------------------
        # CHECK BLOOD GROUP
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                Blood_Group_ID,
                Blood_Group
            FROM BLOOD_GROUP
            WHERE Blood_Group_ID = %s
        """, (
            blood_group_id,
        ))

        blood_group = cursor.fetchone()


        if not blood_group:

            return jsonify({
                "status": "error",
                "message":
                    "Invalid blood group"
            }), 400


        # -------------------------------------------------
        # GENERATE DONOR ID
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                COALESCE(MAX(Donor_ID), 100) + 1
                AS Next_Donor_ID
            FROM DONOR
        """)

        donor_result = cursor.fetchone()

        donor_id = donor_result["Next_Donor_ID"]


        # -------------------------------------------------
        # INSERT DONOR
        # -------------------------------------------------

        cursor.execute("""
            INSERT INTO DONOR
            (
                Donor_ID,
                Name,
                Age,
                Gender,
                Phone,
                Location,
                Availability,
                Blood_Group_ID,
                User_ID
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                'Available',
                %s,
                %s
            )
        """, (
            donor_id,
            name,
            age,
            gender,
            phone,
            location,
            blood_group_id,
            user_id
        ))


        connection.commit()


        # -------------------------------------------------
        # SUCCESS RESPONSE
        # -------------------------------------------------

        return jsonify({

            "status":
                "success",

            "message":
                "Donor registered successfully",

            "Donor_ID":
                donor_id,

            "User_ID":
                user_id,

            "Name":
                name,

            "Blood_Group":
                blood_group["Blood_Group"],

            "Availability":
                "Available"

        }), 201


    except Exception as e:

        if connection:
            connection.rollback()


        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


    finally:

        if cursor:
            cursor.close()


        if connection:
            connection.close()


# =========================================================
# HOSPITALS - GET
# =========================================================

@app.route("/api/hospitals", methods=["GET"])
def get_hospitals():

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                Hospital_ID,
                Hospital_Name,
                Location,
                Phone
            FROM HOSPITAL
            ORDER BY Hospital_ID
        """)

        hospitals = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify(hospitals), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# =========================================================
# HOSPITALS - POST
# =========================================================

@app.route("/api/hospitals", methods=["POST"])
def create_hospital():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        hospital_id = data.get("Hospital_ID")
        hospital_name = data.get("Hospital_Name")
        location = data.get("Location")
        phone = data.get("Phone")

        if not hospital_id:

            return jsonify({
                "status": "error",
                "message": "Hospital ID is required"
            }), 400

        if not hospital_name:

            return jsonify({
                "status": "error",
                "message": "Hospital name is required"
            }), 400

        if not location:

            return jsonify({
                "status": "error",
                "message": "Hospital location is required"
            }), 400

        if not phone:

            return jsonify({
                "status": "error",
                "message": "Hospital phone is required"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT Hospital_ID
            FROM HOSPITAL
            WHERE Hospital_ID = %s
        """, (
            hospital_id,
        ))

        existing_hospital = cursor.fetchone()

        if existing_hospital:

            return jsonify({
                "status": "error",
                "message": "Hospital ID already exists"
            }), 409

        cursor.execute("""
            INSERT INTO HOSPITAL
            (
                Hospital_ID,
                Hospital_Name,
                Location,
                Phone
            )
            VALUES
            (%s, %s, %s, %s)
        """, (
            hospital_id,
            hospital_name,
            location,
            phone
        ))

        connection.commit()

        return jsonify({

            "status": "success",

            "message":
                "Hospital created successfully",

            "Hospital_ID":
                hospital_id,

            "Hospital_Name":
                hospital_name,

            "Location":
                location,

            "Phone":
                phone

        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =========================================================
# BLOOD BANKS - GET
# =========================================================

@app.route("/api/blood-banks", methods=["GET"])
def get_blood_banks():

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                BloodBank_ID,
                Name,
                Location,
                Contact
            FROM BLOOD_BANK
            ORDER BY BloodBank_ID
        """)

        blood_banks = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify(blood_banks), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# =========================================================
# BLOOD BANKS - POST
# =========================================================

@app.route("/api/blood-banks", methods=["POST"])
def create_blood_bank():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        blood_bank_id = data.get("BloodBank_ID")
        name = data.get("Name")
        location = data.get("Location")
        contact = data.get("Contact")

        if not blood_bank_id:

            return jsonify({
                "status": "error",
                "message": "Blood Bank ID is required"
            }), 400

        if not name:

            return jsonify({
                "status": "error",
                "message": "Blood bank name is required"
            }), 400

        if not location:

            return jsonify({
                "status": "error",
                "message": "Blood bank location is required"
            }), 400

        if not contact:

            return jsonify({
                "status": "error",
                "message": "Blood bank contact is required"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT BloodBank_ID
            FROM BLOOD_BANK
            WHERE BloodBank_ID = %s
        """, (
            blood_bank_id,
        ))

        existing_bank = cursor.fetchone()

        if existing_bank:

            return jsonify({
                "status": "error",
                "message": "Blood Bank ID already exists"
            }), 409

        cursor.execute("""
            INSERT INTO BLOOD_BANK
            (
                BloodBank_ID,
                Name,
                Location,
                Contact
            )
            VALUES
            (%s, %s, %s, %s)
        """, (
            blood_bank_id,
            name,
            location,
            contact
        ))

        connection.commit()

        return jsonify({

            "status": "success",

            "message":
                "Blood bank created successfully",

            "BloodBank_ID":
                blood_bank_id,

            "Name":
                name,

            "Location":
                location,

            "Contact":
                contact

        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =========================================================
# BLOOD REQUESTS - GET
# =========================================================

@app.route("/api/blood-requests", methods=["GET"])
def get_blood_requests():

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                br.Request_ID,
                br.Patient_Name,
                br.User_ID,
                bg.Blood_Group,
                br.Units_Required,
                br.Emergency_Level,
                DATE_FORMAT(
                    br.Request_Date,
                    '%Y-%m-%d'
                ) AS Request_Date,
                h.Hospital_ID,
                h.Hospital_Name
            FROM BLOOD_REQUEST br
            JOIN BLOOD_GROUP bg
                ON br.Blood_Group_ID = bg.Blood_Group_ID
            JOIN HOSPITAL h
                ON br.Hospital_ID = h.Hospital_ID
            ORDER BY
                br.Request_Date DESC,
                br.Request_ID DESC
        """

        cursor.execute(query)

        requests = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify(requests), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# =========================================================
# BLOOD REQUESTS - POST
# =========================================================

@app.route("/api/blood-requests", methods=["POST"])
def create_blood_request():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        patient_name = data.get("Patient_Name")
        blood_group_id = data.get("Blood_Group_ID")
        units_required = data.get("Units_Required")
        emergency_level = data.get("Emergency_Level")
        request_date = data.get("Request_Date")
        hospital_id = data.get("Hospital_ID")

        # NEW:
        # User_ID connects the request to the logged-in user.
        user_id = data.get("User_ID")

        if not patient_name:

            return jsonify({
                "status": "error",
                "message": "Patient name is required"
            }), 400

        if not blood_group_id:

            return jsonify({
                "status": "error",
                "message": "Blood group is required"
            }), 400

        if not units_required or int(units_required) <= 0:

            return jsonify({
                "status": "error",
                "message":
                    "Units required must be greater than 0"
            }), 400

        if not request_date:

            return jsonify({
                "status": "error",
                "message": "Request date is required"
            }), 400

        if not hospital_id:

            return jsonify({
                "status": "error",
                "message": "Hospital is required"
            }), 400

        # If User_ID is supplied, verify that user exists.

        if user_id:

            connection = get_db_connection()
            cursor = connection.cursor()

            cursor.execute("""
                SELECT User_ID
                FROM USERS
                WHERE User_ID = %s
            """, (
                user_id,
            ))

            existing_user = cursor.fetchone()

            if not existing_user:

                return jsonify({
                    "status": "error",
                    "message": "Invalid User_ID"
                }), 400

        else:

            if connection is None:

                connection = get_db_connection()

            if cursor is None:

                cursor = connection.cursor()

        # Generate Request ID

        cursor.execute("""
            SELECT COALESCE(MAX(Request_ID), 500) + 1
            FROM BLOOD_REQUEST
        """)

        request_id = cursor.fetchone()[0]

        # Insert request

        cursor.execute("""
            INSERT INTO BLOOD_REQUEST
            (
                Request_ID,
                Patient_Name,
                Blood_Group_ID,
                Units_Required,
                Emergency_Level,
                Request_Date,
                Hospital_ID,
                User_ID
            )
            VALUES
            (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            request_id,
            patient_name,
            blood_group_id,
            units_required,
            emergency_level,
            request_date,
            hospital_id,
            user_id
        ))

        connection.commit()

        return jsonify({

            "status": "success",

            "message":
                "Blood request created successfully",

            "Request_ID":
                request_id,

            "User_ID":
                user_id

        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =========================================================
# DONATIONS - GET
# =========================================================

@app.route("/api/donations", methods=["GET"])
def get_donations():

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                dn.Donation_ID,
                DATE_FORMAT(
                    dn.Donation_Date,
                    '%Y-%m-%d'
                ) AS Donation_Date,
                dn.Units_Donated,
                d.Donor_ID,
                d.User_ID,
                d.Name AS Donor_Name,
                bg.Blood_Group,
                bb.BloodBank_ID,
                bb.Name AS Blood_Bank_Name
            FROM DONATION dn
            JOIN DONOR d
                ON dn.Donor_ID = d.Donor_ID
            JOIN BLOOD_GROUP bg
                ON d.Blood_Group_ID = bg.Blood_Group_ID
            JOIN BLOOD_BANK bb
                ON dn.BloodBank_ID = bb.BloodBank_ID
            ORDER BY
                dn.Donation_Date DESC,
                dn.Donation_ID DESC
        """

        cursor.execute(query)

        donations = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify(donations), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# =========================================================
# DONATIONS - POST
# =========================================================

@app.route("/api/donations", methods=["POST"])
def create_donation():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        donation_date = data.get("Donation_Date")
        units_donated = data.get("Units_Donated")
        donor_id = data.get("Donor_ID")
        blood_bank_id = data.get("BloodBank_ID")

        if not donation_date:

            return jsonify({
                "status": "error",
                "message": "Donation date is required"
            }), 400

        if not units_donated or int(units_donated) <= 0:

            return jsonify({
                "status": "error",
                "message":
                    "Units donated must be greater than 0"
            }), 400

        if not donor_id:

            return jsonify({
                "status": "error",
                "message": "Donor is required"
            }), 400

        if not blood_bank_id:

            return jsonify({
                "status": "error",
                "message": "Blood bank is required"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check donor

        cursor.execute("""
            SELECT Donor_ID
            FROM DONOR
            WHERE Donor_ID = %s
        """, (
            donor_id,
        ))

        donor = cursor.fetchone()

        if not donor:

            return jsonify({
                "status": "error",
                "message": "Donor not found"
            }), 404

        # Check blood bank

        cursor.execute("""
            SELECT BloodBank_ID
            FROM BLOOD_BANK
            WHERE BloodBank_ID = %s
        """, (
            blood_bank_id,
        ))

        bank = cursor.fetchone()

        if not bank:

            return jsonify({
                "status": "error",
                "message": "Blood bank not found"
            }), 404

        # Generate Donation ID

        cursor.execute("""
            SELECT COALESCE(MAX(Donation_ID), 900) + 1
            FROM DONATION
        """)

        donation_id = cursor.fetchone()[0]

        # Insert donation

        cursor.execute("""
            INSERT INTO DONATION
            (
                Donation_ID,
                Donation_Date,
                Units_Donated,
                Donor_ID,
                BloodBank_ID
            )
            VALUES
            (%s, %s, %s, %s, %s)
        """, (
            donation_id,
            donation_date,
            units_donated,
            donor_id,
            blood_bank_id
        ))

        # Database trigger automatically:
        #
        # 1. Updates BLOOD_INVENTORY
        # 2. Makes donor unavailable

        connection.commit()

        return jsonify({

            "status": "success",

            "message":
                "Donation recorded successfully",

            "Donation_ID":
                donation_id

        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =========================================================
# INVENTORY
# =========================================================

@app.route("/api/inventory", methods=["GET"])
def get_inventory():

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                bi.Inventory_ID,
                bb.BloodBank_ID,
                bb.Name AS Blood_Bank_Name,
                bb.Location,
                bg.Blood_Group_ID,
                bg.Blood_Group,
                bi.Available_Units
            FROM BLOOD_INVENTORY bi
            JOIN BLOOD_BANK bb
                ON bi.BloodBank_ID = bb.BloodBank_ID
            JOIN BLOOD_GROUP bg
                ON bi.Blood_Group_ID = bg.Blood_Group_ID
            ORDER BY
                bb.Name,
                bg.Blood_Group
        """

        cursor.execute(query)

        inventory = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify(inventory), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# =========================================================
# DONOR RESPONSES - GET
# =========================================================

@app.route("/api/responses", methods=["GET"])
def get_responses():

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                dr.Response_ID,
                DATE_FORMAT(
                    dr.Response_Date,
                    '%Y-%m-%d'
                ) AS Response_Date,
                dr.Response_Status,

                d.Donor_ID,
                d.User_ID,
                d.Name AS Donor_Name,

                bg.Blood_Group,

                br.Request_ID,
                br.User_ID AS Request_User_ID,
                br.Patient_Name,
                br.Units_Required

            FROM DONOR_RESPONSE dr

            JOIN DONOR d
                ON dr.Donor_ID = d.Donor_ID

            JOIN BLOOD_GROUP bg
                ON d.Blood_Group_ID = bg.Blood_Group_ID

            JOIN BLOOD_REQUEST br
                ON dr.Request_ID = br.Request_ID

            ORDER BY
                dr.Response_Date DESC,
                dr.Response_ID DESC
        """

        cursor.execute(query)

        responses = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify(responses), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# =========================================================
# DONOR RESPONSE - POST
# =========================================================

@app.route("/api/responses", methods=["POST"])
def create_response():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        donor_id = data.get("Donor_ID")
        request_id = data.get("Request_ID")

        response_status = data.get(
            "Response_Status",
            "Pending"
        )

        response_date = data.get(
            "Response_Date"
        )

        if not donor_id or not request_id:

            return jsonify({
                "status": "error",
                "message":
                    "Donor and request are required"
            }), 400

        if not response_date:

            from datetime import date

            response_date = date.today()

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT COALESCE(MAX(Response_ID), 700) + 1
            FROM DONOR_RESPONSE
        """)

        response_id = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO DONOR_RESPONSE
            (
                Response_ID,
                Response_Date,
                Response_Status,
                Donor_ID,
                Request_ID
            )
            VALUES
            (%s, %s, %s, %s, %s)
        """, (
            response_id,
            response_date,
            response_status,
            donor_id,
            request_id
        ))

        connection.commit()

        return jsonify({

            "status": "success",

            "message":
                "Donor response created successfully",

            "Response_ID":
                response_id

        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =========================================================
# DONOR RESPONSE - UPDATE STATUS
# =========================================================

@app.route(
    "/api/responses/<int:response_id>",
    methods=["PUT"]
)
def update_response(response_id):

    connection = None
    cursor = None

    try:

        data = request.get_json()

        status = data.get(
            "Response_Status"
        )

        if status not in [
            "Pending",
            "Accepted",
            "Rejected"
        ]:

            return jsonify({
                "status": "error",
                "message":
                    "Invalid response status"
            }), 400

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute("""
            SELECT
                Response_ID,
                Response_Status
            FROM DONOR_RESPONSE
            WHERE Response_ID = %s
        """, (
            response_id,
        ))

        existing_response = cursor.fetchone()

        if not existing_response:

            return jsonify({
                "status": "error",
                "message":
                    "Response not found"
            }), 404

        if (
            existing_response["Response_Status"]
            == status
        ):

            cursor.close()
            connection.close()

            return jsonify({

                "status": "success",

                "message":
                    "Response status is already set to "
                    + status,

                "Response_ID":
                    response_id,

                "Response_Status":
                    status

            }), 200

        cursor.execute("""
            UPDATE DONOR_RESPONSE
            SET Response_Status = %s
            WHERE Response_ID = %s
        """, (
            status,
            response_id
        ))

        connection.commit()

        return jsonify({

            "status": "success",

            "message":
                "Response status updated successfully",

            "Response_ID":
                response_id,

            "Response_Status":
                status

        }), 200

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =========================================================
# ADMIN DASHBOARD
# =========================================================

@app.route("/api/dashboard", methods=["GET"])
def dashboard():

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM DONOR
        """)

        total_donors = cursor.fetchone()["total"]

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM BLOOD_REQUEST
        """)

        total_requests = cursor.fetchone()["total"]

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM DONATION
        """)

        total_donations = cursor.fetchone()["total"]

        cursor.execute("""
            SELECT
                COALESCE(
                    SUM(Available_Units),
                    0
                ) AS total
            FROM BLOOD_INVENTORY
        """)

        total_inventory = cursor.fetchone()["total"]

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM HOSPITAL
        """)

        total_hospitals = cursor.fetchone()["total"]

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM BLOOD_BANK
        """)

        total_blood_banks = cursor.fetchone()["total"]

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM DONOR_RESPONSE
            WHERE Response_Status = 'Pending'
        """)

        pending_responses = cursor.fetchone()["total"]

        cursor.close()
        connection.close()

        return jsonify({

            "total_donors":
                total_donors,

            "total_requests":
                total_requests,

            "total_donations":
                total_donations,

            "total_inventory_units":
                total_inventory,

            "total_hospitals":
                total_hospitals,

            "total_blood_banks":
                total_blood_banks,

            "pending_responses":
                pending_responses

        }), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# =========================================================
# REPORTS
# =========================================================

@app.route("/api/reports", methods=["GET"])
def reports():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        # -------------------------------------------------
        # MOST DEMANDED BLOOD GROUPS
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                bg.Blood_Group,

                COUNT(
                    br.Request_ID
                ) AS Total_Requests,

                COALESCE(
                    SUM(
                        br.Units_Required
                    ),
                    0
                ) AS Total_Units_Demanded

            FROM BLOOD_GROUP bg

            LEFT JOIN BLOOD_REQUEST br
                ON bg.Blood_Group_ID =
                   br.Blood_Group_ID

            GROUP BY
                bg.Blood_Group_ID,
                bg.Blood_Group

            ORDER BY
                Total_Units_Demanded DESC
        """)

        demanded_groups = cursor.fetchall()

        # -------------------------------------------------
        # LOW INVENTORY
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                bb.Name AS Blood_Bank_Name,
                bb.Contact,
                bg.Blood_Group,
                bi.Available_Units

            FROM BLOOD_INVENTORY bi

            JOIN BLOOD_BANK bb
                ON bi.BloodBank_ID =
                   bb.BloodBank_ID

            JOIN BLOOD_GROUP bg
                ON bi.Blood_Group_ID =
                   bg.Blood_Group_ID

            WHERE
                bi.Available_Units < 5

            ORDER BY
                bi.Available_Units ASC
        """)

        low_inventory = cursor.fetchall()

        # -------------------------------------------------
        # EMERGENCY SUMMARY
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                Emergency_Level,
                COUNT(*) AS Total

            FROM BLOOD_REQUEST

            GROUP BY
                Emergency_Level
        """)

        emergency_summary = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({

            "demanded_groups":
                demanded_groups,

            "low_inventory":
                low_inventory,

            "emergency_summary":
                emergency_summary

        }), 200

    except Exception as e:

        if cursor:
            cursor.close()

        if connection:
            connection.close()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# =========================================================
# USER REGISTRATION
# =========================================================

@app.route("/api/register", methods=["POST"])
def register_user():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "status": "error",
                "message":
                    "No registration data received"
            }), 400

        name = data.get("Name")
        email = data.get("Email")
        phone = data.get("Phone")
        password = data.get("Password")

        if name:
            name = name.strip()

        if email:
            email = email.strip().lower()

        if phone:
            phone = phone.strip()

        if not name:

            return jsonify({
                "status": "error",
                "message": "Name is required"
            }), 400

        if len(name) < 2:

            return jsonify({
                "status": "error",
                "message":
                    "Name must contain at least 2 characters"
            }), 400

        if not email:

            return jsonify({
                "status": "error",
                "message": "Email is required"
            }), 400

        if not password:

            return jsonify({
                "status": "error",
                "message": "Password is required"
            }), 400

        if len(password) < 6:

            return jsonify({
                "status": "error",
                "message":
                    "Password must contain at least 6 characters"
            }), 400

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute("""
            SELECT User_ID
            FROM USERS
            WHERE Email = %s
        """, (
            email,
        ))

        existing_email = cursor.fetchone()

        if existing_email:

            return jsonify({
                "status": "error",
                "message":
                    "An account with this email already exists"
            }), 409

        if phone:

            cursor.execute("""
                SELECT User_ID
                FROM USERS
                WHERE Phone = %s
            """, (
                phone,
            ))

            existing_phone = cursor.fetchone()

            if existing_phone:

                return jsonify({
                    "status": "error",
                    "message":
                        "An account with this phone number already exists"
                }), 409

        password_hash = generate_password_hash(password)

        cursor.execute("""
            INSERT INTO USERS
            (
                Name,
                Email,
                Phone,
                Password_Hash,
                Role
            )
            VALUES
            (%s, %s, %s, %s, %s)
        """, (
            name,
            email,
            phone if phone else None,
            password_hash,
            "USER"
        ))

        connection.commit()

        user_id = cursor.lastrowid

        return jsonify({

            "status": "success",

            "message":
                "Account created successfully",

            "User_ID":
                user_id,

            "Name":
                name,

            "Email":
                email,

            "Role":
                "USER"

        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =========================================================
# USER LOGIN
# =========================================================

@app.route("/api/login", methods=["POST"])
def login_user():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "status": "error",
                "message":
                    "No login data received"
            }), 400

        email = data.get("Email")
        password = data.get("Password")

        if email:
            email = email.strip().lower()

        if not email:

            return jsonify({
                "status": "error",
                "message": "Email is required"
            }), 400

        if not password:

            return jsonify({
                "status": "error",
                "message": "Password is required"
            }), 400

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute("""
            SELECT
                User_ID,
                Name,
                Email,
                Phone,
                Password_Hash,
                Role
            FROM USERS
            WHERE Email = %s
        """, (
            email,
        ))

        user = cursor.fetchone()

        if not user:

            return jsonify({
                "status": "error",
                "message":
                    "Invalid email or password"
            }), 401

        if not check_password_hash(
            user["Password_Hash"],
            password
        ):

            return jsonify({
                "status": "error",
                "message":
                    "Invalid email or password"
            }), 401

        return jsonify({

            "status": "success",

            "message":
                "Login successful",

            "User_ID":
                user["User_ID"],

            "Name":
                user["Name"],

            "Email":
                user["Email"],

            "Phone":
                user["Phone"],

            "Role":
                user["Role"]

        }), 200

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =========================================================
# USER DASHBOARD
# =========================================================

@app.route(
    "/api/user-dashboard/<int:user_id>",
    methods=["GET"]
)
def get_user_dashboard(user_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        # -------------------------------------------------
        # GET USER
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                User_ID,
                Name,
                Email,
                Phone,
                Role
            FROM USERS
            WHERE User_ID = %s
        """, (
            user_id,
        ))

        user = cursor.fetchone()

        if not user:

            return jsonify({
                "status": "error",
                "message":
                    "User not found"
            }), 404

        # -------------------------------------------------
        # MY REQUESTS
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                br.Request_ID,
                br.Patient_Name,
                br.User_ID,
                bg.Blood_Group,
                br.Units_Required,
                br.Emergency_Level,
                DATE_FORMAT(
                    br.Request_Date,
                    '%Y-%m-%d'
                ) AS Request_Date,
                h.Hospital_ID,
                h.Hospital_Name
            FROM BLOOD_REQUEST br

            JOIN BLOOD_GROUP bg
                ON br.Blood_Group_ID =
                   bg.Blood_Group_ID

            JOIN HOSPITAL h
                ON br.Hospital_ID =
                   h.Hospital_ID

            WHERE br.User_ID = %s

            ORDER BY
                br.Request_Date DESC,
                br.Request_ID DESC
        """, (
            user_id,
        ))

        user_requests = cursor.fetchall()

        # -------------------------------------------------
        # MY DONOR PROFILE
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                d.Donor_ID,
                d.User_ID,
                d.Name,
                d.Age,
                d.Gender,
                d.Phone,
                d.Location,
                d.Availability,
                bg.Blood_Group
            FROM DONOR d

            JOIN BLOOD_GROUP bg
                ON d.Blood_Group_ID =
                   bg.Blood_Group_ID

            WHERE d.User_ID = %s

            ORDER BY
                d.Donor_ID

            LIMIT 1
        """, (
            user_id,
        ))

        donor = cursor.fetchone()

        # -------------------------------------------------
        # MY DONATIONS
        # -------------------------------------------------

        user_donations = []

        if donor:

            cursor.execute("""
                SELECT
                    dn.Donation_ID,

                    DATE_FORMAT(
                        dn.Donation_Date,
                        '%Y-%m-%d'
                    ) AS Donation_Date,

                    dn.Units_Donated,

                    d.Donor_ID,
                    d.User_ID,

                    bg.Blood_Group,

                    bb.BloodBank_ID,
                    bb.Name AS Blood_Bank_Name

                FROM DONATION dn

                JOIN DONOR d
                    ON dn.Donor_ID =
                       d.Donor_ID

                JOIN BLOOD_GROUP bg
                    ON d.Blood_Group_ID =
                       bg.Blood_Group_ID

                JOIN BLOOD_BANK bb
                    ON dn.BloodBank_ID =
                       bb.BloodBank_ID

                WHERE d.User_ID = %s

                ORDER BY
                    dn.Donation_Date DESC,
                    dn.Donation_ID DESC
            """, (
                user_id,
            ))

            user_donations = cursor.fetchall()

        # -------------------------------------------------
        # MY DONOR RESPONSES
        # -------------------------------------------------

        user_donor_responses = []

        if donor:

            cursor.execute("""
                SELECT
                    dr.Response_ID,

                    DATE_FORMAT(
                        dr.Response_Date,
                        '%Y-%m-%d'
                    ) AS Response_Date,

                    dr.Response_Status,

                    dr.Donor_ID,

                    dr.Request_ID,

                    br.Patient_Name,

                    br.Units_Required,

                    bg.Blood_Group

                FROM DONOR_RESPONSE dr

                JOIN DONOR d
                    ON dr.Donor_ID =
                       d.Donor_ID

                JOIN BLOOD_REQUEST br
                    ON dr.Request_ID =
                       br.Request_ID

                JOIN BLOOD_GROUP bg
                    ON br.Blood_Group_ID =
                       bg.Blood_Group_ID

                WHERE d.User_ID = %s

                ORDER BY
                    dr.Response_Date DESC,
                    dr.Response_ID DESC
            """, (
                user_id,
            ))

            user_donor_responses = cursor.fetchall()

        # -------------------------------------------------
        # RESPONSES TO MY BLOOD REQUESTS
        # -------------------------------------------------

        request_responses = []

        if user_requests:

            cursor.execute("""
                SELECT
                    dr.Response_ID,

                    DATE_FORMAT(
                        dr.Response_Date,
                        '%Y-%m-%d'
                    ) AS Response_Date,

                    dr.Response_Status,

                    dr.Donor_ID,

                    d.Name AS Donor_Name,

                    d.Phone AS Donor_Phone,

                    bg.Blood_Group,

                    br.Request_ID,

                    br.Patient_Name,

                    br.Units_Required

                FROM DONOR_RESPONSE dr

                JOIN BLOOD_REQUEST br
                    ON dr.Request_ID =
                       br.Request_ID

                JOIN DONOR d
                    ON dr.Donor_ID =
                       d.Donor_ID

                JOIN BLOOD_GROUP bg
                    ON br.Blood_Group_ID =
                       bg.Blood_Group_ID

                WHERE br.User_ID = %s

                ORDER BY
                    dr.Response_Date DESC,
                    dr.Response_ID DESC
            """, (
                user_id,
            ))

            request_responses = cursor.fetchall()

        # -------------------------------------------------
        # DONOR STATUS
        # -------------------------------------------------

        if donor:

            donor_status = donor["Availability"]

        else:

            donor_status = "Not Registered"

        # -------------------------------------------------
        # COUNTS
        # -------------------------------------------------

        my_requests_count = len(user_requests)

        my_donations_count = len(user_donations)

        # "Responses" means responses received on
        # this user's blood requests.

        my_responses_count = len(request_responses)

        # -------------------------------------------------
        # CLOSE DATABASE
        # -------------------------------------------------

        cursor.close()
        connection.close()

        # -------------------------------------------------
        # RETURN DASHBOARD DATA
        # -------------------------------------------------

        return jsonify({

            "status":
                "success",

            "user":
                user,

            "my_requests_count":
                my_requests_count,

            "my_donations_count":
                my_donations_count,

            "my_responses_count":
                my_responses_count,

            "donor_status":
                donor_status,

            "donor":
                donor,

            "requests":
                user_requests,

            "donations":
                user_donations,

            "responses":
                request_responses,

            "donor_responses":
                user_donor_responses

        }), 200

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )