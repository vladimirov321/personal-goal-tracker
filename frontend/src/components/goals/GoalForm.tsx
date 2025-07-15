import React, { useState, useEffect } from 'react';
import goalService, { Goal, CreateGoalPayload, UpdateGoalPayload } from '../../services/goalService';
import ProgressControl from '../common/ProgressControl';
import useGoalCategories from '../../hooks/useGoalCategories';
import { formatDateForInput, getButtonText } from '../../utils/formHelpers';
import { GoalStatus } from '../../constants/goalConstants';

interface GoalFormProps {
  goal?: Goal;
  onClose: () => void;
  onSuccess: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ goal, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<GoalStatus>('TODO');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { categories, loading: loadingCategories } = useGoalCategories();

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setCategory(goal.category || 'PERSONAL');
      setTargetDate(formatDateForInput(goal.targetDate));
      setStatus(goal.status);
      setProgress(goal.progress);
    } else {
      setCategory('PERSONAL');
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (goal) {
        const updateData: UpdateGoalPayload = {
          title,
          description: description || undefined,
          category,
          targetDate: targetDate || undefined,
          status,
          progress,
        };
        await goalService.updateGoal(goal.id, updateData);
      } else {
        const createData: CreateGoalPayload = {
          title,
          description: description || undefined,
          category,
          targetDate: targetDate || undefined,
        };
        await goalService.createGoal(createData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-medium mb-4">
        {goal ? 'Edit Goal' : 'Create New Goal'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
            Category *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            {loadingCategories ? (
              <option value="">Loading categories...</option>
            ) : (
              categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))
            )}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="targetDate">
            Target Date
          </label>
          <input
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {goal && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="progress">
                Progress
              </label>
              <ProgressControl 
                value={progress} 
                onChange={setProgress} 
              />
            </div>
          </>
        )}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {getButtonText(loading, !!goal)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalForm;
