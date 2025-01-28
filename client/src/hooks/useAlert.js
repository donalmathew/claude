// src/hooks/useAlert.js
import { useState } from 'react';

export function useAlert() {
  const [alert, setAlert] = useState(null);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  return { alert, showAlert };
}