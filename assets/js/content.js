chrome.storage.local.get(['userScript', 'userStyles', 'sites'], (result) => {
  const currentDomain = window.location.hostname;
  const baseDomain = currentDomain.split('.').slice(-2).join('.');

  const userScript = result.userScript || {};
  const userStyles = result.userStyles || {};

  const injectScript = (scriptContent) => {
    const script = document.createElement('script');
    script.textContent = scriptContent;
    document.body.appendChild(script);
  };

  const injectStyles = (cssContent) => {
    const style = document.createElement('style');
    if (style.styleSheet) {
      style.styleSheet.cssText = cssContent;
    } else {
      style.appendChild(document.createTextNode(cssContent));
    }
    document.head.appendChild(style);
  };

  // Inject 'All' scripts and styles first
  if (userScript["all"]) {
    injectScript(userScript["all"]);
  }
  
  if (userStyles["all"]) {
    injectStyles(userStyles["all"]);
  }

  // Inject site-specific scripts and styles
  if (userScript[baseDomain]) {
    injectScript(userScript[baseDomain]);
  }

  if (userStyles[baseDomain]) {
    injectStyles(userStyles[baseDomain]);
  }
});
