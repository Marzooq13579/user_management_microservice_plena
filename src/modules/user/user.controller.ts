import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { CustomRequest } from 'src/middlewares/jwt.middleware';
import { ApiTags } from '@nestjs/swagger';
import { SearchUserDto } from './dto/search-user.dto';
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('search')
  search(@Req() req: CustomRequest, @Query() searchUserDto: SearchUserDto) {
    const userId = req.user?.id;
    const { username, minAge, maxAge } = searchUserDto;
    return this.userService.search(userId, username, minAge, maxAge);
  }

  @Get(':id')
  findOneUser(@Param('id') id: string) {
    return this.userService.findOneUser(id);
  }

  @Get()
  findAllUsers() {
    return this.userService.findAllUsers();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.removeUser(id);
  }
}
