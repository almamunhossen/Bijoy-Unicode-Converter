/**
 * theme.js - UI, theming, and real-time conversion (no keyboard input)
 * Depends on `conver.js` for conversion functions.
 */

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

function debounce(func, delay) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(context, args);
    }, delay);
  };
}

function updateEditorMeta(elementId, characterCount) {
  var meta = document.getElementById(elementId);
  if (!meta) return;
  var countNode = meta.querySelector(".editor-count");
  var stateNode = meta.querySelector(".editor-state");
  if (countNode) countNode.textContent = characterCount + " chars";
  if (stateNode) stateNode.textContent = characterCount > 0 ? "Ready" : "Empty";
}

function setCurrentDirection(directionText) {
  var dirNode = document.getElementById("conversion-direction");
  if (dirNode) dirNode.textContent = directionText;
}

function setConversionStatus(message, directionText) {
  var statusText = document.getElementById("converter-status-text");
  if (statusText) statusText.textContent = message;
  if (directionText) setCurrentDirection(directionText);
}

function showToast(message, isError) {
  var toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.backgroundColor = isError
    ? "rgba(220,38,38,0.95)"
    : "var(--secondary)";
  toast.classList.add("show");
  setTimeout(function () {
    toast.classList.remove("show");
  }, 3000);
}

function clearInput() {
  var unicode = document.getElementById("EDT");
  var bijoy = document.getElementById("CONVERTEDT");
  var unicodeM = document.getElementById("EDT-mobile");
  var bijoyM = document.getElementById("CONVERTEDT-mobile");

  if (unicode) unicode.value = "";
  if (bijoy) bijoy.value = "";
  if (unicodeM) unicodeM.value = "";
  if (bijoyM) bijoyM.value = "";

  if (unicode) unicode.focus();

  updateEditorMeta("unicode-stats", 0);
  updateEditorMeta("bijoy-stats", 0);
  setConversionStatus("Both editors cleared.", "Waiting for input");
  showToast("Text cleared");

  var statusPill = document.querySelector(".status-pill");
  if (statusPill) statusPill.textContent = "Ready";
}

// ===============================================
// CONVERSION TRIGGERS (uses global functions from conver.js)
// ===============================================

function convertFromTextArea(idcvt) {
  var str = document.getElementById(idcvt).value;
  var convertedStr = ConvertToUnicode("bijoy", str);
  var unicodeTextarea = document.getElementById("EDT");
  var unicodeMobile = document.getElementById("EDT-mobile");
  if (unicodeTextarea) unicodeTextarea.value = convertedStr;
  if (unicodeMobile) unicodeMobile.value = convertedStr;
  updateEditorMeta(
    "unicode-stats",
    unicodeTextarea ? unicodeTextarea.value.length : 0
  );
  setCurrentDirection("Bijoy → Unicode active");
  setConversionStatus("Converted Bijoy text to Unicode.");
}

function convertToTextArea(idcvt) {
  var str =
    document.getElementById("EDT").value ||
    document.getElementById("EDT-mobile").value;
  var convertedStr = ConvertToASCII("bijoy", str);
  var bijoyTextarea = document.getElementById(idcvt);
  var bijoyMobile = document.getElementById("CONVERTEDT-mobile");
  if (bijoyTextarea) bijoyTextarea.value = convertedStr;
  if (bijoyMobile) bijoyMobile.value = convertedStr;
  updateEditorMeta(
    "bijoy-stats",
    bijoyTextarea ? bijoyTextarea.value.length : 0
  );
  setCurrentDirection("Unicode → Bijoy active");
  setConversionStatus("Converted Unicode text to Bijoy.");
}

// ===============================================
// DOM CONTENT LOADED – ATTACH EVENT LISTENERS
// ===============================================

document.addEventListener("DOMContentLoaded", function () {
  // ----- Theme toggle -----
  var savedTheme = localStorage.getItem("theme");
  var systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    document.documentElement.classList.add("dark");
  }
  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      document.documentElement.classList.toggle("dark");
      if (document.documentElement.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
      } else {
        localStorage.setItem("theme", "light");
      }
    });
  }

  // ----- Mobile tabs -----
  var tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      tabButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });
      document.querySelectorAll(".tab-pane").forEach(function (pane) {
        pane.classList.remove("active");
      });
      this.classList.add("active");
      var tabId = this.getAttribute("data-tab") + "-tab";
      document.getElementById(tabId).classList.add("active");
    });
  });

  // ----- Textarea elements -----
  var unicodeTextarea = document.getElementById("EDT");
  var unicodeTextareaMobile = document.getElementById("EDT-mobile");
  var bijoyTextarea = document.getElementById("CONVERTEDT");
  var bijoyTextareaMobile = document.getElementById("CONVERTEDT-mobile");
  var unicodeButton = document.getElementById("unicode-to-bijoy-btn");
  var bijoyButton = document.getElementById("bijoy-to-unicode-btn");

  // Debounced conversion functions
  var convertUnicodeLive = debounce(function () {
    if (
      !unicodeTextarea.value.trim() &&
      !unicodeTextareaMobile.value.trim()
    ) {
      setConversionStatus("Unicode editor is empty.", "Waiting for input");
      return;
    }
    convertToTextArea("CONVERTEDT");
    setConversionStatus(
      "Unicode converted to Bijoy preview.",
      "Unicode → Bijoy active"
    );
  }, 250);

  var convertBijoyLive = debounce(function () {
    if (!bijoyTextarea.value.trim() && !bijoyTextareaMobile.value.trim()) {
      setConversionStatus("Bijoy editor is empty.", "Waiting for input");
      return;
    }
    convertFromTextArea("CONVERTEDT");
    setConversionStatus(
      "Bijoy converted to Unicode preview.",
      "Bijoy → Unicode active"
    );
  }, 250);

  function updateEditorState() {
    var unicodeValue = unicodeTextarea ? unicodeTextarea.value.trim() : "";
    var bijoyValue = bijoyTextarea ? bijoyTextarea.value.trim() : "";
    if (unicodeTextarea)
      updateEditorMeta("unicode-stats", unicodeTextarea.value.length);
    if (bijoyTextarea)
      updateEditorMeta("bijoy-stats", bijoyTextarea.value.length);
    if (unicodeButton) unicodeButton.disabled = !unicodeValue;
    if (bijoyButton) bijoyButton.disabled = !bijoyValue;
    var activeState = unicodeValue || bijoyValue ? "Live" : "Ready";
    var statusPill = document.querySelector(".status-pill");
    if (statusPill) statusPill.textContent = activeState;
    if (unicodeValue && !bijoyValue)
      setCurrentDirection("Unicode → Bijoy active");
    else if (bijoyValue && !unicodeValue)
      setCurrentDirection("Bijoy → Unicode active");
    else if (unicodeValue && bijoyValue)
      setCurrentDirection("Dual editor active");
    else setCurrentDirection("Waiting for input");
  }

  function syncDesktopAndMobile(source, target) {
    if (source && target) target.value = source.value;
  }

  // Sync Unicode textareas
  if (unicodeTextarea && unicodeTextareaMobile) {
    unicodeTextarea.addEventListener("input", function () {
      syncDesktopAndMobile(this, unicodeTextareaMobile);
      setCurrentDirection("Unicode → Bijoy active");
      updateEditorState();
      convertUnicodeLive();
    });
    unicodeTextareaMobile.addEventListener("input", function () {
      syncDesktopAndMobile(this, unicodeTextarea);
      setCurrentDirection("Unicode → Bijoy active");
      updateEditorState();
      convertUnicodeLive();
    });
  }

  // Sync Bijoy textareas
  if (bijoyTextarea && bijoyTextareaMobile) {
    bijoyTextarea.addEventListener("input", function () {
      syncDesktopAndMobile(this, bijoyTextareaMobile);
      setCurrentDirection("Bijoy → Unicode active");
      updateEditorState();
      convertBijoyLive();
    });
    bijoyTextareaMobile.addEventListener("input", function () {
      syncDesktopAndMobile(this, bijoyTextarea);
      setCurrentDirection("Bijoy → Unicode active");
      updateEditorState();
      convertBijoyLive();
    });
  }

  // ----- Copy buttons -----
  var copyButtons = document.querySelectorAll(".copy-btn");
  copyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var targetId = this.getAttribute("data-target");
      var textarea = document.getElementById(targetId);
      if (textarea && textarea.value) {
        var copyLabel = textarea.id.includes("EDT")
          ? "Unicode"
          : "Bijoy / ANSI";
        navigator.clipboard
          .writeText(textarea.value)
          .then(function () {
            button.classList.add("copied");
            showToast(copyLabel + " copied to clipboard!");
            setTimeout(function () {
              button.classList.remove("copied");
            }, 1500);
          })
          .catch(function () {
            showToast("Failed to copy text", true);
          });
      }
    });
  });

  // ----- Clear button -----
  var clearBtn = document.getElementById("clear-btn");
  if (clearBtn) clearBtn.addEventListener("click", clearInput);

  // Create toast element if missing
  if (!document.querySelector(".toast")) {
    var toastDiv = document.createElement("div");
    toastDiv.className = "toast";
    document.body.appendChild(toastDiv);
  }

  // Initial state
  updateEditorState();
  setConversionStatus(
    "Paste or type Bengali text in either editor and click convert."
  );

  // Optional: set default font for textareas (preserved from original)
  var myFld = document.getElementById("EDT");
  var convertarea = document.getElementById("CONVERTEDT");
  if (myFld) {
    myFld.style.width = "400px";
    myFld.style.fontFamily = "SolaimanLipi, Siyam Rupali, Kalpurush, sans-serif";
  }
  if (convertarea) {
    convertarea.style.width = "400px";
    convertarea.style.fontFamily = "SutonnyMJ, Siyam Rupali, monospace";
  }
});

// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear(); 