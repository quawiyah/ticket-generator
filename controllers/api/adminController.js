const { hash, compare } = require('bcrypt');
const Admin = require("../../models/Admin");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "don't share this secret with anyone";

const storeAdmin = async (req, res) => {
  try {
    console.log("Incoming request:", { body: req.body, files: req.files });

    const { full_name, email, password } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Full name, email, and password are required fields",
      });
    }

    // Handle file upload if exists
    let avatarPath = null;
    if (req.files && req.files.avatar) {
      const avatar = req.files.avatar;
      // You might want to add file type validation here
      avatarPath = "/uploads/" + avatar.name;
      // Create uploads directory if it doesn't exist
      const fs = require('fs');
      const dir = './uploads';
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
      }
      // Move the file to your desired location
      await avatar.mv('.' + avatarPath);
    }
    const hashed = await bcrypt.hash(password, 10);
    // Prepare the data object
    const adminData = {
        full_name,
        email,
        password: hashed,
        avatar: avatarPath
    };

    console.log("Inserting admin:", adminData);
    const result = await Admin.insert(adminData);
    console.log("Saved password:", result.password);
    // result.password = await hash(result.password, 10);
    console.log("Insert result:", result);

    delete result.password; // Remove password from response for security
    res.status(201).json({
      status: "success",
      message: "Admin added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in storeAdmin:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing your request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAdmins = async (req, res) => {
  const admins = await Admin.fetch();
  res.json({
    status: "success",
    message: "Admins fetched successfully",
    data: admins,
  });
};

const getAdminById = async (req, res) => {
  let { id } = req.params;
  const admin = await Admin.find(id);
  if (!admin) {
    return res.status(404).json({
      status: "error",
      message: "Admin not found",
    });
  }
  res.json({
    status: "success",
    message: "Admin fetched successfully",
    data: admin,
  });
};

const updateAdmin = async (req, res) => {
  let { id } = req.params;
  let { full_name, email, password, avatar } = req.body;
  const admin = await Admin.find(id);
  if (!admin) {
    return res.status(404).json({
      status: "error",
      message: "Admin not found",
    });
  }
  admin.fill({ full_name, email, avatar });
    if (password) {
        admin.password = await hash(password, 10);
    }

  await admin.update();

  res.json({
    status: "success",
    message: "Admin updated successfully",
    data: admin,
  });
};

const partialAdminUpdate = async (req, res) => {
  let { id } = req.params;
  const admin = await Admin.find(id);
  if (!admin) {
    return res.status(404).json({
      status: "error",
      message: "Admin not found",
    });
  }
  admin.fill(req.body);
  if (req.body.password) {
        admin.password = await hash(req.body.password, 10);
  }
  await admin.update();

  res.json({
    status: "success",
    message: "Admin updated successfully",
    data: admin,
  });
};

const deleteAdmin = async (req, res) => {
  let { id } = req.params;
  const deleted = await Admin.delete(id);
  if (!deleted) {
    return res.status(404).json({
      status: "error",
      message: "Failed to delete admin",
    });
  }

  res.json({
    status: "success",
    message: "Admin deleted successfully",
  });
};

const apiLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json(
            {
                status: 'error',
                message: 'Email and password are required'
            }
        )
    }
    // Check if the admin exists
    const admin = await Admin.findByEmail(email);
    if (!admin) {
        return res.status(401).json(
            {
                status: 'error',
                message: 'Invalid email or password'
            }
        )
    }

    console.log('Input password:', password);
    console.log('Stored hashed password:', admin.password);
    // Check if the password is correct
    const isValidPassword = await compare(password, admin.password);
    if (!isValidPassword) {
        return res.status(401).json(
            {
                status: 'error',
                message: 'Invalid email or password'
            }
        )
    }
    // Generate a token
    const token = jwt.sign({ admin: admin }, JWT_SECRET, { expiresIn: '1h' });
    // Send the token to the client
    res.json(
        {
            status: 'success',
            message: 'Login successful',
            data: { token }
        }
    )
}

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Incoming login request body:", req.body);

  if (!email || !password) {
    req.flash('error', 'Email and password are required');
    return res.back();
  }

  const admin = await Admin.findByEmail(email);
  const passwordMatch = admin && await compare(password, admin.password);

  if (!admin || !passwordMatch) {
    req.flash('error', 'Incorrect email or password');
    return res.back();
  }

  req.session.admin = admin;
  req.flash('success', 'Login successful');
  res.redirect('/admin/people');
};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            req.flash('error', 'Could not log out');
            return res.back();
        }
        res.redirect('/user/login');
    });
}

module.exports = {
  storeAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  partialAdminUpdate,
  deleteAdmin,
  apiLogin,
  login,
  logout
};
