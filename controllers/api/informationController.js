const Information = require("../../models/Information");

const storeInformation = async (req, res) => {
  try {
    console.log("Incoming request:", { body: req.body, files: req.files });

    const { full_name, email, phone } = req.body;

    // Validate required fields
    if (!full_name || !email || !phone) {
      return res.status(400).json({
        status: "error",
        message: "Full name, email, and phone are required fields",
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

    // Prepare the data object
    const informationData = {
        full_name,
        email,
        phone: phone,
        avatar: avatarPath
    };

    console.log("Inserting information:", informationData);
    const result = await Information.insert(informationData);
    console.log("Insert result:", result);

    res.status(201).json({
      status: "success",
      message: "Information added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in storeInformation:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing your request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getInformations = async (req, res) => {
  const informations = await Information.fetch();
  res.json({
    status: "success",
    message: "Informations fetched successfully",
    data: informations,
  });
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
  let { id } = req.params;
  const deleted = await Information.delete(id);
  if (!deleted) {
    return res.status(404).json({
      status: "error",
      message: "Failed to delete information",
    });
  }

  res.json({
    status: "success",
    message: "Information deleted successfully",
  });
};

module.exports = {
  storeInformation,
  getInformations,
  getInformationById,
  updateInformation,
  partialInformationUpdate,
  deleteInformation,
};
