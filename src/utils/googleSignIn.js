export function googleSignIn(clientId) {
    return new Promise((resolve, reject) => {
        if (!window.google || !window.google.accounts || !window.google.accounts.id) {
            reject(new Error("Google Identity Services not loaded"));
            return;
        }
        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
                if (response.credential) {
                    resolve(response.credential);
                } else {
                    reject(new Error("No credential returned"));
                }
            },
        });
        window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                reject(new Error("Google sign-in was cancelled or failed to display"));
            }
        });
    });
} 