export const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export const getButtonText = (isLoading: boolean, isEditMode: boolean): string => {
  if (isLoading) return 'Saving...';
  return isEditMode ? 'Update Goal' : 'Create Goal';
};
