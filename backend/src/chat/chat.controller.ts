// backend/src/modules/chat/chat.controller.ts - Add this function if missing

export const sendAIMessage = async (req: Request, res: Response) => {
  try {
    const userFromToken = (req as any).user;
    const userId = userFromToken?.userId || userFromToken?.id;
    const { message } = req.body;

    console.log('🤖 AI Message request:', { userId, message: message?.substring(0, 50) });

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(message);

    // Create AI message response
    const aiMessage = {
      id: `ai-${Date.now()}`,
      senderId: userId,
      message: aiResponse,
      createdAt: new Date().toISOString(),
      isAi: true,
    };

    console.log('🤖 AI Response sent');
    res.json(aiMessage);
  } catch (error) {
    console.error("Error in sendAIMessage:", error);
    res.status(500).json({ message: "Failed to get AI response" });
  }
};

// AI Response Generator
async function generateAIResponse(userMessage: string): Promise<string> {
  const lowerMessage = userMessage.toLowerCase();
  
  // Property-related queries
  if (lowerMessage.includes('property') || lowerMessage.includes('list') || lowerMessage.includes('find')) {
    return "🏠 **Finding Properties**\n\nYou can browse all available properties on the homepage. Here are some tips:\n\n• Use the search bar to filter by location\n• Set price range using the filters button\n• Select dates to check availability\n• Sort by price, rating, or popularity\n\nWould you like me to help you find something specific?";
  }
  
  // Booking-related queries
  if (lowerMessage.includes('book') || lowerMessage.includes('reservation') || lowerMessage.includes('stay')) {
    return "📅 **Making a Booking**\n\nTo book a property:\n\n1️⃣ Select your check-in and check-out dates on the property page\n2️⃣ Click 'Book Now'\n3️⃣ Review your booking details\n4️⃣ Confirm your reservation\n\nYou'll receive a confirmation email once the booking is approved by the host.\n\nNeed help with an existing booking?";
  }
  
  // Pricing queries
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
    return "💰 **Pricing Information**\n\nProperty prices vary based on:\n• Location and neighborhood\n• Property size and amenities\n• Season and availability\n• Length of stay (monthly discounts available)\n\nYou can filter by price range using the filters button. Each property shows the monthly rate, and you can see the total cost before confirming your booking.\n\nIs there a specific budget you're working with?";
  }
  
  // Location queries
  if (lowerMessage.includes('location') || lowerMessage.includes('area') || lowerMessage.includes('neighborhood') || lowerMessage.includes('city')) {
    return "📍 **Location Guide**\n\nOur properties are located in prime areas across the city:\n\n🏙️ **Downtown** - Perfect for business travelers and nightlife\n🌳 **Suburbs** - Great for families and longer stays\n🏖️ **Beachfront** - Ideal for vacation and relaxation\n🏔️ **Mountain View** - Perfect for nature lovers\n\nEach property listing includes the exact location on a map, nearby attractions, and transportation options.\n\nWhat type of area are you looking for?";
  }
  
  // Hosting queries
  if (lowerMessage.includes('host') || lowerMessage.includes('list property') || lowerMessage.includes('become a host')) {
    return "🔑 **Become a Host**\n\nReady to start hosting? Here's how:\n\n1️⃣ Click 'Host a Berenda' in the navigation bar\n2️⃣ Add property details (title, description, location)\n3️⃣ Upload photos of your space\n4️⃣ Set your monthly price and availability\n5️⃣ Add amenities and house rules\n6️⃣ Submit for approval\n\nOur team will review your listing within 24-48 hours. Once approved, your property will appear in search results!\n\nWould you like to know more about the hosting process?";
  }
  
  // Account queries
  if (lowerMessage.includes('account') || lowerMessage.includes('profile') || lowerMessage.includes('settings')) {
    return "👤 **Account Management**\n\nYou can manage everything from your profile page:\n\n✏️ **Edit Profile** - Update your personal information and photo\n📅 **Bookings** - View upcoming and past stays\n❤️ **Wishlist** - Save properties you love\n⚙️ **Settings** - Change notification preferences\n\nNeed help with anything specific?";
  }
  
  // Help/General
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('assistant')) {
    return "🤖 **Berenda AI Assistant**\n\nI'm here to help with:\n\n🏠 **Properties** - Find the perfect place to stay\n📅 **Bookings** - Make, modify, or cancel reservations\n💰 **Pricing** - Understand costs and fees\n📍 **Locations** - Learn about different areas\n🔑 **Hosting** - List your property\n👤 **Account** - Manage your profile\n❓ **FAQs** - Answer common questions\n\nWhat would you like to know?";
  }
  
  // Greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon')) {
    return "👋 **Hello!** I'm your Berenda AI Assistant.\n\nI can help you with:\n• Finding the perfect property\n• Making bookings\n• Understanding pricing\n• Learning about locations\n• Becoming a host\n\nWhat can I help you with today?";
  }
  
  // Thank you
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're welcome! 😊 I'm glad I could help.\n\nIs there anything else you'd like to know about Berenda? I'm here to help with properties, bookings, hosting, or anything else!";
  }
  
  // Default response with suggestions
  return "Thanks for your message! I'm here to help you with Berenda. Here are some things you can ask me about:\n\n🔍 \"Find properties in New York\"\n📅 \"How do I make a booking?\"\n💰 \"How much does it cost to host?\"\n📍 \"What areas are good for families?\"\n🔑 \"How do I become a host?\"\n👤 \"How do I update my profile?\"\n\nWhat would you like to know?";
}