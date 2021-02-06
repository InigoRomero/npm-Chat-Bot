### NPM Chat Bot 42 ES6 Module
# Still in development
####React Usage

```react 
import chatBot from 'react-chat-bot42';
import {prompts, Replies, notFound} from './BotReplies'

<ReactBot  
        Styles={styles} 
		Prompts={prompts} 
		Replies={Replies}
		notFound={notFound}
	/>
```

Examples of prompts, Replies, notFound(He have some styles and replies by default if you dont have anyone):
```react
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



