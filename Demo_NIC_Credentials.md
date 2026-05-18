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
 │ User    │  │ Official │  │ System   │
 │ (Tenant/│  │ (RA, RC,  │  │ Admin    │
 │ Owner)  │  │ RT, DA)   │  │          │
 └─────────┘  └──────────┘  └──────────┘
```

### Step-by-step flow

1. **Public access**
  - **Home (/)** – Login / register on the same page (or redirect to dashboard if already logged in).
  - **Login (/login)** – Sign in with **phone number** and **OTP** (demo OTP: `123456`).
  - **Register** – From home, use **Register** in the nav or `/#register` to open **Create account** (name, email, password, phone, state, district). After details, verify OTP (demo OTP: `123456`) before login. New users get role **user** and are auto-approved. (`/register` may redirect to login depending on routing.)
  - **Policies (/policies)** – Public policies page.
  - **Contact (/contact)** – Public contact page.
2. **After login**
  - User is redirected to **Dashboard (/dashboard)**.
  - Dashboard content depends on **role** (see Role-based access below).
3. **user (dashboard)**
  - **Dashboard** – Overview stat cards, quick actions (icons + text), and recent submissions tiles (real data). Logged-in user info + logout are shown in the **sidebar**.
  - Recent submissions support **Card/List icon toggle** (top-right of the section); clicking a tile opens **Status** filtered by the selected `application_no`.
  - **Profile** – View and edit profile. Saving profile does **not** require selecting Landlord/Tenant in profile form.
  - **Services**
    - **Apply for Tenancy Certificate** – Multi-step tenancy application form. Initiator role supports **Landlord**, **Tenant**, and **Property Manager**.
    - **Assam Tenancy Rules forms (Services)** – Rent Authority: Form I / I-A / I-B / IV; Rent Court: Form II / III / V; Rent Tribunal: Form VI.
  - **Status** – List and view status of own submissions (Tenancy Certificate + all Assam Tenancy Rules forms).
    - UI shows **separate tables per category** and uses **icon “View details”** for form submissions.
    - For Property Manager initiated tenancy applications, join flow currently awaits **Landlord** as second-party confirmation.
4. **Official roles (RA, RC, RT, Assistants, District Admin)**
  - **Dashboard** – **Statistics** (states, districts, users, applications), **charts** (overview bar chart, applications by status), and **quick actions** to open other panels. Logged-in user info + logout are shown in the **sidebar**.
  - **Inbox / Applications** – View and process applications assigned to your office / district.
    - **Assistants** (RA/RC/RT Assistant) can pre-verify and forward applications.
    - **Heads** (Rent Authority, Rent Court, Rent Tribunal) can make final decisions (Approve/Reject).
  - **District Management** – List/manage districts (scoped by permissions).
  - **User Management** – View user list, open user detail to **update** or **delete** users.
5. **System admin only (Super Admin)**
  - Dashboard (with stats and quick actions), Application Status, State Management, District Management, plus:
  - **Office Management** – Office, Designation.
  - **Role Management** – List/manage roles.
  - **User Management** – Full CRUD, approve, block.
  - **User Activity Log** – View activity logs.
6. **Other routes**
  - **User detail (/users/:id)** – View/edit user (protected, by permission).
7. **Accessibility (global)**
  - Top accessibility controls are available across pages: **A-**, **A**, **A+**, and **High Contrast**.
  - Skip links are available for keyboard users: **Skip to main content** and **Skip to navigation**.

---

## Role-based access summary


| Role               | Dashboard (user) | Dashboard (official) | Admin panel | Application Management |
| ------------------ | ---------------- | -------------------- | ----------- | ---------------------- |
| **user**           | ✅                | ❌                    | ❌           | ❌ (View Own)           |
| **ra_assistant**   | ❌                | ✅                    | ❌           | ✅ (Verify/Forward)     |
| **rc_assistant**   | ❌                | ✅                    | ❌           | ✅ (Verify/Forward)     |
| **rt_assistant**   | ❌                | ✅                    | ❌           | ✅ (Verify/Forward)     |
| **rent_authority** | ❌                | ✅                    | ❌           | ✅ (Approve/Reject)     |
| **rent_court**     | ❌                | ✅                    | ❌           | ✅ (Approve/Reject)     |
| **rent_tribunal**  | ❌                | ✅                    | ❌           | ✅ (Approve/Reject)     |
| **district_admin** | ❌                | ✅                    | ✅           | ✅ (District Level)     |
| **super_admin**    | ❌                | ✅                    | ✅           | ✅ (Global Access)      |


---

## Demo credentials (roles & login)

**Sign-in:** use **phone number** + **OTP** (API: `POST /api/login` with `phone` and `otp`).
For now, OTP is a **demo value**: `123456`.

Note: this prototype also keeps a **password fallback** (`password`) for backward compatibility.

### Official & Admin dashboard

To use the **official dashboard**, log in with:


| Role                  | Phone (to log in) | Email (reference only)          | OTP      |
| --------------------- | ----------------- | ------------------------------- | -------- |
| **Super Admin**       | `9999999999`      | `admin@nic.in`                  | `123456` |
| **District Admin**    | `9888888888`      | `district.admin@nic.in`         | `123456` |
| **Rent Authority**    | `9777777777`      | `rent.authority@nic.in`         | `123456` |
| **Rent Court**        | `9666666666`      | `rent.court@nic.in`             | `123456` |
| **Rent Tribunal**     | `9555555555`      | `rent.tribunal@nic.in`          | `123456` |
| **RA Assistant**      | `9111111110`      | `ra.assistant@nic.in`           | `123456` |
| **RC Assistant**      | `9111111111`      | `rc.assistant@nic.in`           | `123456` |
| **RT Assistant**      | `9111111112`      | `rt.assistant@nic.in`           | `123456` |


The official dashboard shows your **official email** and role, **stat cards and charts** (applications by status, etc.), and **Application Inbox** (Forward/Reject/Approve actions).

### User role


| Role                  | Phone (to log in) | Email (reference only)          | OTP      |
| --------------------- | ----------------- | ------------------------------- | -------- |
| **General User**      | `9444444444`      | `tenant@nic.in`                 | `123456` |


---

## Database & seeding

After schema changes, a full reset and seed is safest:

```bash
cd backend
php artisan migrate:fresh --seed
```

Seeder order includes **states → districts → village/wards → offices → designations → users → application data**.  
**Users:** each demo user must have a **unique phone** (required by DB).  
**Applications:** Seeded data includes examples for Tenancy Certificates and various Rule forms (Form I to VI) distributed across different statuses.

---

## Technical Updates (May 2026)

- **Role Migration:** Roles have been standardized to `super_admin`, `district_admin`, `rent_authority`, `rent_court`, `rent_tribunal`, `ra_assistant`, `rc_assistant`, `rt_assistant`, and `user`.
- **Workflow Integration:** Service applications now support a workflow where Assistants can forward applications to their respective Heads, and Heads can Approve/Reject.
- **District Scoping:** Official dashboards are now strictly scoped to the district assigned to the user. Super Admin remains global.
