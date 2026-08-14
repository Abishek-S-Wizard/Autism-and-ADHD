# 🧠 ASD & ADHD Screening & Support Platform

A full-stack web-based platform designed to provide **screening, AI-assisted analysis, healthcare communication, research resources, and reporting** related to **Autism Spectrum Disorder (ASD)** and **Attention-Deficit/Hyperactivity Disorder (ADHD)**.

The platform provides separate interfaces for **Patients/Caretakers, Doctors, Researchers, and Administrators**, bringing screening tools, reports, communication, research papers, and management features together in one system.

## 🌐 Live Demo

🚀 **[Visit the Live Demo](https://autism-adhd.netlify.app/)**

---

## 📌 Project Overview

The ASD & ADHD platform is designed as a centralized digital system where users can perform screening assessments, access AI-assisted analysis, communicate with doctors, view reports, and explore research resources.

The platform contains four major roles:

* 👨‍👩‍👧 **Patient / Caretaker**
* 👨‍⚕️ **Doctor**
* 🔬 **Researcher**
* 🛡️ **Admin**

The system combines **React.js, Supabase, Python, and AI/ML-based functionality** to create an integrated healthcare-oriented application.

> ⚠️ **Important:** This project is intended for educational, research, and screening-support purposes. AI-generated results should not be considered a medical diagnosis. Professional evaluation by a qualified healthcare provider is required for diagnosis and treatment decisions.

---

# 👥 User Roles

## 👨‍👩‍👧 1. Patient / Caretaker

Patients or caretakers can access screening and support features through their account.

### Features

* 🔐 User registration and login
* 📝 ASD screening
* 📝 ADHD screening
* 📷 AI-assisted facial analysis for ASD-related screening
* 🧠 MRI image analysis module for ADHD-related research/screening
* 📊 View screening results
* 📄 Generate/view reports
* 🤖 Report-based chatbot
* 👨‍⚕️ Connect with doctors
* 💬 Send and receive messages with doctors
* 📚 Access relevant research papers
* 👤 Manage personal profile

---

## 👨‍⚕️ 2. Doctor

Doctors can review patient information and interact with patients through the platform.

### Features

* 🔐 Doctor login
* 👥 View assigned/connected patients
* 📊 View patient screening results
* 📄 Review patient reports
* 🧠 Review ASD/ADHD screening information
* 💬 Communicate with patients
* 📩 Send and receive messages
* 📋 Provide professional feedback
* 👤 Manage doctor profile

---

## 🔬 3. Researcher

Researchers can access research-oriented functionality within the platform.

### Features

* 🔬 Access research resources
* 📚 Browse research papers
* 📄 View research-related information
* 🧠 Explore ASD and ADHD datasets/results
* 📊 Analyze available screening information
* 🤖 Explore AI/ML-based analysis
* 📑 Support research and academic activities
* 👤 Manage researcher profile

---

## 🛡️ 4. Admin

The administrator manages the overall platform and its users.

### Features

* 👥 User management
* 👨‍⚕️ Doctor management
* 🔬 Researcher management
* 📝 Patient/Caretaker management
* 📚 Research paper management
* 💬 Monitor platform communication
* 📊 View system-level statistics
* ⚙️ Manage platform content
* 🔐 Manage administrative access

---

# 🧠 Core Features

## 1. 📝 ASD Screening

The platform provides a questionnaire-based screening module related to Autism Spectrum Disorder.

Users can answer a series of screening questions and receive a generated screening result/report.

---

## 2. 📝 ADHD Screening

A dedicated screening module is provided for ADHD-related assessment.

The system processes the user's responses and generates a screening-support report.

---

## 3. 📷 Facial Analysis for ASD

The project includes an **AI-assisted facial analysis module** intended for ASD-related research and screening support.

Users can provide an image through the application, which is processed by the project's AI/ML functionality.

```text
User Image
    ↓
Image Processing
    ↓
AI/ML Model
    ↓
Analysis
    ↓
Screening-Support Result
```

> This module is a project/research implementation and should not be treated as a standalone diagnostic system.

---

## 4. 🧠 MRI Image Analysis for ADHD

The platform includes an **MRI image analysis module** designed for ADHD-related AI/ML research and screening support.

```text
MRI Image
    ↓
Image Preprocessing
    ↓
AI/ML Model
    ↓
Image Analysis
    ↓
Screening-Support Result
```

The module demonstrates how medical imaging data can be integrated into an AI-assisted healthcare application.

> Results from this module are for educational/research purposes and require professional clinical interpretation.

---

# 📊 5. Combined Screening

The platform brings together screening functionality for both:

* 🧠 Autism Spectrum Disorder (ASD)
* ⚡ Attention-Deficit/Hyperactivity Disorder (ADHD)

Users can complete the relevant screening assessments and access their generated results and reports.

---

# 📄 6. Screening Reports

After completing screening activities, users can access generated reports containing relevant results and information.

Reports can be used to:

* Review screening results
* Understand assessment outcomes
* Share information with a doctor
* Support further professional evaluation
* Maintain screening history

---

# 🤖 7. Report Chatbot

The platform includes a **report-based chatbot** designed to help users understand information contained within their screening reports.

### Example capabilities

* Explain report information
* Answer questions about screening results
* Provide simplified explanations
* Help users understand report sections
* Provide general educational information

> The chatbot provides informational support and does not replace a doctor or mental-health professional.

---

# 💬 8. Patient ↔ Doctor Communication

The platform provides communication functionality between patients/caretakers and doctors.

```text
Patient / Caretaker
        │
        │  Message
        ▼
      Doctor
        │
        │  Reply
        ▼
Patient / Caretaker
```

### Communication Features

* 💬 Send messages
* 📩 Receive messages
* 🗨️ Doctor-patient communication
* 📋 Discuss screening reports
* 📄 Share relevant screening information
* 🔔 Communication notifications

---

# 📚 9. Research Papers

The platform contains a dedicated **Research Paper** section.

Users can explore research-related resources concerning:

* Autism Spectrum Disorder
* ADHD
* Artificial Intelligence
* Machine Learning
* Medical Image Analysis
* Healthcare Technology
* Screening methodologies

Researchers can use this section as a centralized resource for academic and research-related information.

---

# 🛠️ Technology Stack

## Frontend

* ⚛️ React.js
* HTML5
* CSS3
* JavaScript

## Backend / Database

* 🔥 Supabase
* PostgreSQL Database
* Supabase Authentication
* Supabase APIs

## AI / ML

* 🐍 Python
* Machine Learning
* Image Processing
* AI-assisted analysis

## Deployment

* 🚀 Netlify

## Development Tools

* Visual Studio Code
* Git
* GitHub
* Supabase

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │        USERS         │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       Patient/Caretaker         Doctor              Researcher
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    React Frontend    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       Supabase       │
                         │                      │
                         │ Authentication       │
                         │ PostgreSQL Database  │
                         │ APIs                 │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          ASD Screening       ADHD Screening     Communication
                 │                  │                  │
                 ▼                  ▼                  ▼
          Facial Analysis      MRI Analysis      Patient ↔ Doctor
                 │                  │
                 └──────────┬───────┘
                            ▼
                    ┌───────────────┐
                    │ Python / AI   │
                    │ ML Processing │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Reports    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Report Chatbot│
                    └───────────────┘
```

---

# 👨‍💻 My Role & Contributions

I was responsible for managing the **frontend and backend development** of the project along with basic Python/AI-related implementation.

### My Contributions

* 🎨 Developed and managed the complete **React.js frontend**
* ⚙️ Managed backend functionality
* 🔥 Integrated **Supabase**
* 🗄️ Worked with the Supabase/PostgreSQL database
* 🔐 Implemented/managed authentication functionality
* 🔗 Integrated frontend with backend services
* 📝 Developed ASD and ADHD screening interfaces
* 📷 Worked on the facial-analysis module for ASD-related screening
* 🧠 Worked on the MRI image-analysis module for ADHD-related research/screening
* 🐍 Implemented basic Python functionality
* 📄 Worked on report generation/display
* 🤖 Integrated the report chatbot functionality
* 💬 Implemented patient-doctor communication functionality
* 📚 Integrated the research-paper section
* 🐛 Tested and debugged application functionality
* 🚀 Deployed the frontend using Netlify

---

# 📂 Main Modules

```text
Autism-ADHD/
│
├── Patient / Caretaker
│   ├── Dashboard
│   ├── ASD Screening
│   ├── ADHD Screening
│   ├── Facial Analysis
│   ├── MRI Analysis
│   ├── Reports
│   ├── Report Chatbot
│   ├── Doctor Communication
│   └── Profile
│
├── Doctor
│   ├── Dashboard
│   ├── Patient Management
│   ├── Screening Results
│   ├── Reports
│   ├── Messages
│   └── Profile
│
├── Researcher
│   ├── Dashboard
│   ├── Research Papers
│   ├── Research Data
│   └── Profile
│
├── Admin
│   ├── Dashboard
│   ├── User Management
│   ├── Doctor Management
│   ├── Researcher Management
│   ├── Patient Management
│   └── Content Management
│
├── AI / ML
│   ├── ASD Facial Analysis
│   ├── ADHD MRI Analysis
│   └── Python Processing
│
└── Supabase
    ├── Authentication
    ├── PostgreSQL Database
    └── Backend Services
```

---

# 🎯 Project Objectives

* Develop a centralized platform for ASD and ADHD screening support.
* Provide separate functionality for patients, caretakers, doctors, researchers, and administrators.
* Integrate AI/ML concepts into healthcare-oriented applications.
* Implement facial image analysis for ASD-related research/screening.
* Implement MRI image analysis for ADHD-related research/screening.
* Provide questionnaire-based screening for ASD and ADHD.
* Generate accessible screening reports.
* Provide a chatbot for report-related information.
* Enable communication between patients/caretakers and doctors.
* Provide access to research papers.
* Gain practical experience in full-stack development and AI/ML integration.

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

## 2. Navigate to the Project

```bash
cd Autism-ADHD
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Configure Supabase

Create a Supabase project and configure the required environment variables.

Example:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Never commit private keys, service-role keys, passwords, or other sensitive credentials to GitHub.

## 5. Start the Development Server

```bash
npm run dev
```

---

# 🌐 Deployment

The frontend is deployed using **Netlify**.

### Live Application

🚀 https://autism-adhd.netlify.app/

---

# 🔮 Future Enhancements

* Improve AI/ML model performance.
* Add more robust medical-image preprocessing.
* Improve screening-report visualization.
* Add advanced doctor dashboards.
* Add appointment scheduling.
* Add secure document sharing between patients and doctors.
* Add real-time messaging and notifications.
* Expand the research-paper repository.
* Add research dataset management.
* Improve chatbot capabilities.
* Add multilingual support.
* Improve accessibility and mobile responsiveness.
* Deploy AI/ML models through dedicated production APIs.

---

# ⚠️ Medical & Research Disclaimer

This application is a **student/academic project** developed for educational, research, and technology demonstration purposes.

The ASD facial-analysis, ADHD MRI-analysis, questionnaire screening, reports, and chatbot outputs **must not be interpreted as medical diagnoses**.

AI models and screening questionnaires can have limitations, errors, and biases. Diagnosis and treatment decisions should always be made by qualified healthcare professionals using appropriate clinical evaluation.

---

# 🌐 Project Links

🚀 **Live Demo:**
https://autism-adhd.netlify.app/

💻 **GitHub Repository:**
Add your GitHub repository link here.

---

# 👨‍💻 Developer

**Abishek S**

**Role:** Full-Stack Developer & Python/AI Contributor

**Areas:** React.js • Supabase • Python • AI/ML • Full-Stack Development

---

⭐ If you find this project useful, consider giving the repository a **star**!
