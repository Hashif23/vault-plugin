chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkPlatformLogin") {
        sendResponse(checkPlatformLogin());
    }
});

// ✅ Check If User is Logged into Google Drive
function checkPlatformLogin() {
    return !!document.querySelector('div[aria-label="Google Account"]');
}
