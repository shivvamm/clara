import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { Chart, registerables } from "chart.js";
const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { type: "user", content: inputValue }];
    setMessages(newMessages);
    setInputValue("");
    let session_id = uuidv4();
    try {
      const response = await fetch("http://localhost:8000/send_message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_message: inputValue,
          session_id: session_id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { type: "assistant", content: data }]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const ContentSection = ({ title, children }) => (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-gray-300">{title}</h3>
      <div className="pl-4">{children}</div>
    </div>
  );

  const StepSection = ({ step }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [height, setHeight] = useState(0);
    const contentRef = React.useRef(null);

    React.useEffect(() => {
      if (contentRef.current) {
        setHeight(isOpen ? contentRef.current.scrollHeight : 0);
      }
    }, [isOpen]);

    return (
      <div className="border border-gray-700 rounded-lg overflow-hidden w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 flex justify-between items-center bg-gray-800 hover:bg-gray-700 transition-all duration-300"
        >
          <h2 className="text-xl font-semibold text-blue-400">
            {step.heading}
          </h2>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
        <div
          ref={contentRef}
          style={{ height: `${height}px` }}
          className="overflow-hidden transition-all duration-300 ease-in-out"
        >
          <div
            className={`p-4 space-y-6 bg-gray-900 w-full opacity-${isOpen ? "100" : "0"} transition-opacity duration-300 delay-100`}
          >
            <ContentSection title="Explanations">
              {Array.isArray(step.explanations) ? (
                <ul className="list-disc pl-5 space-y-2">
                  {step.explanations.map((explanation, index) => (
                    <li key={index} className="text-gray-200">
                      {explanation}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-200">{step.explanations}</p>
              )}
            </ContentSection>

            <ContentSection title="Visualization Guide">
              {Array.isArray(step.visualization) ? (
                <ul className="list-disc pl-5 space-y-2">
                  {step.visualization.map((item, index) => (
                    <li key={index} className="text-gray-200">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-200">{step.visualization}</p>
              )}
            </ContentSection>

            <ContentSection title="Activities">
              {Array.isArray(step.activity) ? (
                <ul className="list-disc pl-5 space-y-2">
                  {step.activity.map((item, index) => (
                    <li key={index} className="text-gray-200">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-200">{step.activity}</p>
              )}
            </ContentSection>
          </div>
        </div>
      </div>
    );
  };

  const LearningContent = ({ content }) => (
    <div className="space-y-4 w-full">
      {content.steps.map((step, stepIndex) => (
        <StepSection key={stepIndex} step={step} />
      ))}
    </div>
  );

  const Message = ({ message }) => (
    <div
      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} w-full`}
    >
      <div
        className={`w-full rounded-2xl px-4 py-3 shadow-md ${
          message.type === "user"
            ? "bg-blue-500 text-white rounded-tr-sm max-w-xl ml-auto"
            : "bg-gray-700 text-gray-100 rounded-tl-sm"
        }`}
      >
        {message.type === "user" ? (
          message.content
        ) : (
          <LearningContent content={message.content} />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="flex-none p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Learn with Clara
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </main>

      <footer className="flex-none border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm p-4 md:p-6">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-4 pr-12 bg-gray-900 border border-gray-700 rounded-xl text-gray-300 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            rows="3"
            required
            placeholder="Type your message here..."
          />
          <button
            type="submit"
            className="absolute right-3 bottom-3 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatInterface;
