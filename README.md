### NPM Chat Bot 42 ES6 Module
# Still in development
#### React Usage 

```js 
import ReactBot from 'react-chat-bot42'
import {prompts, Replies, notFound} from './BotReplies'

<ReactBot  
		PromptsBot={prompts} 
		RepliesBot={Replies}
		notFoundBot={notFound}
        userIcon={"User Icon SRC"}
        botIcon={"Bot Icon SRC"}
	/>
```

Examples of prompts, Replies, notFound(He have prompts, replies and notFound by default if you dont have anyone):
```js
export const prompts =  [
    ["hi", "hey", "hello", "good morning", "good afternoon"],
    ["how are you", "how is life", "how are things"],
];
 export const Replies =[
    ["Hello!", "Hi!", "Hey!", "Hi there!","Howdy"],
    [
      "Fine... how are you?",
      "Pretty well, how are you?",
      "Fantastic, how are you?"
    ]
];
 export const notFound = [
    "Same",
    "Go on...",
];
```

some css example
```css

  span {
    padding-right: 15px;
    padding-left: 15px;
}

.container {
    display: flex;
  justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.chat {
    height: 300px;
    width: 50vw;
    display: flex;
    flex-direction: column;
  justify-content: center;
    align-items: center;
} 

::-webkit-input-placeholder { 
    color: .711 
}
 
input { 
    border: 0; 
    padding: 15px; 
    margin-left: auto;
    border-radius: 10px; 
}

.messages {
    display: flex;
    flex-direction: column;
    overflow: scroll;
    height: 90%;
    width: 100%;
    background-color: white;
    padding: 15px;
    margin: 15px;
    border-radius: 10px;
}

#bot {
    margin-left: auto;
}

.bot {
    font-family: Consolas, 'Courier New', Menlo, source-code-pro, Monaco,  
    monospace;
}

.avatar {
    height: 25px;
}

.response {
    display: flex;
    align-items: center;
    margin: 1%;
}


/* Mobile */

@media only screen and (max-width: 980px) {
  .container {
        flex-direction: column; 
        justify-content: flex-start;
    }
    .chat {
        width: 75vw;
        margin: 10vw;
    }
}
```




