import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import axios from "axios";
import { otpType, UserType } from "../types";

export const verifyRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    SENDGRID_API_KEY: string;
  };
}>();

verifyRouter.post("/send-otp", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();

    // Validate input using UserType
    const parseResult = UserType.safeParse(body);
    if (!parseResult.success) {
      return c.json({ error: "Invalid data provided" });
    }
    const { email, name, phone, cls, department, college, event } =
      parseResult.data;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Check if the user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // If user exists, update OTP and expiration
      user = await prisma.user.update({
        where: { email },
        data: {
          otp,
          otpExpiresAt,
          updated_at: new Date(),
        },
      });
    } else {
      // If user doesn't exist, create a new user
      user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          class: cls,
          department,
          college,
          otp,
          otpExpiresAt,
        },
      });

      // Ensure registration for the event
      await prisma.registration.create({
        data: {
          userId: user.user_id,
          eventId: event, // Ensure `event` is a valid existing `event_id`
        },
      });
    }
    const eventName = await prisma.event.findUnique({
      where: { event_id: event },
    });
    // Prepare HTML email content
    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Verification Email</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              background: #ffffff;
              border: 1px solid #ddd;
              border-radius: 8px;
              text-align: center;
            }
            .otp {
              font-size: 24px;
              font-weight: bold;
              color: #007BFF;
              margin: 20px 0;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Your OTP Code</h1>
            <p>Use the code below to complete your verification:</p>
            <p class="otp">${otp}</p>
            <p>Please enter the above OTP on the website to complete your registration for the event 
            ${eventName?.name}.</p>
            <div class="footer">
              <p>If you have any questions, contact us at technirmaan25@gmail.com.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Prepare the email message
    const msg = {
      personalizations: [
        {
          to: [{ email: email }],
          subject: "Your OTP For Registering in TechNirmaan",
        },
      ],
      from: { email: "technirmaan25@gmail.com" }, // Replace with your verified sender
      content: [
        {
          type: "text/html",
          value: htmlContent, // Send the HTML content
        },
      ],
    };

    // Send email using axios to make HTTP request to SendGrid API
    const response = await axios.post(
      "https://api.sendgrid.com/v3/mail/send",
      msg,
      {
        headers: {
          Authorization: `Bearer ${c.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Check for successful response from SendGrid
    if (response.status !== 202) {
      throw new Error("Failed to send email");
    }

    return c.json({ success: true, message: "OTP sent successfully" });
  } catch (e: any) {
    console.error(e);
    return c.json({ error: e.message });
  } finally {
    await prisma.$disconnect();
  }
});

verifyRouter.post("/verify-otp", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();

    // Validate input using UserType (email and OTP are required)
    const parseResult = otpType.safeParse(body);
    if (!parseResult.success) {
      return c.json({ error: "Invalid data provided" });
    }
    const { otp, email } = parseResult.data;

    // Check if the user exists and if OTP is valid
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return c.json({ error: "User not found" });
    }

    // Check if OTP is valid and not expired
    if (user.otp !== otp) {
      return c.json({ error: "Invalid OTP" });
    }

    const currentTime = new Date();

    // Check if OTP has expired
    if (user.otpExpiresAt)
      if (user.otpExpiresAt < currentTime) {
        return c.json({ error: "OTP has expired" });
      }

    // OTP is valid, update the user as verified
    await prisma.user.update({
      where: { email },
      data: {
        otp: null, // Clear OTP after successful verification
        otpExpiresAt: null, // Clear OTP expiration // You can use a 'verified' field in your user table
        updated_at: currentTime,
      },
    });

    return c.json({ success: true, message: "OTP verified successfully" });
  } catch (e: any) {
    console.error(e);
    return c.json({ error: e.message });
  } finally {
    await prisma.$disconnect();
  }
});
