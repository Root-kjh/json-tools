const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const elements = {
  tabs: $$('.tab'),
  input: $('#input'),
  output: $('#output'),
  outputSection: $('#outputSection'),
  outputLabel: $('#outputLabel'),
  status: $('#status'),
  actionBtn: $('#actionBtn'),
  actionText: $('#actionText'),
  formatOptions: $('#formatOptions'),
  convertOptions: $('#convertOptions'),
  indentSize: $('#indentSize'),
  convertType: $('#convertType'),
  pasteBtn: $('#pasteBtn'),
  clearBtn: $('#clearBtn'),
  copyBtn: $('#copyBtn'),
};

let currentTab = 'format';

function init() {
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  elements.actionBtn.addEventListener('click', handleAction);
  elements.pasteBtn.addEventListener('click', handlePaste);
  elements.clearBtn.addEventListener('click', handleClear);
  elements.copyBtn.addEventListener('click', handleCopy);
  elements.input.addEventListener('input', hideStatus);

  browserAPI.storage.local.get(['indentSize']).then((result) => {
    if (result.indentSize) {
      elements.indentSize.value = result.indentSize;
    }
  });

  elements.indentSize.addEventListener('change', () => {
    browserAPI.storage.local.set({ indentSize: elements.indentSize.value });
  });
}

function switchTab(tab) {
  currentTab = tab;
  
  elements.tabs.forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  elements.formatOptions.classList.toggle('hidden', tab !== 'format');
  elements.convertOptions.classList.toggle('hidden', tab !== 'convert');

  const actions = {
    format: 'Format JSON',
    validate: 'Validate JSON',
    minify: 'Minify JSON',
    convert: 'Convert JSON'
  };
  elements.actionText.textContent = actions[tab];

  hideStatus();
  elements.outputSection.classList.add('hidden');
}

async function handleAction() {
  const input = elements.input.value.trim();
  
  if (!input) {
    showStatus('Please enter some JSON', 'error');
    return;
  }

  try {
    const parsed = JSON.parse(input);
    
    switch (currentTab) {
      case 'format':
        handleFormat(parsed);
        break;
      case 'validate':
        handleValidate(parsed);
        break;
      case 'minify':
        handleMinify(parsed);
        break;
      case 'convert':
        handleConvert(parsed);
        break;
    }
  } catch (e) {
    showStatus(`Invalid JSON: ${e.message}`, 'error');
    elements.outputSection.classList.add('hidden');
  }
}

function handleFormat(parsed) {
  const indent = elements.indentSize.value;
  const indentValue = indent === 'tab' ? '\t' : parseInt(indent);
  const formatted = JSON.stringify(parsed, null, indentValue);
  
  showOutput(formatted, 'Formatted JSON');
  showStatus('JSON formatted successfully!', 'success');
}

function handleValidate(parsed) {
  const stats = analyzeJson(parsed);
  showOutput(JSON.stringify(parsed, null, 2), 'Valid JSON');
  showStatus(`Valid JSON! ${stats}`, 'success');
}

function handleMinify(parsed) {
  const minified = JSON.stringify(parsed);
  const original = elements.input.value.length;
  const compressed = minified.length;
  const ratio = ((1 - compressed / original) * 100).toFixed(1);
  
  showOutput(minified, 'Minified JSON');
  showStatus(`Minified! ${original} → ${compressed} bytes (${ratio}% smaller)`, 'success');
}

function handleConvert(parsed) {
  const type = elements.convertType.value;
  let result = '';
  let label = '';

  switch (type) {
    case 'typescript':
      result = jsonToTypeScript(parsed);
      label = 'TypeScript Interface';
      break;
    case 'yaml':
      result = jsonToYaml(parsed);
      label = 'YAML';
      break;
    case 'csv':
      result = jsonToCsv(parsed);
      label = 'CSV';
      break;
    case 'xml':
      result = jsonToXml(parsed);
      label = 'XML';
      break;
  }

  showOutput(result, label);
  showStatus(`Converted to ${type.toUpperCase()}!`, 'success');
}

function analyzeJson(obj) {
  let objects = 0, arrays = 0, strings = 0, numbers = 0, booleans = 0, nulls = 0;
  
  function traverse(val) {
    if (val === null) { nulls++; return; }
    if (Array.isArray(val)) { arrays++; val.forEach(traverse); return; }
    if (typeof val === 'object') { objects++; Object.values(val).forEach(traverse); return; }
    if (typeof val === 'string') strings++;
    else if (typeof val === 'number') numbers++;
    else if (typeof val === 'boolean') booleans++;
  }
  
  traverse(obj);
  const parts = [];
  if (objects) parts.push(`${objects} object${objects > 1 ? 's' : ''}`);
  if (arrays) parts.push(`${arrays} array${arrays > 1 ? 's' : ''}`);
  if (strings) parts.push(`${strings} string${strings > 1 ? 's' : ''}`);
  if (numbers) parts.push(`${numbers} number${numbers > 1 ? 's' : ''}`);
  if (booleans) parts.push(`${booleans} boolean${booleans > 1 ? 's' : ''}`);
  if (nulls) parts.push(`${nulls} null${nulls > 1 ? 's' : ''}`);
  
  return parts.join(', ');
}

function jsonToTypeScript(obj, name = 'Root') {
  const interfaces = [];
  
  function getType(val, propName = 'Item') {
    if (val === null) return 'null';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'unknown[]';
      const itemType = getType(val[0], propName);
      return `${itemType}[]`;
    }
    if (typeof val === 'object') {
      const interfaceName = capitalize(propName);
      generateInterface(val, interfaceName);
      return interfaceName;
    }
    return typeof val;
  }
  
  function generateInterface(obj, name) {
    const props = Object.entries(obj).map(([key, val]) => {
      const type = getType(val, key);
      const safeName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      return `  ${safeName}: ${type};`;
    });
    interfaces.push(`interface ${name} {\n${props.join('\n')}\n}`);
  }
  
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/[^a-zA-Z0-9]/g, '');
  }
  
  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === 'object') {
      generateInterface(obj[0], name);
      return interfaces.reverse().join('\n\n') + `\n\ntype ${name}Array = ${name}[];`;
    }
    return `type ${name} = ${getType(obj)}`;
  }
  
  generateInterface(obj, name);
  return interfaces.reverse().join('\n\n');
}

function jsonToYaml(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  
  if (obj === null) return 'null';
  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
        return `"${obj.replace(/"/g, '\\"')}"`;
      }
      return obj;
    }
    return String(obj);
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => {
      const val = jsonToYaml(item, indent + 1);
      if (typeof item === 'object' && item !== null) {
        return `${spaces}- ${val.trim().replace(/\n/g, '\n' + spaces + '  ')}`;
      }
      return `${spaces}- ${val}`;
    }).join('\n');
  }
  
  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';
  
  return entries.map(([key, val]) => {
    const yamlVal = jsonToYaml(val, indent + 1);
    if (typeof val === 'object' && val !== null && !Array.isArray(val) && Object.keys(val).length > 0) {
      return `${spaces}${key}:\n${yamlVal}`;
    }
    if (Array.isArray(val) && val.length > 0) {
      return `${spaces}${key}:\n${yamlVal}`;
    }
    return `${spaces}${key}: ${yamlVal}`;
  }).join('\n');
}

function jsonToCsv(obj) {
  if (!Array.isArray(obj)) {
    obj = [obj];
  }
  
  if (obj.length === 0) return '';
  
  const headers = new Set();
  obj.forEach(item => {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach(key => headers.add(key));
    }
  });
  
  const headerArr = Array.from(headers);
  const rows = [headerArr.join(',')];
  
  obj.forEach(item => {
    const row = headerArr.map(header => {
      let val = item?.[header] ?? '';
      if (typeof val === 'object') val = JSON.stringify(val);
      val = String(val);
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

function jsonToXml(obj, rootName = 'root') {
  function convert(val, name) {
    if (val === null) return `<${name}/>`;
    if (typeof val !== 'object') return `<${name}>${escapeXml(String(val))}</${name}>`;
    
    if (Array.isArray(val)) {
      return val.map(item => convert(item, 'item')).join('\n');
    }
    
    const children = Object.entries(val)
      .map(([k, v]) => convert(v, k))
      .join('\n');
    return `<${name}>\n${indentXml(children)}\n</${name}>`;
  }
  
  function escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  
  function indentXml(str) {
    return str.split('\n').map(line => '  ' + line).join('\n');
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>\n${convert(obj, rootName)}`;
}

function showOutput(content, label) {
  elements.output.textContent = content;
  elements.outputLabel.textContent = label;
  elements.outputSection.classList.remove('hidden');
}

function showStatus(message, type) {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
}

function hideStatus() {
  elements.status.classList.add('hidden');
}

async function handlePaste() {
  try {
    const text = await navigator.clipboard.readText();
    elements.input.value = text;
    hideStatus();
  } catch (e) {
    showStatus('Failed to read clipboard', 'error');
  }
}

function handleClear() {
  elements.input.value = '';
  elements.outputSection.classList.add('hidden');
  hideStatus();
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(elements.output.textContent);
    showStatus('Copied to clipboard!', 'success');
  } catch (e) {
    showStatus('Failed to copy', 'error');
  }
}

init();
