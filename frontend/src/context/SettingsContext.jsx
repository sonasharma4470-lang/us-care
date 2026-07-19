import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  clinic_name: "Upadhyay Sharma Physiotherapist Clinic",
  tagline: "Restore. Renew. Recover.",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "care@upadhyaysharma.com",
  address: "123 Health Avenue, Wellness District, India",
  social: {},
  counters: {},
  business_hours: {},
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const refresh = async () => {
    try {
      const { data } = await api.get("/settings");
      setSettings({ ...DEFAULT_SETTINGS, ...data });
    } catch (e) {
      // Keep defaults
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loaded, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
