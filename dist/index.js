function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));

var Dprompts = [["hi", "hey", "hello", "good morning", "good afternoon"], ["how are you", "how is life", "how are things"], ["what are you doing", "what is going on", "what is up"], ["how old are you"], ["who are you", "are you human", "are you bot", "are you human or bot"], ["who created you", "who made you"], ["your name please", "your name", "may i know your name", "what is your name", "what call yourself"], ["i love you"], ["happy", "good", "fun", "wonderful", "fantastic", "cool"], ["bad", "bored", "tired"], ["help me", "tell me story", "tell me joke"], ["ah", "yes", "ok", "okay", "nice"], ["bye", "good bye", "goodbye", "see you later"], ["what should i eat today"], ["bro"], ["what", "why", "how", "where", "when"], ["no", "not sure", "maybe", "no thanks"], [""], ["haha", "ha", "lol", "hehe", "funny", "joke"]];
var DReplies = [["Hello!", "Hi!", "Hey!", "Hi there!", "Howdy"], ["Fine... how are you?", "Pretty well, how are you?", "Fantastic, how are you?"], ["Nothing much", "About to go to sleep", "Can you guess?", "I don't know actually"], ["I am infinite"], ["I am just a bot", "I am a bot. What are you?"], ["The one true God, JavaScript"], ["I am nameless", "I don't have a name"], ["I love you too", "Me too"], ["Have you ever felt bad?", "Glad to hear it"], ["Why?", "Why? You shouldn't!", "Try watching TV"], ["What about?", "Once upon a time..."], ["Tell me a story", "Tell me a joke", "Tell me about yourself"], ["Bye", "Goodbye", "See you later"], ["Sushi", "Pizza"], ["Bro!"], ["Great question"], ["That's ok", "I understand", "What do you want to talk about?"], ["Please say something :("], ["Haha!", "Good one!"]];
var DnotFound = ["Same", "Go on...", "Bro...", "Try again", "I'm listening...", "I don't understand :/"];

var ReactChatBot = function ReactChatBot(_ref) {
  var PromptsBot = _ref.PromptsBot,
      RepliesBot = _ref.RepliesBot,
      notFoundBot = _ref.notFoundBot,
      botIcon = _ref.botIcon,
      userIcon = _ref.userIcon;
  var prompts = PromptsBot ? props.Prompts : Dprompts,
      Replies = RepliesBot ? props.Replies : DReplies,
      notFound = notFoundBot ? props.notFound : DnotFound,
      input = '',
      text = '',
      product = '';

  window.onload = function () {
    var inputField = document.getElementById("input");
    inputField.addEventListener("keydown", function (e) {
      if (e.code === "Enter") {
        input = inputField.value;
        inputField.value = "";
        output();
      }
    });
  };

  function output() {
    var product2;
    var text2 = input.toLowerCase().replace(/[^\w\s]/gi, "").replace(/[\d]/gi, "").trim();
    text2 = text2.replace(/ a /g, " ").replace(/i feel /g, "").replace(/whats/g, "what is").replace(/please /g, "").replace(/ please/g, "").replace(/r u/g, "are you");
    text = text2;

    if (compare()) {
      product2 = compare();
    } else if (text2.match(/thank/gi)) {
      product2 = "You're welcome!";
    } else {
      product2 = notFound[Math.floor(Math.random() * notFound.length)];
    }

    product = product2;
    addChat();
  }

  function compare() {
    var reply;
    var replyFound = false;

    for (var x = 0; x < prompts.length; x++) {
      for (var y = 0; y < prompts[x].length; y++) {
        if (prompts[x][y] === text) {
          var replies = Replies[x];
          reply = replies[Math.floor(Math.random() * replies.length)];
          replyFound = true;
          break;
        }
      }

      if (replyFound) {
        break;
      }
    }

    return reply;
  }

  function addChat() {
    var messagesContainer = document.getElementById("messages");
    var userDiv = document.createElement("div");
    userDiv.id = "user";
    userDiv.className = "user response";
    userDiv.innerHTML = "<img src=\"" + userIcon + ("\" class=\"avatar\"><span>" + text + "</span>");
    messagesContainer.appendChild(userDiv);
    var botDiv = document.createElement("div");
    var botImg = document.createElement("img");
    var botText = document.createElement("span");
    botDiv.id = "bot";
    botImg.src = botIcon;
    botImg.className = "avatar";
    botDiv.className = "bot response";
    botText.innerText = "...";
    botDiv.appendChild(botText);
    botDiv.appendChild(botImg);
    messagesContainer.appendChild(botDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
    setTimeout(function () {
      botText.innerText = "" + product;
    }, 2000);
  }

  return /*#__PURE__*/React.createElement("div", {
    id: "container",
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    id: "chat",
    className: "chat"
  }, /*#__PURE__*/React.createElement("div", {
    id: "messages",
    className: "messages"
  }), /*#__PURE__*/React.createElement("input", {
    id: "input",
    type: "text",
    placeholder: "Say something...",
    autoComplete: "off",
    autoFocus: true
  })));
};

module.exports = ReactChatBot;
//# sourceMappingURL=index.js.map
