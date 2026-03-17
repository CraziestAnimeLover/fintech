const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      {children}
      <button onClick={onClose} className="mt-4 w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition">
        Close
      </button>
    </div>
  </div>
);

export default Modal;