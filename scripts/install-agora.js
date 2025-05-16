const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Installing Agora SDK...");

try {
  // Install Agora SDK
  execSync("npm install --save agora-rtc-sdk-ng@latest", { stdio: "inherit" });

  console.log("\n✅ Successfully installed Agora SDK!");

  // Check if agoraService.js exists and has a placeholder app ID
  const servicePath = path.join(
    __dirname,
    "..",
    "src",
    "services",
    "agora",
    "agoraService.js"
  );

  if (fs.existsSync(servicePath)) {
    console.log("\nℹ️  Don't forget to update your Agora App ID in:");
    console.log("   src/services/agora/agoraService.js");
    console.log(
      "\nYou can get an App ID by creating a free account at https://www.agora.io/"
    );
  }

  console.log("\n🚀 Agora video integration is ready to use!");
  console.log(
    "   Check the documentation in AGORA_INTEGRATION.md for more details."
  );
} catch (error) {
  console.error("\n❌ Failed to install Agora SDK:", error.message);
  console.log("\nPlease try installing manually:");
  console.log("npm install --save agora-rtc-sdk-ng@latest");
  process.exit(1);
}
