import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    private supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_KEY!,
    );

    constructor(private prisma: PrismaService) { }

    async signUp(data: SignUpDto) {
        const { email, password, fullName } = data;

        const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');
        const redirectUrl = `${frontendUrl}/auth/confirm`;

        const { data: authData, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: redirectUrl,
            },
        });

        if (error) throw new UnauthorizedException(error.message);

        if (authData.user) {
            await this.prisma.user.create({
                data: {
                    id: authData.user.id,
                    email: authData.user.email!,
                    fullName: fullName,
                },
            });
        }

        const requiresEmailVerification = !authData.session && !!authData.user && !authData.user.email_confirmed_at;

        return {
            user: authData.user,
            session: authData.session,
            requiresEmailVerification,
        };
    }

    async signIn(data: SignInDto) {
        const { email, password } = data;

        const { data: authData, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw new UnauthorizedException(error.message);

        await this.prisma.user.update({
            where: { id: authData.user.id },
            data: { lastLoginAt: new Date() },
        });

        return {
            user: authData.user,
            session: authData.session,
        };
    }

    async signOut(accessToken: string): Promise<void> {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw new UnauthorizedException(error.message);
    }

    async resetPassword(email: string): Promise<void> {
        const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        });

        if (error) throw new UnauthorizedException(error.message);
    }

    async signInWithOAuth(provider: 'google' | 'github') {
        const { data, error } = await this.supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
            },
        });

        if (error) throw new UnauthorizedException(error.message);

        return { url: data.url };
    }

    async handleOAuthCallback(code: string) {
        const { data, error } = await this.supabase.auth.exchangeCodeForSession(code);

        if (error) throw new UnauthorizedException(error.message);

        if (data.user) {
            await this.prisma.user.upsert({
                where: { id: data.user.id },
                update: {
                    lastLoginAt: new Date(),
                    avatarUrl: data.user.user_metadata.avatar_url,
                },
                create: {
                    id: data.user.id,
                    email: data.user.email!,
                    fullName: data.user.user_metadata.full_name || data.user.email!,
                    avatarUrl: data.user.user_metadata.avatar_url,
                    lastLoginAt: new Date(),
                },
            });
        }

        return {
            user: data.user,
            session: data.session,
        };
    }

    async refreshSession(refreshToken: string) {
        const { data, error } = await this.supabase.auth.refreshSession({
            refresh_token: refreshToken,
        });

        if (error) throw new UnauthorizedException(error.message);

        return {
            user: data.user,
            session: data.session,
        };
    }

    async getSessions(userId: string): Promise<any[]> {
        return [];
    }

    async revokeSession(sessionId: string): Promise<void> {
        throw new Error('Session revocation not implemented');
    }

    async ensureUserExists(authUser: any) {
        const user = await this.prisma.user.upsert({
            where: { id: authUser.id },
            update: {
                lastLoginAt: new Date(),
                avatarUrl: authUser.user_metadata?.avatar_url,
            },
            create: {
                id: authUser.id,
                email: authUser.email!,
                fullName: authUser.user_metadata?.full_name || authUser.email!,
                avatarUrl: authUser.user_metadata?.avatar_url,
                lastLoginAt: new Date(),
            },
        });

        return this.serializeBigInt(user);
    }

    private serializeBigInt(obj: any): any {
        return JSON.parse(
            JSON.stringify(obj, (_, value) =>
                typeof value === 'bigint' ? value.toString() : value,
            ),
        );
    }
}
