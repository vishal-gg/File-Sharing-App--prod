const express = require("express");
const router = express.Router();
const sendLinkViaEmail = require("../services/nodeMailer");
const { parseFileSize } = require("../utils/calculations");

// // download using url link
// router.get("/:url", async (req, res) => {
//   try {
//     const url = decodeURIComponent(req.params.url);
//     const URLInstance = url.split('?')
//     const size = URLInstance.pop()
//     const link = URLInstance.join('?')
//     const fileName = new URL(url).pathname.split('/').pop();
//     const { downloadSize, unit } = parseFileSize(Number(size));
//       res.render("downloadPage", {
//         name: fileName,
//         size: { downloadSize, unit },
//         link: link
//       });

//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ error: err.message || "something went wrong" });
//   }
// });

//download using email
router.post("/send", async (req, res) => {
  try {
    const {linkForEmail, senderEmail, receiverEmail } = req.body;

    if (!linkForEmail, !senderEmail || !receiverEmail) {
      return res.status(422).json({ error: "Missing required fields" });
    }

    const url = decodeURIComponent(linkForEmail);
    const URLInstance = url.split('?')
    const size = URLInstance.pop()
    const fileLink = URLInstance.join('?')
    const fileName = new URL(url).pathname.split('/').pop();
    const { downloadSize, unit } = parseFileSize(Number(size));
  

    // sending email
    await sendLinkViaEmail({
      sender: senderEmail,
      receiver: receiverEmail,
      subject: "File Sharing",
      text: "someone share this file with you",
      html: `<div
      style="
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        padding: 1rem 4rem;
      "
    >
      <div
        style="
          max-width: 600px;
          margin-inline: auto;
          background-color: #fff;
          border-radius: 5px;
          background-color: #f4f4f3;
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
        "
      >
        <div
          style="
            background-color: #007bff;
            color: #fff;
            text-align: center;
            padding: 20px;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
          "
        >
          <h1 style="font-size: 24px; margin: 0; padding: 0">Snap Share</h1>
        </div>
        <div style="padding: 20px">
          <p style="margin: 10px 0; color: #555">
            <strong>Subject:</strong> Your File is Ready for Download
          </p>
          <p style="margin: 10px 0; color: #555">
            <strong>From:</strong> ${senderEmail}
          </p>
          <p style="margin: 10px 0; color: #555">
            <strong>File Name:</strong> ${fileName}
          </p>
          <p style="margin: 10px 0; color: #555">
            <strong>File Size:</strong> ${downloadSize} ${unit}
          </p>
        </div>
        <div style="text-align: center;">
          <button
            style="
              display: inline-block;
              padding: 12px 30px;
              background-color: #007bff;
              border-radius: 5px;
              font-size: 18px;
              font-weight: bold;
              outline: none;
              border: none;
              cursor: pointer;
              margin-bottom: 2rem;
            "
          >
            <a
              style="color: #fff; text-decoration: none"
              href=${ fileLink }
              >Download File</a
            >
          </button>
        </div>
      </div>
    </div>`,
    });
    res.status(200).json({ message: "email has been delivered" });
  } catch (err) {
    res.status(400).json({ error: err.message || "something went wrong" });
  }
});

module.exports = router;
