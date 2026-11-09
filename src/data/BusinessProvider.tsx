import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, databaseConfigurationError } from "./supabase";
import { changedRecords, emptyState, type BusinessState } from "./model";
import { demoState } from "./demo";
import { safeStorage } from "../utils/storage";

type Mutation = (current: BusinessState) => BusinessState;
interface BusinessContextValue {
  state: BusinessState;
  mutate: (operation: Mutation) => Promise<boolean>;
  refresh: () => Promise<void>;
  busy: boolean;
  error: string;
  userId: string;
  connected: boolean;
  workspaceName: string;
  role: string;
}
const Context = createContext<BusinessContextValue | null>(null);
const standaloneDemo = demoState();
export function useBusiness() {
  const value = useContext(Context);
  if (!value) throw new Error("BusinessProvider is required.");
  return value;
}
export function useHrData() {
  const context = useContext(Context);
  const state = context?.state ?? standaloneDemo;
  return {
    ...context,
    state,
    EMPLOYEES: state.employees,
    LEAVE_REQUESTS: state.leaves,
    ATTENDANCE: state.attendance,
    CANDIDATES: state.candidates,
    JOB_OPENINGS: state.jobs,
    ONBOARDING_TASKS: state.onboarding,
    DEPARTMENTS: state.departments,
    PERFORMANCE_GOALS: state.goals,
    PERFORMANCE_REVIEWS: state.reviews,
    TRAINING_COURSES: state.courses,
    TRAINING_ASSIGNMENTS: state.assignments,
    getEmployeeName: (id: string) => {
      const employee = state.employees.find((employee) => employee.id === id);
      return employee
        ? `${employee.firstName} ${employee.lastName}`
        : "Unknown employee";
    },
  };
}

function AccountLogin() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form
        className="w-full max-w-sm space-y-5 rounded-xl border bg-white p-8"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            const { error } = await supabase!.auth.signInWithPassword({
              email,
              password,
            });
            if (error) throw error;
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Sign in failed.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <h1 className="text-2xl font-bold text-[#194b91]">Digital Nomad</h1>
        <p className="text-sm text-slate-500">Sign in to your workspace.</p>
        <label className="block text-sm">
          Email
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border p-2"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border p-2"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-[#194b91] p-2.5 text-white disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-xs text-slate-500">
          Ask your workspace administrator for an account.
        </p>
      </form>
    </main>
  );
}

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null),
    [authReady, setAuthReady] = useState(!supabase);
  const [state, setState] = useState<BusinessState>(() =>
    supabase ? emptyState() : demoState(),
  );
  const [workspace, setWorkspace] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);
  const [loaded, setLoaded] = useState(!supabase),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [workspaceName, setWorkspaceName] = useState("Digital Nomad");
  const [noMembership, setNoMembership] = useState(false);
  const stateRef = useRef(state),
    revisionRef = useRef(0),
    epoch = useRef(0),
    queue = useRef(Promise.resolve());
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (active) {
        if (error) setError(error.message);
        setSession(data.session);
        setAuthReady(true);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) {
        setSession(next);
        setAuthReady(true);
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  const load = async (workspaceId: string, expectedEpoch = epoch.current) => {
    const { data, error } = await supabase!.rpc("read_workspace", {
      p_workspace: workspaceId,
    });
    if (error) throw error;
    if (expectedEpoch !== epoch.current) return;
    if (!data || typeof data.revision !== "number" || !data.state)
      throw new Error(
        "Invalid workspace response. Apply the database migration.",
      );
    const next: BusinessState = {
      ...emptyState(),
      ...data.state,
      company: data.state.company?.length
        ? data.state.company
        : emptyState().company,
      settings: data.state.settings?.length
        ? data.state.settings
        : emptyState().settings,
    };
    if (data.revision < revisionRef.current) return;
    revisionRef.current = data.revision;
    stateRef.current = next;
    setState(next);
    setLoaded(true);
  };
  const findWorkspace = async (userId: string, expectedEpoch: number) => {
    setError("");
    setNoMembership(false);
    setLoaded(false);
    try {
      const { data, error } = await supabase!
        .from("workspace_members")
        .select("workspace_id,role,workspaces(id,name)")
        .eq("user_id", userId)
        .order("workspace_id");
      if (error) throw error;
      if (expectedEpoch !== epoch.current) return;
      if (!data?.length) {
        setNoMembership(true);
        return;
      }
      const member = data[0],
        project = member.workspaces as unknown as { id: string; name: string };
      if (!project)
        throw new Error(
          "Workspace is unavailable. Contact your administrator.",
        );
      setWorkspace({ ...project, role: member.role });
      await load(project.id, expectedEpoch);
    } catch (error) {
      if (expectedEpoch === epoch.current)
        setError(
          error instanceof Error
            ? error.message
            : String(
                (error as { message?: string }).message ||
                  "Workspace could not be loaded.",
              ),
        );
    }
  };
  useEffect(() => {
    if (!supabase) return;
    const current = ++epoch.current;
    setWorkspace(null);
    setLoaded(false);
    revisionRef.current = 0;
    stateRef.current = emptyState();
    setState(stateRef.current);
    queue.current = Promise.resolve();
    if (session?.user.id) void findWorkspace(session.user.id, current);
    return () => {
      epoch.current++;
    };
  }, [session?.user.id]);
  const refresh = async () => {
    if (!supabase || !workspace || busy) return;
    setError("");
    setBusy(true);
    try {
      await load(workspace.id);
    } catch (error) {
      setError((error as Error).message || "Refresh failed.");
    } finally {
      setBusy(false);
    }
  };
  const mutate = (operation: Mutation): Promise<boolean> => {
    const currentEpoch = epoch.current,
      currentWorkspace = workspace;
    const task = queue.current.then(async () => {
      if (currentEpoch !== epoch.current) return false;
      setBusy(true);
      setError("");
      try {
        if (
          supabase &&
          (!currentWorkspace || !loaded || currentWorkspace.role === "viewer")
        )
          throw new Error("Workspace write access is required.");
        const next = operation(stateRef.current),
          changes = changedRecords(stateRef.current, next);
        if (!changes.length) return true;
        if (supabase) {
          const { data, error } = await supabase.rpc(
            "apply_workspace_changes",
            {
              p_workspace: currentWorkspace!.id,
              p_revision: revisionRef.current,
              p_changes: changes,
            },
          );
          if (error) {
            if (error.code === "40001")
              await load(currentWorkspace!.id, currentEpoch);
            throw error;
          }
          if (currentEpoch !== epoch.current) return false;
          revisionRef.current = data;
        }
        stateRef.current = next;
        setState(next);
        return true;
      } catch (error) {
        if (currentEpoch === epoch.current)
          setError(
            (error as Error).message ||
              "Save failed. Changes have not been saved.",
          );
        return false;
      } finally {
        if (currentEpoch === epoch.current) setBusy(false);
      }
    });
    queue.current = task.then(
      () => undefined,
      () => undefined,
    );
    return task;
  };
  if (databaseConfigurationError)
    return (
      <p role="alert" className="p-8">
        Database configuration is invalid or incomplete. Configure a valid
        VITE_SUPABASE_URL and public VITE_SUPABASE_PUBLISHABLE_KEY, then
        redeploy. Secret/service-role keys must never be used in the browser.
      </p>
    );
  if (!authReady)
    return (
      <p role="status" className="p-8">
        Checking your session…
      </p>
    );
  if (supabase && !session) return <AccountLogin />;
  if (supabase && !loaded)
    return (
      <main className="mx-auto max-w-lg space-y-4 p-8">
        <h1 className="text-xl font-bold">Your workspace</h1>
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        {noMembership ? (
          <>
            <p>
              Create a new, empty workspace. Existing company users should ask
              their administrator for membership instead.
            </p>
            <label className="block">
              Workspace name
              <input
                className="ml-2 rounded border p-2"
                value={workspaceName}
                maxLength={120}
                onChange={(event) => setWorkspaceName(event.target.value)}
              />
            </label>
            <button
              disabled={busy || !workspaceName.trim()}
              className="rounded bg-[#194b91] px-4 py-2 text-white"
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  const { error } = await supabase!.rpc("create_workspace", {
                    p_name: workspaceName.trim(),
                  });
                  if (error) throw error;
                  await findWorkspace(session!.user.id, epoch.current);
                } catch (error) {
                  setError((error as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Create workspace
            </button>
          </>
        ) : (
          <button
            onClick={() => void findWorkspace(session!.user.id, epoch.current)}
          >
            Retry loading workspace
          </button>
        )}
        <button
          className="ml-4 underline"
          onClick={() => void supabase!.auth.signOut()}
        >
          Sign out
        </button>
      </main>
    );
  return (
    <Context.Provider
      value={{
        state,
        mutate,
        refresh,
        busy,
        error,
        userId: session?.user.id ?? "demo",
        connected: Boolean(supabase),
        workspaceName: workspace?.name ?? "Demo workspace",
        role: workspace?.role ?? "admin",
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function ConnectionStatus() {
  const business = useBusiness();
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {business.workspaceName} ·{" "}
          {business.connected
            ? "Database connected"
            : "Demo mode · changes are not saved after refresh"}{" "}
          · {business.busy ? "Saving…" : business.role}
        </span>
        {business.connected && (
          <button
            disabled={business.busy}
            onClick={() => void business.refresh()}
            className="rounded border bg-white px-3 py-1.5"
          >
            Refresh data
          </button>
        )}
      </div>
      {business.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {business.error}
        </p>
      )}
    </div>
  );
}
