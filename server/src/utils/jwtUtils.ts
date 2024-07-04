import jwt from 'jsonwebtoken';

export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });
};

// Add more JWT-related utilities here