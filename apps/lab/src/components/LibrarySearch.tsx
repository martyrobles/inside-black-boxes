type LibrarySearchProps = {
  initialQuery?: string;
};

export function LibrarySearch({ initialQuery = "" }: LibrarySearchProps) {
  return (
    <form className="search-bar" method="get" action="/library">
      <label className="field" style={{ marginBottom: 0, flex: 1 }}>
        <span className="label">Search</span>
        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          className="input"
          placeholder="Search titles, descriptions, notes, filenames, URLs…"
        />
      </label>
      <button type="submit" className="btn btn--primary">
        Search
      </button>
      {initialQuery ? (
        <a href="/library" className="btn btn--ghost">
          Clear
        </a>
      ) : null}
    </form>
  );
}
