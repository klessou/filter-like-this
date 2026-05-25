chrome.commands.onCommand.addListener((command) => {
  if (command === 'trigger_filter') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'trigger_filter' });
      }
    });
  }
});
