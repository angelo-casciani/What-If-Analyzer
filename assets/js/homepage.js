const isLoggedIn = localStorage.getItem('isLoggedIn');

if (!isLoggedIn) {
  // User is not logged in, redirect to index
  window.location.href = 'index.html';
}
