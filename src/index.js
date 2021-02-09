import React, {Component} from 'react';
import {Dprompts, DReplies, DnotFound} from './DefaultConstants'
import './DefaultStyle.css'
const reactChatBot = props => {
  let
    prompts = props.Prompts ? props.Prompts : Dprompts, 
    Replies = props.Replies ? props.Replies : DReplies,
    notFound = props.notFound ? props.notFound : DnotFound,
    botIcon = props.botIcon,
    userIcon = props.userIcon,
    input = '',
    text = '',
    product = '';
  window.onload = function() {
    let inputField = document.getElementById("input");
    inputField.addEventListener("keydown", (e) => {
      if (e.code === "Enter") {
        input = inputField.value;
        inputField.value = "";
        output();
      }
    });
  }
    
  function output() {
    let product2;
    let text2 = input.toLowerCase().replace(/[^\w\s]/gi, "").replace(/[\d]/gi, "").trim();
    text2 = text2
      .replace(/ a /g, " ") 
      .replace(/i feel /g, "")
      .replace(/whats/g, "what is")
      .replace(/please /g, "")
      .replace(/ please/g, "")
      .replace(/r u/g, "are you");
    text = text2;
    if (compare()) { 
      product2 = compare();
    } else if (text2.match(/thank/gi)) {
      product2 = "You're welcome!"
    } else {
      product2 = notFound[Math.floor(Math.random() * notFound.length)];
    }
    product = product2;
    addChat();
  }

  function compare() {
    let reply;
    let replyFound = false;
    for (let x = 0; x < prompts.length; x++) {
      for (let y = 0; y < prompts[x].length; y++) {
        if (prompts[x][y] === text) {
          let replies = Replies[x];
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
    const messagesContainer = document.getElementById("messages");
    let userDiv = document.createElement("div");
    userDiv.id = "user";
    userDiv.className = "user response";
    userDiv.innerHTML = `<img src="`+ userIcon +`" class="avatar"><span>${text}</span>`;
    messagesContainer.appendChild(userDiv);

    let botDiv = document.createElement("div");
    let botImg = document.createElement("img");
    let botText = document.createElement("span");
    botDiv.id = "bot";
    botImg.src = botIcon;
    botImg.className = "avatar";
    botDiv.className = "bot response";
    botText.innerText = "...";
    botDiv.appendChild(botText);
    botDiv.appendChild(botImg);
    messagesContainer.appendChild(botDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;


    setTimeout(() => {
      botText.innerText = `${product}`;
    }, 2000
    )

  }
		
		return (
      <div id="container" className="container">
        <div id="chat" className="chat">
          <div id="messages" className="messages"></div>
          <input id="input" type="text" placeholder="Say something..." autoComplete="off" autoFocus={true} />
        </div>
      </div>
		);
};

export default reactChatBot;