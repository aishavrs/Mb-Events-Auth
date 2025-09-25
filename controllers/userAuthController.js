const USER = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const {sendWelcomeEmail, sendNewsletter, sendResetPasswordEmail} = require("../emails/sendMail")


const generateToken =  (id, email) => {
    const token = jwt.sign({id, email}, process.env.JWT_SECRET, {expiresIn: "1d"});
    console.log(token);
    return token;
}

exports.signUp = async (req, res) => {
    console.log("incoming signup request");
    
    const {email, fullName, password} = req.body
    console.log(req.body);

    try {
        if (!email|| !fullName|| !password) {
        return res.status(400).json({message: "Please provide all credentials!"})
    }

    const existingUser = await USER.findOne({email})
    if (existingUser) {
        return res.status(400).json({success: false, message: "User already exists!"})
    }

    const newUser = new USER ({email, fullName, password})
    await newUser.save()

    const clientUrl = `${process.env.FRONTEND_URL}/api/auth/signin`
    await sendWelcomeEmail({
        fullName : newUser.fullName,
        clientUrl,
        email : newUser.email
    })

    res.status(200).json({success: true, message: "Sign up successful", user:{email: newUser.email, fullName: newUser.fullName}})

    } catch (error) {
        console.log(error);
        res.status(400).json({success: false, message: error.message})
    }
    
}

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  console.log("Incoming signin request:", req.body);

  try {
    // 1. Validate request
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all credentials!" });
    }

    // 2. Find user
    const user = await USER.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist!" });
    }

    // 3. Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password!" });
    }

    // 4. Generate JWT
    const token = generateToken(
      user._id,
      user.email,
    );

    // 5. Send response (don’t expose password!)
    res.status(200).json({
      success: true,
      message: "Signin successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName, // add if your schema has it
      },
    });
  } catch (error) {
    console.error("Signin error", error);
    res.status(500).json({
      message: "Signin Failed!",
      error: error.message,
    });
  }
};

exports.subscribe = async (req,res) => {
    console.log("incoming newsletter subscription");
    const { email } = req.body;
    console.log(req.body);
    try {
        if (!email) {
            return res.status(400).json({success : false, message : "Email is required"})
        }
        console.log("Preparing to send newsletter...");

    await sendNewsletter({
       email
    })
    console.log("Newsletter sent successfully.");

    res.status(200).json({success : true, message : "Thank you for subscribing!"})
    } catch (error) {
  console.error("Subscription error:", error);
  res.status(500).json({ error: "Failed to subscribe" });
}
};

//get email from request body
//check if email or user exist
//generate a reset token, save to user schema
//create reset link for the frontend 
//send email containing the reset link to reset password 
exports.forgotPassword = async (req,res) => {
    console.log("Password reset request incoming");
    const { email } = req.body;
    console.log(req.body);
    try {
        if (!email) {
            return res.status(400).json({success : false, message : "Please provide an email"})
        }

        const user = await USER.findOne({ email })
        if (!user) {
            return res.status(400).json({success : false,  message : "User not found"})
        }
        const resetToken = generateToken( user._id, email)

        user.resetToken = resetToken
        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; //15minutes
        await user.save()
        
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
        await sendResetPasswordEmail({
          email : user.email , resetLink 
        })
        res.status(200).json({
            success: true , message : "Reset Password Email sent!", resetToken
        })
    } catch (error) {
        console.log(error, "error sending email");
        res.status(400).json({success : false, message : "Something went wrong", error : error.message})
    }
};

exports.resetPassword = async (req, res) => {
  console.log("Incoming password request")

  const {password} = req.body;
  console.log(req.body);
  const {token} = req.params

  try {
    if (!password || !token) {
      res.status(400).json({success: false, message: "Invalid or expired token!"})
    }

    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10)
    await USER.findByIdAndUpdate(id, { password: hashedPassword });
    return res.status(200).json({success: true, message:"Password reset successful!"})
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({success: false, message: "Invalid or expired token"})
  }
} 