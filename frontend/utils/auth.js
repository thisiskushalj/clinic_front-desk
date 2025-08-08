export const isLoggedIn = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
};