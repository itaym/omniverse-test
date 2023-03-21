import React, {
    FormEvent,
    FormEventHandler,
    useCallback,
    useState
} from 'react'

import Style from './TodoForm.module.scss'
import { useDispatch } from 'react-redux'
import { getTodos, appendTodo } from '../../redux/actions/todos'
import { connect } from 'react-redux'

const TodoForm = () => {

    const dispatch = useDispatch()
    const [state, setState] = useState({ title: '' })

    const onSubmit: FormEventHandler<HTMLFormElement> = async (event:FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!state.title) return false

        try {
            await dispatch(appendTodo({...state}))
            dispatch(getTodos())
        }
        finally {
            setState({ title: '' })
        }

        return false
    }

    const onTitleInput:FormEventHandler<HTMLInputElement> = useCallback(({ target: { value }}:any) => {
        setState({...state, title: value})
    }, [state])

    return (
        <form className={Style.todoForm} onSubmit={onSubmit}>
            <fieldset>
                <label htmlFor={'title'}>Title</label>
                <input
                    id='title'
                    name='title'
                    onInput={onTitleInput}
                    value={state.title}
                    maxLength={40}
                />
                <br />
                <input type={'submit'} value={'Create New'} />
            </fieldset>
        </form>
    )
}

export default connect()(TodoForm)