"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, TranslationKey } from "../utils/translations";

type Language = "en" | "am";

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  // Load language preference from local storage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage === "en" || savedLanguage === "am") {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const nextLang = prev === "en" ? "am" : "en";
      localStorage.setItem("language", nextLang);
      return nextLang;
    });
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations["en"][key];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
