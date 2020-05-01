import React, {useRef} from 'react';
import Terminal from 'terminal-in-react';
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:3030";

const App = () => {
  const socket = socketIOClient(ENDPOINT);
  const termRef = useRef(null);

  socket.on('response', data => {
    console.log(data)
    termRef.current.printToActive(data);
  });

  const emitCommand = cmd => {socket.emit('command', cmd)};

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}
    >
      <Terminal
        ref={termRef}
        color='green'
        hideTopBar={true}
        allowTabs={false}
        backgroundColor='black'
        barColor='black'
        startState='maximised'
        promptSymbol='$'
        style={{ fontWeight: "bold", fontSize: "1em" }}
        commands={{
          'rcon_address': emitCommand,
          'rcon_password': emitCommand,
        }}
        descriptions={{
          'rcon_address': 'Set the rcon_address',
          'rcon_password': 'Set the rcon_password',
        }}
        commandPassThrough={emitCommand}
        msg='You can write anything here. Example - Hello! My name is Foo and I like Bar.'
      />
    </div>
  );
}

export default App;
