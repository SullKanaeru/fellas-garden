/********************************************************************
 * FELLA'S GARDEN - CUSTOM MODAL DIALOG ENGINE (js/dialog.js)
 * Replaces native browser alert(), confirm(), and prompt()
 * with adorable, cozy matching modal popups!
 ********************************************************************/

var dialogResolveFn = null;

/**
 * Show a cute custom modal dialog
 * @param {Object} options
 * @param {string} options.type - 'alert' | 'confirm' | 'prompt'
 * @param {string} options.title - Header title
 * @param {string} options.message - Body text / question
 * @param {string} [options.defaultValue] - Initial value for prompt
 * @param {string} [options.placeholder] - Placeholder for prompt
 * @param {string} [options.confirmText] - Label for confirm button
 * @param {string} [options.cancelText] - Label for cancel button
 * @param {string} [options.icon] - Emoji or custom SVG
 * @param {boolean} [options.isDanger] - Red styling for delete confirmations
 * @returns {Promise<any>}
 */
function showCustomDialog(options) {
  return new Promise((resolve) => {
    dialogResolveFn = resolve;

    const modal = document.getElementById("customDialogModal");
    const iconEl = document.getElementById("customDialogIcon");
    const titleEl = document.getElementById("customDialogTitle");
    const messageEl = document.getElementById("customDialogMessage");
    const promptContainer = document.getElementById(
      "customDialogPromptContainer",
    );
    const promptInput = document.getElementById("customDialogInput");
    const cancelBtn = document.getElementById("customDialogCancelBtn");
    const confirmBtn = document.getElementById("customDialogConfirmBtn");
    const confirmTextEl = document.getElementById("customDialogConfirmText");

    if (!modal) {
      // Fallback if modal DOM not loaded yet
      if (options.type === "confirm")
        return resolve(window.confirm(options.message));
      if (options.type === "prompt")
        return resolve(
          window.prompt(options.message, options.defaultValue || ""),
        );
      window.alert(options.message);
      return resolve(true);
    }

    // Set Icon & Header
    iconEl.innerHTML =
      options.icon ||
      (options.type === "prompt"
        ? '<svg class="w-5 h-5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>'
        : options.isDanger
          ? '<svg class="w-5 h-5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>'
          : '<svg class="w-5 h-5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg>');
    titleEl.textContent =
      options.title ||
      (options.type === "prompt"
        ? "Ubah Nama"
        : options.isDanger
          ? "Konfirmasi Hapus"
          : "Pemberitahuan");
    messageEl.textContent = options.message || "";

    // Configure Confirm Button
    confirmTextEl.textContent =
      options.confirmText ||
      (options.type === "prompt"
        ? "Simpan"
        : options.isDanger
          ? "Ya, Hapus"
          : "Mengerti");
    if (options.isDanger) {
      confirmBtn.className =
        "px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition shadow-sm active:scale-95 inline-flex items-center gap-1.5";
    } else {
      confirmBtn.className =
        "px-5 py-2 rounded-full bg-[#2B5B35] hover:bg-[#1f4627] text-white font-bold text-sm transition shadow-sm active:scale-95 inline-flex items-center gap-1.5";
    }

    // Handle Type specific inputs
    if (options.type === "prompt") {
      promptContainer.classList.remove("hidden");
      promptInput.value = options.defaultValue || "";
      promptInput.placeholder = options.placeholder || "Ketik di sini...";
      cancelBtn.classList.remove("hidden");
      cancelBtn.textContent = options.cancelText || "Batal";
      setTimeout(() => {
        promptInput.focus();
        promptInput.select();
      }, 50);
    } else if (options.type === "confirm") {
      promptContainer.classList.add("hidden");
      cancelBtn.classList.remove("hidden");
      cancelBtn.textContent = options.cancelText || "Batal";
    } else {
      // alert
      promptContainer.classList.add("hidden");
      cancelBtn.classList.add("hidden");
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  });
}

function handleCustomDialogConfirm() {
  const modal = document.getElementById("customDialogModal");
  const promptContainer = document.getElementById(
    "customDialogPromptContainer",
  );
  const promptInput = document.getElementById("customDialogInput");

  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  if (dialogResolveFn) {
    if (!promptContainer.classList.contains("hidden")) {
      const val = promptInput.value.trim();
      dialogResolveFn(val);
    } else {
      dialogResolveFn(true);
    }
    dialogResolveFn = null;
  }
}

function handleCustomDialogCancel() {
  const modal = document.getElementById("customDialogModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  if (dialogResolveFn) {
    dialogResolveFn(null);
    dialogResolveFn = null;
  }
}

// Global Dialog helper shortcuts
window.cuteAlert = function (message, title = "Perhatian", icon = "💡") {
  return showCustomDialog({ type: "alert", message, title, icon });
};

window.cuteConfirm = function (
  message,
  title = "Konfirmasi",
  isDanger = false,
  confirmText = "Lanjutkan",
  icon = "❓",
) {
  return showCustomDialog({
    type: "confirm",
    message,
    title,
    isDanger,
    confirmText,
    icon,
  });
};

window.cutePrompt = function (
  message,
  defaultValue = "",
  title = "Beri Nama",
  placeholder = "Ketik di sini...",
  icon = "✏️",
) {
  return showCustomDialog({
    type: "prompt",
    message,
    defaultValue,
    title,
    placeholder,
    icon,
  });
};

window.showCustomDialog = showCustomDialog;
window.handleCustomDialogConfirm = handleCustomDialogConfirm;
window.handleCustomDialogCancel = handleCustomDialogCancel;
