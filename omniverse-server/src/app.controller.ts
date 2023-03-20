import { Body, Controller, Delete, Get, Patch, Post, Req, } from '@nestjs/common'
import { AppService } from './app.service'
import { Todo } from './entities/todo.entity'
import { Request } from 'express'

const cloneTodo = (todo:Todo):Todo => {
  const newTodo = new Todo()
  Object.keys(todo).forEach((key) => {
    newTodo[key] = todo[key]
  })
  return newTodo
}
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('api/todos')
  async getTodos(): Promise<Todo[]> {
    return await this.appService.findAll()
  }
  @Post('api/todos')
  async appendTodo(@Req() req:Request, @Body('todo') todo:Todo): Promise<Todo> {
    const todoEntity = cloneTodo(todo)
    return await this.appService.appendTodo(todoEntity)
  }

  @Delete('api/todos')
  async deleteTodo(@Body('todo') todo:Todo) {
    const todoEntity = cloneTodo(todo)
    return await this.appService.deleteTodo(todoEntity)
  }

  @Post('api/todos/relocate')
  async relocateTodo(
      @Body('todo') todo:Todo,
      @Body('placeBefore') placeBefore:number) {
    const todoEntity = cloneTodo(todo)
    return await this.appService.relocateTodo(todoEntity, placeBefore)
  }
}
