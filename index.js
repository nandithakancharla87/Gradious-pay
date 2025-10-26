function getUsers() {
    return JSON.parse(localStorage.getItem('gradiousUsers') || '{}');
  }
  function saveUsers(users) {
    localStorage.setItem('gradiousUsers', JSON.stringify(users));
  }
  function getSession() {
    return JSON.parse(localStorage.getItem('gradiousSession'));
  }
  function saveSession(username) {
    localStorage.setItem('gradiousSession', JSON.stringify({username}));
  }
  function clearSession() {
    localStorage.removeItem('gradiousSession');
  }
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  let currentUsername = null;
  let balance = 5000;
  let transactions = [];

  window.onload = () => {
    const session = getSession();
    if (session && session.username) {
      const users = getUsers();
      if (users[session.username]) {
        currentUsername = session.username;
        balance = users[currentUsername].balance || 5000;
        transactions = users[currentUsername].transactions || [];
        showApp();
      } else {
        clearSession();
        showLogin();
      }
    } else {
      showLogin();
    }
  };

  function showLogin() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('registerPage').classList.add('hidden');
    document.getElementById('appPage').classList.add('hidden');
    clearMessages();
  }

  function showRegister() {
    document.getElementById('registerPage').classList.remove('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('appPage').classList.add('hidden');
    clearMessages();
  }

  function showApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('registerPage').classList.add('hidden');
    document.getElementById('appPage').classList.remove('hidden');

    document.getElementById('profileName').textContent = capitalize(currentUsername);
    document.getElementById('profileUpi').textContent = currentUsername + '@gradious';
    document.getElementById('balance').textContent = balance;

    showPage('home');
  }

  function clearMessages() {
    document.getElementById('loginMessage').textContent = '';
    document.getElementById('registerMessage').textContent = '';
    document.getElementById('sendMessage').textContent = '';
  }

  function handleRegister() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const message = document.getElementById('registerMessage');
    const users = getUsers();

    if (!username || !password) {
      message.textContent = 'Please enter both username and password.';
      return;
    }
    if (users[username]) {
      message.textContent = 'Username already exists. Please choose another.';
      return;
    }

    users[username] = {
      password,
      balance: 5000,
      transactions: []
    };
    saveUsers(users);

    message.style.color = 'green';
    message.textContent = 'Registration successful! You can now login.';
    setTimeout(() => {
      showLogin();
      message.style.color = 'red';
      message.textContent = '';
    }, 2000);
  }

  function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const message = document.getElementById('loginMessage');
    const users = getUsers();

    if (!username || !password) {
      message.textContent = 'Please enter both username and password.';
      return;
    }

    if (users[username] && users[username].password === password) {
      currentUsername = username;
      balance = users[username].balance || 5000;
      transactions = users[username].transactions || [];
      saveSession(username);
      showApp();
      clearMessages();
    } else {
      message.textContent = 'Invalid username or password.';
    }
  }

  function logout() {
    saveUserData();
    clearSession();
    currentUsername = null;
    balance = 5000;
    transactions = [];
    showLogin();
  }

  function showPage(page) {
    const pages = ['home', 'send', 'transactions', 'profile'];
    pages.forEach(p => document.getElementById(p).classList.add('hidden'));
    document.getElementById(page).classList.remove('hidden');

    if (page === 'transactions') renderTransactions();
  }

  function sendMoney() {
    const to = document.getElementById('receiver').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const msg = document.getElementById('sendMessage');

    if (!to || isNaN(amount) || amount <= 0) {
      msg.textContent = 'Please enter valid details.';
      msg.style.color = 'red';
      return;
    }
    if (amount > balance) {
      msg.textContent = 'Insufficient balance.';
      msg.style.color = 'red';
      return;
    }

    balance -= amount;
    transactions.unshift({
      to,
      amount,
      date: new Date().toLocaleString()
    });

    document.getElementById('balance').textContent = balance;

    msg.textContent = `₹${amount} sent to ${to}.`;
    msg.style.color = 'green';

    document.getElementById('receiver').value = '';
    document.getElementById('amount').value = '';

    saveUserData();
  }

  function renderTransactions() {
    const list = document.getElementById('transactionList');
    list.innerHTML = '';

    if (transactions.length === 0) {
      list.innerHTML = '<p>No transactions yet.</p>';
      return;
    }

    transactions.forEach(tx => {
      const div = document.createElement('div');
      div.className = 'transaction';
      div.innerText = `Sent ₹${tx.amount} to ${tx.to} on ${tx.date}`;
      list.appendChild(div);
    });
  }

  function saveUserData() {
    if (!currentUsername) return;
    const users = getUsers();
    users[currentUsername] = {
      ...users[currentUsername],
      balance,
      transactions
    };
    saveUsers(users);
  }