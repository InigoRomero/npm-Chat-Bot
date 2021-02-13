import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactBot from 'react-chat-bot42'
import 'react-chat-bot42/dist/index.css'

const App = () => {
  return (
      <center>
        <ReactBot  
          userIcon={"user.png"}
          botIcon={"bot.png"}
        />
        <div>Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
        <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>

      </center>
  )
  
}

export default App
