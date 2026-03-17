import { Developer } from "../models/developerModel.js";

/**
 * Get developer keys for logged-in user
 */
export const getDeveloperKeys = async (req, res) => {
  try {
    const devKeys = await Developer.findOne({ userId: req.user.id });
    res.json({ success: true, devKeys });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Generate / Regenerate API token and secret
 */
export const generateDeveloperKeys = async (req, res) => {
  try {
    const token = Math.random().toString(36).substring(2, 12);
    const secret = Math.random().toString(36).substring(2, 18);

    let dev = await Developer.findOne({ userId: req.user.id });
    if (!dev) {
      dev = new Developer({
        userId: req.user.id,
        ip: req.body.ip || "",
        callback: req.body.callback || "",
        token,
        secret
      });
    } else {
      dev.ip = req.body.ip || dev.ip;
      dev.callback = req.body.callback || dev.callback;
      dev.token = token;
      dev.secret = secret;
      dev.updatedAt = Date.now();
    }

    await dev.save();
    res.json({ success: true, dev });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update IP address or Callback URL
 */
export const updateDeveloperSettings = async (req, res) => {
  try {
    const { ip, callback } = req.body;
    const dev = await Developer.findOne({ userId: req.user.id });
    if (!dev) return res.status(404).json({ success: false, message: "Not found" });

    dev.ip = ip || dev.ip;
    dev.callback = callback || dev.callback;
    dev.updatedAt = Date.now();

    await dev.save();
    res.json({ success: true, dev });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};