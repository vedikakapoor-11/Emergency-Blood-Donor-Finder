# 🩸 Emergency Blood Donor Finder System

A DBMS-based web application designed to help users find suitable blood donors based on blood group, location, availability, and donation history.

The system provides separate interfaces for normal users and administrators, with a Flask backend connected to a MySQL database.

---

## 📌 Project Information

**Project Title:** Emergency Blood Donor Finder System

**Domain:** Database Management Systems (DBMS)

**Team ID:** TEAM ID 23
### Team Members

| Student ID | Name |
|---|---|
| 1272260890 | Vedika Kapoor |
| 1262253623 | Aryan Choudhari |
| 1262251094 | Riti Kumar |
| 1262252998 | Shivani Salunkhe |

---

## 🎯 Problem Statement

During medical emergencies, finding a suitable blood donor quickly can be difficult.

The Emergency Blood Donor Finder System is designed to help identify suitable donors based on:

- Blood group
- Location
- Availability
- Donation history
- Donor eligibility

The system also maintains information about hospitals, blood banks, blood inventory, blood requests, donations, and donor responses.

---

## ✨ Main Features

### 👤 User Module

Normal users can:

- Register an account
- Log in securely
- View their user dashboard
- Find eligible blood donors
- Submit blood requests
- Register as a blood donor
- View their donation history
- View their profile
- View their blood request information

---

### 🛠️ Administrator Module

Administrators can manage and monitor:

- Donors
- Blood requests
- Donations
- Blood inventory
- Blood banks
- Hospitals
- Donor responses
- Reports

The administrator dashboard displays database-backed information such as:

- Registered donors
- Blood requests
- Available blood units
- Hospitals
- Emergency blood requests
- Blood inventory

---

## 🩸 Blood Donor Management

The donor search system supports filtering based on:

- Blood group
- Location
- Availability
- Eligibility

The system also considers donation history when determining donor eligibility.

The current eligibility logic includes:

- Donor age must be at least 18
- The donor must not have donated within the previous 90 days

---

## 🏥 Hospital Management

The system stores hospital information including:

- Hospital ID
- Hospital name
- Location
- Phone number

Administrators can view and add hospital information through the application.

---

## 🏦 Blood Bank Management

Blood bank information includes:

- Blood Bank ID
- Blood bank name
- Location
- Contact number

Administrators can view and add blood bank records.

---

## 📦 Blood Inventory Management

The inventory module maintains:

- Blood bank
- Blood group
- Available blood units

The inventory can be viewed and managed through the administrator interface.

---

## 🚨 Blood Request Management

Blood requests contain information such as:

- Patient name
- Blood group
- Units required
- Emergency level
- Request date
- Hospital
- User associated with the request

Emergency levels include:

- Critical
- Urgent
- Normal

---

## 💉 Donation Management

The donation module records:

- Donation ID
- Donation date
- Units donated
- Donor
- Blood bank

A database trigger is used to update relevant blood inventory information after a donation.

The donor's availability is also updated after donation according to the database logic.

---

## 💬 Donor Responses

Donors can be associated with blood requests through donor responses.

The system stores:

- Response ID
- Response date
- Response status
- Donor
- Blood request

The database also contains trigger logic to prevent duplicate donor responses for the same request.

---

## 📊 Reports

The Reports module provides database-backed information about:

- Total donors
- Blood requests
- Donations
- Available blood units
- Emergency request levels
- Donor responses
- Blood groups
- Blood banks
- Low-stock inventory records

The report page also supports date-based filtering for:

- Blood requests
- Donations
- Donor responses

---

# 🗄️ Database

## Database Name

```text
EmergencyBloodDonorFinder