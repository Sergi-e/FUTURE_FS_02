import { Router } from "express";
import OpenAI from "openai";
import { requireAuth } from "../middleware/auth.js";
import Lead from "../models/Lead.js";

const router = Router();

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

router.post("/chat", requireAuth, async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // If no OpenAI key is set, return a mock response that's helpful.
    if (!openai) {
      return res.json({
        reply: "I am your Leadrift AI assistant! Right now I am running in 'demo mode' because the `OPENAI_API_KEY` is not set on the server.\n\nBut I am ready to help you manage your pipeline, find leads, and answer questions as soon as the API key is added!"
      });
    }

    // Fetch user's leads to provide context to the AI
    const leads = await Lead.find({ user: req.user._id }).lean();
    
    const systemPrompt = `You are a helpful, friendly AI assistant for a CRM called "Leadrift".
You help the user manage their sales pipeline, answer questions about their data, and guide them on how to use the app.
The user currently has ${leads.length} leads in their pipeline.
Here is the raw data of their leads in JSON format:
${JSON.stringify(leads)}

Answer the user's questions based on this data. If they ask how to use the app, explain that they can use the "Add lead" button in the navigation bar, or press Ctrl+K to open the modal. They can drag and drop leads on the Pipeline page. Keep your answers concise, friendly, and formatted nicely in markdown.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("AI Error:", err);
    next(err);
  }
});

export default router;