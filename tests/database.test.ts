import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { employeeFromPayroll } from "../src/data/workflows";

test("Postgres migration: authentication, RLS, atomic writes, relationships, conflicts, audit and durable reads", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`,
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202611090001_shared_business.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const alice = "11111111-1111-4111-8111-111111111111",
      bob = "22222222-2222-4222-8222-222222222222",
      viewer = "33333333-3333-4333-8333-333333333333";
    await db.query("insert into auth.users(id) values($1),($2),($3)", [
      alice,
      bob,
      viewer,
    ]);
    const asUser = async (user: string) => {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        user,
      ]);
      await db.exec("set role authenticated");
    };
    await asUser(alice);
    const result = await db.query<{ id: string }>(
      "select public.create_workspace('Company A') as id",
    );
    const workspace = result.rows[0].id;
    const employee = employeeFromPayroll(
      {
        name: "Alice Staff",
        role: "Engineer",
        department: "Engineering",
        tinNumber: "",
        fnpfNumber: "",
        payType: "monthly",
        grossPayFjd: 3000,
        fnpfEmployeeRate: 0,
        fnpfEmployerRate: 0,
        payeTaxRate: 0,
        bankName: "",
        accountNumber: "",
        status: "active",
      },
      "staff-1",
    );
    const apply = (revision: number, changes: unknown[]) =>
      db.query(
        "select public.apply_workspace_changes($1,$2,$3::jsonb) as revision",
        [workspace, revision, JSON.stringify(changes)],
      );
    await apply(0, [{ collection: "employees", record: employee }]);
    const read = () =>
      db.query<{ snapshot: any }>(
        "select public.read_workspace($1) as snapshot",
        [workspace],
      );
    assert.equal(
      (await read()).rows[0].snapshot.state.employees[0].firstName,
      "Alice",
    );
    await assert.rejects(
      apply(0, [
        {
          collection: "employees",
          record: { ...employee, firstName: "Stale" },
        },
      ]),
      /Refresh/,
    );
    await assert.rejects(
      db.query("update public.employees set data=$1 where workspace_id=$2", [
        JSON.stringify(employee),
        workspace,
      ]),
      /permission denied/,
    );
    await assert.rejects(
      apply(1, [
        {
          collection: "employees",
          record: { ...employee, firstName: "Should roll back" },
        },
        {
          collection: "leaves",
          record: {
            id: "bad",
            employeeId: "missing",
            status: "pending",
            leaveType: "annual",
            startDate: "2026-11-02",
            endDate: "2026-11-03",
            days: 2,
          },
        },
      ]),
      /foreign key/,
    );
    assert.equal(
      (await read()).rows[0].snapshot.state.employees[0].firstName,
      "Alice",
    );
    assert.equal((await read()).rows[0].snapshot.revision, 1);
    const attendance = {
      id: "day1",
      employeeId: "staff-1",
      date: "2026-11-02",
      status: "present",
      hoursWorked: 8,
    };
    await apply(1, [{ collection: "attendance", record: attendance }]);
    await assert.rejects(
      apply(2, [
        {
          collection: "attendance",
          record: { ...attendance, id: "duplicate" },
        },
      ]),
      /unique/,
    );
    const expense = {
      id: "cloud-2026-11-test",
      date: "2026-11-01",
      vendor: "Test",
      amountFjd: 100,
    };
    await apply(2, [{ collection: "expenses", record: expense }]);
    await apply(3, [
      { collection: "expenses", record: { ...expense, amountFjd: 120 } },
    ]);
    assert.equal((await read()).rows[0].snapshot.state.expenses.length, 1);
    const run = {
      id: "payroll",
      periodStart: "2026-11-01",
      periodEnd: "2026-11-30",
      status: "draft",
      totalGrossFjd: 100,
      totalNetPayFjd: 100,
      totalFnpfEmployeeFjd: 0, totalFnpfEmployerFjd: 0, totalPayeTaxFjd: 0, currency: 'FJD', employeeCount: 1, items: [],
    };
    await apply(4, [{ collection: "payroll_runs", record: run }]);
    await assert.rejects(
      apply(5, [
        { collection: "payroll_runs", record: { ...run, status: "paid" } },
      ]),
      /immutable/,
    );
    assert.ok(
      (await db.query("select * from public.audit_events")).rows.length > 0,
    );
    await asUser(bob);
    assert.equal(
      (await db.query("select * from public.employees")).rows.length,
      0,
    );
    await assert.rejects(read(), /access denied/);
    await assert.rejects(
      apply(5, [{ collection: "employees", record: employee }]),
      /access denied/,
    );
    await db.exec("reset role");
    await db.query(
      "insert into public.workspace_members(workspace_id,user_id,role) values($1,$2,'viewer')",
      [workspace, viewer],
    );
    await asUser(viewer);
    assert.equal((await read()).rows[0].snapshot.state.employees.length, 1);
    await assert.rejects(
      apply(5, [{ collection: "employees", record: employee }]),
      /access denied/,
    );
    assert.equal(
      (await db.query("select * from public.audit_events")).rows.length,
      0,
    );
    await db.exec("reset role; set role anon");
    await db.query("select set_config('request.jwt.claim.sub','',false)");
    await assert.rejects(read(), /permission denied/);
    await assert.rejects(
      db.query("select public.create_workspace('Unauthorized')"),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
