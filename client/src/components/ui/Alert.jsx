// src/components/ui/Alert.jsx
export default function Alert({ type, message }) {
    const bgColor = type === 'error' ? 'bg-red-100' : 'bg-green-100';
    const textColor = type === 'error' ? 'text-red-700' : 'text-green-700';
    
    return (
      <div className={`p-4 mb-4 rounded ${bgColor} ${textColor}`}>
        {message}
      </div>
    );
  }