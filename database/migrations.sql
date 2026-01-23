-- Task Manager Database Schema
-- PostgreSQL Migration File
-- Created: 2026-01-23

-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS task_statuses CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Create indexes for better performance
CREATE INDEX idx_tasks_status ON tasks(status_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_comments_task ON task_comments(task_id);

-- Insert default task statuses
INSERT INTO task_statuses (name, color, description, sort_order) VALUES
    ('todo', '#6B7280', 'Задача ожидает выполнения', 1),
    ('in_progress', '#3B82F6', 'Задача в процессе выполнения', 2),
    ('review', '#F59E0B', 'Задача на проверке', 3),
    ('completed', '#10B981', 'Задача завершена', 4),
    ('cancelled', '#EF4444', 'Задача отменена', 5);

-- Insert test user (password: test123)
-- Note: In production, use proper password hashing (bcrypt)
-- Hash generated with: bcrypt.hash('test123', 10)
INSERT INTO users (email, username, password_hash) VALUES
    ('test@example.com', 'test', '$2a$10$bYRXPRQ/B4/u/5Dsc/YmIOldKINx2QOjDf1W.4OFiytJarBsiTvZi);

-- Insert sample tasks for testing
INSERT INTO tasks (title, description, status_id, priority, created_by, due_date) VALUES
    ('Настроить проект', 'Создать структуру Next.js приложения и настроить базу данных', 2, 'high', 1, CURRENT_TIMESTAMP + INTERVAL '2 days'),
    ('Разработать API', 'Реализовать REST API для управления задачами', 1, 'high', 1, CURRENT_TIMESTAMP + INTERVAL '3 days'),
    ('Создать UI компоненты', 'Разработать компоненты для отображения и редактирования задач', 1, 'medium', 1, CURRENT_TIMESTAMP + INTERVAL '5 days');

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
