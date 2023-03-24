import { Injectable } from '@nestjs/common'
import { Todo } from './entities/todo.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull, QueryRunner } from 'typeorm'

@Injectable()
export class AppService {
    constructor(
        @InjectRepository(Todo)
        private todoRepository: Repository<Todo>,
    ) {
        this.todoRepository.manager.connection.synchronize(false).then()
    }

    getHello(): string {
        return 'Hello World!'
    }

    private async _findAll(): Promise<Todo[]> {

        return await this.todoRepository.find({
            order: {id: 'asc'},
        })
    }

    private async _relocateTodo(todo: Todo, targetId: number | null): Promise<Todo> {

        if (todo.id === targetId) return todo

        const target: Todo = await this.todoRepository.findOne({
            where: {id: targetId},
        })
        if (!target) {
            throw new Error('Target doesn\'t exists')
        }

        const tmpTitle = todo.title
        todo.title = target.title
        target.title = tmpTitle

        const queryRunner: QueryRunner = this.todoRepository.manager.connection.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            await queryRunner.manager.save(target)
            await queryRunner.manager.save(todo)
        } catch (e: any) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            throw new Error(e.message)
        }

        await queryRunner.release()

        return todo
    }

    public async appendTodo(todo: Todo): Promise<Todo> {

        const queryRunner: QueryRunner = this.todoRepository.manager.connection.createQueryRunner()
        await queryRunner.connect()

        //Get the last item in the list
        const lastTodo: Todo = await this.todoRepository.findOne({
            where: {before: IsNull()},
        })
        // Makes it the last in the list
        todo.before = null

        if (!lastTodo) {
            // The repository is empty
            todo.after = null
        } else {
            //There is at least one item
            todo.after = lastTodo.id
        }
        await queryRunner.startTransaction()
        try {
            todo = await queryRunner.manager.save(todo)

            if (lastTodo) {
                // update the last item 'before' to point to the appended
                // item so it would not be the last one any more
                lastTodo.before = todo.id
                await queryRunner.manager.save(lastTodo)
            }
            await queryRunner.commitTransaction()
        } catch (e: any) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            throw new Error(e.message)
        }
        await queryRunner.release()

        return todo
    }

    public async findAll(): Promise<Todo[]> {
        try {
            return await this._findAll()
        } catch (e: any) {
            throw new Error(e.message)
        }
    }

    public async relocateTodo(todo: Todo, placeBefore: number) {
        if (typeof placeBefore !== 'number') {
            throw Error('placeBefore is missing')
        }
        if (!todo) {
            throw Error('Todo is missing')
        }
        return await this._relocateTodo(todo, placeBefore)
    }

    public async deleteTodo(td: Todo) {
        if (!td) {
            throw Error('Todo is missing')
        }
        const todo = await this.todoRepository.findOne({
            where: {id: td.id},
        })
        if (!todo) {
            throw new Error('Todo doesn\'t exists')
        }
        const after = await this.todoRepository.findOne({
            where: {id: todo.before || IsNull() }
        })
        const before = await this.todoRepository.findOne({
            where: {id: todo.after || IsNull()}
        })

        if (before && after) {
            after.after = before.id
            before.before = after.id
        }
        if (before && !after) {
            before.before = null
        }
        if (!before && after) {
            after.after = null
        }
        const queryRunner: QueryRunner = this.todoRepository.manager.connection.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            if (before)
                await queryRunner.manager.save(before)
            if (after)
                await queryRunner.manager.save(after)
            await queryRunner.manager.delete(Todo, {id: todo.id})
            await queryRunner.commitTransaction()
        } catch (e: any) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            throw new Error(e.message)
        }
        await queryRunner.release()

        return todo
    }
}
