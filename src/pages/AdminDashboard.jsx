import { useEffect, useMemo, useState } from "react";
import { UploadCloud, Loader2, RefreshCw, Search, Sparkles, ImageOff } from "lucide-react";
import api from "../api/axios.js";
import LinkCard from "../components/LinkCard.jsx";

const emptyForm = { targetUrl: "", customCode: "", title: "", description: "" };

export default function AdminDashboard() {
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imagePath, setImagePath] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [apiDown, setApiDown] = useState(false);

  const loadLinks = async () => {
    try {
      const { data } = await api.get("/links");
      setLinks(data);
      setApiDown(false);
    } catch {
      setApiDown(true);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter(
      (l) => l.shortCode.toLowerCase().includes(q) || l.targetUrl.toLowerCase().includes(q)
    );
  }, [links, query]);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const { data } = await api.post("/upload", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImagePath(data.image);
    } catch {
      setError("Image upload failed. Is the local server running (npm run dev)?");
      setImagePath("");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^https?:\/\/.+/i.test(form.targetUrl)) {
      setError("Enter a valid target URL starting with http:// or https://");
      return;
    }

    setCreating(true);
    try {
      await api.post("/links", {
        targetUrl: form.targetUrl.trim(),
        image: imagePath,
        title: form.title.trim(),
        description: form.description.trim(),
        customCode: form.customCode.trim() || undefined,
      });
      setForm(emptyForm);
      setImagePath("");
      setImagePreview("");
      await loadLinks();
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't create the short link.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (code) => {
    if (!confirm(`Delete short link /s/${code}? This also removes its static page.`)) return;
    try {
      await api.delete(`/links/${code}`);
      setLinks((prev) => prev.filter((l) => l.shortCode !== code));
    } catch {
      setError("Couldn't delete that link.");
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await api.post("/generate");
    } catch {
      setError("Regeneration failed.");
    } finally {
      setRegenerating(false);
    }
  };

  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "";

  if (apiDown) {
    return (
      <div className="page">
        <div className="empty-state">
          <ImageOff size={24} />
          <p>Admin API isn't reachable.</p>
          <p className="muted">
            Run <code>npm run dev</code> from the project root — it starts both the Vite
            dev server and the local Express admin API together.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page-head">
        <div>
          <h1>Admin</h1>
          <p className="muted">Local-only — this screen and its API never ship to production.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleRegenerate} disabled={regenerating}>
          {regenerating ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
          Regenerate static files
        </button>
      </section>

      <div className="admin-grid">
        <form className="panel form-panel" onSubmit={handleCreate}>
          <h2 className="panel-title">
            <Sparkles size={16} /> New short link
          </h2>

          <label className="field">
            <span>Target URL</span>
            <input
              type="url"
              required
              placeholder="https://subionline.in/job/tnpsc"
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
            />
          </label>

          <label className="field">
            <span>Custom short code (optional)</span>
            <input
              placeholder="Leave blank to auto-generate"
              value={form.customCode}
              onChange={(e) => setForm({ ...form, customCode: e.target.value })}
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>OG title (optional)</span>
              <input
                placeholder="Shown when shared"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label className="field">
              <span>OG description (optional)</span>
              <input
                placeholder="One short line"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
          </div>

          <label className="field">
            <span>Open Graph image</span>
            <label className="upload-drop">
              {imagePreview ? (
                <img src={imagePreview} alt="OG preview" />
              ) : (
                <div className="upload-placeholder">
                  <UploadCloud size={20} />
                  <span>Click to upload — auto-resized to 1200×630</span>
                </div>
              )}
              <input type="file" accept="image/*" hidden onChange={handleImageSelect} />
            </label>
            {uploading && (
              <span className="muted upload-status">
                <Loader2 size={13} className="spin" /> Resizing &amp; optimizing…
              </span>
            )}
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={creating || uploading}>
            {creating ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
            Generate short link
          </button>
        </form>

        <div className="panel table-panel">
          <div className="panel-title-row">
            <h2 className="panel-title">Generated links ({links.length})</h2>
            <div className="search-box search-box-sm">
              <Search size={14} />
              <input
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="muted" style={{ padding: "24px 0" }}>
              No links yet — create one on the left.
            </p>
          ) : (
            <div className="card-grid">
              {filtered.map((link) => (
                <LinkCard
                  key={link.shortCode}
                  link={link}
                  siteOrigin={siteOrigin}
                  deletable
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
