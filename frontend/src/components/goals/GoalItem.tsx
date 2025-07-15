import React from 'react';
import { Goal } from '../../services/goalService';
import goalService from '../../services/goalService';
import ProgressControl from '../common/ProgressControl';
import { formatDate, getStatusColor, formatStatus, getStatusButtonStyle } from '../../utils/goalHelpers';
import { GoalStatus } from '../../constants/goalConstants';
import useGoalStatuses from '../../hooks/useGoalStatuses';

interface GoalItemProps {
  goal: Goal;
  onEditGoal: (goal: Goal) => void;
  onGoalUpdate?: (updatedGoal: Goal & { _deleted?: boolean }) => void;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, onEditGoal, onGoalUpdate }) => {
  const { statuses, loading: loadingStatuses } = useGoalStatuses();
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalService.deleteGoal(goal.id);
        if (onGoalUpdate) {
          onGoalUpdate({
            ...goal,
            _deleted: true
          });
        }
      } catch (error) {
        console.error('Failed to delete goal:', error);
        alert('Failed to delete goal. Please try again.');
      }
    }
  };

  const handleStatusChange = async (newStatus: GoalStatus) => {
    try {
      if (newStatus === 'COMPLETED') {
        await goalService.updateGoal(goal.id, { status: newStatus, progress: 100 });
      } else {
        await goalService.updateGoal(goal.id, { status: newStatus });
      }
      if (onGoalUpdate) {
        const updatedGoal = {
          ...goal,
          status: newStatus,
          progress: newStatus === 'COMPLETED' ? 100 : goal.progress
        };
        onGoalUpdate(updatedGoal);
      }
    } catch (error) {
      console.error('Failed to update goal status:', error);
      alert('Failed to update goal status. Please try again.');
    }
  };

  const handleProgressUpdate = async (newProgress: number) => {
    try {
      await goalService.updateGoal(goal.id, { progress: newProgress });
      if (onGoalUpdate) {
        const updatedGoal = {
          ...goal,
          progress: newProgress
        };
        onGoalUpdate(updatedGoal);
      }
    } catch (error) {
      console.error('Failed to update goal progress:', error);
      alert('Failed to update goal progress. Please try again.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goal.status)} mt-2`}>
            {formatStatus(goal.status)}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEditGoal(goal)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="mt-2 text-gray-600">{goal.description}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-500">Category:</span> {goal.category}
        </div>
        {goal.targetDate && (
          <div>
            <span className="font-medium text-gray-500">Target Date:</span> {formatDate(goal.targetDate)}
          </div>
        )}
        <div>
          <span className="font-medium text-gray-500">Created:</span> {formatDate(goal.createdAt)}
        </div>
        <div>
          <span className="font-medium text-gray-500">Last Updated:</span> {formatDate(goal.updatedAt)}
        </div>
      </div>

      {/* Progress control */}
      <div className="mt-4">
        <ProgressControl 
          value={goal.progress || 0} 
          onChange={handleProgressUpdate} 
        />
      </div>

      {/* Status update buttons */}
      <div className="mt-4 space-x-2">
        {loadingStatuses ? (
          <span className="text-sm text-gray-500">Loading statuses...</span>
        ) : (
          statuses.map((status) => {
            const buttonStyle = getStatusButtonStyle(status, goal.status);
            
            return (
              <button 
                key={status}
                onClick={() => handleStatusChange(status as any)} 
                className={`px-2 py-1 rounded text-sm ${buttonStyle}`}
              >
                {formatStatus(status)}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GoalItem;
