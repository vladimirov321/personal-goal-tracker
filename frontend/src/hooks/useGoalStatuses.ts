import { useState, useEffect } from 'react';
import goalService from '../services/goalService';
import { DEFAULT_STATUSES, GoalStatus } from '../constants/goalConstants';

export const useGoalStatuses = () => {
  const [statuses, setStatuses] = useState<GoalStatus[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoading(true);
        const fetchedStatuses = await goalService.getStatuses();
        setStatuses(fetchedStatuses as GoalStatus[]);
      } catch (err) {
        console.error('Failed to load statuses:', err);
        setStatuses(DEFAULT_STATUSES as GoalStatus[]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);
  
  return { statuses, loading };
};

export default useGoalStatuses;
