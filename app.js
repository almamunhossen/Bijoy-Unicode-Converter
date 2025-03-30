// Theme toggle functionality
document.addEventListener("DOMContentLoaded", function () {
  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    document.documentElement.classList.add("dark");
  }

  // Theme toggle button
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", function () {
    document.documentElement.classList.toggle("dark");

    // Save preference
    if (document.documentElement.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  // Mobile tabs functionality
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons and panes
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-pane")
        .forEach((pane) => pane.classList.remove("active"));

      // Add active class to clicked button and corresponding pane
      this.classList.add("active");
      const tabId = this.getAttribute("data-tab") + "-tab";
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Sync mobile and desktop textareas
  const unicodeTextarea = document.getElementById("EDT");
  const unicodeTextareaMobile = document.getElementById("EDT-mobile");
  const bijoyTextarea = document.getElementById("CONVERTEDT");
  const bijoyTextareaMobile = document.getElementById("CONVERTEDT-mobile");

  // Sync Unicode textareas
  unicodeTextarea.addEventListener("input", function () {
    unicodeTextareaMobile.value = this.value;
  });

  unicodeTextareaMobile.addEventListener("input", function () {
    unicodeTextarea.value = this.value;
  });

  // Sync Bijoy textareas
  bijoyTextarea.addEventListener("input", function () {
    bijoyTextareaMobile.value = this.value;
  });

  bijoyTextareaMobile.addEventListener("input", function () {
    bijoyTextarea.value = this.value;
  });

  // Copy button functionality
  const copyButtons = document.querySelectorAll(".copy-btn");
  copyButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const textarea = document.getElementById(targetId);

      if (textarea && textarea.value) {
        // Copy text to clipboard
        navigator.clipboard
          .writeText(textarea.value)
          .then(() => {
            // Visual feedback
            this.classList.add("copied");

            // Create toast notification
            showToast("Text copied to clipboard!");

            // Reset button state after a short delay
            setTimeout(() => {
              this.classList.remove("copied");
            }, 1500);
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
            showToast("Failed to copy text", true);
          });
      }
    });
  });

  // Create toast element if it doesn't exist
  if (!document.querySelector(".toast")) {
    const toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
});

// Function to show toast notification
function showToast(message, isError = false) {
  const toast = document.querySelector(".toast");
  if (toast) {
    toast.textContent = message;
    if (isError) {
      toast.style.backgroundColor = "var(--destructive)";
    } else {
      toast.style.backgroundColor = "var(--secondary)";
    }

    toast.classList.add("show");

    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}

// Function to clear both text areas
function clearInput() {
  const unicodeTextarea = document.getElementById("EDT");
  const bijoyTextarea = document.getElementById("CONVERTEDT");
  const unicodeTextareaMobile = document.getElementById("EDT-mobile");
  const bijoyTextareaMobile = document.getElementById("CONVERTEDT-mobile");

  if (unicodeTextarea) unicodeTextarea.value = "";
  if (bijoyTextarea) bijoyTextarea.value = "";
  if (unicodeTextareaMobile) unicodeTextareaMobile.value = "";
  if (bijoyTextareaMobile) bijoyTextareaMobile.value = "";

  if (unicodeTextarea) unicodeTextarea.focus();
}

// Function to convert from Bijoy to Unicode
function convertFromTextArea(idcvt) {
  const str = document.getElementById(idcvt).value;
  const convertedStr = ConvertToUnicode("bijoy", str);

  const unicodeTextarea = document.getElementById("EDT");
  const unicodeTextareaMobile = document.getElementById("EDT-mobile");

  if (unicodeTextarea) unicodeTextarea.value = convertedStr;
  if (unicodeTextareaMobile) unicodeTextareaMobile.value = convertedStr;
}

// Function to convert from Unicode to Bijoy
function convertToTextArea(idcvt) {
  const str =
    document.getElementById("EDT").value ||
    document.getElementById("EDT-mobile").value;
  const convertedStr = ConvertToASCII("bijoy", str);

  const bijoyTextarea = document.getElementById(idcvt);
  const bijoyTextareaMobile = document.getElementById("CONVERTEDT-mobile");

  if (bijoyTextarea) bijoyTextarea.value = convertedStr;
  if (bijoyTextareaMobile) bijoyTextareaMobile.value = convertedStr;
}

// ===============================================
// CONVERSION FUNCTIONS
// ===============================================

function ClearInput() {
  document.getElementById("EDT").value = "";
  document.getElementById("CONVERTEDT").value = "";
  document.getElementById("EDT").focus();
}

//bijoy2uni stat hear
var bijoy_string_conversion_map = {
  "i¨": "র‌্য",
  "ª¨": "্র্য",
  "°": "ক্ক",
  "±": "ক্ট",
  "³": "ক্ত",
  "K¡": "ক্ব",
  "¯Œ": "স্ক্র",
  µ: "ক্র",
  "K¬": "ক্ল",
  "¶": "ক্ষ",
  ÿ: "ক্ষ",
  "·": "ক্স",
  "¸": "গু",
  "»": "গ্ধ",
  Mœ: "গ্ন",
  "M¥": "গ্ম",
  "M­": "গ্ল",
  "¼": "ঙ্ক",
  "•¶": "ঙ্ক্ষ",
  "•L": "ঙ্খ",
  "½": "ঙ্গ",
  "•N": "ঙ্ঘ",
  "•": "ক্স",
  "”P": "চ্চ",
  "”Q": "চ্ছ",
  "”Q¡": "চ্ছ্ব",
  "”T": "চ্ঞ",
  "¾¡": "জ্জ্ব",
  "¾": "জ্জ",
  À: "জ্ঝ",
  Á: "জ্ঞ",
  "R¡": "জ্ব",
  Â: "ঞ্চ",
  Ã: "ঞ্ছ",
  Ä: "ঞ্জ",
  Å: "ঞ্ঝ",
  Æ: "ট্ট",
  "U¡": "ট্ব",
  "U¥": "ট্ম",
  Ç: "ড্ড",
  È: "ণ্ট",
  É: "ণ্� ",
  Ý: "ন্স",
  Ê: "ণ্ড",
  "š‘": "ন্তু",
  "Y\\^": "ণ্ব",
  Ë: "ত্ত",
  "Ë¡": "ত্ত্ব",
  Ì: "ত্থ",
  "Z¥": "ত্ম",
  "š—¡": "ন্ত্ব",
  "Z¡": "ত্ব",
  Î: "ত্র",
  "_¡": "থ্ব",
  "˜M": "দ্গ",
  "˜N": "দ্ঘ",
  Ï: "দ্দ",
  "×": "দ্ধ",
  "˜¡": "দ্ব",
  Ø: "দ্ব",
  "™¢": "দ্ভ",
  Ù: "দ্ম",
  "`ª“": "দ্রু",
  aŸ: "ধ্ব",
  "a¥": "ধ্ম",
  "›U": "ন্ট",
  Ú: "ন্� ",
  Û: "ন্ড",
  šÍ: "ন্ত",
  "š—": "ন্ত",
  "š¿": "ন্ত্র",
  "š’": "ন্থ",
  "›`": "ন্দ",
  "›Ø": "ন্দ্ব",
  Ü: "ন্ধ",
  bœ: "ন্ন",
  "š\\^": "ন্ব",
  "b¥": "ন্ম",
  Þ: "প্ট",
  ß: "প্ত",
  cœ: "প্ন",
  "� ": "প্প",
  cø: "প্ল",
  "c­": "প্ল",
  á: "প্স",
  "d¬": "ফ্ল",
  â: "ব্জ",
  ã: "ব্দ",
  ä: "ব্ধ",
  eŸ: "ব্ব",
  "e­": "ব্ল",
  å: "ভ্র",
  gœ: "ম্ন",
  "¤ú": "ম্প",
  ç: "ম্ফ",
  "¤\\^": "ম্ব",
  "¤¢": "ম্ভ",
  "¤£": "ম্ভ্র",
  "¤§": "ম্ম",
  "¤­": "ম্ল",
  "i“": "রু",
  iæ: "রু",
  iƒ: "রূ",
  é: "ল্ক",
  ê: "ল্গ",
  ë: "ল্ট",
  ì: "ল্ড",
  í: "ল্প",
  î: "ল্ফ",
  "j¦": "ল্ব",
  "j¥": "ল্ম",
  jø: "ল্ল",
  ï: "শু",
  ð: "শ্চ",
  kœ: "শ্ন",
  kø: "শ্ল",
  "k¦": "শ্ব",
  "k¥": "শ্ম",
  "k­": "শ্ল",
  "®‹": "ষ্ক",
  "®Œ": "ষ্ক্র",
  ó: "ষ্ট",
  ô: "ষ্� ",
  ò: "ষ্ণ",
  "®ú": "ষ্প",
  õ: "ষ্ফ",
  "®§": "ষ্ম",
  "¯‹": "স্ক",
  "÷": "স্ট",
  ö: "স্খ",
  "¯—": "স্ত",
  "¯Í": "স্ত",
  "¯‘": "স্তু",
  "¯¿": "স্ত্র",
  "¯’": "স্থ",
  mœ: "স্ন",
  "¯ú": "স্প",
  ù: "স্ফ",
  "¯\\^": "স্ব",
  "¯§": "স্ম",
  "¯­": "স্ল",
  û: "হু",
  nè: "হ্ণ",
  ý: "হ্ন",
  þ: "হ্ম",
  "n¬": "হ্ল",
  ü: "হৃ",
  "©": "র্",
  Av: "আ",
  A: "অ",
  B: "ই",
  C: "ঈ",
  D: "উ",
  E: "ঊ",
  F: "ঋ",
  G: "এ",
  H: "ঐ",
  I: "ও",
  J: "ঔ",
  K: "ক",
  L: "খ",
  M: "গ",
  N: "ঘ",
  O: "ঙ",
  P: "চ",
  Q: "ছ",
  R: "জ",
  S: "ঝ",
  T: "ঞ",
  U: "ট",
  V: "� ",
  W: "ড",
  X: "ঢ",
  Y: "ণ",
  Z: "ত",
  _: "থ",
  "`": "দ",
  a: "ধ",
  b: "ন",
  c: "প",
  d: "ফ",
  e: "ব",
  f: "ভ",
  g: "ম",
  h: "য",
  i: "র",
  j: "ল",
  k: "শ",
  l: "ষ",
  m: "স",
  n: "হ",
  o: "ড়",
  p: "ঢ়",
  q: "য়",
  r: "ৎ",
  0: "০",
  1: "১",
  2: "২",
  3: "৩",
  4: "৪",
  5: "৫",
  6: "৬",
  7: "৭",
  8: "৮",
  9: "৯",
  v: "া",
  w: "ি",
  x: "ী",
  y: "ু",
  z: "ু",
  "~": "ূ",
  "„": "ৃ",
  "‡": "ে",
  "� ": "ে",
  "‰": "ৈ",
  "\\ˆ": "ৈ",
  "� ": "ৗ",
  Ô: "‘",
  Õ: "’",
  "\\|": "।",
  Ò: "“",
  Ó: "”",
  s: "ং",
  t: "ঃ",
  u: "ঁ",
  ª: "্র",
  Ö: "্র",
  "«": "্র",
  "¨": "্য",
  "\\&": "্",
  "…": "ৃ",
  "†": "ে",
  "¤œ": "ম্ন",
  "‡¤œv": "ম্নো",
  V: "ঠ",
};
var somewherein_string_conversion_map = {
  "ª¨": "্র্য",
  "i¨": "র‌্য",
  "°": "ক্ক",
  "±": "ক্ট",
  "³": "ক্ত",
  "K¡": "ক্ব",
  "¯Œ": "স্ক্র",
  µ: "ক্র",
  "K¬": "ক্ল",
  "¶": "ক্ষ",
  "·": "ক্স",
  "¸": "গু",
  "»": "গ্ধ",
  Mœ: "গ্ন",
  "M¥": "গ্ম",
  "M­": "গ্ল",
  "¼": "ঙ্ক",
  "•¶": "ঙ্ক্ষ",
  "•L": "ঙ্খ",
  "½": "ঙ্গ",
  "•N": "ঙ্ঘ",
  "•": "ক্স",
  "”P": "চ্চ",
  "”Q": "চ্ছ",
  "”Q¡": "চ্ছ্ব",
  "”T": "চ্ঞ",
  "¾¡": "জ্জ্ব",
  "¾": "জ্জ",
  À: "জ্ঝ",
  Á: "জ্ঞ",
  "R¡": "জ্ব",
  Â: "ঞ্চ",
  Ã: "ঞ্ছ",
  Ä: "ঞ্জ",
  Å: "ঞ্ঝ",
  Æ: "ট্ট",
  "U¡": "ট্ব",
  "U¥": "ট্ম",
  Ç: "ড্ড",
  È: "ণ্ট",
  É: "ণ্� ",
  Ý: "ন্স",
  Ê: "ণ্ড",
  "š‘": "ন্তু",
  "Y\\^": "ণ্ব",
  Ë: "ত্ত",
  "Ë¡": "ত্ত্ব",
  Ì: "ত্থ",
  "Z¥": "ত্ম",
  "š—¡": "ন্ত্ব",
  "Z¡": "ত্ব",
  Î: "ত্র",
  "_¡": "থ্ব",
  "˜M": "দ্গ",
  "˜N": "দ্ঘ",
  Ï: "দ্দ",
  "×": "দ্ধ",
  "˜¡": "দ্ব",
  Ø: "দ্ব",
  "™¢": "দ্ভ",
  Ù: "দ্ম",
  "`ª“": "দ্রু",
  aŸ: "ধ্ব",
  "a¥": "ধ্ম",
  "›U": "ন্ট",
  Û: "ন্ড",
  šÍ: "ন্ত",
  "š—": "ন্ত",
  "š¿": "ন্ত্র",
  "š’": "ন্থ",
  "›`": "ন্দ",
  "›Ø": "ন্দ্ব",
  Ü: "ন্ধ",
  bœ: "ন্ন",
  "š\\^": "ন্ব",
  "b¥": "ন্ম",
  Þ: "প্ট",
  ß: "প্ত",
  cœ: "প্ন",
  "� ": "প্প",
  cø: "প্ল",
  "c­": "প্ল",
  á: "প্স",
  "d¬": "ফ্ল",
  â: "ব্জ",
  ã: "ব্দ",
  ä: "ব্ধ",
  eŸ: "ব্ব",
  "e­": "ব্ল",
  å: "ভ্র",
  gœ: "ম্ন",
  "¤ú": "ম্প",
  ç: "ম্ফ",
  "¤\\^": "ম্ব",
  "¤¢": "ম্ভ",
  "¤£": "ম্ভ্র",
  "¤§": "ম্ম",
  "¤­": "ম্ল",
  "i“": "রু",
  iæ: "রু",
  iƒ: "রূ",
  é: "ল্ক",
  ê: "ল্গ",
  ë: "ল্ট",
  ì: "ল্ড",
  í: "ল্প",
  î: "ল্ফ",
  "j¦": "ল্ব",
  "j¥": "ল্ম",
  "j­": "ল্ল",
  ï: "শু",
  ð: "শ্চ",
  kœ: "শ্ন",
  "k¦": "শ্ব",
  "k¥": "শ্ম",
  "k­": "শ্ল",
  "®‹": "ষ্ক",
  "®Œ": "ষ্ক্র",
  ó: "ষ্ট",
  ô: "ষ্� ",
  ò: "ষ্ণ",
  "®ú": "ষ্প",
  õ: "ষ্ফ",
  "®§": "ষ্ম",
  "¯‹": "স্ক",
  "÷": "স্ট",
  ö: "স্খ",
  "¯—": "স্ত",
  "¯‘": "স্তু",
  "¯¿": "স্ত্র",
  "¯’": "স্থ",
  mœ: "স্ন",
  "¯ú": "স্প",
  ù: "স্ফ",
  "¯\\^": "স্ব",
  "¯§": "স্ম",
  "¯­": "স্ল",
  nè: "হ্ণ",
  ý: "হ্ন",
  þ: "হ্ম",
  û: "হু",
  "n¬": "হ্ল",
  ü: "হৃ",
  "©": "র্",
  Av: "আ",
  A: "অ",
  B: "ই",
  C: "ঈ",
  D: "উ",
  E: "ঊ",
  F: "ঋ",
  G: "এ",
  H: "ঐ",
  I: "ও",
  J: "ঔ",
  K: "ক",
  L: "খ",
  M: "গ",
  N: "ঘ",
  O: "ঙ",
  P: "চ",
  Q: "ছ",
  R: "জ",
  S: "ঝ",
  T: "ঞ",
  U: "ট",
  V: "� ",
  W: "ড",
  X: "ঢ",
  Y: "ণ",
  Z: "ত",
  _: "থ",
  "`": "দ",
  a: "ধ",
  b: "ন",
  c: "প",
  d: "ফ",
  e: "ব",
  f: "ভ",
  g: "ম",
  h: "য",
  i: "র",
  j: "ল",
  k: "শ",
  l: "ষ",
  m: "স",
  n: "হ",
  o: "ড়",
  p: "ঢ়",
  q: "য়",
  r: "ৎ",
  0: "০",
  1: "১",
  2: "২",
  3: "৩",
  4: "৪",
  5: "৫",
  6: "৬",
  7: "৭",
  8: "৮",
  9: "৯",
  v: "া",
  w: "ি",
  x: "ী",
  y: "ু",
  z: "ু",
  "~": "ূ",
  "„": "ৃ",
  "‡": "ে",
  "� ": "ে",
  "‰": "ৈ",
  "\\ˆ": "ৈ",
  "� ": "ৗ",
  s: "ং",
  t: "ঃ",
  u: "ঁ",
  ª: "্র",
  Ö: "্র",
  "«": "্র",
  "¨": "্য",
  "…": "ৃ",
  Ô: "‘",
  Õ: "’",
  "\\|": "।",
  "\\&": "্",
  Ò: "“",
  Ó: "”",
  "†": "ে",
  "¤œ": "ম্ন",
  V: "ঠ",
};
var boisakhi_string_conversion_map = {
  Ûø: "্র্য",
  kø: "র‌্য",
  "~": "ক্ক",
  ƒ: "ক্ট",
  "£ß": "ক্ত",
  Kò: "ক্ব",
  Ç: "স্ক্র",
  "¢ß": "ক্র",
  qô: "ক্ষ্ম",
  q: "ক্ষ",
  "…": "ক্স",
  "•": "ক্স",
  Kõ: "ক্ল",
  "� ": "গু",
  "‡": "গ্গ",
  ˆ: "গ্ধ",
  Mí: "গ্ন",
  Mô: "গ্ম",
  Mö: "গ্ল",
  "‰": "ঙ্ক",
  áq: "ঙ্ক্ষ",
  áL: "ঙ্খ",
  "� ": "ঙ্গ",
  áN: "ঙ্ঘ",
  âP: "চ্চ",
  âQ: "চ্ছ",
  âQò: "চ্ছ্ব",
  Œò: "জ্জ্ব",
  Œ: "জ্জ",
  š: "জ্ঞ",
  Rò: "জ্ব",
  é: "ঞ্চ",
  "˜": "ঞ্ছ",
  "™": "ঞ্জ",
  ã: "ঞ্ঝ",
  "›": "ট্ট",
  Uò: "ট্ব",
  Uô: "ট্ম",
  œ: "ড্ড",
  Ÿ: "ণ্� ",
  Ý: "ন্স",
  "¡": "ণ্ড",
  "š‘": "ন্তু",
  ìç: "ন্তু",
  ìÿ: "ন্থ",
  Yð: "ণ্ব",
  ª: "ন্� ",
  "£ò": "ত্ত্ব",
  "¤": "ত্থ",
  Zí: "ত্ন",
  "£ô": "ত্ম",
  Zô: "ত্ম",
  "£": "ত্ত",
  Zò: "ত্ব",
  "¢": "ত্র",
  aò: "থ্ব",
  "¥": "দ্দ",
  "¦": "দ্ধ",
  "§": "দ্ব",
  "¨": "দ্ভ",
  bô: "দ্ম",
  cµ: "ধ্ব",
  ëU: "ন্ট",
  åU: "ন্ট",
  "«": "ন্ড",
  ìæ: "ন্ত",
  ìòæ: "ন্ত্ব",
  ìè: "ন্ত্র",
  ëb: "ন্দ",
  "ë§": "ন্দ্ব",
  "¬": "ন্ধ",
  ëc: "ন্ধ",
  Ò: "ন্ন",
  dí: "ন্ন",
  ìñ: "ন্ব",
  dô: "ন্ম",
  ëo: "ন্স",
  ïU: "প্ট",
  "®": "প্ত",
  eí: "প্ন",
  "¯": "প্প",
  eö: "প্ল",
  "d¬": "ফ্ল",
  fõ: "ফ্ল",
  "±": "ব্জ",
  "²": "ব্দ",
  "³": "ব্ধ",
  gµ: "ব্ব",
  gö: "ব্ল",
  gõ: "ব্ল",
  "»": "ম্ভ্র",
  "ó¸": "ম্ভ্র",
  "¸": "ভ্র",
  ií: "ম্ন",
  óe: "ম্প",
  óf: "ম্ফ",
  "¹": "ম্ব",
  º: "ম্ভ",
  ói: "ম্ম",
  óö: "ম্ল",
  "¿": "ল্ক",
  ùM: "ল্গ",
  ùU: "ল্ট",
  À: "ল্ড",
  ùe: "ল্প",
  ùf: "ল্ফ",
  lð: "ল্ব",
  lô: "ল্ম",
  Á: "ল্ল",
  lö: "ল্ল",
  lõ: "ল্ল",
  Â: "শু",
  úP: "শ্চ",
  mí: "শ্ন",
  mð: "শ্ব",
  mô: "শ্ম",
  mö: "শ্ল",
  ûK: "ষ্ক",
  "û¢ß": "ষ্ক্র",
  Ä: "ষ্ট",
  Å: "ষ্� ",
  ûe: "ষ্প",
  üf: "ষ্ফ",
  ûô: "ষ্ম",
  Æ: "স্ক",
  ýL: "স্খ",
  ýU: "স্ট",
  þU: "স্ট",
  þÿ: "স্খ",
  þæ: "স্ত",
  þç: "স্তু",
  þè: "স্ত্র",
  þí: "স্ন",
  oí: "স্ন",
  þe: "স্প",
  ýf: "স্ফ",
  È: "স্ব",
  þñ: "স্ব",
  þô: "স্ম",
  É: "হু",
  pî: "হ্ণ",
  pß: "হ্ন",
  Ê: "হ্ম",
  "n¬": "হ্ল",
  põ: "হ্ল",
  pÕ: "হৃ",
  ò: "ব",
  Aw: "আ",
  A: "অ",
  B: "ই",
  C: "ঈ",
  D: "উ",
  E: "ঊ",
  F: "ঋ",
  G: "এ",
  H: "ঐ",
  I: "ও",
  J: "ঔ",
  K: "ক",
  L: "খ",
  M: "গ",
  N: "ঘ",
  O: "ঙ",
  P: "চ",
  Q: "ছ",
  R: "জ",
  S: "ঝ",
  T: "ঞ",
  U: "ট",
  V: "� ",
  W: "ড",
  X: "ঢ",
  Y: "ণ",
  Z: "ত",
  "¤": "থ",
  b: "দ",
  c: "ধ",
  d: "ন",
  e: "প",
  f: "ফ",
  g: "ব",
  h: "ভ",
  i: "ম",
  j: "য",
  k: "র",
  l: "ল",
  m: "শ",
  n: "ষ",
  o: "স",
  p: "হ",
  r: "ড়",
  s: "ঢ়",
  t: "য়",
  a: "থ",
  u: "ৎ",
  0: "০",
  1: "১",
  2: "২",
  3: "৩",
  4: "৪",
  5: "৫",
  6: "৬",
  7: "৭",
  8: "৮",
  9: "৯",
  w: "া",
  x: "ি",
  y: "ী",
  "×": "ু",
  Ö: "ু",
  Ø: "ু",
  Ô: "ূ",
  Õ: "ূ",
  Ó: "ূ",
  Ù: "ৃ",
  Ú: "ৃ",
  Ë: "ে",
  Ì: "ে",
  Ð: "ৈ",
  Ñ: "ৈ",
  "\\ˆ": "ৈ",
  "#": "ৗ",
  "„": "।",
  z: "্",
  v: "ং",
  "\\^": "ঁ",
  Þ: "্র",
  Û: "্র",
  ê: "র্",
  ø: "্য",
  "†": "ে",
  "¤œ": "ম্ন",
  V: "ঠ",
};
function ReArrangeUnicodeConvertedText(str) {
  for (var i = 0; i < str.length; i++) {
    if (
      i > 0 &&
      str.charAt(i) == "\u09CD" &&
      (IsBanglaKar(str.charAt(i - 1)) || IsBanglaNukta(str.charAt(i - 1))) &&
      i < str.length - 1
    ) {
      var temp = str.substring(0, i - 1);
      temp += str.charAt(i);
      temp += str.charAt(i + 1);
      temp += str.charAt(i - 1);
      temp += str.substring(i + 2, str.length);
      str = temp;
    }
    if (
      i > 0 &&
      i < str.length - 1 &&
      str.charAt(i) == "\u09CD" &&
      str.charAt(i - 1) == "\u09B0" &&
      str.charAt(i - 2) != "\u09CD" &&
      IsBanglaKar(str.charAt(i + 1))
    ) {
      var temp = str.substring(0, i - 1);
      temp += str.charAt(i + 1);
      temp += str.charAt(i - 1);
      temp += str.charAt(i);
      temp += str.substring(i + 2, str.length);
      str = temp;
    }
    if (
      i < str.length - 1 &&
      str.charAt(i) == "র" &&
      IsBanglaHalant(str.charAt(i + 1)) &&
      !IsBanglaHalant(str.charAt(i - 1))
    ) {
      var j = 1;
      while (true) {
        if (i - j < 0) break;
        if (
          IsBanglaBanjonborno(str.charAt(i - j)) &&
          IsBanglaHalant(str.charAt(i - j - 1))
        )
          j += 2;
        else if (j == 1 && IsBanglaKar(str.charAt(i - j))) j++;
        else break;
      }
      var temp = str.substring(0, i - j);
      temp += str.charAt(i);
      temp += str.charAt(i + 1);
      temp += str.substring(i - j, i);
      temp += str.substring(i + 2, str.length);
      str = temp;
      i += 1;
      continue;
    }
    if (
      i < str.length - 1 &&
      IsBanglaPreKar(str.charAt(i)) &&
      IsSpace(str.charAt(i + 1)) == false
    ) {
      var temp = str.substring(0, i);
      var j = 1;
      while (IsBanglaBanjonborno(str.charAt(i + j))) {
        if (IsBanglaHalant(str.charAt(i + j + 1))) j += 2;
        else break;
      }
      temp += str.substring(i + 1, i + j + 1);
      var l = 0;
      if (str.charAt(i) == "ে" && str.charAt(i + j + 1) == "া") {
        temp += "ো";
        l = 1;
      } else if (str.charAt(i) == "ে" && str.charAt(i + j + 1) == "ৗ") {
        temp += "ৌ";
        l = 1;
      } else temp += str.charAt(i);
      temp += str.substring(i + j + l + 1, str.length);
      str = temp;
      i += j;
    }
    if (
      i < str.length - 1 &&
      str.charAt(i) == "ঁ" &&
      IsBanglaPostKar(str.charAt(i + 1))
    ) {
      var temp = str.substring(0, i);
      temp += str.charAt(i + 1);
      temp += str.charAt(i);
      temp += str.substring(i + 2, str.length);
      str = temp;
    }
  }
  return str;
}
function ConvertToUnicode(ConvertFrom, line) {
  var conversion_map = bijoy_string_conversion_map;
  if (ConvertFrom == "bijoy") conversion_map = bijoy_string_conversion_map;
  else if (ConvertFrom == "somewherein")
    conversion_map = somewherein_string_conversion_map;
  else if (ConvertFrom == "boisakhi")
    conversion_map = boisakhi_string_conversion_map;
  for (var ascii in conversion_map) {
    var myRegExp = new RegExp(ascii, "g");
    line = line.replace(myRegExp, conversion_map[ascii]);
  }
  line = ReArrangeUnicodeConvertedText(line);
  var myRegExp = new RegExp("অা", "g");
  line = line.replace(myRegExp, "আ");
  return line;
}
//bijoy2uni end hear

//common code Start

function Insert(field, text) {
  if (document.selection) {
    field.focus();
    sel = document.selection.createRange();
    sel.text = text;
    sel.collapse(true);
    sel.select();
  } else if (field.selectionStart || field.selectionStart == "0") {
    var startPos = field.selectionStart;
    var endPos = field.selectionEnd;
    var scrollTop = field.scrollTop;
    startPos = startPos == -1 ? field.value.length : startPos;
    field.value =
      field.value.substring(0, startPos) +
      text +
      field.value.substring(endPos, field.value.length);
    field.focus();
    field.selectionStart = startPos + text.length;
    field.selectionEnd = startPos + text.length;
    field.scrollTop = scrollTop;
  } else {
    var scrollTop = field.scrollTop;
    field.value += value;
    field.focus();
    field.scrollTop = scrollTop;
  }
}
function RemoveNInsert(field, value, len) {
  if (document.selection) {
    field.focus();
    sel = document.selection.createRange();
    if (field.value.length >= len) {
      sel.moveStart("character", -1 * len);
    }
    sel.text = value;
    sel.collapse(true);
    sel.select();
  } else if (field.selectionStart || field.selectionStart == 0) {
    field.focus();
    var startPos = field.selectionStart - len;
    var endPos = field.selectionEnd;
    var scrollTop = field.scrollTop;
    startPos = startPos == -1 ? field.value.length : startPos;
    field.value =
      field.value.substring(0, startPos) +
      value +
      field.value.substring(endPos, field.value.length);
    field.focus();
    field.selectionStart = startPos + value.length;
    field.selectionEnd = startPos + value.length;
    field.scrollTop = scrollTop;
  } else {
    var scrollTop = field.scrollTop;
    field.value += value;
    field.focus();
    field.scrollTop = scrollTop;
  }
}
function capsDetect(e) {
  if (!e) e = window.event;
  if (!e) return false;
  var theKey = e.which
    ? e.which
    : e.keyCode
    ? e.keyCode
    : e.charCode
    ? e.charCode
    : 0;
  var theShift = e.shiftKey || (e.modifiers && e.modifiers & 4);
  return (
    (theKey > 64 && theKey < 91 && !theShift) ||
    (theKey > 96 && theKey < 123 && theShift)
  );
}
function HideDIV(id) {
  if (document.getElementById) {
    document.getElementById(id).style.display = "none";
  } else {
    if (document.layers) {
      document.id.display = "none";
    } else {
      document.all.id.style.display = "none";
    }
  }
}
function ShowDIV(id) {
  if (document.getElementById) {
    document.getElementById(id).style.display = "block";
  } else {
    if (document.layers) {
      document.id.display = "block";
    } else {
      document.all.id.style.display = "block";
    }
  }
}
function IsBanglaDigit(CUni) {
  if (
    CUni == "০" ||
    CUni == "১" ||
    CUni == "২" ||
    CUni == "৩" ||
    CUni == "৪" ||
    CUni == "৫" ||
    CUni == "৬" ||
    CUni == "৭" ||
    CUni == "৮" ||
    CUni == "৯"
  )
    return true;
  return false;
}
function IsBanglaPreKar(CUni) {
  if (CUni == "ি" || CUni == "ৈ" || CUni == "ে") return true;
  return false;
}
function IsBanglaPostKar(CUni) {
  if (
    CUni == "া" ||
    CUni == "ো" ||
    CUni == "ৌ" ||
    CUni == "ৗ" ||
    CUni == "ু" ||
    CUni == "ূ" ||
    CUni == "ী" ||
    CUni == "ৃ"
  )
    return true;
  return false;
}
function IsBanglaKar(CUni) {
  if (IsBanglaPreKar(CUni) || IsBanglaPostKar(CUni)) return true;
  return false;
}
function IsBanglaBanjonborno(CUni) {
  if (
    CUni == "ক" ||
    CUni == "খ" ||
    CUni == "গ" ||
    CUni == "ঘ" ||
    CUni == "ঙ" ||
    CUni == "চ" ||
    CUni == "ছ" ||
    CUni == "জ" ||
    CUni == "ঝ" ||
    CUni == "ঞ" ||
    CUni == "ট" ||
    CUni == "ঠ" ||
    CUni == "ড" ||
    CUni == "ঢ" ||
    CUni == "ণ" ||
    CUni == "ত" ||
    CUni == "থ" ||
    CUni == "দ" ||
    CUni == "ধ" ||
    CUni == "ন" ||
    CUni == "প" ||
    CUni == "ফ" ||
    CUni == "ব" ||
    CUni == "ভ" ||
    CUni == "ম" ||
    CUni == "শ" ||
    CUni == "ষ" ||
    CUni == "স" ||
    CUni == "হ" ||
    CUni == "য" ||
    CUni == "র" ||
    CUni == "ল" ||
    CUni == "য়" ||
    CUni == "ং" ||
    CUni == "ঃ" ||
    CUni == "ঁ" ||
    CUni == "ৎ"
  )
    return true;
  return false;
}
function IsBanglaSoroborno(CUni) {
  if (
    CUni == "অ" ||
    CUni == "আ" ||
    CUni == "ই" ||
    CUni == "ঈ" ||
    CUni == "উ" ||
    CUni == "ঊ" ||
    CUni == "ঋ" ||
    CUni == "ঌ" ||
    CUni == "এ" ||
    CUni == "ঐ" ||
    CUni == "ও" ||
    CUni == "ঔ"
  )
    return true;
  return false;
}
function IsBanglaNukta(CUni) {
  if (CUni == "ং" || CUni == "ঃ" || CUni == "ঁ") return true;
  return false;
}
function IsBanglaFola(CUni) {
  if (CUni == "্য" || CUni == "্র") return true;
  return false;
}
function IsBanglaHalant(CUni) {
  if (CUni == "্") return true;
  return false;
}
function IsSpace(C) {
  if (C == " " || C == "\t" || C == "\n" || C == "\r") return true;
  return false;
}
function MapKarToSorborno(CUni) {
  var CSorborno = CUni;
  if (CUni == "া") CSorborno = "আ";
  else if (CUni == "ি") CSorborno = "ই";
  else if (CUni == "ী") CSorborno = "ঈ";
  else if (CUni == "ু") CSorborno = "উ";
  else if (CUni == "ূ") CSorborno = "ঊ";
  else if (CUni == "ৃ") CSorborno = "ঋ";
  else if (CUni == "ে") CSorborno = "এ";
  else if (CUni == "ৈ") CSorborno = "ঐ";
  else if (CUni == "ো") CSorborno = "ও";
  else if (CUni == "ো") CSorborno = "ও";
  else if (CUni == "ৌ") CSorborno = "ঔ";
  else if (CUni == "ৌ") CSorborno = "ঔ";
  return CSorborno;
}
function MapSorbornoToKar(CUni) {
  var CKar = CUni;
  if (CUni == "আ") CKar = "া";
  else if (CUni == "ই") CKar = "ি";
  else if (CUni == "ঈ") CKar = "ী";
  else if (CUni == "উ") CKar = "ু";
  else if (CUni == "ঊ") CKar = "ূ";
  else if (CUni == "ঋ") CKar = "ৃ";
  else if (CUni == "এ") CKar = "ে";
  else if (CUni == "ঐ") CKar = "ৈ";
  else if (CUni == "ও") CKar = "ো";
  else if (CUni == "ঔ") CKar = "ৌ";
  return CKar;
}

//common code end

//conts stat
var MaximumCharacters = "100000";
var MaximumWords = "100000";
var FormName = "myForm";
var TextFieldName = "textarea";
var CharactersTypedFieldName = "CharsTyped";
var CharactersLeftFieldName = "CharsLeft";
var WordsTypedFieldName = "WordsTyped";
var WordsLeftFieldName = "WordsLeft";
var WordsMonitor = 0;
var MaxWords = parseInt(MaximumWords);
var MaxChars = parseInt(MaximumCharacters);
var textfield = "document." + FormName + "." + TextFieldName + ".value";
function WordLengthCheck(s, l) {
  WordsMonitor = 0;
  var f = false;
  var ts = new String();
  for (var vi = 0; vi < s.length; vi++) {
    vs = s.substr(vi, 1);
    if (
      (vs >= "A" && vs <= "Z") ||
      (vs >= "a" && vs <= "z") ||
      (vs >= "0" && vs <= "9")
    ) {
      if (f == false) {
        f = true;
        WordsMonitor++;
        if (l > 0 && WordsMonitor > l) {
          s = s.substring(0, ts.length);
          vi = s.length;
          WordsMonitor--;
        }
      }
    } else {
      f = false;
    }
    ts += vs;
  }
  return s;
}
function CharLengthCheck(s, l) {
  if (s.length > l) {
    s = s.substring(0, l);
  }
  return s;
}
function InputCharacterLengthCheck() {
  if (MaxChars <= 0) {
    return;
  }
  var currentstring = new String();
  eval("currentstring = " + textfield);
  var currentlength = currentstring.length;
  eval("currentstring = CharLengthCheck(" + textfield + "," + MaxChars + ")");
  if (CharactersLeftFieldName.length > 0) {
    var left = 0;
    eval("left = " + MaxChars + " - " + textfield + ".length");
    if (left < 0) {
      left = 0;
    }
    eval(
      "document." +
        FormName +
        "." +
        CharactersLeftFieldName +
        ".value = " +
        left
    );
    if (currentstring.length < currentlength) {
      eval(textfield + " = currentstring.substring(0)");
    }
  }
  if (CharactersTypedFieldName.length > 0) {
    eval(
      "document." +
        FormName +
        "." +
        CharactersTypedFieldName +
        ".value = " +
        textfield +
        ".length"
    );
    if (currentstring.length < currentlength) {
      eval(textfield + " = currentstring.substring(0)");
    }
  }
}
function InputWordLengthCheck() {
  if (MaxWords <= 0) {
    return;
  }
  var currentstring = new String();
  eval("currentstring = " + textfield);
  var currentlength = currentstring.length;
  eval("currentstring = WordLengthCheck(" + textfield + "," + MaxWords + ")");
  if (WordsLeftFieldName.length > 0) {
    var left = MaxWords - WordsMonitor;
    if (left < 0) {
      left = 0;
    }
    eval(
      "document." + FormName + "." + WordsLeftFieldName + ".value = " + left
    );
    if (currentstring.length < currentlength) {
      eval(textfield + " = currentstring.substring(0)");
    }
  }
  if (WordsTypedFieldName.length > 0) {
    eval(
      "document." +
        FormName +
        "." +
        WordsTypedFieldName +
        ".value = " +
        WordsMonitor
    );
    if (currentstring.length < currentlength) {
      eval(textfield + " = currentstring.substring(0)");
    }
  }
}
function InputLengthCheck() {
  InputCharacterLengthCheck();
  InputWordLengthCheck();
}
// const end

//js1 stat
var ID = "EDT";
var ConvertFrom = "bijoy";
function ChangeKeyboarLayoutStatus() {
  var field = document.getElementsByName("KeyboardLayoutOption");
  if (KeyBoardLayout == 1 || EnglishKeyboard == true) {
    field[0].checked = true;
  } else if (KeyBoardLayout == 2) {
    field[KeyBoardLayout - 1].checked = true;
  } else if (KeyBoardLayout == 3) {
    field[KeyBoardLayout - 1].checked = true;
  } else if (KeyBoardLayout == 4) {
    field[KeyBoardLayout - 1].checked = true;
  } else if (KeyBoardLayout == 5) {
    field[KeyBoardLayout - 1].checked = true;
  }
}
function ChangeConverterStatus() {
  var field = document.getElementsByName("ConversionOption");
  if (ConvertFrom == "bijoy") {
    field[0].checked = true;
  } else if (ConvertFrom == "somewherein") {
    field[1].checked = true;
  } else if (ConvertFrom == "boisakhi") {
    field[2].checked = true;
  }
}
function KeyboardLayoutOptionClick(event) {
  var field = document.getElementsByName("KeyboardLayoutOption");
  for (var counter = 0; counter < field.length; counter++) {
    if (field[counter].checked) {
      KeyBoardLayout = counter + 1;
      ChangeKeyboarLayoutStatus();
      var myFld = document.getElementById(ID);
      myFld.focus();
      break;
    }
  }
}
function ConvertFromTextArea(idcvt) {
  var str = document.getElementById(idcvt).value;
  str = ConvertToUnicode(ConvertFrom, str);
  Insert(document.getElementById(ID), str);
}
function ConvertToTextArea(idcvt) {
  var str = document.getElementById(ID).value;
  str = ConvertToASCII(ConvertFrom, str);
  Insert(document.getElementById(idcvt), str);
}
function ClearTextArea(idtxt) {
  var elem = document.getElementById(idtxt);
  elem.value = "";
  elem.focus();
}
function ChangeConvertOptionStatus() {
  var field = document.getElementsByName("ConversionOption");
  var convertarea = document.getElementById("CONVERTEDT");
  if (ConvertFrom == "bijoy") {
    convertarea.style.fontFamily = "SutonnyMJ";
    convertarea.style.fontSize = "14pt";
    convertarea.style.width = 400;
    field[0].checked = true;
  } else if (ConvertFrom == "somewherein") {
    convertarea.style.fontFamily = "SushreeMJ";
    convertarea.style.fontSize = "14pt";
    convertarea.style.width = 300;
    field[1].checked = true;
  } else if (ConvertFrom == "boisakhi") {
    convertarea.style.fontFamily = "Boishakhi";
    convertarea.style.fontSize = "12pt";
    convertarea.style.width = 300;
    field[2].checked = true;
  }
}
function ConvertOptionChange(event) {
  var field = document.getElementsByName("ConversionOption");
  for (var counter = 0; counter < field.length; counter++) {
    if (field[counter].checked) {
      if (counter == 0) ConvertFrom = "bijoy";
      else if (counter == 1) ConvertFrom = "somewherein";
      else if (counter == 2) ConvertFrom = "boisakhi";
      break;
    }
  }
  ChangeConvertOptionStatus();
}
function OnPageLoad() {
  ChangeKeyboarLayoutStatus();
  ChangeConverterStatus();
  var myFld = document.getElementById(ID);
  var unicodefontLabel = document.getElementById("unicodefont");
  if (IE) {
    unicodefontLabel.innerHTML =
      "Download the unicode font from <a href=SutonnyBanglaOMJ.ttf>here</a>.";
    myFld.style.fontFamily = "SutonnyBanglaOMJ";
  } else {
    unicodefontLabel.innerHTML =
      "Download the unicode font from <a href=SolaimanLipi_29-05-06.ttf>here</a>.";
    myFld.style.fontFamily = "SolaimanLipi";
  }
  myFld.style.width = 400;
  var convertarea = document.getElementById("CONVERTEDT");
  convertarea.style.width = 400;
}
//js1 endPos

//layout stat
var IE = document.all ? 1 : 0;
var LCUNI = 0;
var LC = 0;
var LC_KAR = 0;
var LC_STRING = "";
var EnglishKeyboard = false;
var KeyBoardLayout = 2;
var ctl_v_conversion = false;
var Avro_Cha_Flag = false;
var Avro_A_Press_Flag = false;
var bijoy_keyboard_map = {
  0: "০",
  1: "১",
  2: "২",
  3: "৩",
  4: "৪",
  5: "৫",
  6: "৬",
  7: "৭",
  8: "৮",
  9: "৯",
  a: "ৃ",
  A: "র্",
  d: "ি",
  D: "ী",
  s: "ু",
  S: "ূ",
  f: "া",
  F: "অ",
  g: "্",
  G: "।",
  h: "ব",
  H: "ভ",
  j: "ক",
  J: "খ",
  k: "ত",
  K: "থ",
  l: "দ",
  L: "ধ",
  z: "্র",
  Z: "্য",
  x: "ও",
  X: "ৗ",
  c: "ে",
  C: "ৈ",
  v: "র",
  V: "ল",
  b: "ন",
  B: "ণ",
  n: "স",
  N: "ষ",
  m: "ম",
  M: "শ",
  q: "ঙ",
  Q: "ং",
  w: "য",
  W: "য়",
  e: "ড",
  E: "ঢ",
  r: "প",
  R: "ফ",
  t: "ট",
  T: "ঠ",
  y: "চ",
  Y: "ছ",
  u: "জ",
  U: "ঝ",
  i: "হ",
  I: "ঞ",
  o: "গ",
  O: "ঘ",
  p: "ড়",
  P: "ঢ়",
  "&": "ঁ",
  $: "৳",
  "`": "\u200C",
  "~": "\u200D",
  "\\": "ৎ",
  "|": "ঃ",
};
var somewherein_phonetic_keyboard_map = {
  0: "০",
  1: "১",
  2: "২",
  3: "৩",
  4: "৪",
  5: "৫",
  6: "৬",
  7: "৭",
  8: "৮",
  9: "৯",
  a: "া",
  A: "আ",
  d: "ড",
  D: "দ",
  s: "স",
  S: "ষ",
  f: "ফ",
  F: "ঋ",
  g: "গ",
  G: "ঘ",
  h: "হ",
  H: "ঃ",
  j: "জ",
  J: "ঝ",
  k: "ক",
  K: "খ",
  l: "ল",
  L: "খ",
  z: "য",
  Z: "ত",
  x: "ক্স",
  X: "ঢ",
  c: "চ",
  C: "ছ",
  v: "ভ",
  V: "ঠ",
  b: "ব",
  B: "ই",
  n: "ন",
  N: "ণ",
  m: "ম",
  M: "গ",
  q: "য়",
  Q: "ছ",
  w: "ৃ",
  W: "ঋ",
  e: "ে",
  E: "এ",
  r: "র",
  R: "ড়",
  t: "ট",
  T: "ত",
  y: "য়",
  Y: "্য",
  u: "ু",
  U: "উ",
  i: "ি",
  I: "ই",
  o: "ো",
  O: "ও",
  p: "প",
  P: "চ",
  "&": "্",
  $: "৳",
  "+": "্",
  ".": "।",
  "`": "\u200C",
  "~": "\u200D",
  "\\": "॥",
  "|": "।",
};
var avro_phonetic_keyboard_map = {
  0: "০",
  1: "১",
  2: "২",
  3: "৩",
  4: "৪",
  5: "৫",
  6: "৬",
  7: "৭",
  8: "৮",
  9: "৯",
  o: "অ",
  a: "আ",
  A: "আ",
  i: "ই",
  I: "ঈ",
  u: "উ",
  U: "ঊ",
  e: "এ",
  E: "এ",
  O: "ও",
  d: "দ",
  D: "ড",
  s: "স",
  S: "শ",
  f: "ফ",
  g: "গ",
  h: "হ",
  H: "হ",
  j: "জ",
  J: "য",
  k: "ক",
  K: "ক",
  l: "ল",
  L: "ল",
  z: "য",
  Z: "্য",
  c: "চ",
  v: "ভ",
  V: "ভ",
  b: "ব",
  n: "ন",
  N: "ণ",
  m: "ম",
  y: "য়",
  w: "্ব",
  r: "র",
  R: "ড়",
  t: "ত",
  T: "ট",
  y: "য়",
  p: "প",
  $: "৳",
  "+": "্",
  ".": "।",
  ":": "ঃ",
  "^": "ঁ",
  "`": "্",
};
var unijoy_keyboard_map = {
  0: "০",
  1: "১",
  2: "২",
  3: "৩",
  4: "৪",
  5: "৫",
  6: "৬",
  7: "৭",
  8: "৮",
  9: "৯",
  a: "ৃ",
  A: "র্",
  d: "ি",
  D: "ী",
  s: "ু",
  S: "ূ",
  f: "া",
  F: "অ",
  g: "্",
  G: "।",
  h: "ব",
  H: "ভ",
  j: "ক",
  J: "খ",
  k: "ত",
  K: "থ",
  l: "দ",
  L: "ধ",
  z: "্র",
  Z: "্য",
  x: "ো",
  X: "ৌ",
  c: "ে",
  C: "ৈ",
  v: "র",
  V: "ল",
  b: "ন",
  B: "ণ",
  n: "স",
  N: "ষ",
  m: "ম",
  M: "শ",
  q: "ঙ",
  Q: "ং",
  w: "য",
  W: "য়",
  e: "ড",
  E: "ঢ",
  r: "প",
  R: "ফ",
  t: "ট",
  T: "ঠ",
  y: "চ",
  Y: "ছ",
  u: "জ",
  U: "ঝ",
  i: "হ",
  I: "ঞ",
  o: "গ",
  O: "ঘ",
  p: "ড়",
  P: "ঢ়",
  "&": "ঁ",
  $: "৳",
  "`": "\u200C",
  "~": "\u200D",
  "^": "÷",
  "*": "×",
  "\\": "ৎ",
  "|": "ঃ",
};
function MapUnicodeCharacter(C) {
  if (KeyBoardLayout == 2) return bijoy_keyboard_map[C];
  else if (KeyBoardLayout == 3) return somewherein_phonetic_keyboard_map[C];
  else if (KeyBoardLayout == 4) return avro_phonetic_keyboard_map[C];
  else if (KeyBoardLayout == 5) return unijoy_keyboard_map[C];
  return C;
}
function ResetKarModifier() {
  LC_KAR = 0;
  LC_STRING = "";
}
function KarModification(field, CUni) {
  if (
    LC_KAR == LCUNI ||
    IsBanglaHalant(LCUNI) ||
    CUni == "্র" ||
    CUni == "্য"
  ) {
    var len = LC_STRING.length;
    LC_STRING = LC_STRING + CUni;
    RemoveNInsert(field, LC_STRING + LC_KAR, len + LC_KAR.length);
  } else if (CUni == "র্") {
    var len = LC_STRING.length;
    LC_STRING = CUni + LC_STRING;
    RemoveNInsert(field, LC_STRING + LC_KAR, len + LC_KAR.length);
  } else if (IsBanglaHalant(CUni)) {
    LC_STRING = LC_STRING + CUni;
    Insert(field, CUni);
  } else {
    Insert(field, CUni);
    ResetKarModifier();
  }
}
function RefModification(field) {
  var len = 1;
  var kar = "";
  var str = "";
  var halant_found = true;
  var CH = "";
  field.focus();
  while (true) {
    if (document.selection) {
      sel = document.selection.createRange();
      if (field.value.length >= len) {
        sel.moveStart("character", -1 * len);
      } else {
        (CH = ""), len--;
        sel.moveStart("character", -1 * len);
        break;
      }
      CH = sel.text.charAt(0);
    } else if (field.selectionStart || field.selectionStart == 0) {
      var startPos = field.selectionStart - len;
      var endPos = field.selectionEnd;
      var scrollTop = field.scrollTop;
      if (startPos < 0) {
        (CH = ""), len--;
        startPos = field.selectionStart - len;
        break;
      }
      CH = field.value.substring(startPos, startPos + 1);
    }
    if (len != 1 && IsBanglaKar(CH)) break;
    if (len == 1 && IsBanglaKar(CH)) kar = CH;
    else if (IsBanglaSoroborno(CH) || IsBanglaDigit(CH) || IsSpace(CH)) break;
    else if (IsBanglaBanjonborno(CH)) {
      if (halant_found == true) {
        str = CH + str;
        halant_found = false;
      } else break;
    } else if (IsBanglaHalant(CH)) {
      str = CH + str;
      halant_found = true;
    }
    len++;
  }
  var line = CH + "র্" + str + kar;
  if (document.selection) {
    sel.text = line;
    sel.collapse(true);
    sel.select();
  } else if (field.selectionStart || field.selectionStart == 0) {
    field.value =
      field.value.substring(0, startPos) +
      line +
      field.value.substring(endPos, field.value.length);
    field.focus();
    field.selectionStart = startPos + line.length;
    field.selectionEnd = startPos + line.length;
    field.scrollTop = scrollTop;
  }
}
function OAndOuKarModification(field, CH1, CH2) {
  if (document.selection) {
    field.focus();
    sel = document.selection.createRange();
    if (field.value.length >= 1) sel.moveStart("character", -1);
    if (sel.text.charAt(0) == "ে") sel.text = CH1;
    else sel.text = sel.text.charAt(0) + CH2;
    sel.collapse(true);
    sel.select();
  } else if (field.selectionStart || field.selectionStart == 0) {
    var startPos = field.selectionStart - 1;
    var endPos = field.selectionEnd;
    var scrollTop = field.scrollTop;
    var CH;
    startPos = startPos == -1 ? field.value.length : startPos;
    if (field.value.substring(startPos, startPos + 1) == "ে") CH = CH1;
    else {
      startPos = startPos + 1;
      CH = CH2;
    }
    field.value =
      field.value.substring(0, startPos) +
      CH +
      field.value.substring(endPos, field.value.length);
    field.focus();
    field.selectionStart = startPos + CH.length;
    field.selectionEnd = startPos + CH.length;
    field.scrollTop = scrollTop;
  }
}
function IsSomewhereinPhoneticModifierCharaceter(CUni) {
  if (
    CUni == "হ" ||
    CUni == "গ" ||
    CUni == "ঘ" ||
    CUni == "ণ" ||
    CUni == "ঃ" ||
    CUni == "ট" ||
    CUni == "ো" ||
    CUni == "ই" ||
    CUni == "ি" ||
    CUni == "উ" ||
    CUni == "ু" ||
    CUni == "র" ||
    CUni == "ড়"
  )
    return true;
  return false;
}
function GetSomewhereinPhoneticModifiedCharaceter(CUni) {
  var CMod = CUni;
  if (LCUNI == "ক" && CUni == "হ") CMod = "খ";
  else if (LCUNI == "গ" && CUni == "হ") CMod = "ঘ";
  else if (LCUNI == "চ" && CUni == "হ") CMod = "চ";
  else if (LCUNI == "জ" && CUni == "হ") CMod = "ঝ";
  else if (LCUNI == "ট" && CUni == "হ") CMod = "ঠ";
  else if (LCUNI == "ড" && CUni == "হ") CMod = "ঢ";
  else if (LCUNI == "ত" && CUni == "হ") CMod = "থ";
  else if (LCUNI == "দ" && CUni == "হ") CMod = "ধ";
  else if (LCUNI == "প" && CUni == "হ") CMod = "ফ";
  else if (LCUNI == "ব" && CUni == "হ") CMod = "ভ";
  else if (LCUNI == "স" && CUni == "হ") CMod = "শ";
  else if (LCUNI == "ড়" && CUni == "হ") CMod = "ঢ়";
  else if (LCUNI == "ণ" && CUni == "গ") CMod = "ঙ";
  else if (LCUNI == "ন" && CUni == "গ") CMod = "ং";
  else if (LCUNI == "ণ" && CUni == "ঘ") CMod = "ঞ";
  else if (LCUNI == "ণ" && CUni == "ণ") CMod = "ঁ";
  else if (LCUNI == "ঃ" && CUni == "ঃ") CMod = "ঃ";
  else if (LCUNI == "ট" && CUni == "ট") CMod = "ৎ";
  else if (LCUNI == "া" && CUni == "ো") CMod = "অ";
  else if (LCUNI == "ি" && CUni == "ি") CMod = "ী";
  else if (LCUNI == "ই" && CUni == "ই") CMod = "ঈ";
  else if (LCUNI == "ু" && CUni == "ু") CMod = "ূ";
  else if (LCUNI == "উ" && CUni == "উ") CMod = "ঊ";
  else if (LCUNI == "ও" && CUni == "ই") CMod = "ঐ";
  else if (LCUNI == "ো" && CUni == "ি") CMod = "ৈ";
  else if (LCUNI == "ও" && CUni == "উ") CMod = "ঔ";
  else if (LCUNI == "ো" && CUni == "ু") CMod = "ৌ";
  else if (LCUNI == "ৃ" && CUni == "র") CMod = "ৃ";
  else if (LCUNI == "ঋ" && CUni == "ড়") CMod = "ঋ";
  return CMod;
}
function IsAvroPhoneticModifierCharaceter(CUni) {
  if (
    CUni == "ঃ" ||
    CUni == "ো" ||
    CUni == "ি" ||
    CUni == "ু" ||
    IsBanglaSoroborno(CUni) ||
    IsBanglaBanjonborno(CUni)
  )
    return true;
  return false;
}
function GetAvroPhoneticBanjonBanjonEquivalent(CUni1, CUni2) {
  var CMod = CUni2;
  if ((CUni1 == "ক" && CUni2 == "ক") || (CUni1 == "ক" && CUni2 == "খ"))
    CMod = "\u09CD" + CUni2;
  return CMod;
}
function GetAvroPhoneticModifiedCharaceter(CUni) {
  var CMod = CUni;
  if (CUni != "হ" && Avro_Cha_Flag == true) Avro_Cha_Flag = false;
  if (LCUNI == "ক" && CUni == "হ") CMod = "খ";
  else if (LCUNI == "গ" && CUni == "হ") CMod = "ঘ";
  else if (LCUNI == "চ" && CUni == "হ" && Avro_Cha_Flag == false) {
    CMod = "চ";
    Avro_Cha_Flag = true;
  } else if (LCUNI == "চ" && CUni == "হ" && Avro_Cha_Flag == true) {
    CMod = "ছ";
    Avro_Cha_Flag = false;
  } else if (LCUNI == "জ" && CUni == "হ") CMod = "ঝ";
  else if (LCUNI == "ট" && CUni == "হ") CMod = "ঠ";
  else if (LCUNI == "ড" && CUni == "হ") CMod = "ঢ";
  else if (LCUNI == "ত" && CUni == "হ") CMod = "থ";
  else if (LCUNI == "দ" && CUni == "হ") CMod = "ধ";
  else if (LCUNI == "প" && CUni == "হ") CMod = "ফ";
  else if (LCUNI == "ব" && CUni == "হ") CMod = "ভ";
  else if (LCUNI == "স" && CUni == "হ") CMod = "শ";
  else if (LCUNI == "শ" && CUni == "হ") CMod = "ষ";
  else if (LCUNI == "ড়" && CUni == "হ") CMod = "ঢ়";
  else if (LCUNI == "ণ" && CUni == "গ") CMod = "ঙ";
  else if (LCUNI == "ন" && CUni == "গ") CMod = "ং";
  else if (LCUNI == "ণ" && CUni == "ঘ") CMod = "ঞ";
  else if (LCUNI == "ঃ" && CUni == "ঃ") CMod = "ঃ";
  else if (LCUNI == "ট" && CUni == "ট") CMod = "ৎ";
  else if (LCUNI == "া" && CUni == "ো") CMod = "অ";
  else if (LCUNI == "ি" && CUni == "ি") CMod = "ী";
  else if (LCUNI == "ু" && CUni == "ু") CMod = "ূ";
  else if (LCUNI == "উ" && CUni == "উ") CMod = "ঊ";
  else if (LCUNI == "ও" && CUni == "ই") CMod = "ঐ";
  else if (LCUNI == "ো" && CUni == "ি") CMod = "ৈ";
  else if (LCUNI == "ও" && CUni == "উ") CMod = "ঔ";
  else if (LCUNI == "ো" && CUni == "ু") CMod = "ৌ";
  else if (LCUNI == "ৃ" && CUni == "র") CMod = "ৃ";
  else if (LCUNI == "ঋ" && CUni == "ড়") CMod = "ঋ";
  else if ((LCUNI == "র" || LCUNI == "ড়") && IsBanglaBanjonborno(CUni))
    CMod = CUni;
  else if (CUni == "ঁ") CMod = CUni;
  else if (
    IsBanglaBanjonborno(LCUNI) &&
    CUni == "অ" &&
    Avro_A_Press_Flag == false
  ) {
    Avro_A_Press_Flag = true;
    CMod = LCUNI;
  } else if (
    IsBanglaBanjonborno(LCUNI) &&
    IsBanglaSoroborno(CUni) &&
    Avro_A_Press_Flag == true
  ) {
    CMod = CUni;
  } else if (IsBanglaBanjonborno(LCUNI) && IsBanglaSoroborno(CUni))
    CMod = MapSorbornoToKar(CUni);
  else if (
    IsBanglaBanjonborno(LCUNI) &&
    IsBanglaBanjonborno(CUni) &&
    Avro_A_Press_Flag == false
  )
    CMod = "\u09CD" + CUni;
  else if (LCUNI == "অ" && CUni == "অ") CMod = "উ";
  else if (LCUNI == "অ" && CUni == "ই") CMod = "ঐ";
  else if (LCUNI == "অ" && CUni == "ই") CMod = "ঐ";
  else if (LCUNI == "া" && CUni == "অ") CMod = "ও";
  else if (LCUNI == "এ" && CUni == "এ") CMod = "ঈ";
  else if (LCUNI == "ে" && CUni == "অ") CMod = "ও";
  else if (LCUNI == "ও" && CUni == "ঈ") CMod = "ঔ";
  if (CUni != "অ" && CUni != "\u09CD" && Avro_A_Press_Flag == true)
    Avro_A_Press_Flag = false;
  return CMod;
}
function ProcessCharacter(field, C, K, CUni) {
  if (LCUNI == "‌" && CUni == "্য") {
    RemoveNInsert(field, field.value.charAt(field.value.length - 1) + "‌্য", 1);
    ResetKarModifier();
    return;
  }
  if (IsBanglaPostKar(CUni)) ResetKarModifier();
  if (IsBanglaDigit(CUni)) ResetKarModifier();
  if (LCUNI == "অ" && CUni == "া") {
    RemoveNInsert(field, "আ", 1);
    ResetKarModifier();
  } else if (IsBanglaHalant(LCUNI) && IsBanglaKar(CUni)) {
    RemoveNInsert(field, MapKarToSorborno(CUni), 1);
    ResetKarModifier();
  } else if (
    KeyBoardLayout != 5 &&
    IsBanglaNukta(LCUNI) &&
    IsBanglaPostKar(CUni) == true
  ) {
    RemoveNInsert(field, CUni + LCUNI, 1);
    ResetKarModifier();
  } else if (
    KeyBoardLayout != 5 &&
    IsBanglaNukta(LCUNI) &&
    IsBanglaFola(CUni)
  ) {
    RemoveNInsert(field, CUni + LCUNI, 1);
    ResetKarModifier();
  } else if (KeyBoardLayout == 2 && IsBanglaPreKar(LC_KAR))
    KarModification(field, CUni);
  else if (
    KeyBoardLayout == 3 &&
    IsSomewhereinPhoneticModifierCharaceter(CUni) &&
    IsSpace(LCUNI) == false
  ) {
    var CUni2 = GetSomewhereinPhoneticModifiedCharaceter(CUni);
    if (CUni2 != CUni) {
      CUni = CUni2;
      RemoveNInsert(field, CUni, 1);
      ResetKarModifier();
    } else Insert(field, CUni);
  } else if (
    KeyBoardLayout == 4 &&
    IsAvroPhoneticModifierCharaceter(CUni) &&
    IsSpace(LCUNI) == false
  ) {
    var CUni2 = GetAvroPhoneticModifiedCharaceter(CUni);
    if (CUni2 != CUni) {
      if (IsBanglaBanjonborno(LCUNI) && CUni == "হ") {
        RemoveNInsert(field, CUni2, 1);
      } else if (IsBanglaBanjonborno(LCUNI) && IsBanglaBanjonborno(CUni)) {
        Insert(field, CUni2);
      } else if (IsBanglaKar(LCUNI) && IsBanglaSoroborno(CUni)) {
        Insert(field, CUni2);
      } else if (CUni2 == MapSorbornoToKar(CUni)) {
        Insert(field, CUni2);
      } else {
        RemoveNInsert(field, CUni2, 1);
      }
      CUni = CUni2;
      ResetKarModifier();
    } else Insert(field, CUni);
  } else if (KeyBoardLayout != 5 && CUni == "র্") RefModification(field);
  else if (KeyBoardLayout != 5 && CUni == "া")
    OAndOuKarModification(field, "ো", "া");
  else if (KeyBoardLayout != 5 && CUni == "ৗ")
    OAndOuKarModification(field, "ৌ", "ৗ");
  else if (K > 29) {
    Insert(field, CUni);
  } else if (K == 13 && IE) {
    Insert(field, CUni);
  }
  if (IsBanglaHalant(LCUNI) == false && IsBanglaPreKar(CUni)) LC_KAR = CUni;
  if (!(IsBanglaNukta(LCUNI) && IsBanglaFola(CUni))) {
    LCUNI = CUni;
  }
}
function KeyBoardDown(ev) {
  var field;
  if (IE) field = ev.srcElement;
  else field = ev.target;
  var K = window.event ? event.keyCode : ev.which;
  var C = String.fromCharCode(K);
  if (K == 27) EnglishKeyboard = !EnglishKeyboard;
  if ((K >= 8 && K <= 13) || K == 27 || K == 32 || K == 46) {
    LCUNI = 0;
    ResetKarModifier();
    Avro_Cha_Flag = false;
    Avro_A_Press_Flag = false;
  }
  if (ev.altKey && ev.ctrlKey && (C == "E" || C == "e")) KeyBoardLayout = 1;
  else if (ev.altKey && ev.ctrlKey && (C == "B" || C == "b"))
    KeyBoardLayout = KeyBoardLayout == 2 ? 1 : 2;
  else if (ev.altKey && ev.ctrlKey && (C == "P" || C == "p"))
    KeyBoardLayout = KeyBoardLayout == 3 ? 1 : 3;
  else if (ev.altKey && ev.ctrlKey && (C == "A" || C == "a"))
    KeyBoardLayout = KeyBoardLayout == 4 ? 1 : 4;
  else if (ev.altKey && ev.ctrlKey && (C == "U" || C == "u"))
    KeyBoardLayout = KeyBoardLayout == 5 ? 1 : 5;
  ChangeKeyboarLayoutStatus();
  if (K == 27) return false;
  return true;
}
function KeyBoardPress(ev) {
  var field;
  if (IE) field = ev.srcElement;
  else field = ev.target;
  var K = window.event ? event.keyCode : ev.which;
  var C = String.fromCharCode(K);
  if (ev.altKey && ev.ctrlKey && (C == "E" || C == "e")) return false;
  else if (ev.altKey && ev.ctrlKey && (C == "B" || C == "b")) return false;
  else if (ev.altKey && ev.ctrlKey && (C == "P" || C == "p")) return false;
  else if (ev.altKey && ev.ctrlKey && (C == "A" || C == "a")) return false;
  else if (ev.altKey && ev.ctrlKey && (C == "U" || C == "u")) return false;
  else if (ev.ctrlKey || ev.altKey) return true;
  if (KeyBoardLayout == 1 || EnglishKeyboard == true) {
    return true;
  }
  var CUni = "";
  CUni = MapUnicodeCharacter(C);
  if (CUni == null) return true;
  ProcessCharacter(field, C, K, CUni);
  if (IE) event.keyCode = 0;
  LC = C;
  if (K > 29) return false;
  return true;
}
//layout end

// unicode to bijoy convaeter stat
var uni2bijoy_string_conversion_map = {
  "।": "|",
  "‘": "Ô",
  "’": "Õ",
  "“": "Ò",
  "”": "Ó",
  "্র্য": "ª¨",
  র‌্য: "i¨",
  ক্ক: "°",
  ক্ট: "±",
  ক্ত: "³",
  ক্ব: "K¡",
  স্ক্র: "¯Œ",
  ক্র: "µ",
  ক্ল: "K¬",
  ক্ষ: "¶",
  ক্স: "·",
  গু: "¸",
  গ্ধ: "»",
  গ্ন: "Mœ",
  গ্ম: "M¥",
  গ্ল: "M­",
  গ্রু: "Mªy",
  ঙ্ক: "¼",
  ঙ্ক্ষ: "•¶",
  ঙ্খ: "•L",
  ঙ্গ: "½",
  ঙ্ঘ: "•N",
  চ্চ: "”P",
  চ্ছ: "”Q",
  চ্ছ্ব: "”Q¡",
  চ্ঞ: "”T",
  জ্জ্ব: "¾¡",
  জ্জ: "¾",
  জ্ঝ: "À",
  জ্ঞ: "Á",
  জ্ব: "R¡",
  ঞ্চ: "Â",
  ঞ্ছ: "Ã",
  ঞ্জ: "Ä",
  ঞ্ঝ: "Å",
  ট্ট: "Æ",
  ট্ব: "U¡",
  ট্ম: "U¥",
  ড্ড: "Ç",
  ণ্ট: "È",
  "ণ্� ": "É",
  ন্স: "Ý",
  ণ্ড: "Ê",
  ন্তু: "š‘",
  ণ্ব: "Y^",
  ত্ত: "Ë",
  ত্ত্ব: "Ë¡",
  ত্থ: "Ì",
  ত্ন: "Zœ",
  ত্ম: "Z¥",
  ন্ত্ব: "š—¡",
  ত্ব: "Z¡",
  থ্ব: "_¡",
  দ্গ: "˜M",
  দ্ঘ: "˜N",
  দ্দ: "Ï",
  দ্ধ: "×",
  দ্ব: "˜¡",
  দ্ব: "Ø",
  দ্ভ: "™¢",
  দ্ম: "Ù",
  দ্রু: "`ª“",
  ধ্ব: "aŸ",
  ধ্ম: "a¥",
  ন্ট: "›U",
  "ন্� ": "Ú",
  ন্ড: "Û",
  ন্ত্র: "š¿",
  ন্ত: "š—",
  স্ত্র: "¯¿",
  ত্র: "Î",
  ন্থ: "š’",
  ন্দ: "›`",
  ন্দ্ব: "›Ø",
  ন্ধ: "Ü",
  ন্ন: "bœ",
  ন্ব: "š^",
  ন্ম: "b¥",
  প্ট: "Þ",
  প্ত: "ß",
  প্ন: "cœ",
  প্প: "� ",
  প্ল: "c­",
  প্স: "á",
  ফ্ল: "d¬",
  ব্জ: "â",
  ব্দ: "ã",
  ব্ধ: "ä",
  ব্ব: "eŸ",
  ব্ল: "e­",
  ভ্র: "å",
  ম্ন: "gœ",
  ম্প: "¤ú",
  ম্ফ: "ç",
  ম্ব: "¤^",
  ম্ভ: "¤¢",
  ম্ভ্র: "¤£",
  ম্ম: "¤§",
  ম্ল: "¤­",
  রু: "i“",
  রূ: "iƒ",
  ল্ক: "é",
  ল্গ: "ê",
  ল্প: "í",
  ল্ট: "ë",
  ল্ড: "ì",
  ল্ফ: "î",
  ল্ব: "j¦",
  ল্ম: "j¥",
  ল্ল: "jø",
  শু: "ï",
  শ্চ: "ð",
  শ্ন: "kœ",
  শ্ব: "k¦",
  শ্ম: "k¥",
  শ্ল: "kø",
  ষ্ক: "®‹",
  ষ্ক্র: "®Œ",
  ষ্ট: "ó",
  "ষ্� ": "ô",
  ষ্ণ: "ò",
  ষ্প: "®ú",
  ষ্ফ: "õ",
  ষ্ম: "®§",
  স্ক: "¯‹",
  স্ট: "÷",
  স্খ: "ö",
  স্ত: "¯—",
  স্তু: "¯‘",
  স্থ: "¯’",
  স্ন: "mœ",
  স্প: "¯ú",
  স্ফ: "ù",
  স্ব: "¯^",
  স্ম: "¯§",
  স্ল: "¯­",
  হু: "û",
  হ্ণ: "nè",
  হ্ন: "ý",
  হ্ম: "þ",
  হ্ল: "n¬",
  হৃ: "ü",
  র্: "©",
  "্র": "«",
  "্য": "¨",
  "্": "&",
  আ: "Av",
  অ: "A",
  ই: "B",
  ঈ: "C",
  উ: "D",
  ঊ: "E",
  ঋ: "F",
  এ: "G",
  ঐ: "H",
  ও: "I",
  ঔ: "J",
  ক: "K",
  খ: "L",
  গ: "M",
  ঘ: "N",
  ঙ: "O",
  চ: "P",
  ছ: "Q",
  জ: "R",
  ঝ: "S",
  ঞ: "T",
  ট: "U",
  "� ": "V",
  ড: "W",
  ঢ: "X",
  ণ: "Y",
  ত: "Z",
  থ: "_",
  দ: "`",
  ধ: "a",
  ন: "b",
  প: "c",
  ফ: "d",
  ব: "e",
  ভ: "f",
  ম: "g",
  য: "h",
  র: "i",
  ল: "j",
  শ: "k",
  ষ: "l",
  স: "m",
  হ: "n",
  ড়: "o",
  ঢ়: "p",
  য়: "q",
  ৎ: "r",
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
  "া": "v",
  "ি": "w",
  "ী": "x",
  "ু": "y",
  "ূ": "~",
  "ৃ": "…",
  "ে": "‡",
  "ৈ": "‰",
  "ৗ": "� ",
  "ং": "s",
  "ঃ": "t",
  "ঁ": "u",
};
var uni2somewherein_string_conversion_map = {
  "।": "|",
  "‘": "Ô",
  "’": "Õ",
  "“": "Ò",
  "”": "Ó",
  "্র্য": "ª¨",
  র‌্য: "i¨",
  ক্ক: "°",
  ক্ট: "±",
  ক্ত: "³",
  ক্ব: "K¡",
  স্ক্র: "¯Œ",
  ক্র: "µ",
  ক্ল: "K¬",
  ক্ষ: "¶",
  ক্স: "·",
  গু: "¸",
  গ্ধ: "»",
  গ্ন: "Mœ",
  গ্ম: "M¥",
  গ্ল: "M­",
  গ্রু: "Mªy",
  ঙ্ক: "¼",
  ঙ্ক্ষ: "•¶",
  ঙ্খ: "•L",
  ঙ্গ: "½",
  ঙ্ঘ: "•N",
  চ্চ: "”P",
  চ্ছ: "”Q",
  চ্ছ্ব: "”Q¡",
  চ্ঞ: "”T",
  জ্জ্ব: "¾¡",
  জ্জ: "¾",
  জ্ঝ: "À",
  জ্ঞ: "Á",
  জ্ব: "R¡",
  ঞ্চ: "Â",
  ঞ্ছ: "Ã",
  ঞ্জ: "Ä",
  ঞ্ঝ: "Å",
  ট্ট: "Æ",
  ট্ব: "U¡",
  ট্ম: "U¥",
  ড্ড: "Ç",
  ণ্ট: "È",
  "ণ্� ": "É",
  ন্স: "Ý",
  ণ্ড: "Ê",
  ন্তু: "š‘",
  ণ্ব: "Y^",
  ত্ত: "Ë",
  ত্ত্ব: "Ë¡",
  ত্থ: "Ì",
  ত্ম: "Z¥",
  ত্ন: "Zœ",
  ন্ত্ব: "š—¡",
  ত্ব: "Z¡",
  থ্ব: "_¡",
  দ্গ: "˜M",
  দ্ঘ: "˜N",
  দ্দ: "Ï",
  দ্ধ: "×",
  দ্ব: "˜¡",
  দ্ব: "Ø",
  দ্ভ: "™¢",
  দ্ম: "Ù",
  দ্রু: "`ª“",
  ধ্ব: "aŸ",
  ধ্ম: "a¥",
  ন্ট: "›U",
  ন্ড: "Û",
  ন্ত্র: "š¿",
  ন্ত: "š—",
  স্ত্র: "¯¿",
  ত্র: "Î",
  ন্থ: "š’",
  ন্দ: "›`",
  ন্দ্ব: "›Ø",
  ন্ধ: "Ü",
  ন্ন: "bœ",
  ন্ব: "š^",
  ন্ম: "b¥",
  প্ট: "Þ",
  প্ত: "ß",
  প্ন: "cœ",
  প্প: "� ",
  প্ল: "c­",
  প্স: "á",
  ফ্ল: "d¬",
  ব্জ: "â",
  ব্দ: "ã",
  ব্ধ: "ä",
  ব্ব: "eŸ",
  ব্ল: "e­",
  ভ্র: "å",
  ম্ন: "gœ",
  ম্প: "¤ú",
  ম্ফ: "ç",
  ম্ব: "¤^",
  ম্ভ: "¤¢",
  ম্ভ্র: "¤£",
  ম্ম: "¤§",
  ম্ল: "¤­",
  রু: "i“",
  রূ: "iƒ",
  ল্ক: "é",
  ল্গ: "ê",
  ল্ট: "ë",
  ল্ড: "ì",
  ল্প: "í",
  ল্ফ: "î",
  ল্ব: "j¦",
  ল্ম: "j¥",
  ল্ল: "j­",
  শু: "ï",
  শ্চ: "ð",
  শ্ন: "kœ",
  শ্ব: "k¦",
  শ্ম: "k¥",
  শ্ল: "k­",
  ষ্ক: "®‹",
  ষ্ক্র: "®Œ",
  ষ্ট: "ó",
  "ষ্� ": "ô",
  ষ্ণ: "ò",
  ষ্প: "®ú",
  ষ্ফ: "õ",
  ষ্ম: "®§",
  স্ক: "¯‹",
  স্ট: "÷",
  স্খ: "ö",
  স্ত: "¯—",
  স্তু: "¯‘",
  স্থ: "¯’",
  স্ন: "mœ",
  স্প: "¯ú",
  স্ফ: "ù",
  স্ব: "¯^",
  স্ম: "¯§",
  স্ল: "¯­",
  হ্ণ: "nè",
  হ্ন: "ý",
  হ্ম: "þ",
  হু: "û",
  হ্ল: "n¬",
  হৃ: "ü",
  র্: "©",
  "্র": "Ö",
  "্য": "¨",
  "্": "&",
  আ: "Av",
  অ: "A",
  ই: "B",
  ঈ: "C",
  উ: "D",
  ঊ: "E",
  ঋ: "F",
  এ: "G",
  ঐ: "H",
  ও: "I",
  ঔ: "J",
  ক: "K",
  খ: "L",
  গ: "M",
  ঘ: "N",
  ঙ: "O",
  চ: "P",
  ছ: "Q",
  জ: "R",
  ঝ: "S",
  ঞ: "T",
  ট: "U",
  "� ": "V",
  ড: "W",
  ঢ: "X",
  ণ: "Y",
  ত: "Z",
  থ: "_",
  দ: "`",
  ধ: "a",
  ন: "b",
  প: "c",
  ফ: "d",
  ব: "e",
  ভ: "f",
  ম: "g",
  য: "h",
  র: "i",
  ল: "j",
  শ: "k",
  ষ: "l",
  স: "m",
  হ: "n",
  ড়: "o",
  ঢ়: "p",
  য়: "q",
  ৎ: "r",
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
  "া": "v",
  "ি": "w",
  "ী": "x",
  "ু": "y",
  "ূ": "~",
  "ৃ": "„",
  "ে": "‡",
  "ৈ": "‰",
  "ৗ": "� ",
  "ং": "s",
  "ঃ": "t",
  "ঁ": "u",
};
var uni2boisakhi_string_conversion_map = {
  "্র্য": "Ûø",
  র‌্য: "kø",
  ক্ক: "~",
  ক্ট: "ƒ",
  ক্ত: "£ß",
  ক্ব: "Kò",
  স্ক্র: "Ç",
  ক্র: "¢ß",
  ক্ষ্ম: "qô",
  ক্ষ: "q",
  ক্স: "…",
  ক্ল: "Kõ",
  গু: "� ",
  গ্গ: "‡",
  গ্ধ: "ˆ",
  গ্ন: "Mí",
  গ্ম: "Mô",
  গ্ল: "Mö",
  ঙ্ক: "‰",
  ঙ্ক্ষ: "áq",
  ঙ্খ: "áL",
  ঙ্গ: "� ",
  ঙ্ঘ: "áN",
  চ্চ: "âP",
  চ্ছ: "âQ",
  চ্ছ্ব: "âQò",
  জ্জ্ব: "Œò",
  জ্জ: "Œ",
  জ্ঞ: "š",
  জ্ব: "Rò",
  ঞ্চ: "é",
  "˜": "ঞ্ছ",
  ঞ্জ: "™",
  ঞ্ঝ: "ã",
  ট্ট: "›",
  ট্ব: "Uò",
  ট্ম: "Uô",
  ড্ড: "œ",
  "ণ্� ": "Ÿ",
  "ন্� ": "ª",
  ন্স: "Ý",
  ণ্ড: "¡",
  ন্তু: "š‘",
  ন্তু: "ìç",
  ণ্ব: "Yð",
  ত্ত্ব: "£ò",
  ত্থ: "¤",
  ত্ন: "Zí",
  ত্ম: "£ô",
  ত্ম: "Zô",
  ত্ত: "£",
  ন্ত্ব: "ìòæ",
  ত্ব: "Zò",
  থ্ব: "aò",
  দ্দ: "¥",
  দ্ধ: "¦",
  দ্ব: "§",
  দ্ভ: "¨",
  দ্ম: "bô",
  ধ্ব: "cµ",
  ন্ট: "ëU",
  ন্ট: "åU",
  ন্ড: "«",
  ন্ত্র: "ìè",
  ন্ত: "ìæ",
  স্ত্র: "þè",
  ত্র: "¢",
  ন্দ: "ëb",
  ন্দ্ব: "ë§",
  ন্ধ: "¬",
  ন্ধ: "ëc",
  ন্ন: "Ò",
  ন্ন: "dí",
  ন্ব: "ìñ",
  ন্থ: "ìÿ",
  ন্ম: "dô",
  ন্স: "ëo",
  প্ট: "ïU",
  প্ত: "®",
  প্ন: "eí",
  প্প: "¯",
  প্ল: "eö",
  ফ্ল: "d¬",
  ব্জ: "±",
  ব্দ: "²",
  ব্ধ: "³",
  ব্ব: "gµ",
  ব্ল: "gö",
  ম্ভ্র: "»",
  ভ্র: "¸",
  ম্ন: "ií",
  ম্প: "óe",
  ম্ফ: "óf",
  ম্ব: "¹",
  ম্ভ: "º",
  ম্ম: "ói",
  ম্ল: "óö",
  ল্ক: "¿",
  ল্গ: "ùM",
  ল্ট: "ùU",
  ল্ড: "À",
  ল্প: "ùe",
  ল্ফ: "ùf",
  ল্ব: "lð",
  ল্ম: "lô",
  ল্ল: "Á",
  শু: "Â",
  শ্চ: "úP",
  শ্ন: "mí",
  শ্ব: "mð",
  শ্ম: "mô",
  শ্ল: "mö",
  ষ্ক: "ûK",
  ষ্ক্র: "û¢ß",
  ষ্ট: "Ä",
  "ষ্� ": "Å",
  ষ্প: "ûe",
  ষ্ফ: "üf",
  ষ্ম: "ûô",
  স্ক: "Æ",
  স্খ: "ýL",
  স্ট: "ýU",
  স্থ: "þÿ",
  স্ত: "þæ",
  স্তু: "þç",
  স্ন: "þí",
  স্প: "þe",
  স্ফ: "ýf",
  স্ব: "È",
  স্ব: "þñ",
  স্ম: "þô",
  হু: "É",
  হ্ণ: "pî",
  হ্ন: "pß",
  হ্ম: "Ê",
  হ্ল: "n¬",
  হ্ল: "põ",
  হৃ: "pÕ",
  ব: "ò",
  র্: "ê",
  "্র": "Þ",
  "্য": "ø",
  "্": "z",
  আ: "Aw",
  অ: "A",
  ই: "B",
  ঈ: "C",
  উ: "D",
  ঊ: "E",
  ঋ: "F",
  এ: "G",
  ঐ: "H",
  ও: "I",
  ঔ: "J",
  ক: "K",
  খ: "L",
  গ: "M",
  ঘ: "N",
  ঙ: "O",
  চ: "P",
  ছ: "Q",
  জ: "R",
  ঝ: "S",
  ঞ: "T",
  ট: "U",
  "� ": "V",
  ড: "W",
  ঢ: "X",
  ণ: "Y",
  ত: "Z",
  থ: "¤",
  দ: "b",
  ধ: "c",
  ন: "d",
  প: "e",
  ফ: "f",
  ব: "g",
  ভ: "h",
  ম: "i",
  য: "j",
  র: "k",
  ল: "l",
  শ: "m",
  ষ: "n",
  স: "o",
  হ: "p",
  ড়: "r",
  ঢ়: "s",
  য়: "t",
  থ: "a",
  ৎ: "u",
  "ং": "v",
  "ঁ": "^",
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
  "া": "w",
  "ি": "x",
  "ী": "y",
  "ু": "×",
  "ূ": "Ô",
  "ৃ": "Ú",
  "ে": "Ë",
  "ৈ": "Ð",
  "ৗ": "#",
  "।": "„",
};
function ReArrangeUnicodeText(str) {
  var barrier = 0;
  for (var i = 0; i < str.length; i++) {
    if (i < str.length && IsBanglaPreKar(str.charAt(i))) {
      var j = 1;
      while (IsBanglaBanjonborno(str.charAt(i - j))) {
        if (i - j < 0) break;
        if (i - j <= barrier) break;
        if (IsBanglaHalant(str.charAt(i - j - 1))) j += 2;
        else break;
      }
      var temp = str.substring(0, i - j);
      temp += str.charAt(i);
      temp += str.substring(i - j, i);
      temp += str.substring(i + 1, str.length);
      str = temp;
      barrier = i + 1;
      continue;
    }
    if (
      i < str.length - 1 &&
      IsBanglaHalant(str.charAt(i)) &&
      str.charAt(i - 1) == "র" &&
      !IsBanglaHalant(str.charAt(i - 2))
    ) {
      var j = 1;
      var found_pre_kar = 0;
      while (true) {
        if (
          IsBanglaBanjonborno(str.charAt(i + j)) &&
          IsBanglaHalant(str.charAt(i + j + 1))
        )
          j += 2;
        else if (
          IsBanglaBanjonborno(str.charAt(i + j)) &&
          IsBanglaPreKar(str.charAt(i + j + 1))
        ) {
          found_pre_kar = 1;
          break;
        } else break;
      }
      var temp = str.substring(0, i - 1);
      temp += str.substring(i + j + 1, i + j + found_pre_kar + 1);
      temp += str.substring(i + 1, i + j + 1);
      temp += str.charAt(i - 1);
      temp += str.charAt(i);
      temp += str.substring(i + j + found_pre_kar + 1, str.length);
      str = temp;
      i += j + found_pre_kar;
      barrier = i + 1;
      continue;
    }
  }
  return str;
}
function ConvertToASCII(ConvertTo, line) {
  var conversion_map = uni2bijoy_string_conversion_map;
  if (ConvertTo == "bijoy") conversion_map = uni2bijoy_string_conversion_map;
  else if (ConvertTo == "somewherein")
    conversion_map = uni2somewherein_string_conversion_map;
  else if (ConvertTo == "boisakhi")
    conversion_map = uni2boisakhi_string_conversion_map;
  var myRegExp;
  myRegExp = new RegExp("ো", "g");
  line = line.replace(myRegExp, "ো");
  myRegExp = new RegExp("ৌ", "g");
  line = line.replace(myRegExp, "ৌ");
  line = ReArrangeUnicodeText(line);
  for (var unic in conversion_map) {
    myRegExp = new RegExp(unic, "g");
    line = line.replace(myRegExp, conversion_map[unic]);
  }
  conversion_map = uni2boisakhi_string_conversion_map;
  var myRegExp;
  myRegExp = new RegExp("ো", "g");
  line = line.replace(myRegExp, "ো");
  myRegExp = new RegExp("ৌ", "g");
  line = line.replace(myRegExp, "ৌ");
  line = ReArrangeUnicodeText(line);
  for (var unic in conversion_map) {
    myRegExp = new RegExp(unic, "g");
    line = line.replace(myRegExp, conversion_map[unic]);
  }
  return line;
}
