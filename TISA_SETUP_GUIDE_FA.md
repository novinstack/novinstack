# راهنمای جامع نصب، انتشار و نگهداری تیسا | NovinStack Tisa

> **نسخه اجرایی — ۳۱ اکتبر ۲۰۲۶**  
> این سند فقط برای استفاده داخلی و محلی است؛ طبق `.gitignore` ریشه مخزن در GitHub منتشر نمی‌شود.

## ۱. هدف و معماری پروژه

**تیسا** دستیار هوشمند و مجری اندیشه‌های نوین‌استک است. رابط عمومی آن از GitHub Pages ارائه می‌شود و پاسخ‌های هوشمند از طریق Cloudflare Workers AI پردازش می‌شوند. Cloudflare Turnstile از مسیر ارسال پیام در برابر بخشی از درخواست‌های خودکار محافظت می‌کند.

```text
بازدیدکننده
    │
    ▼
GitHub Pages: https://novinstack.github.io/novinstack/
    │  docs/index.html + styles.css + app.js + faq.js
    │  docs/config.js (فقط اطلاعات عمومی)
    │
    ├── Turnstile → دریافت توکن تأیید مرورگر
    │
    ▼
Cloudflare Worker: https://<worker-name>.<subdomain>.workers.dev/chat
    │  بررسی Origin و اعتبارسنجی توکن با Siteverify
    │  TURNSTILE_SECRET_KEY (فقط در Secrets حساب Cloudflare)
    │
    ▼
Cloudflare Workers AI (AI binding) + worker/src/knowledge.js
    │
    ▼
پاسخ فارسی / انگلیسی برای بازدیدکننده
```

- **GitHub:** `https://github.com/novinstack/novinstack`
- **سایت تیسا:** `https://novinstack.github.io/novinstack/`
- **سایت برند:** `https://novinstack.com/`
- **حساب‌ها:** GitHub برای سورس، Cloudflare برای Worker، Workers AI و Turnstile.
- **هزینه:** نسخه Workers AI در پلن رایگان سهمیه دارد، نه استفاده نامحدود. طبق مستندات فعلی Cloudflare، سهمیه رایگان ۱۰٬۰۰۰ Neurons در روز است؛ مصرف به مدل و طول ورودی/خروجی وابسته است. سهمیه در ۰۰:۰۰ UTC بازنشانی می‌شود. فعال‌کردن پلن پولی تصمیم جداگانه است.

### نقش هر پوشه و فایل

```text
novinstack/
├── .git/                         ← تاریخچه محلی Git؛ هرگز حذف نکن
├── .gitignore                   ← این فایل باید در GitHub باشد
├── TISA_SETUP_GUIDE_FA.md       ← فقط محلی؛ به GitHub ارسال نشود
├── README.md                    ← معرفی فارسی برند و لینک تیسا
├── README_EN.md                 ← معرفی انگلیسی برند و لینک تیسا
├── assets/                      ← تصاویر مورد استفاده README
│   ├── hero.svg
│   ├── workflow.svg
│   ├── footer.svg
│   ├── tisa-banner-fa.png
│   ├── tisa-banner-en.png
│   ├── novinstack-logo-transparent.png
│   └── novinstack-original-hq.jpg
├── docs/                        ← سایت استاتیک منتشرشده در GitHub Pages
│   ├── .nojekyll
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── faq.js
│   ├── config.js              ← آدرس Worker + Site Key عمومی
│   ├── favicon.svg            ← در صورت وجود در نسخه فعلی
│   ├── novinstack-logo.png
│   ├── flags/
│   │   ├── ir.svg
│   │   └── gb.svg
│   └── ...                    ← فونت‌ها و سایر دارایی‌های موجود
└── worker/                      ← API سمت سرور
    ├── package.json
    ├── package-lock.json        ← اگر npm آن را ساخته، نگه دار
    ├── wrangler.toml
    ├── .gitignore               ← اگر از قبل هست، می‌تواند بماند
    ├── README.md               ← راهنمای داخلی Worker، اگر موجود است
    └── src/
        ├── index.js
        └── knowledge.js
```

**نکته:** این درخت، ساختار مورد انتظار از بسته‌های فعلی NovinStack است؛ ممکن است در مخزن واقعی فایل‌های تصویری یا جانبی بیشتری وجود داشته باشند. فایل موجود را بدون دلیل حذف نکن. پوشه‌های `node_modules` و `.wrangler` ساخته می‌شوند ولی نباید Commit شوند. `docs/config.js` عمومی است و باید در Git باقی بماند. `worker/src/knowledge.js` مبنای دانش برند برای مدل است؛ فایل `docs/faq.js` پاسخ‌ها/پیشنهادهای محلی رابط را مدیریت می‌کند.

---

## ۲. پیش‌نیازها (از صفر)

۱. **Git** و **VS Code** نصب باشند؛ در ترمینال PowerShell بررسی کن:

```powershell
git --version
node --version
npm --version
```

۲. برای Wrangler، نسخه پشتیبانی‌شده Node.js را نصب کن (ترجیحاً نسخه LTS روز). اگر دستورهای `node` یا `npm` شناسایی نشدند، Node.js را نصب و VS Code را دوباره باز کن.

۳. به حساب GitHub دارای دسترسی نوشتن روی `novinstack/novinstack` و حساب Cloudflare دسترسی داشته باش.

۴. اگر مخزن را قبلاً Clone کرده‌ای، **از همان پوشه موجود استفاده کن**. از `git init`، ساخت مخزن جدید، حذف `.git` و Force Push استفاده نکن.

### Clone فقط برای نصب تازه

```powershell
# تنها در صورتی که هنوز مخزن را روی سیستم نداری:
git clone https://github.com/novinstack/novinstack.git
cd novinstack
code .
```

### بررسی وضعیت مخزن موجود

```powershell
# در ترمینال VS Code از هر زیرپوشه، ابتدا به ریشه مخزن برو:
cd (git rev-parse --show-toplevel)
git status
git branch --show-current
git remote -v
```

خروجی شاخه باید `main` و remote باید `https://github.com/novinstack/novinstack.git` باشد. اگر فایل‌های محلی ویرایش‌نشده داری، پیش از Pull آن‌ها را Commit یا ذخیره کن. فقط وقتی Working Tree تمیز است:

```powershell
git pull --ff-only origin main
```

---

## ۳. ساخت ویجت Turnstile از ابتدا تا انتها

۱. وارد `https://dash.cloudflare.com/` شو.
۲. از منوی Cloudflare، **Turnstile** را انتخاب کن و روی **Add widget** بزن.
۳. فیلدها را دقیقاً به شکل زیر پر کن:

| فیلد Cloudflare | مقدار پیشنهادی | توضیح |
|---|---|---|
| **Widget name** | `NovinStack Tisa Assistant` | نام داخلی و قابل تشخیص |
| **Hostname Management → Hostnames** | `novinstack.github.io` | بدون `https://`، بدون `/novinstack/` و بدون `/` انتهایی |
| **Widget Mode** | **Managed** | حالت توصیه‌شده؛ بررسی بر اساس ریسک بازدیدکننده |
| **Skip future security rule challenges / Pre-clearance** | **Off** | برای این استقرار روی GitHub Pages لازم نیست |

۴. روی **Create** بزن.
۵. دو مقدار دریافت می‌کنی:
   - **Site Key:** عمومی؛ باید در `docs/config.js` ثبت شود.
   - **Secret Key:** محرمانه؛ فقط در **Cloudflare Worker Secrets** ثبت می‌شود.
۶. کلید محرمانه را در فایل، اسکرین‌شات عمومی، چت، GitHub یا README منتشر نکن. اگر افشا شد، آن را از داشبورد Turnstile بازتولید/تعویض کن.

**اگر قبلاً ویجت ساخته‌ای:** نیازی به ساخت دوباره نیست. از همان ویجت و کلیدهای موجود استفاده کن. در آینده اگر تیسا روی `novinstack.com` منتشر شد، دامنه جدید را به Hostnames همان ویجت اضافه کن و تنظیم Origin Worker را نیز به‌روزرسانی کن.

**چرا فقط Site Key کافی نیست؟** Turnstile در مرورگر یک توکن صادر می‌کند و Worker باید آن را از طریق `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` تأیید کند. توکن‌ها ۵ دقیقه اعتبار دارند و فقط یک‌بار قابل استفاده‌اند. کد فعلی Worker این اعتبارسنجی سمت سرور را انجام می‌دهد. برای ارسال هر پیام باید توکن معتبر/تازه در دسترس باشد.

**تست محلی:** ویجت Turnstile روی `file://` اجرا نمی‌شود. برای آزمایش مرورگر از سایت HTTPS منتشرشده یا سرور محلی HTTP با تنظیمات دامنه/کلید تست مناسب استفاده کن. برای استقرار عمومی از Site Key واقعی استفاده کن.

---

## ۴. آماده‌سازی Cloudflare Worker و Workers AI رایگان

از ریشه مخزن در PowerShell:

```powershell
cd worker
npm install
npx wrangler --version
npx wrangler login
npx wrangler whoami
```

- `npm install` وابستگی‌های پروژه را نصب می‌کند و ممکن است `package-lock.json` بسازد؛ فایل lock را برای نصب قابل تکرار در Git نگه دار.
- `wrangler login` مرورگر را باز می‌کند؛ با همان حساب Cloudflare که Turnstile را ساخته‌ای وارد شو.
- در صورت داشتن چند حساب Cloudflare، مطمئن شو حساب درست انتخاب شده است.

### بررسی `worker/wrangler.toml`

این نمونه مطابق نسخه رایگان قبلی تیساست؛ اگر تنظیمات فعال تو درست کار می‌کنند، آن‌ها را بی‌دلیل تغییر نده:

```toml
name = "novinstack-assistant-api"
main = "src/index.js"
compatibility_date = "2025-06-01"

[ai]
binding = "AI"

[vars]
ALLOWED_ORIGIN = "https://novinstack.github.io"
AI_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8-fast"
```

- `[ai] binding = "AI"` اتصال Worker به Workers AI است؛ **کلید OpenAI لازم نیست**.
- `ALLOWED_ORIGIN` باید با Origin صفحه بازدیدکننده یکی باشد؛ در GitHub Pages فعلی، `https://novinstack.github.io` است (بدون مسیر `/novinstack/`).
- اگر آدرس سفارشی دیگری اضافه شد، Origin آن نیز باید در لیست مجاز قرار گیرد. کد فعلی مقادیر جداشده با ویرگول را می‌پذیرد.
- اگر مدل دیگر انتخاب می‌کنی، ابتدا رایگان‌بودن و پشتیبانی آن را در مستندات فعلی Cloudflare بررسی کن؛ برخی مدل‌ها نیازمند صورتحساب پولی‌اند.

### انتشار Worker

```powershell
# در پوشه worker:
npx wrangler deploy
```

اگر پرسید `Would you like to register a workers.dev subdomain now? (Y/n)`، گزینه `Y` را بزن. نام زیر‌دامنه حساب را در صورت امکان `novinstack` انتخاب کن؛ آزاد بودن نام تضمین‌شده نیست.

پس از انتشار، Wrangler نشانی واقعی Worker را نمایش می‌دهد؛ **آدرس خروجی ترمینال را ملاک قرار بده**، نه یک آدرس حدسی. قالب معمول:

```text
https://novinstack-assistant-api.YOUR-SUBDOMAIN.workers.dev
```

نشانی Worker را بدون `/chat` برای فایل تنظیمات یادداشت کن. **اگر Worker فعلی فعال است، همان آدرس را حفظ کن و Worker موازی نساز.**

---

## ۵. ثبت Secret Key به شکل امن

در پوشه `worker` اجرا کن:

```powershell
npx wrangler secret put TURNSTILE_SECRET_KEY
```

وقتی ترمینال مقدار را خواست، **Secret Key ویجت Turnstile** را Paste کن و Enter بزن. این دستور مقدار محرمانه را در حساب Cloudflare ذخیره می‌کند؛ آن را در فایل `wrangler.toml` یا `docs/config.js` قرار نده.

برای بررسی اینکه *نام* Secret وجود دارد (بدون نمایش مقدار):

```powershell
npx wrangler secret list
```

باید `TURNSTILE_SECRET_KEY` را ببینی. طبق مستندات فعلی، `wrangler secret put` یک نسخه جدید Worker را هم منتشر می‌کند؛ اگر بعداً سورس را تغییر دادی، با `npx wrangler deploy` مجدداً منتشر کن.

---

## ۶. اتصال رابط GitHub Pages به Worker

از پوشه `worker` به ریشه مخزن برگرد:

```powershell
cd ..
code docs/config.js
```

ساختار فایل عمومی باید مانند زیر باشد؛ نام متغیرها را تغییر نده:

```javascript
/* Public config: NEVER put private secrets here. */
window.NOVINSTACK_CONFIG = {
  apiBaseUrl: "https://novinstack-assistant-api.YOUR-SUBDOMAIN.workers.dev",
  turnstileSiteKey: "YOUR_PUBLIC_SITE_KEY"
};
```

- مقدار `apiBaseUrl`: آدرس واقعی Worker، بدون `/chat`.
- مقدار `turnstileSiteKey`: Site Key عمومی Turnstile، نه Secret Key.
- `docs/index.html` باید `config.js`، `faq.js` و `app.js` را بارگذاری کند؛ این اتصال در نسخه فعلی تیسا وجود دارد.
- **این فایل باید در GitHub منتشر شود**؛ صرفاً اطلاعات عمومی دارد.
- در صورت تغییر Site Key، همان Site Key باید متعلق به Secret Key ثبت‌شده در Worker باشد.

### بررسی مسیر درخواست

رابط از مرورگر درخواست `POST` به `${apiBaseUrl}/chat` می‌فرستد. Worker در `worker/src/index.js` درخواست را بررسی، توکن Turnstile را اعتبارسنجی و سپس مدل Workers AI را فراخوانی می‌کند. باز کردن مستقیم آدرس ریشه Worker در مرورگر ممکن است پیام `Not found` بدهد؛ این موضوع به‌تنهایی خطا نیست، زیرا API روی مسیر `/chat` و با درخواست POST کار می‌کند.

---

## ۷. تنظیم GitHub Pages

۱. مخزن `https://github.com/novinstack/novinstack` را باز کن.
۲. به **Settings → Pages** برو.
۳. در **Build and deployment → Source** گزینه **Deploy from a branch** را انتخاب کن.
۴. Branch را `main` و Folder را `/docs` بگذار؛ **Save** کن.
۵. بررسی کن `docs/index.html` در مخزن موجود باشد و در صورت استفاده از `.nojekyll`، فایل `docs/.nojekyll` را نگه دار.
۶. منتظر انتشار موفق GitHub Pages بمان؛ وضعیت را در بخش Pages یا Actions بررسی کن.
۷. آدرس نهایی: `https://novinstack.github.io/novinstack/`.

اگر Pages قبلاً فعال و درست کار می‌کند، تنظیمات آن را تغییر نده. فایل‌های `worker/` در GitHub Pages اجرا نمی‌شوند؛ Worker جداگانه در Cloudflare منتشر می‌شود.

---

## ۸. فایل `.gitignore` و جلوگیری از انتشار راهنما

فایل `.gitignore` همراه این راهنما برای **ریشه مخزن** آماده شده است. محتویات آن را در `novinstack/.gitignore` قرار بده (اگر فایل قبلی وجود دارد، قوانین آن را با فایل جدید ادغام کن؛ کورکورانه حذف نکن).

**راهنمای حاضر باید دقیقاً با نام زیر در ریشه مخزن قرار بگیرد:**

```text
TISA_SETUP_GUIDE_FA.md
```

در `.gitignore` خط زیر قرار داده شده است:

```gitignore
/TISA_SETUP_GUIDE_FA.md
```

این الگو فقط همین فایل در ریشه مخزن را Ignore می‌کند. دستورهای بررسی:

```powershell
# از ریشه مخزن:
git check-ignore -v TISA_SETUP_GUIDE_FA.md
git status --ignored --short
```

اگر `git check-ignore` مسیر و قانون را نشان دهد، Ignore فعال است. برای ثبت فقط `.gitignore`:

```powershell
git add .gitignore
git diff --cached --name-only
```

**نباید** `TISA_SETUP_GUIDE_FA.md` در خروجی `git diff --cached --name-only` دیده شود.

اگر راهنما از قبل در Git Track شده باشد، `.gitignore` به‌تنهایی آن را از Git خارج نمی‌کند؛ در این صورت فقط یک‌بار:

```powershell
git rm --cached -- TISA_SETUP_GUIDE_FA.md
```

این دستور فایل محلی را حذف نمی‌کند؛ فقط آن را از نسخه‌های بعدی مخزن خارج می‌کند. اگر راهنما یا Secret قبلاً در Commitهای قدیمی منتشر شده‌اند، Ignore کردن تاریخچه قبلی را پاک نمی‌کند؛ Secret افشاشده را Rotate کن.

**فایل‌های زیر نباید Ignore شوند:** `README.md`، `README_EN.md`، `assets/`، `docs/`، `docs/config.js`، `worker/src/`، `worker/wrangler.toml` و `worker/package-lock.json` (در صورت وجود). **فایل‌های حساس** مانند `.env`، `.dev.vars`، `node_modules/` و `.wrangler/` Ignore می‌شوند.

---

## ۹. دستورات کامل Commit و Push در VS Code

### الف) قبل از Commit

```powershell
cd (git rev-parse --show-toplevel)
git status
git branch --show-current
git remote -v
git check-ignore -v TISA_SETUP_GUIDE_FA.md
```

اگر فقط `.gitignore` جدید را اضافه می‌کنی:

```powershell
git add .gitignore
git diff --cached --stat
git diff --cached --check
git commit -m "chore: add secure gitignore and keep Tisa setup guide local"
git push origin main
```

اگر **فایل‌های رابط/Worker/README نیز واقعاً تغییر کرده‌اند**، آن‌ها را صریحاً Stage کن؛ راهنما را Stage نکن:

```powershell
git add .gitignore README.md README_EN.md assets docs worker/src worker/wrangler.toml worker/package.json
# فقط اگر فایل lock موجود است:
if (Test-Path worker/package-lock.json) { git add worker/package-lock.json }
git status
git diff --cached --name-only
git diff --cached --check
git commit -m "chore: finalize Tisa deployment configuration"
git push origin main
```

قبل از Commit، فهرست Stage‌شده را کنترل کن تا فایل‌های محرمانه و راهنمای محلی داخل آن نباشند. برای این کار از `git add -f` استفاده نکن.

### ب) مشکل GitHub GH007 (ایمیل خصوصی)

اگر Push با `GH007: Your push would publish a private email address` رد شد، از GitHub → Settings → Emails، آدرس `noreply` واقعی حساب خودت را بردار:

```powershell
git config user.email "YOUR_REAL_GITHUB_NOREPLY_ADDRESS"
git log -1 --format="%h %an <%ae>"
# فقط برای آخرین Commit محلی که هنوز Push نشده است:
git commit --amend --no-edit --reset-author
git push origin main
```

از `git push --force` استفاده نکن. هشدارهای LF/CRLF در Windows معمولاً علت رد Push نیستند.

### ج) تأیید انتشار Git

```powershell
git status
git log -1 --oneline
git remote -v
```

وضعیت مطلوب: `Your branch is up to date with 'origin/main'` و `working tree clean`.

---

## ۱۰. تست نهایی سرتاسری

### تست Cloudflare Worker و CORS

در PowerShell، با آدرس واقعی Worker خودت:

```powershell
$WorkerUrl = "https://novinstack-assistant-api.YOUR-SUBDOMAIN.workers.dev"
curl.exe -i -X OPTIONS "$WorkerUrl/chat" -H "Origin: https://novinstack.github.io" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type"
```

انتظار: `HTTP 204` و هدر `Access-Control-Allow-Origin: https://novinstack.github.io`. این فقط پیش‌پرواز CORS را بررسی می‌کند؛ **تأیید کامل هوش مصنوعی نیست**.

### تست رابط تیسا

۱. `https://novinstack.github.io/novinstack/` را باز کن و در صورت نیاز `Ctrl + F5` بزن.
۲. لوگوی اصلی، پرچم‌های 🇮🇷/🇬🇧، فونت Vazirmatn، RTL فارسی و LTR انگلیسی را بررسی کن.
۳. سایدبار در فارسی نباید اسکرول افقی داشته باشد؛ در موبایل هم منو و پیام‌ها باید بدون بیرون‌زدگی نمایش داده شوند.
۴. Turnstile باید در دامنه مجاز فعال شود؛ مرورگر نباید خطای دامنه بدهد.
۵. بپرس: «نوین‌استک چه خدماتی ارائه می‌دهد؟» و «تیسا چیست؟».
۶. زبان را انگلیسی کن و بپرس: `What does NovinStack do?`.
۷. پاسخ‌ها باید از اطلاعات موجود در `worker/src/knowledge.js` پیروی کنند و قیمت، مشتری، محصول منتشرشده یا تعهد تأییدنشده نسازند.
۸. DevTools مرورگر (`F12 → Network`) را باز کن و درخواست `/chat` را بررسی کن: پاسخ موفق باید `200` و JSON حاوی `answer` داشته باشد.
۹. لینک‌های README فارسی/انگلیسی به تیسا، سایت رسمی و اینستاگرام را بررسی کن.
۱۰. در داشبورد Cloudflare، مصرف Workers AI و Turnstile Analytics را بررسی کن.

**حریم خصوصی:** پرسش‌های ارسال‌شده برای پاسخ هوشمند در Cloudflare پردازش می‌شوند. از کاربران بخواه اطلاعات شخصی حساس، گذرواژه و اسرار تجاری وارد نکنند. در صورت افزودن Analytics/Logs، سیاست نگهداری داده و اطلاع‌رسانی مناسب لازم است.

---

## ۱۱. خطاهای رایج و راه‌حل‌ها

| نشانه | علت احتمالی | اقدام |
|---|---|---|
| `fatal: pathspec ... did not match any files` | ترمینال داخل `worker/` است یا مسیر غلط است | `cd (git rev-parse --show-toplevel)` و سپس `git add ...` |
| `Everything up-to-date` ولی تغییرات دیده نمی‌شوند | Commit جدیدی Push نشده | `git status` و `git log -1 --oneline` را بررسی کن |
| `GH007` | ایمیل نویسنده Commit خصوصی است | ایمیل GitHub noreply و amend فقط برای آخرین Commit محلی |
| صفحه GitHub Pages خطای 404 دارد | `main /docs` تنظیم نیست یا انتشار ناموفق است | Settings → Pages و Actions را بررسی کن |
| صفحه تیسا قدیمی است | Cache یا Push ناقص | `Ctrl+F5`، Network و Commit جدید را بررسی کن |
| پرچم‌ها/لوگو بارگذاری نمی‌شوند | فایل‌های `docs/flags/` یا `docs/novinstack-logo.png` منتشر نشده‌اند | مسیرها، حروف کوچک/بزرگ و درخواست‌های Network را بررسی کن |
| Turnstile خطای Hostname دارد | دامنه در ویجت ثبت نشده | `novinstack.github.io` را در Hostnames قرار بده |
| `Security verification failed` یا 403 در `/chat` | توکن منقضی/مصرف‌شده، کلیدها نامطابق یا Origin نامجاز | کلیدها را با یک ویجت یکسان تطبیق بده، Turnstile را Reset کن، `ALLOWED_ORIGIN` را بررسی کن |
| `Service not configured` یا 503 | AI binding یا Secret ثبت نشده | `wrangler.toml` و `npx wrangler secret list` را بررسی کن |
| `Free AI limit reached` یا 429 | سهمیه/محدودیت سرویس | مصرف داشبورد را بررسی کن؛ تا بازنشانی سهمیه صبر کن |
| `AI service unavailable` یا 502 | خطای مدل، Worker یا سرویس | `npx wrangler tail` و داشبورد را بررسی کن؛ اطلاعات حساس را لاگ نکن |
| CORS error | Origin سایت با مقدار Worker یکی نیست | `ALLOWED_ORIGIN` را اصلاح و Worker را Deploy کن |
| صفحه سفید یا JS error | فایل‌های `docs/app.js`, `faq.js`, `config.js` ناقص یا قدیمی‌اند | Console مرورگر و وضعیت فایل‌های مخزن را بررسی کن |
| راهنما در GitHub ظاهر شد | قبلاً Track شده یا نام فایل متفاوت است | `git check-ignore -v`، در صورت لزوم `git rm --cached` |

### مشاهده لاگ Worker

```powershell
cd worker
npx wrangler tail
```

با `Ctrl+C` خارج شو. لاگ‌های خطا را بررسی کن؛ متن گفتگو، توکن Turnstile یا اطلاعات شخصی کاربران را بی‌دلیل ثبت نکن.

---

## ۱۲. عملیات روزمره و به‌روزرسانی‌ها

### تغییر فقط READMEها

```powershell
cd (git rev-parse --show-toplevel)
git add README.md README_EN.md
git commit -m "docs: update NovinStack profile content"
git push origin main
```

**Worker Deploy لازم نیست.**

### تغییر رابط، CSS، لوگو، پرچم یا سؤال‌های محلی

```powershell
cd (git rev-parse --show-toplevel)
git add docs assets
git commit -m "feat: refine Tisa interface and content"
git push origin main
```

**Worker Deploy لازم نیست**، مگر `worker/` نیز تغییر کرده باشد.

### تغییر دانش برند یا منطق AI

```powershell
cd (git rev-parse --show-toplevel)
git add worker/src
git commit -m "feat: update Tisa AI knowledge"
git push origin main
cd worker
npx wrangler deploy
```

**توجه:** Push کردن `worker/src/knowledge.js` به GitHub به‌تنهایی Worker زنده Cloudflare را به‌روزرسانی نمی‌کند؛ `wrangler deploy` جداگانه ضروری است.

### تغییر دامنه یا Site Key

۱. Hostnames ویجت Turnstile را اصلاح کن.
۲. `docs/config.js` را با Site Key عمومی جدید/آدرس Worker به‌روز کن.
۳. اگر دامنه رابط تغییر کرد، `ALLOWED_ORIGIN` را در `worker/wrangler.toml` به‌روز کن.
۴. اگر Secret Key جدید صادر شد، آن را با `npx wrangler secret put TURNSTILE_SECRET_KEY` جایگزین کن.
۵. تغییرات عمومی را Commit و Push کن و Worker را Deploy کن.

### تغییر یا بازیابی Secret Key

```powershell
cd worker
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret list
```

اگر کلید محرمانه افشا شد، در Cloudflare آن را Rotate کن و کلید جدید را ثبت کن. **Secret Key را هرگز به GitHub ارسال نکن.**

---

## ۱۳. چک‌لیست پیش از تحویل

- [ ] مخزن اصلی `novinstack/novinstack` و شاخه `main` تأیید شده است.
- [ ] فایل `.gitignore` در ریشه مخزن Commit شده است.
- [ ] `TISA_SETUP_GUIDE_FA.md` با `git check-ignore -v` نادیده گرفته می‌شود.
- [ ] هیچ Secret، `.env`، `.dev.vars` یا `node_modules` در فایل‌های Stage‌شده نیست.
- [ ] Turnstile Widget با Hostname `novinstack.github.io` و حالت Managed ساخته شده است.
- [ ] Site Key عمومی در `docs/config.js` قرار دارد.
- [ ] Secret Key فقط در Cloudflare Worker Secrets ثبت شده است.
- [ ] `[ai] binding = "AI"` در `worker/wrangler.toml` برقرار است.
- [ ] آدرس واقعی Worker در `docs/config.js` درست است.
- [ ] Worker از طریق Wrangler منتشر شده و `/chat` پاسخ می‌دهد.
- [ ] GitHub Pages روی `main /docs` منتشر شده است.
- [ ] تیسا در فارسی و انگلیسی به پرسش‌های واقعی پاسخ می‌دهد.
- [ ] لوگو، پرچم‌ها، RTL/LTR، فونت و نبود اسکرول افقی بررسی شده‌اند.
- [ ] لینک‌های README و شبکه‌های اجتماعی درست کار می‌کنند.
- [ ] مصرف رایگان Workers AI و لاگ‌های خطا بررسی شده‌اند.
- [ ] Commit و Push عادی انجام شده و تاریخچه اولیه Git محفوظ است.

---

## ۱۴. منابع رسمی

- Turnstile — ساخت و مدیریت ویجت: https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/
- Turnstile — رندر سمت مرورگر: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
- Turnstile — اعتبارسنجی سمت سرور: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Workers AI — قیمت و سهمیه: https://developers.cloudflare.com/workers-ai/platform/pricing/
- Workers — Secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- GitHub Pages — تنظیم انتشار از شاخه: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

**یادآوری:** این راهنما برای نسخه موجود پروژه نوشته شده است. اگر ساختار کد واقعی یا سرویس Cloudflare در آینده تغییر کند، مسیرها، تنظیمات و دستورها را با نسخه فعال هماهنگ کن.
