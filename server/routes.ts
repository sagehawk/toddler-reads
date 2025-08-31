import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import { supabase } from "./supabase"; // Import server-side supabase client

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // ... (existing routes)

  // Stripe Webhook Handler
  app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; // Add this to your .env

    let event: Stripe.Event;

    try {
      if (!sig || !webhookSecret) {
        throw new Error("Webhook secret not configured");
      }
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.log(`❌ Error message: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;

      if (email) {
        try {
          // Generate a random password
          const password = Math.random().toString(36).slice(-8);

          // Create a new user in Supabase Auth
          const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
          });

          if (error) {
            throw error;
          }

          // TODO: Send the password to the user via email
          // You will need to integrate an email service here.
          // For example, using Supabase's built-in email or a service like SendGrid.
          console.log(`
            ==============================================
            User created successfully!
            Email: ${email}
            Password: ${password}
            (This password should be sent to the user)
            ==============================================
          `);

        } catch (error) {
          console.error("Error creating user in Supabase:", error);
          // Handle the error appropriately (e.g., send an alert)
        }
      }
    }

    res.json({received: true});
  });

  const httpServer = createServer(app);

  return httpServer;
}
