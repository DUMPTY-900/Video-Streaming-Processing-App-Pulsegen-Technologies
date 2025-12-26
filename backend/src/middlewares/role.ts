import { Request, Response, NextFunction } from 'express';

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Check if user has at least one of the required roles
        // OR if we implement exact match? 
        // Assignment says: Viewer (read-only), Editor (upload), Admin (full).
        // Usually these are hierarchical or explicit. I'll stick to explicit check.

        const hasRole = req.user.roles.some(role => roles.includes(role));

        if (!hasRole) {
            return res.status(403).json({ message: `User role ${req.user.roles} is not authorized` });
        }
        next();
    };
};
