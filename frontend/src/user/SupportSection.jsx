import React from "react";
import { Mail, Phone, MessageSquare, BookOpen } from "lucide-react";

const SupportSection = () => {
  const cards = [
    {
      icon: Mail,
      title: "Email Support",
      description:
        "Detailed inquiries, official communication, or issues needing a paper trail. Response within 24 hours.",
      link: "mailto:support@example.com",
      linkText: "Send an Email",
      color: "bg-blue-100 text-blue-600",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Chat",
      description:
        "Quick questions, instant replies, on-the-go assistance. Available during business hours.",
      link: "https://wa.me/1234567890",
      linkText: "Chat on WhatsApp",
      color: "bg-green-100 text-green-600",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    {
      icon: Phone,
      title: "Call Us",
      description:
        "Speak directly with our team for urgent issues or complex queries.",
      link: "tel:+1234567890",
      linkText: "Click to Call Now",
      color: "bg-red-100 text-red-600",
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
    {
      icon: BookOpen,
      title: "Documentation",
      description:
        "Explore FAQs and guides for self-service solutions and detailed instructions.",
      link: "/documentation",
      linkText: "View Documentation",
      color: "bg-yellow-100 text-yellow-600",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600",
    },
  ];

  return (
    <section className="max-w-5xl mx-auto p-6 md:p-12 bg-white shadow-lg rounded-2xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 animate-[fadeIn_1s_ease-in-out]">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          Need Assistance? We're Here to Help!
        </h2>
        <p className="text-gray-600 md:text-lg">
          Our dedicated support team is ready to assist you. Choose the channel that best suits your needs for quick and efficient help.
        </p>
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="flex flex-col items-start p-6 border rounded-xl shadow-md hover:shadow-xl transition-transform duration-500 ease-in-out hover:-translate-y-1"
              style={{
                animation: `fadeInUp 0.5s ease forwards`,
                animationDelay: `${0.2 * index}s`,
                opacity: 0,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-full ${card.color} flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-semibold text-gray-800">{card.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{card.description}</p>
              <a
                href={card.link}
                target={card.link.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`mt-auto inline-flex items-center gap-1 px-4 py-2 text-white rounded-md transition ${card.buttonColor}`}
              >
                {card.linkText}
              </a>
            </div>
          );
        })}
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </section>
  );
};

export default SupportSection;