import type { Metadata } from "next";
import { CollectionList } from "@/components/CollectionList";
import { CreateCollectionForm } from "@/components/CreateCollectionForm";
import { listCollections } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Collections",
};

export default async function CollectionsPage() {
  const collections = await listCollections();

  return (
    <div className="page">
      <header className="page-header">
        <p className="pill">Collections</p>
        <h1>Flexible groupings</h1>
        <p className="lede">
          An Artifact can belong to many Collections. Use them for themes,
          projects-in-waiting, or material you want nearby.
        </p>
      </header>

      <div className="detail-grid">
        <section>
          <CollectionList collections={collections} />
        </section>
        <aside>
          <h2 style={{ marginBottom: "1rem" }}>New Collection</h2>
          <CreateCollectionForm />
        </aside>
      </div>
    </div>
  );
}
