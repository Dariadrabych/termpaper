import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './db.js';

const app = express();
const PORT = 4000;
const JWT_SECRET = 'kernel_secret_key';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ===== JWT =====
function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, full_name: user.full_name, tariff: user.tariff },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function auth(requiredRole = null) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

// ===== AUTH =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Заповніть всі поля' });
    }
    const [exist] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exist.length > 0) {
      return res.status(400).json({ message: 'Такий email вже існує' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES (?,?,?)',
      [full_name, email, hash]
    );
    const user = { id: result.insertId, full_name, email, role: 'student', tariff: 'free' };
    const token = generateToken(user);
    res.json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ message: 'Невірний email або пароль' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ message: 'Невірний email або пароль' });
    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        tariff: user.tariff
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== COURSES (каталог, фільтрація) =====
app.get('/api/courses', async (req, res) => {
  try {
    const { q, subject, level, free } = req.query;
    let sql = 'SELECT * FROM courses WHERE 1=1';
    const params = [];
    if (q) {
      sql += ' AND (title LIKE ? OR subtitle LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }
    if (subject) {
      sql += ' AND subject = ?';
      params.push(subject);
    }
    if (level) {
      sql += ' AND level = ?';
      params.push(level);
    }
    if (free === '1') {
      sql += ' AND is_free = 1';
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Деталі курсу: уроки, тести
app.get('/api/courses/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [[course]] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (!course) return res.status(404).json({ message: 'Курс не знайдено' });

    const [lessons] = await pool.query(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index',
      [id]
    );
    const [tests] = await pool.query('SELECT * FROM tests WHERE course_id = ?', [id]);

    res.json({ course, lessons, tests });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== ENROLL (запис на курс) =====
app.post('/api/enroll', auth('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { course_id } = req.body;
    await pool.query(
      'INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?,?)',
      [userId, course_id]
    );
    res.json({ message: 'Ви успішно записалися на курс' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== DASHBOARD: курси, результати, активність =====
app.get('/api/dashboard', auth(), async (req, res) => {
  try {
    const userId = req.user.id;
    const [myCourses] = await pool.query(
      `SELECT c.* 
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = ?`,
      [userId]
    );

    const [results] = await pool.query(
      `SELECT tr.*, t.title AS test_title
       FROM test_results tr
       JOIN tests t ON t.id = tr.test_id
       WHERE tr.user_id = ?
       ORDER BY tr.created_at DESC
       LIMIT 20`,
      [userId]
    );

    const [activity] = await pool.query(
      `SELECT * FROM activity_logs
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 30`,
      [userId]
    );

    res.json({ myCourses, results, activity });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== TESTS =====
app.get('/api/tests/:id', auth(), async (req, res) => {
  try {
    const testId = req.params.id;
    const [[test]] = await pool.query('SELECT * FROM tests WHERE id = ?', [testId]);
    if (!test) return res.status(404).json({ message: 'Тест не знайдено' });

    const [questions] = await pool.query(
      'SELECT * FROM questions WHERE test_id = ?',
      [testId]
    );
    if (!questions.length) {
      return res.json({ test, questions: [] });
    }

    const ids = questions.map(q => q.id);
    const [answers] = await pool.query(
      `SELECT * FROM answers WHERE question_id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    const formatted = questions.map(q => ({
      id: q.id,
      text: q.text,
      answers: answers
        .filter(a => a.question_id === q.id)
        .map(a => ({ id: a.id, text: a.text }))
    }));

    res.json({ test, questions: formatted });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tests/:id/submit', auth(), async (req, res) => {
  try {
    const testId = req.params.id;
    const userId = req.user.id;
    const { answers: userAnswers } = req.body; // {questionId: answerId}

    const [questions] = await pool.query(
      'SELECT * FROM questions WHERE test_id = ?',
      [testId]
    );
    if (!questions.length) {
      return res.status(400).json({ message: 'У тесті немає запитань' });
    }
    const ids = questions.map(q => q.id);
    const [answers] = await pool.query(
      `SELECT * FROM answers WHERE question_id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    let correct = 0;
    for (const q of questions) {
      const chosen = userAnswers[q.id];
      const correctAnswer = answers.find(a => a.question_id === q.id && a.is_correct === 1);
      if (correctAnswer && String(correctAnswer.id) === String(chosen)) correct++;
    }

    const percent = Math.round((correct * 100) / questions.length);
    const [[test]] = await pool.query('SELECT * FROM tests WHERE id = ?', [testId]);
    const passBorder = test?.min_pass_percent || 60;
    const passed = percent >= passBorder;

    await pool.query(
      'INSERT INTO test_results (user_id, test_id, percent, passed) VALUES (?,?,?,?)',
      [userId, testId, percent, passed ? 1 : 0]
    );
    await pool.query(
      `INSERT INTO student_progress (user_id, type, ref_id, percent)
       VALUES (?, 'test', ?, ?)`,
       [userId, testId, percent]
     );

    await pool.query(
      'INSERT INTO activity_logs (user_id, action, meta) VALUES (?,?,?)',
      [userId, 'test_completed', JSON.stringify({ testId, percent })]
    );

    let recommendation = null;
    if (!passed) {
      recommendation = 'Рекомендуємо повторно пройти тест, бо результат нижче 60%.';
    }
    res.json({ percent, passed, recommendation });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== HOMEWORK =====
app.post('/api/homeworks/:id/submit', auth('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const homeworkId = req.params.id;
    const { answer_text } = req.body;
    await pool.query(
      'INSERT INTO homework_submissions (homework_id, user_id, answer_text) VALUES (?,?,?)',
      [homeworkId, userId, answer_text]
    );
    await pool.query(
     `INSERT INTO student_progress (user_id, type, ref_id)
      VALUES (?, 'homework', ?)`,
      [userId, homeworkId]
    );

    await pool.query(
      'INSERT INTO activity_logs (user_id, action, meta) VALUES (?,?,?)',
      [userId, 'homework_submitted', JSON.stringify({ homeworkId })]
    );
    res.json({ message: 'Домашнє завдання надіслано' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== FAVORITES =====
app.post('/api/favorites', auth(), async (req, res) => {
  try {
    const userId = req.user.id;
    const { lesson_id } = req.body;
    await pool.query(
      'INSERT IGNORE INTO favorites (user_id, lesson_id) VALUES (?,?)',
      [userId, lesson_id]
    );
    res.json({ message: 'Додано в обране' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== CHAT =====
app.get('/api/chat', auth(), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, u.full_name
       FROM messages m
       JOIN users u ON u.id = m.user_id
       ORDER BY m.created_at DESC
       LIMIT 50`
    );
    res.json(rows.reverse());
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/chat', auth(), async (req, res) => {
  try {
    const userId = req.user.id;
    const { text } = req.body;
    await pool.query('INSERT INTO messages (user_id, text) VALUES (?,?)', [userId, text]);
    res.json({ message: 'OK' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== REPORTS (успішність, активність, оплати) =====
app.get('/api/admin/reports/learning', auth('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.full_name, u.email,
              COUNT(DISTINCT e.course_id) AS courses,
              AVG(tr.percent) AS avg_percent
       FROM users u
       LEFT JOIN enrollments e ON e.user_id = u.id
       LEFT JOIN test_results tr ON tr.user_id = u.id
       GROUP BY u.id
       ORDER BY avg_percent DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/reports/activity', auth('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS actions
       FROM activity_logs
       GROUP BY DATE(created_at)
       ORDER BY day DESC
       LIMIT 30`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/reports/payments', auth('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(created_at) AS day,
              SUM(amount) AS total,
              COUNT(*) AS cnt
       FROM payments
       WHERE status = 'paid'
       GROUP BY DATE(created_at)
       ORDER BY day DESC
       LIMIT 30`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== ADMIN: створення курсу =====
app.post('/api/admin/courses', auth('admin'), async (req, res) => {
  try {
    const { title, subtitle, subject, level, price, is_free, cover_url, preview_video_url, description } = req.body;
    const [result] = await pool.query(
      `INSERT INTO courses
       (title, subtitle, subject, level, price, is_free, cover_url, preview_video_url, description)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [title, subtitle, subject, level, price, is_free ? 1 : 0, cover_url, preview_video_url, description]
    );
    res.json({ id: result.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});
app.delete('/api/admin/courses/:id', auth('admin'), async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);

    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: 'Курс не знайдено' });
    }

    res.json({ message: 'Курс видалено' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});
app.put('/api/admin/courses/:id', auth('admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const { title, subtitle, subject, level, price, is_free } = req.body;

    const [rows] = await pool.query(
      `UPDATE courses
       SET title = ?, subtitle = ?, subject = ?, level = ?, price = ?, is_free = ?
       WHERE id = ?`,
      [title, subtitle, subject, level, price, is_free ? 1 : 0, id]
    );

    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: 'Курс не знайдено' });
    }

    res.json({ message: 'Курс оновлено' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/ai/ask', auth(), async (req, res) => {
  const { question } = req.body;

  const aiRes = await fetch("http://localhost:8085/ai/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });

  const data = await aiRes.json();
  res.json({ answer: data.answer });
});
app.post('/api/lessons/:id/complete', auth(), async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.id;

    await pool.query(
      `INSERT INTO student_progress (user_id, type, ref_id)
       VALUES (?, 'lesson', ?)`,
      [userId, lessonId]
    );

    res.json({ message: 'Урок завершено' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});
// ===== PROGRESS =====
app.get('/api/progress', auth(), async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT percent, created_at
       FROM test_results
       WHERE user_id = ?
       ORDER BY created_at ASC`,
      [userId]
    );

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Kernel School backend running on http://localhost:${PORT}`);
});
