const vscode = require('vscode');
const https = require('https');

const API_ENDPOINT = 'https://www.minimax.io/v1/token_plan/remains';
const SECRET_KEY = 'minimaxUsage.apiKey';

let statusBarItem, refreshTimer, lastData = null;

async function activate(context) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'minimaxUsage.setApiKey';
  statusBarItem.tooltip = 'MiniMax Token Plan — click to set API key';
  context.subscriptions.push(statusBarItem);

  context.subscriptions.push(
    vscode.commands.registerCommand('minimaxUsage.setApiKey', () => setApiKey(context)),
    vscode.commands.registerCommand('minimaxUsage.refresh', () => refreshUsage(context)),
    vscode.commands.registerCommand('minimaxUsage.showDetails', () => showDetails())
  );

  await refreshUsage(context);
  setupAutoRefresh(context);

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('minimaxUsage.refreshIntervalMinutes'))
        setupAutoRefresh(context);
    })
  );
}

function setupAutoRefresh(context) {
  if (refreshTimer) clearInterval(refreshTimer);
  const mins = vscode.workspace.getConfiguration('minimaxUsage').get('refreshIntervalMinutes', 5);
  refreshTimer = setInterval(() => refreshUsage(context), mins * 60 * 1000);
  context.subscriptions.push({ dispose: () => clearInterval(refreshTimer) });
}

async function setApiKey(context) {
  const key = await vscode.window.showInputBox({
    prompt: 'Enter your MiniMax Token Plan Key',
    password: true,
    placeHolder: 'Paste Token Plan Key...',
    ignoreFocusOut: true
  });
  if (key?.trim()) {
    await context.secrets.store(SECRET_KEY, key.trim());
    vscode.window.showInformationMessage('MiniMax: API Key saved!');
    await refreshUsage(context);
  }
}

async function refreshUsage(context) {
  const apiKey = await context.secrets.get(SECRET_KEY);
  if (!apiKey) {
    statusBarItem.text = '$(key) MiniMax: Set API Key';
    statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    statusBarItem.command = 'minimaxUsage.setApiKey';
    statusBarItem.tooltip = 'Click to set your MiniMax Token Plan Key';
    statusBarItem.show();
    return;
  }
  statusBarItem.text = '$(sync~spin) MiniMax...';
  statusBarItem.color = undefined;
  statusBarItem.backgroundColor = undefined;
  statusBarItem.show();

  try {
    lastData = await fetchUsage(apiKey);
    updateStatusBar(lastData);
  } catch (err) {
    statusBarItem.text = '$(warning) MiniMax: Error';
    statusBarItem.color = new vscode.ThemeColor('statusBarItem.errorForeground');
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    statusBarItem.command = 'minimaxUsage.refresh';
    statusBarItem.tooltip = `Error: ${err.message} — click to retry`;
  }
}

function fetchUsage(apiKey) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_ENDPOINT);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const d = JSON.parse(body);
          res.statusCode >= 400 ? reject(new Error(`HTTP ${res.statusCode}: ${d.message || body}`)) : resolve(d);
        } catch { reject(new Error(`Invalid JSON: ${body.slice(0, 80)}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

function updateStatusBar(data) {
  const get = (keys) => {
    for (const k of keys) {
      if (data[k] != null) return data[k];
      for (const v of Object.values(data))
        if (v && typeof v === 'object' && v[k] != null) return v[k];
    }
    return null;
  };
  const fmt = n => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : String(n);

  let text = '$(pulse) MiniMax', pct = null, timeLeftStr = '';

  if (data.model_remains && Array.isArray(data.model_remains)) {
    const mainModel = data.model_remains.find(m => m.model_name === 'MiniMax-M*');
    if (mainModel) {
      const used = mainModel.current_interval_usage_count || 0;
      const total = mainModel.current_interval_total_count || 0;
      const remainsMs = mainModel.remains_time || 0;

      if (total > 0) {
        pct = Math.round((used / total) * 100);
        text = `$(pulse) MiniMax ${pct}%`;

        if (remainsMs > 0) {
          const hours = Math.floor(remainsMs / 3600000);
          const mins = Math.floor((remainsMs % 3600000) / 60000);
          if (hours > 0) {
            timeLeftStr = ` (${hours}h${mins}m)`;
          } else if (mins > 0) {
            timeLeftStr = ` (${mins}m)`;
          }
        }
      }
    }
  }

  statusBarItem.text = text;
  if (pct >= 90) {
    statusBarItem.color = new vscode.ThemeColor('statusBarItem.errorForeground');
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
  } else if (pct >= 75) {
    statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  } else {
    statusBarItem.color = undefined;
    statusBarItem.backgroundColor = undefined;
  }

  const mins = vscode.workspace.getConfiguration('minimaxUsage').get('refreshIntervalMinutes', 5);
  statusBarItem.command = 'minimaxUsage.showDetails';
  statusBarItem.tooltip = `MiniMax Token Plan Usage\nRefreshes every ${mins} min — click for details`;
  statusBarItem.show();
}

function showDetails() {
  if (!lastData) { vscode.window.showInformationMessage('No data. Set API Key first.'); return; }
  const panel = vscode.window.createWebviewPanel('minimaxDetails', 'MiniMax Usage Details', vscode.ViewColumn.One, { enableScripts: false });
  const json = JSON.stringify(lastData, null, 2);
  const get = (keys) => {
    for (const k of keys) {
      if (lastData[k] != null) return lastData[k];
      for (const v of Object.values(lastData))
        if (v && typeof v === 'object' && v[k] != null) return v[k];
    }
    return null;
  };
  const fmt = n => n != null && typeof n === 'number' ? n.toLocaleString() : (n ?? '—');
  const used = get(['used','token_used','tokens_used','used_tokens']);
  const total = get(['total','token_total','tokens_total','total_tokens','limit']);
  const remaining = get(['remaining','token_remaining','remains','tokens_remaining']);
  const pct = (used != null && total != null) ? Math.round((used/total)*100) : null;
  const barColor = pct >= 90 ? '#e05c5c' : pct >= 75 ? '#e0a85c' : '#4f98a3';

  panel.webview.html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
body{font-family:var(--vscode-font-family);color:var(--vscode-foreground);background:var(--vscode-editor-background);padding:24px;max-width:640px;margin:0 auto}
h1{font-size:1.25em;margin-bottom:4px}.sub{color:var(--vscode-descriptionForeground);font-size:.82em;margin-bottom:20px}
.kpi-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px}
.kpi{background:var(--vscode-editor-inactiveSelectionBackground);border-radius:8px;padding:12px 18px;min-width:130px}
.kpi-label{font-size:.72em;color:var(--vscode-descriptionForeground);text-transform:uppercase;letter-spacing:.05em}
.kpi-value{font-size:1.35em;font-weight:600;margin-top:2px}
.bar-wrap{background:var(--vscode-editor-inactiveSelectionBackground);border-radius:999px;height:8px;overflow:hidden;margin-bottom:6px}
.bar{height:100%;border-radius:999px}
.bar-label{font-size:.8em;color:var(--vscode-descriptionForeground);margin-bottom:18px}
pre{background:var(--vscode-textBlockQuote-background);padding:12px;border-radius:6px;font-size:.8em;overflow-x:auto;white-space:pre-wrap;word-break:break-all}
details{margin-top:16px}summary{cursor:pointer;font-size:.85em;color:var(--vscode-descriptionForeground)}
</style></head><body>
<h1>MiniMax Token Plan Usage</h1>
<p class="sub">GET ${API_ENDPOINT}<br>Last updated: ${new Date().toLocaleString()}</p>
<div class="kpi-row">
  ${used != null ? `<div class="kpi"><div class="kpi-label">Used</div><div class="kpi-value">${fmt(used)}</div></div>` : ''}
  ${total != null ? `<div class="kpi"><div class="kpi-label">Total</div><div class="kpi-value">${fmt(total)}</div></div>` : ''}
  ${remaining != null ? `<div class="kpi"><div class="kpi-label">Remaining</div><div class="kpi-value">${fmt(remaining)}</div></div>` : ''}
</div>
${pct != null ? `<div class="bar-wrap"><div class="bar" style="width:${pct}%;background:${barColor}"></div></div><p class="bar-label">${pct}% used</p>` : ''}
<details open><summary>Raw JSON</summary><pre>${json.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></details>
</body></html>`;
}

function deactivate() { if (refreshTimer) clearInterval(refreshTimer); }
module.exports = { activate, deactivate };
