chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "fillForm",
        title: chrome.i18n.getMessage('menuFillForm'),
        contexts: ["all"]
    });
    chrome.contextMenus.create({
        id: "fillField",
        title: chrome.i18n.getMessage('menuFillField'),
        contexts: ["editable"]
    });
    chrome.contextMenus.create({
        id: "undoFill",
        title: chrome.i18n.getMessage('menuUndo'),
        contexts: ["all"]
    });
});

// Click on the extension icon
chrome.action.onClicked.addListener((tab) => {
    chrome.storage.local.get(['preferredLocale'], (result) => {
        chrome.tabs.sendMessage(tab.id, {
            action: "fill",
            locale: result.preferredLocale
        });
    });
});

const MENU_ACTIONS = {
    fillForm: 'fill',
    fillField: 'fill_field',
    undoFill: 'undo'
};

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const action = MENU_ACTIONS[info.menuItemId];
    if (!action) return;
    chrome.storage.local.get(['preferredLocale'], (result) => {
        chrome.tabs.sendMessage(tab.id, {
            action: action,
            locale: result.preferredLocale
        }).catch(() => {
            // Ignore error if content script is not ready or page is restricted
        });
    });
});

const COMMAND_ACTIONS = {
    fill_chaos: 'fill_chaos',
    undo_fill: 'undo'
};

chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;

        const action = COMMAND_ACTIONS[command] || 'fill';

        chrome.storage.local.get(['preferredLocale'], (result) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: action,
                locale: result.preferredLocale
            }).catch(() => {
                // Ignore error if content script is not ready or page is restricted
                // This prevents "Recieving end does not exist" noise
            });
        });
    });
});
