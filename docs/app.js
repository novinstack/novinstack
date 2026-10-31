(() => {
  'use strict';

  const cfg = window.NOVINSTACK_CONFIG || {};
  const apiBase = typeof cfg.apiBaseUrl === 'string' ? cfg.apiBaseUrl.trim().replace(/\/+$/, '') : '';
  const siteKey = typeof cfg.turnstileSiteKey === 'string' ? cfg.turnstileSiteKey.trim() : '';
  const aiConfigured = /^https:\/\//i.test(apiBase) && Boolean(siteKey);
  const FAQ = Array.isArray(window.TISA_FAQ) ? window.TISA_FAQ : [];
  const el = id => document.getElementById(id);
  const area = el('chat-area');
  const input = el('message-input');
  const form = el('chat-form');
  const messages = el('messages');
  const sendButton = el('send-button');
  const welcome = el('welcome');
  const typing = el('typing');
  const moreButton = el('more-prompts');
  let lang = 'fa';
  let busy = false;
  let history = [];
  let captchaToken = '';
  let widgetId = null;
  let requestId = 0;
  let expanded = false;

  const i18n = {
    fa: {
      eyebrow: 'دستیار هوشمند نوین‌استک', heroTitle: 'سلام، من <em>تیسا</em> هستم.',
      heroText: 'دستیار هوشمند و مجری اندیشه‌های نوین‌استک؛ برای شناخت خدمات، فناوری‌ها و مسیر همکاری کنار شماست.',
      topicsLabel: 'موضوع گفتگوی شما', topicServices: 'خدمات نرم‌افزاری', topicAI: 'هوش مصنوعی و اتوماسیون',
      topicCollab: 'همکاری و سفارش پروژه', topicLearning: 'آموزش و توسعه‌دهندگان',
      topicProducts: 'محصولات و پروژه‌ها', topicTech: 'فناوری‌ها و معماری',
      tagline: 'از یادگیری تا ساخت محصول', visitSite: 'آشنایی با نوین‌استک', assistantName: 'تیسا',
      basicMode: 'راهنمای اطلاعات نوین‌استک', aiMode: 'دستیار هوشمند نوین‌استک',
      welcomeKicker: 'TISA · NOVINSTACK', welcomeTitle: 'سلام! چه سؤالی درباره نوین‌استک دارید؟',
      welcomeDesc: 'تیسا، دستیار هوشمند و مجری اندیشه‌های نوین‌استک؛ برای پاسخ به پرسش‌های شما درباره خدمات، فناوری‌ها و همکاری.',
      suggestionsTitle: 'از این سؤال‌ها شروع کنید', moreQuestions: 'سؤال‌های بیشتر', lessQuestions: 'نمایش سؤال‌های کمتر',
      inputLabel: 'پیام خود را بنویسید', placeholder: 'سؤال خود را بنویسید…',
      noticeBasic: 'پاسخ‌ها بر اساس راهنمای اطلاعات عمومی نوین‌استک تهیه می‌شوند.',
      noticeAI: 'تیسا بر اساس اطلاعات عمومی نوین‌استک پاسخ می‌دهد؛ جزئیات پروژه را با تیم ما تأیید کنید.',
      noticeCaptcha: 'برای ارسال پیام، ابتدا بررسی امنیتی را تکمیل کنید.',
      privacy: 'اطلاعات شخصی یا محرمانه ارسال نکنید.',
      privacyAI: 'پیام‌ها برای پاسخ‌گویی به سرویس AI ارسال می‌شوند؛ اطلاعات محرمانه نفرستید.',
      officialSite: 'وب‌سایت رسمی', reset: 'گفتگوی جدید', send: 'ارسال پیام',
      copy: 'کپی پاسخ', copied: 'کپی شد', you: 'شما', assistant: 'تیسا',
      error: 'در حال حاضر ارتباط با سرویس پاسخ‌گویی برقرار نیست. لطفاً دوباره تلاش کنید یا از طریق وب‌سایت رسمی با ما در ارتباط باشید.',
      quota: 'ظرفیت رایگان پاسخ‌گویی امروز تکمیل شده است. لطفاً فردا دوباره مراجعه کنید یا با تیم ما تماس بگیرید.',
      tooLong: 'متن پیام نباید بیشتر از ۱۲۰۰ نویسه باشد.',
      unknown: 'در اطلاعات عمومی من پاسخ تأییدشده‌ای برای این سؤال وجود ندارد. می‌توانید درباره خدمات، فناوری‌ها، محصولات و همکاری سؤال کنید یا از طریق وب‌سایت رسمی با تیم نوین‌استک در ارتباط باشید.',
      moreInfo: 'اطلاعات بیشتر',
      prompts: [
        'نوین‌استک چه خدماتی ارائه می‌دهد؟',
        'برای شروع یک پروژه نرم‌افزاری چه کار کنم؟',
        'در حوزه هوش مصنوعی چه فعالیت‌هایی دارید؟',
        'چه محصولاتی منتشر کرده‌اید؟',
        'آیا برای کسب‌وکارها اتوماسیون طراحی می‌کنید؟',
        'برای ساخت یک وب‌اپلیکیشن از کجا شروع کنم؟',
        'تفاوت MVP با محصول نهایی چیست؟',
        'چه فناوری‌هایی در پروژه‌ها استفاده می‌کنید؟',
        'تیسا کیست؟',
        'آیا دوره یا محتوای آموزشی دارید؟',
        'چطور هزینه پروژه برآورد می‌شود؟',
        'از کجا پروژه‌های GitHub را ببینم؟'
      ],
      topics: {
        services: 'نوین‌استک چه خدمات نرم‌افزاری ارائه می‌دهد؟',
        ai: 'در زمینه هوش مصنوعی و اتوماسیون چه فعالیت‌هایی دارید؟',
        collaboration: 'برای شروع همکاری یا سفارش پروژه چه کار کنم؟',
        learning: 'نوین‌استک برای آموزش و توسعه‌دهندگان چه برنامه‌ای دارد؟',
        products: 'پروژه‌ها و محصولات عمومی نوین‌استک را از کجا ببینم؟',
        technology: 'چه فناوری‌هایی در پروژه‌های نوین‌استک استفاده می‌شود؟'
      }
    },
    en: {
      eyebrow: 'NOVINSTACK AI ASSISTANT', heroTitle: 'Hi, I’m <em>Tisa.</em>',
      heroText: 'NovinStack’s intelligent assistant, bringing our ideas to life through clear answers and useful guidance.',
      topicsLabel: 'EXPLORE A TOPIC', topicServices: 'Software engineering', topicAI: 'Applied AI & automation',
      topicCollab: 'Projects & collaboration', topicLearning: 'Learning & developers',
      topicProducts: 'Products & projects', topicTech: 'Technologies & architecture',
      tagline: 'From Knowledge to Product', visitSite: 'Explore NovinStack', assistantName: 'Tisa',
      basicMode: 'NovinStack knowledge guide', aiMode: 'NovinStack AI assistant',
      welcomeKicker: 'TISA · NOVINSTACK', welcomeTitle: 'Hello! What would you like to know?',
      welcomeDesc: 'I’m Tisa, NovinStack’s intelligent assistant. Ask about our services, technologies, products, and collaboration.',
      suggestionsTitle: 'START WITH A QUESTION', moreQuestions: 'More questions', lessQuestions: 'Show fewer questions',
      inputLabel: 'Write your message', placeholder: 'Ask Tisa about NovinStack…',
      noticeBasic: 'Answers are based on NovinStack’s public knowledge guide.',
      noticeAI: 'Tisa answers using public NovinStack information; confirm project-specific details with our team.',
      noticeCaptcha: 'Please complete the security check before sending your message.',
      privacy: 'Please do not share personal or confidential information.',
      privacyAI: 'Messages are processed by an AI provider; please do not share sensitive information.',
      officialSite: 'Official website', reset: 'New conversation', send: 'Send message',
      copy: 'Copy answer', copied: 'Copied', you: 'You', assistant: 'Tisa',
      error: 'Tisa is temporarily unable to connect. Please try again or reach our team through the official website.',
      quota: 'Today’s free AI capacity has been reached. Please try again tomorrow or contact our team.',
      tooLong: 'Messages must be 1,200 characters or fewer.',
      unknown: 'I don’t have verified public information to answer that precisely. You can ask about services, technologies, projects, or collaboration, or contact the team through our official website.',
      moreInfo: 'Learn more',
      prompts: [
        'What services does NovinStack offer?',
        'How do we start a software project?',
        'What do you offer in applied AI?',
        'Which public products have you released?',
        'Can you automate business workflows?',
        'How do we plan a web application?',
        'What is an MVP?',
        'Which technologies do you work with?',
        'Who is Tisa?',
        'Do you offer learning resources?',
        'How is project pricing estimated?',
        'Where can I find your GitHub projects?'
      ],
      topics: {
        services: 'What software engineering services does NovinStack offer?',
        ai: 'How does NovinStack work with applied AI and automation?',
        collaboration: 'How can we start a project with NovinStack?',
        learning: 'What does NovinStack offer for learners and developers?',
        products: 'Where can I explore NovinStack’s public products and projects?',
        technology: 'What technologies are relevant to NovinStack projects?'
      }
    }
  };

  function svg(name) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#' + name);
    s.appendChild(use);
    return s;
  }

  function normalize(text) {
    return String(text).toLowerCase()
      .replace(/[\u200c\u200d]/g, ' ')
      .replace(/ي/g, 'ی').replace(/ك/g, 'ک')
      .replace(/[\u064b-\u065f]/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  function basicAnswer(question) {
    const q = normalize(question);
    const ranked = FAQ.map(item => {
      const score = (item.terms || []).reduce((total, term) => {
        const t = normalize(term);
        if (!t || !q.includes(t)) return total;
        const weight = item.id === 'brand' ? 0.32 : item.id === 'tisa' ? 0.7 : 1;
        return total + (1 + Math.min(t.length, 20) / 8) * weight;
      }, 0);
      return { item, score };
    }).sort((a, b) => b.score - a.score);
    const match = ranked[0];
    if (match?.score > 0) return {text: match.item[lang], url: match.item.url};
    return {text: i18n[lang].unknown, url:'https://novinstack.com/contact'};
  }

  function updateSend() {
    sendButton.disabled = busy || !input.value.trim();
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 135) + 'px';
  }

  function renderPrompts() {
    const box = el('quick-prompts');
    box.replaceChildren();
    const list = expanded ? i18n[lang].prompts : i18n[lang].prompts.slice(0, 6);
    for (const question of list) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'prompt';
      const text = document.createElement('span');
      text.textContent = question;
      button.append(text, svg('i-arrow'));
      button.addEventListener('click', () => ask(question));
      box.appendChild(button);
    }
    moreButton.setAttribute('aria-expanded', String(expanded));
    moreButton.querySelector('span').textContent = expanded ? i18n[lang].lessQuestions : i18n[lang].moreQuestions;
  }

  function setLanguage(next) {
    lang = next;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.title = lang === 'fa' ? 'تیسا | دستیار هوشمند نوین‌استک' : 'Tisa | NovinStack AI Assistant';
    const t = i18n[lang];
    document.querySelectorAll('[data-i18n]').forEach(node => {
      const value = t[node.dataset.i18n];
      if (value !== undefined) node.textContent = value;
    });
    // Only fixed, trusted strings are allowed to contain HTML markup.
    document.querySelectorAll('[data-i18n-html]').forEach(node => {
      const key = node.dataset.i18nHtml;
      if (key === 'heroTitle') node.innerHTML = t.heroTitle;
    });
    input.placeholder = t.placeholder;
    input.setAttribute('aria-label', t.inputLabel);
    for (const option of document.querySelectorAll('.language-option')) {
      option.setAttribute('aria-pressed', String(option.dataset.lang === lang));
    }
    el('reset-button').setAttribute('aria-label', t.reset);
    el('reset-button').title = t.reset;
    sendButton.setAttribute('aria-label', t.send);
    sendButton.title = t.send;
    el('mode-status').textContent = aiConfigured ? t.aiMode : t.basicMode;
    el('status-dot').classList.toggle('is-ai', aiConfigured);
    el('notice-text').textContent = aiConfigured ? t.noticeAI : t.noticeBasic;
    document.querySelector('[data-i18n="privacy"]').textContent = aiConfigured ? t.privacyAI : t.privacy;
    for (const item of messages.querySelectorAll('.message')) {
      const role = item.classList.contains('user') ? 'user' : 'assistant';
      const label = item.querySelector('.message-label');
      if (label) label.textContent = t[role === 'user' ? 'you' : 'assistant'];
    }
    renderPrompts();
  }

  function scrollBottom() {
    area.scrollTo({top: area.scrollHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }

  function addMessage(role, text, url) {
    welcome.hidden = true;
    const item = document.createElement('article');
    item.className = 'message ' + role;
    if (role === 'assistant') {
      const avatar = document.createElement('span');
      avatar.className = 'message-avatar';
      const img = document.createElement('img');
      img.src = './novinstack-logo.png';
      img.alt = '';
      img.width = 20;
      img.height = 29;
      avatar.appendChild(img);
      item.appendChild(avatar);
    }
    const content = document.createElement('div');
    content.className = 'message-content';
    const label = document.createElement('span');
    label.className = 'message-label';
    label.textContent = role === 'user' ? i18n[lang].you : i18n[lang].assistant;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.dir = 'auto';
    bubble.textContent = text;
    content.append(label, bubble);
    if (role === 'assistant') {
      const actions = document.createElement('div');
      actions.className = 'message-actions';
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.type = 'button';
      copyButton.append(svg('i-copy'), document.createTextNode(i18n[lang].copy));
      copyButton.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(text); copyButton.lastChild.textContent = i18n[lang].copied; }
        catch { /* Clipboard can be blocked on non-HTTPS origins. */ }
      });
      actions.appendChild(copyButton);
      if (url) {
        const link = document.createElement('a');
        link.className = 'copy-button';
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.append(svg('i-external'), document.createTextNode(i18n[lang].moreInfo));
        actions.appendChild(link);
      }
      content.appendChild(actions);
    }
    item.appendChild(content);
    messages.appendChild(item);
    scrollBottom();
  }

  function showNotice(text) { el('notice-text').textContent = text; }

  async function ask(value) {
    if (busy) return;
    const question = String(value || '').trim();
    if (!question) return;
    if (question.length > 1200) { showNotice(i18n[lang].tooLong); return; }
    if (aiConfigured && !captchaToken) {
      input.value = question;
      updateSend();
      showNotice(i18n[lang].noticeCaptcha);
      el('turnstile-wrap').scrollIntoView({block:'nearest'});
      return;
    }
    input.value = '';
    updateSend();
    const past = history.slice(-8);
    addMessage('user', question);
    history.push({role:'user', content:question});
    busy = true;
    typing.hidden = false;
    updateSend();
    scrollBottom();
    const current = ++requestId;
    try {
      let result;
      if (aiConfigured) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 28000);
        try {
          const response = await fetch(apiBase + '/chat', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({message:question, history:past, language:lang, turnstileToken:captchaToken}),
            signal:controller.signal
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            const error = new Error(data.error || 'API unavailable');
            error.code = data.code || '';
            throw error;
          }
          if (typeof data.answer !== 'string' || !data.answer.trim()) throw new Error('Empty answer');
          result = {text:data.answer.trim()};
        } finally {
          clearTimeout(timeout);
          captchaToken = '';
          if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 180));
        result = basicAnswer(question);
      }
      if (current !== requestId) return;
      addMessage('assistant', result.text, result.url);
      history.push({role:'assistant', content:result.text});
      showNotice(aiConfigured ? i18n[lang].noticeAI : i18n[lang].noticeBasic);
    } catch (error) {
      if (current !== requestId) return;
      const errorText = error?.code === 'DAILY_LIMIT' ? i18n[lang].quota : i18n[lang].error;
      addMessage('assistant', errorText);
      showNotice(errorText);
      history.pop();
    } finally {
      if (current === requestId) {
        busy = false;
        typing.hidden = true;
        updateSend();
        input.focus();
      }
    }
  }

  function reset() {
    requestId++;
    busy = false;
    history = [];
    messages.replaceChildren();
    welcome.hidden = false;
    typing.hidden = true;
    input.value = '';
    expanded = false;
    renderPrompts();
    updateSend();
    showNotice(aiConfigured ? i18n[lang].noticeAI : i18n[lang].noticeBasic);
    if (widgetId !== null && window.turnstile) {
      captchaToken = '';
      window.turnstile.reset(widgetId);
    }
    area.scrollTop = 0;
    input.focus();
  }

  function initTurnstile() {
    if (!aiConfigured) return;
    el('turnstile-wrap').hidden = false;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.turnstile) return;
      widgetId = window.turnstile.render('#turnstile-widget', {
        sitekey:siteKey,
        callback:token => {captchaToken = token; showNotice(i18n[lang].noticeAI);},
        'expired-callback':() => {captchaToken = ''; showNotice(i18n[lang].noticeCaptcha);},
        'error-callback':() => {captchaToken = ''; showNotice(i18n[lang].noticeCaptcha);}
      });
    };
    script.onerror = () => showNotice(i18n[lang].noticeCaptcha);
    document.head.appendChild(script);
  }

  form.addEventListener('submit', event => {event.preventDefault(); ask(input.value);});
  input.addEventListener('input', updateSend);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      ask(input.value);
    }
  });
  document.querySelectorAll('.language-option').forEach(button => {
    button.addEventListener('click', () => setLanguage(button.dataset.lang));
  });
  el('reset-button').addEventListener('click', reset);
  moreButton.addEventListener('click', () => {expanded = !expanded; renderPrompts();});
  document.querySelectorAll('[data-topic]').forEach(button => {
    button.addEventListener('click', () => ask(i18n[lang].topics[button.dataset.topic]));
  });

  setLanguage('fa');
  updateSend();
  initTurnstile();
})();
