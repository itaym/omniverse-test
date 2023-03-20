import root from './reducers/root'
import todos from './reducers/todos'
import combineReducersWithRoot from './combineReducersWithRoot'
import { configureStore, Reducer, Store } from '@reduxjs/toolkit'
import { ReducersObject } from '../types'

const reducer:Reducer = combineReducersWithRoot(root, { todos })

export const store:Store = configureStore({
    reducer,
    devTools: process.env.NODE_ENV !== 'production',
})
