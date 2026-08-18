# Super Admin — Simple Guide

**Who this is for:** NIC / platform operators who manage the whole Assam tenancy portal — not district officers who process day-to-day applications.

**Demo login:** Phone `9999999999` · OTP `123456` · Email `admin@nic.in`

**Technical detail:** See [super-admin-reference.md](./super-admin-reference.md) for APIs and code-level notes.

---

## In one sentence

The **Super Admin** runs the **statewide platform**: districts, staff accounts, and oversight of all applications across every district — without sitting in the normal Rent Authority / Court / Tribunal desk workflow.

---

## What the Super Admin has (menu today)

After sign-in, the workspace sidebar shows:

| Menu | What it is |
|------|------------|
| **Dashboard** | Statewide numbers — users, districts, UIN apps, service apps, charts, recent activity |
| **User management** | All staff and citizens (citizens: add `?mode=tenant` to the URL) |
| **Service applications** | All Assam Tenancy Act forms, every district |
| **Tenancy applications** | All UIN / tenancy registration records |
| **Districts** | Add, edit, activate / deactivate districts |
| **My profile** | Own account details |

**Scope:** Super Admin sees **all of Assam**. District Admin and desk staff only see **their district**.

---

## What the Super Admin does

### Platform setup

- Add and maintain **districts** (e.g. Nagaon, Kamrup).
- Create **staff accounts**: District Admin, Rent Authority / Court / Tribunal heads, and assistants.
- **Activate or deactivate** any user account (with a reason when blocking).

### Oversight (watch, don’t process)

- View **every application** — UIN and service forms — statewide.
- Open any application and **read full details**.
- In special cases: **edit submitted fields** or **force a workflow step** (e.g. move between Submitted and In Review). This is for support / correction, not normal approval.

### Monitoring

- Use the **dashboard** for totals, district-wise breakdown, form types, and a short **activity log** snippet.

---

## What the Super Admin does **not** do

These belong to other roles:

| Task | Who does it |
|------|-------------|
| Apply for UIN or submit forms | **Citizen** (`user`) |
| Verify / forward from inbox | **Assistants** |
| Approve / reject applications | **Rent Authority / Court / Tribunal** heads |
| District-only staff lists and local oversight | **District Admin** |
| Valuer reports (Form I-B) | **Valuer** |

Super Admin is **not** meant to replace desk officers in the daily approve / reject queue.

---

## What data the Super Admin handles

| Data | View | Create / change |
|------|------|-----------------|
| **Users** (all roles, all districts) | Yes | Create staff, block / unblock |
| **Citizens** | Yes | Block / unblock only (no citizen signup from admin UI) |
| **Districts** | Yes | Add, edit, activate / deactivate |
| **UIN / tenancy applications** | Yes (statewide) | View; limited edit via application detail |
| **Service applications** (Forms I–VI) | Yes (statewide) | View; edit fields + workflow override in emergencies |
| **Offices** | Yes | Add, edit, delete (`/dashboard/admin/offices`) |
| **Designations** | Yes | Add, edit, delete |
| **Roles (master table)** | Yes | Add, edit, delete (labels; not login RBAC keys) |
| **States** | Yes | Add, edit, delete |
| **Activity logs** | Yes | Full searchable page (`/dashboard/admin/activity-log`) |

---

## What the Super Admin should check regularly

Use this as a simple operational checklist:

1. **Dashboard**
   - Are application counts moving (submitted vs approved)?
   - Any district with zero staff or unusual spikes?
   - Recent activity — failed logins, odd blocks, bulk changes?

2. **User management**
   - New staff accounts created and **active**?
   - Any accounts stuck **pending approval**? (approve flow is incomplete — see gaps)
   - Principals and assistants present for each district that is live?

3. **Districts**
   - All required districts listed and **active**?
   - Names / codes correct before go-live?

4. **Applications (oversight)**
   - Spot-check stuck applications (long time in one status).
   - Use **View** on service / tenancy lists — do not use override unless support needs it.

5. **Before production**
   - Confirm demo OTP / test users are removed or locked down.
   - Confirm at least one Super Admin account is protected (no accidental demotion / delete).

---

## Where we are lagging (prototype gaps)

Honest status — what is **promised in docs or code** but **not fully ready** for Super Admin:

| Gap | What it means |
|-----|----------------|
| **Office / Designation / Role / State / Activity log** | **Wired** under sidebar **Master data** (`/dashboard/admin/offices` etc.). |
| **Approve new user** | `POST /api/users/{id}/approve` is registered. |
| **Delete user** | Accounts are **deactivated**, not deleted. |
| **Edit user from user list** | Workspace path `/dashboard/admin/users/:id`. |
| **Create valuer / another super admin** | Backend allows it; **create-user form does not offer** those roles. |
| **Docs vs reality** | Credentials doc now lists the live master-data URLs. |
| **Two user interfaces** | New workspace + old `UserDetail` page — **inconsistent** experience for some actions. |
| **Workflow buttons on applications** | Super Admin **should not** approve/reject like a head officer; override panel exists but normal workflow is **intentionally blocked**. |

---

## Super Admin vs District Admin (quick compare)

| | Super Admin | District Admin |
|---|-------------|----------------|
| **Area** | Whole state | One district |
| **Manage districts** | Yes | No |
| **Create staff** | District Admin + heads + assistants | District staff + heads + assistants + valuer |
| **See applications** | All districts | Own district only |
| **Process inbox / approve** | No (override only) | View lists; no normal desk queue |
| **Platform stats** | Full statewide dashboard | District-scoped dashboard |

---

## Related files

| File | Purpose |
|------|---------|
| [Demo_NIC_Credentials.md](../Demo_NIC_Credentials.md) | Demo logins and role matrix |
| [super-admin-reference.md](./super-admin-reference.md) | Detailed powers, APIs, and product backlog |
| [frontend-modernization-roadmap.md](./frontend-modernization-roadmap.md) | Broader UI / wiring plan |

---

*Last updated: July 2026 — matches current prototype workspace.*
