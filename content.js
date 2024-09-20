console.log("Content script loaded and running.");

function checkForCall() {
    const callPanels = document.querySelectorAll('div.voiceConnectedPanel.voiceCallHandlerContainer');
    if (callPanels.length > 0) {
        const callPanel = callPanels[callPanels.length - 1]; // Select the last occurrence
        console.log("Call in progress detected within the specific panel.");

        // Extract call details within the specific panel
        const companyNameElement = callPanel.querySelector('div.highlightsH1 span.uiOutputText');
        const personNameElement = callPanel.querySelector('div.field span.uiOutputText.forceOutputLookup');
        const phoneNumberElement = callPanel.querySelector('div.openctiOutputPhone span.uiOutputPhone');

        const companyName = companyNameElement ? companyNameElement.innerText : 'Unknown Company';
        const personName = personNameElement ? personNameElement.innerText : 'Unknown Person';
        const phoneNumber = phoneNumberElement ? phoneNumberElement.innerText : 'Unknown Number';

        const callDetails = {
            company: companyName,
            person: personName,
            phone: phoneNumber
        };

        console.log("Call details:", callDetails);

        chrome.runtime.sendMessage({ action: 'sendStatus', status: 'call_in_progress', details: callDetails }, response => {
            console.log(response.status);
        });
    } else {
        console.log("No call detected within the specific panel.");
        chrome.runtime.sendMessage({ action: 'sendStatus', status: 'no_call' }, response => {
            console.log(response.status);
        });
    }
}

window.addEventListener('load', () => {
    console.log("All resources finished loading.");

    // Initial check
    checkForCall();

    // Observe for changes in the document
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length || mutation.removedNodes.length) {
                try {
                    checkForCall();
                } catch (error) {
                    console.error('Error checking for call:', error);
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});