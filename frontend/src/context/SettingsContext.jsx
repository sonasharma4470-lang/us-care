import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  clinic_name: "CARE WITH US",
  tagline: "Movement. Recovery. Rehabilitation.",
  phone: "+91 00000 00000",
  whatsapp: "+91 00000 00000",
  email: "info@carewithus.in",
  address: "3rd Floor, Aastha Hospital, Pratap Nagar, Jaipur, Rajasthan",
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
