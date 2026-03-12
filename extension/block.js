const sourceValue = document.getElementById("sourceValue");
const goalValue = document.getElementById("goalValue");
const timerValue = document.getElementById("timerValue");
const statusMessage = document.getElementById("statusMessage");
const unlockForm = document.getElementById("unlockForm");
const adminPinInput = document.getElementById("adminPin");
const focusTimeForm = document.getElementById("focusTimeForm");
const focusMinutesInput = document.getElementById("focusMinutes");
const focusPinInput = document.getElementById("focusPin");
const changePinForm = document.getElementById("changePinForm");
const currentPinInput = document.getElementById("currentPin");
const newPinInput = document.getElementById("newPin");

function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(total / 3600)).padStart(2, "0");
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function setStatus(text, ok = false) {
  statusMessage.textContent = text;
  statusMessage.classList.toggle("ok", ok);
}

function readParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    source: p.get("source") || "blocked",
    reason: p.get("reason") || "focus-mode"
  };
}

async function getSessionState() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "fg.getSession" });
    if (!response?.ok) return null;
    return response;
  } catch {
    return null;
  }
}

async function refreshView() {
  const params = readParams();
  sourceValue.textContent = `${params.source} (${params.reason})`;

  const res = await getSessionState();
  const session = res?.session;
  if (!res?.ok || !session) {
    goalValue.textContent = "Session unavailable";
    timerValue.textContent = "--:--:--";
    setStatus("Unable to fetch session status.");
    return;
  }

  goalValue.textContent = session.goal || "Focused study session";
  if (!session.active) {
    timerValue.textContent = "00:00:00";
    setStatus("Session is inactive now. You may return.", true);
    return;
  }
  timerValue.textContent = formatDuration(session.endsAt - Date.now());
}

unlockForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const pin = String(adminPinInput.value || "").trim();
  if (!pin) {
    setStatus("Enter admin PIN.");
    return;
  }

  setStatus("Verifying PIN...");
  try {
    const response = await chrome.runtime.sendMessage({
      type: "fg.endSession",
      pin,
      source: "block-page"
    });
    if (!response?.ok) {
      setStatus(response?.error || "Invalid PIN.");
      adminPinInput.value = "";
      return;
    }
  } catch {
    setStatus("Unable to verify PIN.");
    return;
  }

  setStatus("Session ended. Returning to previous page...", true);
  setTimeout(() => {
    window.history.back();
  }, 1000);
});

changePinForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const currentPin = String(currentPinInput?.value || "").trim();
  const newPin = String(newPinInput?.value || "").trim();

  if (!currentPin || !newPin) {
    setStatus("Enter current and new PIN.");
    return;
  }

  if (!/^\d{4,8}$/.test(newPin)) {
    setStatus("New PIN must be 4-8 digits.");
    return;
  }

  setStatus("Updating PIN...");
  try {
    const response = await chrome.runtime.sendMessage({
      type: "fg.changePin",
      currentPin,
      newPin
    });

    if (!response?.ok) {
      setStatus(response?.error || "Failed to update PIN.");
      return;
    }

    setStatus("PIN updated successfully.", true);
    if (currentPinInput) currentPinInput.value = "";
    if (newPinInput) newPinInput.value = "";
  } catch {
    setStatus("Unable to update PIN right now.");
  }
});

focusTimeForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const minutes = Number(focusMinutesInput?.value || 0);
  const pin = String(focusPinInput?.value || "").trim();

  if (!Number.isFinite(minutes) || minutes < 15 || minutes > 720) {
    setStatus("Focus time must be between 15 and 720 minutes.");
    return;
  }
  if (!pin) {
    setStatus("Admin PIN is required.");
    return;
  }

  setStatus("Updating focus time...");
  try {
    const response = await chrome.runtime.sendMessage({
      type: "fg.updateFocusTime",
      pin,
      durationMinutes: minutes
    });
    if (!response?.ok) {
      setStatus(response?.error || "Unable to update focus time.");
      return;
    }
    setStatus("Focus time updated successfully.", true);
    if (focusPinInput) focusPinInput.value = "";
    void refreshView();
  } catch {
    setStatus("Unable to update focus time right now.");
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "fg.sessionUpdated") void refreshView();
});

void refreshView();
setInterval(() => void refreshView(), 1000);
