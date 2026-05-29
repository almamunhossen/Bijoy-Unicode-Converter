const fs = require("fs");
const vm = require("vm");
const code = fs.readFileSync("app.js", "utf8");
const ctx = {
  console,
  window: { addEventListener() {}, removeEventListener() {} },
  document: {
    addEventListener() {},
    querySelectorAll() {
      return [];
    },
    getElementById() {
      return null;
    },
  },
  navigator: {},
  setTimeout,
  clearTimeout,
  localStorage: {
    getItem() {
      return null;
    },
    setItem() {},
  },
};
vm.createContext(ctx);
vm.runInContext(code, ctx);
console.log(
  "UNICODE->BIJOY:" + JSON.stringify(ctx.ConvertToASCII("bijoy", "রু")),
);
console.log(
  "BIJOY->UNICODE:" + JSON.stringify(ctx.ConvertToUnicode("bijoy", "i“")),
);

