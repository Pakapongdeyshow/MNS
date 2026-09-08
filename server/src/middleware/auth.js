import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'mindnote-super-secret-key-2026';

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      student_id: user.student_id || null,
      counselor_id: user.counselor_id || null,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'ไม่พบ Token การยืนยันตัวตน กรุณาเข้าสู่ระบบ' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Token หมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง' });
    }
    req.user = decodedUser;
    next();
  });
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลในส่วนนี้ (Role Unauthorized)' });
    }

    next();
  };
}

export function enforceStudentOwnership(req, res, next) {
  if (req.user && req.user.role === 'student') {
    const requestedStudentId = parseInt(req.params.studentId || req.query.studentId || req.body.studentId || req.params.id);
    if (requestedStudentId && req.user.student_id !== requestedStudentId) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลของนักเรียนท่านอื่น' });
    }
  }
  next();
}

export const requireCounselorOrAdmin = requireRole(['counselor', 'admin']);
export const requireAdmin = requireRole(['admin']);
export const requireCounselor = requireRole(['counselor']);


