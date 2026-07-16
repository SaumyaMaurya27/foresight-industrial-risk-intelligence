# Foresight Frontend Codebase

## Purpose
This directory houses the user interface layer of the platform—an interactive dashboard for refinery safety operators. The frontend provides real-time visualization of sensor inputs, displays safety alarms triggered by the Risk Engine, and provides access to the Gemini-powered AI Safety Analyst.

## Directory Structure & Files
*   `package.json` - Defines Node modules, scripts (dev, build, lint), and dependencies (React, TailwindCSS).
*   `vite.config.js` - Configuration settings for the Vite build system.
*   `tailwind.config.js` - Design system parameters (colors, layouts, styling rules).
*   `src/` - React application source code:
    *   `src/assets/` - Static images, logos, and global SVGs.
    *   `src/components/` - Reusable UI widgets (`ZoneCard.jsx`, `Timeline.jsx`, `SafetyAnalystPanel.jsx`).
    *   `src/hooks/` - Custom React hooks (`useTelemetry.js`).
    *   `src/services/` - Client API integration logic (`apiClient.js`).
    *   `src/App.jsx` - Root React application component.
    *   `src/index.css` - Global styling imports and utilities.
    *   `src/main.jsx` - React DOM initialization.

## Why It Exists
Separating the user interface from backend systems ensures that visual elements can be updated, optimized, and deployed independently. Vite guarantees rapid local compilation during development, and the static export capability enables low-latency hosting on Vercel.
