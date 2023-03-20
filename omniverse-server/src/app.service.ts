import { Injectable } from '@nestjs/common'
import { Todo } from './entities/todo.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull, QueryRunner } from 'typeorm'

// Giving it a high value just to avoid dealing with very small numbers.
// In general it doesn't matter, it can be 1 or 0.01. Large numbers are
// easier to the human eye.
const ORDER_INCREMENT_VALUE = 1_000_000

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

    // noinspection JSUnusedLocalSymbols
    private async _findAllOldVersion(): Promise<Todo[]> {
        // This is an old version of the _findAll before adding
        // the 'order' column to the table
        let todos: Todo[] = []
        let count: number = 0
        let todo: Todo = await this.todoRepository.findOne({
            where: {after: IsNull()},
        })
        while (todo || count < 50) {
            if (!todo) break
            todos.push(todo)
            count++

            todo = await this.todoRepository.findOne({
                where: {after: todo.id},
            })
        }
        return todos
    }

    private async _findAll(): Promise<Todo[]> {

        return await this.todoRepository.find({
            order: {order: 'asc'},
        })
    }

    private async _switch(todoA: Todo, todoB: Todo, queryRunner: QueryRunner): Promise<Todo> {
        const tmpTodo = new Todo()
        tmpTodo.id = todoB.id
        tmpTodo.title = todoA.title
        tmpTodo.order = todoB.order
        tmpTodo.before = todoB.before
        tmpTodo.after = todoB.after

        todoA.title = todoB.title

        // So, let the update begin:
        try {
            await queryRunner.manager.update
            (Todo, {id: tmpTodo.id}, {...tmpTodo})
            await queryRunner.manager.update
            (Todo, {id: todoA.id}, {...todoA})

            await queryRunner.commitTransaction()
            //await queryRunner.rollbackTransaction()
        } catch (e: any) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            throw new Error(e.message)
        }
        await queryRunner.release()

        return todoA
    }

    private async _relocateTodo(todo: Todo, newBeforeId: number | null): Promise<Todo> {
        /* While I was working on this a bit complicated LINKED-LIST solution, just toward the end
           I figured out a much much simple way to do it much more efficient. I GUESSED you want to
           see a LINKED-LIST so I kept it. Maybe we can talk about it (Hopefully soon) :-) */

        if (todo.id === newBeforeId) return todo

        const queryRunner: QueryRunner = this.todoRepository.manager.connection.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        // Now we need to get the items of the new location
        const newBefore: Todo = await this.todoRepository.findOne({
            where: {id: newBeforeId},
        })
        const newAfter: Todo = await this.todoRepository.findOne({
            where: {id: newBefore.before || IsNull()},
        })
        // If one of the newBefore/after are my destination then just switch
        if (newBefore && todo.id === newBefore.before) {
            return await this._switch(todo, newBefore, queryRunner)
        }
        if (newBefore && todo.id === newBefore.after) {
            return await this._switch(todo, newBefore, queryRunner)
        }
        if (newAfter && todo.id === newAfter.before) {
            return await this._switch(todo, newAfter, queryRunner)
        }
        if (newAfter && todo.id === newAfter.after) {
            return await this._switch(todo, newAfter, queryRunner)
        }

        const currentBefore: Todo = await this.todoRepository.findOne({
            where: {id: todo.after || IsNull()},
        })
        const currentAfter: Todo = await this.todoRepository.findOne({
            where: {id: todo.before || IsNull()},
        })
        // By doing this we extract the item form its location
        if (currentBefore)
            currentBefore.before = currentAfter?.id || null
        if (currentAfter)
            currentAfter.after = currentBefore?.id || null

        try {
            if (currentBefore)
                await queryRunner.manager.save(currentBefore)
            if (currentAfter)
                await queryRunner.manager.save(currentAfter)
        } catch (e: any) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            throw new Error(e.message)
        }

        // Again, the order will ONLY help in fetching the list otherwise we need
        // a very complex query with sub queries with bad performance
        let startOrder = 0
        let endOrder = 0

        todo.before = null
        todo.after = null

        // By doing this we insert the item to its new location
        if (newBefore) {
            newBefore.before = todo.id
            todo.after = newBefore.id
            startOrder = newBefore.order
            endOrder = newBefore.order + ORDER_INCREMENT_VALUE * 2 // Maybe we are going to the end of the list
                                                                   // Divide by 2 because when we'll calculate the new
                                                                   // order value it will be divided by 2.

        }
        if (newAfter) {
            newAfter.after = todo.id
            todo.before = newAfter.id
            endOrder = newAfter.order // So sad, we are not going to the end of the list/
        }

        // Calculate the new order value just between.
        todo.order = startOrder + (endOrder - startOrder) / 2

        // In general, for each relocation of an item we need ALWAYS update at most 5 items
        // no matter how large is the list. The current before/after and the new before/after,
        // and the item itself. No need to sort the list etc. very efficient process.

        try {
            if (newBefore)
                await queryRunner.manager.save(newBefore)
            if (newAfter)
                await queryRunner.manager.save(newAfter)

            await queryRunner.manager.save(todo)
            await queryRunner.commitTransaction()
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
            todo.order = ORDER_INCREMENT_VALUE
        } else {
            //There is at least one item
            todo.after = lastTodo.id
            todo.order = lastTodo.order + ORDER_INCREMENT_VALUE
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
