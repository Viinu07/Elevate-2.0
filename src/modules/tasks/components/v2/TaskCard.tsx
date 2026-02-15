import type { TaskResponse } from '../../../../api/v2/types';
import { TaskStatus, TaskPriority } from '../../../../api/v2/types';

interface TaskCardProps {
    task: TaskResponse;
    onEdit?: (task: TaskResponse) => void;
    onDelete?: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
    const statusColors = {
        [TaskStatus.TODO]: 'bg-gray-100 text-gray-800',
        [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
        [TaskStatus.DONE]: 'bg-green-100 text-green-800',
    };

    const priorityColors = {
        [TaskPriority.LOW]: 'text-gray-500',
        [TaskPriority.MEDIUM]: 'text-yellow-600',
        [TaskPriority.HIGH]: 'text-red-600',
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                    {task.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                    {task.status}
                </span>
            </div>

            <div className="mt-3 flex justify-between items-center text-xs">
                <span className={`font-medium ${priorityColors[task.priority]}`}>
                    {task.priority} Priority
                </span>

                <div className="flex space-x-2">
                    {onEdit && (
                        <button onClick={() => onEdit(task)} className="text-blue-600 hover:text-blue-800">Edit</button>
                    )}
                    {onDelete && (
                        <button onClick={() => onDelete(task.id)} className="text-red-600 hover:text-red-800">Delete</button>
                    )}
                </div>
            </div>
        </div>
    );
};
