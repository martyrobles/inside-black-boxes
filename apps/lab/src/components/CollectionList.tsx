import Link from "next/link";
import type { Collection } from "@/lib/types";

type CollectionListProps = {
  collections: Collection[];
};

export function CollectionList({ collections }: CollectionListProps) {
  if (collections.length === 0) {
    return (
      <div className="empty-state">
        <h2>No Collections yet</h2>
        <p className="muted">
          Create a flexible grouping — an Artifact can belong to many.
        </p>
      </div>
    );
  }

  return (
    <ul className="artifact-list">
      {collections.map((collection) => (
        <li key={collection.id}>
          <Link
            href={`/collections/${collection.id}`}
            className="artifact-row"
          >
            <div className="artifact-row__main">
              <span className="pill">Collection</span>
              <h2 className="artifact-row__title">{collection.title}</h2>
              {collection.description ? (
                <p className="artifact-row__desc muted">
                  {collection.description}
                </p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
