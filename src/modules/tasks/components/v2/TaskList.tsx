import React, { useEffect, useState } from 'react';
import { tasksAPI } from '../../../../api/v2/tasks';
import type { TaskResponse, TaskCreate } from '../../../../api/v2/types';
import { TaskStatus, TaskPriority } from '../../../../api/v2/types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
    eventId?: string;
    releaseId?: string;
}

export const TaskList: React.FC<TaskListProps> = ({ eventId, releaseId }) => {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        loadTasks();
    }, [eventId, releaseId]);

    const loadTasks = async () => {
        try {
            const data = await tasksAPI.list({
                linked_event_id: eventId,
                linked_release_id: releaseId
            });
            setTasks(data);
        } catch (err) {
            console.error('Failed to load tasks', err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const payload: TaskCreate = {
                title: newTaskTitle,
                status: TaskStatus.TODO,
                priority: TaskPriority.MEDIUM,
                linked_event_id: eventId,
                linked_release_id: releaseId
            };

            await tasksAPI.create(payload);
            setNewTaskTitle('');
            setIsCreating(false);
            loadTasks();
        } catch (err) {
            console.error('Failed to create task', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this task?')) return;
        try {
            await tasksAPI.delete(id);
            loadTasks();
        } catch (err) {
            console.error('Failed to delete task', err);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Tasks</h3>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
                >
                    {isCreating ? 'Cancel' : '+ New Task'}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-gray-50 p-3 rounded border border-gray-200">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                        autoFocus
                    />
                    <div className="flex justify-end">
                        <button type="submit" className="text-sm text-blue-600 font-medium">Add Task</button>
                    </div>
                </form>
            )}

            <div className="space-y-2">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} onDelete={handleDelete} />
                ))}
                {tasks.length === 0 && !isCreating && (
                    <div className="text-center text-gray-500 py-4 text-sm font-light">
                        No tasks yet.
                    </div>
                )}
            </div>
        </div>
    );
};
