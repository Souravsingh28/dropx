# DropX MVP (Phase 1) — With Detailed Users & ID-Number Login

### What’s inside
- Users (Admin console) with fields: **name, age, gender, photo_url, bank_account, ifsc, phone, id_number (login username), password, date_of_joining, role, is_active**.
- **Login uses `id_number` + password**.
- When a **worker** user is created, an **Employee** record is auto-created (emp_code = id_number) so production & payroll work.

### Run
**Server**
1. MySQL: `CREATE DATABASE dropx_mvp;`
2. Run SQL in `server/src/schemas` in order.
3. `cd server && cp .env.example .env` → set DB + `JWT_SECRET`.
4. `npm i && npm run dev`.

**Client**
1. `cd client && npm i`
2. Create `client/.env` with `VITE_API_URL=http://localhost:5000/api`
3. `npm run dev`

**Login (default admin)**
- ID Number: `ADMIN001`
- Password: `Admin@123`
(CHANGE IMMEDIATELY via Users page.)

### Notes
- Creating a user with role=worker links to Employees for production/payroll.
- You can extend to optional biometrics & exports later.
