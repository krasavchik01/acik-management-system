# ПЛАН ПОСТАВКИ ПРОЕКТА / PROJECT DELIVERY PLAN
## ACIK Management System

---

## 🇷🇺 РУССКАЯ ВЕРСИЯ

**От:** Айдос Тажбенов (Разработчик)
**Для:** Организация ACIK (Заказчик)
**Дата:** 29 января 2026
**Бюджет:** 10,000,000 тенге
**Сроки:** 03 февраля 2025 — 28 марта 2025

---

### ТЕХНОЛОГИЧЕСКИЙ СТЕК

- **Frontend:** React 18, React Router, Axios
- **Backend:** Node.js, Express, MongoDB
- **Deployment:** Netlify (Frontend), Render.com (Backend), MongoDB Atlas
- **Security:** JWT аутентификация, bcrypt хеширование паролей

---

### ЭТАПЫ РАЗРАБОТКИ

#### ЭТАП 1 — Фундамент системы
**Даты:** 03 февраля — 14 февраля 2025
**Оплата:** 2,500,000 тенге

**Результаты:**
- Настройка проекта (React + Express + MongoDB)
- Система входа/регистрации с JWT токенами
- База данных: модели для Users, Projects, Tasks, Members, Events, Finance
- Базовый интерфейс с навигацией

**Тестирование с заказчиком:**
- Проверка входа в систему
- Просмотр основного макета и навигации
- Обсуждение корректировок дизайна

**Штраф за опоздание:**
- Условие: Задержка сдачи этапа более 3 рабочих дней
- Штраф: Фиксированный штраф 10% от оплаты этапа (250,000 тенге)

---

#### ЭТАП 2 — Основные модули
**Даты:** 17 февраля — 28 февраля 2025
**Оплата:** 2,900,000 тенге

**Результаты:**
- **Дашборд:** карточки со статистикой (проекты, участники, события)
- **Проекты:** создание, просмотр, редактирование, удаление проектов
- **Задачи:** управление задачами с назначением на пользователей
- **Участники:** база участников с поиском и фильтрацией
- **Пользователи:** управление пользователями (роли: Admin, President, CEO и т.д.)

**Тестирование с заказчиком:**
- Создание тестового проекта
- Добавление задач и назначение на пользователей
- Проверка прав доступа для разных ролей
- Внесение правок по замечаниям

**Штраф за опоздание:**
- Условие: Задержка сдачи этапа более 3 рабочих дней
- Штраф: Фиксированный штраф 10% от оплаты этапа (290,000 тенге)

---

#### ЭТАП 3 — Дополнительные модули
**Даты:** 03 марта — 14 марта 2025
**Оплата:** 2,100,000 тенге

**Результаты:**
- **Мероприятия:** создание и управление мероприятиями, регистрация участников
- **Финансы:** учёт доходов и расходов, простая статистика
- **Спонсоры:** база спонсоров с контактами и историей платежей
- **Посещаемость:** отметки прихода/ухода сотрудников
- **Отчёты:** базовая генерация отчётов

**Тестирование с заказчиком:**
- Добавление тестового мероприятия
- Внесение финансовых записей
- Проверка корректности расчётов
- Правки по результатам тестирования

**Штраф за опоздание:**
- Условие: Задержка сдачи этапа более 3 рабочих дней
- Штраф: Фиксированный штраф 10% от оплаты этапа (210,000 тенге)

---

#### ЭТАП 4 — Финализация и запуск
**Даты:** 17 марта — 28 марта 2025
**Оплата:** 2,500,000 тенге

**Результаты:**
- Оптимизация загрузки страниц
- Исправление всех критических багов, найденных на предыдущих этапах
- Заполнение базы тестовыми данными для демонстрации
- Развёртывание на production (Netlify + Render)
- Документация по использованию системы

**Тестирование с заказчиком:**
- Полное приёмочное тестирование всех модулей
- Проверка работы на разных устройствах
- Обучение заказчика работе с системой
- Исправление найденных замечаний

**Штраф за опоздание:**
- Условие: Задержка сдачи этапа более 3 рабочих дней
- Штраф: Фиксированный штраф 10% от оплаты этапа (250,000 тенге)

---

### УСЛОВИЯ РАБОТЫ

**Штрафы за опоздание:**
- Штраф начисляется только за опоздание более 3 рабочих дней
- Размер: **Фиксированный штраф 10% от оплаты этапа**
- Расчёт только по рабочим дням (суббота, воскресенье не учитываются)

**Форс-мажорные обстоятельства:**

Не считаются опозданием следующие ситуации:
- Сбои хостинг-провайдеров (Netlify, Render, MongoDB Atlas)
- Стихийные бедствия
- Отсутствие связи по независящим от разработчика причинам

**Гарантийная поддержка:**
- **30 дней** бесплатного исправления багов после сдачи проекта
- Не включает добавление нового функционала
- Критические баги исправляются в течение 48 часов
- Некритические баги — в течение 7 дней

**Оплата:**
- **По факту сдачи каждого этапа** после приёмочного тестирования
- Этап 1: 2,500,000 тенге
- Этап 2: 2,900,000 тенге
- Этап 3: 2,100,000 тенге
- Этап 4: 2,500,000 тенге

---

### РЕЗУЛЬТАТЫ ПО МОДУЛЯМ

| Модуль | Этап | Основной функционал |
|--------|------|---------------------|
| Вход в систему | Этап 1 | Регистрация, вход, восстановление пароля |
| Дашборд | Этап 2 | Карточки статистики, быстрые действия |
| Проекты | Этап 2 | CRUD операции, фильтрация, поиск |
| Задачи | Этап 2 | Создание задач, назначение исполнителей, отслеживание статуса |
| Участники | Этап 2 | База участников, категории, поиск |
| Пользователи | Этап 2 | Управление ролями и правами доступа |
| Мероприятия | Этап 3 | Создание событий, регистрация участников |
| Финансы | Этап 3 | Учёт доходов/расходов, базовая статистика |
| Спонсоры | Этап 3 | База спонсоров, история платежей |
| Посещаемость | Этап 3 | Отметки прихода/ухода |
| Отчёты | Этап 3 | Генерация базовых отчётов |

---

### СОГЛАШЕНИЕ СТОРОН

**Разработчик обязуется:**
1. Сдавать этапы в указанные сроки
2. Проводить совместное тестирование с заказчиком
3. Исправлять найденные критические ошибки до сдачи этапа
4. Предоставлять еженедельные отчёты о ходе работ
5. Быть на связи в рабочие дни (пн-пт, 10:00-18:00)

**Заказчик обязуется:**
1. Участвовать в тестировании в конце каждого этапа
2. Предоставлять обратную связь в течение 3 рабочих дней
3. Оплачивать этапы в течение 5 рабочих дней после приёмки
4. Предоставлять необходимые материалы (логотипы, тексты) по запросу

---

### КОММУНИКАЦИЯ

**Еженедельные отчёты:** каждую пятницу до 18:00
**Демонстрации:** в конце каждого этапа по видеосвязи
**Срочные вопросы:** Telegram/WhatsApp
**Рабочие часы разработчика:** пн-пт, 10:00-18:00 (GMT+6)

---

### ПОДПИСИ

**Разработчик:**

___________________________________
Айдос Тажбенов
Дата: _______________

**Заказчик:**

___________________________________
Организация ACIK
Представитель заказчика
Дата: _______________

---

## 🇬🇧 ENGLISH VERSION

**From:** Aidos Tazhbenov (Developer)
**To:** ACIK Organization (Client)
**Date:** January 29, 2026
**Budget:** 10,000,000 KZT
**Timeline:** February 3, 2025 — March 28, 2025

---

### TECHNOLOGY STACK

- **Frontend:** React 18, React Router, Axios
- **Backend:** Node.js, Express, MongoDB
- **Deployment:** Netlify (Frontend), Render.com (Backend), MongoDB Atlas
- **Security:** JWT authentication, bcrypt password hashing

---

### DEVELOPMENT STAGES

#### STAGE 1 — System Foundation
**Dates:** February 3 — February 14, 2025
**Payment:** 2,500,000 KZT

**Deliverables:**
- Project setup (React + Express + MongoDB)
- Login/registration system with JWT tokens
- Database: models for Users, Projects, Tasks, Members, Events, Finance
- Basic interface with navigation

**Client Testing:**
- Login system verification
- Review of main layout and navigation
- Discussion of design adjustments

**Late Delivery Penalty:**
- Condition: Stage delivery delayed more than 3 business days
- Penalty: Fixed penalty of 10% of stage payment (250,000 KZT)

---

#### STAGE 2 — Core Modules
**Dates:** February 17 — February 28, 2025
**Payment:** 2,900,000 KZT

**Deliverables:**
- **Dashboard:** statistics cards (projects, members, events)
- **Projects:** create, view, edit, delete projects
- **Tasks:** task management with user assignment
- **Members:** member database with search and filtering
- **Users:** user management (roles: Admin, President, CEO, etc.)

**Client Testing:**
- Creating test project
- Adding tasks and assigning to users
- Checking access rights for different roles
- Implementing corrections based on feedback

**Late Delivery Penalty:**
- Condition: Stage delivery delayed more than 3 business days
- Penalty: Fixed penalty of 10% of stage payment (290,000 KZT)

---

#### STAGE 3 — Additional Modules
**Dates:** March 3 — March 14, 2025
**Payment:** 2,100,000 KZT

**Deliverables:**
- **Events:** event creation and management, participant registration
- **Finance:** income and expense tracking, basic statistics
- **Sponsors:** sponsor database with contacts and payment history
- **Attendance:** employee check-in/check-out records
- **Reports:** basic report generation

**Client Testing:**
- Adding test event
- Entering financial records
- Verifying calculation accuracy
- Corrections based on testing results

**Late Delivery Penalty:**
- Condition: Stage delivery delayed more than 3 business days
- Penalty: Fixed penalty of 10% of stage payment (210,000 KZT)

---

#### STAGE 4 — Finalization and Launch
**Dates:** March 17 — March 28, 2025
**Payment:** 2,500,000 KZT

**Deliverables:**
- Page load optimization
- Fixing all critical bugs found in previous stages
- Filling database with test data for demonstration
- Production deployment (Netlify + Render)
- System usage documentation

**Client Testing:**
- Full acceptance testing of all modules
- Testing on different devices
- Training client on system usage
- Fixing discovered issues

**Late Delivery Penalty:**
- Condition: Stage delivery delayed more than 3 business days
- Penalty: Fixed penalty of 10% of stage payment (250,000 KZT)

---

### TERMS AND CONDITIONS

**Late Delivery Penalties:**
- Penalty applies only for delays exceeding 3 business days
- Amount: **Fixed penalty of 10% of stage payment**
- Calculated only on business days (Saturday, Sunday excluded)

**Force Majeure:**

The following situations are not considered delays:
- Hosting provider outages (Netlify, Render, MongoDB Atlas)
- Natural disasters
- Loss of communication due to circumstances beyond developer's control

**Warranty Support:**
- **30 days** of free bug fixes after project delivery
- Does not include adding new functionality
- Critical bugs fixed within 48 hours
- Non-critical bugs fixed within 7 days

**Payment:**
- **Upon completion of each stage** after acceptance testing
- Stage 1: 2,500,000 KZT
- Stage 2: 2,900,000 KZT
- Stage 3: 2,100,000 KZT
- Stage 4: 2,500,000 KZT

---

### MODULE DELIVERABLES

| Module | Stage | Core Functionality |
|--------|-------|-------------------|
| Login System | Stage 1 | Registration, login, password recovery |
| Dashboard | Stage 2 | Statistics cards, quick actions |
| Projects | Stage 2 | CRUD operations, filtering, search |
| Tasks | Stage 2 | Task creation, assignee management, status tracking |
| Members | Stage 2 | Member database, categories, search |
| Users | Stage 2 | Role and access rights management |
| Events | Stage 3 | Event creation, participant registration |
| Finance | Stage 3 | Income/expense tracking, basic statistics |
| Sponsors | Stage 3 | Sponsor database, payment history |
| Attendance | Stage 3 | Check-in/check-out records |
| Reports | Stage 3 | Basic report generation |

---

### AGREEMENT

**Developer Commitments:**
1. Deliver stages on schedule
2. Conduct joint testing with client
3. Fix critical errors found before stage delivery
4. Provide weekly progress reports
5. Be available during business hours (Mon-Fri, 10:00-18:00)

**Client Commitments:**
1. Participate in testing at the end of each stage
2. Provide feedback within 3 business days
3. Pay for stages within 5 business days after acceptance
4. Provide necessary materials (logos, texts) upon request

---

### COMMUNICATION

**Weekly Reports:** Every Friday before 18:00
**Demonstrations:** At the end of each stage via video call
**Urgent Questions:** Telegram/WhatsApp
**Developer Working Hours:** Mon-Fri, 10:00-18:00 (GMT+6)

---

### SIGNATURES

**Developer:**

___________________________________
Aidos Tazhbenov
Date: _______________

**Client:**

___________________________________
ACIK Organization
Client Representative
Date: _______________

---

## CONTACT INFORMATION

**Developer:** Aidos Tazhbenov
**Project:** ACIK Management System
**Demo URL:** https://app-acik.netlify.app
**Repository:** https://github.com/krasavchik01/acik-management-system

---

**Document Created:** January 29, 2026
**Version:** 3.0
