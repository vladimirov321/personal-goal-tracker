import React, { useState, useEffect } from 'react';
import goalService, { Goal } from '../../services/goalService';
import GoalList from './GoalList';
import GoalForm from './GoalForm';

const GoalManager: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | undefined>(undefined);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleAddGoalClick = () => {
    setCurrentGoal(undefined);
    setIsFormVisible(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setCurrentGoal(goal);
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setCurrentGoal(undefined);
  };

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const fetchedGoals = await goalService.getAllGoals();
        setGoals(fetchedGoals);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to load goals');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const handleSuccess = () => {
    const fetchGoals = async () => {
      try {
        const fetchedGoals = await goalService.getAllGoals();
        setGoals(fetchedGoals);
      } catch (err: any) {
        console.error('Failed to refresh goals:', err);
      }
    };
    fetchGoals();
  };

  const handleGoalUpdate = (updatedGoal: Goal & { _deleted?: boolean }) => {
    if (updatedGoal._deleted) {
      setGoals(currentGoals => 
        currentGoals.filter(goal => goal.id !== updatedGoal.id)
      );
    } else {
      setGoals(currentGoals => 
        currentGoals.map(goal => 
          goal.id === updatedGoal.id ? updatedGoal : goal
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      {!isFormVisible ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Goals</h2>
            <button
              onClick={handleAddGoalClick}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add New Goal
            </button>
          </div>
          {loading ? (
            <div className="text-center py-4">Loading goals...</div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : (
            <GoalList 
              goals={goals}
              onEditGoal={handleEditGoal} 
              onGoalUpdate={handleGoalUpdate}
            />
          )}
        </>
      ) : (
        <GoalForm
          goal={currentGoal}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default GoalManager;
