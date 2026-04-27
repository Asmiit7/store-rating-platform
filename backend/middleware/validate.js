// Validation helpers
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  // 8-16 characters, at least one uppercase, at least one special character
  if (password.length < 8 || password.length > 16) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  return true;
};

const validateName = (name) => {
  return name && name.length >= 20 && name.length <= 60;
};

const validateAddress = (address) => {
  return !address || address.length <= 400;
};

// Middleware for signup validation
const validateSignup = (req, res, next) => {
  const { name, email, password, address } = req.body;
  const errors = [];

  if (!validateName(name)) {
    errors.push('Name must be between 20 and 60 characters.');
  }
  if (!validateEmail(email)) {
    errors.push('Please provide a valid email address.');
  }
  if (!validatePassword(password)) {
    errors.push('Password must be 8-16 characters with at least one uppercase letter and one special character.');
  }
  if (!validateAddress(address)) {
    errors.push('Address must not exceed 400 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

// Middleware for user creation by admin
const validateUserCreate = (req, res, next) => {
  const { name, email, password, address, role } = req.body;
  const errors = [];

  if (!validateName(name)) {
    errors.push('Name must be between 20 and 60 characters.');
  }
  if (!validateEmail(email)) {
    errors.push('Please provide a valid email address.');
  }
  if (!validatePassword(password)) {
    errors.push('Password must be 8-16 characters with at least one uppercase letter and one special character.');
  }
  if (!validateAddress(address)) {
    errors.push('Address must not exceed 400 characters.');
  }
  if (!['admin', 'user', 'store_owner'].includes(role)) {
    errors.push('Role must be admin, user, or store_owner.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

// Middleware for store creation validation
const validateStoreCreate = (req, res, next) => {
  const { name, email, address } = req.body;
  const errors = [];

  if (!validateName(name)) {
    errors.push('Store name must be between 20 and 60 characters.');
  }
  if (!validateEmail(email)) {
    errors.push('Please provide a valid email address.');
  }
  if (!validateAddress(address)) {
    errors.push('Address must not exceed 400 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

// Middleware for password update
const validatePasswordUpdate = (req, res, next) => {
  const { newPassword } = req.body;
  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      errors: ['Password must be 8-16 characters with at least one uppercase letter and one special character.']
    });
  }
  next();
};

module.exports = {
  validateSignup,
  validateUserCreate,
  validateStoreCreate,
  validatePasswordUpdate,
};
