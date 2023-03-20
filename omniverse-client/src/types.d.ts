import { Action, PayloadAction, Reducer } from '@reduxjs/toolkit'

export type Todo = {
    id: number,
    title: string,
    before: number,
    after: number,
    order: number,
}
export type RootState = {
    isLoading: boolean
    errors: string[]
}

export type TodoState = {
    todos: Todo[]
    errors: string[]
}

export type CombinedState = RootState & {
    todos: TodoState
}

export type rootAction = Action & PayloadAction & {
    payload: string[] //errors
    isLoading?: boolean

}

export type todoAction = Action & PayloadAction & {
    payload: Todo[]

}

export type todoActionArgs = {
    todo: Todo,
    placeAfter?: Todo | null
    placeBefore?: Todo | null
}

export interface ReducersObject {
    [key: string]: Reducer
}
