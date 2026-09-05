@
const fs = require("fs");
let content = fs.readFileSync("P:/Projects/nazexa-db/src/hooks/usePaymentActivation.ts", "utf8");
content = content.replace(/const celebratedKey.*/, "const celebratedKey = `nazexa_payment_celebrated_${txnId}`;");
content = content.replace(/sessionStorage\.setItem.*/, "sessionStorage.setItem(`nazexa_payment_celebrated_${txnId}`, `true`);");
fs.writeFileSync("P:/Projects/nazexa-db/src/hooks/usePaymentActivation.ts", content);
@
