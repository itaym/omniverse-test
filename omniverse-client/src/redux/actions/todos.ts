import { createAsyncThunk } from '@reduxjs/toolkit'
import { Todo, todoActionArgs } from '../../types'
import createError from './createError'

const ACTION_APPEND_TODO = 'ACTION_APPEND_TODO'
const ACTION_DELETE_TODO = 'ACTION_DELETE_TODO'
const ACTION_GET_TODOS = 'ACTION_GET_TODOS'
const ACTION_RELOCATE_TODO = 'ACTION_RELOCATE_TODO'

const url = 'http://localhost:8000/api/todos'

export const getTodos = <any>createAsyncThunk(
    ACTION_GET_TODOS,
    async (_:any, { rejectWithValue }) => {
        try {
            const response:Response = await fetch(`${url}`, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            const json = await response.json()
            if (json.statusCode > 400) {
                return  rejectWithValue(createError(json.message))
            }
            return json
        }
        catch ( e:any ) { return rejectWithValue(createError(e.message)) }
    }
)

export const appendTodo = <any>createAsyncThunk(
    ACTION_APPEND_TODO,
    async (todo :Todo, { rejectWithValue }) => {
        try {
            const response:Response = await fetch(`${url}`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    todo
                }),
            })
            const json = await response.json()
            if (json.statusCode > 400) {
                return  rejectWithValue(createError(json.message))
            }
            return json
        }
        catch (e:any) {
            return rejectWithValue(createError(e.message))
        }
    }
)

export const relocateTodo = <any>createAsyncThunk(
    ACTION_RELOCATE_TODO,
    async ({ todo, placeBefore }:todoActionArgs, { rejectWithValue }) => {
        try {
            const response:Response = await fetch(`${url}/relocate`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    todo,
                    placeBefore,
                }),
            })
            const json = await response.json()
            if (json.statusCode > 400) {
                return  rejectWithValue(createError(json.message))
            }
            return json
        }
        catch (e:any) {
            return rejectWithValue(createError(e.message))
        }
    }
)

export const deleteTodo = <any>createAsyncThunk(
    ACTION_DELETE_TODO,
    async (todo:Todo, { rejectWithValue }) => {
        try {
            const response:Response = await fetch(`${url}`, {
                method: 'delete',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    todo,
                }),
            })
            const json = await response.json()
            if (json.statusCode > 400) {
                return  rejectWithValue(createError(json.message))
            }
            return json
        }
        catch (e:any) {
            return rejectWithValue(createError(e.message))
        }
    }
)

