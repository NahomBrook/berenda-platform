// frontend/src/utils/translations.ts
export type TranslationKey = 
  | "nav.home"
  | "nav.properties"
  | "nav.bookings"
  | "nav.host"
  | "nav.profile"
  | "nav.login"
  | "nav.register"
  | "nav.logout"
  | "nav.dashboard"
  | "ai.title"
  | "ai.subtitle"
  | "ai.placeholder"
  | "ai.tip"
  | "ai.clear"
  | "ai.typing"
  | "ai.welcome"
  | "ai.error"
  // Add other keys as needed
  ;

export const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.properties": "Properties",
    "nav.bookings": "My Bookings",
    "nav.host": "Become a Host",
    "nav.profile": "Profile",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.logout": "Logout",
    "nav.dashboard": "Dashboard",
    
    // AI Chat
    "ai.title": "AI Assistant",
    "ai.subtitle": "Always here to help",
    "ai.placeholder": "Ask me anything...",
    "ai.tip": "💡 Try asking about properties, bookings, or hosting",
    "ai.clear": "Clear",
    "ai.typing": "Assistant is typing...",
    "ai.welcome": "👋 **Hello!** I'm your Berenda AI Assistant.\n\nI can help you find properties, make bookings, answer questions about hosting, and more!\n\nWhat would you like to know?",
    "ai.error": "Sorry, I'm having trouble connecting. Please try again later.",
  },
  am: {
    // Navigation
    "nav.home": "መነሻ",
    "nav.properties": "ንብረቶች",
    "nav.bookings": "ቦኪንጎቼ",
    "nav.host": "አስተናጋጅ ሁን",
    "nav.profile": "መገለጫ",
    "nav.login": "ግባ",
    "nav.register": "ተመዝገብ",
    "nav.logout": "ውጣ",
    "nav.dashboard": "ዳሽቦርድ",
    
    // AI Chat
    "ai.title": "ኤአይ ረዳት",
    "ai.subtitle": "ሁልጊዜ ለመርዳት ዝግጁ",
    "ai.placeholder": "ማንኛውንም ነገር ጠይቀኝ...",
    "ai.tip": "💡 ስለ ንብረቶች፣ ቦኪንግ ወይም ሆስቲንግ ለመጠየቅ ሞክር",
    "ai.clear": "አጽዳ",
    "ai.typing": "ረዳት እየጻፈ ነው...",
    "ai.welcome": "👋 **ሰላም!** እኔ የቤረንዳ ኤአይ ረዳት ነኝ።\n\nንብረቶችን ለማግኘት፣ ቦኪንግ ለማድረግ፣ ስለ ሆስቲንግ ጥያቄዎችን ለመመለስ እና ሌሎችንም ላግዝህ እችላለሁ!\n\nምን መርዳት ትፈልጋለህ?",
    "ai.error": "ይቅርታ፣ ለመገናኘት ችግር አጋጥሞኛል። እባክህ ቆይተህ እንደገና ሞክር።",
  }
};