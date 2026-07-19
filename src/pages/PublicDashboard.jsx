import { useEffect, useMemo, useState } from "react";
import { Search, Radio } from "lucide-react";
import LinkCard from "../components/LinkCard.jsx";

export default function PublicDashboard() {
  const [links, setLinks] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    // This is the ONLY data call the deployed site makes. No backend involved.
    fetch("/data/links.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load links.json");
        return r.json();
      })
      .then((data) => {
        setLinks(Array.isArray(data) ? data : []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter(
      (l) =>
        l.shortCode.toLowerCase().includes(q) ||
        l.targetUrl.toLowerCase().includes(q) ||
        (l.title || "").toLowerCase().includes(q)
    );
  }, [links, query]);

  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="page">
      <section className="page-head">
        <div>
          <h1>Short links</h1>
          <p className="muted">
            Every card below is a live redirect page with its own Open Graph preview image.
          </p>
        </div>
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search by code, URL, or title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      {status === "loading" && <p className="muted">Loading links…</p>}

      {status === "error" && (
        <div className="empty-state">
          <Radio size={24} />
          <p>Couldn't load <code>public/data/links.json</code>.</p>
          <p className="muted">Create a link in the Admin tab, or run a build.</p>
        </div>
      )}

      {status === "ready" && filtered.length === 0 && (
        <div className="empty-state">
          <Radio size={24} />
          <p>{links.length === 0 ? "No short links yet." : "No links match your search."}</p>
          {links.length === 0 && <p className="muted">Head to Admin to create your first one.</p>}
        </div>
      )}

      {status === "ready" && filtered.length > 0 && (
        <div className="card-grid">
          {filtered.map((link) => (
            <LinkCard key={link.shortCode} link={link} siteOrigin={siteOrigin} />
          ))}
        </div>
      )}
    </div>
  );
}
