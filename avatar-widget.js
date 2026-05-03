(function () {
  'use strict';

  var ROOT_ID = 'sw-avatar';
  var STYLE_ID = 'sw-agentic-avatar-style';
  var MAX_INPUT = 900;
  var recognition = null;
  var listening = false;
  var speaking = false;

  function rootEl() {
    var root = document.getElementById(ROOT_ID);
    if (root) return root;
    root = document.createElement('div');
    root.id = ROOT_ID;
    root.dataset.context = 'Human-like avatar assistant for this app. Use visible screen content, scan controls, app navigation, and app purpose as context.';
    document.body.appendChild(root);
    return root;
  }

  function appName() {
    var meta = document.querySelector('meta[name="application-name"]');
    return (meta && meta.content) || document.title || 'this app';
  }

  function contextText() {
    var root = rootEl();
    if (root && root.dataset.context) return root.dataset.context;
    var meta = document.querySelector('meta[name="description"]');
    return (meta && meta.content) || '';
  }

  function clean(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function apiKey() {
    if (window.SWAvatarApiKey) return window.SWAvatarApiKey;
    try {
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i += 1) {
        var value = localStorage.getItem(keys[i]);
        if (value && value.indexOf('sk-ant-') === 0) return value;
      }
    } catch (err) {}
    return '';
  }

  function profile() {
    var ctx = (contextText() + ' ' + appName()).toLowerCase();
    var base = {
      title: 'Avatar',
      accent: '#4fc3f7',
      greeting: 'I am ready. Tell me what you need, or say scan.',
      skills: [
        ['talk', 'Talk'],
        ['scan', 'Scan'],
        ['apps', 'Apps'],
        ['back', 'Back']
      ],
      guardrail: 'Be concise, practical, human, and clear about uncertainty.'
    };
    if (/legal|court|filing|case/.test(ctx)) {
      base.title = 'Court aide';
      base.accent = '#60a5fa';
      base.greeting = 'I can help you talk through the court task. I am not a lawyer.';
      base.guardrail = 'Do not claim to be a lawyer. Encourage review by a qualified attorney for legal decisions.';
    } else if (/farm|crop|soil|plant/.test(ctx)) {
      base.title = 'Farm scout';
      base.accent = '#22c55e';
      base.greeting = 'Tell me what you see in the field, or say scan.';
      base.guardrail = 'Prefer practical, local, low-risk crop guidance and call out uncertainty.';
    } else if (/repair|mechanic|auto|vehicle|vin|damage/.test(ctx)) {
      base.title = 'Repair coach';
      base.accent = '#f59e0b';
      base.greeting = 'Tell me the vehicle issue, or say scan the damage.';
      base.guardrail = 'Give practical repair guidance, identify safety issues, and avoid pretending to inspect what was not provided.';
    } else if (/travel|booking|trip|passport|visa/.test(ctx)) {
      base.title = 'Trip agent';
      base.accent = '#38bdf8';
      base.greeting = 'Tell me where you are going, or say scan documents.';
      base.guardrail = 'Keep travel advice practical and ask users to verify official entry and safety rules.';
    } else if (/skin|glow|beauty|routine/.test(ctx)) {
      base.title = 'Skin coach';
      base.accent = '#f472b6';
      base.greeting = 'Tell me what changed with your skin, or say scan.';
      base.guardrail = 'Avoid diagnosis. Recommend professional care for urgent, painful, spreading, or unusual symptoms.';
    } else if (/shopping|grocery|meal|cart/.test(ctx)) {
      base.title = 'Shopping agent';
      base.accent = '#34d399';
      base.greeting = 'Tell me your list, or say plan my shopping.';
      base.guardrail = 'Prioritize time savings, clear substitutions, and concise store navigation.';
    } else if (/fraud|guard|safety|security/.test(ctx)) {
      base.title = 'Safety guard';
      base.accent = '#818cf8';
      base.greeting = 'Tell me what looks suspicious, or say scan this message.';
      base.guardrail = 'Be conservative with fraud risk. Give concrete verification and account protection steps.';
    } else if (/zephyr|app store|install apps|free apps/.test(ctx)) {
      base.title = 'Zephyr avatar';
      base.accent = '#06b6d4';
      base.greeting = 'Tell me which app you want. I can open, install, or download it.';
      base.guardrail = 'Help users find, open, install, download, and share apps from the Zephyr catalog.';
    }
    return base;
  }

  function css(accent) {
    return [
      '.swav{position:fixed;right:16px;bottom:18px;z-index:99999;display:flex;flex-direction:column;align-items:flex-end;gap:8px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#eef8ff}',
      '.swav *{box-sizing:border-box}',
      '.swav-panel{width:min(380px,calc(100vw - 24px));max-height:min(620px,calc(100vh - 96px));display:none;flex-direction:column;overflow:hidden;background:rgba(8,13,24,.96);border:1px solid color-mix(in srgb,' + accent + ' 58%,transparent);border-radius:12px;box-shadow:0 20px 58px rgba(0,0,0,.42);backdrop-filter:blur(18px) saturate(140%)}',
      '.swav.open .swav-panel{display:flex}',
      '.swav-head{display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid rgba(255,255,255,.08)}',
      '.swav-face{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 28%,#fff,' + accent + ' 28%,#101827 69%);box-shadow:0 0 24px color-mix(in srgb,' + accent + ' 38%,transparent);transition:transform .18s ease,box-shadow .18s ease}',
      '.swav.listening .swav-face{box-shadow:0 0 0 6px color-mix(in srgb,' + accent + ' 18%,transparent),0 0 32px color-mix(in srgb,' + accent + ' 58%,transparent);transform:scale(1.04)}',
      '.swav.speaking .swav-face{animation:swavSpeak .65s ease-in-out infinite}',
      '@keyframes swavSpeak{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}',
      '.swav-title{font-size:14px;font-weight:800;line-height:1.1}.swav-sub{font-size:11px;color:#a9bdd4;margin-top:3px}',
      '.swav-close{margin-left:auto;background:transparent;border:0;color:#b6c7da;font-size:20px;line-height:1;cursor:pointer}',
      '.swav-log{padding:12px;overflow:auto;display:flex;flex-direction:column;gap:8px;min-height:128px}',
      '.swav-msg{font-size:13px;line-height:1.45;padding:9px 10px;border-radius:8px;max-width:96%;white-space:pre-wrap;word-break:break-word}',
      '.swav-msg.bot{align-self:flex-start;background:rgba(255,255,255,.065);border:1px solid rgba(255,255,255,.08)}',
      '.swav-msg.user{align-self:flex-end;background:color-mix(in srgb,' + accent + ' 24%,#111827);border:1px solid color-mix(in srgb,' + accent + ' 48%,transparent)}',
      '.swav-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;padding:0 12px 10px}',
      '.swav-action{min-height:40px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.045);color:#e5f7ff;font-size:12px;font-weight:800;cursor:pointer}',
      '.swav-action:hover{border-color:' + accent + ';background:color-mix(in srgb,' + accent + ' 14%,transparent)}',
      '.swav-form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid rgba(255,255,255,.08)}',
      '.swav-input{flex:1;min-width:0;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:#050914;color:#eef8ff;font-size:13px;padding:11px;outline:none}',
      '.swav-input:focus{border-color:' + accent + '}',
      '.swav-send{min-width:48px;border:0;border-radius:8px;background:' + accent + ';color:#06101f;font-weight:900;cursor:pointer}',
      '.swav-send:disabled{opacity:.55;cursor:not-allowed}',
      '.swav-launch{min-width:118px;min-height:58px;border-radius:999px;border:1px solid color-mix(in srgb,' + accent + ' 78%,white);background:rgba(7,16,31,.94);display:flex;align-items:center;gap:9px;padding:8px 12px;cursor:pointer;color:#e9fbff;box-shadow:0 0 24px color-mix(in srgb,' + accent + ' 34%,transparent)}',
      '.swav-launch-face{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 28%,#fff,' + accent + ' 28%,#101827 69%)}',
      '.swav-launch-copy{display:grid;text-align:left;line-height:1.05}.swav-launch-copy strong{font-size:12px}.swav-launch-copy span{font-size:10px;color:#a9bdd4;margin-top:3px}',
      '.swav-pulse{animation:swavPulse 2.8s ease-in-out infinite}@keyframes swavPulse{0%,100%{box-shadow:0 0 16px color-mix(in srgb,' + accent + ' 25%,transparent)}50%{box-shadow:0 0 32px color-mix(in srgb,' + accent + ' 52%,transparent)}}',
      '@media(max-width:520px){.swav{right:12px;bottom:12px}.swav-panel{width:calc(100vw - 24px);max-height:76vh}.swav-launch{min-width:104px}.swav-actions{grid-template-columns:repeat(2,minmax(0,1fr))}}'
    ].join('');
  }

  function avatarSvg(accent) {
    return '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">'
      + '<circle cx="32" cy="32" r="28" fill="#08111f" stroke="' + accent + '" stroke-width="2"/>'
      + '<path d="M19 35c0-11 6-18 13-18s13 7 13 18v6c0 3-2 5-5 5H24c-3 0-5-2-5-5v-6z" fill="' + accent + '" opacity=".25"/>'
      + '<circle cx="25" cy="34" r="3" fill="' + accent + '"/><circle cx="39" cy="34" r="3" fill="' + accent + '"/>'
      + '<path d="M25 44c5 3 9 3 14 0" stroke="#e7fbff" stroke-width="2" stroke-linecap="round" fill="none"/>'
      + '<path d="M32 10v7" stroke="' + accent + '" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="8" r="3" fill="' + accent + '"/>'
      + '</svg>';
  }

  function addMessage(log, role, text) {
    var msg = document.createElement('div');
    msg.className = 'swav-msg ' + role;
    msg.textContent = text;
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
    return msg;
  }

  function speak(text, wrap) {
    var voiceText = clean(text).slice(0, 420);
    if (!voiceText || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var utterance = new SpeechSynthesisUtterance(voiceText);
      utterance.rate = 0.98;
      utterance.pitch = 1.02;
      utterance.onstart = function () {
        speaking = true;
        if (wrap) wrap.classList.add('speaking');
      };
      utterance.onend = utterance.onerror = function () {
        speaking = false;
        if (wrap) wrap.classList.remove('speaking');
      };
      window.speechSynthesis.speak(utterance);
    } catch (err) {}
  }

  function systemPrompt(skill, p) {
    return [
      'You are ' + p.title + ' inside ' + appName() + '.',
      'The user wants a human-like app where the avatar is the primary interaction layer.',
      'App context: ' + (contextText() || 'No app context supplied.'),
      'Selected skill: ' + (skill || 'general help') + '.',
      p.guardrail,
      'Prefer short spoken responses. Give the next action clearly.',
      'When the user asks to scan, open, install, download, go back, stop, or talk, acknowledge the action first.',
      'Keep answers under 120 words unless the user asks for depth.'
    ].join('\n');
  }

  function demoReply(skill, prompt, p) {
    var text = clean(prompt).toLowerCase();
    if (/scan|camera|photo|picture/.test(text) || skill === 'scan') return 'I opened the scan path if this app has one. If not, tell me what you want to scan and I will guide the next step.';
    if (/install|download|open app|apps?/.test(text) || skill === 'apps') return 'I opened the app path. In Zephyr, say the app name and I can open or install it.';
    if (/back|go back/.test(text) || skill === 'back') return 'I moved you back if this screen supports it.';
    if (/stop|quiet|mute/.test(text)) return 'I stopped listening and speaking.';
    return 'I am ready. Talk naturally: say scan, ask a question, or tell me which app you want.';
  }

  async function askAnthropic(text, skill, p) {
    var key = apiKey();
    if (!key) return demoReply(skill, text, p);
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 30000);
    try {
      var res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-calls': 'true'
        },
        body: JSON.stringify({
          model: window.SWAvatarModel || 'claude-haiku-4-5',
          max_tokens: 380,
          system: systemPrompt(skill, p),
          messages: [{ role: 'user', content: clean(text).slice(0, MAX_INPUT) }]
        })
      });
      clearTimeout(timer);
      if (!res.ok) {
        if (res.status === 401) return 'The live AI key did not authenticate. Update the key and try again.';
        if (res.status === 429) return 'The live AI is rate limited. Wait a moment and try again.';
        return 'The live AI request failed with status ' + res.status + '.';
      }
      var data = await res.json();
      return data && data.content && data.content[0] && data.content[0].text ? data.content[0].text : 'No answer returned.';
    } catch (err) {
      clearTimeout(timer);
      return err.name === 'AbortError' ? 'The request timed out. Try a shorter question.' : 'Network error. Check the connection and retry.';
    }
  }

  async function askEndpoint(text, skill, p) {
    if (!window.SWAvatarEndpoint) return askAnthropic(text, skill, p);
    var res = await fetch(window.SWAvatarEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: clean(text).slice(0, MAX_INPUT),
        skill: skill || 'general',
        app: appName(),
        context: contextText()
      })
    });
    if (!res.ok) return 'The avatar endpoint failed with status ' + res.status + '.';
    var data = await res.json();
    return data.reply || data.message || data.text || 'No answer returned.';
  }

  function visible(el) {
    if (!el || el.disabled) return false;
    var style = window.getComputedStyle(el);
    var rect = el.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  }

  function textOf(el) {
    return clean([
      el.textContent,
      el.getAttribute('aria-label'),
      el.getAttribute('title'),
      el.id,
      el.className,
      el.getAttribute('data-action'),
      el.getAttribute('data-nav')
    ].join(' ')).toLowerCase();
  }

  function clickMatching(patterns) {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('button,a,[role="button"],input[type="button"],input[type="submit"]'));
    for (var i = 0; i < nodes.length; i += 1) {
      var label = textOf(nodes[i]);
      if (visible(nodes[i]) && patterns.some(function (rx) { return rx.test(label); })) {
        nodes[i].click();
        return nodes[i];
      }
    }
    return null;
  }

  function handleBack() {
    var clicked = clickMatching([/\bback\b/, /\bclose\b/, /\bcancel\b/]);
    if (clicked) return true;
    if (window.glowaiApp && typeof window.glowaiApp.goBack === 'function') {
      window.glowaiApp.goBack();
      return true;
    }
    if (history.length > 1) {
      history.back();
      return true;
    }
    return false;
  }

  function handleScan() {
    window.dispatchEvent(new CustomEvent('sw-avatar:scan', { detail: { app: appName(), context: contextText() } }));
    if (window.glowaiApp && window.scanModule && typeof window.scanModule.startScan === 'function') {
      if (typeof window.glowaiApp.showPage === 'function') window.glowaiApp.showPage('scan');
      window.scanModule.startScan();
      return true;
    }
    return Boolean(clickMatching([/\bscan\b/, /\bcamera\b/, /\bphoto\b/, /\bcapture\b/, /\bupload\b/, /\bdiagnos/, /\bvin\b/, /\banalyz/]));
  }

  function appCatalog() {
    if (Array.isArray(window.ZEPHYR_APPS)) return window.ZEPHYR_APPS;
    if (window.ZEPHYR_CATALOG && Array.isArray(window.ZEPHYR_CATALOG.apps)) return window.ZEPHYR_CATALOG.apps;
    try {
      var raw = localStorage.getItem('zephyr_apps') || localStorage.getItem('zephyr_catalog');
      var parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.apps)) return parsed.apps;
    } catch (err) {}
    return [];
  }

  function inferRequestedApp(text) {
    var cleaned = clean(text).toLowerCase();
    return cleaned
      .replace(/\b(open|install|download|get|launch|app|please|from|zephyr|store|the)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function handleApps(text) {
    var requested = inferRequestedApp(text);
    if (clickMatching([/\bcatalog\b/, /\bbrowse apps\b/, /\bapps\b/])) {
      var search = document.querySelector('#search-input,input[type="search"]');
      if (search && requested) {
        search.value = requested;
        search.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    var apps = appCatalog();
    var match = requested && apps.find(function (app) {
      var hay = clean([app.id, app.name, app.tagline, app.category].join(' ')).toLowerCase();
      return hay.indexOf(requested) >= 0 || requested.indexOf(clean(app.name).toLowerCase()) >= 0;
    });
    if (match) {
      var wantsApk = /\bapk|download|android|release\b/i.test(text);
      var url = wantsApk && match.apk ? match.apk : match.pwa || match.url || match.href || match.apk;
      if (url) {
        window.open(url, '_blank', 'noopener');
        return match.name || requested;
      }
    }
    if (requested) {
      var cards = Array.prototype.slice.call(document.querySelectorAll('a,button,.app-card,[data-app],[data-app-id]'));
      var found = cards.find(function (node) { return visible(node) && textOf(node).indexOf(requested) >= 0; });
      if (found) {
        found.click();
        return requested;
      }
    }
    return requested || true;
  }

  function stopAvatar(wrap) {
    if (recognition && listening) {
      try { recognition.stop(); } catch (err) {}
    }
    listening = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    speaking = false;
    if (wrap) wrap.classList.remove('listening', 'speaking');
  }

  function command(text, wrap) {
    var t = clean(text).toLowerCase();
    if (!t) return '';
    if (/\b(stop|quiet|mute|pause)\b/.test(t)) {
      stopAvatar(wrap);
      return 'Stopped.';
    }
    if (/\b(back|go back|previous|close camera|exit camera)\b/.test(t)) {
      return handleBack() ? 'Going back.' : 'I could not find a back path on this screen.';
    }
    if (/\b(scan|camera|photo|picture|capture|diagnose|vin)\b/.test(t)) {
      return handleScan() ? 'Opening scan.' : '';
    }
    if (/\b(app|apps|store|install|download|open)\b/.test(t) && /zephyr|app|install|download|open|store/.test(t)) {
      var app = handleApps(text);
      return typeof app === 'string' ? 'Opening ' + app + '.' : 'Opening apps.';
    }
    return '';
  }

  function initRecognition(onText, wrap) {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    var rec = new SpeechRecognition();
    rec.lang = document.documentElement.lang || 'en-US';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onstart = function () {
      listening = true;
      wrap.classList.add('listening', 'open');
    };
    rec.onend = function () {
      listening = false;
      wrap.classList.remove('listening');
    };
    rec.onerror = function () {
      listening = false;
      wrap.classList.remove('listening');
    };
    rec.onresult = function (event) {
      var result = event.results && event.results[0] && event.results[0][0] && event.results[0][0].transcript;
      if (result) onText(result, 'talk');
    };
    return rec;
  }

  function init() {
    var root = rootEl();
    if (!root || root.dataset.swAvatarReady === '1') return;
    root.dataset.swAvatarReady = '1';

    var p = profile();
    if (!document.getElementById(STYLE_ID)) {
      var style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = css(p.accent);
      document.head.appendChild(style);
    }

    var wrap = document.createElement('section');
    wrap.className = 'swav';
    wrap.setAttribute('aria-label', p.title);

    var panel = document.createElement('div');
    panel.className = 'swav-panel';

    var head = document.createElement('div');
    head.className = 'swav-head';
    head.innerHTML = '<div class="swav-face">' + avatarSvg(p.accent) + '</div><div><div class="swav-title">' + p.title + '</div><div class="swav-sub">Talk or scan. I will handle the app.</div></div>';
    var close = document.createElement('button');
    close.className = 'swav-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Close avatar');
    close.textContent = 'x';
    head.appendChild(close);

    var log = document.createElement('div');
    log.className = 'swav-log';
    addMessage(log, 'bot', p.greeting);

    var actions = document.createElement('div');
    actions.className = 'swav-actions';
    p.skills.forEach(function (item) {
      var btn = document.createElement('button');
      btn.className = 'swav-action';
      btn.type = 'button';
      btn.dataset.skill = item[0];
      btn.textContent = item[1];
      actions.appendChild(btn);
    });

    var form = document.createElement('form');
    form.className = 'swav-form';
    var input = document.createElement('input');
    input.className = 'swav-input';
    input.type = 'text';
    input.maxLength = MAX_INPUT;
    input.placeholder = 'Talk to the avatar...';
    var send = document.createElement('button');
    send.className = 'swav-send';
    send.type = 'submit';
    send.textContent = 'Ask';
    form.appendChild(input);
    form.appendChild(send);

    var launcher = document.createElement('button');
    launcher.className = 'swav-launch swav-pulse';
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Talk to avatar');
    launcher.innerHTML = '<span class="swav-launch-face">' + avatarSvg(p.accent) + '</span><span class="swav-launch-copy"><strong>Talk</strong><span>or say scan</span></span>';

    panel.appendChild(head);
    panel.appendChild(log);
    panel.appendChild(actions);
    panel.appendChild(form);
    wrap.appendChild(panel);
    wrap.appendChild(launcher);
    root.appendChild(wrap);

    var activeSkill = '';
    function open() {
      wrap.classList.add('open');
      launcher.classList.remove('swav-pulse');
      input.focus();
    }
    function closePanel() {
      wrap.classList.remove('open');
    }
    async function submit(text, skill) {
      var prompt = clean(text);
      if (!prompt && skill === 'talk') {
        open();
        if (!recognition) recognition = initRecognition(submit, wrap);
        if (recognition && !listening) {
          try { recognition.start(); } catch (err) {}
          return;
        }
        var noVoice = 'Voice input is not available in this browser. Type your request here.';
        addMessage(log, 'bot', noVoice);
        speak(noVoice, wrap);
        return;
      }
      if (!prompt && skill) prompt = 'Run ' + skill + ' for this screen.';
      if (!prompt) return;
      open();
      addMessage(log, 'user', prompt);
      var local = command(prompt, wrap);
      if (local) {
        addMessage(log, 'bot', local);
        speak(local, wrap);
        return;
      }
      var pending = addMessage(log, 'bot', 'Thinking...');
      send.disabled = true;
      window.dispatchEvent(new CustomEvent('sw-avatar:skill', {
        detail: { app: appName(), context: contextText(), skill: skill || activeSkill || 'general', prompt: prompt }
      }));
      var reply = await askEndpoint(prompt, skill || activeSkill, p);
      pending.textContent = reply;
      speak(reply, wrap);
      log.scrollTop = log.scrollHeight;
      send.disabled = false;
    }

    launcher.addEventListener('click', function () {
      if (wrap.classList.contains('open')) {
        submit('', 'talk');
      } else {
        open();
        speak(p.greeting, wrap);
      }
    });
    close.addEventListener('click', closePanel);
    actions.addEventListener('click', function (event) {
      var btn = event.target.closest('.swav-action');
      if (!btn) return;
      activeSkill = btn.dataset.skill;
      if (activeSkill === 'scan') {
        var msg = handleScan() ? 'Opening scan.' : 'I could not find a scan button on this screen.';
        addMessage(log, 'bot', msg);
        speak(msg, wrap);
        open();
        return;
      }
      if (activeSkill === 'apps') {
        var appMsg = handleApps('apps') ? 'Opening apps.' : 'I could not find an app catalog here.';
        addMessage(log, 'bot', appMsg);
        speak(appMsg, wrap);
        open();
        return;
      }
      if (activeSkill === 'back') {
        var backMsg = handleBack() ? 'Going back.' : 'I could not find a back path on this screen.';
        addMessage(log, 'bot', backMsg);
        speak(backMsg, wrap);
        open();
        return;
      }
      submit('', activeSkill);
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var text = input.value;
      input.value = '';
      submit(text, activeSkill);
    });
    window.addEventListener('sw-avatar:say', function (event) {
      var text = event.detail && (event.detail.text || event.detail.message);
      if (!text) return;
      open();
      addMessage(log, 'bot', text);
      speak(text, wrap);
    });

    window.AgenticAvatar = {
      open: open,
      close: closePanel,
      speak: function (text) {
        open();
        addMessage(log, 'bot', text);
        speak(text, wrap);
      },
      listen: function () { submit('', 'talk'); },
      scan: handleScan,
      apps: handleApps,
      back: handleBack,
      stop: function () { stopAvatar(wrap); }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
