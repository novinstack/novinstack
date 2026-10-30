(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  let lang = 'fa';
  let stack = [];
  let running = false;
  let activeStep = 0;

  const messages = {
    fa: {
      eyebrow: 'آزمایشگاه تعاملی مهندسی نرم‌افزار', hero1: 'دانش را وارد کن.', hero2: 'محصول را بساز.',
      intro: 'این یک ویترین تصویری نیست؛ دستورهای پشته واقعاً در مرورگر اجرا می‌شوند. چرخه مهندسی محصول هم به‌صورت شبیه‌سازی تعاملی در دسترس است.',
      runtime: 'اجرای محلی', execute: 'اجرا', terminalNote: 'دستورها در مرورگر خودتان اجرا می‌شوند؛ هیچ داده‌ای به سرور ارسال نمی‌شود.',
      live: 'زنده', stackTitle: 'پشته زنده', stackDesc: 'آخرین ورودی، اولین خروجی. با push و pop مفهوم نام Stack را عملاً تجربه کن.',
      empty: 'پشته خالی است — push را امتحان کن', stackValueLabel: 'مقدار جدید', depth: 'عمق پشته', top: 'بالای پشته',
      signature: 'از یادگیری تا ساخت محصول', pipelineTitle: 'مسیر ساخت محصول',
      pipelineDesc: 'این بخش یک شبیه‌سازی از فرایند است، نه اجرای واقعی Build یا Deploy.', simulate: 'نمایش فرایند ↗',
      footerName: 'نوین‌استک / نوین استک',
      boot: 'NovinStack Build Console آماده است. برای شروع help را اجرا کن.',
      help: 'دستورها: help · about · mission · push <value> · pop · peek · stack · size · flow · run · clear · reset · lang fa|en · theme dark|light',
      about: 'NovinStack / نوین‌استک — گروه نرم‌افزاری و فناوری. نام جایگزین: نوین استک / Novin Stack.',
      mission: 'From Knowledge to Product — از یادگیری تا ساخت محصول.',
      usagePush: 'نمونه: push "Software"',
      pushed: (v) => `مقدار «${v}» وارد پشته شد.`,
      popped: (v) => `مقدار «${v}» از بالای پشته خارج شد.`,
      peek: (v) => `بالای پشته: ${v}`,
      size: (n) => `تعداد عناصر پشته: ${n}`,
      emptyStack: 'پشته خالی است.',
      fullStack: 'ظرفیت نمایش پشته ۸ عنصر است؛ برای ادامه pop را اجرا کن.',
      all: (items) => `پشته (از پایین به بالا): ${items.join(' → ')}`,
      flow: 'LEARN → ANALYZE → ARCHITECT → BUILD → SHIP → IMPROVE',
      reset: 'پشته بازنشانی شد.',
      unknown: (x) => `دستور ناشناخته: ${x}. برای راهنما help را اجرا کن.`,
      language: 'زبان فارسی فعال شد.', theme: 'حالت نمایش تغییر کرد.',
      running: 'شبیه‌سازی مسیر ساخت محصول آغاز شد (بدون ساخت یا استقرار واقعی).',
      finished: 'شبیه‌سازی کامل شد. این اجرا صرفاً نمایش فرایند بود.',
      busy: 'شبیه‌سازی در حال اجراست.',
    },
    en: {
      eyebrow: 'Interactive software engineering playground', hero1: 'Knowledge is input.', hero2: 'Products are output.',
      intro: 'Not just a static snippet. Stack commands execute locally in your browser, while the product lifecycle can be explored as an interactive simulation.',
      runtime: 'LOCAL RUNTIME', execute: 'RUN', terminalNote: 'Commands run in your browser; no command data is sent to a server.',
      live: 'LIVE', stackTitle: 'Live stack', stackDesc: 'Last In, First Out. Try push and pop to explore the data structure behind our name.',
      empty: 'Stack is empty — try push', stackValueLabel: 'New value', depth: 'Stack depth', top: 'Top item',
      signature: 'From Knowledge to Product', pipelineTitle: 'Product lifecycle',
      pipelineDesc: 'This is a process visualization—not a real software build or deployment.', simulate: 'RUN SIMULATION ↗',
      footerName: 'نوین‌استک / نوین استک',
      boot: 'NovinStack Build Console ready. Type help to get started.',
      help: 'Commands: help · about · mission · push <value> · pop · peek · stack · size · flow · run · clear · reset · lang fa|en · theme dark|light',
      about: 'NovinStack / Novin Stack — software engineering and technology group. Persian: نوین‌استک / نوین استک.',
      mission: 'From Knowledge to Product.',
      usagePush: 'Example: push "Software"',
      pushed: (v) => `Pushed "${v}" onto the stack.`,
      popped: (v) => `Popped "${v}" from the stack.`,
      peek: (v) => `Top of stack: ${v}`,
      size: (n) => `Stack size: ${n}`,
      emptyStack: 'Stack is empty.',
      fullStack: 'The visual stack holds up to 8 items. Try pop.',
      all: (items) => `Stack (bottom to top): ${items.join(' → ')}`,
      flow: 'LEARN → ANALYZE → ARCHITECT → BUILD → SHIP → IMPROVE',
      reset: 'Stack reset.',
      unknown: (x) => `Unknown command: ${x}. Type help for options.`,
      language: 'English enabled.', theme: 'Theme changed.',
      running: 'Product lifecycle simulation started (no actual build or deployment).',
      finished: 'Simulation complete. This was a process visualization only.',
      busy: 'Simulation already running.',
    }
  };

  const stages = [
    {en: 'Learning', fa: 'یادگیری', detailEn:'Explore knowledge, research, and the problem space.', detailFa:'یادگیری، پژوهش و شناخت زمینه مسئله.'},
    {en: 'Analysis', fa: 'تحلیل', detailEn:'Define requirements, boundaries, and success criteria.', detailFa:'تعیین نیازمندی‌ها، محدوده و معیارهای موفقیت.'},
    {en: 'Architecture', fa: 'معماری', detailEn:'Design coherent systems and choose the right trade-offs.', detailFa:'طراحی سیستم منسجم و انتخاب مصالحه‌های فنی مناسب.'},
    {en: 'Development', fa: 'توسعه', detailEn:'Implement tested and maintainable software increments.', detailFa:'پیاده‌سازی مرحله‌ای با تأکید بر آزمون و نگهداشت‌پذیری.'},
    {en: 'Delivery', fa: 'عرضه', detailEn:'Prepare a release and deliver usable value.', detailFa:'آماده‌سازی انتشار و ارائه ارزش قابل استفاده.'},
    {en: 'Iteration', fa: 'بهبود', detailEn:'Measure feedback, learn, and refine the product.', detailFa:'دریافت بازخورد، یادگیری و بهبود مستمر محصول.'}
  ];

  const tr = (key, ...args) => {
    const v = messages[lang][key];
    return typeof v === 'function' ? v(...args) : v;
  };
  function log(text, kind = 'info') {
    const el = document.createElement('div');
    el.className = `log-row ${kind}`;
    el.textContent = text;
    el.setAttribute('dir', 'auto');
    $('terminalOutput').appendChild(el);
    $('terminalOutput').scrollTop = $('terminalOutput').scrollHeight;
  }
  function renderStack(){
    const list = $('stackItems');
    list.replaceChildren();
    stack.forEach((value, idx) => {
      const item = document.createElement('div');
      item.className = 'stack-item';
      const index = document.createElement('small');
      index.textContent = String(idx).padStart(2,'0');
      const label = document.createElement('span');
      label.textContent = value;
      item.append(index,label);
      list.appendChild(item);
    });
    $('stackEmpty').hidden = stack.length > 0;
    $('stackCount').textContent = String(stack.length);
    $('stackTop').textContent = stack.at(-1) || '—';
  }
  function setStage(index){
    activeStep = index;
    $('stageName').textContent = ['LEARN','ANALYZE','ARCHITECT','BUILD','SHIP','IMPROVE'][index];
    $('stageDetail').textContent = lang === 'fa' ? stages[index].detailFa : stages[index].detailEn;
    $('stageCount').textContent = `${String(index+1).padStart(2,'0')} / 06`;
    document.querySelectorAll('.pipeline-step').forEach((el, i) => {
      el.classList.toggle('active', i === index);
      el.setAttribute('aria-pressed', i === index ? 'true' : 'false');
    });
  }
  function setLanguage(next){
    lang = next === 'en' ? 'en' : 'fa';
    root.lang = lang;
    root.dir = lang === 'fa' ? 'rtl' : 'ltr';
    $('langToggle').textContent = lang === 'fa' ? 'EN' : 'فا';
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = tr(el.dataset.i18n); });
    document.querySelectorAll('[data-step-label]').forEach((el) => {
      const index = Number(el.dataset.stepLabel);
      el.textContent = lang === 'fa' ? stages[index].fa : stages[index].en;
    });
    setStage(activeStep);
  }
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  async function simulate(){
    if (running) {log(tr('busy'), 'muted'); return;}
    running = true;
    $('pipelineButton').disabled = true;
    document.querySelectorAll('.pipeline-step').forEach(el => el.classList.remove('completed'));
    log(tr('running'), 'gold');
    for(let i=0;i<stages.length;i++){
      setStage(i);
      log(`${String(i+1).padStart(2,'0')}/06  ${['LEARN','ANALYZE','ARCHITECT','BUILD','SHIP','IMPROVE'][i]} ✓`, 'success');
      document.querySelector(`.pipeline-step[data-step="${i}"]`).classList.add('completed');
      await sleep(340);
    }
    log(tr('finished'), 'gold');
    running = false;
    $('pipelineButton').disabled = false;
  }
  function tokenize(raw) {
    const tokens=[];
    const rx = /"([^"]*)"|'([^']*)'|(\S+)/g;
    let match;
    while((match=rx.exec(raw))!==null){tokens.push(match[1]??match[2]??match[3]);}
    return tokens;
  }
  async function execute(raw){
    const input = raw.trim();
    if(!input) return;
    log(input,'command');
    const args = tokenize(input);
    const cmd = (args[0]||'').toLowerCase();
    switch(cmd){
      case 'help': log(tr('help'),'muted'); break;
      case 'about': log(tr('about'),'success'); break;
      case 'mission': log(tr('mission'),'gold'); break;
      case 'push': {
        const value=args.slice(1).join(' ').trim();
        if(!value){log(tr('usagePush'),'error'); break;}
        if(stack.length>=8){log(tr('fullStack'),'error'); break;}
        stack.push(value.slice(0,26)); renderStack(); log(tr('pushed',stack.at(-1)),'success'); break;
      }
      case 'pop': {
        if(!stack.length){log(tr('emptyStack'),'error');break;}
        const value=stack.pop(); renderStack();log(tr('popped',value),'success');break;
      }
      case 'peek': log(stack.length?tr('peek',stack.at(-1)):tr('emptyStack'),stack.length?'success':'error');break;
      case 'stack': log(stack.length?tr('all',stack):tr('emptyStack'),'muted');break;
      case 'size': log(tr('size',stack.length),'success');break;
      case 'flow': log(tr('flow'),'gold');break;
      case 'run': case 'build': await simulate();break;
      case 'reset': stack=[];renderStack();log(tr('reset'),'success');break;
      case 'clear': $('terminalOutput').replaceChildren();break;
      case 'lang': {
        if(!['fa','en'].includes(args[1])) {log('Usage: lang fa | lang en','error');break;}
        setLanguage(args[1]);log(tr('language'),'success');break;
      }
      case 'theme': {
        if(!['dark','light'].includes(args[1])){log('Usage: theme dark | theme light','error');break;}
        document.body.classList.toggle('light',args[1]==='light');log(tr('theme'),'success');break;
      }
      default: log(tr('unknown',cmd),'error');
    }
  }
  $('terminalForm').addEventListener('submit',(event)=>{
    event.preventDefault();
    const el=$('commandInput');const value=el.value;el.value='';void execute(value);
    el.focus();
  });
  document.querySelectorAll('[data-command]').forEach(btn => btn.addEventListener('click',()=>{
    void execute(btn.dataset.command);$('commandInput').focus();
  }));
  $('pushButton').addEventListener('click',()=>{
    const value=$('stackValue').value.trim() || 'Idea';
    $('stackValue').value='';void execute(`push "${value.replaceAll('"','')}"`);
  });
  $('stackValue').addEventListener('keydown', (event)=>{if(event.key==='Enter'){event.preventDefault();$('pushButton').click();}});
  $('popButton').addEventListener('click',()=>{void execute('pop');});
  $('pipelineButton').addEventListener('click',()=>{void execute('run');});
  $('langToggle').addEventListener('click',()=>{setLanguage(lang==='fa'?'en':'fa');});
  $('themeToggle').addEventListener('click',()=>{document.body.classList.toggle('light');});
  document.querySelectorAll('.pipeline-step').forEach(btn => btn.addEventListener('click',()=>{if(!running)setStage(Number(btn.dataset.step));}));
  $('year').textContent = String(new Date().getFullYear());
  setLanguage('fa');renderStack();log('NOVINSTACK · BUILD CONSOLE v1.0','gold');log(tr('boot'),'muted');setStage(0);
})();
