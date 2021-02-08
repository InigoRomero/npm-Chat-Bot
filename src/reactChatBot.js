import React, {Component} from 'react';
import {prompts, Replies, notFound} from './DefaultConstants'
import './src/DefaultStyle.css'

export default class reactChatBot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      output : '',
      input : '',
      compare : '',
      text: '',
      product: '',
      prompts: this.props.Prompts ? this.props.Prompts : prompts,
      Replies: this.props.Replies ? this.props.Replies : Replies,
      notFound: this.props.notFound ? this.props.notFound : notFound
    };
    this.output = this.output.bind(this);
    this.compare = this.compare.bind(this);
    this.addChat = this.addChat.bind(this);
  }
  componentDidMount(){
    const inputField = document.getElementById("input");
    inputField.addEventListener("keydown", (e) => {
      if (e.code === "Enter") {
        console.log(inputField.value);
        this.setState({input : inputField.value})
        inputField.value = "";
        this.output();
      }
    });
  };
    
  output() {
    let product;

    let text = this.state.input.toLowerCase().replace(/[^\w\s]/gi, "").replace(/[\d]/gi, "").trim();
    text = text
      .replace(/ a /g, " ") 
      .replace(/i feel /g, "")
      .replace(/whats/g, "what is")
      .replace(/please /g, "")
      .replace(/ please/g, "")
      .replace(/r u/g, "are you");
    this.setState({text: text});
    if (this.compare()) { 
      product = this.compare();
    } else if (text.match(/thank/gi)) {
      product = "You're welcome!"
    } else {
      product = this.state.notFound[Math.floor(Math.random() * this.state.notFound.length)];
    }
    this.setState({product: product});
    this.addChat();
  }

  compare() {
    let reply;
    let replyFound = false;
    for (let x = 0; x < this.state.prompts.length; x++) {
      for (let y = 0; y < this.state.prompts[x].length; y++) {
        if (this.state.prompts[x][y] === this.state.text) {
          let replies = this.state.Replies[x];
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

  addChat() {
    const messagesContainer = document.getElementById("messages");
    let userDiv = document.createElement("div");
    userDiv.id = "user";
    userDiv.className = "user response";
    userDiv.innerHTML = `<img src="`+ this.props.userIcon +`" class="avatar"><span>${this.state.text}</span>`;
    messagesContainer.appendChild(userDiv);

    let botDiv = document.createElement("div");
    let botImg = document.createElement("img");
    let botText = document.createElement("span");
    botDiv.id = "bot";
    botImg.src = this.props.botIcon;
    botImg.className = "avatar";
    botDiv.className = "bot response";
    botText.innerText = "...";
    botDiv.appendChild(botText);
    botDiv.appendChild(botImg);
    messagesContainer.appendChild(botDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;


    setTimeout(() => {
      botText.innerText = `${this.state.product}`;
    }, 2000
    )

  }
	render() {
		
		return (
      <div id="container" className="container">
        <div id="chat" className="chat">
          <div id="messages" className="messages"></div>
          <input id="input" type="text" placeholder="Say something..." autoComplete="off" autoFocus={true} />
        </div>
      </div>
		)
	}
};