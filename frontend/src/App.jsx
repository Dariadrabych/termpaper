import React, { useEffect, useState } from 'react';
import ProgressPage from "./pages/Progress";

const API_URL = 'http://localhost:4000/api';

/* ===================== ROOT APP ===================== */

function App() {
  const [page, setPage] = useState('home'); // home | courses | course | dashboard | admin
  const [currentCourseId, setCurrentCourseId] = useState(null);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [authMode, setAuthMode] = useState(null); // 'login' | 'register' | null

  const handleLogout = () => {
    setUser(null);
    setToken('');
    setPage('home');
  };

  const openCourse = (id) => {
    setCurrentCourseId(id);
    setPage('course');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="app-shell">
      <Header
        page={page}
        setPage={setPage}
        user={user}
        onLogout={handleLogout}
        onAuthModeChange={setAuthMode}
      />

      <main className="ks-main">
        {page === 'home' && (
          <HomePage
            openCourses={() => setPage('courses')}
          />
        )}

        {page === 'courses' && (
          <CoursesPage
            openCourse={openCourse}
            token={token}
          />
        )}

        {page === 'course' && currentCourseId && (
          <CoursePage
            courseId={currentCourseId}
            token={token}
            user={user}
          />
        )}

        {page === 'dashboard' && (
          <DashboardPage
            token={token}
            user={user}
          />
        )}

        {page === 'admin' && isAdmin && (
          <AdminPage
            token={token}
          />
        )}

        {page === 'admin' && !isAdmin && (
          <section className="dashboard">
            <p>У вас немає прав для перегляду адмін-панелі.</p>
          </section>
        )}
        {page === 'progress' && (
          <ProgressPage token={token} user={user} />
        )}

      </main>

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onAuth={(u, t) => {
            setUser(u);
            setToken(t);
            setAuthMode(null);
            setPage('dashboard');
          }}
        />
      )}
    </div>
  );
}

/* ===================== HEADER ===================== */

function Header({ page, setPage, user, onLogout, onAuthModeChange }) {
  return (
    <header className="ks-header">
      <div
        className="ks-logo"
        style={{ cursor: 'pointer' }}
        onClick={() => setPage('home')}
      >
        Kernel <span>School</span>
      </div>

      <nav className="ks-nav">
        <button onClick={() => setPage('home')}>Головна</button>
        <button onClick={() => setPage('courses')}>Курси</button>
        {user && (
          <button onClick={() => setPage('dashboard')}>Мій кабінет</button>
        )}
        {user && (
        <button onClick={() => setPage('progress')}>Прогрес</button>
        )}

        {user?.role === 'admin' && (
          <button onClick={() => setPage('admin')}>Адмін-панель</button>
        )}
      </nav>

      <div className="ks-auth">
        {user ? (
          <>
            <button className="btn-ghost" onClick={() => setPage('dashboard')}>
              {user.full_name} ({user.role})
            </button>
            <button className="btn-primary" onClick={onLogout}>
              Вийти
            </button>
          </>
        ) : (
          <>
            <button
              className="btn-ghost"
              onClick={() => onAuthModeChange('login')}
            >
              Увійти
            </button>
            <button
              className="btn-primary"
              onClick={() => onAuthModeChange('register')}
            >
              Реєстрація
            </button>
          </>
        )}
      </div>
    </header>
  );
}

/* ===================== HOME PAGE ===================== */

function HomePage({ openCourses }) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/courses`)
      .then((r) => r.json())
      .then(setCourses)
      .catch(() => {});
  }, []);

  const topCourses = courses.slice(0, 4);

  return (
    <>
      <section className="hero-section">
        <div>
          <h1 className="hero-title">
            ПІДГОТОВКА ДО ЗНО З <span>KERnEL SCHOOL</span>
          </h1>
          <p className="hero-subtitle">
            Онлайн-школа з бордовим серцем 💜. Живі уроки, домашні завдання,
            тести та аналітика прогресу. Все, щоб комфортно підготуватися до
            ЗНО та НМТ.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={openCourses}>
              Обрати курс
            </button>
            <button
              className="btn-ghost"
              onClick={() =>
                alert('Тут можна вставити посилання на демо-урок або промо-відео.')
              }
            >
              Переглянути демо-урок
            </button>
          </div>
          <div className="hero-stats">
            <div>
              <strong>2000+</strong>
              <span>учнів вже пройшли наші програми</span>
            </div>
            <div>
              <strong>95%</strong>
              <span>покращують результат мінімум на 20 балів</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>чат-підтримка і ШІ-асистент</span>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-pill">
            <span className="hero-pill-dot" />
            LIVE ПРОГРЕС УЧНЯ
          </div>
          <div className="hero-video">
            <video
              src=""
              poster="https://dummyimage.com/640x360/3b001e/fef3ff&text=Kernel+School+Demo"
            />
            <div className="hero-video-overlay" />
          </div>
          <p
            style={{
              marginTop: 10,
              fontSize: 12,
              color: 'var(--ks-muted)'
            }}
          >
            В особистому кабінеті учень бачить свій середній бал, графік
            активності, пройдені тести та рекомендації, що повторити перед ЗНО.
          </p>
        </div>
      </section>

      <section className="courses-section">
        <div className="section-heading-row">
          <div>
            <div className="section-title">Топ курси Kernel School</div>
            <div className="section-subtitle">
              Підготовка з української, математики, історії України та англійської.
            </div>
          </div>
          <button className="btn-ghost" onClick={openCourses}>
            Переглянути всі курси
          </button>
        </div>

        <div className="courses-grid">
          {topCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
          {topCourses.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--ks-muted)' }}>
              Курси ще не додані. Додай їх через адмін-панель.
            </p>
          )}
        </div>
      </section>
    </>
  );
}

/* ===================== COURSE CARD (REUSABLE) ===================== */

function CourseCard({ course, onOpen }) {
  return (
    <div className="course-card" onClick={onOpen}>
      <div className="course-badge-row">
        <div className="course-subject-pill">
          {mapSubject(course.subject)}
        </div>
        <div className="course-price">
          {course.is_free ? 'Безкоштовно' : `${course.price} грн`}
        </div>
      </div>
      <div className="course-title">{course.title}</div>
      <div className="course-subtitle">{course.subtitle}</div>
      <div className="course-meta-row">
        <span>{mapLevel(course.level)}</span>
        <span>Підготовка до ЗНО / НМТ</span>
      </div>
    </div>
  );
}

/* ===================== COURSES PAGE ===================== */

function CoursesPage({ openCourse }) {
  const [courses, setCourses] = useState([]);
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [free, setFree] = useState(false);

  const load = () => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (subject) params.append('subject', subject);
    if (level) params.append('level', level);
    if (free) params.append('free', '1');

    fetch(`${API_URL}/courses?${params.toString()}`)
      .then((r) => r.json())
      .then(setCourses)
      .catch(() => {});
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="courses-section">
      <div className="section-heading-row">
        <div>
          <div className="section-title">Каталог курсів</div>
          <div className="section-subtitle">
            Обери предмет, складність, тариф – та почни готуватися до ЗНО вже
            сьогодні.
          </div>
        </div>
      </div>

      <div className="filters-row">
        <input
          placeholder="Пошук курсу..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="">Усі предмети</option>
          <option value="ukrainian">Українська мова</option>
          <option value="math">Математика</option>
          <option value="history">Історія України</option>
          <option value="english">Англійська мова</option>
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">Будь-який рівень</option>
          <option value="base">Базовий</option>
          <option value="advanced">Поглиблений</option>
        </select>
        <label
          style={{
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <input
            type="checkbox"
            checked={free}
            onChange={(e) => setFree(e.target.checked)}
          />
          Лише безкоштовні
        </label>
        <button className="btn-ghost" onClick={load}>
          Застосувати фільтри
        </button>
      </div>

      <div className="courses-grid">
        {courses.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            onOpen={() => openCourse(c.id)}
          />
        ))}
        {courses.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--ks-muted)' }}>
            Курсів не знайдено. Зміни фільтри або додай курси в адмінці.
          </p>
        )}
      </div>
    </section>
  );
}

/* ===================== COURSE PAGE (LESSONS + VIDEO + TESTS) ===================== */

function CoursePage({ courseId, token, user }) {
  const [data, setData] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Tests
  const [selectedTest, setSelectedTest] = useState(null);
  const [testQuestions, setTestQuestions] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);

  const authedFetch = (url, options = {}) =>
    fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

  useEffect(() => {
    fetch(`${API_URL}/courses/${courseId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.lessons && d.lessons.length > 0) {
          setActiveLesson(d.lessons[0]);
        }
      })
      .catch(() => {});
  }, [courseId]);

  const enroll = () => {
    if (!token || !user) {
      alert('Спочатку увійдіть в акаунт або зареєструйтеся.');
      return;
    }
    if (user.role !== 'student') {
      alert('Запис на курс доступний лише для студентів.');
      return;
    }
    authedFetch(`${API_URL}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId })
    })
      .then((r) => r.json())
      .then((res) => {
        alert(res.message || 'Ви записані на курс');
      })
      .catch(() => {
        alert('Помилка при записі на курс');
      });
  };

  const toggleFavorite = (lesson) => {
    if (!token) {
      alert('Увійдіть в акаунт, щоб додавати теми до вибраних.');
      return;
    }
    authedFetch(`${API_URL}/favorites`, {
      method: 'POST',
      body: JSON.stringify({ lesson_id: lesson.id })
    })
      .then(() => {
        setFavoriteIds((prev) =>
          prev.includes(lesson.id)
            ? prev.filter((id) => id !== lesson.id)
            : [...prev, lesson.id]
        );
      })
      .catch(() => {});
  };

  const loadTest = (testId) => {
    if (!token) {
      alert('Увійдіть в акаунт, щоб проходити тести.');
      return;
    }
    setTestResult(null);
    fetch(`${API_URL}/tests/${testId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((r) => r.json())
      .then((d) => {
        setSelectedTest(d.test);
        setTestQuestions(d.questions);
        setUserAnswers({});
      })
      .catch(() => {
        alert('Не вдалося завантажити тест.');
      });
  };

  const submitTest = () => {
    if (!selectedTest || !testQuestions) return;
    if (!token) return;

    fetch(`${API_URL}/tests/${selectedTest.id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ answers: userAnswers })
    })
      .then((r) => r.json())
      .then(setTestResult)
      .catch(() => {
        alert('Не вдалося надіслати результати тесту.');
      });
  };

  if (!data) {
    return (
      <section className="course-page">
        <p>Завантаження курсу...</p>
      </section>
    );
  }

  return (
    <section className="course-page">
      <div>
        <div className="course-video-block">
          <video
            controls
            src={
              activeLesson?.video_url ||
              data.course.preview_video_url ||
              ''
            }
            poster="https://dummyimage.com/800x450/050005/fef3ff&text=Kernel+School+Lesson"
          />
        </div>
        <h2 style={{ marginTop: 14 }}>{data.course.title}</h2>
        <p
          style={{
            fontSize: 14,
            color: 'var(--ks-muted)'
          }}
        >
          {data.course.description || data.course.subtitle}
        </p>
        <button
          className="btn-primary"
          style={{ marginTop: 6 }}
          onClick={enroll}
        >
          Записатися на курс
        </button>
        {activeLesson && (
       <button
          className="btn-primary"
          onClick={() => {
          fetch(`http://localhost:4000/api/lessons/${activeLesson.id}/complete`, {
          method: 'POST',
          headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
           }
          }).then(() => alert("Урок відмічено як завершений"));
          }}
           >
          Завершити урок
          </button>
          )}


        {selectedTest && testQuestions && (
          <div className="dashboard-card" style={{ marginTop: 18 }}>
            <h3>Тест: {selectedTest.title}</h3>
            <small>
              Прохідний результат: {selectedTest.min_pass_percent}%
            </small>
            <div style={{ marginTop: 8 }}>
              {testQuestions.map((q) => (
                <div key={q.id} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 4
                    }}
                  >
                    {q.text}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6
                    }}
                  >
                    {q.answers.map((a) => (
                      <button
                        key={a.id}
                        className="btn-ghost"
                        type="button"
                        style={{
                          fontSize: 12,
                          padding: '3px 8px',
                          borderColor:
                            userAnswers[q.id] === a.id
                              ? 'var(--ks-accent)'
                              : 'rgba(246,210,255,0.3)',
                          background:
                            userAnswers[q.id] === a.id
                              ? 'rgba(255,179,58,0.15)'
                              : 'transparent'
                        }}
                        onClick={() =>
                          setUserAnswers((prev) => ({
                            ...prev,
                            [q.id]: a.id
                          }))
                        }
                      >
                        {a.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn-primary"
              style={{ marginTop: 6 }}
              onClick={submitTest}
            >
              Завершити тест
            </button>
            {testResult && (
              <p
                style={{
                  fontSize: 13,
                  marginTop: 8
                }}
              >
                Результат:{' '}
                <strong>{testResult.percent}%</strong>{' '}
                {testResult.passed ? '✅ Тест складено' : '❌ Не складено'}{' '}
                {testResult.recommendation && (
                  <span style={{ color: '#ffb33a' }}>
                    {testResult.recommendation}
                  </span>
                )}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="course-lessons-list">
        <h3 style={{ marginTop: 0, marginBottom: 6 }}>Програма курсу</h3>
        {data.lessons.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--ks-muted)' }}>
            Уроки ще не додані.
          </p>
        )}
        {data.lessons.map((lesson) => (
          <div
            key={lesson.id}
            className={
              'lesson-item ' +
              (activeLesson?.id === lesson.id ? 'active' : '')
            }
            onClick={() => setActiveLesson(lesson)}
          >
            <span>{lesson.title}</span>
            <div className="lesson-actions">
              <button
                className="btn-ghost"
                type="button"
                style={{
                  fontSize: 11,
                  padding: '2px 8px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(lesson);
                }}
              >
                {favoriteIds.includes(lesson.id)
                  ? 'У вибраному'
                  : 'Вибране'}
              </button>
            </div>
          </div>
        ))}

        <h3 style={{ marginTop: 16, marginBottom: 6 }}>Тести курсу</h3>
        {data.tests.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--ks-muted)' }}>
            Тести ще не додані.
          </p>
        )}
        {data.tests.map((t) => (
          <div
            key={t.id}
            className="lesson-item"
            onClick={() => loadTest(t.id)}
          >
            <span>{t.title}</span>
            <span
              style={{ fontSize: 11, color: 'var(--ks-muted)' }}
            >
              прохідний: {t.min_pass_percent}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ===================== DASHBOARD (PROFILE + CHAT + AI) ===================== */

function DashboardPage({ token, user }) {
  const [data, setData] = useState(null);

  const [chatText, setChatText] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');

  useEffect(() => {
    if (!token || !user) return;

    fetch(`${API_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});

    loadChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const loadChat = () => {
    if (!token) return;
    fetch(`${API_URL}/chat`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((r) => r.json())
      .then(setChatMessages)
      .catch(() => {});
  };

  const sendChat = () => {
    if (!chatText.trim()) return;
    fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text: chatText })
    })
      .then((r) => r.json())
      .then(() => {
        setChatText('');
        loadChat();
      })
      .catch(() => {});
  };

  const askAI = () => {
    if (!aiQuestion.trim()) return;
    fetch(`${API_URL}/ai/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ question: aiQuestion })
    })
      .then((r) => r.json())
      .then((d) => {
        setAiAnswer(d.answer);
      })
      .catch(() => {
        setAiAnswer('Сталася помилка при зверненні до ШІ.');
      });
  };

  if (!user) {
    return (
      <section className="dashboard">
        <p>Щоб бачити особистий кабінет, увійдіть або зареєструйтеся.</p>
      </section>
    );
  }

  return (
    <section className="dashboard">
      <div className="dashboard-grid">
        <div>
          <div className="dashboard-card">
            <h3>Привіт, {user.full_name} 👋</h3>
            <small>Тариф: {mapTariff(user.tariff)}</small>
            <p
              style={{
                fontSize: 13,
                marginTop: 6,
                color: 'var(--ks-muted)'
              }}
            >
              Тут зібрана інформація про твої курси, результати тестів та
              активність під час підготовки до ЗНО.
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Мої курси</h3>
            <ul
              style={{
                listStyle: 'none',
                paddingLeft: 0,
                fontSize: 13
              }}
            >
              {data?.myCourses?.map((c) => (
                <li key={c.id} style={{ marginBottom: 6 }}>
                  <strong>{c.title}</strong> – {mapSubject(c.subject)} /{' '}
                  {mapLevel(c.level)}
                </li>
              ))}
              {(!data || data.myCourses?.length === 0) && (
                <li>Поки що немає активних курсів.</li>
              )}
            </ul>
          </div>

          <div className="dashboard-card">
            <h3>Результати тестів</h3>
            <ul
              style={{
                listStyle: 'none',
                paddingLeft: 0,
                fontSize: 13
              }}
            >
              {data?.results?.map((r) => (
                <li key={r.id} style={{ marginBottom: 4 }}>
                  {r.test_title}:{' '}
                  <strong>{r.percent}%</strong>{' '}
                  {r.passed ? '✅' : '❌'}
                </li>
              ))}
              {(!data || data.results?.length === 0) && (
                <li>Ще немає пройдених тестів.</li>
              )}
            </ul>
          </div>

          <div className="dashboard-card">
            <h3>Активність (лог)</h3>
            <ul
              style={{
                listStyle: 'none',
                paddingLeft: 0,
                fontSize: 12
              }}
            >
              {data?.activity?.map((a) => (
                <li key={a.id}>
                  {a.created_at}: {a.action}
                </li>
              ))}
              {(!data || data.activity?.length === 0) && (
                <li>Активність ще не зафіксована.</li>
              )}
            </ul>
          </div>
        </div>

        <div>
          <div className="dashboard-card">
            <h3>Чат з групою</h3>
            <div className="chat-box">
              {chatMessages.map((m) => (
                <div key={m.id} className="chat-message">
                  <strong style={{ fontSize: 11 }}>
                    {m.full_name}:
                  </strong>{' '}
                  {m.text}
                </div>
              ))}
              {chatMessages.length === 0 && (
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--ks-muted)'
                  }}
                >
                  Повідомлень ще немає. Напиши першим 🙂
                </p>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8
              }}
            >
              <input
                style={{
                  flex: 1,
                  borderRadius: 10,
                  border:
                    '1px solid rgba(253,222,255,0.35)',
                  background:
                    'rgba(6,0,10,0.9)',
                  color: '#fff5ff',
                  padding: '6px 10px',
                  fontSize: 13
                }}
                placeholder="Написати повідомлення..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
              />
              <button
                className="btn-primary"
                type="button"
                onClick={sendChat}
              >
                ➤
              </button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>ШІ-асистент Kernel School</h3>
            <small>
              Запитуй із всім допоможу.
            </small>
            <textarea
              style={{
                width: '100%',
                minHeight: 70,
                marginTop: 8,
                borderRadius: 10,
                border:
                  '1px solid rgba(253,222,255,0.35)',
                background:
                  'rgba(6,0,10,0.9)',
                color: '#fff5ff',
                padding: 8,
                fontSize: 13
              }}
              placeholder="Постав запитання з теми ЗНО..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
            />
            <button
              className="btn-primary"
              style={{ marginTop: 6 }}
              type="button"
              onClick={askAI}
            >
              Запитати
            </button>
            {aiAnswer && (
              <p
                style={{
                  fontSize: 13,
                  marginTop: 8
                }}
              >
                {aiAnswer}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== ADMIN PAGE ===================== */

function AdminPage({ token }) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subject, setSubject] = useState('ukrainian');
  const [level, setLevel] = useState('base');
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [editCourse, setEditCourse] = useState(null);
  
 
 const loadCourses = () => {
    fetch(`${API_URL}/courses`)
      .then(r => r.json())
      .then(setAllCourses)
      .catch(() => {});
  };

  
  useEffect(() => {
    loadCourses();
  }, []);

  const [reportsLearning, setReportsLearning] = useState([]);
  const [reportsActivity, setReportsActivity] = useState([]);
  const [reportsPayments, setReportsPayments] = useState([]);

  const loadReports = () => {
    fetch(`${API_URL}/admin/reports/learning`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((r) => r.json())
      .then(setReportsLearning)
      .catch(() => {});
    fetch(`${API_URL}/admin/reports/activity`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((r) => r.json())
      .then(setReportsActivity)
      .catch(() => {});
    fetch(`${API_URL}/admin/reports/payments`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((r) => r.json())
      .then(setReportsPayments)
      .catch(() => {});
  };

  useEffect(() => {
    if (token) loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const createCourse = () => {
    if (!title.trim()) {
      alert('Вкажіть назву курсу.');
      return;
    }
    fetch(`${API_URL}/admin/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        subtitle,
        subject,
        level,
        price: Number(price),
        is_free: isFree ? 1 : 0,
        cover_url: '',
        preview_video_url: '',
        description: subtitle
      })
    })
      .then((r) => r.json())
      .then((res) => {
        alert(`Курс створено (id=${res.id})`);
        setTitle('');
        setSubtitle('');
        setPrice(0);
      })
      .catch(() => {
        alert('Не вдалося створити курс.');
      });
  };
 const deleteCourse = (id) => {
  if (!window.confirm("Видалити курс?")) return;

  fetch(`${API_URL}/admin/courses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) throw new Error("delete failed");

      alert("Курс видалено");
      
      loadCourses();
    })
    .catch(() => alert("Помилка видалення курсу"));
};
const saveEdit = () => {
  const payload = {
    title: editCourse.title,
    subtitle: editCourse.subtitle,
    subject: editCourse.subject,
    level: editCourse.level,
    price: Number(editCourse.price),
    is_free: editCourse.is_free ? 1 : 0
  };

  fetch(`${API_URL}/admin/courses/${editCourse.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (!res.ok) throw new Error("update failed");

      alert("Курс оновлено");
      setEditCourse(null);
      // оновлення списку курсів
      loadCourses();
    })
    .catch(() => alert("Помилка оновлення курсу"));
};


  return (
    <section className="admin-page">
      <h2>Адмін-панель Kernel School</h2>
      <p
        style={{
          fontSize: 13,
          color: 'var(--ks-muted)'
        }}
      >
        Тут адміністратор додає курси, переглядає успішність, активність та
        оплати навчання.
      </p>

      <div className="admin-grid">
        <div className="dashboard-card">
          <h3>Додати курс</h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <input
              placeholder="Назва курсу"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              placeholder="Короткий опис"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="ukrainian">Українська мова</option>
              <option value="math">Математика</option>
              <option value="history">Історія України</option>
              <option value="english">Англійська мова</option>
              <option value="other">Інший предмет</option>
            </select>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="base">Базовий</option>
              <option value="advanced">Поглиблений</option>
            </select>
            <label style={{ fontSize: 13 }}>
              Ціна (грн):
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
            <label style={{ fontSize: 13 }}>
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />{' '}
              Курс безкоштовний
            </label>
            <button
              className="btn-primary"
              type="button"
              onClick={createCourse}
            >
              Створити курс
            </button>
          </div>
        </div>
        <div className="dashboard-card" style={{ marginTop: 10 }}>
  <h3>Список курсів</h3>

  <table className="admin-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Назва</th>
        <th>Предмет</th>
        <th>Ціна</th>
        <th>Дії</th>
      </tr>
    </thead>
    <tbody>
      {allCourses.map(c => (
        <tr key={c.id}>
          <td>{c.id}</td>
          <td>{c.title}</td>
          <td>{mapSubject(c.subject)}</td>
          <td>{c.is_free ? "Безкоштовно" : c.price}</td>
          <td>
            <button
              className="btn-ghost"
              onClick={() => setEditCourse(c)}
            >
              Редагувати
            </button>
            <button
              className="btn-danger"
              style={{ marginLeft: 8 }}
              onClick={() => deleteCourse(c.id)}
            >
              Видалити
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
       </div>
       {editCourse && (
  <div className="modal-backdrop" onClick={() => setEditCourse(null)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h3>Редагування курсу</h3>

      <input
        value={editCourse.title}
        onChange={e => setEditCourse({...editCourse, title: e.target.value})}
      />
      <input
        value={editCourse.subtitle}
        onChange={e => setEditCourse({...editCourse, subtitle: e.target.value})}
      />
      <select
        value={editCourse.subject}
        onChange={e => setEditCourse({...editCourse, subject: e.target.value})}
      >
        <option value="ukrainian">Українська мова</option>
        <option value="math">Математика</option>
        <option value="history">Історія України</option>
        <option value="english">Англійська мова</option>
      </select>

      <input
        type="number"
        value={editCourse.price}
        onChange={e => setEditCourse({...editCourse, price: e.target.value})}
      />

      <label>
        <input
          type="checkbox"
          checked={editCourse.is_free == 1}
          onChange={e => setEditCourse({...editCourse, is_free: e.target.checked ? 1 : 0})}
        /> Безкоштовний
      </label>

      <button className="btn-primary" onClick={saveEdit}>Зберегти</button>
      <button className="btn-ghost" onClick={() => setEditCourse(null)}>Закрити</button>
    </div>
  </div>
)}

        <div className="dashboard-card">
          <h3>Звіт: успіхи навчання</h3>
          <ul
            style={{
              listStyle: 'none',
              paddingLeft: 0,
              fontSize: 12
            }}
          >
            {reportsLearning.map((r, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>
                {r.full_name} – курси: {r.courses || 0}, середній %:{' '}
                {Number(r.avg_percent || 0).toFixed(1)}

              </li>
            ))}
            {reportsLearning.length === 0 && (
              <li>Даних поки немає.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="admin-grid" style={{ marginTop: 10 }}>
        <div className="dashboard-card">
          <h3>Звіт: активність користувачів</h3>
          <ul
            style={{
              listStyle: 'none',
              paddingLeft: 0,
              fontSize: 12
            }}
          >
            {reportsActivity.map((r, idx) => (
              <li key={idx}>
                {r.day}: {r.actions} дій
              </li>
            ))}
            {reportsActivity.length === 0 && (
              <li>Даних поки немає.</li>
            )}
          </ul>
        </div>
        <div className="dashboard-card">
          <h3>Звіт: оплати</h3>
          <ul
            style={{
              listStyle: 'none',
              paddingLeft: 0,
              fontSize: 12
            }}
          >
            {reportsPayments.map((r, idx) => (
              <li key={idx}>
                {r.day}: {r.total || 0} грн ({r.cnt} оплат)
              </li>
            ))}
            {reportsPayments.length === 0 && (
              <li>Даних поки немає.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ===================== AUTH MODAL ===================== */

function AuthModal({ mode, onClose, onAuth }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isLogin = mode === 'login';

  const submit = (e) => {
    e.preventDefault();
    const url = `${API_URL}/auth/${isLogin ? 'login' : 'register'}`;
    const payload = isLogin
      ? { email, password }
      : { full_name: fullName, email, password };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data.message || 'Помилка авторизації');
        }
        onAuth(data.user, data.token);
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>
          {isLogin
            ? 'Вхід до Kernel School'
            : 'Реєстрація в Kernel School'}
        </h3>
        <form onSubmit={submit}>
          {!isLogin && (
            <input
              placeholder="ПІБ"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn-primary" type="submit">
            {isLogin ? 'Увійти' : 'Зареєструватися'}
          </button>
          <button
            className="btn-ghost"
            type="button"
            onClick={onClose}
            style={{ marginTop: 4 }}
          >
            Закрити
          </button>
        </form>
      </div>
    </div>
  );
}

/* ===================== HELPERS ===================== */

function mapSubject(subj) {
  switch (subj) {
    case 'ukrainian':
      return 'Українська мова';
    case 'math':
      return 'Математика';
    case 'history':
      return 'Історія України';
    case 'english':
      return 'Англійська мова';
    default:
      return 'Інший предмет';
  }
}

function mapLevel(level) {
  switch (level) {
    case 'base':
      return 'Базовий рівень';
    case 'advanced':
      return 'Поглиблений рівень';
    default:
      return 'Рівень не вказано';
  }
}

function mapTariff(t) {
  switch (t) {
    case 'free':
      return 'Безкоштовний';
    case 'standard':
      return 'Стандарт';
    case 'premium':
      return 'Преміум';
    default:
      return 'Не вказано';
  }
}

export default App;
