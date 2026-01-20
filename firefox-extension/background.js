const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.runtime.onInstalled.addListener(() => {
  browserAPI.contextMenus.create({
    id: 'json-tools-parent',
    title: 'JSON Tools',
    contexts: ['selection']
  });

  browserAPI.contextMenus.create({
    id: 'json-format',
    parentId: 'json-tools-parent',
    title: 'Format JSON',
    contexts: ['selection']
  });

  browserAPI.contextMenus.create({
    id: 'json-minify',
    parentId: 'json-tools-parent',
    title: 'Minify JSON',
    contexts: ['selection']
  });

  browserAPI.contextMenus.create({
    id: 'json-validate',
    parentId: 'json-tools-parent',
    title: 'Validate JSON',
    contexts: ['selection']
  });

  browserAPI.contextMenus.create({
    id: 'json-copy-escaped',
    parentId: 'json-tools-parent',
    title: 'Copy as Escaped String',
    contexts: ['selection']
  });
});

browserAPI.contextMenus.onClicked.addListener((info, tab) => {
  const text = info.selectionText;
  
  if (!text) return;

  switch (info.menuItemId) {
    case 'json-format':
      processJson(text, 'format', tab);
      break;
    case 'json-minify':
      processJson(text, 'minify', tab);
      break;
    case 'json-validate':
      processJson(text, 'validate', tab);
      break;
    case 'json-copy-escaped':
      copyEscaped(text, tab);
      break;
  }
});

async function processJson(text, action, tab) {
  try {
    const parsed = JSON.parse(text);
    let result;
    let message;

    switch (action) {
      case 'format':
        result = JSON.stringify(parsed, null, 2);
        message = 'Formatted JSON copied!';
        break;
      case 'minify':
        result = JSON.stringify(parsed);
        message = 'Minified JSON copied!';
        break;
      case 'validate':
        result = null;
        message = 'Valid JSON!';
        break;
    }

    if (result !== null) {
      await copyToClipboard(result, tab);
    }
    
    showNotification(tab.id, message, 'success');
  } catch (e) {
    showNotification(tab.id, `Invalid JSON: ${e.message}`, 'error');
  }
}

async function copyEscaped(text, tab) {
  const escaped = JSON.stringify(text);
  await copyToClipboard(escaped, tab);
  showNotification(tab.id, 'Escaped string copied!', 'success');
}

async function copyToClipboard(text, tab) {
  try {
    await browserAPI.scripting.executeScript({
      target: { tabId: tab.id },
      func: (textToCopy) => {
        navigator.clipboard.writeText(textToCopy);
      },
      args: [text]
    });
  } catch (e) {
    await browserAPI.scripting.executeScript({
      target: { tabId: tab.id },
      func: (textToCopy) => {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      },
      args: [text]
    });
  }
}

function showNotification(tabId, message, type) {
  const bgColor = type === 'success' ? '#22c55e' : '#ef4444';
  
  browserAPI.scripting.executeScript({
    target: { tabId },
    func: (msg, bg) => {
      const existing = document.getElementById('json-tools-notification');
      if (existing) existing.remove();

      const div = document.createElement('div');
      div.id = 'json-tools-notification';
      div.textContent = msg;
      Object.assign(div.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        background: bg,
        color: '#fff',
        borderRadius: '8px',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '999999',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        animation: 'jsonToolsFadeIn 0.2s ease'
      });

      const style = document.createElement('style');
      style.textContent = `
        @keyframes jsonToolsFadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(div);

      setTimeout(() => {
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.2s';
        setTimeout(() => div.remove(), 200);
      }, 2000);
    },
    args: [message, bgColor]
  }).catch(() => {});
}
