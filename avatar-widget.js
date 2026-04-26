(function () {
  'use strict';

  var ROOT_ID = 'sw-avatar';
  var STYLE_ID = 'sw-agentic-avatar-style';
  var MAX_INPUT = 700;

  function rootEl() {
    return document.getElementById(ROOT_ID);
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
    var ctx = contextText().toLowerCase() + ' ' + appName().toLowerCase();
    if (ctx.indexOf('legal') >= 0 || ctx.indexOf('court') >= 0) {
      return {
        title: 'Court aide',
        accent: '#60a5fa',
        skills: [
          ['assess', 'Assess case'],
          ['draft', 'Draft filing'],
          ['deadline', 'Find deadline'],
          ['explain', 'Explain term']
        ],
        guardrail: 'Do not claim to be a lawyer. Encourage review by a qualified attorney for legal decisions.'
      };
    }
    if (ctx.indexOf('farm') >= 0 || ctx.indexOf('crop') >= 0) {
      return {
        title: 'Farm scout',
        accent: '#22c55e',
        skills: [
          ['diagnose', 'Diagnose crop'],
          ['treat', 'Plan treatment'],
          ['schedule', 'Care schedule'],
          ['resource', 'Find resources']
        ],
        guardrail: 'Prefer practical, local, low-risk crop guidance and call out uncertainty.'
      };
    }
    if (ctx.indexOf('repair') >= 0 || ctx.indexOf('mechanic') >= 0 || ctx.indexOf('auto') >= 0 || ctx.indexOf('vehicle') >= 0) {
      return {
        title: 'Repair coach',
        accent: '#f59e0b',
        skills: [
          ['estimate', 'Estimate cost'],
          ['triage', 'Triage issue'],
          ['parts', 'Map parts'],
          ['negotiate', 'Shop script']
        ],
        guardrail: 'Give practical repair guidance, identify safety issues, and avoid pretending to inspect what was not provided.'
      };
    }
    if (ctx.indexOf('travel') >= 0 || ctx.indexOf('booking') >= 0) {
      return {
        title: 'Trip agent',
        accent: '#38bdf8',
        skills: [
          ['plan', 'Plan trip'],
          ['verify', 'Check docs'],
          ['budget', 'Budget route'],
          ['pack', 'Packing list']
        ],
        guardrail: 'Keep travel advice practical and ask users to verify official entry and safety rules.'
      };
    }
    if (ctx.indexOf('skin') >= 0 || ctx.indexOf('glow') >= 0) {
      return {
        title: 'Skin coach',
        accent: '#f472b6',
        skills: [
          ['routine', 'Build routine'],
          ['ingredient', 'Check ingredient'],
          ['track', 'Track progress'],
          ['question', 'Ask derm prep']
        ],
        guardrail: 'Avoid diagnosis. Recommend professional care for urgent, painful, spreading, or unusual symptoms.'
      };
    }
    if (ctx.indexOf('shopping') >= 0 || ctx.indexOf('grocery') >= 0) {
      return {
        title: 'Shopping agent',
        accent: '#34d399',
        skills: [
          ['route', 'Route list'],
          ['substitute', 'Find substitute'],
          ['budget', 'Save money'],
          ['meal', 'Meal idea']
        ],
        guardrail: 'Prioritize time savings, clear substitutions, and concise store navigation.'
      };
    }
    if (ctx.indexOf('fraud') >= 0 || ctx.indexOf('guard') >= 0) {
      return {
        title: 'Safety guard',
        accent: '#818cf8',
        skills: [
          ['scan', 'Scan message'],
          ['lockdown', 'Protect account'],
          ['report', 'Report steps'],
          ['coach', 'Explain risk']
        ],
        guardrail: 'Be conservative with fraud risk. Give concrete verification and account protection steps.'
      };
    }
    return {
      title: 'AI copilot',
      accent: '#4fc3f7',
      skills: [
        ['summarize', 'Summarize'],
        ['plan', 'Make plan'],
        ['draft', 'Draft text'],
        ['check', 'Check risk']
      ],
      guardrail: 'Be concise, practical, and clear about uncertainty.'
    };
  }

  function css(accent) {
    return [
      '.swav{position:fixed;right:16px;bottom:18px;z-index:99999;display:flex;flex-direction:column;align-items:flex-end;gap:8px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#e5f7ff}',
      '.swav *{box-sizing:border-box}',
      '.swav-panel{width:min(340px,calc(100vw - 24px));max-height:min(520px,calc(100vh - 96px));display:none;flex-direction:column;overflow:hidden;background:rgba(8,13,24,.96);border:1px solid color-mix(in srgb,' + accent + ' 58%,transparent);border-radius:8px;box-shadow:0 18px 50px rgba(0,0,0,.38)}',
      '.swav.open .swav-panel{display:flex}',
      '.swav-head{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.08)}',
      '.swav-face{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#fff,' + accent + ' 28%,#101827 68%);box-shadow:0 0 22px color-mix(in srgb,' + accent + ' 35%,transparent)}',
      '.swav-title{font-size:13px;font-weight:700;line-height:1.1}.swav-sub{font-size:10px;color:#9fb3c8;margin-top:2px}',
      '.swav-close{margin-left:auto;background:transparent;border:0;color:#b6c7da;font-size:20px;line-height:1;cursor:pointer}',
      '.swav-log{padding:12px;overflow:auto;display:flex;flex-direction:column;gap:8px;min-height:112px}',
      '.swav-msg{font-size:12px;line-height:1.45;padding:9px 10px;border-radius:8px;max-width:96%;white-space:pre-wrap;word-break:break-word}',
      '.swav-msg.bot{align-self:flex-start;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08)}',
      '.swav-msg.user{align-self:flex-end;background:color-mix(in srgb,' + accent + ' 24%,#111827);border:1px solid color-mix(in srgb,' + accent + ' 48%,transparent)}',
      '.swav-skills{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:0 12px 10px}',
      '.swav-skill{min-height:34px;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#d8ebff;font-size:11px;cursor:pointer}',
      '.swav-skill:hover{border-color:' + accent + ';background:color-mix(in srgb,' + accent + ' 12%,transparent)}',
      '.swav-form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid rgba(255,255,255,.08)}',
      '.swav-input{flex:1;min-width:0;border:1px solid rgba(255,255,255,.12);border-radius:6px;background:#050914;color:#eef8ff;font-size:12px;padding:10px;outline:none}',
      '.swav-input:focus{border-color:' + accent + '}',
      '.swav-send{width:40px;border:0;border-radius:6px;background:' + accent + ';color:#06101f;font-weight:800;cursor:pointer}',
      '.swav-send:disabled{opacity:.55;cursor:not-allowed}',
      '.swav-launch{width:54px;height:54px;border-radius:50%;border:1px solid ' + accent + ';background:#07101f;display:grid;place-items:center;cursor:pointer;box-shadow:0 0 22px color-mix(in srgb,' + accent + ' 35%,transparent)}',
      '.swav-launch svg{width:34px;height:34px}.swav-launch:hover{transform:translateY(-1px)}',
      '.swav-pulse{animation:swavPulse 2.8s ease-in-out infinite}@keyframes swavPulse{0%,100%{box-shadow:0 0 16px color-mix(in srgb,' + accent + ' 25%,transparent)}50%{box-shadow:0 0 30px color-mix(in srgb,' + accent + ' 48%,transparent)}}',
      '@media(max-width:520px){.swav{right:12px;bottom:12px}.swav-panel{width:calc(100vw - 24px);max-height:70vh}.swav-skills{grid-template-columns:1fr 1fr}}'
    ].join('');
  }

  function avatarSvg(accent) {
    return '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">'
      + '<circle cx="32" cy="32" r="28" fill="#08111f" stroke="' + accent + '" stroke-width="2"/>'
      + '<path d="M19 34c0-10 6-17 13-17s13 7 13 17v7c0 3-2 5-5 5H24c-3 0-5-2-5-5v-7z" fill="' + accent + '" opacity=".24"/>'
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

  function demoReply(skill, prompt, p) {
    var label = skill || 'plan';
    var base = 'Demo mode: add your API key in Settings to activate live AI. ';
    var ctx = contextText() || appName();
    return base + p.title + ' can run the "' + label + '" skill for ' + ctx + '. Try a specific task, and I will return a short plan, risks, and next action.';
  }

  function systemPrompt(skill, p) {
    return [
      'You are ' + p.title + ' inside ' + appName() + '.',
      'App context: ' + (contextText() || 'No app context supplied.'),
      'Selected skill: ' + (skill || 'general help') + '.',
      p.guardrail,
      'Answer with: 1) direct answer, 2) next action, 3) risk or caveat if relevant.',
      'Keep it under 140 words unless the user asks for depth.'
    ].join('\n');
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
          max_tokens: 360,
          system: systemPrompt(skill, p),
          messages: [{ role: 'user', content: text.slice(0, MAX_INPUT) }]
        })
      });
      clearTimeout(timer);
      if (!res.ok) {
        if (res.status === 401) return 'Invalid API key. Update it in Settings and try again.';
        if (res.status === 429) return 'Rate limit reached. Wait a moment and retry.';
        return 'AI request failed with status ' + res.status + '.';
      }
      var data = await res.json();
      return data && data.content && data.content[0] && data.content[0].text
        ? data.content[0].text
        : 'No answer returned.';
    } catch (err) {
      clearTimeout(timer);
      return err.name === 'AbortError' ? 'Request timed out. Try a shorter question.' : 'Network error. Check your connection and retry.';
    }
  }

  async function askEndpoint(text, skill, p) {
    if (!window.SWAvatarEndpoint) return askAnthropic(text, skill, p);
    var res = await fetch(window.SWAvatarEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text.slice(0, MAX_INPUT),
        skill: skill || 'general',
        app: appName(),
        context: contextText()
      })
    });
    if (!res.ok) return 'AI endpoint failed with status ' + res.status + '.';
    var data = await res.json();
    return data.reply || data.message || data.text || 'No answer returned.';
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
    head.innerHTML = '<div class="swav-face">' + avatarSvg(p.accent) + '</div><div><div class="swav-title">' + p.title + '</div><div class="swav-sub">Agent skills ready</div></div>';
    var close = document.createElement('button');
    close.className = 'swav-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Close assistant');
    close.textContent = 'x';
    head.appendChild(close);

    var log = document.createElement('div');
    log.className = 'swav-log';
    addMessage(log, 'bot', p.title + ' ready. Pick a skill or ask a question.');

    var skills = document.createElement('div');
    skills.className = 'swav-skills';
    p.skills.forEach(function (item) {
      var btn = document.createElement('button');
      btn.className = 'swav-skill';
      btn.type = 'button';
      btn.dataset.skill = item[0];
      btn.textContent = item[1];
      skills.appendChild(btn);
    });

    var form = document.createElement('form');
    form.className = 'swav-form';
    var input = document.createElement('input');
    input.className = 'swav-input';
    input.type = 'text';
    input.maxLength = MAX_INPUT;
    input.placeholder = 'Ask or give a task...';
    var send = document.createElement('button');
    send.className = 'swav-send';
    send.type = 'submit';
    send.textContent = 'Go';
    form.appendChild(input);
    form.appendChild(send);

    var launcher = document.createElement('button');
    launcher.className = 'swav-launch swav-pulse';
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Open assistant');
    launcher.innerHTML = avatarSvg(p.accent);

    panel.appendChild(head);
    panel.appendChild(log);
    panel.appendChild(skills);
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
      var prompt = (text || '').trim();
      if (!prompt && skill) prompt = 'Run the ' + skill + ' skill for my current screen.';
      if (!prompt) return;
      open();
      addMessage(log, 'user', prompt);
      var pending = addMessage(log, 'bot', 'Working...');
      send.disabled = true;
      window.dispatchEvent(new CustomEvent('sw-avatar:skill', {
        detail: { app: appName(), context: contextText(), skill: skill || activeSkill || 'general', prompt: prompt }
      }));
      var reply = await askEndpoint(prompt, skill || activeSkill, p);
      pending.textContent = reply;
      log.scrollTop = log.scrollHeight;
      send.disabled = false;
    }

    launcher.addEventListener('click', function () {
      wrap.classList.contains('open') ? closePanel() : open();
    });
    close.addEventListener('click', closePanel);
    skills.addEventListener('click', function (event) {
      var btn = event.target.closest('.swav-skill');
      if (!btn) return;
      activeSkill = btn.dataset.skill;
      submit('', activeSkill);
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var text = input.value;
      input.value = '';
      submit(text, activeSkill);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
