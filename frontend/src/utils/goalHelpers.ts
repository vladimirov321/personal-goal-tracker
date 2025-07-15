export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'TODO': return 'bg-gray-200 text-gray-800';
    case 'IN_PROGRESS': return 'bg-blue-200 text-blue-800';
    case 'COMPLETED': return 'bg-green-200 text-green-800';
    case 'CANCELLED': return 'bg-red-200 text-red-800';
    case 'ON_HOLD': return 'bg-yellow-200 text-yellow-800';
    default: return 'bg-gray-200 text-gray-800';
  }
};
export const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
export const getStatusButtonStyle = (status: string, currentStatus: string) => {
  switch(status) {
    case 'TODO':
      return currentStatus === status ? 'bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300';
    case 'IN_PROGRESS':
      return currentStatus === status ? 'bg-blue-700 text-white' : 'bg-blue-200 hover:bg-blue-300';
    case 'COMPLETED':
      return currentStatus === status ? 'bg-green-700 text-white' : 'bg-green-200 hover:bg-green-300';
    case 'CANCELLED':
      return currentStatus === status ? 'bg-red-700 text-white' : 'bg-red-200 hover:bg-red-300';
    case 'ON_HOLD':
      return currentStatus === status ? 'bg-yellow-700 text-white' : 'bg-yellow-200 hover:bg-yellow-300';
    default:
      return currentStatus === status ? 'bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300';
  }
};
