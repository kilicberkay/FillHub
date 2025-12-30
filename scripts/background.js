chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "fillForm",
        title: "Fill Form with Fake Data",
        contexts: ["all"]
    });
});

// Click on the extension icon
chrome.action.onClicked.addListener((tab) => {
    chrome.storage.local.get(['preferredLocale'], (result) => {
        chrome.tabs.sendMessage(tab.id, {
            action: "fill",
            locale: result.preferredLocale || 'tr'
        });
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "fillForm") {
        chrome.storage.local.get(['preferredLocale'], (result) => {
            chrome.tabs.sendMessage(tab.id, {
                action: "fill",
                locale: result.preferredLocale || 'tr'
            }).catch(() => {
                // Ignore error if content script is not ready or page is restricted
            });
        });
    }
});

chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;

        const action = (command === 'fill_chaos') ? 'fill_chaos' : 'fill'; // map fill_form to fill

        chrome.storage.local.get(['preferredLocale'], (result) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: action,
                locale: result.preferredLocale || 'tr'
            }).catch(() => {
                // Ignore error if content script is not ready or page is restricted
                // This prevents "Recieving end does not exist" noise
            });
        });
    });
});
