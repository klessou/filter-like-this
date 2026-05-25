chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'trigger_filter') {
    triggerFilter();
  }
});

function triggerFilter() {
  console.log("Auto-Filter: Starting trigger sequence...");
  // Find all "More" / "Plus" buttons in the currently visible view.
  // In Gmail, the reading pane/conversation view puts the "More" button 
  // near the reply button with aria-label / data-tooltip set to "More" or "Plus".
  const moreButtons = Array.from(document.querySelectorAll('div[role="button"], button'))
    .filter(btn => {
      const label = btn.getAttribute('aria-label') || btn.getAttribute('data-tooltip') || '';
      // Matches "More", "More menu", "More message options", "Plus", "Plus d'options"
      return /^(More\b|Plus\b)/i.test(label) && btn.clientHeight > 0;
    });

  console.log(`Auto-Filter: Found ${moreButtons.length} visible 'More' buttons`);

  // Pick the last "More" button (usually the latest message in a thread)
  const targetMoreBtn = moreButtons[moreButtons.length - 1];

  if (!targetMoreBtn) {
    console.warn("Auto-Filter: Could not find 'More' button in the email view.");
    return;
  }

  // Click the "More" button to open the menu
  console.log("Auto-Filter: Clicking the 'More' button");
  targetMoreBtn.click();

  // Poll for the menu to render (up to 500ms)
  let attempts = 0;
  const findAndClickItem = () => {
    console.log(`Auto-Filter: Polling for menu item... (Attempt ${attempts + 1}/10)`);
    // Find the "Filter messages like this" / "Filtrer les messages similaires" option
    const menuItems = Array.from(document.querySelectorAll('[role="menuitem"]'))
      .filter(item => {
        const text = item.textContent || '';
        // Check text and ensure item is visible
        const match = /Filter messages like this|Filtrer les messages/i.test(text);
        if (match && item.offsetHeight > 0) {
           console.log(`Auto-Filter: Found matching and visible item:`, item);
           return true;
        } else if (match) {
           console.log(`Auto-Filter: Found matching item but it is hidden (offsetHeight=0)`);
        }
        return false;
      });

    if (menuItems.length > 0) {
      console.log(`Auto-Filter: Clicking 'Filter messages like this' item`);
      // Click the last one in case there are multiple open menus
      menuItems[menuItems.length - 1].click();
    } else if (attempts < 10) {
      attempts++;
      setTimeout(findAndClickItem, 50);
    } else {
      console.warn("Auto-Filter: Could not find 'Filter messages like this' menu item after 10 attempts. It might not be loaded or text changed.");
    }
  };

  findAndClickItem();
}
