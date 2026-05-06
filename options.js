document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["geminiApikey"], ({ geminiapiKey }) => {
         if (geminiapiKey) document.getElementById("api-key").value=geminiapiKey;
    });

    document.getElementById("save-button").addEventListener("click", () => {
        const apiKey = document.getElementById("api-key").value.trim();
        if(!apiKey)return;

        chrome.storage.sync.set({geminiApikey: apiKey}, () => {
            document.getElementById("success-message").style.display = "block";
            setTimeout(() => window.close(), 1000);
        });
    });
});


