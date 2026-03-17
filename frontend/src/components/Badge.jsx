// src/components/Badge.jsx
const Badge = ({ text, type }) => {
  const styles = {
    admin: 'bg-purple-100 text-purple-800',
    agent: 'bg-pink-100 text-pink-800',
    user: 'bg-blue-100 text-blue-800',
    verified: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };
  return (
    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${styles[type] || styles.user}`}>
      {text}
    </span>
  );
};

export default Badge;