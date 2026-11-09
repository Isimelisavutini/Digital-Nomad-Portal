-- Digital Nomad: apply once through Supabase migrations or SQL Editor.
-- No sample employee, payroll, invoice or bank data is inserted.
begin;
create table public.workspaces (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name)) between 1 and 120),
 revision bigint not null default 0, created_at timestamptz not null default now()
);
create table public.workspace_members (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check(role in ('admin','editor','viewer')), primary key(workspace_id,user_id)
);
create index workspace_members_user_idx on public.workspace_members(user_id,workspace_id);
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
create policy own_membership on public.workspace_members for select to authenticated using(user_id = (select auth.uid()));
create policy member_workspaces on public.workspaces for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = id and m.user_id = (select auth.uid())));
revoke all on public.workspaces, public.workspace_members from authenticated;
grant select on public.workspaces, public.workspace_members to authenticated;
revoke all on public.workspaces, public.workspace_members from anon;

create table public.employees (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id),
 candidate_id text generated always as (data->>'candidateId') stored,
 check(data ?& array['firstName','lastName','grossPayFjd','hourlyRateFjd','payType','joinDate','status','fnpfEmployeeRate','fnpfEmployerRate','payeTaxRate']),
 check((data->>'grossPayFjd')::numeric >= 0 and (data->>'hourlyRateFjd')::numeric >= 0),
 check((data->>'fnpfEmployeeRate')::numeric between 0 and 1 and (data->>'fnpfEmployerRate')::numeric between 0 and 1 and (data->>'payeTaxRate')::numeric between 0 and 1),
 check((data->>'fnpfEmployeeRate')::numeric + (data->>'payeTaxRate')::numeric <= 1),
 check(data->>'payType' in ('monthly','hourly','contractor')),
 check(data->>'status' in ('active','probation','on_leave','suspended','terminated'))
);
alter table public.employees enable row level security;
create policy member_read on public.employees for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = employees.workspace_id and m.user_id = (select auth.uid())));
grant select on public.employees to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.employees from authenticated;
revoke all on public.employees from anon;

create table public.leaves (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id),
 employee_id text generated always as (data->>'employeeId') stored not null,
 check(data ?& array['leaveType','startDate','endDate','days','status']),
 check(data->>'status' in ('pending','approved','rejected','cancelled')),
 check((data->>'days')::numeric > 0 and data->>'startDate' <= data->>'endDate')
);
alter table public.leaves enable row level security;
create policy member_read on public.leaves for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = leaves.workspace_id and m.user_id = (select auth.uid())));
grant select on public.leaves to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.leaves from authenticated;
revoke all on public.leaves from anon;
create index leaves_employee_idx on public.leaves(workspace_id,employee_id);

create table public.attendance (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id),
 employee_id text generated always as (data->>'employeeId') stored not null,
 record_date text generated always as (data->>'date') stored not null,
 check(data->>'status' in ('present','late','absent','on_leave','half_day','holiday')),
 check(coalesce((data->>'hoursWorked')::numeric,0) between 0 and 24)
);
alter table public.attendance enable row level security;
create policy member_read on public.attendance for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = attendance.workspace_id and m.user_id = (select auth.uid())));
grant select on public.attendance to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.attendance from authenticated;
revoke all on public.attendance from anon;
create index attendance_employee_idx on public.attendance(workspace_id,employee_id);

create table public.candidates (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id),
 check(data->>'status' in ('applied','screening','interview','offer','hired','rejected'))
);
alter table public.candidates enable row level security;
create policy member_read on public.candidates for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = candidates.workspace_id and m.user_id = (select auth.uid())));
grant select on public.candidates to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.candidates from authenticated;
revoke all on public.candidates from anon;

create table public.jobs (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id)
);
alter table public.jobs enable row level security;
create policy member_read on public.jobs for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = jobs.workspace_id and m.user_id = (select auth.uid())));
grant select on public.jobs to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.jobs from authenticated;
revoke all on public.jobs from anon;

create table public.onboarding (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id),
 employee_id text generated always as (data->>'employeeId') stored not null
);
alter table public.onboarding enable row level security;
create policy member_read on public.onboarding for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = onboarding.workspace_id and m.user_id = (select auth.uid())));
grant select on public.onboarding to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.onboarding from authenticated;
revoke all on public.onboarding from anon;
create index onboarding_employee_idx on public.onboarding(workspace_id,employee_id);

create table public.payroll_runs (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id),
 period_start text generated always as (data->>'periodStart') stored not null,
 period_end text generated always as (data->>'periodEnd') stored not null,
 check(data->>'status' in ('draft','processed','paid')),
 check((data->>'totalGrossFjd')::numeric >= 0 and (data->>'totalNetPayFjd')::numeric >= 0)
);
alter table public.payroll_runs enable row level security;
create policy member_read on public.payroll_runs for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = payroll_runs.workspace_id and m.user_id = (select auth.uid())));
grant select on public.payroll_runs to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.payroll_runs from authenticated;
revoke all on public.payroll_runs from anon;

create table public.invoices (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id),
 check(data ?& array['invoiceNumber','subtotalFjd','vatAmountFjd','totalFjd','status']),
 check((data->>'totalFjd')::numeric >= 0)
);
alter table public.invoices enable row level security;
create policy member_read on public.invoices for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = invoices.workspace_id and m.user_id = (select auth.uid())));
grant select on public.invoices to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.invoices from authenticated;
revoke all on public.invoices from anon;

create table public.expenses (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id),
 check(data ?& array['date','amountFjd','vendor']),
 check((data->>'amountFjd')::numeric >= 0)
);
alter table public.expenses enable row level security;
create policy member_read on public.expenses for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = expenses.workspace_id and m.user_id = (select auth.uid())));
grant select on public.expenses to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.expenses from authenticated;
revoke all on public.expenses from anon;

create table public.projects (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id)
);
alter table public.projects enable row level security;
create policy member_read on public.projects for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = (select auth.uid())));
grant select on public.projects to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.projects from authenticated;
revoke all on public.projects from anon;

create table public.tasks (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id),
 project_id text generated always as (data->>'projectId') stored not null
);
alter table public.tasks enable row level security;
create policy member_read on public.tasks for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = tasks.workspace_id and m.user_id = (select auth.uid())));
grant select on public.tasks to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.tasks from authenticated;
revoke all on public.tasks from anon;

create table public.departments (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id)
);
alter table public.departments enable row level security;
create policy member_read on public.departments for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = departments.workspace_id and m.user_id = (select auth.uid())));
grant select on public.departments to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.departments from authenticated;
revoke all on public.departments from anon;

create table public.goals (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id),
 employee_id text generated always as (data->>'employeeId') stored not null
);
alter table public.goals enable row level security;
create policy member_read on public.goals for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = goals.workspace_id and m.user_id = (select auth.uid())));
grant select on public.goals to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.goals from authenticated;
revoke all on public.goals from anon;
create index goals_employee_idx on public.goals(workspace_id,employee_id);

create table public.reviews (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id),
 employee_id text generated always as (data->>'employeeId') stored not null
);
alter table public.reviews enable row level security;
create policy member_read on public.reviews for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = reviews.workspace_id and m.user_id = (select auth.uid())));
grant select on public.reviews to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.reviews from authenticated;
revoke all on public.reviews from anon;
create index reviews_employee_idx on public.reviews(workspace_id,employee_id);

create table public.courses (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id)
);
alter table public.courses enable row level security;
create policy member_read on public.courses for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = courses.workspace_id and m.user_id = (select auth.uid())));
grant select on public.courses to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.courses from authenticated;
revoke all on public.courses from anon;

create table public.assignments (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id),
 employee_id text generated always as (data->>'employeeId') stored not null,
 course_id text generated always as (data->>'courseId') stored not null
);
alter table public.assignments enable row level security;
create policy member_read on public.assignments for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = assignments.workspace_id and m.user_id = (select auth.uid())));
grant select on public.assignments to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.assignments from authenticated;
revoke all on public.assignments from anon;
create index assignments_employee_idx on public.assignments(workspace_id,employee_id);

create table public.settings (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 id text not null check(length(id) between 1 and 120),
 data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
 updated_at timestamptz not null default now(),
 primary key(workspace_id,id),
 check(id = 'config')
);
alter table public.settings enable row level security;
create policy member_read on public.settings for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = settings.workspace_id and m.user_id = (select auth.uid())));
grant select on public.settings to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.settings from authenticated;
revoke all on public.settings from anon;
alter table public.leaves add foreign key(workspace_id,employee_id) references public.employees(workspace_id,id);
alter table public.attendance add foreign key(workspace_id,employee_id) references public.employees(workspace_id,id);
alter table public.onboarding add foreign key(workspace_id,employee_id) references public.employees(workspace_id,id);
alter table public.goals add foreign key(workspace_id,employee_id) references public.employees(workspace_id,id);
alter table public.reviews add foreign key(workspace_id,employee_id) references public.employees(workspace_id,id);
alter table public.assignments add foreign key(workspace_id,employee_id) references public.employees(workspace_id,id);
alter table public.tasks add foreign key(workspace_id,project_id) references public.projects(workspace_id,id);
alter table public.assignments add foreign key(workspace_id,course_id) references public.courses(workspace_id,id);
alter table public.employees add foreign key(workspace_id,candidate_id) references public.candidates(workspace_id,id);
create unique index employee_candidate_once on public.employees(workspace_id,candidate_id) where candidate_id is not null;
create unique index attendance_employee_day on public.attendance(workspace_id,employee_id,record_date);
create unique index payroll_period_once on public.payroll_runs(workspace_id,period_start,period_end);
create table public.audit_events (
 id bigint generated always as identity primary key, workspace_id uuid not null references public.workspaces(id) on delete cascade,
 actor_id uuid not null references auth.users(id), collection text not null, record_id text not null,
 previous_data jsonb, next_data jsonb not null, created_at timestamptz not null default now()
);
create index audit_workspace_time_idx on public.audit_events(workspace_id,created_at desc);
alter table public.audit_events enable row level security;
create policy admin_audit_read on public.audit_events for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id = audit_events.workspace_id and m.user_id = (select auth.uid()) and m.role = 'admin'));
revoke all on public.audit_events from authenticated;
grant select on public.audit_events to authenticated;
revoke all on public.audit_events from anon;

create table public.company (workspace_id uuid not null references public.workspaces(id) on delete cascade,id text not null,data jsonb not null check(jsonb_typeof(data)='object' and data->>'id'=id),updated_at timestamptz not null default now(),primary key(workspace_id,id));
alter table public.company enable row level security;
create policy member_read on public.company for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id=company.workspace_id and m.user_id=(select auth.uid())));
revoke all on public.company from authenticated,anon;
grant select on public.company to authenticated;
create table public.timeline (workspace_id uuid not null references public.workspaces(id) on delete cascade,id text not null,data jsonb not null check(jsonb_typeof(data)='object' and data->>'id'=id),updated_at timestamptz not null default now(),primary key(workspace_id,id));
alter table public.timeline enable row level security;
create policy member_read on public.timeline for select to authenticated using(exists(select 1 from public.workspace_members m where m.workspace_id=timeline.workspace_id and m.user_id=(select auth.uid())));
revoke all on public.timeline from authenticated,anon;
grant select on public.timeline to authenticated;

create function public.create_workspace(p_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
 insert into public.workspaces(name) values(p_name) returning id into new_id;
 insert into public.workspace_members(workspace_id,user_id,role) values(new_id,auth.uid(),'admin');
 return new_id;
end; $$;
revoke all on function public.create_workspace(text) from public,anon;
grant execute on function public.create_workspace(text) to authenticated;

-- All writes use this transaction boundary, with a workspace revision lock to
-- reject stale clients rather than silently replacing a colleague's changes.
create function public.apply_workspace_changes(p_workspace uuid,p_revision bigint,p_changes jsonb) returns bigint
language plpgsql security definer set search_path = '' as $$
declare current_revision bigint; change jsonb; collection_name text; record_data jsonb; old_data jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.workspace_members where workspace_id=p_workspace and user_id=auth.uid() and role in ('admin','editor')) then
  raise exception 'Workspace write access denied' using errcode='42501';
 end if;
 select revision into current_revision from public.workspaces where id=p_workspace for update;
 if current_revision is distinct from p_revision then raise exception 'Workspace changed. Refresh and try again.' using errcode='40001'; end if;
 if jsonb_typeof(p_changes) is distinct from 'array' or jsonb_array_length(p_changes) not between 1 and 500 then raise exception 'Invalid change batch'; end if;
 for change in select value from jsonb_array_elements(p_changes) loop
  collection_name := change->>'collection'; record_data := change->'record';
  if collection_name is null or collection_name not in ('employees','leaves','attendance','candidates','jobs','onboarding','payroll_runs','invoices','expenses','projects','tasks','departments','goals','reviews','courses','assignments','settings','company','timeline') then raise exception 'Unknown collection'; end if;
  if jsonb_typeof(record_data) <> 'object' or coalesce(record_data->>'id','') = '' then raise exception 'Record ID required'; end if;
  execute format('select data from public.%I where workspace_id=$1 and id=$2',collection_name) into old_data using p_workspace,record_data->>'id';
  if collection_name = 'payroll_runs' and (record_data->>'status' <> 'draft' or old_data is not null) then raise exception 'Payroll snapshots are immutable drafts; payment approval requires a separate workflow'; end if;
  execute format('insert into public.%I(workspace_id,id,data) values($1,$2,$3) on conflict(workspace_id,id) do update set data=excluded.data,updated_at=now()',collection_name) using p_workspace,record_data->>'id',record_data;
  insert into public.audit_events(workspace_id,actor_id,collection,record_id,previous_data,next_data) values(p_workspace,auth.uid(),collection_name,record_data->>'id',old_data,record_data);
 end loop;
 update public.workspaces set revision=revision+1 where id=p_workspace returning revision into current_revision;
 return current_revision;
end; $$;
revoke all on function public.apply_workspace_changes(uuid,bigint,jsonb) from public,anon;
grant execute on function public.apply_workspace_changes(uuid,bigint,jsonb) to authenticated;

create function public.read_workspace(p_workspace uuid) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare result jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.workspace_members where workspace_id=p_workspace and user_id=auth.uid()) then raise exception 'Workspace access denied' using errcode='42501'; end if;
 select jsonb_build_object('revision',w.revision,'state',jsonb_build_object(
 'employees',coalesce((select jsonb_agg(data order by id) from public.employees where workspace_id=p_workspace),'[]'::jsonb),
 'leaves',coalesce((select jsonb_agg(data order by id) from public.leaves where workspace_id=p_workspace),'[]'::jsonb),
 'attendance',coalesce((select jsonb_agg(data order by id) from public.attendance where workspace_id=p_workspace),'[]'::jsonb),
 'candidates',coalesce((select jsonb_agg(data order by id) from public.candidates where workspace_id=p_workspace),'[]'::jsonb),
 'jobs',coalesce((select jsonb_agg(data order by id) from public.jobs where workspace_id=p_workspace),'[]'::jsonb),
 'onboarding',coalesce((select jsonb_agg(data order by id) from public.onboarding where workspace_id=p_workspace),'[]'::jsonb),
 'payroll_runs',coalesce((select jsonb_agg(data order by id) from public.payroll_runs where workspace_id=p_workspace),'[]'::jsonb),
 'invoices',coalesce((select jsonb_agg(data order by id) from public.invoices where workspace_id=p_workspace),'[]'::jsonb),
 'expenses',coalesce((select jsonb_agg(data order by id) from public.expenses where workspace_id=p_workspace),'[]'::jsonb),
 'projects',coalesce((select jsonb_agg(data order by id) from public.projects where workspace_id=p_workspace),'[]'::jsonb),
 'tasks',coalesce((select jsonb_agg(data order by id) from public.tasks where workspace_id=p_workspace),'[]'::jsonb),
 'departments',coalesce((select jsonb_agg(data order by id) from public.departments where workspace_id=p_workspace),'[]'::jsonb),
 'goals',coalesce((select jsonb_agg(data order by id) from public.goals where workspace_id=p_workspace),'[]'::jsonb),
 'reviews',coalesce((select jsonb_agg(data order by id) from public.reviews where workspace_id=p_workspace),'[]'::jsonb),
 'courses',coalesce((select jsonb_agg(data order by id) from public.courses where workspace_id=p_workspace),'[]'::jsonb),
 'assignments',coalesce((select jsonb_agg(data order by id) from public.assignments where workspace_id=p_workspace),'[]'::jsonb),
 'company',coalesce((select jsonb_agg(data order by id) from public.company where workspace_id=p_workspace),'[]'::jsonb),
 'timeline',coalesce((select jsonb_agg(data order by id) from public.timeline where workspace_id=p_workspace),'[]'::jsonb),
 'settings',coalesce((select jsonb_agg(data order by id) from public.settings where workspace_id=p_workspace),'[]'::jsonb) )) into result from public.workspaces w where w.id=p_workspace;
 return result;
end; $$;
revoke all on function public.read_workspace(uuid) from public,anon;
grant execute on function public.read_workspace(uuid) to authenticated;
-- Basic record shape and money constraints complement the application validators.
alter table public.employees add check ((jsonb_typeof(data->'grossPayFjd')='number' and jsonb_typeof(data->'hourlyRateFjd')='number' and jsonb_typeof(data->'fnpfEmployeeRate')='number' and jsonb_typeof(data->'fnpfEmployerRate')='number' and jsonb_typeof(data->'payeTaxRate')='number') is true);
alter table public.settings add check (((data->>'exchangeRateFJD')::numeric > 0 and (data->>'fxSpreadRate')::numeric between 0 and 1) is true);
alter table public.company add check(id='company');
alter table public.timeline add check(jsonb_typeof(data->'completed')='boolean');
alter table public.payroll_runs add check (period_start::date = date_trunc('month',period_start::date)::date and period_end::date = (date_trunc('month',period_start::date) + interval '1 month - 1 day')::date);
create index tasks_project_idx on public.tasks(workspace_id,project_id);
create index assignments_course_idx on public.assignments(workspace_id,course_id);
alter table public.payroll_runs add check ((data ?& array['status','currency','items','employeeCount','totalGrossFjd','totalNetPayFjd','totalFnpfEmployeeFjd','totalFnpfEmployerFjd','totalPayeTaxFjd'] and data->>'currency'='FJD' and jsonb_typeof(data->'items')='array') is true);
alter table public.employees add check (((data->>'joinDate')::date is not null) is true);
alter table public.attendance add check ((record_date::date is not null) is true);
notify pgrst, 'reload schema';
commit;
