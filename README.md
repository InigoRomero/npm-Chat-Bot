### NPM Chat Bot 42 ES6 Module
# Still in development
#### Welcome
Functional chat bot where you pass the predefined respects to the messages on your website. 
#### Online demo https://inigoromero.github.io/npm-Chat-Bot/
#### Example Code https://github.com/InigoRomero/npm-Chat-Bot/tree/main/example

### Still working on:
- mobile devices
- Default Welcome Message
- reading voice

![alt text](https://github.com/InigoRomero/npm-Chat-Bot/blob/main/src/screen.PNG)

# React Usage
```js 
import ReactBot from 'react-chat-bot42'
import {prompts, Replies, notFound} from './BotReplies'
GitHub: [<img alt="GitHub" width="26px" src="https://simpleicons.org/icons/github.svg" />]
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
CSS of the example
```css

 .card-bordered {
  border: 1px solid #ebebeb
}

.card {
  border: 0;
  border-radius: 0px;
  margin-bottom: 30px;
  -webkit-box-shadow: 0 2px 3px rgba(0, 0, 0, 0.03);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.03);
  -webkit-transition: .5s;
  transition: .5s
}

.padding {
  padding: 3rem !important
}

body {
  background-color: #f9f9fa
}

.card-header:first-child {
  border-radius: calc(.25rem - 1px) calc(.25rem - 1px) 0 0
}

.card-header {
  display: -webkit-box;
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  padding: 15px 20px;
  background-color: transparent;
  border-bottom: 1px solid rgba(77, 82, 89, 0.07)
}

.card-header .card-title {
  padding: 0;
  border: none
}

h4.card-title {
  font-size: 17px
}

.card-header>*:last-child {
  margin-right: 0
}

.card-header>* {
  margin-left: 8px;
  margin-right: 8px
}

.btn-xs {
  font-size: 11px;
  padding: 2px 8px;
  line-height: 18px
}

.btn-xs:hover {
  color: #fff !important
}

.card-title {
  font-family: Roboto, sans-serif;
  font-weight: 300;
  line-height: 1.5;
  margin-bottom: 0;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(77, 82, 89, 0.07)
}

.ps-container {
  position: relative
}

.ps-container {
  -ms-touch-action: auto;
  touch-action: auto;
  overflow: hidden !important;
  -ms-overflow-style: none
}

.media-chat {
  padding-right: 64px;
  margin-bottom: 0;
  padding: 16px 12px;
  -webkit-transition: background-color .2s linear;
  transition: background-color .2s linear
  
}


.media .avatar {
  flex-shrink: 0
}

.avatar {
  position: relative;
  display: inline-block;
  width: 36px  !important;
  height: 36px !important;
  line-height: 36px;
  text-align: center;
  border-radius: 100%;
  background-color: #f5f6f7;
  color: #8b95a5;
  text-transform: uppercase
}

.media-chat .media-body {
  -webkit-box-flex: initial;
  flex: initial;
  display: table
}

.media-chat .media-body p {
  position: relative;
  padding: 6px 8px;
  margin: 4px 0;
  background-color: #f5f6f7;
  border-radius: 3px;
  font-weight: 100;
  color: #9b9b9b
}

.media>* {
  margin: 0 8px
}

.media-chat .media-body p.meta {
  background-color: transparent !important;
  padding: 0;
  opacity: .8
}

.media-meta-day {
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  margin-bottom: 0;
  color: #8b95a5;
  opacity: .8;
  font-weight: 400
}

.media {
  padding: 16px 12px;
  -webkit-transition: background-color .2s linear;
  transition: background-color .2s linear
}

.media-meta-day::before {
  margin-right: 16px
}

.media-meta-day::before,
.media-meta-day::after {
  content: '';
  -webkit-box-flex: 1;
  flex: 1 1;
  border-top: 1px solid #ebebeb
}

.media-meta-day::after {
  content: '';
  -webkit-box-flex: 1;
  flex: 1 1;
  border-top: 1px solid #ebebeb
}

.media-meta-day::after {
  margin-left: 16px
}

.media-chat.media-chat-reverse {
  padding-right: 12px;
  padding-left: 64px;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: reverse;
  flex-direction: row-reverse
}

.media-chat {
  padding-right: 64px;
  margin-bottom: 0
}

.media {
  padding: 16px 12px;
  -webkit-transition: background-color .2s linear;
  transition: background-color .2s linear
}

.media-chat.media-chat-reverse  .media-body p {
  float: right;
  clear: right;
  background-color: #48b0f7;
  color: #fff
}

.media-chat .media-body p {
  position: relative;
  padding: 6px 8px;
  margin: 4px 0;
  background-color: #f5f6f7;
  border-radius: 3px
}

.border-light {
  border-color: #f1f2f3 !important
}

.bt-1 {
  border-top: 1px solid #ebebeb !important
}

.publisher {
  position: relative;
  display: -webkit-box;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  padding: 12px 20px;
  background-color: #f9fafb
}

.publisher>*:first-child {
  margin-left: 0
}

.publisher>* {
  margin: 0 8px
}

.publisher-input {
  -webkit-box-flex: 1;
  flex-grow: 1;
  border: none;
  outline: none !important;
  background-color: transparent
}

button,
input,
optgroup,
select,
textarea {
  font-family: Roboto, sans-serif;
  font-weight: 300
}

.publisher-btn {
  background-color: transparent;
  border: none;
  color: #8b95a5;
  font-size: 16px;
  cursor: pointer;
  overflow: -moz-hidden-unscrollable;
  -webkit-transition: .2s linear;
  transition: .2s linear
}

.file-group {
  position: relative;
  overflow: hidden
}

.publisher-btn {
  background-color: transparent;
  border: none;
  color: #cac7c7;
  font-size: 16px;
  cursor: pointer;
  overflow: -moz-hidden-unscrollable;
  -webkit-transition: .2s linear;
  transition: .2s linear
}

.file-group input[type="file"] {
  position: absolute;
  opacity: 0;
  z-index: -1;
  width: 20px
}

.text-info {
  color: #48b0f7 !important
}

.bot {
  font-family: Consolas, 'Courier New', Menlo, source-code-pro, Monaco,  
  monospace;
}

img{
  height: 36px;
}

#chat-content{
  overflow-y: scroll !important; 
  height:400px !important;
}

.userMessage{
  float: left;
width: 300px;
height: auto;
border: 1px solid #CCC;
background-color: #ffffff;
border: 1px solid #000000;
padding: 6px 8px;
-webkit-border-radius: 5px;
-moz-border-radius: 5px;
-o-border-radius: 5px;
border-radius: 5px;
}
```

Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>

Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>



