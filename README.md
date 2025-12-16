Kernel School

Kernel School — це веб-додаток для онлайн-навчання та підготовки учнів до НМТ і ЗНО, що поєднує курси, відеоуроки, тестування, аналітику прогресу та модуль інтелектуальної підтримки на основі зовнішньої мовної моделі.

Проєкт побудований за багаторівневою архітектурою та складається з клієнтської частини, серверної частини прикладної логіки, реляційної бази даних і окремого AI-ядра.

1. Архітектура проєкту

Проєкт складається з таких основних компонентів:

Frontend — односторінковий веб-застосунок на React

Backend — REST API на Node.js + Express

Database — MySQL 8.0

AI-Core — окремий Java-сервіс (Spring Boot), що працює з Groq API

Компоненти взаємодіють між собою через HTTP-інтерфейси у форматі JSON.

2. Вимоги до середовища

Перед запуском необхідно встановити:

Node.js ≥ 18

npm

Java SE 17

MySQL Server 8.0

Веббраузер (Chrome, Firefox)

API-ключ Groq

Використовувані порти:

4000 — Backend

5173 — Frontend

8085 — AI-Core

3. Запуск серверної частини (Backend)

Перейти до каталогу backend:

cd backend


Встановити залежності:

npm install


Створити файл .env:

PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=kernel_school
JWT_SECRET=your_jwt_secret
AI_CORE_URL=http://localhost:8085


Запустити сервер:

npm start


Backend стає доступним за адресою:

http://localhost:4000

4. Запуск клієнтської частини (Frontend)

Перейти до каталогу frontend:

cd frontend


Встановити залежності:

npm install


Запустити застосунок:

npm run dev


Frontend буде доступний за адресою:

http://localhost:5173

5. Запуск AI-Core (Java)

Перейти до каталогу AI-модуля:

cd ai-core


Задати API-ключ:

export GROQ_API_KEY=your_api_key


Запустити сервіс:

java -jar ai-core.jar


або

./mvnw spring-boot:run


AI-Core працює на порту 8085.

6. Структура backend
backend/
│── index.js              # Точка входу
│── config/
│   └── db.js             # Підключення до MySQL
│── middleware/
│   └── authMiddleware.js # JWT та ролі
│── routes/
│   ├── auth.js           # Реєстрація та вхід
│   ├── courses.js        # Курси та запис
│   ├── lessons.js        # Уроки
│   ├── tests.js          # Тестування
│   ├── progress.js       # Прогрес
│   └── chat.js           # AI-чат
│── services/
│   └── aiService.js      # Взаємодія з AI-Core
│── package.json

7. Структура frontend
frontend/
│── src/
│   ├── main.jsx          # Ініціалізація React
│   ├── App.jsx           # Роутинг
│   ├── components/
│   │   ├── AuthModal.jsx
│   │   ├── CourseList.jsx
│   │   ├── CoursePage.jsx
│   │   ├── Test.jsx
│   │   ├── Profile.jsx
│   │   └── ChatAI.jsx
│   ├── utils/
│   │   └── api.js
│   └── assets/
│── package.json

8. Структура AI-Core
ai-core/
│── src/
│   ├── KernelAiApplication.java
│   ├── controller/
│   │   └── AiController.java
│   ├── service/
│   │   └── GroqService.java
│   └── config/
│       └── AppConfig.java
│── pom.xml

9. Основний функціонал

Реєстрація та авторизація користувачів (JWT)

Ролі: студент, адміністратор

Каталог курсів

Запис на курси

Перегляд відеоуроків

Онлайн-тестування

Збереження результатів

Відстеження прогресу

AI-асистент для пояснень та консультацій

Адміністративна панель

10. Призначення проєкту

Kernel School призначений для використання як навчальна веб-платформа з можливістю масштабування, інтеграції платіжних сервісів, адаптивних навчальних траєкторій і мобільного клієнта.
