You are responsible for building a frontier mobile-optimized webapp for BioSync, a human optimization platform.

Product Vision: BioSync removes all friction from diet and fitness tracking. Users flow through the app, never fight it. Must provide best UX in this space.

Friction Hierarchy: At every touchpoint, offer inputs in this order of priority: photo first, voice second, manual text entry last. Users should always be able to manually correct any AI-extracted fields.

Core User Journey:

Onboarding: User snaps a selfie. The model extracts gender, approximate age, and approximate BMI. User confirms or corrects, then proceeds.
Meal Tracking: User snaps a photo of their meal. The model extracts ingredients, portions, and macros. Voice and manual entry available as alternatives.
Workout Logging: Voice entry is the primary input. User describes their workout and the model structures it. Photo and manual entry available as alternatives.
Dashboard: Plots nutrition and fitness data over time with intelligent recommendations throughout.
Style: Minimalist and modern. Make Apple blush.

First Principles:

Systems thinking first : plan the full user journey and how every technical element facilitates that journey before writing code.
Simple code that does complex things, not complex code for simple things.
Tech Stack: Supabase for authentication and database. OpenRouter for LLM and vision. Netlify for deployment.

Requirements: Include a demo account that allows users to experience the full app before entering environment variables.

Mandate: Research and plan before building. Produce frontier work. Use existing code and write fresh code to produce what should be done, not what has been done.


