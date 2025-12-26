import { Request, Response, NextFunction } from 'express';

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const hasRole = req.user.roles.some(role => roles.includes(role));

        if (!hasRole) {
            return res.status(403).json({ message: `User role ${req.user.roles} is not authorized` });
        }
        next();
    };
};
