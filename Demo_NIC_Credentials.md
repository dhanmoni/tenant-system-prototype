# Tenant System Prototype – Application Flow & Demo Credentials

## Application Flow

### High-level flow

```
                    ┌─────────────────┐
                    │   Landing /     │
                    │   Home (/)      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │   Login    │  │  Register  │  │  Policies  │
     │  /login    │  │ /register  │  │  Contact   │
     └─────┬──────┘  └─────┬──────┘  │  (public)  │
           │               │         └────────────┘
           │               │
           └───────┬───────┘
                   │  authenticated
                   ▼
           ┌───────────────┐
           │  Dashboard    │
           │  /dashboard   │
           └───────┬───────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
     ▼             ▼             ▼
┌─────────┐  ┌──────────┐  ┌──────────┐
│ Tenant  │  │ Staff    │  │ System   │
│ Owner   │  │ (Director│  │ Admin    │
│         │  │  AD, DH, │  │          │
│         │  │  DA)     │  │ /admin   │
└─────────┘  └──────────┘  └──────────┘
```

### Step-by-step flow

1. **Public access**
   - **Home (/)** – Login / register on the same page (or redirect to dashboard if already logged in).
   - **Login (/login)** – Sign in with **phone number** and **password** (same login form as home).
   - **Register** – From home, use **Register** in the nav or `/#register` to open **Create account** (name, email, password, phone, state, district). New users get role **tenant owner** and are auto-approved. (`/register` may redirect to login depending on routing.)
   - **Policies (/policies)** – Public policies page.
   - **Contact (/contact)** – Public contact page.

2. **After login**
   - User is redirected to **Dashboard (/dashboard)**.
   - Dashboard content depends on **role** (see Role-based access below).

3. **Tenant owner (dashboard)**
   - **Dashboard** – Welcome + sign-in info, quick actions (icons + text), overview stat cards, and recent submissions tiles (real data).
   - Recent submissions tiles support **Card View** and **List View**; clicking a tile opens **Status** filtered by the selected `application_no`.
   - **Profile** – View and edit profile.
   - **Services**
     - **Apply for Tenancy Certificate** – Multi-step tenancy application form.
     - **Assam Tenancy Rules forms (Services)** – Form 1 / 1-A / 1-B, Form 4 / 5, Form 6, Form 7 / 8 (grouped in collapsible sidebar sections).
   - **Status** – List and view status of own submissions (Tenancy Certificate + all Assam Tenancy Rules forms).
     - UI shows **separate tables per category** and uses **icon “View details”** for form submissions.

4. **Staff roles (Staff, Director, Assistant Director, District Head, District Assistant)**
   - **Dashboard** – Welcome, **staff email**, role, **statistics** (states, districts, users, applications), **charts** (overview bar chart, applications by status), and **quick actions** to open other panels.
   - **Application Status** – View tenancy applications (scoped by your office / district / user, per backend rules).
   - **State Management** – List/manage states.
   - **District Management** – List/manage districts.
   - **User Management** – View user list (Office user / User), open user detail to **update** or **delete** users (no create, approve, or block).

5. **System admin only**
   - Dashboard (with stats and quick actions), Application Status, State Management, District Management, plus:
   - **Office Management** – Office, Designation.
   - **Role Management** – List/manage roles.
   - **User Management** – Office user, User (full CRUD, approve, block).
   - **User Activity Log** – View activity logs.
   - **Admin (/admin)** – Admin-specific UI (if used).

6. **Other routes**
   - **User detail (/users/:id)** – View/edit user (protected, by permission).

---

## Role-based access summary

| Role                  | Dashboard (tenant) | Dashboard (staff) | Admin panel | Tenancy apply | Profile |
|-----------------------|--------------------|-------------------|------------|---------------|---------|
| **tenant owner**      | ✅                 | ❌                | ❌         | ✅            | ✅      |
| **district_assistant**| ❌                 | ✅                | ❌         | ❌            | ✅      |
| **district_head**     | ❌                 | ✅                | ❌         | ❌            | ✅      |
| **assistant_director**| ❌                 | ✅                | ❌         | ❌            | ✅      |
| **director**          | ❌                 | ✅                | ❌         | ❌            | ✅      |
| **system_admin**      | ❌                 | ✅                | ✅         | ❌            | ✅      |

*The demo account **staff@nic.in** uses the same staff dashboard as above; in the seed file it is assigned the **Assistant Director** role (separate login from `assistant.director@nic.in`).*

---

## Demo credentials (roles & login)

**Sign-in:** use **phone number** + **password** (API: `POST /api/login` with `phone` and `password`). Email is **not** used for login; it is shown only for reference / profile.

All passwords below are: **`password`**

### Staff dashboard

To use the **staff dashboard** (Staff, Director, Assistant Director, District Head, District Assistant), log in with:

| Role               | Phone (use to log in) | Email (reference only)     | Password  |
|--------------------|------------------------|----------------------------|-----------|
| Staff              | `9111111110`           | staff@nic.in               | password  |
| Director           | `9888888888`           | director@nic.in            | password  |
| Assistant Director | `9777777777`           | assistant.director@nic.in  | password  |
| District Head      | `9666666666`           | district.head@nic.in       | password  |
| District Assistant | `9555555555`           | district.assistant@nic.in  | password  |

The staff dashboard shows your **staff email** and role, **stat cards and charts** (applications by status, etc.), and **Application Status**, **State Management**, **District Management**, and **User Management** (view, update, delete users).

### All roles

| Role                  | Phone (use to log in) | Email (reference only)      | Password  |
|-----------------------|------------------------|-----------------------------|-----------|
| System Admin          | `9999999999`           | admin@nic.in                | password  |
| Staff                 | `9111111110`           | staff@nic.in                | password  |
| Director              | `9888888888`           | director@nic.in             | password  |
| Assistant Director    | `9777777777`           | assistant.director@nic.in | password  |
| District Head         | `9666666666`           | district.head@nic.in        | password  |
| District Assistant    | `9555555555`           | district.assistant@nic.in   | password  |
| Tenant Owner          | `9444444444`           | tenant@nic.in               | password  |
| Landlord / Owner      | `9222222221`           | landlord@nic.in             | password  |
| User (tenant owner)   | `9333333333`           | user1@gmail.com             | password  |

---

## Quick reference – login table

| Role               | Phone            | Password   |
|--------------------|------------------|------------|
| System Admin       | `9999999999`     | `password` |
| Staff              | `9111111110`     | `password` |
| Director           | `9888888888`     | `password` |
| Assistant Director | `9777777777`     | `password` |
| District Head      | `9666666666`     | `password` |
| District Assistant | `9555555555`     | `password` |
| Tenant Owner       | `9444444444`     | `password` |
| Landlord / Owner   | `9222222221`     | `password` |
| User               | `9333333333`     | `password` |

---

## API flow (simplified)

- **Public:** `POST /api/register`, `POST /api/login`, `GET /api/public/states`, `GET /api/public/districts`, `GET /api/public/offices`, tenancy application submit/receipt/details (as per backend).
- **Authenticated (Sanctum):** `POST /api/logout`, `GET /api/user`, profile, tenancy “my” list and update.
  - Tenant owner status + form details:
    - `GET /api/tenant-forms/my` (merged status list for Tenancy Certificate + Assam Tenancy Rules forms)
    - `GET /api/*-applications/{id}` (show/view details for each form type)
- **Staff + system admin (shared):** `GET /api/staff-dashboard-stats` (staff roles only), `GET/PUT/DELETE /api/users` (list, show, update, delete), `GET` offices/designations/roles (for user edit dropdowns), states/districts CRUD as configured in routes.
- **System admin only:** users **create**, approve, block, activity logs, designations/roles/offices **create/update/delete**, `GET /api/dashboard-stats`.

## Database & seeding

After schema changes, a full reset and seed is safest:

```bash
cd backend
php artisan migrate:fresh --seed
```

Seeder order includes **states → districts → village/wards → offices → designations → users → tenancy applications**.  
**Users:** each demo user must have a **unique phone** (required by DB).  
**Tenancy applications** may reference **village/ward**, joint-tenancy fields (`ref_code`, `uid`, etc.) per current migrations.

To reseed only users:

```bash
php artisan db:seed --class=UserSeeder
```
