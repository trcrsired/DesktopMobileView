// Render global configuration
function renderGlobal(config) {
  const modeInputs = document.querySelectorAll('input[name="globalMode"]');
  modeInputs.forEach(i => { i.checked = (i.value === config.global.mode); });

  document.getElementById('desktopZoom').value = config.global.desktopZoomScale;
  document.getElementById('mobileZoom').value = config.global.mobileZoomScale;
}

// Render site-specific configuration
function renderSites(config) {
  const tbody = document.querySelector('#siteTable tbody');
  tbody.innerHTML = '';

  for (const [domain, s] of Object.entries(config.sites || {})) {
    const tr = document.createElement('tr');

    // Domain cell
    const tdDomain = document.createElement('td');
    const domainInput = document.createElement('input');
    domainInput.type = 'text';
    domainInput.value = domain;
    tdDomain.appendChild(domainInput);

    // Mode cell
    const tdMode = document.createElement('td');
    const modeSelect = document.createElement('select');
    ["desktop", "mobile"].forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
      if (opt === s.mode) o.selected = true;
      modeSelect.appendChild(o);
    });
    tdMode.appendChild(modeSelect);

    // Zoom cell
    const tdZoom = document.createElement('td');
    const zoomInput = document.createElement('input');
    zoomInput.type = 'number';
    zoomInput.min = '1';
    zoomInput.max = '5';
    zoomInput.step = '0.1';
    zoomInput.value = s.zoomScale;
    tdZoom.appendChild(zoomInput);

    // Rule cell
    const tdRule = document.createElement('td');
    const ruleSelect = document.createElement('select');
    const rules = [
      { value: "", label: "None" },
      { value: "desktopOnly", label: "desktopOnly" },
      { value: "forceDesktop", label: "forceDesktop" }
    ];
    rules.forEach(r => {
      const o = document.createElement('option');
      o.value = r.value;
      o.textContent = r.label;
      if ((s.rule || "") === r.value) o.selected = true;
      ruleSelect.appendChild(o);
    });
    tdRule.appendChild(ruleSelect);

    // Actions cell
    const tdActions = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => tr.remove();
    tdActions.appendChild(removeBtn);

    tr.appendChild(tdDomain);
    tr.appendChild(tdMode);
    tr.appendChild(tdZoom);
    tr.appendChild(tdRule);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  }
}

// Read global configuration from UI
function readGlobalFromUI() {
  const mode = document.querySelector('input[name="globalMode"]:checked')?.value || 'desktop';
  const desktopZoomScale = parseFloat(document.getElementById('desktopZoom').value) || 1.0;
  const mobileZoomScale = parseFloat(document.getElementById('mobileZoom').value) || 2.0;
  return { mode, desktopZoomScale, mobileZoomScale };
}

// Read site-specific configuration from UI
function readSitesFromUI() {
  const sites = {};
  const rows = document.querySelectorAll('#siteTable tbody tr');
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input, select');
    const domain = inputs[0].value.trim();
    const mode = inputs[1].value;
    const zoomScale = parseFloat(inputs[2].value) || 1.0;
    const rule = inputs[3].value || '';
    if (domain) {
      sites[domain] = { mode, zoomScale, rule };
    }
  });
  return sites;
}

// Save button handler
document.getElementById('saveAll').addEventListener('click', function() {
  const global = readGlobalFromUI();
  const sites = readSitesFromUI();
  const config = { global, sites };
  saveConfig(config, function() {
    alert('Settings saved.');
  });
});

// Reset button handler
document.getElementById('resetDefaults').addEventListener('click', function() {
  resetConfig(function(defaultConfig) {
    renderGlobal(defaultConfig);
    renderSites(defaultConfig);
    alert('Defaults restored.');
  });
});

// Initial load
loadConfig(function(config) {
  renderGlobal(config);
  renderSites(config);
});
