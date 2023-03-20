import React, {
    HTMLAttributes,
    ReactNode, useCallback,
    useEffect,
} from 'react'

import Style from './MainPage.module.scss'
import TodoForm from '../../components/TodoForm'
import TodosList from '../../components/TodosList/TodoList'
import { CombinedState, Todo } from '../../types'
import { connect } from 'react-redux'
import { getTodos, relocateTodo, deleteTodo } from '../../redux/actions/todos'
import { useDispatch, useSelector } from 'react-redux'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import NotificationsManager from '../../components/NotificationsManager'


interface IPageProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
}

const MainPage = (props:IPageProps) => {

    const dispatch = useDispatch()
    const todos = useSelector(({ todos }: CombinedState) => todos.todos)

    const onDelete = useCallback(async (todo:Todo) => {
        await dispatch(await deleteTodo(todo))
        await dispatch(getTodos())
    }, [])

    const onItemMove = useCallback((todo:Todo, placeBefore:Todo) => {
        (async () => {
            await dispatch(await relocateTodo({todo, placeBefore: placeBefore.id}))
            await dispatch(await getTodos())

        })().then()

    }, [])

    useEffect(() => {
        dispatch(getTodos())
    }, [])

    return (
        <div className={Style.MainPage}>
            <NotificationsManager />
            <TodoForm />
            <DndProvider backend={HTML5Backend}>
            <TodosList
                className={Style.listContainer}
                items={todos || []}
                onItemMove={onItemMove}
                onDelete={onDelete}
            />
            </DndProvider>

            {props.children}
        </div>
    )
}

export default connect()(MainPage)