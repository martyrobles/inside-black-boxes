"use client";

import { useActionState, useMemo, useState } from "react";
import {
  createConnection,
  deleteConnection,
  type ConnectionActionState,
} from "@/lib/actions/connections";
import type { ConnectionView } from "@/lib/queries";
import {
  CONNECTION_TYPE_LABELS,
  type ConnectionType,
  type LabEntityType,
} from "@/lib/types";
import Link from "next/link";

type Target = { id: string; title: string | null };

type EntityConnectionsProps = {
  entityType: LabEntityType;
  entityId: string;
  returnPath: string;
  connections: ConnectionView[];
  targets: {
    artifacts: Target[];
    ideas: Target[];
    projects: Target[];
    collections: Target[];
  };
};

const initial: ConnectionActionState = {};

function hrefFor(type: LabEntityType, id: string) {
  if (type === "artifact") return `/artifacts/${id}`;
  if (type === "idea") return `/ideas/${id}`;
  if (type === "project") return `/projects/${id}`;
  return `/collections/${id}`;
}

export function EntityConnections({
  entityType,
  entityId,
  returnPath,
  connections,
  targets,
}: EntityConnectionsProps) {
  const [toType, setToType] = useState<LabEntityType>("artifact");
  const [state, action, pending] = useActionState(createConnection, initial);

  const options = useMemo(() => {
    const list =
      toType === "artifact"
        ? targets.artifacts
        : toType === "idea"
          ? targets.ideas
          : toType === "project"
            ? targets.projects
            : targets.collections;
    return list.filter(
      (item) => !(toType === entityType && item.id === entityId),
    );
  }, [toType, targets, entityType, entityId]);

  return (
    <section className="panel">
      <p className="label panel__label">Connections</p>
      {connections.length === 0 ? (
        <p className="muted small">No manual connections yet.</p>
      ) : (
        <ul className="connection-list">
          {connections.map((connection) => (
            <li key={connection.id}>
              <div>
                <span className="pill">
                  {CONNECTION_TYPE_LABELS[connection.connection_type]}
                </span>
                <p style={{ margin: "0.35rem 0 0.15rem" }}>
                  <Link href={hrefFor(connection.otherType, connection.otherId)}>
                    {connection.otherTitle}
                  </Link>
                </p>
                <p className="muted small" style={{ margin: 0 }}>
                  {connection.rationale}
                </p>
              </div>
              <form action={deleteConnection}>
                <input type="hidden" name="connection_id" value={connection.id} />
                <input type="hidden" name="return_path" value={returnPath} />
                <button type="submit" className="btn btn--ghost btn--small">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={action} className="connection-form">
        <input type="hidden" name="from_type" value={entityType} />
        <input type="hidden" name="from_id" value={entityId} />
        <label className="field">
          <span className="label">Connect to type</span>
          <select
            className="input"
            value={toType}
            onChange={(event) =>
              setToType(event.target.value as LabEntityType)
            }
            name="to_type"
          >
            <option value="artifact">Artifact</option>
            <option value="idea">Idea</option>
            <option value="project">Project</option>
            <option value="collection">Collection</option>
          </select>
        </label>
        <label className="field">
          <span className="label">Item</span>
          <select name="to_id" className="input" required defaultValue="">
            <option value="" disabled>
              Choose…
            </option>
            {options.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title || "Untitled"}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="label">Type</span>
          <select name="connection_type" className="input" defaultValue="thematic">
            {(Object.keys(CONNECTION_TYPE_LABELS) as ConnectionType[]).map(
              (key) => (
                <option key={key} value={key}>
                  {CONNECTION_TYPE_LABELS[key]}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="field">
          <span className="label">Rationale</span>
          <textarea
            name="rationale"
            className="input input--area"
            rows={2}
            required
            placeholder="Why do these belong together?"
          />
        </label>
        {state.error ? (
          <p className="banner banner--error" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="muted small">{state.success}</p>
        ) : null}
        <button type="submit" className="btn btn--ghost" disabled={pending}>
          {pending ? "Saving…" : "Save Connection"}
        </button>
      </form>
    </section>
  );
}
