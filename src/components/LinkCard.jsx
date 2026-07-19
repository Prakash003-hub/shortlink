import { useState } from "react";
import { Copy, Check, ExternalLink, Trash2 } from "lucide-react";

function hostFrom(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function LinkCard({ link, siteOrigin, onDelete, deletable = false }) {
  const [copied, setCopied] = useState(false);
  const shortUrl = `${siteOrigin}/s/${link.shortCode}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be unavailable */
    }
  };

  return (
    <article className="card">
      <div className="card-media">
        {link.image ? (
          <img src={link.image} alt="" loading="lazy" />
        ) : (
          <div className="card-media-empty">No image</div>
        )}
        <span className="card-chip">{hostFrom(link.targetUrl)}</span>
      </div>

      <div className="card-body">
        <div className="card-code-row">
          <span className="pulse-dot" aria-hidden="true" />
          <code className="card-code">/s/{link.shortCode}</code>
        </div>

        <a className="card-target" href={link.targetUrl} target="_blank" rel="noreferrer">
          <span>{link.targetUrl}</span>
          <ExternalLink size={13} />
        </a>

        <div className="card-actions">
          <button className="btn btn-ghost btn-sm" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy link"}
          </button>
          {deletable && (
            <button className="btn btn-danger-ghost btn-sm" onClick={() => onDelete?.(link.shortCode)}>
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
