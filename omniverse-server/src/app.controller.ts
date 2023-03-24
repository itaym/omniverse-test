import { Body, Controller, Delete, Get, Post, } from '@nestjs/common'
import { AppService } from './app.service'
import { Todo } from './entities/todo.entity'
import { ApiTags, ApiBody } from '@nestjs/swagger'

const todoSchema = {
  properties: {
    'todo': { properties: {
        'id': { type: 'number' },
        'title': { type: 'string' },
        'order': { type: 'number' },
        'before': { type: 'number'},
        'after': { type: 'number'},
      } },
  }
}

const cloneTodo = (todo:Todo):Todo => {
  const newTodo = new Todo()
  Object.keys(todo).forEach((key) => {
    newTodo[key] = todo[key]
  })
  return newTodo
}
@ApiTags('api/todos')
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
  @ApiBody({
    schema: todoSchema
  })
  async appendTodo(@Body('todo') todo:Todo): Promise<Todo> {
    const todoEntity = cloneTodo(todo)
    return await this.appService.appendTodo(todoEntity)
  }

  @Delete('api/todos')
  @ApiBody({
    schema: todoSchema
  })
  async deleteTodo(@Body('todo') todo:Todo) {
    const todoEntity = cloneTodo(todo)
    return await this.appService.deleteTodo(todoEntity)
  }

  @Post('api/todos/relocate')
  @ApiBody({
    schema: {
      properties: {
        todo: todoSchema.properties.todo,
        placeBefore: { type: 'number' }
      }
    }
  })
  async relocateTodo(
      @Body('todo') todo:Todo,
      @Body('placeBefore') placeBefore:number) {
    const todoEntity = cloneTodo(todo)
    return await this.appService.relocateTodo(todoEntity, placeBefore)
  }
}
