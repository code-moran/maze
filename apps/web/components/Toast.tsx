"use client";

export function showToast(message: string) {
  const toastEl = document.getElementById("mainToast");
  const msgEl = document.getElementById("toastMsg");
  if (msgEl) msgEl.textContent = message;
  if (toastEl && window.bootstrap?.Toast) {
    new window.bootstrap.Toast(toastEl, { delay: 4000 }).show();
  }
}

export default function Toast() {
  return (
    <div
      className="toast-container position-fixed bottom-0 start-0 p-3"
      style={{ zIndex: 1100 }}
    >
      <div
        id="mainToast"
        className="toast align-items-center text-bg-success border-0"
        role="alert"
      >
        <div className="d-flex">
          <div className="toast-body" id="toastMsg"></div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            data-bs-dismiss="toast"
          ></button>
        </div>
      </div>
    </div>
  );
}
