import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthGuard implements CanActivate {
    private supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_KEY!,
    );

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        try {
            const { data: { user }, error } = await this.supabase.auth.getUser(token);

            if (error || !user) {
                throw new UnauthorizedException('Invalid or expired token');
            }

            request.user = user;
            request.supabaseUser = user;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Authentication failed');
        }
    }
}
