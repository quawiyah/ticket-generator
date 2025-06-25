const Information = require("../../models/Information");
const connection = require("../../models/Connection");

const adminLogin = (req, res) => {
     res.render('user/login');
}

const getTicket = async (req, res) => {
   try {
    const { email, phone } = req.query;

    if (!email || !phone) {
      return res.status(400).send("Missing Email or Phone");
    }

    const information = await Information.findByEmailAndPhone(email, phone);

    if (!information) {
      return res.status(404).send("Ticket not found");
    }

    res.render('user/retrieve', { information });
  } catch (error) {
    console.error("Error in getTicket:", error);
    res.status(500).send("Server Error");
  }
};


const storeInformation = async (req, res) => {
  try {
    console.log("Incoming request:", { body: req.body, files: req.files });

    const { full_name, email, phone, id } = req.body;

    // Validate required fields
    if (!full_name || !email || !phone) {
      req.flash('error', 'Full name and email are required');
      return res.redirect('/user/ticket');
    }

    // Validate image upload
    if (!req.files || !req.files.avatar) {
      req.flash('error', 'Avatar image is required');
      return res.redirect('/user/ticket');
    }

    const [existing] = await connection.query(
    'SELECT * FROM personal_information WHERE email = ? AND phone = ?',
    [email, phone]
    );

    if (existing.length > 0) {
      // Already registered
      req.flash('error', 'You have already registered with this email and phone number.');
      return res.redirect('/user/ticket'); // or res.status(409).json({ error: 'Already registered' }) for API
    }

    

    const avatar = req.files.avatar;
    const avatarPath = "/uploads/" + avatar.name;

    // Create uploads directory if it doesn't exist
    const fs = require('fs');
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Move the file to your desired location
    await avatar.mv('.' + avatarPath);

    // Prepare the data object
    const informationData = {
      full_name,
      email,
      phone,
      avatar: avatarPath
    };

    console.log("Inserting information:", informationData);
    const result = await Information.insert(informationData);
    console.log("Insert result:", result);

    req.flash('success', 'Ticket generated successfully');
    return res.redirect(`/user/retrieve?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`);

  } catch (error) {
    console.error("Error in storeInformation:", error.message, error.stack);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing your request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

};

const getInformations = async (req, res) => {
  const informations = await Information.fetch();
  res.render("admin/people", { informations })
};

const getInformationById = async (req, res) => {
  let { id } = req.params;
  const information = await Information.find(id);
  if (!information) {
    return res.status(404).json({
      status: "error",
      message: "Information not found",
    });
  }
  res.json({
    status: "success",
    message: "Information fetched successfully",
    data: information,
  });
};

const updateInformation = async (req, res) => {
  let { id } = req.params;
  let { full_name, email, phone, avatar } = req.body;
  const information = await Information.find(id);
  if (!information) {
    return res.status(404).json({
      status: "error",
      message: "Information not found",
    });
  }
  information.fill({ full_name, email, phone, avatar });

  await information.update();

  res.json({
    status: "success",
    message: "Information updated successfully",
    data: information,
  });
};

const partialInformationUpdate = async (req, res) => {
  let { id } = req.params;
  const information = await Information.find(id);
  if (!information) {
    return res.status(404).json({
      status: "error",
      message: "Information not found",
    });
  }
  information.fill(req.body);

  await information.update();

  res.json({
    status: "success",
    message: "Information updated successfully",
    data: information,
  });
};

const deleteInformation = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Information.delete(id);

    if (!deleted) {
      req.flash('error', 'Could not delete the person');
    } else {
      req.flash('success', 'Person deleted successfully');
    }
  } catch (err) {
    console.error('Delete error:', err);
    req.flash('error', 'An error occurred while deleting the person');
  }

  res.redirect('/admin/people');
};

module.exports = {
  adminLogin,
  getTicket,
  storeInformation,
  getInformations,
  getInformationById,
  updateInformation,
  partialInformationUpdate,
  deleteInformation,
};
