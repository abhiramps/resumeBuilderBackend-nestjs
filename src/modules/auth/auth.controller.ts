import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { SignUpDto, SignInDto, ResetPasswordDto, RefreshTokenDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    @ApiOperation({ summary: 'Sign up a new user' })
    async signUp(@Body() signUpDto: SignUpDto) {
        return this.authService.signUp(signUpDto);
    }

    @Post('signin')
    @ApiOperation({ summary: 'Sign in an existing user' })
    async signIn(@Body() signInDto: SignInDto) {
        return this.authService.signIn(signInDto);
    }

    @Post('signout')
    @ApiOperation({ summary: 'Sign out current user' })
    async signOut(@Req() req: any) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        await this.authService.signOut(token);
        return { message: 'Signed out successfully' };
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Request password reset' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        await this.authService.resetPassword(resetPasswordDto.email);
        return { message: 'Password reset email sent' };
    }

    @Get('oauth/:provider')
    @ApiOperation({ summary: 'Initiate OAuth sign in' })
    async oauthSignIn(@Param('provider') provider: string) {
        return this.authService.signInWithOAuth(provider as 'google' | 'github');
    }

    @Get('oauth/callback')
    @ApiOperation({ summary: 'Handle OAuth callback' })
    async oauthCallback(@Query('code') code: string) {
        return this.authService.handleOAuthCallback(code);
    }

    @Get('session')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current session' })
    async getSession(@Req() req: any) {
        const user = await this.authService.ensureUserExists(req.supabaseUser);
        return { user };
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshSession(refreshTokenDto.refresh_token);
    }

    @Get('sessions')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all user sessions' })
    async getSessions(@Req() req: any) {
        return this.authService.getSessions(req.user.id);
    }

    @Delete('sessions/:id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Revoke a session' })
    async revokeSession(@Param('id') id: string) {
        await this.authService.revokeSession(id);
        return { message: 'Session revoked successfully' };
    }
}
