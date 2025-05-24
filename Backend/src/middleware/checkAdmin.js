

const requireAdmin = async (req, res, next) => {
  const user = req.auth;
  console.log("user", user);
  if (!user || !user.sessionClaims || user.sessionClaims.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  next();
};
