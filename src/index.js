import React from 'react'
import './styles.module.css'
import {Dprompts, DReplies, DnotFound} from './DefaultConstants'

 const ReactChatBot = ({ PromptsBot, RepliesBot, notFoundBot, botIcon, userIcon  }) => {
  let
    prompts = PromptsBot ? props.Prompts : Dprompts, 
    Replies = RepliesBot ? props.Replies : DReplies,
    notFound = notFoundBot ? props.notFound : DnotFound,
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
    const messagesContainer = document.getElementById("chat-content");
    let userDiv = document.createElement("div");
    userDiv.id = "user";
    userDiv.className = "media media-chat";
    userDiv.innerHTML = `<img src="`+ userIcon +`" className="avatar"><div className="media-body"><p>${text}</p></div>`;
    messagesContainer.appendChild(userDiv);

    let botDiv = document.createElement("div");
    let botDiv2 = document.createElement("div");
    let botImg = document.createElement("img");
    let botText = document.createElement("p");
    botDiv.id = "bot";
    botImg.src = botIcon;
    botDiv2.className = "media-body";
    botImg.className = "avatar";
    botDiv.className = "media media-chat media-chat-reverse";
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
      <div className="page-content page-container" id="page-content">
      <div className="padding">
        <div className="row container d-flex justify-content-center">
          <div className="col-md-6">
            <div className="card card-bordered">
              <div className="card-header">
                <h4 className="card-title"><strong>Chat</strong></h4>
              </div>
              <div  className="ps-container ps-theme-default ps-active-y" id="chat-content">

              </div>
              <div className="publisher bt-1 border-light"> <img id="avatarUser" className="avatar avatar-xs" src={userIcon} alt="..."/> <input id="input" className="publisher-input" type="text" placeholder="Write something"/></div>
            </div>
          </div>
        </div>
      </div>
    </div>
		);
}

export default ReactChatBot;
