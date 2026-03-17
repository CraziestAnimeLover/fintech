import { Router } from 'express';
const router = Router();
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, getStats ,getAllDeposits, getAllWithdraws, approveWithdraw,approveDeposit,rejectDeposit,verifyDocuments,rejectWithdraw} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';


// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin", "agent"));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put("/documents/:id/verify", verifyDocuments);
router.get("/deposit-requests", getAllDeposits);
router.get("/withdraw-requests", getAllWithdraws);
router.put("/deposits/:id/approve", approveDeposit);
router.put("/deposits/:id/reject", rejectDeposit);

router.put("/withdraws/:id/approve", approveWithdraw);
router.put("/withdraws/:id/reject", rejectWithdraw);

export default router;

