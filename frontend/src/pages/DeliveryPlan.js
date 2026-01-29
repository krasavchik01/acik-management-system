import { useState } from 'react';
import Layout from '../components/Layout';
import './DeliveryPlan.css';

const DeliveryPlan = () => {
  const [activeSprintTab, setActiveSprintTab] = useState(null);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  const projectInfo = {
    title: 'ACIK Management System',
    subtitle: 'Полноценное веб-приложение (Full-Stack)',
    developer: 'Айдос Тажбенов',
    client: 'Организация ACIK',
    startDate: '03 февраля 2025',
    endDate: '28 марта 2025',
    totalSprints: 4,
    sprintDuration: '2 недели',
    totalBudget: '$12,000',
    techStack: 'React 18, Node.js, Express, MongoDB, Socket.io, JWT'
  };

  const sprints = [
    {
      id: 1,
      name: 'Спринт 1 — Фундамент и базовая инфраструктура',
      dates: '03 фев — 14 фев 2025',
      status: 'completed',
      progress: 100,
      goal: 'Настройка проекта, аутентификация, проектирование БД, базовый макет и навигация',
      deliverables: [
        {
          title: 'Инициализация и конфигурация проекта',
          items: [
            'React фронтенд с CRA + настройка маршрутизации',
            'Express.js бэкенд с набором middleware (Helmet, CORS, Compression, Rate Limiting)',
            'Подключение MongoDB с Mongoose ODM',
            'Конфигурация окружения (.env, dotenv)',
            'Git репозиторий с правильным .gitignore'
          ],
          status: 'done'
        },
        {
          title: 'Система аутентификации',
          items: [
            'Модель пользователя с хешированием паролей bcrypt',
            'Генерация и валидация JWT токенов',
            'API эндпоинты для входа / регистрации',
            'Middleware защиты маршрутов (auth.js)',
            'Middleware авторизации по ролям (authorize())',
            'AuthContext для управления состоянием на фронтенде',
            'Мгновенный вход через кеш localStorage + фоновая верификация'
          ],
          status: 'done'
        },
        {
          title: 'Проектирование схемы БД (9 моделей)',
          items: [
            'User — роли, департаменты, права, флаг isDemo',
            'Project — отслеживание бюджета, вехи, назначение команды',
            'Task — статусный конвейер, назначения, комментарии, зависимости',
            'Member — категории, навыки, контактная информация, членские взносы',
            'Event — типы, регистрация, спикеры, цены, отзывы',
            'Finance — доходы/расходы, workflow утверждения, повторяющиеся',
            'Sponsor — уровни, платежи, отслеживание бенефитов',
            'Attendance — отметка прихода/ухода, геолокация, перерывы, сверхурочные',
            'Report — KPI, графики, уровни доступа, workflow проверки'
          ],
          status: 'done'
        },
        {
          title: 'Макет и навигация',
          items: [
            'Адаптивный сайдбар с 4 секциями меню (Основное, Управление, Финансы, Отчёты)',
            'Компонент Topbar с заголовком страницы',
            'Секция профиля пользователя в сайдбаре',
            'Подсветка активного маршрута',
            'PageLoader со спиннером для Suspense fallback'
          ],
          status: 'done'
        }
      ],
      penalty: {
        condition: 'Аутентификация не работает ИЛИ база данных не подключена',
        amount: '15% от оплаты спринта ($450)',
        details: 'Если пользователь не может войти/зарегистрироваться или БД не сохраняет данные к дедлайну Спринта 1'
      }
    },
    {
      id: 2,
      name: 'Спринт 2 — Основные модули управления',
      dates: '17 фев — 28 фев 2025',
      status: 'completed',
      progress: 100,
      goal: 'Дашборд, Проекты, Задачи, Участники, Управление пользователями с полными CRUD операциями',
      deliverables: [
        {
          title: 'Дашборд',
          items: [
            'Карточки статистики: Проекты, Участники, Мероприятия, Финансы, Посещаемость',
            'Карточки быстрых действий со ссылками на все основные страницы',
            'Лента последних действий',
            'Кеширование данных с TTL 5 минут для мгновенной загрузки',
            'Параллельная загрузка API через Promise.all()'
          ],
          status: 'done'
        },
        {
          title: 'Модуль проектов',
          items: [
            'Полный CRUD (Создание, Чтение, Обновление, Удаление)',
            '3 режима просмотра: Сетка, Список, Канбан',
            'Фильтрация по статусу: Активный, Завершён, Приостановлен, Планирование',
            'Уровни приоритета: Низкий, Средний, Высокий, Критический',
            'Отслеживание бюджета (выделено / потрачено / остаток)',
            'Визуализация прогресса',
            'Назначение команды с ролями',
            'Модальное окно деталей проекта'
          ],
          status: 'done'
        },
        {
          title: 'Модуль задач',
          items: [
            'Полный CRUD с привязкой к проектам',
            'Канбан доска: TODO → В работе → Ревью → Готово → Заблокировано',
            'Выпадающий список назначения пользователя (загружается из Users)',
            'Бейджи приоритета с цветовой кодировкой',
            'Отслеживание дедлайнов с определением просроченных',
            'Чеклисты внутри задач',
            'Система комментариев с информацией об авторе',
            'Отслеживание запланированных vs фактических часов'
          ],
          status: 'done'
        },
        {
          title: 'Модуль участников',
          items: [
            'Полный CRUD с 180+ сидированными записями',
            'Категории: Бронза, Серебро, Золото, Платина, Бриллиант',
            'Поиск по имени, email, телефону',
            'Фильтрация по категории и статусу',
            'Управление контактной информацией',
            'Отслеживание навыков и интересов',
            'Отслеживание членских взносов'
          ],
          status: 'done'
        },
        {
          title: 'Модуль пользователей (Панель администратора)',
          items: [
            'Управление пользователями в режимах Сетка и Список',
            'Роль Admin с полными правами на удаление',
            'Бейдж DEMO пользователей с анимацией свечения',
            'Ролевой доступ: 8 ролей (Admin, President, VP, CEO, CFO, PM, Marketing, Member)',
            'Назначение департамента: 7 департаментов',
            'Активация / Деактивация пользователей',
            'Модальное окно подтверждения удаления с защитой демо-пользователей',
            'Поиск и фильтрация по роли/департаменту'
          ],
          status: 'done'
        }
      ],
      penalty: {
        condition: 'CRUD не работает ИЛИ страницы не рендерятся',
        amount: '20% от оплаты спринта ($600)',
        details: 'Если любой из 5 модулей не может создать/прочитать/обновить/удалить данные, или страницы выдают ошибки при загрузке'
      }
    },
    {
      id: 3,
      name: 'Спринт 3 — Продвинутые модули и финансы',
      dates: '03 мар — 14 мар 2025',
      status: 'completed',
      progress: 100,
      goal: 'Модули: Мероприятия, Финансы, Спонсоры, Посещаемость, Уведомления, Отчёты',
      deliverables: [
        {
          title: 'Модуль мероприятий',
          items: [
            'Полный CRUD для мероприятий',
            '8 типов мероприятий: Конференция, Воркшоп, Нетворкинг, Саммит, Вебинар, Встреча, Социальное, Тренинг',
            'Управление регистрацией с лимитами вместимости',
            'Управление спикерами',
            'Тарифные планы: Бесплатно, Для членов, Для нечленов, Ранняя регистрация',
            'Поддержка виртуального / физического формата',
            'Создание программы мероприятия',
            'Отзывы и рейтинги мероприятий'
          ],
          status: 'done'
        },
        {
          title: 'Модуль финансов',
          items: [
            'Отслеживание доходов / расходов с 17 категориями',
            'Финансовый дашборд с месячной сводкой',
            'Способы оплаты: Наличные, Чек, Кредитная карта, Банковский перевод, PayPal, Stripe',
            'Отслеживание номеров счетов и квитанций',
            'Workflow утверждения (записал → утвердил)',
            'Привязка к Проектам, Мероприятиям, Спонсорам',
            'Поддержка повторяющихся транзакций'
          ],
          status: 'done'
        },
        {
          title: 'Модуль спонсоров',
          items: [
            'Управление спонсорами с 5 уровнями (Бронза → Бриллиант)',
            'Управление контактным лицом',
            'Данные компании и сайт',
            'История платежей',
            'Отслеживание предоставленных бенефитов',
            'Привязка к Мероприятиям и Проектам',
            'Управление документами'
          ],
          status: 'done'
        },
        {
          title: 'Модуль посещаемости',
          items: [
            'Отметка прихода / ухода 5-ю способами (Ручной, QR, Биометрия, RFID, Мобильное приложение)',
            'Типы работы: Офис, Удалённо, Гибрид, Полевая работа, У клиента',
            'Отслеживание перерывов: Обед, Кофе, Совещание',
            'Автоматический расчёт отработанных часов с вычетом перерывов',
            'Отслеживание сверхурочных с workflow утверждения',
            'Геопространственная индексация локации (2dsphere)',
            'Отслеживание настроения и продуктивности',
            'Ежедневная статистика посещаемости'
          ],
          status: 'done'
        },
        {
          title: 'Модуль уведомлений',
          items: [
            'Система уведомлений внутри приложения',
            'Обновления в реальном времени через Socket.io',
            'Колокольчик уведомлений в верхней панели'
          ],
          status: 'done'
        },
        {
          title: 'Модуль отчётов',
          items: [
            '8 типов отчётов: Еженедельный, Ежемесячный, Квартальный, Годовой, Проектный, Финансовый, По мероприятию, Пользовательский',
            'Отслеживание KPI с метриками план vs факт',
            '6 типов графиков: Линейный, Столбчатый, Круговой, Кольцевой, Площадной, Точечный',
            'Workflow проверки и утверждения',
            'Уровни доступа: Публичный, Внутренний, Ограниченный, Конфиденциальный',
            'Интеграция финансовой сводки',
            'Поддержка экспорта'
          ],
          status: 'done'
        }
      ],
      penalty: {
        condition: 'Финансовые расчёты неверны ИЛИ real-time функции не работают',
        amount: '20% от оплаты спринта ($600)',
        details: 'Если суммы доходов/расходов рассчитаны неправильно, или Socket.io не доставляет обновления в реальном времени'
      }
    },
    {
      id: 4,
      name: 'Спринт 4 — Оптимизация, безопасность и деплой',
      dates: '17 мар — 28 мар 2025',
      status: 'completed',
      progress: 100,
      goal: 'Оптимизация производительности, усиление безопасности, развёртывание, тестовые данные, финальный QA',
      deliverables: [
        {
          title: 'Оптимизация производительности',
          items: [
            'React.lazy() code splitting для всех страниц (снижение бандла на 14%)',
            'Кеширование в localStorage с TTL 5 минут (утилита cache.js)',
            'Мгновенный вход — загрузка из кеша, верификация в фоне',
            'Кешированная загрузка дашборда — показ сразу, обновление в фоне',
            'Параллельные API вызовы через Promise.all()',
            'Suspense с PageLoader fallback',
            'Разделение бандла: 78.74 KB основной + ленивые чанки (4.8 KB, 4.27 KB и т.д.)'
          ],
          status: 'done'
        },
        {
          title: 'Безопасность',
          items: [
            'Защитные заголовки Helmet.js',
            'Конфигурация CORS',
            'Ограничение запросов: 100 запросов / 15 мин',
            'Хеширование паролей bcryptjs с солью',
            'JWT токен аутентификация',
            'Защищённые маршруты на фронтенде и бэкенде',
            'Middleware авторизации по ролям',
            'Защита демо-пользователей от удаления'
          ],
          status: 'done'
        },
        {
          title: 'Наполнение тестовыми данными',
          items: [
            '7 пользователей (Admin, President, VP, CEO, CFO, PM, Marketing)',
            '180 участников по 5 категориям',
            '24 проекта с бюджетом и данными команды',
            '100+ задач, привязанных к проектам и пользователям',
            '25 мероприятий с регистрациями',
            '12 спонсоров с историей платежей',
            '100 финансовых транзакций (50 доходов + 50 расходов)',
            '30 дней записей посещаемости',
            '3 отчёта с KPI'
          ],
          status: 'done'
        },
        {
          title: 'Развёртывание',
          items: [
            'Фронтенд развёрнут на Netlify (app-acik.netlify.app)',
            'Бэкенд развёрнут (API сервер)',
            'Облачная база данных MongoDB Atlas',
            'Настроены переменные окружения',
            'CI/CD через Git push в ветку main'
          ],
          status: 'done'
        },
        {
          title: 'Связи между данными',
          items: [
            'Задачи → Пользователи (assignedTo, createdBy) через .populate()',
            'Задачи → Проекты через .populate()',
            'Проекты → Пользователи (менеджер, участники команды)',
            'Мероприятия → Пользователи (организатор)',
            'Финансы → Пользователи, Проекты, Мероприятия, Спонсоры',
            'Посещаемость → Пользователи, Проекты',
            'Отчёты → Пользователи (создатель, ревьюеры, утвердивший)',
            'Все связи отображают заполненные имена в интерфейсе'
          ],
          status: 'done'
        }
      ],
      penalty: {
        condition: 'Приложение не развёрнуто ИЛИ критические проблемы с производительностью',
        amount: '25% от оплаты спринта ($750)',
        details: 'Если приложение недоступно онлайн, вход занимает > 3 секунд, или страницы падают при загрузке'
      }
    }
  ];

  const penalties = [
    {
      id: 'P1',
      type: 'Срыв дедлайна спринта',
      description: 'Если какие-либо результаты спринта не завершены к дате окончания спринта',
      penalty: 'Вычет 10% за каждый рабочий день задержки (макс. 5 дней)',
      maxPenalty: '50% от оплаты спринта',
      severity: 'critical'
    },
    {
      id: 'P2',
      type: 'Критический баг в продакшене',
      description: 'Если обнаружен критический баг, препятствующий основной функциональности (вход, CRUD операции, потеря данных)',
      penalty: 'Бесплатное исправление в течение 24 часов, иначе штраф $200/день',
      maxPenalty: '$1,000',
      severity: 'critical'
    },
    {
      id: 'P3',
      type: 'Уязвимость безопасности',
      description: 'Если обнаружена уязвимость безопасности (SQL-инъекция, XSS, утечка данных, незащищённые эндпоинты)',
      penalty: 'Бесплатное исправление в течение 12 часов, иначе штраф $300/день',
      maxPenalty: '$1,500',
      severity: 'critical'
    },
    {
      id: 'P4',
      type: 'Потеря или повреждение данных',
      description: 'Если данные пользователей потеряны или повреждены по вине разработчика (не включая проблемы инфраструктуры/бэкапов)',
      penalty: '20% от общего бюджета проекта',
      maxPenalty: '$2,400',
      severity: 'critical'
    },
    {
      id: 'P5',
      type: 'Деградация производительности',
      description: 'Если время загрузки страницы превышает 5 секунд или приложение становится непригодным для использования при нормальной нагрузке',
      penalty: '5% от оплаты спринта до устранения',
      maxPenalty: '15% от оплаты спринта',
      severity: 'medium'
    },
    {
      id: 'P6',
      type: 'Отсутствие функционала',
      description: 'Если согласованная функция, указанная в результатах спринта, отсутствует или не работает',
      penalty: '5% за каждую недостающую функцию, вычитается из оплаты спринта',
      maxPenalty: '30% от оплаты спринта',
      severity: 'high'
    },
    {
      id: 'P7',
      type: 'Простой после развёртывания',
      description: 'Если развёрнутое приложение не работает более 4 часов (за исключением сбоев инфраструктуры)',
      penalty: '$100 за каждый дополнительный час простоя',
      maxPenalty: '$800 за инцидент',
      severity: 'medium'
    },
    {
      id: 'P8',
      type: 'Отказ от проекта',
      description: 'Если разработчик прекращает коммуникацию более чем на 5 рабочих дней без предварительного уведомления',
      penalty: 'Полный возврат всех платежей за недоставленные спринты',
      maxPenalty: 'До 100% оставшегося бюджета',
      severity: 'critical'
    }
  ];

  const getStatusBadge = (status) => {
    const map = {
      done: { label: 'Готово', color: '#10b981' },
      'in-progress': { label: 'В работе', color: '#3b82f6' },
      pending: { label: 'Ожидание', color: '#6b7280' }
    };
    const s = map[status] || map.pending;
    return <span className="dp-status-badge" style={{ background: s.color }}>{s.label}</span>;
  };

  const getSprintStatusIcon = (status) => {
    if (status === 'completed') return '✅';
    if (status === 'active') return '🔄';
    return '⏳';
  };

  const getSeverityColor = (severity) => {
    const map = {
      critical: '#ef4444',
      high: '#f59e0b',
      medium: '#3b82f6',
      low: '#10b981'
    };
    return map[severity] || '#6b7280';
  };

  const getSeverityLabel = (severity) => {
    const map = {
      critical: 'КРИТИЧ.',
      high: 'ВЫСОКИЙ',
      medium: 'СРЕДНИЙ',
      low: 'НИЗКИЙ'
    };
    return map[severity] || severity.toUpperCase();
  };

  return (
    <Layout pageTitle="План поставки">
      <div className="delivery-plan-page">
        {/* Заголовок */}
        <div className="dp-hero">
          <div className="dp-hero-content">
            <div className="dp-hero-badge">ПЛАН ПОСТАВКИ</div>
            <h1 className="dp-hero-title">{projectInfo.title}</h1>
            <p className="dp-hero-subtitle">{projectInfo.subtitle}</p>
            <div className="dp-hero-meta">
              <div className="dp-hero-meta-item">
                <span className="dp-meta-label">Разработчик</span>
                <span className="dp-meta-value">{projectInfo.developer}</span>
              </div>
              <div className="dp-hero-meta-item">
                <span className="dp-meta-label">Заказчик</span>
                <span className="dp-meta-value">{projectInfo.client}</span>
              </div>
              <div className="dp-hero-meta-item">
                <span className="dp-meta-label">Сроки</span>
                <span className="dp-meta-value">{projectInfo.startDate} — {projectInfo.endDate}</span>
              </div>
              <div className="dp-hero-meta-item">
                <span className="dp-meta-label">Бюджет</span>
                <span className="dp-meta-value">{projectInfo.totalBudget}</span>
              </div>
            </div>
          </div>
          <div className="dp-hero-stats">
            <div className="dp-stat-card">
              <div className="dp-stat-number">{projectInfo.totalSprints}</div>
              <div className="dp-stat-label">Спринты</div>
            </div>
            <div className="dp-stat-card">
              <div className="dp-stat-number">12</div>
              <div className="dp-stat-label">Страниц</div>
            </div>
            <div className="dp-stat-card">
              <div className="dp-stat-number">9</div>
              <div className="dp-stat-label">Моделей</div>
            </div>
            <div className="dp-stat-card">
              <div className="dp-stat-number">11</div>
              <div className="dp-stat-label">API маршрутов</div>
            </div>
          </div>
        </div>

        {/* Технологический стек */}
        <div className="dp-tech-stack">
          <h3>Технологический стек</h3>
          <div className="dp-tech-tags">
            {['React 18', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'Socket.io', 'JWT', 'bcrypt', 'Helmet', 'Chart.js', 'Axios', 'Netlify'].map(tech => (
              <span key={tech} className="dp-tech-tag">{tech}</span>
            ))}
          </div>
        </div>

        {/* Таймлайн */}
        <div className="dp-section">
          <div className="dp-section-header">
            <h2>Таймлайн спринтов</h2>
            <button className="dp-penalty-btn" onClick={() => setShowPenaltyModal(true)}>
              Штрафы и SLA
            </button>
          </div>

          <div className="dp-timeline">
            {sprints.map((sprint) => (
              <div key={sprint.id} className={`dp-sprint-card ${sprint.status}`}>
                <div
                  className="dp-sprint-header"
                  onClick={() => setActiveSprintTab(activeSprintTab === sprint.id ? null : sprint.id)}
                >
                  <div className="dp-sprint-left">
                    <span className="dp-sprint-icon">{getSprintStatusIcon(sprint.status)}</span>
                    <div>
                      <h3 className="dp-sprint-name">{sprint.name}</h3>
                      <p className="dp-sprint-dates">{sprint.dates}</p>
                    </div>
                  </div>
                  <div className="dp-sprint-right">
                    <div className="dp-progress-bar">
                      <div
                        className="dp-progress-fill"
                        style={{ width: `${sprint.progress}%` }}
                      />
                    </div>
                    <span className="dp-progress-text">{sprint.progress}%</span>
                    <span className={`dp-expand-icon ${activeSprintTab === sprint.id ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {activeSprintTab === sprint.id && (
                  <div className="dp-sprint-body">
                    <div className="dp-sprint-goal">
                      <strong>Цель:</strong> {sprint.goal}
                    </div>

                    <div className="dp-deliverables">
                      {sprint.deliverables.map((del, idx) => (
                        <div key={idx} className="dp-deliverable">
                          <div className="dp-deliverable-header">
                            <h4>{del.title}</h4>
                            {getStatusBadge(del.status)}
                          </div>
                          <ul className="dp-deliverable-list">
                            {del.items.map((item, i) => (
                              <li key={i}>
                                <span className="dp-check">&#10003;</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="dp-sprint-penalty">
                      <div className="dp-penalty-icon">&#9888;</div>
                      <div>
                        <strong>При невыполнении:</strong> {sprint.penalty.condition}
                        <br />
                        <span className="dp-penalty-amount">Штраф: {sprint.penalty.amount}</span>
                        <br />
                        <span className="dp-penalty-detail">{sprint.penalty.details}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Сводная таблица */}
        <div className="dp-section">
          <h2>Сводка по результатам</h2>
          <div className="dp-table-wrapper">
            <table className="dp-table">
              <thead>
                <tr>
                  <th>Модуль</th>
                  <th>Спринт</th>
                  <th>Функционал</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Авторизация и БД</strong></td>
                  <td>Спринт 1</td>
                  <td>JWT авторизация, 9 моделей, ролевой доступ</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
                <tr>
                  <td><strong>Дашборд</strong></td>
                  <td>Спринт 2</td>
                  <td>Статистика, лента активности, кешированная загрузка</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
                <tr>
                  <td><strong>Проекты</strong></td>
                  <td>Спринт 2</td>
                  <td>CRUD, Сетка/Список/Канбан, бюджет, команды</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
                <tr>
                  <td><strong>Задачи</strong></td>
                  <td>Спринт 2</td>
                  <td>CRUD, Канбан конвейер, назначения, комментарии</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
                <tr>
                  <td><strong>Участники</strong></td>
                  <td>Спринт 2</td>
                  <td>CRUD, категории, поиск, 180+ записей</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
                <tr>
                  <td><strong>Пользователи</strong></td>
                  <td>Спринт 2</td>
                  <td>Админ-панель, DEMO бейджи, удаление, роли</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
                <tr>
                  <td><strong>Мероприятия</strong></td>
                  <td>Спринт 3</td>
                  <td>CRUD, регистрация, ценообразование, 8 типов</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
                <tr>
                  <td><strong>Финансы</strong></td>
                  <td>Спринт 3</td>
                  <td>Доходы/Расходы, дашборд, утверждения</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
                <tr>
                  <td><strong>Спонсоры</strong></td>
                  <td>Спринт 3</td>
                  <td>Уровни, платежи, бенефиты, документы</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
                <tr>
                  <td><strong>Посещаемость</strong></td>
                  <td>Спринт 3</td>
                  <td>Приход/уход, сверхурочные, геолокация, перерывы</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
                <tr>
                  <td><strong>Уведомления</strong></td>
                  <td>Спринт 3</td>
                  <td>Real-time Socket.io, алерты в приложении</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
                <tr>
                  <td><strong>Отчёты</strong></td>
                  <td>Спринт 3</td>
                  <td>KPI, графики, уровни доступа, workflow</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
                <tr>
                  <td><strong>Оптимизация</strong></td>
                  <td>Спринт 4</td>
                  <td>Ленивая загрузка, кеширование, разделение кода</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
                <tr>
                  <td><strong>Развёртывание</strong></td>
                  <td>Спринт 4</td>
                  <td>Netlify, MongoDB Atlas, CI/CD</td>
                  <td><span className="dp-status-done">Сдано</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Блок подписей */}
        <div className="dp-section">
          <div className="dp-signatures">
            <h2>Соглашение</h2>
            <p className="dp-agreement-text">
              Настоящий План поставки является обязывающим соглашением между Разработчиком и Заказчиком.
              Все перечисленные выше результаты подпадают под действие штрафных санкций, изложенных в разделе «Штрафы и SLA».
              Обе стороны соглашаются с условиями, сроками и последствиями невыполнения, указанными в настоящем документе.
            </p>
            <div className="dp-signature-grid">
              <div className="dp-signature-block">
                <div className="dp-signature-line"></div>
                <p className="dp-signature-name">Айдос Тажбенов</p>
                <p className="dp-signature-role">Разработчик</p>
                <p className="dp-signature-date">Дата: _______________</p>
              </div>
              <div className="dp-signature-block">
                <div className="dp-signature-line"></div>
                <p className="dp-signature-name">Организация ACIK</p>
                <p className="dp-signature-role">Представитель заказчика</p>
                <p className="dp-signature-date">Дата: _______________</p>
              </div>
            </div>
          </div>
        </div>

        {/* Модальное окно штрафов */}
        {showPenaltyModal && (
          <div className="dp-modal-overlay" onClick={() => setShowPenaltyModal(false)}>
            <div className="dp-modal" onClick={(e) => e.stopPropagation()}>
              <div className="dp-modal-header">
                <h2>Штрафы и SLA соглашение</h2>
                <button className="dp-modal-close" onClick={() => setShowPenaltyModal(false)}>
                  &times;
                </button>
              </div>
              <div className="dp-modal-body">
                <p className="dp-modal-intro">
                  Следующие штрафные санкции применяются в случае, если разработчик (Айдос Тажбенов) не выполняет
                  согласованные результаты, сроки или стандарты качества проекта ACIK Management System.
                </p>

                <div className="dp-penalties-list">
                  {penalties.map((p) => (
                    <div key={p.id} className="dp-penalty-card">
                      <div className="dp-penalty-card-header">
                        <div>
                          <span
                            className="dp-severity-badge"
                            style={{ background: getSeverityColor(p.severity) }}
                          >
                            {getSeverityLabel(p.severity)}
                          </span>
                          <span className="dp-penalty-id">{p.id}</span>
                        </div>
                        <h4>{p.type}</h4>
                      </div>
                      <p className="dp-penalty-desc">{p.description}</p>
                      <div className="dp-penalty-details">
                        <div className="dp-penalty-row">
                          <span className="dp-penalty-label">Штраф:</span>
                          <span className="dp-penalty-val">{p.penalty}</span>
                        </div>
                        <div className="dp-penalty-row">
                          <span className="dp-penalty-label">Макс. штраф:</span>
                          <span className="dp-penalty-val dp-penalty-max">{p.maxPenalty}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="dp-penalty-footer">
                  <h4>Общие условия</h4>
                  <ul>
                    <li>Все штрафы рассчитываются только по рабочим дням</li>
                    <li>Форс-мажорные обстоятельства (стихийные бедствия, сбои провайдера инфраструктуры) исключаются</li>
                    <li>Штрафы ограничены 50% от общего бюджета проекта ($6,000)</li>
                    <li>SLA по исправлению багов: Критический — 24ч, Высокий — 48ч, Средний — 72ч, Низкий — 1 неделя</li>
                    <li>30-дневный гарантийный период после финальной поставки для исправления багов без дополнительной оплаты</li>
                    <li>Споры решаются сначала посредством письменной коммуникации, затем через арбитраж при необходимости</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DeliveryPlan;
