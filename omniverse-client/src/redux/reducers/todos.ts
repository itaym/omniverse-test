import * as actions from '../actions/todos'
import { ActionReducerMapBuilder, createReducer, Reducer } from '@reduxjs/toolkit'
import { TodoState, todoAction } from '../../types'

const initialState:TodoState = {
    todos: [],
    errors: [],
}

const todos:Reducer = createReducer(initialState, (builder:ActionReducerMapBuilder<TodoState>) => {
    builder
        .addCase(actions.getTodos.fulfilled, (state:TodoState, action:todoAction) => {
            state.todos = action.payload
        })
        .addCase(actions.getTodos.rejected, (state:TodoState, action:todoAction) => {
            state.todos = []
        })
})

export default todos