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
   - **Home (/)** – Login form (or redirect to dashboard if already logged in).
   - **Login (/login)** – Sign in with email and password.
   - **Register (/register)** – Create account (name, email, password, phone, state, district). New users get role **tenant owner** and are auto-approved.
   - **Policies (/policies)** – Public policies page.
   - **Contact (/contact)** – Public contact page.

2. **After login**
   - User is redirected to **Dashboard (/dashboard)**.
   - Dashboard content depends on **role** (see Role-based access below).

3. **Tenant owner (dashboard)**
   - **Dashboard** – Welcome and sign-in info.
   - **Profile** – View and edit profile.
   - **Services**
     - **Apply for Tenancy Certificate** – Multi-step tenancy application form.
     - **Status** – List and view status of own tenancy applications.

4. **Staff roles (Staff, Director, Assistant Director, District Head, District Assistant)**
   - **Dashboard** – Welcome, staff email, and sign-in info.
   - **Application Status** – View tenancy applications (filtered by office/user).
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

---

## Demo credentials (roles & login)

All passwords below are: **`password`**

### Staff dashboard

To use the **staff dashboard** (Staff, Director, Assistant Director, District Head, District Assistant), log in with any of these:

| Role               | Email                      | Password  |
|--------------------|----------------------------|-----------|
| Staff              | staff@nic.in               | password  |
| Director           | director@nic.in            | password  |
| Assistant Director | assistant.director@nic.in  | password  |
| District Head      | district.head@nic.in       | password  |
| District Assistant | district.assistant@nic.in  | password  |

The staff dashboard shows your **staff email** and role, today’s date/time, and Application Status, State Management, District Management, and **User Management** (view, update, delete users).

### All roles

| Role                  | Email                     | Password  |
|-----------------------|---------------------------|-----------|
| System Admin          | admin@nic.in              | password  |
| Staff                 | staff@nic.in              | password  |
| Director              | director@nic.in           | password  |
| Assistant Director    | assistant.director@nic.in | password  |
| District Head         | district.head@nic.in      | password  |
| District Assistant    | district.assistant@nic.in | password  |
| Tenant Owner          | tenant@nic.in             | password  |
| Landlord / Owner      | landlord@nic.in           | password  |
| User (tenant owner)   | user1@gmail.com           | password  |

---

## Quick reference – login table

| Role               | Email                      | Password   |
|--------------------|----------------------------|------------|
| System Admin       | `admin@nic.in`             | `password` |
| Staff (staff)       | `staff@nic.in`             | `password` |
| Director (staff)    | `director@nic.in`          | `password` |
| Assistant Director (staff) | `assistant.director@nic.in` | `password` |
| District Head (staff) | `district.head@nic.in`   | `password` |
| District Assistant (staff) | `district.assistant@nic.in` | `password` |
| Tenant Owner       | `tenant@nic.in`            | `password` |
| Landlord / Owner   | `landlord@nic.in`          | `password` |
| User               | `user1@gmail.com`          | `password` |

---

## API flow (simplified)

- **Public:** `POST /api/register`, `POST /api/login`, `GET /api/public/states`, `GET /api/public/districts`, `GET /api/public/offices`, tenancy application submit/receipt/details (as per backend).
- **Authenticated (Sanctum):** `POST /api/logout`, `GET /api/user`, profile, tenancy “my” list and update.
- **System admin only:** users CRUD, approve, block, activity logs, states, districts, designations, roles, offices CRUD.

To seed or reseed demo users (including `user1@gmail.com`), run in the backend folder:

```bash
php artisan db:seed
# or only users:
php artisan db:seed --class=UserSeeder
```
