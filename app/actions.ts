"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitContactForm(formData: FormData) {
  try {
    let name = formData.get("name") as string;
    let email = formData.get("email") as string;
    const message = formData.get("message") as string;
    let hasEmail = true;

    if (!message) {
      return {
        message: "Please write a message :)",
        error: true,
      };
    }

    if (!email) {
      hasEmail = false;
      email = "geoffjumps@gmail.com";
    }

    if (!name) {
      name = "No Name Provided";
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.CONTACT_EMAIL as string,
      subject: `Pull Up Mastery message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Pull Up Mastery message</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Message:</strong></p>
            <p style="margin: 10px 0; white-space: pre-wrap;">
            ${hasEmail ? "" : "NO EMAIL PROVIDED"}
            ${message}</p>
          </div>
        </div>
      `,
      replyTo: email,
    });

    return {
      message: "Thanks for your message! I'll get in touch soon!",
      error: false,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      message: "Something went wrong. Please try again later.",
      error: true,
    };
  }
}
