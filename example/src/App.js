import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactBot from 'react-chat-bot42'
import 'react-chat-bot42/dist/index.css'

const App = () => {
  return <ReactBot  
      userIcon={"user.png"}
      botIcon={"bot.png"}
  />
}

export default App
