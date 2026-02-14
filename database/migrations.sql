-- Task Manager Database Schema
-- PostgreSQL Migration File
-- Created: 2026-01-23

-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS profile_change_requests CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS task_statuses CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Create positions table (должности)
CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar TEXT,
    role_id INTEGER NOT NULL DEFAULT 2,
    position_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL
);

-- Create task_statuses table (справочник статусов)
CREATE TABLE task_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#808080', -- HEX color code
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

-- Create tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status_id INTEGER NOT NULL DEFAULT 1,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to INTEGER,
    created_by INTEGER NOT NULL,
    updated_by INTEGER,
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (status_id) REFERENCES task_statuses(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create task_comments table (для будущего расширения)
CREATE TABLE task_comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create profile_change_requests table (запросы на изменение профиля)
CREATE TABLE profile_change_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER,
    reject_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_status ON tasks(status_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_comments_task ON task_comments(task_id);

-- Insert positions (должности)
INSERT INTO positions (name, description, level) VALUES
    ('Стажер', 'Начальная позиция для обучения', 1),
    ('Junior Разработчик', 'Младший разработчик', 2),
    ('Разработчик', 'Разработчик', 3),
    ('Senior Разработчик', 'Старший разработчик', 4),
    ('Ведущий Разработчик', 'Ведущий разработчик (Lead Developer)', 5),
    ('Главный Разработчик', 'Главный разработчик (Principal Developer)', 6),
    ('Архитектор', 'Системный архитектор', 7),
    ('Junior Тестировщик', 'Младший тестировщик', 2),
    ('Тестировщик', 'Тестировщик QA', 3),
    ('Senior Тестировщик', 'Старший тестировщик', 4),
    ('Ведущий Тестировщик', 'Ведущий тестировщик (Lead QA)', 5),
    ('Менеджер проекта', 'Project Manager', 5),
    ('Продакт-менеджер', 'Product Manager', 5),
    ('Дизайнер', 'UI/UX Дизайнер', 3),
    ('DevOps инженер', 'DevOps Engineer', 4);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('admin', 'Администратор системы'),
    ('user', 'Обычный пользователь'),
    ('manager', 'Менеджер проектов');

-- Insert default task statuses
INSERT INTO task_statuses (name, color, description, sort_order) VALUES
    ('todo', '#6B7280', 'Задача ожидает выполнения', 1),
    ('in_progress', '#3B82F6', 'Задача в процессе выполнения', 2),
    ('review', '#F59E0B', 'Задача на проверке', 3),
    ('completed', '#10B981', 'Задача завершена', 4),
    ('cancelled', '#EF4444', 'Задача отменена', 5);

-- Insert test users for development team
-- Note: All passwords are 'test123' 
-- Hash: $2a$10$qQ66QH0UQIXeoY8uNMuPje1rEkqxniDciOixZF7SO1WK3o/.LltNS
INSERT INTO users (email, username, first_name, last_name, password_hash, role_id, position_id) VALUES
    -- Администратор
    ('admin@devteam.com', 'admin', 'Кристина', 'Браво', '$2a$10$qQ66QH0UQIXeoY8uNMuPje1rEkqxniDciOixZF7SO1WK3o/.LltNS', 1, 7),
    
    -- Команда разработки
    ('maria.ivanova@devteam.com', 'maria_iv', 'Мария', 'Иванова', '$2a$10$qQ66QH0UQIXeoY8uNMuPje1rEkqxniDciOixZF7SO1WK3o/.LltNS', 2, 4), -- Senior Developer
    ('dmitry.sokolov@devteam.com', 'dmitry_sok', 'Дмитрий', 'Соколов', '$2a$10$qQ66QH0UQIXeoY8uNMuPje1rEkqxniDciOixZF7SO1WK3o/.LltNS', 2, 3), -- Middle Developer
    ('anna.smirnova@devteam.com', 'anna_smr', 'Анна', 'Смирнова', '$2a$10$qQ66QH0UQIXeoY8uNMuPje1rEkqxniDciOixZF7SO1WK3o/.LltNS', 2, 2), -- Junior Developer
    ('sergey.kozlov@devteam.com', 'sergey_koz', 'Сергей', 'Козлов', '$2a$10$qQ66QH0UQIXeoY8uNMuPje1rEkqxniDciOixZF7SO1WK3o/.LltNS', 2, 9), -- QA Engineer
    ('elena.morozova@devteam.com', 'elena_mor', 'Елена', 'Морозова', '$2a$10$qQ66QH0UQIXeoY8uNMuPje1rEkqxniDciOixZF7SO1WK3o/.LltNS', 2, 15), -- DevOps Engineer
    ('igor.volkov@devteam.com', 'igor_vol', 'Игорь', 'Волков', '$2a$10$qQ66QH0UQIXeoY8uNMuPje1rEkqxniDciOixZF7SO1WK3o/.LltNS', 3, 12); -- Project Manager

-- Insert sample tasks for development team (20 tasks)
INSERT INTO tasks (title, description, status_id, priority, created_by, assigned_to, due_date) VALUES
    ('Настроить CI/CD pipeline', 'Настроить GitHub Actions для автоматической сборки и деплоя', 2, 'high', 7, 6, CURRENT_TIMESTAMP + INTERVAL '2 days'),
    ('Разработать REST API для пользователей', 'Создать endpoints: GET, POST, PUT, DELETE для управления пользователями', 2, 'urgent', 2, 2, CURRENT_TIMESTAMP + INTERVAL '1 day'),
    ('Реализовать авторизацию JWT', 'Добавить middleware для проверки токенов и защиты роутов', 3, 'high', 2, 3, CURRENT_TIMESTAMP + INTERVAL '3 days'),
    ('Оптимизировать SQL запросы', 'Добавить индексы и переписать медленные запросы', 1, 'medium', 6, 3, CURRENT_TIMESTAMP + INTERVAL '5 days'),
    ('Создать компонент Header с навигацией', 'Реализовать адаптивный хедер с меню пользователя', 4, 'medium', 7, 4, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('Разработать Kanban доску', 'Drag & drop функционал для перемещения задач между колонками', 2, 'high', 7, 2, CURRENT_TIMESTAMP + INTERVAL '2 days'),
    ('Добавить форму создания задачи', 'Модальное окно с валидацией полей', 3, 'medium', 2, 4, CURRENT_TIMESTAMP + INTERVAL '1 day'),
    ('Реализовать поиск и фильтры', 'Фильтрация по статусу, приоритету и исполнителю', 1, 'low', 7, 3, CURRENT_TIMESTAMP + INTERVAL '6 days'),
    ('Написать unit тесты для API', 'Покрытие тестами всех эндпоинтов API', 1, 'high', 5, 5, CURRENT_TIMESTAMP + INTERVAL '4 days'),
    ('Провести нагрузочное тестирование', 'Проверить работу приложения под нагрузкой', 1, 'medium', 5, 5, CURRENT_TIMESTAMP + INTERVAL '7 days'),
    ('Тестирование UI компонентов', 'E2E тесты для основных пользовательских сценариев', 2, 'high', 7, 5, CURRENT_TIMESTAMP + INTERVAL '3 days'),
    ('Проверка безопасности', 'Audit зависимостей и проверка на уязвимости', 1, 'urgent', 6, 6, CURRENT_TIMESTAMP + INTERVAL '2 days'),
    ('Добавить систему уведомлений', 'Real-time уведомления о назначении задач', 1, 'medium', 2, 2, CURRENT_TIMESTAMP + INTERVAL '8 days'),
    ('Реализовать админ-панель', 'Управление пользователями и их ролями', 3, 'high', 7, 2, CURRENT_TIMESTAMP + INTERVAL '4 days'),
    ('Добавить аватары пользователей', 'Загрузка и отображение аватаров с компрессией', 4, 'low', 2, 4, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('Создать дашборд с аналитикой', 'Графики и статистика по выполнению задач', 1, 'low', 7, 3, CURRENT_TIMESTAMP + INTERVAL '10 days'),
    ('Написать документацию API', 'Swagger/OpenAPI спецификация для всех endpoints', 1, 'medium', 7, 3, CURRENT_TIMESTAMP + INTERVAL '9 days'),
    ('Адаптировать под мобильные устройства', 'Responsive design для всех экранов', 2, 'medium', 4, 4, CURRENT_TIMESTAMP + INTERVAL '5 days'),
    ('Оптимизация производительности', 'Lazy loading, code splitting, кэширование', 1, 'low', 6, 6, CURRENT_TIMESTAMP + INTERVAL '12 days'),
    ('Подготовка к релизу', 'Финальное тестирование и исправление багов', 1, 'high', 7, 5, CURRENT_TIMESTAMP + INTERVAL '15 days');

-- Insert sample profile change requests
INSERT INTO profile_change_requests (user_id, first_name, last_name, status, created_at, reviewed_at, reviewed_by, reject_reason) VALUES
    -- Одобренный запрос (старый)
    (3, 'Дмитрий', 'Соколов-Петров', 'approved', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '9 days', 1, NULL),
    
    -- Отклоненный запрос (средней давности)
    (4, 'Анюта', 'Смирнова', 'rejected', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '4 days', 1, 'Используйте полное имя вместо уменьшительно-ласкательного'),
    
    -- Ожидающие запросы (новые)
    (5, 'Сергей', 'Козлов-Иванов', 'pending', CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, NULL, NULL),
    (2, 'Мария', 'Иванова-Петрова', 'pending', CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, NULL, NULL),
    (6, 'Елена', 'Морозова-Волкова', 'pending', CURRENT_TIMESTAMP - INTERVAL '3 hours', NULL, NULL, NULL);


-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for tasks with user and status information
CREATE VIEW tasks_view AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.priority,
    t.due_date,
    t.completed_at,
    t.created_at,
    t.updated_at,
    s.name as status_name,
    s.color as status_color,
    u_created.username as created_by_name,
    u_assigned.username as assigned_to_name,
    u_updated.username as updated_by_name
FROM tasks t
LEFT JOIN task_statuses s ON t.status_id = s.id
LEFT JOIN users u_created ON t.created_by = u_created.id
LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
LEFT JOIN users u_updated ON t.updated_by = u_updated.id;
