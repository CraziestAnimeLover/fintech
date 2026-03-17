// import { Routes, Route } from "react-router-dom";

// // Layout
// import AdminLayout from "../layouts/AdminLayout";

// // Pages
// import AdminDashboard from "../pages/AdminDashboard";
// import UserTable from "../components/UserTable";
// import CreateAdmin from "../pages/CreateAdmin";
// import CreateUser from "../pages/CreateUser";
// import CreateAgent from "../pages/CreateAgent";

// const AdminRoutes = () => {
//   return (
//     <Routes>
//       <Route path="/admin" element={<AdminLayout />}>

//         {/* Dashboard */}
//         <Route index element={<AdminDashboard />} />

//         {/* Users */}
//         <Route
//           path="users"
//           element={<UserTable role="user" title="Users" />}
//         />

//         {/* Agents */}
//         <Route
//           path="agents"
//           element={<UserTable role="agent" title="Agents" />}
//         />

//         {/* Create Pages */}
//         <Route path="create-admin" element={<CreateAdmin />} />
//         <Route path="create-user" element={<CreateUser />} />
//         <Route path="create-agent" element={<CreateAgent />} />

//       </Route>
//     </Routes>
//   );
// };

// export default AdminRoutes;