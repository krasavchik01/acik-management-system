# 🚀 ACIK DEPLOYMENT GUIDE

## Быстрый деплой на бесплатный хостинг!

### 📋 Что нужно:
1. GitHub аккаунт
2. Railway аккаунт (для backend + MongoDB)
3. Vercel аккаунт (для frontend)

---

## ЧАСТЬ 1: Подготовка

### 1. Создай GitHub репозиторий

```bash
cd c:\Users\UserPC\ACIK\ACIK

# Инициализируй Git (если еще не сделал)
git init
git add .
git commit -m "Initial commit - ACIK Management System"

# Создай репозиторий на GitHub.com
# Потом привяжи его:
git remote add origin https://github.com/YOUR_USERNAME/acik-system.git
git branch -M main
git push -u origin main
```

---

## ЧАСТЬ 2: Deploy Backend на Railway

### 1. Зайди на Railway.app
- Открой https://railway.app
- Войди через GitHub

### 2. Создай новый проект
- Нажми **"New Project"**
- Выбери **"Deploy from GitHub repo"**
- Выбери свой репозиторий **acik-system**

### 3. Настрой Backend Service
- Railway создаст service автоматически
- Нажми на service → **Settings**
- **Root Directory**: установи `backend`
- **Start Command**: `node server.js`

### 4. Добавь MongoDB
- Нажми **"+ New"** → **"Database"** → **"MongoDB"**
- Railway создаст MongoDB автоматически
- Скопируй **MONGO_URL** из переменных

### 5. Настрой Environment Variables
В Backend service → **Variables** добавь:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=<СКОПИРУЙ_ИЗ_MONGODB_SERVICE>
JWT_SECRET=acik_super_secret_key_2024_production_xyz_789
FRONTEND_URL=https://acik-system.vercel.app
```

### 6. Deploy!
- Railway автоматически задеплоит
- Скопируй URL backend (например: `acik-backend.up.railway.app`)
- Открой `https://YOUR-BACKEND.up.railway.app/api/health`
- Должен вернуть `{"status":"ok"}`

### 7. Заполни данными (Seed)
В Railway → Backend service → **Settings** → **Deploy Logs**

Запусти команду в Railway CLI или через Settings:
```bash
# В локальном терминале с Railway CLI:
railway run npm run seed
```

ИЛИ добавь в `package.json` backend:
```json
"scripts": {
  "start": "node server.js",
  "postinstall": "node seeds/seedData.js"
}
```

---

## ЧАСТЬ 3: Deploy Frontend на Vercel

### 1. Зайди на Vercel.com
- Открой https://vercel.com
- Войди через GitHub

### 2. Import проект
- Нажми **"Add New..."** → **"Project"**
- Выбери репозиторий **acik-system**
- **Root Directory**: установи `frontend`

### 3. Настрой Build Settings
Vercel автоматически определит React, но проверь:
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 4. Environment Variables
Добавь переменную:
```env
REACT_APP_API_URL=https://YOUR-BACKEND.up.railway.app/api
```
(Замени на свой Railway URL!)

### 5. Deploy!
- Нажми **"Deploy"**
- Подожди 2-3 минуты
- Получишь URL типа `acik-system.vercel.app`

### 6. Обнови Backend CORS
Зайди в Railway → Backend → Variables:
```env
FRONTEND_URL=https://acik-system.vercel.app
```
(Замени на свой Vercel URL!)

Railway автоматически редеплоит backend.

---

## ЧАСТЬ 4: Проверка

### 1. Открой свой сайт
```
https://acik-system.vercel.app
```

### 2. Залогинься
```
Email: president@acik.com
Password: password123
```

### 3. Проверь все функции:
- ✅ Dashboard загружается
- ✅ Projects отображаются
- ✅ Tasks работают
- ✅ Attendance работает
- ✅ Finance показывает данные

---

## ЧАСТЬ 5: Custom Domain (Опционально)

### Для Vercel (Frontend):
1. Vercel Dashboard → Project Settings → Domains
2. Добавь свой домен (например: `acik.com`)
3. Настрой DNS у регистратора:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

### Для Railway (Backend):
1. Railway → Backend Service → Settings → Networking
2. Добавь custom domain (например: `api.acik.com`)
3. Настрой DNS:
   ```
   Type: CNAME
   Name: api
   Value: YOUR-BACKEND.up.railway.app
   ```

---

## 🔧 Troubleshooting

### Frontend не подключается к Backend
**Проблема**: CORS ошибка

**Решение**:
1. Проверь `FRONTEND_URL` в Railway backend
2. Должен совпадать с Vercel URL
3. Редеплой backend после изменений

### Backend не запускается
**Проблема**: MongoDB connection error

**Решение**:
1. Проверь что MongoDB service запущен
2. Скопируй правильный `MONGO_URI` из MongoDB service
3. Вставь в backend variables

### Нет данных после деплоя
**Проблема**: База пустая

**Решение**:
```bash
# Установи Railway CLI
npm install -g @railway/cli

# Залогинься
railway login

# Привяжи проект
railway link

# Запусти seed
railway run npm run seed
```

### 500 Internal Server Error
**Проблема**: Backend крашится

**Решение**:
1. Railway → Backend → Logs
2. Посмотри ошибки
3. Обычно это неправильные переменные окружения

---

## 📊 Мониторинг

### Railway (Backend):
- Logs: Railway Dashboard → Service → Logs
- Metrics: Railway Dashboard → Service → Metrics
- Database: Railway Dashboard → MongoDB → Metrics

### Vercel (Frontend):
- Analytics: Vercel Dashboard → Project → Analytics
- Logs: Vercel Dashboard → Project → Deployments → Logs
- Performance: Vercel Dashboard → Speed Insights

---

## 💰 Стоимость (Бесплатные лимиты)

### Railway FREE Tier:
- ✅ 500 часов выполнения / месяц
- ✅ 512MB RAM
- ✅ 1GB хранилища
- ✅ MongoDB included
- ✅ Достаточно для тестов и демо

### Vercel FREE Tier:
- ✅ 100GB bandwidth / месяц
- ✅ Unlimited projects
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Достаточно для production!

---

## 🎉 Готово!

Твой проект теперь LIVE в интернете:

```
Frontend: https://acik-system.vercel.app
Backend:  https://acik-backend.up.railway.app
```

Можешь показывать кому угодно! 🚀

---

## 🔄 Обновления

### Как обновить после изменений:

```bash
# Внеси изменения в код
git add .
git commit -m "Update features"
git push

# Railway и Vercel автоматически редеплоят!
```

Никаких дополнительных действий! Всё автоматически! 🔥

---

## 📝 Важные URLs

После деплоя сохрани эти URLs:

- **Frontend**: https://YOUR-PROJECT.vercel.app
- **Backend**: https://YOUR-BACKEND.up.railway.app
- **API Health**: https://YOUR-BACKEND.up.railway.app/api/health
- **MongoDB**: Через Railway dashboard

---

**DEPLOYMENT COMPLETE! LET'S GO! 🚀🔥**
