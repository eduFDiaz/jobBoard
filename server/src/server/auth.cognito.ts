import { Request, Response } from 'express';
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { environment } from '../environment/environment';

export interface AuthRequest extends Request {
    auth?: any;
}

class AuthMiddleware {
    private poolRegion: string = environment.COGNITO_POOL_REGION || "";
    private poolId: string = environment.COGNITO_POOL_ID || "";
    private clientId: string = environment.COGNITO_CLIENT_ID || "";

    // Verifier that expects valid access tokens:
    private verifier = CognitoJwtVerifier.create({
        userPoolId: this.poolId,
        tokenUse: "access",
        clientId: this.clientId,
    });

    /**
     *
     */
    constructor() {
        this.verifyToken = this.verifyToken.bind(this);
    }

    public async verifyToken(req: AuthRequest, res: Response, next: any) {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).end();
        }
        
        try {
            const payload = await this.verifier.verify(
                token
            );
            console.log("Token is valid. Payload:", payload);
            req.auth = payload;
            next();
        } catch {
            console.log("Token not valid!");
            return res.status(401).end();
        }
    }
}

export const authMiddleware = new AuthMiddleware();