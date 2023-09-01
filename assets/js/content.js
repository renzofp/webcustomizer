chrome.storage.local.get(['userScript', 'userStyles', 'sites'], function(result) {
  const currentDomain = window.location.hostname;
  const baseDomain = currentDomain.split('.').slice(-2).join('.');

  let userScript = result.userScript || {};
  let userStyles = result.userStyles || {};

  // Inject 'All' scripts and styles first
  if (userScript["all"]) {
    eval(userScript["all"]);
  }
  
  if (userStyles["all"]) {
    const css = userStyles["all"];
    var style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  // Then, check for site-specific scripts/styles
  if (userScript[baseDomain]) {
    eval(userScript[baseDomain]);
  }

  if (userStyles[baseDomain]) {
    const css = userStyles[baseDomain];
    var style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }
});
