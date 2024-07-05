console.log("Content script loaded and running.");

let socket;

function connectWebSocket() {
    socket = new WebSocket('ws://localhost:5000/ws');

    socket.addEventListener('open', () => {
        console.log('WebSocket connection established.');
    });

    socket.addEventListener('close', () => {
        console.log('WebSocket connection closed. Reconnecting in 3 seconds...');
        setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
    });

    socket.addEventListener('message', (event) => {
        console.log('Message from server: ', event.data);
    });

    socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

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

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ status: 'call_in_progress', details: callDetails }));
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    } else {
        console.log("No call detected within the specific panel.");
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ status: 'no_call' }));
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
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

connectWebSocket();
