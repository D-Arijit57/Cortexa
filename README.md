# 🚀 Cortexa - Remote Interview Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.23-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-red?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

A modern, full-stack remote interview platform built with Next.js 14, featuring real-time video calls, collaborative code editing, and comprehensive interview management.

## ✨ Features

### 🎥 **Video Conferencing**
- **Real-time video calls** with Stream.io SDK
- **Screen sharing** capabilities
- **Multiple layout options** (Grid View, Speaker View)
- **Participant management** with real-time updates
- **High-quality audio/video** streaming

### 💻 **Interactive Code Editor**
- **Monaco Editor integration** for professional coding experience
- **Multi-language support**: JavaScript, Python, Java
- **Pre-built coding challenges** (Two Sum, Reverse String, Palindrome Number)
- **Resizable dual-panel interface** for simultaneous coding and video
- **Syntax highlighting** and code completion

### 📅 **Interview Management**
- **Comprehensive scheduling system** with 17 time slot options
- **Calendar integration** for easy date selection
- **Role-based access control** (Candidate, Interviewer, Admin)
- **Interview lifecycle tracking** (Upcoming, Completed, Succeeded, Failed)
- **Real-time notifications** and status updates

### 🔐 **Authentication & Security**
- **Clerk authentication** with secure user management
- **Role-based permissions** and access control
- **Protected routes** and middleware security
- **Secure API endpoints** with proper validation

### 🎨 **Modern UI/UX**
- **Responsive design** optimized for all devices
- **Dark/Light theme** support with next-themes
- **Tailwind CSS** with shadcn/ui components
- **Smooth animations** and transitions
- **Accessible components** following WCAG guidelines

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript development
- **React 18** - Modern React with concurrent features
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library

### **Backend & Database**
- **Convex** - Real-time database with TypeScript
- **Stream.io** - Video calling and chat infrastructure
- **Clerk** - Authentication and user management

### **Development Tools**
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing and optimization
- **Monaco Editor** - Professional code editor component

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Convex account and deployment
- Stream.io account and API keys
- Clerk account and authentication keys

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/D-Arijit57/Cortexa.git
   cd Cortexa
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CONVEX_DEPLOYMENT=your_convex_deployment_url
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
   STREAM_SECRET_KEY=your_stream_secret_key
   ```

4. **Convex Setup**
   ```bash
   npx convex dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Cortexa/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # Admin dashboard routes
│   │   ├── (root)/            # Main application routes
│   │   │   ├── meeting/       # Video meeting pages
│   │   │   ├── schedule/      # Interview scheduling
│   │   │   └── recordings/    # Interview recordings
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── MeetingRoom.tsx   # Video call interface
│   │   ├── CodeEditor.tsx    # Code editing component
│   │   └── ...               # Other components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   └── constants/            # Application constants
├── convex/                   # Convex database schema & functions
├── public/                   # Static assets
└── ...                       # Configuration files
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## 🌟 Key Components

### **MeetingRoom.tsx**
- Handles video call interface and controls
- Manages participant layouts and video streams
- Integrates with Stream.io SDK for real-time communication

### **CodeEditor.tsx**
- Monaco Editor integration for coding challenges
- Multi-language support with syntax highlighting
- Resizable panels for optimal coding experience

### **InterviewScheduleUI.tsx**
- Comprehensive interview scheduling system
- Calendar integration and time slot management
- Role-based access control for different user types

## 📱 Features in Detail

### **Video Calling**
- **Stream.io Integration**: Professional-grade video calling with low latency
- **Layout Management**: Switch between grid and speaker views
- **Screen Sharing**: Share your screen during interviews
- **Participant Controls**: Mute, camera controls, and participant list

### **Code Collaboration**
- **Real-time Editing**: Multiple users can code simultaneously
- **Language Support**: JavaScript, Python, and Java with proper syntax highlighting
- **Challenge System**: Built-in coding problems for technical interviews
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### **Interview Workflow**
- **Scheduling**: Easy interview scheduling with calendar integration
- **Notifications**: Real-time updates for interview status changes
- **Recording**: Capture and review interview sessions
- **Analytics**: Track interview performance and outcomes

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Stream.io** for video calling infrastructure
- **Convex** for real-time database solutions
- **Clerk** for authentication services
- **shadcn/ui** for beautiful component library
- **Next.js team** for the amazing framework

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Review the code examples

---

**Built with ❤️ by [D-Arijit57](https://github.com/D-Arijit57)**

*Transform your remote interviews with Cortexa - Where technology meets human connection.*

