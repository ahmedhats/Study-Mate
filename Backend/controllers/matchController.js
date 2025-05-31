const { spawn } = require("child_process");
const User = require("../models/User");

exports.matchUser = async (req, res) => {
  try {
    const targetUserId = req.body._id;
    const targetUser = await User.findById(targetUserId).lean();
    const userList = await User.find({ _id: { $ne: targetUserId } }).lean();

    const mapUser = (user) => ({
      name: user.name,
      interests: user.interests || [],
      hobbies: user.hobbies || [],
      major: user.major || "",
      education: user.education || "",
      studyPreference: user.studyPreference || "",
      studyGoals: user.studyGoals || "",
      profileImage: user.profileImage || ""
    });

    const inputPayload = {
      target_user: mapUser(targetUser),
      user_list: userList.map(mapUser)
    };

    const python = spawn("python", ["Backend/Algorithms/Matching.py"]);
    python.stdin.write(JSON.stringify(inputPayload));
    python.stdin.end();

    let result = "";
    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.on("close", () => {
      try {
        const output = JSON.parse(result);
        res.json(output);
      } catch (err) {
        res.status(500).json({ error: "Failed to parse Python output" });
      }
    });

    python.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
    });

  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};
