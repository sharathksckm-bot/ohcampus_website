(function(){
  var API_URL = "https://campusapi.ohcampus.com/apps/Chatbot";
  var sessionId = localStorage.getItem("ohcampus_chat_session") || null;
  var isOpen = false;
  var isLoading = false;

  function init() {
    var container = document.createElement("div");
    container.id = "ohcampus-chatbot";
    container.innerHTML = `
      <style>
        #ohcampus-chatbot * {
          box-sizing: border-box;
          font-family: "Segoe UI", Arial, sans-serif;
        }
        .ai-assistant-btn {
          position: fixed;
          bottom: 90px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          padding: 12px 20px;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
          z-index: 9999;
          transition: all 0.3s ease;
          border: none;
          font-size: 14px;
          font-weight: 600;
        }
        .ai-assistant-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(99, 102, 241, 0.5);
        }
        .ai-assistant-btn svg {
          width: 24px;
          height: 24px;
          fill: #fff;
        }
        .ai-assistant-btn.hidden {
          display: none;
        }
        .chat-window {
          position: fixed;
          bottom: 160px;
          right: 20px;
          width: 360px;
          height: 500px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
          z-index: 9998;
        }
        .chat-window.open {
          display: flex;
        }
        .chat-header {
          background: linear-gradient(135deg, #1a237e, #3949ab);
          color: #fff;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .chat-header img {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.3);
        }
        .chat-header-info h4 {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
        }
        .chat-header-info p {
          margin: 3px 0 0;
          font-size: 12px;
          opacity: 0.85;
        }
        .chat-close {
          margin-left: auto;
          cursor: pointer;
          font-size: 28px;
          opacity: 0.8;
          line-height: 1;
          padding: 5px;
        }
        .chat-close:hover {
          opacity: 1;
        }
        .chat-messages {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          background: #f5f7fa;
        }
        .chat-message {
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
        }
        .chat-message.user {
          align-items: flex-end;
        }
        .chat-message.bot {
          align-items: flex-start;
        }
        .chat-message .bubble {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.5;
        }
        .chat-message.user .bubble {
          background: linear-gradient(135deg, #1a237e, #3949ab);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .chat-message.bot .bubble {
          background: #fff;
          color: #333;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .chat-input-area {
          padding: 12px;
          background: #fff;
          border-top: 1px solid #eee;
          display: flex;
          gap: 8px;
        }
        .chat-input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 24px;
          padding: 10px 16px;
          font-size: 13px;
          outline: none;
        }
        .chat-input:focus {
          border-color: #3949ab;
        }
        .chat-send {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #1a237e, #3949ab);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chat-send svg {
          width: 18px;
          height: 18px;
          fill: #fff;
        }
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 10px 14px;
          background: #fff;
          border-radius: 16px;
          width: fit-content;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #999;
          border-radius: 50%;
          animation: typing 1s infinite;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @media (max-width: 480px) {
          .chat-window {
            width: calc(100% - 20px);
            right: 10px;
            bottom: 80px;
            height: 70vh;
          }
          .ai-assistant-btn {
            padding: 10px 16px;
            font-size: 13px;
          }
        }
      </style>
      <button class="ai-assistant-btn" id="ai-assistant-btn" onclick="OhCampusChat.toggle()">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L2 22l5.71-.97A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.4 0-2.74-.36-3.9-1l-.28-.17-2.93.5.5-2.93-.17-.28C4.36 14.74 4 13.4 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z"/>
          <circle cx="12" cy="12" r="3" fill="white"/>
          <path d="M9 9.5c0-.83.67-1.5 1.5-1.5h3c.83 0 1.5.67 1.5 1.5v.5c0 .55-.22 1.05-.59 1.41L12 14l-2.41-2.59A1.99 1.99 0 019 10v-.5z" fill="white"/>
        </svg>
        AI Assistant
      </button>
      <div class="chat-window" id="chat-window">
        <div class="chat-header">
          <img src="https://ohcampus.com/assets/images/chatbot-icon.jpg" alt="OhCampus">
          <div class="chat-header-info">
            <h4>OhCampus AI Assistant</h4>
            <p>Online | Typically replies instantly</p>
          </div>
          <span class="chat-close" onclick="OhCampusChat.toggle()">&times;</span>
        </div>
        <div class="chat-messages" id="chat-messages">
          <div class="chat-message bot">
            <div class="bubble">Hi! I am OhCampus AI Assistant. How can I help you with your college admission journey today?</div>
          </div>
        </div>
        <div class="chat-input-area">
          <input type="text" class="chat-input" id="chat-input" placeholder="Type your message..." onkeypress="if(event.key==='Enter')OhCampusChat.send()">
          <button class="chat-send" onclick="OhCampusChat.send()" id="chat-send">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  function toggle() {
    isOpen = !isOpen;
    document.getElementById("chat-window").classList.toggle("open", isOpen);
    document.getElementById("ai-assistant-btn").classList.toggle("hidden", isOpen);var cta=document.querySelector(".ohc-floating-cta");if(cta)cta.style.display=isOpen?"none":"block";
    if (isOpen) {
      document.getElementById("chat-input").focus();
    }
  }

  async function send() {
    var input = document.getElementById("chat-input");
    var message = input.value.trim();
    if (!message || isLoading) return;

    addMessage(message, "user");
    input.value = "";
    isLoading = true;
    document.getElementById("chat-send").disabled = true;
    showTyping();

    try {
      var response = await fetch(API_URL + "/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, session_id: sessionId, source: "website" })
      });
      var data = await response.json();
      hideTyping();
      
      if (data.response_code === "200") {
        sessionId = data.data.session_id;
        localStorage.setItem("ohcampus_chat_session", sessionId);
        addMessage(data.data.response, "bot");
      } else {
        addMessage("Sorry, I encountered an error. Please try again.", "bot");
      }
    } catch (error) {
      hideTyping();
      addMessage("Sorry, I am unable to connect. Please try again later.", "bot");
    }

    isLoading = false;
    document.getElementById("chat-send").disabled = false;
  }

  function addMessage(text, role) {
    var container = document.getElementById("chat-messages");
    var div = document.createElement("div");
    div.className = "chat-message " + role;
    
    var formatted = text
      .replace(/https?:\/\/[^\s]+/g, function(url) {
        return '<a href="' + url + '" target="_blank" style="color:' + (role === "user" ? "#fff" : "#1a237e") + ';text-decoration:underline">' + url + '</a>';
      })
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, "<br>");
    
    div.innerHTML = '<div class="bubble">' + formatted + '</div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    var container = document.getElementById("chat-messages");
    var div = document.createElement("div");
    div.id = "typing-indicator";
    div.className = "chat-message bot";
    div.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById("typing-indicator");
    if (el) el.remove();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.OhCampusChat = { toggle: toggle, send: send };
})();
