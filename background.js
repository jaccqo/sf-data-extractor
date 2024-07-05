// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.status === 'call_in_progress') {
        console.log("A call is currently in progress. Details:", message.details);
        // Add any additional actions here, like notifications
    } else if (message.status === 'no_call') {
        console.log("No call is currently in progress.");
    }
});
