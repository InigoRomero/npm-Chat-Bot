
import ReactBot from './reactBot/reactChatBot'
import styles from './app.css'
import {prompts, Replies, notFound} from './BotReplies'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <ReactBot  
        Styles={styles} Prompts={prompts} Replies={Replies} notFound={notFound}></ReactBot>
      </header>
    </div>
  );
}

export default App;
