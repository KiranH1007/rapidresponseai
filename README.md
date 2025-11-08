# 🚨 Rapid Response AI: Multimodal Emergency Incident Analyzer

The AI-powered emergency assistance tool offers immediate, structured analysis of accident scenes—analyzing text and images via the Google Gemini API—from a robust, serverless React/TypeScript frontend, to instantly provide severity assessment, actionable advice, and locate nearby hospitals.

View your app in AI Studio: https://ai.studio/apps/drive/1O9LowMYc6D-Glsu06gXrlWcuXV9A1eVR

---

## ✨ Application Goal and User Experience (UX)

The primary goal is to provide a reliable, step-by-step assessment for first responders or bystanders in a high-stress situation.

### User Flow: Simple and Intuitive

The application's interface guides the user through three simple steps (as seen in the screenshot):
1.  **Describe the incident:** Input text description of the emergency.
2.  **Upload a photo (Optional):** Provide visual context for multimodal analysis.
3.  **Get location:** Capture precise geolocation for finding nearby resources.

### Enhanced User Features

* **Accessibility:** **Speech-to-Text** integration allows users to dictate incident descriptions, which is vital in high-stress scenarios.
* **Real-time Feedback:** **Streaming Chat Responses** provide immediate, token-by-token feedback during follow-up conversations.
* **Quick Actions:** Features **One-Click Map Links** for instant hospital navigation and a **Copy Summary Button** for quickly sharing critical information.

---

## 🧠 AI Best Practices & Technical Design

The core of this application is its reliable interaction with the Gemini API, achieved through specific engineering best practices.

### Multimodal Analysis Workflow

The application bundles the user's text, image, and location and sends it to the **`gemini-2.5-flash`** model.

1.  **Role Definition:** A strict `systemInstruction` defines the AI's role as a concise, safety-first emergency assistant.
2.  **Structured Output:** A dedicated **`responseSchema`** is enforced, compelling the model to return the initial analysis as a clean, predictable **JSON object** (containing severity, summary, and action list). This is crucial for reliable data parsing and display.
3.  **Conversational State:** After the initial analysis, the history is used to seamlessly start a persistent chat session, allowing the user to ask contextual follow-up questions.

### Cloud Run Deployment Challenges & Solutions

The deployment involved resolving several common conflicts between front-end build tools (Vite) and serverless hosting (Cloud Run).

| Challenge Faced | Root Cause | Implemented Solution |
| :--- | :--- | :--- |
| **Blank Screen / 404** | Missing `build` step or incorrect `serve` path. | Implemented a multi-stage **`Dockerfile`** to run `pnpm run build` and configured the final stage to serve the **`./build`** directory. |
| **Missing CSS/Colors** | Incorrect asset pathing (`/assets/...`) in the built HTML. | Added **`homepage: "./"`** in `package.json` (or configured `base: ''` in `vite.config.js`) and performed full cache-busting and redeployment. |
| **`API_KEY` Error on Startup**| The front-end build tool (Vite) was unable to read `process.env.API_KEY` during the build phase, resulting in an empty hardcoded key. | The API key check was refactored to use **conditional initialization** and rely solely on the **runtime environment variable** `process.env.API_KEY` to prevent a startup crash. |

---

## ⚙️ Technical Architecture & Setup

**1. ⚙️ Deployment Flow (Build and Setup)**

This flow details how the application is built, secured, and deployed on Google Cloud.

| Component | Role | Action/Interaction |
| :--- | :--- | :--- |
| **SourceRepository** | Stores application code | Code is pulled by Cloud Build upon trigger. |
| **Google Cloud Build** | CI/CD Orchestration | Runs docker build (multi-stage) and pushes the final container image. |
| **Google Artifact Registry** | Container Image Storage | Stores the rapid-response-ai:latest image, acting as the source for Cloud Run. |
| **Google Secret Manager** | Key Security | Securely stores the gemini-api-key and provides it to Cloud Run at container startup. | 
| **Google Cloud Run** | Frontend Hosting (Serverless) | Deploys the container image, retrieves the secret, and serves the application. |

**2. ⚡ Runtime Flow (User Interaction and Analysis)**

   This flow details the path a user's emergency request takes from the browser to the AI and back.

| Step | Component | Action |
| :--- | :--- | :--- |
| **1. User Interaction** | Browser (Client Application)| User fills out an Emergency Report (Text, Image, Location) and sends the Multimodal Request to the Cloud Run service URL. |
| **2. Secure Relay** | Google Cloud Run (Frontend Service) | Receives the request. It uses the securely injected API_KEY (from Secret Manager) to authenticate the request before forwarding it. |
| **3. AI Processing** | Google Gemini API | Processes the request using the gemini-2.5-flash model. It uses the defined systemInstruction and responseSchema to return a Structured JSON Analysis. |
| **4. Data Return** | Google Cloud Run (Frontend Service) | Relays the AI's Structured JSON Analysis back to the client. | 
| **5. Display Results** | Browser (Client Application) | Displays the Analysis Results (Severity Assessment, Actionable Advice, Nearby Hospitals) and manages follow-up chat. |

### Run Locally

**Prerequisites:** Node.js, **pnpm**, and a local Gemini API Key.

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```
2.  **Build the docker image locally:**
   
    To successfully build the image locally
    ```bash
    # Build the dockerfile 
    docker build  -t rapidresponseai .
    ```
    
3. **Run the docker locally:**
   
    To successfully run locally, you must pass your Gemini API Key as an environment variable to prevent the application from crashing during initialization.
    ```bash
    # Run the application in the Docker container for local testing
    docker run -p 3001:3001 --rm -e API_KEY="YOUR_ACTUAL_GEMINI_API_KEY" rapidresponseai
    ```
    
4.  **Test the docker container which is running the application:**
   
     Application should now be running. You can access it in with browser or via curl
     ```bash
    # Using curl in terminal
    curl http://localhost:3001
    ```
     
---

## 💡 Conclusion: Empowering the User

The journey to a successful Cloud Run deployment was complex, but the result is a **robust, production-ready tool**.

When a user interacts with the final application interface—**inputting data and clicking "Analyze Situation"—they are triggering a powerful, secure, and multi-step process that delivers reliable, life-saving information.** The application moves beyond a simple chat demo, functioning as a dependable system for generating actionable intelligence in critical moments.

---

## 📜 License

MIT License – See [LICENSE](https://github.com/KiranH1007/rapidresponseai/tree/main?tab=MIT-1-ov-file#MIT-1-ov-file)
