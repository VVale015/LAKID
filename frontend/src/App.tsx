// App.tsx
import { useState } from "react";
import { AppProvider, useApp } from "./store";
import Login from "./components/Login";
import StudentDashboard from "./components/StudentDashboard";
import StudentProfile from "./components/StudentProfile";
import GuardianDashboard from "./components/GuardianDashboard";
import InstructorDashboard from "./components/InstructorDashboard";
import LearningAssistant from "./components/assistant/LearningAssistant";
import ColorsActivity from "./components/activities/ColorsActivity";
import AlphabetActivity from "./components/activities/AlphabetActivity";
import ReadingActivity from "./components/activities/ReadingActivity";
import GamesActivity from "./components/activities/GamesActivity";
import type { AreaKey } from "./types";

import { apiGet } from "./services/api";

type StudentScreen = "dashboard" | "profile" | "activity" | "assistant";
type GuardianScreen = "dashboard" | "assistant";

function AppContent() {
  const { role, setRole, setCurrentUser } = useApp();
  const [studentScreen, setStudentScreen] = useState<StudentScreen>("dashboard");
  const [guardianScreen, setGuardianScreen] = useState<GuardianScreen>("dashboard");
  const [activeArea, setActiveArea] = useState<AreaKey | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("lakid_token");
    setRole(null);
    setCurrentUser("");
    setStudentScreen("dashboard");
    setGuardianScreen("dashboard");
    setActiveArea(null);
  };


  if (!role) {
    return <Login />;
  }

  if (role === "student") {
    if (studentScreen === "activity" && activeArea) {
      const activityProps = {
        onBack: () => {
          setStudentScreen("dashboard");
          setActiveArea(null);
        },
        onComplete: () => {
          setStudentScreen("dashboard");
          setActiveArea(null);
        },
      };
      switch (activeArea) {
        case "colors":
          return <ColorsActivity {...activityProps} />;
        case "alphabet":
          return <AlphabetActivity {...activityProps} />;
        case "reading":
          return <ReadingActivity {...activityProps} />;
        case "games":
          return <GamesActivity {...activityProps} />;
      }
    }

    if (studentScreen === "assistant") {
      return <LearningAssistant audience="student" onBack={() => setStudentScreen("dashboard")} />;
    }

    if (studentScreen === "profile") {
      return <StudentProfile onBack={() => setStudentScreen("dashboard")} onLogout={handleLogout} />;
    }

    return (
      <StudentDashboard
        onSelectArea={(area) => {
          setActiveArea(area);
          setStudentScreen("activity");
        }}
        onProfile={() => setStudentScreen("profile")}
        onAssistant={() => setStudentScreen("assistant")}
        onLogout={handleLogout}
      />
    );
  }

  if (role === "guardian") {
    if (guardianScreen === "assistant") {
      return <LearningAssistant audience="guardian" onBack={() => setGuardianScreen("dashboard")} />;
    }
    return (
      <GuardianDashboard
        onAssistant={() => setGuardianScreen("assistant")}
        onLogout={handleLogout}
      />
    );
  }


  if (role === "instructor") {
    return <InstructorDashboard onLogout={handleLogout} />;
  }

  return <Login />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
