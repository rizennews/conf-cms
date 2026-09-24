# LifeCity Event Management CMS

This document outlines the architecture, data models, and primary user workflows for the LifeCity Event Management system.

## 1. System Architecture

The application is built using a modern, full-stack Next.js architecture (App Router) with a strong focus on high performance and clean design. 

### Tech Stack
* **Frontend:** Next.js 16.3 (React), pure CSS modules, Lucide React (Icons), Recharts (Analytics)
* **Backend:** Next.js Server Actions and Server Components
* **Database:** PostgreSQL hosted on Supabase
* **ORM:** Drizzle ORM
* **Authentication:** Better Auth (handling secure sessions, hashed passwords, and credentials)
* **QR Code Generation:** `qrcode.react` (Client-side SVG generation)

---

## 2. Core Entities (Data Model)

The database schema (`src/db/schema.ts`) is designed around a few core entities:

### `events`
* **Purpose:** Represents a specific gathering, conference, or service (e.g., "Multiply Sunday 2026").
* **Key Fields:** `id`, `name`, `slug` (used for the public URL), `deadline`, `isActive`.
* **Dynamic Feature:** `customFields` stores a JSON array of custom form questions that the admin builds using the visual Form Builder. This allows every event to have a completely different registration form.

### `branches`
* **Purpose:** Represents the different church branches or groups that members belong to.
* **Key Fields:** `id`, `name`.

### `registrations`
* **Purpose:** Stores the actual tickets/sign-ups from users.
* **Key Fields:** `fullName`, `email`, `whatsapp`, `branchId`, `eventId`, `status` (either `registered` or `checked-in`).
* **Dynamic Feature:** `customData` stores a JSON object containing the user's answers to the dynamic `customFields` defined by the event.

### Authentication (`user`, `session`, `account`)
* Managed by Better Auth. Users have roles (`super_admin`, `admin`, `data_team`, `branch_head`) which determine what they can see and do in the dashboard.

---

## 3. Key Workflows

### 3.1 Event Creation & Dynamic Forms
1. An admin navigates to **Events** and clicks "Create Event".
2. They name the event (e.g., "Youth Camp"). A unique slug is automatically generated (e.g., `youth-camp`).
3. The admin uses the **Form Builder** to visually add questions (Text, Select, Textarea, Radio). These are saved as JSON in `events.customFields`.

### 3.2 Public Registration & QR Codes
1. A user visits the public link: `yourdomain.com/r/youth-camp`.
2. The page dynamically renders a form by parsing `events.customFields`.
3. When the user submits, their standard information (Name, Phone, Email) is saved to specific columns, and their custom answers are serialized into the `customData` JSON column.
4. **Success:** The system generates a database ID for the registration, and the frontend instantly uses `qrcode.react` to render a scannable QR Code containing that ID. The user can download this as a PNG ticket.

### 3.3 The Check-In Process
1. On the day of the event, staff members log into the dashboard and navigate to **Check-In**.
2. Staff can use a physical barcode scanner or a mobile camera to scan the attendee's QR Code.
3. The QR Code contains the `registration.id`.
4. The system queries the database for that ID, marks their `status` as `checked-in`, and updates the UI in real-time.

### 3.4 Advanced Analytics
1. The dashboard pulls all registrations and aggregates the data in memory (or via SQL queries).
2. The **Age Demographics** chart reads the standard `ageRange` column (or falls back to custom answers if the standard column was skipped).
3. The **Branch Attendance** chart groups registrations by `branchId` and compares total registrations vs actual check-ins to calculate a conversion rate.

### 3.5 Bulk CSV Uploads
1. To import legacy data, an admin selects a specific event and clicks **Download Template**.
2. The system looks at the selected event's `customFields` and dynamically generates a CSV header row that perfectly matches the form questions.
3. When the admin uploads the filled CSV, the `bulkInsertRegistrations` server action parses the CSV, mapping standard columns to the database schema, and grouping the rest into the `customData` JSON block.

---

## 4. Security & Permissions

* **Role-Based Access Control (RBAC):** Users with the `branch_head` role can only see registrations and analytics for their specific branch. `super_admin` users have global access.
* **Session Management:** The Profile page allows users to view their active sessions (devices) and remotely revoke (log out) any unrecognized devices instantly. High-risk actions (like deleting branches or staff) are protected by clear, intentional confirmation modals to prevent accidental data loss.
