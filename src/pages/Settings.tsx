import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "../components/AuthProvider";

import AccountTab from "../components/settings/AccountTab";
import LearningTab from "../components/settings/LearningTab";
import NotificationsTab from "../components/settings/NotificationsTab";
import AppearanceTab from "../components/settings/AppearanceTab";
import LogoutButton from "../components/settings/LogoutButton";

type SettingsState = {
  timer: number;
  wordsPerSession: number;
  dailyGoal: number;
  reminderEnabled: boolean;
  reminderTime: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  darkMode: boolean;
  fontSize: "small" | "medium" | "large";
};

const defaultSettings: SettingsState = {
  timer: 15,
  wordsPerSession: 10,
  dailyGoal: 50,
  reminderEnabled: true,
  reminderTime: "20:00",
  soundEnabled: true,
  vibrationEnabled: true,
  darkMode: false,
  fontSize: "medium",
};

export default function Settings() {
  const { user, logout } = useAuth();

  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const raw = localStorage.getItem("userSettings");
      return raw ? (JSON.parse(raw) as SettingsState) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("userSettings", JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const handleChange = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((p) => ({ ...p, [key]: value }));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg text-primary">Đang tải cài đặt...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <SettingsIcon className="h-6 w-6 mr-2 text-primary" /> Cài đặt ứng dụng
        </h1>
        <p className="text-muted-foreground mt-1">Quản lý tài khoản và tùy chỉnh trải nghiệm học tập của bạn.</p>
      </header>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
          <TabsTrigger value="account">Tài khoản</TabsTrigger>
          <TabsTrigger value="learning">Học tập</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="appearance">Giao diện</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
        <TabsContent value="learning">
          <LearningTab
            wordsPerSession={settings.wordsPerSession}
            timer={settings.timer}
            dailyGoal={settings.dailyGoal}
            onChange={(k, v) => handleChange(k as any, v as any)}
          />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab
            reminderEnabled={settings.reminderEnabled}
            reminderTime={settings.reminderTime}
            soundEnabled={settings.soundEnabled}
            vibrationEnabled={settings.vibrationEnabled}
            onChange={(k, v) => handleChange(k as any, v as any)}
          />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceTab
            darkMode={settings.darkMode}
            fontSize={settings.fontSize}
            onChange={(k, v) => handleChange(k as any, v as any)}
          />
        </TabsContent>
      </Tabs>

      <LogoutButton onLogout={logout} />
    </div>
  );
}
