document.addEventListener('DOMContentLoaded', () => {
  // Elements for site-specific functionality
  const elements = {
    currentSite: "all",
    siteSelector: document.getElementById("siteSelector"),
    addNewSiteBtn: document.getElementById("addNewSiteBtn"),
    newSiteDiv: document.getElementById("newSiteDiv"),
    newSiteInput: document.getElementById("newSiteInput"),
    saveNewSiteBtn: document.getElementById("saveNewSiteBtn"),
    userScript: document.getElementById('userScript'),
    userStyles: document.getElementById('userStyles'),
    toast: document.getElementById("toast"),
  };

  // Preload styles/css if current site is in the dropdown
  const selectCurrentSite = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = new URL(tabs[0].url);
      const hostname = url.hostname;
      const baseDomain = hostname.split('.').slice(-2).join('.')

      console.log('url: ' + url);
      console.log('hostname: ' + hostname);

      // Check if baseDomain exists in the dropdown
      const options = Array.from(elements.siteSelector.options);
      const matchingOption = options.find(option => option.value === baseDomain);

      console.log('options: ', options);
      console.log('matching?: ' + matchingOption);

      if (matchingOption) {
        // Set dropdown to the matching option
        elements.siteSelector.value = baseDomain;
        // Trigger the change event to load saved JS/CSS
        elements.siteSelector.dispatchEvent(new Event('change'));
      }
    });
  };


  // Load saved sites into dropdown
  const loadSites = () => {
    chrome.storage.local.get("sites", (result) => {
      const savedSites = result.sites || [];
      elements.siteSelector.innerHTML = '<option value="all">All</option>';

      savedSites.forEach(site => {
        const option = document.createElement("option");
        option.value = site;
        option.text = site;
        elements.siteSelector.appendChild(option);
      });
    });

    selectCurrentSite();
  };

  // Save new site
  const saveNewSite = (newSite) => {
    chrome.storage.local.get("sites", (result) => {
      let savedSites = result.sites || [];

      if (!savedSites.includes(newSite)) {
        savedSites.push(newSite);
        chrome.storage.local.set({ "sites": savedSites }, () => {
          loadSites();
        });
      }
    });
  };

  // Event listeners
  elements.addNewSiteBtn.addEventListener("click", () => {
    elements.newSiteDiv.style.display = "flex";
  });

  elements.saveNewSiteBtn.addEventListener("click", () => {
    const newSite = elements.newSiteInput.value;

    if (newSite) {
      saveNewSite(newSite);
      elements.newSiteDiv.style.display = "none";
      elements.newSiteInput.value = "";
    }
  });

  elements.siteSelector.addEventListener("change", (event) => {
    elements.currentSite = event.target.value;

    // Load saved data for the selected site
    loadData(['userScript', 'userStyles'], result => {
      if (result.userScript) userScript.value = result.userScript[elements.currentSite] || "";
      if (result.userStyles) userStyles.value = result.userStyles[elements.currentSite] || "";
    });
  });

  // Update loadData and saveData functions to handle site-specific scripts and styles
  const loadData = (keys, callback) => {
    chrome.storage.local.get(keys, (result) => {
      callback(result);
    });
  };

  const saveData = (callback) => {
    const script = elements.userScript.value;
    const css = elements.userStyles.value;

    chrome.storage.local.get(["userScript", "userStyles"], (result) => {
      let savedScripts = result.userScript || {};
      let savedStyles = result.userStyles || {};
      savedScripts[elements.currentSite] = script;
      savedStyles[elements.currentSite] = css;
      chrome.storage.local.set({
        "userScript": savedScripts,
        "userStyles": savedStyles
      }, () => {
        elements.toast.textContent = "Options saved.";
        setTimeout(() => { elements.toast.textContent = ""; }, 1000);
        if (callback) callback();
      });
    });
  };

  // Initial load
  loadSites();

  // Load saved data when popup opens
  loadData(['userScript', 'userStyles'], result => {
    if (result.userScript) elements.userScript.value = result.userScript[elements.currentSite] || "";
    if (result.userStyles) elements.userStyles.value = result.userStyles[elements.currentSite] || "";
  });

  // Helper function to show notifications
  const showNotification = message => {
    elements.toast.textContent = message;
    elements.toast.classList.remove('hidden');

    setTimeout(() => elements.toast.classList.add('hidden'), 500);
  };

  // Save JS code
  document.getElementById('saveJS').addEventListener('click', () => {
    saveData(() => showNotification('JS saved!'));
  });

  // Save CSS code
  document.getElementById('saveCss').addEventListener('click', () => {
    saveData(() => showNotification('CSS saved!'));
  });

  // Close popup
  document.getElementById('closeBtn').addEventListener('click', () => {
    window.close();
  });
});
