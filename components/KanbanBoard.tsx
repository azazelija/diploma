'use client';

import TaskCard from './TaskCard';
import styles from './KanbanBoard.module.css';

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status_id: number;
  status_name: string;
  status_color: string;
  due_date: string | null;
  created_by_name: string;
}

interface Status {
  id: number;
  name: string;
  color: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  statuses: Status[];
  onEdit: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, statusId: number) => void;
}

export default function KanbanBoard({
  tasks,
  statuses,
  onEdit,
  onDelete,
  onStatusChange,
}: KanbanBoardProps) {
  const getTasksByStatus = (statusId: number) => {
    return tasks.filter(task => task.status_id === statusId);
  };

  const statusLabels: Record<string, string> = {
    todo: 'Нужно сделать',
    in_progress: 'В процессе',
    review: 'На проверке',
    completed: 'Готово',
    cancelled: 'Отменено',
  };

  return (
    <div className={styles.board}>
      {statuses.map(status => {
        const statusTasks = getTasksByStatus(status.id);
        return (
          <div key={status.id} className={styles.column}>
            <div className={styles.columnHeader}>
              <div className={styles.columnTitle}>
                <span className={styles.columnDot} style={{ backgroundColor: status.color }} />
                <span className={styles.columnName}>{statusLabels[status.name] || status.name}</span>
              </div>
              <span className={styles.taskCount}>{statusTasks.length}</span>
            </div>

            <div className={styles.tasks}>
              {statusTasks.length === 0 ? (
                <div className={styles.emptyColumn}>
                  <p>Нет задач</p>
                </div>
              ) : (
                statusTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    allStatuses={statuses}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
