const DB = require("../../config/postgres.config");
const {
  hashPassword,
  compareHashedPassword,
} = require("../../utils/hashPassword");
const transporter = require('../../config/nodeMailer.config');
require('dotenv').config({path: '../../../.env'});
const crypto = require('crypto');
const sendEmail = require("../../services/sendEmail.services");


async function getUsers(req, res) {
  try {
    const query = "SELECT * FROM users";
    const results = await DB.query(query);
    if (results.rows <= 0) {
      res.status(400).send("No Users found !");
      return;
    }
    return res.status(200).send(results.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error !");
  }
}

async function getUserById(req, res) {
  try {
    const id = req.params.id;
    const query = "SELECT * FROM users WHERE user_id = $1";
    const result = await DB.query(query, [id]);
    if (result.rows.length <= 0) {
      res.status(400).send("No user found !");
      return;
    }
    return result.rows[0];
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error !");
  }
}

//create user account for register
async function postUser(req, res) {
  try {
    const { first_name, last_name, email, password, username } = req.body;

    if (!first_name || !last_name || !email || !password || !username) {
      return res.status(400).json({ error: "You must enter all fields!" });
    }

    const hashedPassword = await hashPassword(password);

    const query =
      "INSERT INTO users (first_name, last_name, email, password, role, username, must_change_password) VALUES ($1, $2, $3, $4, 'user', $5, 'false') RETURNING *";
    const result = await DB.query(query, [
      first_name,
      last_name,
      email,
      hashedPassword,
      username,
    ]);

    sendEmail(
      email, 
      "Bienvenue à Cinéphoria.",
      `Bonjour ${first_name} ${last_name},\n\nVotre compte Cinéphoria a été créé avec succès à cette adresse mail ${email} vous pouvez dès à réserver une place pour un scéance directement en ligne.`
    );
    
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error!" });
  }
}

function generateTemporaryPassword() {
  return crypto.randomBytes(8).toString('hex');
}

//Forgot pass resend new pass by email 
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required!" });
    }

    // Check if user exists
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const userResult = await DB.query(userQuery, [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "No user found with this email!" });
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    // Update user password in the database
    const updateQuery = "UPDATE users SET password = $1, must_change_password = true WHERE email = $2 RETURNING *";
    const result = await DB.query(updateQuery, [hashedPassword, email]);

    sendEmail(email, 'Reset Password Request', `Bonjours,\n\nVotre mot de passe temporaire est: ${temporaryPassword}\nPour des raison de sécuriter veuillez vous connectez et changer votre mot de passe au plus vite.\n\nMerci!` );
    res.status(200).json({ message: 'Un mot de passe temporaire a été envoyé à votre adresse e-mail.' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error!" });
  }
}

//change with new password
async function changePassword(req, res) {
  try {
    const { userId, newPassword, confirmPassword } = req.body;
    if (!userId || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ error: "User ID and new password are required!" });
    }

    const hashedPassword = await hashPassword(newPassword);

    const updateQuery =
      "UPDATE users SET password = $1, must_change_password = false WHERE user_id = $2 RETURNING *";
    const result = await DB.query(updateQuery, [hashedPassword, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error!" });
  }
}

async function updateUserById(req, res) {
  try {
    const id = req.params.id;
    const { first_name, last_name, email, password, role } = req.body;

    const verificationQuery = "SELECT * FROM users WHERE user_id = $1";
    const data = await DB.query(verificationQuery, [id]);

    if (data.rows.length === 0) {
      return res.status(404).json({message: "User not found"});
    }

    const user = data.rows[0];

    const isSameFirstName = first_name === user.first_name;
    const isSameLastName = last_name === user.last_name;
    const isSameEmail = email === user.email;
    const isSamePassword = await compareHashedPassword(password, user.password);
    const isSameRole = role === user.role;

    if (
      isSameFirstName &&
      isSameLastName &&
      isSameEmail &&
      isSamePassword &&
      isSameRole
    ) {
      return res.status(400).json({message: "You must update with different data."});
    }

    let hashedPassword;
    if (!isSamePassword) {
      hashedPassword = await hashPassword(password);
    } else {
      hashedPassword = user.password;
    }

    const query =
      "UPDATE users SET first_name = $1, last_name = $2, email = $3, password = $4, role = $5 WHERE user_id = $6 RETURNING *";
    const result = await DB.query(query, [
      first_name,
      last_name,
      email,
      hashedPassword,
      role,
      id,
    ]);

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).json({error:"Internal server error!"});
  }
}

async function deleteUserById(req, res) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Invalid user ID!" });
    }
    const foundUserQuery = "SELECT * FROM users WHERE user_id = $1";
    const user = await DB.query(foundUserQuery, [id]);
    console.log(`User found: ${user.rows.length !== 0}`); 

    if (user.rows.length !== 0) {
      const query = "DELETE FROM users WHERE user_id = $1";
      await DB.query(query, [id]);
      res.status(200).json({ message: "User deleted successfully!" });
    } else { 
      return res
        .status(404)
        .json({ error: "No User found with this provided ID!" });
    }
  } catch (err) {
    console.log("Error during deletion:", err); 
    res.status(500).json({ error: "Internal server error!" });
  }
}

module.exports = {
  getUsers,
  getUserById,
  deleteUserById,
  postUser,
  updateUserById,
  generateTemporaryPassword,
  forgotPassword,
  changePassword
};