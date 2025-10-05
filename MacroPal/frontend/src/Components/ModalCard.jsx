import { useEffect } from "react";
import "../App.css";

function ModalCard({ open, setOpen, title, children, onSubmit }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="mp-modal-overlay" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
      <div className="mp-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="mp-modal-header">
          <strong>{title}</strong>
          <button className="mp-btn" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="mp-modal-body">{children}</div>

        <div className="mp-modal-footer">
          <button className="mp-btn mp-btn-primary" onClick={onSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCard
