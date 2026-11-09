import React, { useId, useState } from "react";
export interface FormField {
  name: string;
  label: string;
  type?: "text" | "email" | "date" | "number";
  required?: boolean;
  value?: string | number;
  min?: number | string;
  max?: number | string;
  step?: string;
  options?: { value: string; label: string }[];
}
export function RecordForm({
  title,
  fields,
  onSave,
  onClose,
}: {
  title: string;
  fields: FormField[];
  onSave: (values: Record<string, string>) => Promise<boolean>;
  onClose: () => void;
}) {
  const id = useId(),
    [busy, setBusy] = useState(false),
    [failed, setFailed] = useState(false);
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4"
      onKeyDown={(event) => {
        if (event.key === "Escape" && !busy) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id={id} className="mb-4 text-lg font-semibold">
          {title}
        </h2>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const values = Object.fromEntries(
              new FormData(event.currentTarget).entries(),
            ) as Record<string, string>;
            setBusy(true);
            setFailed(false);
            try {
              if (await onSave(values)) onClose();
              else setFailed(true);
            } catch {
              setFailed(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          <fieldset disabled={busy} className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.name} className="text-sm">
                <label htmlFor={`${id}-${field.name}`} className="mb-1 block">
                  {field.label}
                </label>
                {field.options ? (
                  <select
                    id={`${id}-${field.name}`}
                    autoFocus={index === 0}
                    name={field.name}
                    defaultValue={field.value}
                    required={field.required}
                    className="mt-1 w-full rounded-lg border bg-white p-2"
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`${id}-${field.name}`}
                    autoFocus={index === 0}
                    name={field.name}
                    type={field.type ?? "text"}
                    defaultValue={field.value}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                )}
              </div>
            ))}
            {failed && (
              <p role="alert" className="text-sm text-red-700">
                Could not save. Check the workspace error message and try again.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>
              <button className="rounded-lg bg-[#194b91] px-4 py-2 text-white">
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </fieldset>
        </form>
      </section>
    </div>
  );
}
