import React, { useEffect, useState } from 'react';
import goalService, { Goal } from '../../services/goalService';
import GoalItem from './GoalItem';

interface GoalListProps {
  goals: Goal[];
  onEditGoal: (goal: Goal) => void;
  onGoalUpdate?: (updatedGoal: Goal & { _deleted?: boolean }) => void;
}

const GoalList: React.FC<GoalListProps> = ({ goals, onEditGoal, onGoalUpdate }) => {



  if (goals.length === 0) {
    return <div className="text-gray-500 py-4">You don't have any goals yet.</div>;
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <GoalItem 
          key={goal.id} 
          goal={goal} 
          onEditGoal={onEditGoal} 
          onGoalUpdate={onGoalUpdate}
        />
      ))}
    </div>
  );
};

export default GoalList;
