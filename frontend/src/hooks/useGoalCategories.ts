import { useState, useEffect } from 'react';
import goalService from '../services/goalService';
import { DEFAULT_CATEGORIES } from '../constants/goalConstants';

export const useGoalCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories = await goalService.getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  
  return { categories, loading };
};

export default useGoalCategories;
