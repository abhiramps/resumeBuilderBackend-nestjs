import { Controller, Get, Put, Delete, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile(@Req() req: any) {
        const user = await this.usersService.getById(req.user.id);
        return { data: user };
    }

    @Put('me')
    @ApiOperation({ summary: 'Update current user profile' })
    async updateProfile(@Req() req: any, @Body() updates: any) {
        const user = await this.usersService.update(req.user.id, updates);
        return { data: user };
    }

    @Delete('me')
    @ApiOperation({ summary: 'Delete current user account' })
    async deleteAccount(@Req() req: any) {
        await this.usersService.delete(req.user.id);
        return { message: 'Account deleted successfully' };
    }

    @Get('me/stats')
    @ApiOperation({ summary: 'Get user statistics' })
    async getStats(@Req() req: any) {
        const stats = await this.usersService.getStats(req.user.id);
        return { data: stats };
    }
}
