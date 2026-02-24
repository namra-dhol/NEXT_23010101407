export class CreateUserDto {
  
    name : string | undefined ;
    email : string | undefined;
    password : string | undefined;
    role : string = 'MANAGER';

}
