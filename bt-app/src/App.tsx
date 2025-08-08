import { useState } from 'react';
import {main} from "./ble";

export default function App() {
  const [message, setMessage] = useState('');

  const onSend = async () => {
    main();
  };

  return (
    <div style={{ padding: 16, maxWidth: 520, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h2>Send text to PiBeacon</h2>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type something…"
        style={{ width: '100%', padding: 10, marginBottom: 12, fontSize: 16 }}
      />
      <button type="button" onClick={onSend} disabled={!message} style={{ padding: '10px 16px', fontSize: 16 }}>
        Connect & Send
      </button>
      <p style={{ opacity: 0.7, marginTop: 12 }}>
        Use Chrome on desktop. Keep the Pi nearby (1–2 meters).
      </p>
    </div>
  );
}
